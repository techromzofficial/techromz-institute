export function firstFieldError(errors, field) {
  const messages = errors?.[field];

  if (Array.isArray(messages)) {
    return messages[0] || '';
  }

  return typeof messages === 'string' ? messages : '';
}

export function withoutFieldError(errors, field) {
  if (!errors?.[field]) return errors;

  const next = { ...errors };
  delete next[field];
  return next;
}
