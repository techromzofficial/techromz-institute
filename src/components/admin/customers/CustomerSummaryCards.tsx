"use client";

import React from "react";
import { CustomerOperationCard } from "@/types/customer";
import { CUSTOMER_SUMMARY_CARDS_CONFIG } from "@/features/customers/customerSummaryConfig";

interface CustomerSummaryCardsProps {
  cards?: CustomerOperationCard[];
  showToast?: (msg: string) => void;
}

export function CustomerSummaryCards({ cards, showToast = (msg) => console.log(msg) }: CustomerSummaryCardsProps) {
  // If custom cards array is provided (for CU06-CU14 screens)
      const hasAuthoritativeCards = Boolean(
        cards && cards.length > 0,
      );

      const displayCards: CustomerOperationCard[] =
        hasAuthoritativeCards
          ? cards!
          : CUSTOMER_SUMMARY_CARDS_CONFIG.map((cfg) => ({
              id: cfg.id,
              title: cfg.title,
              viewLinkText: cfg.footerText,
            }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5 mb-4 items-stretch">
      {displayCards.map((card) => (
        <div
          key={card.id}
          className="bg-white border border-line rounded-lg p-3 shadow-2xs flex flex-col justify-between h-full min-w-0 text-[10.5px]"
        >
          <div>
            {/* Card Title */}
            <h4
              className="font-sans font-bold text-slate-800 text-[10.5px] leading-tight mb-2 line-clamp-2 min-h-[26px] flex items-center"
              title={card.title}
            >
              {card.title}
            </h4>

            {!hasAuthoritativeCards && (
              <div className="min-h-[58px] flex items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 px-2 text-center">
                <span className="text-[9.5px] font-medium text-slate-400">
                  Data not available from authoritative source
                </span>
              </div>
            )}

            {/* Card List Items */}
            {card.listItems && card.listItems.length > 0 && (
              <div className="space-y-1 font-mono text-[10px]">
                {card.listItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-sans truncate pr-1" title={item.label}>
                      {item.label}
                    </span>
                    <div className="flex items-center gap-1 font-bold flex-shrink-0">
                      <span className={item.color || "text-slate-800"}>{item.val}</span>
                      {item.pct && <span className="text-[9px] text-slate-400 font-normal">({item.pct})</span>}
                      {item.badge && (
                        <span className="text-[8.5px] px-1 py-0.2 rounded bg-slate-100 font-sans font-semibold text-slate-600">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Donut Chart Data */}
            {card.donutData && (
              <div className="flex items-center gap-2 my-1">
                <div className="w-10 h-10 rounded-full border-3 border-emerald-500 border-t-[#8F002B] flex items-center justify-center font-mono font-bold text-[8.5px] flex-shrink-0 text-slate-800">
                  {card.donutTotal || "0%"}
                </div>
                <div className="text-[9px] space-y-0.5 font-mono min-w-0 flex-1">
                  {card.donutData.map((d, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex items-center gap-1 truncate">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-slate-500 font-sans truncate">{d.name}</span>
                      </div>
                      <span className="font-bold text-slate-800 flex-shrink-0 ml-1">{d.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Bars */}
            {card.progressBars && (
              <div className="space-y-1.5 text-[10px] mt-1">
                {card.progressBars.map((pb, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[9px] mb-0.5 font-mono">
                      <span className="text-slate-600 font-sans truncate">{pb.label}</span>
                      <span className="font-bold text-slate-800">{pb.val}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${pb.color || "bg-emerald-500"} rounded-full`}
                        style={{ width: `${pb.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Action Link */}
          <button
            onClick={() =>
              hasAuthoritativeCards
                ? showToast(`Viewing details for ${card.title}...`)
                : showToast(
                    `${card.title} data is not available yet.`,
                  )
            }
            className="mt-3 pt-2 border-t border-line text-[9.5px] font-bold text-[#8F002B] hover:underline text-left block w-full"
          >
            {hasAuthoritativeCards
              ? card.viewLinkText || "View details →"
              : "Unavailable"}
          </button>
        </div>
      ))}
    </div>
  );
}
