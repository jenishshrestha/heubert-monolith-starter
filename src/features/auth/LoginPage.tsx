import { PackageIcon } from "lucide-react";
import { DevCredentialsHint } from "./components/DevCredentialsHint";
import { LoginForm } from "./components/LoginForm";

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full border border-border bg-secondary">
            <PackageIcon className="size-6 text-foreground" />
          </div>
          <h1 className="text-xl font-medium text-foreground">Log in to Product Portal</h1>
        </div>

        {/* Form */}
        <LoginForm />

        <DevCredentialsHint />
      </div>
    </div>
  );
}
