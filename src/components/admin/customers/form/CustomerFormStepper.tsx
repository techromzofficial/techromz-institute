"use client";

import React from "react";
import { Check, AlertTriangle, ShieldAlert, Heart, Lock } from "lucide-react";
import { CustomerWorkflowStep } from "@/types/customer-form";

interface CustomerFormStepperProps {
  steps: CustomerWorkflowStep[];
  currentStepNumber: number;
  onSelectStep: (stepNumber: number) => void;
}

export function CustomerFormStepper({
  steps,
  currentStepNumber,
  onSelectStep,
}: CustomerFormStepperProps) {
  return (
    <div className="bg-white border border-line rounded-lg p-3 sm:p-4 shadow-2xs w-full overflow-hidden">
      <div className="w-full overflow-x-auto pb-1 scrollbar-thin">
        <div className="min-w-[1050px] flex items-start justify-between relative px-4 py-1">
          {/* Centered Horizontal Connector Line */}
          <div className="absolute top-[20px] left-8 right-8 h-0.5 bg-slate-200 z-0" />

          {steps.map((step) => {
            const isCurrent = step.stepNumber === currentStepNumber;
            const isCompleted = step.status === "Completed" && !isCurrent;
            const isWarning = step.status === "Warning" && !isCurrent;
            const isBlocked = step.status === "Blocked" && !isCurrent;

            let circleClass = "bg-white border-2 border-slate-300 text-slate-500 hover:border-slate-400";

            if (isCurrent) {
              circleClass = "bg-[#671021] border-2 border-[#671021] text-white ring-4 ring-[#671021]/15 shadow-sm scale-110";
            } else if (isCompleted) {
              circleClass = "bg-emerald-500 border-2 border-emerald-500 text-white shadow-2xs";
            } else if (isWarning) {
              circleClass = "bg-amber-500 border-2 border-amber-500 text-white shadow-2xs";
            } else if (isBlocked) {
              circleClass = "bg-rose-50 border-2 border-rose-500 text-rose-600";
            }

            return (
              <div
                key={step.id}
                onClick={() => onSelectStep(step.stepNumber)}
                className="flex-1 flex flex-col items-center text-center relative z-10 min-w-[65px] max-w-[80px] group cursor-pointer"
              >
                {/* Step Circle */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10.5px] font-black transition-all ${circleClass}`}
                >
                  {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  {isCurrent && <span className="font-mono">{step.stepNumber}</span>}
                  {isWarning && <AlertTriangle className="w-3.5 h-3.5" />}
                  {isBlocked && <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />}
                  {!isCompleted && !isCurrent && !isWarning && !isBlocked && (
                    <span className="font-mono text-[10px]">{step.stepNumber}</span>
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`text-[9.5px] font-bold mt-2 leading-tight block text-center max-w-[75px] break-words transition-colors ${
                    isCurrent
                      ? "text-[#671021] font-black"
                      : "text-slate-700 group-hover:text-[#671021]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
