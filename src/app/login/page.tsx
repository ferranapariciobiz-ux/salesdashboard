import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next && sp.next.startsWith("/") ? sp.next : "/dashboard";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-900 px-4">
      <h1 className="text-xl font-semibold text-neutral-50">Sales Dashboard</h1>
      <p className="text-sm text-neutral-400">Enter the shared password to continue.</p>
      <LoginForm next={next} />
    </main>
  );
}
