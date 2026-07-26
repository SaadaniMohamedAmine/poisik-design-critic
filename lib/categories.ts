// Shared with ReportView.tsx (category chips/filters) and the Project
// Detail page (priority-category callout) so the label set can't drift
// between the two places that render a Category key as text.
export const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  visual_hierarchy: 'Visual Hierarchy',
  contrast: 'Contrast',
  spacing: 'Spacing',
  typography: 'Typography',
  accessibility: 'Accessibility',
  consistency: 'Consistency',
};
