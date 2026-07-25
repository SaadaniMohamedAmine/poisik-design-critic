export async function checkAndIncrementUsage(
  _userId: string,
  _plan: string
): Promise<{ allowed: boolean; remaining: number | null }> {
  // Phase C (features/10-pricing-stripe.md) replaces this with real per-plan
  // monthly limits backed by the UsageRecord model. Until then, every signed-in
  // user is treated as unlimited so the analysis-creation flow isn't blocked
  // on a feature that doesn't exist yet.
  return { allowed: true, remaining: null };
}
