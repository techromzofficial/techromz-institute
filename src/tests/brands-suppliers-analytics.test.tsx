import { cleanup, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DonutChartCard } from '@/components/admin/brands-suppliers/charts/DonutChartCard';
import { SupplierHealthGauge } from '@/components/admin/brands-suppliers/charts/SupplierHealthGauge';
import { TrendChartCard } from '@/components/admin/brands-suppliers/charts/TrendChartCard';

const calls = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('@/lib/api', () => ({
  api: calls,
  withQuery: (path: string, values: Record<string, unknown>) => {
    const query = new URLSearchParams();

    Object.entries(values).forEach(([key, value]) => {
      if (value != null && value !== '') {
        query.set(key, String(value));
      }
    });

    return `${path}?${query}`;
  },
}));

import { brandsSuppliersApi } from '@/lib/api/brandsSuppliers';

describe('Brands & Suppliers analytics', () => {
  beforeEach(() => {
    cleanup();
    calls.get.mockReset();
  });

  it('preserves server analytics independently of paginated table rows and sends filters', async () => {
    const analytics = {
      composition: [{ name: 'Manufacturer', value: 24 }],
      onboarding_trend: [],
    };

    calls.get.mockResolvedValue({
      data: [],
      analytics,
      summary: { total: 24 },
    });

    const result = await brandsSuppliersApi.getSuppliersDashboard({
      days: 7,
      status: 'active',
      search: 'Acme',
      per_page: 1,
    });

    expect(result.analytics).toEqual(analytics);
    expect(calls.get.mock.calls[0][0]).toContain('days=7');
    expect(calls.get.mock.calls[0][0]).toContain('status=active');
    expect(calls.get.mock.calls[0][0]).toContain('search=Acme');
  });

  it('preserves real contract analytics without client-side reconstruction', async () => {
    const analytics = {
      distribution: [{ name: 'pending_approval', value: 3 }],
      trend: [],
    };

    calls.get.mockResolvedValue({
      data: [],
      summary: { pending_approval: 3 },
      analytics,
    });

    const result = await brandsSuppliersApi.getContractsDashboard({
      days: 90,
    });

    expect(result.analytics).toEqual(analytics);
    expect(calls.get.mock.calls[0][0]).toContain('days=90');
  });

  it('preserves authorization audit trends without client-side reconstruction', async () => {
    const analytics = {
      distribution: [{ name: 'approved', value: 1 }],
      trend: [{ name: '2026-09-11', approved: 1 }],
      days: 7,
    };

    calls.get.mockResolvedValue({ data: [], summary: { approved: 1 }, analytics });

    const result = await brandsSuppliersApi.getBrandAuthorizations({ days: 7 });

    expect(result.analytics).toEqual(analytics);
    expect(calls.get.mock.calls[0][0]).toContain('days=7');
  });

  it('shows honest empty, loading, error, and unavailable measurement states', () => {
    const props = {
      title: 'Supplier Composition',
      data: [],
      totalLabel: 'Total',
      totalValue: 0,
    };
    const { rerender } = render(<DonutChartCard {...props} />);

    expect(
      screen.getByText('No distribution data available.'),
    ).toBeInTheDocument();

    rerender(<DonutChartCard {...props} loading />);
    expect(screen.getByText('Loading chart analytics...')).toBeInTheDocument();

    rerender(<DonutChartCard {...props} error="Request failed" />);
    expect(screen.getByText('Unable to load chart data')).toBeInTheDocument();

    cleanup();
    render(
      <>
        <TrendChartCard title="Onboarding" data={[]} series={[]} />
        <SupplierHealthGauge
          score={null}
          label="Health"
          statusText="Not assessed"
          metrics={[]}
        />
      </>,
    );

    expect(
      screen.getByText('No recorded activity for this period.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Health assessment unavailable/),
    ).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Health: 0' })).toBeNull();
  });

  it('renders a real numeric health score and only provided metrics', () => {
    render(
      <SupplierHealthGauge
        score={72}
        label="Health"
        statusText="Measured"
        metrics={[{ label: 'Quality', value: '72', progress: 72 }]}
      />,
    );

    expect(screen.getByRole('img', { name: 'Health: 72' })).toBeInTheDocument();
    expect(screen.getByText('Quality')).toBeInTheDocument();
    expect(screen.queryByText('Compliance')).toBeNull();
  });
});
