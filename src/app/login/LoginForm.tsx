"use client";

import { useActionState } from "react";
import { login, type LoginResult } from "./actions";

const initialState: LoginResult | null = null;

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex w-full max-w-xs flex-col gap-3">
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="block text-xs font-medium text-neutral-400">Password</label>
        <input
          name="password"
          type="password"
          required
          autoFocus
          className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-50"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-50 px-4 py-1.5 text-sm font-medium text-neutral-900 hover:bg-neutral-200 disabled:opacity-50"
      >
        {pending ? "Checking…" : "Enter"}
      </button>
      {state && !state.ok && <p className="text-sm text-red-400">{state.message}</p>}
    </form>
  );
}
