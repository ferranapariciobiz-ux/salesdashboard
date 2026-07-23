export function safeDiv(numerator: number, denominator: number): number | null {
  if (!denominator) return null;
  return numerator / denominator;
}

export type CloserTotals = {
  callsScheduled: number;
  callsTaken: number;
  qualifiedDemos: number;
  noShows: number;
  cancelled: number;
  rescheduled: number;
  dqs: number;
  offers: number;
  closes: number;
  noCloses: number;
  depositsAmount: number;
  cashCollected: number;
  revenue: number;
};

export type CloserMetrics = CloserTotals & {
  showUpRate: number | null;
  noShowRate: number | null;
  cancelRate: number | null;
  rescheduleRate: number | null;
  offerRate: number | null;
  closeRate: number | null;
  offerToCloseRate: number | null;
  cashPerBookedCall: number | null;
  cashPerCallTaken: number | null;
  aov: number | null;
  upfrontCashPercent: number | null;
  qualifiedRate: number | null;
};

export function computeCloserMetrics(totals: CloserTotals): CloserMetrics {
  return {
    ...totals,
    showUpRate: safeDiv(totals.callsTaken, totals.callsScheduled),
    noShowRate: safeDiv(totals.noShows, totals.callsScheduled),
    cancelRate: safeDiv(totals.cancelled, totals.callsScheduled),
    rescheduleRate: safeDiv(totals.rescheduled, totals.callsScheduled),
    offerRate: safeDiv(totals.offers, totals.callsTaken),
    closeRate: safeDiv(totals.closes, totals.callsTaken),
    offerToCloseRate: safeDiv(totals.closes, totals.offers),
    cashPerBookedCall: safeDiv(totals.cashCollected, totals.callsScheduled),
    cashPerCallTaken: safeDiv(totals.cashCollected, totals.callsTaken),
    aov: safeDiv(totals.revenue, totals.closes),
    upfrontCashPercent: safeDiv(totals.cashCollected, totals.revenue),
    qualifiedRate: safeDiv(totals.qualifiedDemos, totals.callsTaken),
  };
}

export const emptyCloserTotals: CloserTotals = {
  callsScheduled: 0,
  callsTaken: 0,
  qualifiedDemos: 0,
  noShows: 0,
  cancelled: 0,
  rescheduled: 0,
  dqs: 0,
  offers: 0,
  closes: 0,
  noCloses: 0,
  depositsAmount: 0,
  cashCollected: 0,
  revenue: 0,
};

export type SetterTotals = {
  // Legacy fields
  outboundDials: number;
  inboundTriages: number;
  dqs: number;
  newSets: number;
  triagesCompleted: number;
  // Inbound calendar tracking
  inboundCalls: number;
  inboundNoShows: number;
  inboundRescheduled: number;
  inboundCallsTaken: number;
  inboundBadFit: number;
  inboundFollowUpNeeded: number;
  inboundSets: number;
  // Triage tracking
  triagesAssigned: number;
  triagesCancelledDq: number;
  triagesSuccessful: number;
  // Outbound tracking
  outboundPickups: number;
  outboundConvos: number;
  outboundDqs: number;
  outboundFollowups: number;
  outboundSets: number;
};

export type SetterMetrics = SetterTotals & {
  dialToSetRate: number | null;
  triageCompletionRate: number | null;
  dqRate: number | null;
  inboundShowRate: number | null;
  inboundOfferRate: number | null;
  inboundCloseRate: number | null;
  outboundPickupRate: number | null;
  outboundConvoRate: number | null;
};

export function computeSetterMetrics(totals: SetterTotals): SetterMetrics {
  return {
    ...totals,
    dialToSetRate: safeDiv(totals.newSets, totals.outboundDials),
    triageCompletionRate: safeDiv(totals.triagesCompleted, totals.inboundTriages),
    dqRate: safeDiv(totals.dqs, totals.outboundDials + totals.inboundTriages),
    inboundShowRate: safeDiv(totals.inboundCallsTaken, totals.inboundCalls),
    inboundOfferRate: safeDiv(totals.inboundSets, totals.inboundCallsTaken),
    inboundCloseRate: safeDiv(totals.inboundSets, totals.inboundCalls),
    outboundPickupRate: safeDiv(totals.outboundPickups, totals.outboundDials),
    outboundConvoRate: safeDiv(totals.outboundConvos, totals.outboundPickups),
  };
}

export const emptySetterTotals: SetterTotals = {
  outboundDials: 0,
  inboundTriages: 0,
  dqs: 0,
  newSets: 0,
  triagesCompleted: 0,
  inboundCalls: 0,
  inboundNoShows: 0,
  inboundRescheduled: 0,
  inboundCallsTaken: 0,
  inboundBadFit: 0,
  inboundFollowUpNeeded: 0,
  inboundSets: 0,
  triagesAssigned: 0,
  triagesCancelledDq: 0,
  triagesSuccessful: 0,
  outboundPickups: 0,
  outboundConvos: 0,
  outboundDqs: 0,
  outboundFollowups: 0,
  outboundSets: 0,
};

export function sumCloserTotals(rows: CloserTotals[]): CloserTotals {
  return rows.reduce(
    (acc, r) => {
      const qd = Number(r.qualifiedDemos) || 0;
      const nc = Number(r.noCloses) || 0;
      return {
        callsScheduled: acc.callsScheduled + r.callsScheduled,
        callsTaken: acc.callsTaken + r.callsTaken,
        qualifiedDemos: acc.qualifiedDemos + qd,
        noShows: acc.noShows + r.noShows,
        cancelled: acc.cancelled + r.cancelled,
        rescheduled: acc.rescheduled + r.rescheduled,
        dqs: acc.dqs + r.dqs,
        offers: acc.offers + r.offers,
        closes: acc.closes + r.closes,
        noCloses: acc.noCloses + nc,
        depositsAmount: acc.depositsAmount + r.depositsAmount,
        cashCollected: acc.cashCollected + r.cashCollected,
        revenue: acc.revenue + r.revenue,
      };
    },
    { ...emptyCloserTotals }
  );
}

export function sumSetterTotals(rows: SetterTotals[]): SetterTotals {
  return rows.reduce(
    (acc, r) => ({
      outboundDials: acc.outboundDials + r.outboundDials,
      inboundTriages: acc.inboundTriages + r.inboundTriages,
      dqs: acc.dqs + r.dqs,
      newSets: acc.newSets + r.newSets,
      triagesCompleted: acc.triagesCompleted + r.triagesCompleted,
      inboundCalls: acc.inboundCalls + r.inboundCalls,
      inboundNoShows: acc.inboundNoShows + r.inboundNoShows,
      inboundRescheduled: acc.inboundRescheduled + r.inboundRescheduled,
      inboundCallsTaken: acc.inboundCallsTaken + r.inboundCallsTaken,
      inboundBadFit: acc.inboundBadFit + r.inboundBadFit,
      inboundFollowUpNeeded: acc.inboundFollowUpNeeded + r.inboundFollowUpNeeded,
      inboundSets: acc.inboundSets + r.inboundSets,
      triagesAssigned: acc.triagesAssigned + r.triagesAssigned,
      triagesCancelledDq: acc.triagesCancelledDq + r.triagesCancelledDq,
      triagesSuccessful: acc.triagesSuccessful + r.triagesSuccessful,
      outboundPickups: acc.outboundPickups + r.outboundPickups,
      outboundConvos: acc.outboundConvos + r.outboundConvos,
      outboundDqs: acc.outboundDqs + r.outboundDqs,
      outboundFollowups: acc.outboundFollowups + r.outboundFollowups,
      outboundSets: acc.outboundSets + r.outboundSets,
    }),
    { ...emptySetterTotals }
  );
}

export function formatPct(v: number | null): string {
  if (v === null) return "—";
  return `${(v * 100).toFixed(1)}%`;
}

export function formatUsd(v: number | null): string {
  if (v === null) return "—";
  return v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
