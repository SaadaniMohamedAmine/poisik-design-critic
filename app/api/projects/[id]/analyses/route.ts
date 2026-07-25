import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { checkAndIncrementUsage } from '@/lib/usage';
import { runAnalysisPipeline } from '@/lib/ai/run-analysis';

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
    return NextResponse.json({ error: 'MONTHLY_LIMIT_REACHED' }, { status: 402 });
  }

  try {
    const result = await runAnalysisPipeline({ imageUrl, model });

    const analysis = await prisma.analysis.create({
      data: { projectId: project.id, imageUrl, result: result as object },
    });

    await prisma.project.update({ where: { id: project.id }, data: { updatedAt: new Date() } });

    return NextResponse.json(analysis, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The analysis didn't come back as expected — try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
