"use client";

import { useActionState, useRef, useEffect } from "react";
import { createRep, type ActionResult } from "@/app/actions";

const initialState: ActionResult | null = null;

export default function AddRepForm() {
  const [state, formAction, pending] = useActionState(createRep, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3 rounded-md border border-neutral-200 p-4">
      <div>
        <label className="block text-xs font-medium text-neutral-600">Name</label>
        <input
          name="name"
          required
          className="mt-1 rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          placeholder="e.g. Alex Rivera"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-600">Role</label>
        <select name="role" className="mt-1 rounded-md border border-neutral-300 px-3 py-1.5 text-sm">
          <option value="CLOSER">Closer</option>
          <option value="SETTER">Setter</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add rep"}
      </button>
      {state && !state.ok && <p className="w-full text-sm text-red-700">{state.message}</p>}
    </form>
  );
}
