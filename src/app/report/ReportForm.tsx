"use client";

import { useActionState, useMemo, useState } from "react";
import { submitDailyReport, type ActionResult } from "@/app/actions";

type Rep = { id: string; name: string; role: "CLOSER" | "SETTER" };

function todayLocal(): string {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}

type Field = { key: string; label: string; dollar?: boolean };

const CLOSER_FIELDS: Field[] = [
  { key: "callsScheduled", label: "Calls scheduled" },
  { key: "callsTaken", label: "Calls taken" },
  { key: "noShows", label: "No shows" },
  { key: "cancelled", label: "Cancelled" },
  { key: "rescheduled", label: "Rescheduled" },
  { key: "dqs", label: "DQs - Did Not Offer" },
  { key: "offers", label: "Offers" },
  { key: "closes", label: "Closes" },
  { key: "noCloses", label: "No Closes" },
  { key: "depositsAmount", label: "Deposits collected ($)", dollar: true },
  { key: "cashCollected", label: "Total cash collected ($)", dollar: true },
  { key: "revenue", label: "Total revenue sold ($)", dollar: true },
];

const INBOUND_SETTING_FIELDS: Field[] = [
  { key: "inboundCalls", label: "Inbound calls scheduled" },
  { key: "inboundNoShows", label: "Inbound no shows" },
  { key: "inboundRescheduled", label: "Inbound rescheduled" },
  { key: "inboundCallsTaken", label: "Inbound calls taken" },
  { key: "inboundBadFit", label: "Inbound bad fit" },
  { key: "inboundFollowUpNeeded", label: "Inbound follow up needed" },
  { key: "inboundSets", label: "Inbound sets" },
];

const TRIAGES_FIELDS: Field[] = [
  { key: "triagesAssigned", label: "Triages assigned" },
  { key: "triagesCancelledDq", label: "Triages cancelled DQ" },
  { key: "triagesSuccessful", label: "Triages successful" },
];

const OUTBOUND_SETTING_FIELDS: Field[] = [
  { key: "outboundDials", label: "Outbound dials" },
  { key: "outboundPickups", label: "Outbound pickups" },
  { key: "outboundConvos", label: "Outbound convos" },
  { key: "outboundDqs", label: "Outbound DQs" },
  { key: "outboundFollowups", label: "Outbound follow ups" },
  { key: "outboundSets", label: "Outbound sets" },
];

const SETTER_FIELDS: Field[] = [
  ...INBOUND_SETTING_FIELDS,
  ...TRIAGES_FIELDS,
  ...OUTBOUND_SETTING_FIELDS,
];

const initialState: ActionResult | null = null;

export default function ReportForm({ reps }: { reps: Rep[] }) {
  const [repId, setRepId] = useState(reps[0]?.id ?? "");
  const [date, setDate] = useState(todayLocal());
  const [formKey, setFormKey] = useState(0);
  const [state, formAction, pending] = useActionState(submitDailyReport, initialState);

  const selectedRep = useMemo(() => reps.find((r) => r.id === repId), [reps, repId]);
  const fields = selectedRep?.role === "SETTER" ? SETTER_FIELDS : CLOSER_FIELDS;

  // Reset the number inputs after a successful submit by adjusting state
  // during render (rather than in an effect) per React's guidance at
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    if (state?.ok) setFormKey((k) => k + 1);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await formAction(formData);
  };

  if (reps.length === 0) {
    return (
      <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        No reps set up yet. Ask whoever manages the dashboard to add reps at <code className="text-amber-300">/dashboard/reps</code>.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-neutral-50">Your name</label>
        <select
          name="repId"
          value={repId}
          onChange={(e) => setRepId(e.target.value)}
          className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-50 focus:border-amber-500 focus:outline-none"
        >
          {reps.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.role === "CLOSER" ? "Closer" : "Setter"})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-neutral-50">Date</label>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="date"
            name="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-50 focus:border-amber-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setDate(todayLocal())}
            className="whitespace-nowrap rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-medium text-neutral-300 transition hover:bg-neutral-700 hover:text-neutral-50"
          >
            Today
          </button>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold text-neutral-50">Daily Metrics</h2>

        {selectedRep?.role === "SETTER" ? (
          <div key={formKey} className="space-y-6">
            {/* Section 1: Inbound Setting */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-500">Section 1: Inbound Setting</h3>
              <div className="grid grid-cols-2 gap-4">
                {INBOUND_SETTING_FIELDS.map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium uppercase tracking-wide text-neutral-400">{f.label}</label>
                    <input
                      id={f.key}
                      type="number"
                      name={f.key}
                      min={0}
                      step={f.dollar ? "0.01" : "1"}
                      defaultValue={0}
                      onFocus={(e) => {
                        if (e.target.value === "0") {
                          e.target.value = "";
                        }
                      }}
                      className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-50 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Triages */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-500">Section 2: Triages</h3>
              <div className="grid grid-cols-2 gap-4">
                {TRIAGES_FIELDS.map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium uppercase tracking-wide text-neutral-400">{f.label}</label>
                    <input
                      id={f.key}
                      type="number"
                      name={f.key}
                      min={0}
                      step={f.dollar ? "0.01" : "1"}
                      defaultValue={0}
                      onFocus={(e) => {
                        if (e.target.value === "0") {
                          e.target.value = "";
                        }
                      }}
                      className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-50 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Outbound Setting */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-500">Section 3: Outbound Setting</h3>
              <div className="grid grid-cols-2 gap-4">
                {OUTBOUND_SETTING_FIELDS.map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium uppercase tracking-wide text-neutral-400">{f.label}</label>
                    <input
                      id={f.key}
                      type="number"
                      name={f.key}
                      min={0}
                      step={f.dollar ? "0.01" : "1"}
                      defaultValue={0}
                      onFocus={(e) => {
                        if (e.target.value === "0") {
                          e.target.value = "";
                        }
                      }}
                      className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-50 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div key={formKey} className="grid grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.key} className={f.dollar ? "col-span-2" : ""}>
                <label className="block text-xs font-medium uppercase tracking-wide text-neutral-400">{f.label}</label>
                <input
                  id={f.key}
                  type="number"
                  name={f.key}
                  min={0}
                  step={f.dollar ? "0.01" : "1"}
                  defaultValue={0}
                  onFocus={(e) => {
                    if (e.target.value === "0") {
                      e.target.value = "";
                    }
                  }}
                  className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-50 focus:border-amber-500 focus:outline-none"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRep?.role === "CLOSER" && <ReconciliationHint />}

      {state && (
        <p
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            state.ok
              ? "border border-green-500/30 bg-green-500/10 text-green-200"
              : "border border-red-500/30 bg-red-500/10 text-red-200"
          }`}
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-amber-500 px-4 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-amber-400 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save Report"}
      </button>
    </form>
  );
}

function ReconciliationHint() {
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
      <p className="text-xs text-amber-200">
        💡 <strong>Tip:</strong> Calls taken + No shows + Cancelled + Rescheduled should add up to Calls scheduled.
      </p>
    </div>
  );
}
