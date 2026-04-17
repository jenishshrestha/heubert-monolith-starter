import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@shared/components/ui/Button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@shared/components/ui/Form";
import { Input } from "@shared/components/ui/Input";
import { useForm } from "react-hook-form";
import { useLogin } from "../api/use-login";
import { type LoginFormValues, loginSchema } from "../lib/auth.schema";

export function LoginForm() {
  const login = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: LoginFormValues) {
    login.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Email address"
                  className="h-11 rounded-xl border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Password"
                  className="h-11 rounded-xl border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {login.isError && (
          <p className="text-center text-sm text-destructive">{login.error.message}</p>
        )}

        <Button
          type="submit"
          variant="secondary"
          className="h-11 w-full rounded-full text-sm"
          disabled={login.isPending}
        >
          {login.isPending ? "Signing in..." : "Login"}
        </Button>
      </form>
    </Form>
  );
}
