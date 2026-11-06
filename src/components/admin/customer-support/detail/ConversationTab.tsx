'use client';

import React, { useState } from 'react';
import { Send, Paperclip, MessageSquare, ShieldCheck, User } from 'lucide-react';
import type { ConversationMessage } from '@/types/customerSupportDetail';
import styles from '@/app/admin/customer-support/cases/[caseId]/page.module.css';

interface ConversationTabProps {
  messages: ConversationMessage[];
  onSendMessage: (text: string) => void;
}

export function ConversationTab({ messages, onSendMessage }: ConversationTabProps) {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <MessageSquare size={16} className="text-[#722140]" />
          <span>Customer Conversation Record</span>
        </h3>
        <span className="text-xs text-slate-500 font-medium">
          Showing {messages.length} messages • All messages visible to customer
        </span>
      </div>

      {/* Message List */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
        {messages.map((msg) => {
          const isCustomer = msg.senderRole === 'Customer';
          const isSystem = msg.senderRole === 'System';

          return (
            <div
              key={msg.id}
              className={`p-4 rounded-lg border ${
                isCustomer
                  ? 'bg-slate-50 border-slate-200'
                  : isSystem
                  ? 'bg-amber-50/50 border-amber-200'
                  : 'bg-rose-50/30 border-[#722140]/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCustomer
                        ? 'bg-emerald-100 text-emerald-800'
                        : isSystem
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-[#722140] text-white'
                    }`}
                  >
                    {isCustomer ? <User size={12} /> : isSystem ? 'S' : <ShieldCheck size={12} />}
                  </div>
                  <span className="font-bold text-slate-900 text-xs">{msg.senderName}</span>
                  <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-white border border-slate-200 rounded text-slate-600">
                    {msg.senderRole}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">({msg.channel})</span>
                </div>
                <span className="text-[11px] text-slate-400">{msg.timestamp}</span>
              </div>

              <p className="text-xs text-slate-800 leading-relaxed font-normal">{msg.messageBody}</p>

              {msg.deliveryStatus && (
                <div className="mt-2 text-[10px] text-slate-400 font-semibold text-right">
                  Status: {msg.deliveryStatus}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reply Composer */}
      <form onSubmit={handleSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">Reply to Customer</span>
          <span className="text-[11px] text-slate-500">Channel: In-App Chat</span>
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message to the customer..."
          className={styles.formTextarea}
          style={{ height: '90px' }}
        />

        <div className="flex items-center justify-between">
          <button
            type="button"
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded hover:bg-slate-50 text-slate-700 flex items-center gap-1"
          >
            <Paperclip size={14} />
            <span>Attach Evidence / Image</span>
          </button>

          <button
            type="submit"
            disabled={!inputText.trim()}
            className={styles.btnPrimary}
          >
            <Send size={14} />
            <span>Send Message</span>
          </button>
        </div>
      </form>
    </div>
  );
}

