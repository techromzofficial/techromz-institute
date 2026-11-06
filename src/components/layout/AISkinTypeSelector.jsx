'use client';

import React from 'react';
import { Droplet, Layers, HelpCircle, ShieldAlert, Smile, Droplets } from 'lucide-react';

const SKIN_TYPES = [
  { id: 'dry', label: 'DRY', icon: Droplet, desc: 'Needs deep moisture' },
  { id: 'combination', label: 'COMBINATION', icon: Layers, desc: 'Oily T-zone, dry cheeks' },
  { id: 'oily', label: 'OILY', icon: Droplets, desc: 'Excess shine or sebum' },
  { id: 'sensitive', label: 'SENSITIVE', icon: ShieldAlert, desc: 'Prone to redness or irritation' },
  { id: 'normal', label: 'NORMAL', icon: Smile, desc: 'Balanced, comfortable' },
  { id: 'not_sure', label: 'NOT SURE', icon: HelpCircle, desc: 'Let the advisor help' },
];

export default function AISkinTypeSelector({ selectedType, onSelect }) {
  return (
    <div className="my-4">
      <p className="text-xs font-bold tracking-wider text-[#736361] mb-2 uppercase">
        Select Your Skin Type
      </p>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {SKIN_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;

          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onSelect(type.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 min-h-[84px] cursor-pointer ${
                isSelected
                  ? 'border-primary-600 bg-primary-50 text-primary-800 shadow-sm ring-1 ring-primary-600'
                  : 'border-[#e6e3e3] bg-white text-[#4a3e3c] hover:border-primary-300 hover:bg-[#fff9f8]'
              }`}
              aria-pressed={isSelected}
            >
              <Icon
                size={22}
                className={`mb-1.5 transition-transform duration-200 ${
                  isSelected ? 'text-primary-700 scale-110' : 'text-[#8c7e7b]'
                }`}
                aria-hidden="true"
              />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider block">
                {type.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
