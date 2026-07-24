import { prisma } from "@/lib/db";
import DashboardTabs from "./DashboardTabs";
import DateRangeControls from "./DateRangeControls";
import { StatCard, MiniStat } from "./Stat";
import { CashChart, ShowRateChart, CloseRateChart } from "./Charts";
import {
  computeCloserMetrics,
  computeSetterMetrics,
  sumCloserTotals,
  sumSetterTotals,
  formatPct,
  formatUsd,
} from "@/lib/metrics";

export const dynamic = "force-dynamic";

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const from = sp.from ?? isoDaysAgo(6);
  const to = sp.to ?? isoToday();

  const fromDate = new Date(`${from}T00:00:00.000Z`);
  const toDate = new Date(`${to}T23:59:59.999Z`);

  const [closerReports, setterReports, allCloserReports] = await Promise.all([
    prisma.closingReport.findMany({
      where: { date: { gte: fromDate, lte: toDate } },
      include: { rep: true },
      orderBy: { date: "asc" },
    }),
    prisma.settingReport.findMany({
      where: { date: { gte: fromDate, lte: toDate } },
      include: { rep: true },
      orderBy: { date: "asc" },
    }),
    prisma.closingReport.findMany({
      include: { rep: true },
      orderBy: { date: "asc" },
    }),
  ]);

  const closerMetrics = computeCloserMetrics(sumCloserTotals(closerReports));
  const setterMetrics = computeSetterMetrics(sumSetterTotals(setterReports));

  const closerByRep = new Map<string, { name: string; rows: typeof closerReports }>();
  for (const r of closerReports) {
    const entry = closerByRep.get(r.repId) ?? { name: r.rep.name, rows: [] };
    entry.rows.push(r);
    closerByRep.set(r.repId, entry);
  }

  const setterByRep = new Map<string, { name: string; rows: typeof setterReports }>();
  for (const r of setterReports) {
    const entry = setterByRep.get(r.repId) ?? { name: r.rep.name, rows: [] };
    entry.rows.push(r);
    setterByRep.set(r.repId, entry);
  }

  // Build chart data (monthly breakdown - all year, independent of date filter)
  const chartData: {
    date: string;
    revenue: number;
    cashCollected: number;
    showRate: number;
    closeRate: number;
  }[] = [];

  // Group data by month
  const monthlyData: { [key: string]: { scheduled: number; taken: number; closes: number; revenue: number; cash: number } } = {};

  for (const report of allCloserReports) {
    const monthStr = report.date.toISOString().slice(0, 7); // YYYY-MM format
    if (!monthlyData[monthStr]) {
      monthlyData[monthStr] = { scheduled: 0, taken: 0, closes: 0, revenue: 0, cash: 0 };
    }
    monthlyData[monthStr].scheduled += report.callsScheduled;
    monthlyData[monthStr].taken += report.callsTaken;
    monthlyData[monthStr].closes += report.closes;
    monthlyData[monthStr].revenue += report.revenue;
    monthlyData[monthStr].cash += report.cashCollected;
  }

  // Convert to chart data with calculated rates
  for (const [monthStr, data] of Object.entries(monthlyData).sort()) {
    const showRate = data.scheduled > 0 ? (data.taken / data.scheduled) * 100 : 0;
    const closeRate = data.taken > 0 ? (data.closes / data.taken) * 100 : 0;
    chartData.push({
      date: monthStr,
      revenue: data.revenue,
      cashCollected: data.cash,
      showRate,
      closeRate,
    });
  }

  const mainContent = (
    <div className="space-y-8">
      {/* Date Range Controls */}
      <div key="date-controls">
        <DateRangeControls from={from} to={to} />
      </div>

      {/* Hero Metrics - Large Cards */}
      <section key="hero-metrics" className="grid gap-6 md:grid-cols-2">
        <div className="bg-gradient-to-br from-stone-800 to-stone-700 rounded-xl p-8 border border-stone-600 shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-widest text-stone-200">Total Revenue</p>
          <p className="mt-4 text-5xl font-bold text-stone-50">{formatUsd(closerMetrics.revenue)}</p>
          <p className="mt-2 text-sm text-stone-300">{closerMetrics.closes} closes</p>
        </div>
        <div className="bg-gradient-to-br from-stone-800 to-stone-700 rounded-xl p-8 border border-stone-600 shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-widest text-stone-200">Cash Collected</p>
          <p className="mt-4 text-5xl font-bold text-stone-50">{formatUsd(closerMetrics.cashCollected)}</p>
          <p className="mt-2 text-sm text-stone-300">From {closerMetrics.callsTaken} calls taken</p>
        </div>
      </section>

      {/* Key Performance Metrics */}
      <section key="key-metrics">
        <h2 className="mb-4 text-lg font-semibold text-neutral-50">Key Metrics</h2>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
          {[
            { key: "callsBooked", label: "Calls Booked", value: closerMetrics.callsScheduled },
            { key: "callsTaken", label: "Calls Taken", value: closerMetrics.callsTaken },
            { key: "showRate", label: "Show Rate", value: formatPct(closerMetrics.showUpRate) },
            { key: "offerRate", label: "Offer Rate", value: formatPct(closerMetrics.offerRate) },
            { key: "closeRate", label: "Close Rate", value: formatPct(closerMetrics.closeRate) },
            { key: "offerToCloseRate", label: "Offer to Close Rate", value: formatPct(closerMetrics.offerToCloseRate) },
            { key: "cashPerCall", label: "Cash per Call Taken", value: formatUsd(closerMetrics.cashPerBookedCall) },
            { key: "aov", label: "AOV", value: formatUsd(closerMetrics.aov) },
            { key: "upfront", label: "Upfront Cash %", value: formatPct(closerMetrics.upfrontCashPercent) },
          ].map(({ key, label, value }) => (
            <div key={key} className="rounded-lg bg-neutral-800 p-4 border border-neutral-700 hover:border-neutral-600 transition">
              <p className="text-xs uppercase tracking-wide text-neutral-400 font-semibold">{label}</p>
              <p className="mt-2 text-2xl font-bold text-neutral-50">{typeof value === "number" ? value : value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Charts */}
      {chartData.length > 0 && (
        <section key="charts" className="space-y-6">
          <h2 className="text-lg font-semibold text-neutral-50">Monthly Trends</h2>
          <CashChart data={chartData} />
          <div className="grid gap-6 md:grid-cols-2">
            <ShowRateChart data={chartData} />
            <CloseRateChart data={chartData} />
          </div>
        </section>
      )}
    </div>
  );

  const closersContent = (
    <div className="space-y-8">
      <div key="date-controls-closers">
        <DateRangeControls from={from} to={to} />
      </div>

      <div key="overview-closers" className="grid grid-cols-2 gap-8">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-50">Total Numbers</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "callsScheduled", label: "Calls on calendar", value: closerMetrics.callsScheduled },
              { key: "callsTaken", label: "Calls taken", value: closerMetrics.callsTaken },
              { key: "offers", label: "Offers", value: closerMetrics.offers },
              { key: "closes", label: "Closes", value: closerMetrics.closes },
              { key: "revenue", label: "Revenue", value: formatUsd(closerMetrics.revenue) },
              { key: "cashCollected", label: "Cash collected", value: formatUsd(closerMetrics.cashCollected) },
              { key: "aov", label: "AOV", value: formatUsd(closerMetrics.aov) },
              { key: "cashPerBookedCall", label: "Cash per booked call", value: formatUsd(closerMetrics.cashPerBookedCall) },
              { key: "cashPerCallTaken", label: "Cash per call taken", value: formatUsd(closerMetrics.cashPerCallTaken) },
            ].map(({ key, label, value }) => (
              <StatCard key={key} label={label} value={String(value)} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-50">Rates %</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "showUpRate", label: "Show up rate", value: formatPct(closerMetrics.showUpRate) },
              { key: "offerRate", label: "Offer rate", value: formatPct(closerMetrics.offerRate) },
              { key: "closeRate", label: "Close rate", value: formatPct(closerMetrics.closeRate) },
              { key: "upfrontCashPct", label: "Upfront cash %", value: formatPct(closerMetrics.upfrontCashPercent) },
            ].map(({ key, label, value }) => (
              <StatCard key={key} label={label} value={String(value)} />
            ))}
          </div>
        </section>
      </div>

      <section key="per-closer">
        <h2 className="mb-4 text-lg font-semibold text-neutral-50">Per Closer</h2>
        <div className="overflow-x-auto rounded-md border border-neutral-700">
          <table className="w-full whitespace-nowrap text-sm">
            <thead className="bg-neutral-800 text-left text-xs uppercase text-neutral-50 border-b border-neutral-700 font-semibold">
              <tr>
                <th className="px-3 py-2">Closer</th>
                <th className="px-3 py-2">Scheduled</th>
                <th className="px-3 py-2">Taken</th>
                <th className="px-3 py-2">Show rate</th>
                <th className="px-3 py-2">Offer rate</th>
                <th className="px-3 py-2">Close rate</th>
                <th className="px-3 py-2">Cash collected</th>
                <th className="px-3 py-2">Revenue</th>
                <th className="px-3 py-2">AOV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700">
              {Array.from(closerByRep.entries()).map(([repId, { name, rows }]) => {
                const m = computeCloserMetrics(sumCloserTotals(rows));
                return (
                  <tr key={repId} className="hover:bg-neutral-800/50">
                    <td className="px-3 py-2 font-medium text-neutral-50">{name}</td>
                    <td className="px-3 py-2 text-neutral-50">{m.callsScheduled}</td>
                    <td className="px-3 py-2 text-neutral-50">{m.callsTaken}</td>
                    <td className="px-3 py-2 text-neutral-50">{formatPct(m.showUpRate)}</td>
                    <td className="px-3 py-2 text-neutral-50">{formatPct(m.offerRate)}</td>
                    <td className="px-3 py-2 text-neutral-50">{formatPct(m.closeRate)}</td>
                    <td className="px-3 py-2 text-neutral-50">{formatUsd(m.cashCollected)}</td>
                    <td className="px-3 py-2 text-neutral-50">{formatUsd(m.revenue)}</td>
                    <td className="px-3 py-2 text-neutral-50">{formatUsd(m.aov)}</td>
                  </tr>
                );
              })}
              {closerByRep.size === 0 && (
                <tr key="empty">
                  <td colSpan={9} className="px-3 py-4 text-center text-neutral-400">
                    No closer reports in this range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );

  const settersContent = (
    <div className="space-y-8">
      <div key="date-controls-setters">
        <DateRangeControls from={from} to={to} />
      </div>

      <div key="overview-setters" className="grid grid-cols-2 gap-8">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-50">Total Numbers</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "inbound", label: "Inbound calls", value: setterMetrics.inboundCalls },
              { key: "inboundTaken", label: "Inbound taken", value: setterMetrics.inboundCallsTaken },
              { key: "inboundSets", label: "Inbound sets", value: setterMetrics.inboundSets },
              { key: "outbound", label: "Outbound dials", value: setterMetrics.outboundDials },
              { key: "pickups", label: "Pickups", value: setterMetrics.outboundPickups },
              { key: "convos", label: "Convos", value: setterMetrics.outboundConvos },
              { key: "outboundSets", label: "Outbound sets", value: setterMetrics.outboundSets },
              { key: "triages", label: "Triages successful", value: setterMetrics.triagesSuccessful },
            ].map(({ key, label, value }) => (
              <StatCard key={key} label={label} value={String(value)} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-50">Rates %</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "inboundShow", label: "Inbound show rate", value: formatPct(setterMetrics.inboundShowRate) },
              { key: "inboundSet", label: "Inbound set rate", value: formatPct(setterMetrics.inboundOfferRate) },
              { key: "outboundPickup", label: "Outbound pickup rate", value: formatPct(setterMetrics.outboundPickupRate) },
              { key: "outboundConvo", label: "Outbound convo rate", value: formatPct(setterMetrics.outboundConvoRate) },
            ].map(({ key, label, value }) => (
              <StatCard key={key} label={label} value={String(value)} />
            ))}
          </div>
        </section>
      </div>

      <section key="per-setter">
        <h2 className="mb-4 text-lg font-semibold text-neutral-50">Per Setter</h2>
        <div className="overflow-x-auto rounded-md border border-neutral-700">
          <table className="w-full whitespace-nowrap text-sm">
            <thead className="bg-neutral-800 text-left text-xs uppercase text-neutral-50 border-b border-neutral-700 font-semibold">
              <tr>
                <th className="px-3 py-2">Setter</th>
                <th className="px-3 py-2">Inbound calls</th>
                <th className="px-3 py-2">Inbound taken</th>
                <th className="px-3 py-2">Inbound sets</th>
                <th className="px-3 py-2">Inbound show %</th>
                <th className="px-3 py-2">Set rate %</th>
                <th className="px-3 py-2">Outbound dials</th>
                <th className="px-3 py-2">Pickups</th>
                <th className="px-3 py-2">Pickups %</th>
                <th className="px-3 py-2">Convos</th>
                <th className="px-3 py-2">Convo %</th>
                <th className="px-3 py-2">Outbound sets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700">
              {Array.from(setterByRep.entries()).map(([repId, { name, rows }]) => {
                const m = computeSetterMetrics(sumSetterTotals(rows));
                return (
                  <tr key={repId} className="hover:bg-neutral-800/50">
                    <td className="px-3 py-2 font-medium text-neutral-50">{name}</td>
                    <td className="px-3 py-2 text-neutral-50">{m.inboundCalls}</td>
                    <td className="px-3 py-2 text-neutral-50">{m.inboundCallsTaken}</td>
                    <td className="px-3 py-2 text-neutral-50">{m.inboundSets}</td>
                    <td className="px-3 py-2 text-neutral-50">{formatPct(m.inboundShowRate)}</td>
                    <td className="px-3 py-2 text-neutral-50">{formatPct(m.inboundOfferRate)}</td>
                    <td className="px-3 py-2 text-neutral-50">{m.outboundDials}</td>
                    <td className="px-3 py-2 text-neutral-50">{m.outboundPickups}</td>
                    <td className="px-3 py-2 text-neutral-50">{formatPct(m.outboundPickupRate)}</td>
                    <td className="px-3 py-2 text-neutral-50">{m.outboundConvos}</td>
                    <td className="px-3 py-2 text-neutral-50">{formatPct(m.outboundConvoRate)}</td>
                    <td className="px-3 py-2 text-neutral-50">{m.outboundSets}</td>
                  </tr>
                );
              })}
              {setterByRep.size === 0 && (
                <tr key="empty">
                  <td colSpan={12} className="px-3 py-4 text-center text-neutral-400">
                    No setter reports in this range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );

  return (
    <DashboardTabs
      key="dashboard"
      mainContent={mainContent}
      closersContent={closersContent}
      settersContent={settersContent}
    />
  );
}
