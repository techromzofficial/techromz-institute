'use client';

import React, { useState } from 'react';
import { Lock, Plus, Pin, User, ShieldCheck } from 'lucide-react';
import type { InternalNoteItem } from '@/types/customerSupportDetail';
import styles from '@/app/admin/customer-support/cases/[caseId]/page.module.css';

interface InternalNotesTabProps {
  notes: InternalNoteItem[];
  onAddNote: (content: string, visibility: 'Internal Only' | 'Team Leads Only') => void;
}

export function InternalNotesTab({ notes, onAddNote }: InternalNotesTabProps) {
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'Internal Only' | 'Team Leads Only'>('Internal Only');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAddNote(content, visibility);
    setContent('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-[#722140]" />
          <h3 className="font-bold text-slate-800 text-sm">Internal Team Notes</h3>
        </div>
        <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-900 rounded">
          CONFIDENTIAL • Internal Team Only (Never Visible to Customer)
        </span>
      </div>

      {/* Add Note Form */}
      <form onSubmit={handleSubmit} className="p-4 bg-amber-50/40 border border-amber-200 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">Add New Internal Note</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-semibold">Visibility:</span>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as 'Internal Only' | 'Team Leads Only')}
              className="text-xs p-1 border border-slate-300 rounded bg-white font-semibold"
            >
              <option value="Internal Only">Internal Only (All Agents)</option>
              <option value="Team Leads Only">Team Leads Only</option>
            </select>
          </div>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write internal observations, supplier discussions, or investigation findings..."
          className={styles.formTextarea}
          style={{ height: '80px' }}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!content.trim()}
            className={styles.btnPrimary}
          >
            <Plus size={14} />
            <span>Save Internal Note</span>
          </button>
        </div>
      </form>

      {/* Notes List */}
      <div className="space-y-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className={`p-4 rounded-lg border ${
              note.isPinned ? 'bg-amber-50/60 border-amber-300' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {note.isPinned && <Pin size={14} className="text-amber-600 fill-amber-600" />}
                <span className="font-bold text-slate-900 text-xs">{note.authorName}</span>
                <span className="text-[11px] text-slate-500 font-medium">({note.authorRole})</span>
                <span className="px-2 py-0.2 text-[10px] font-bold bg-white border border-slate-200 rounded text-amber-800">
                  {note.visibility}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">{note.createdAt}</span>
            </div>

            <p className="text-xs text-slate-800 leading-relaxed font-normal">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

