import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { checkAndIncrementUsage, decrementUsage } from '@/lib/usage';
import { runAnalysisPipeline } from '@/lib/ai/run-analysis';
import { toFriendlyAiErrorMessage } from '@/lib/ai/client';
import { createNotification } from '@/lib/notifications';

// Keep in sync with the `AiProvider` union in lib/ai/client.ts. Validated here
// because this route is a call site of runAnalysisPipeline, whose `model`
// param is passed through to analyzeImage without validation — anything other
// than 'gemini' silently falls back to groq-first behavior there.
const AiProviderSchema = z.enum(['groq', 'gemini']);

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  const userId = (session.user as { id: string }).id;

  const project = await prisma.project.findFirst({ where: { id, userId } });
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Validate the request BEFORE spending a usage credit — once Phase C makes
  // checkAndIncrementUsage a real increment, a malformed request must never
  // consume a monthly credit for work that was never going to happen.
  const { imageUrl, model } = await req.json();
  if (!imageUrl || typeof imageUrl !== 'string') {
    return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 });
  }

  if (model !== undefined) {
    const parsedModel = AiProviderSchema.safeParse(model);
    if (!parsedModel.success) {
      return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
    }
  }

  const plan = (session.user as { plan?: string }).plan ?? 'FREE';
  const usage = await checkAndIncrementUsage(userId, plan);
  if (!usage.allowed) {
    await createNotification(
      userId,
      'USAGE_LIMIT_REACHED',
      'Monthly limit reached',
      `You've used all your analyses for this month on the ${plan} plan.`,
      '/pricing'
    );
    return NextResponse.json({ error: 'MONTHLY_LIMIT_REACHED' }, { status: 402 });
  }

  try {
    const result = await runAnalysisPipeline({ imageUrl, model });

    const analysis = await prisma.analysis.create({
      data: { projectId: project.id, imageUrl, result: result as object },
    });

    await prisma.project.update({ where: { id: project.id }, data: { updatedAt: new Date() } });

    const score = (result as { overall_score?: number } | null)?.overall_score;
    await createNotification(
      userId,
      'ANALYSIS_COMPLETED',
      'Analysis complete',
      score !== undefined ? `Your audit of "${project.name}" scored ${score}/100.` : `Your audit of "${project.name}" is ready to view.`,
      `/report/${analysis.id}`
    );

    return NextResponse.json(analysis, { status: 201 });
  } catch (error) {
    // The real error (e.g. a Groq/Gemini provider error body — quota
    // metrics, internal rate-limit URLs, RetryInfo blobs) is logged here
    // for debugging, but never sent to the client: it's raw provider JSON,
    // not something a user should ever see on screen.
    console.error(`Analysis failed for project ${project.id}:`, error);
    const message = toFriendlyAiErrorMessage(error);

    // checkAndIncrementUsage above already spent the monthly credit before
    // the AI call ran — give it back since this attempt produced nothing.
    await decrementUsage(userId);

    await createNotification(
      userId,
      'ANALYSIS_FAILED',
      'Analysis failed',
      `Your audit of "${project.name}" couldn't be completed. ${message}`,
      `/projects/${project.id}/analyze`
    );

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
