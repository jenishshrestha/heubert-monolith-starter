const CREDENTIALS = [
  { role: "Basic User", email: "user@experteducation.com", password: "user123" },
  { role: "Super Admin", email: "superadmin@experteducationc.com", password: "admin123" },
] as const;

export function DevCredentialsHint() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/50 p-3 text-xs">
      <p className="mb-2 font-medium text-foreground">Demo credentials</p>
      <ul className="space-y-1.5 text-muted-foreground">
        {CREDENTIALS.map((c) => (
          <li key={c.email} className="flex flex-col gap-0.5">
            <span className="text-foreground">{c.role}</span>
            <span className="font-mono">
              {c.email} · {c.password}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
