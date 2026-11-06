"use client";

import React, { useState } from "react";
import { Lock, MoreVertical, Edit2 } from "lucide-react";
import styles from "./return-detail.module.css";
import type { InternalCaseNoteItem } from "@/types/admin";

interface InternalCaseNoteProps {
  note: InternalCaseNoteItem;
  onEditNote?: () => void;
}

export function InternalCaseNote({ note, onEditNote }: InternalCaseNoteProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={styles.internalNoteCard}>
      <div className={styles.noteHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Lock size={14} />
          <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {note.type}
          </span>
          <span style={{ background: "#fef3c7", color: "#92400e", padding: "2px 6px", borderRadius: 4, fontSize: "0.6875rem", fontWeight: 700 }}>
            {note.visibility}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
          <span>
            {note.author} ({note.role}) · Created {note.createdAt}
          </span>
          <button
            type="button"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#92400e" }}
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "100%",
                marginTop: 4,
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                width: 150,
                zIndex: 50,
                padding: "4px 0",
              }}
            >
              <button
                style={{ width: "100%", textAlign: "left", padding: "8px 12px", border: "none", background: "none", cursor: "pointer", fontSize: "0.8125rem", color: "#374151", display: "flex", alignItems: "center", gap: 6 }}
                onClick={() => { setShowMenu(false); if (onEditNote) onEditNote(); }}
              >
                <Edit2 size={12} />
                <span>Edit Note</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.noteContent}>&ldquo;{note.content}&rdquo;</div>

      <div style={{ fontSize: "0.75rem", color: "#b45309", alignSelf: "flex-end" }}>
        Last Updated: {note.lastUpdated}
      </div>
    </div>
  );
}
