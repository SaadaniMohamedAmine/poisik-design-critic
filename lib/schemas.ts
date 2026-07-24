import { z } from 'zod';

export const SeverityEnum = z.enum(['critical', 'warning', 'suggestion']);

export const CategoryEnum = z.enum([
  'visual_hierarchy',
  'contrast',
  'spacing',
  'typography',
  'accessibility',
  'consistency',
]);

export const CodeFixSchema = z.object({
  language: z.enum(['css', 'tailwind', 'hex']),
  snippet: z.string(),
  before: z.string().optional(),
  after: z.string().optional(),
});

export const IssueSchema = z.object({
  id: z.string(),
  category: CategoryEnum,
  severity: SeverityEnum,
  title: z.string(),
  description: z.string(),
  recommendation: z.string(),
  code_fix: CodeFixSchema,
  location: z.object({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
  }),
});

export const AnalysisResultSchema = z.object({
  overall_score: z.number().min(0).max(100),
  category_scores: z.record(CategoryEnum, z.number().min(0).max(100)),
  issues: z.array(IssueSchema),
  palette: z.array(z.string()).optional(),
});

export type Severity = z.infer<typeof SeverityEnum>;
export type Category = z.infer<typeof CategoryEnum>;
export type CodeFix = z.infer<typeof CodeFixSchema>;
export type Issue = z.infer<typeof IssueSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
