'use client';

import React from 'react';
import { ArrowUpRight, Clock } from 'lucide-react';
import Link from 'next/link';
import type {
  BrandsSuppliersBottomPanelProps,
  BottomPanelSection,
  BottomPanelColumn,
} from '@/features/brands-suppliers/types/brandsSuppliers.types';

// ---------------------------------------------------------------------------
// Utility renderers for known cell-type patterns
// ---------------------------------------------------------------------------

/**
 * Renders a table cell value. Recognises "cell objects" that carry
 * css / href / label / progress / onClick metadata. Plain scalars
 * (string, number) are rendered directly.
 */
function renderCellValue(value: unknown, colAccessor: string): React.ReactNode {
  if (value === null || value === undefined) return null;

  // Named cell objects ---------------------------------------------------
  if (typeof value === 'object' && !Array.isArray(value)) {
    const cell = value as Record<string, unknown>;

    // Badge cell: { label, css }
    if ('css' in cell && 'label' in cell) {
      return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${cell.css as string}`}>
          {cell.label as string}
        </span>
      );
    }

    // Name + ID cell: { name, id }
    if ('name' in cell && 'id' in cell) {
      return (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{cell.name as string}</span>
          <span className="text-[10px] text-gray-400">{cell.id as string}</span>
        </div>
      );
    }

    // Progress cell: { progress }
    if ('progress' in cell) {
      const pct = cell.progress as number;
      return (
        <div className="flex items-center justify-center gap-2">
          <span className="font-semibold text-gray-700">{pct}%</span>
          <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden inline-block">
            <div className="h-full bg-green-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      );
    }

    // Action link cell: { href, label }
    if ('href' in cell && 'label' in cell && cell.onClick !== 'configure') {
      return (
        <Link
          href={cell.href as string}
          className="text-[#7a122e] hover:underline font-medium"
        >
          {cell.label as string}
        </Link>
      );
    }

    // Configure action cell (no href, uses button)
    if ('onClick' in cell && cell.onClick === 'configure') {
      return (
        <button
          onClick={() => alert('Rule configuration modal')}
          className="text-[#7a122e] hover:underline font-medium"
        >
          {cell.label as string}
        </button>
      );
    }

    return null;
  }

  return String(value);
}

// ---------------------------------------------------------------------------
// Table section
// ---------------------------------------------------------------------------

function TableSection({ section }: { section: BottomPanelSection }) {
  const columns = section.columns ?? [];
  const rows = section.rows ?? [];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">{section.title}</h3>
        {section.badgeLabel ? (
          <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium border border-blue-100">
            {section.badgeLabel}
          </span>
        ) : section.footerAction?.href ? (
          <Link
            href={section.footerAction.href}
            className="text-xs font-medium text-[#7a122e] hover:underline flex items-center gap-1"
          >
            {section.footerAction.label}
          </Link>
        ) : null}
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-xs text-left">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 uppercase font-medium">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.header}
                  className={`px-5 py-3 ${
                    col.align === 'center' ? 'text-center' :
                    col.align === 'right' ? 'text-right' : ''
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.id as string} className="hover:bg-gray-50 transition-colors">
                {columns.map((col) => {
                  const val = row[col.accessor];
                  const align =
                    col.align === 'center' ? 'text-center' :
                    col.align === 'right' ? 'text-right' : '';
                  return (
                    <td key={col.header} className={`px-5 py-3 text-gray-700 ${align}`}>
                      {renderCellValue(val, col.accessor)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cards-grid section (Supplier Master Overview style)
// ---------------------------------------------------------------------------

function CardsGridSection({ section }: { section: BottomPanelSection }) {
  const items = section.items ?? [];
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 flex flex-col justify-between">
      <div>
        <h3 className="font-semibold text-gray-900 text-sm mb-4">{section.title}</h3>
        <div className="grid grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex flex-col justify-center">
              <span className="text-[10px] text-gray-400 font-medium uppercase truncate" title={item.label}>
                {item.label}
              </span>
              <span className="text-xl font-bold text-gray-900 mt-1">{item.value}</span>
              {item.href && (
                <span className="text-[10px] text-[#7a122e] font-medium mt-0.5 truncate">{item.href}</span>
              )}
            </div>
          ))}
        </div>
      </div>
      {section.footerAction && (
        <button className="mt-5 w-full flex items-center justify-center gap-1.5 py-1.5 border border-[#7a122e] text-[#7a122e] text-xs font-medium rounded hover:bg-red-50 transition-colors">
          {section.footerAction.label} <ArrowUpRight size={14} />
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SLA tracker section (full-width)
// ---------------------------------------------------------------------------

function SlaTrackerSection({ section }: { section: BottomPanelSection }) {
  const rows = section.rows ?? [];
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 flex flex-col w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 text-sm">{section.title}</h3>
        <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
          <Clock size={13} /> Active Trackers: {rows.length}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {rows.map((sla) => (
          <div key={sla.id as string} className="bg-gray-50 border border-gray-100 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 text-xs">{sla.caseId as string}</span>
                <span className={`text-[10px] font-semibold ${sla.stateClass as string}`}>
                  {sla.state as string}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium uppercase mt-2">{sla.type as string}</p>
            </div>
            <div className="flex items-end justify-between mt-3 pt-2 border-t border-gray-100">
              <span className="text-[10px] text-gray-500">Target: {sla.targetHours as string}</span>
              <span className="text-sm font-bold text-gray-800">Elapsed: {sla.elapsedHours as string}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section dispatcher
// ---------------------------------------------------------------------------

function renderSection(section: BottomPanelSection) {
  switch (section.type) {
    case 'table':
      return <TableSection key={section.id} section={section} />;
    case 'cards-grid':
      return <CardsGridSection key={section.id} section={section} />;
    case 'sla-tracker':
      return <SlaTrackerSection key={section.id} section={section} />;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Grid layout helpers
// ---------------------------------------------------------------------------

/**
 * Returns a Tailwind col-span class appropriate for the number of sections
 * in this row. A single section spans full width; two sections split equally.
 */
function getGridClass(sectionCount: number, sectionIndex: number): string {
  if (sectionCount === 1) return 'xl:col-span-2';
  // Two sections — first one gets 1/3 if it's cards-grid, else 1/2
  return 'xl:col-span-1';
}

// ---------------------------------------------------------------------------
// Main component — zero hardcoded data
// ---------------------------------------------------------------------------

export function BrandsSuppliersBottomPanels({ rows, loading }: BrandsSuppliersBottomPanelProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="h-48 bg-gray-100 rounded-lg" />
            <div className="h-48 bg-gray-100 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {rows.map((rowSections, rowIdx) => {
        // SLA tracker spans full width
        if (rowSections.length === 1 && rowSections[0].type === 'sla-tracker') {
          return (
            <div key={`row-${rowIdx}`}>
              {renderSection(rowSections[0])}
            </div>
          );
        }

        // Two-column row
        if (rowSections.length === 2) {
          const [left, right] = rowSections;
          const leftIsCards = left.type === 'cards-grid';
          return (
            <div
              key={`row-${rowIdx}`}
              className={`grid grid-cols-1 ${leftIsCards ? 'xl:grid-cols-3' : 'xl:grid-cols-2'} gap-6`}
            >
              <div className={leftIsCards ? 'xl:col-span-1' : ''}>
                {renderSection(left)}
              </div>
              <div className={leftIsCards ? 'xl:col-span-2' : ''}>
                {renderSection(right)}
              </div>
            </div>
          );
        }

        // Single section (not SLA tracker)
        return (
          <div key={`row-${rowIdx}`}>
            {rowSections.map((sec) => renderSection(sec))}
          </div>
        );
      })}
    </div>
  );
}
