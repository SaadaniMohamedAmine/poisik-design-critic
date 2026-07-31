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

// Maps a category (or 'all') to its key in the `Report` next-intl namespace,
// which already carries these same six labels + 'all' — callers translate
// via `t(CATEGORY_LABEL_KEYS[key])` instead of reading the English map above.
export const CATEGORY_LABEL_KEYS: Record<string, string> = {
  all: 'all',
  visual_hierarchy: 'visualHierarchy',
  contrast: 'contrast',
  spacing: 'spacing',
  typography: 'typography',
  accessibility: 'accessibility',
  consistency: 'consistency',
};
