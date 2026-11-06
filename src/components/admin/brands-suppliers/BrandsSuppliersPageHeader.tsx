import React from 'react';
import { Download, Play, Plus, MoreHorizontal, RotateCw, Lock } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
  breadcrumbs: { label: string; href?: string }[];
  primaryAction?: { label: string; onClick: () => void; icon?: React.ElementType };
  secondaryActions?: { label: string; onClick: () => void; icon?: React.ElementType }[];
  context?: {
    tenant?: string;
    ecosystem?: string;
    businessUnit?: string;
    salesChannels?: string;
    region?: string;
    currency?: string;
    lastSynced?: string;
  };
}

export function BrandsSuppliersPageHeader({
  title,
  description,
  breadcrumbs,
  primaryAction,
  secondaryActions,
  context = {
    tenant: 'SL Beauty',
    ecosystem: 'Beauty Marketplace',
    businessUnit: 'All Business Units',
    salesChannels: 'All Channels',
    region: 'Sri Lanka',
    currency: 'LKR',
    lastSynced: '04 Aug 2026, 12:57 AM'
  }
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex items-center text-sm text-gray-500 gap-2">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span>/</span>}
            {crumb.href ? (
              <a href={crumb.href} className="hover:text-gray-900 transition-colors">
                {crumb.label}
              </a>
            ) : (
              <span className="text-gray-900 font-medium">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {secondaryActions?.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={action.onClick}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                {Icon && <Icon size={16} />}
                {action.label}
              </button>
            );
          })}

          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-[#7a122e] hover:bg-[#5a0d22] rounded-md transition-colors shadow-sm"
            >
              {primaryAction.icon && <primaryAction.icon size={16} />}
              {primaryAction.label}
            </button>
          )}

          <button className="flex items-center justify-center p-1.5 text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      <div className="mt-4 p-3 bg-white border border-gray-200 rounded-md shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col">
            <span className="text-gray-500 mb-0.5">Tenant</span>
            <span className="font-medium text-gray-900">{context.tenant}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 mb-0.5">Ecosystem</span>
            <span className="font-medium text-gray-900">{context.ecosystem}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 mb-0.5">Business Unit</span>
            <span className="font-medium text-gray-900">{context.businessUnit}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 mb-0.5">Sales Channel</span>
            <span className="font-medium text-gray-900">{context.salesChannels}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 mb-0.5">Region</span>
            <span className="font-medium text-gray-900">{context.region}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 mb-0.5">Currency</span>
            <span className="font-medium text-gray-900">{context.currency}</span>
          </div>
        </div>

        <div className="flex flex-col items-end text-right">
          <div className="flex items-center gap-1.5 mb-0.5 text-green-600">
            <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
            <span className="font-medium text-xs">Live Data</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <span>Last synced: {context.lastSynced}</span>
            <RotateCw size={12} className="cursor-pointer hover:text-gray-800" />
          </div>
          <div className="flex items-center gap-1 text-gray-400 mt-1">
            <Lock size={10} />
            <span className="text-[10px]">Access limited to assigned business context</span>
          </div>
        </div>
      </div>
    </div>
  );
}
