"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_MAX_AGE, checkPassword, expectedSessionValue } from "@/lib/auth";

export type LoginResult = { ok: false; message: string };

export async function login(_prev: LoginResult | null, formData: FormData): Promise<LoginResult> {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");
  const destination = next.startsWith("/") ? next : "/dashboard";

  if (!(await checkPassword(password))) {
    return { ok: false, message: "Wrong password." };
  }

  const sessionValue = await expectedSessionValue();
  const jar = await cookies();
  jar.set(SESSION_COOKIE, sessionValue!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  redirect(destination);
}

export async function logout(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/login");
}
