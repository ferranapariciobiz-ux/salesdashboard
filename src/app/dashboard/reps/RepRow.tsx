"use client";

import { useTransition } from "react";
import { setRepActive } from "@/app/actions";

type Rep = { id: string; name: string; role: "CLOSER" | "SETTER"; active: boolean };

export default function RepRow({ rep }: { rep: Rep }) {
  const [isPending, startTransition] = useTransition();

  return (
    <li className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="text-sm font-medium text-neutral-900">{rep.name}</p>
        <p className="text-xs text-neutral-500">{rep.role === "CLOSER" ? "Closer" : "Setter"}</p>
      </div>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => setRepActive(rep.id, !rep.active))}
        className={`rounded-md px-3 py-1 text-xs font-medium disabled:opacity-50 ${
          rep.active ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
        }`}
      >
        {rep.active ? "Active" : "Inactive"}
      </button>
    </li>
  );
}
