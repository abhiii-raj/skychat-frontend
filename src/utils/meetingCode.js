export const normalizeMeetingCode = (input) => {
  const trimmed = String(input || '').trim();
  if (!trimmed) return '';

  const withoutQuery = trimmed.split('?')[0].split('#')[0];
  const segments = withoutQuery.split('/').filter(Boolean);
  return segments.length ? segments[segments.length - 1] : '';
};

export const generateMeetingCode = (prefix = 'meet') => {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
};
