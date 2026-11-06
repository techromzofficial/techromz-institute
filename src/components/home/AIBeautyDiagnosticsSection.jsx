'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import { homepageConfig } from '@/data/homepageConfig';

function AIBeautyPromptPreview({ children, onSelect }) {
  return (
    <button type="button" onClick={onSelect} className="group flex min-h-14 w-full items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/[0.09] px-4 py-3 text-left text-sm font-medium leading-6 text-white transition duration-200 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.13] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd0d9] sm:px-5 sm:text-base motion-reduce:transform-none motion-reduce:transition-none">
      <span>{children}</span>
      <ArrowRight className="shrink-0 opacity-70 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none" size={19} aria-hidden="true" />
    </button>
  );
}

function AIBeautyComingSoonDialog({ content, onClose, origin }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCloseRef.current();
      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll('button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      origin?.focus();
    };
  }, [origin]);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="ai-diagnostics-dialog-title" aria-describedby="ai-diagnostics-dialog-description" className="relative w-full max-w-lg rounded-[24px] bg-white p-6 shadow-2xl sm:p-8">
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close dialog" className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full text-[#4a001c] transition hover:bg-[#fff0f4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a001c]"><X size={21} aria-hidden="true" /></button>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0f4] text-[#4a001c]"><Sparkles size={23} aria-hidden="true" /></span>
        <h2 id="ai-diagnostics-dialog-title" className="mt-5 pr-10 text-2xl font-bold tracking-[-0.03em] text-[#2a0715]">{content.title}</h2>
        <p id="ai-diagnostics-dialog-description" className="mt-3 text-sm leading-6 text-[#64565c] sm:text-base">{content.message}</p>
        <p className="mt-3 text-sm leading-6 text-[#7a6870]">{content.supportingText}</p>
        <button type="button" onClick={onClose} className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#2a0715] px-6 text-sm font-semibold text-white transition hover:bg-[#4a001c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a001c] focus-visible:ring-offset-2 sm:w-auto">{content.closeLabel}</button>
      </div>
    </div>
  );
}

export default function AIBeautyDiagnosticsSection() {
  const section = homepageConfig.aiDiagnostics;
  const [isOpen, setIsOpen] = useState(false);
  const originRef = useRef(null);
  const openDialog = (event) => { originRef.current = event.currentTarget; setIsOpen(true); };
  const closeDialog = useCallback(() => setIsOpen(false), []);

  if (!section?.enabled) return null;

  return (
    <section aria-labelledby="ai-diagnostics-title" className="mt-10 sm:mt-14">
      <div className="group grid min-h-[560px] min-w-0 overflow-hidden rounded-[24px] bg-[#4a001c] shadow-[0_24px_60px_rgba(36,0,14,0.18)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col justify-center p-6 text-white sm:p-9 lg:p-12">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#ffd0d9]"><Sparkles size={17} aria-hidden="true" />{section.eyebrow}</p>
          <h2 id="ai-diagnostics-title" className="mt-5 max-w-xl text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl lg:text-[42px]">{section.title}</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/75 sm:text-base">{section.description}</p>
          <div className="mt-7 space-y-3">{section.prompts.map((prompt) => <AIBeautyPromptPreview key={prompt} onSelect={openDialog}>{prompt}</AIBeautyPromptPreview>)}</div>
          <button type="button" onClick={openDialog} className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-2 self-start rounded-xl bg-[#ffd0d9] px-6 text-sm font-bold text-[#2a0715] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#ffdae1] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#4a001c] sm:w-auto motion-reduce:transform-none motion-reduce:transition-none">{section.buttonLabel}<ArrowRight size={18} aria-hidden="true" /></button>
        </div>
        <div className="relative flex min-w-0 items-center justify-center overflow-hidden bg-[#f4ecee] aspect-[1312/813] lg:aspect-auto lg:min-h-full">
          <Image src={section.imageUrl} alt={section.imageAlt} fill loading="lazy" sizes="(max-width: 1023px) 100vw, 50vw" className="object-contain object-center" />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#4a001c]/35 via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#4a001c]/25 lg:to-transparent" aria-hidden="true" />
        </div>
      </div>
      {isOpen && <AIBeautyComingSoonDialog content={section.dialog} onClose={closeDialog} origin={originRef.current} />}
    </section>
  );
}
