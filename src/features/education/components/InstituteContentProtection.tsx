'use client';

import type { ClipboardEvent, DragEvent, KeyboardEvent, MouseEvent, ReactNode } from 'react';

const EXEMPT_SELECTOR = [
  'input',
  'textarea',
  'select',
  'option',
  'button',
  'a',
  '[contenteditable="true"]',
  '[role="button"]',
  '[role="textbox"]',
  '[data-copyable]',
  '.select-text',
].join(',');

function isExempt(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(EXEMPT_SELECTOR));
}

type InstituteContentProtectionProps = {
  children: ReactNode;
};

export default function InstituteContentProtection({ children }: InstituteContentProtectionProps) {
  const preventProtectedContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    if (!isExempt(event.target)) event.preventDefault();
  };

  const preventProtectedCopy = (event: ClipboardEvent<HTMLDivElement>) => {
    if (!isExempt(event.target)) event.preventDefault();
  };

  const preventProtectedShortcut = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isExempt(event.target) && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'c') {
      event.preventDefault();
    }
  };

  const preventImageDrag = (event: DragEvent<HTMLDivElement>) => {
    if (event.target instanceof HTMLImageElement) event.preventDefault();
  };

  return (
    <div
      data-institute-content-protection=""
      onContextMenu={preventProtectedContextMenu}
      onCopy={preventProtectedCopy}
      onKeyDown={preventProtectedShortcut}
      onDragStart={preventImageDrag}
    >
      {children}
    </div>
  );
}
