import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { useSettings } from "@/lib/store-context";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "অ্যাডমিন লগইন — স্টোর ব্যবস্থাপনা" },
      {
        name: "description",
        content: "স্টোর পরিচালনার জন্য অ্যাডমিন প্যানেলে সাইন ইন করুন অথবা নতুন অ্যাকাউন্ট খুলুন।",
      },
      { property: "og:title", content: "অ্যাডমিন লগইন" },
      { property: "og:description", content: "স্টোর ব্যবস্থাপনার জন্য সাইন ইন করুন।" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { signIn, signUp, session } = useAuth();
  const settings = useSettings();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) void navigate({ to: "/admin" });
  }, [session, navigate]);

  async function handle(mode: "in" | "up", form: HTMLFormElement) {
    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const name = String(data.get("name") ?? "").trim();
    setBusy(true);
    try {
      if (mode === "in") {
        await signIn(email, password);
        toast.success("সফলভাবে সাইন ইন হয়েছে");
      } else {
        await signUp(email, password, name);
        toast.success("অ্যাকাউন্ট তৈরি হয়েছে");
      }
      void navigate({ to: "/admin" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "কিছু ভুল হয়েছে";
      toast.error(
        message.includes("Invalid login")
          ? "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়"
          : message.includes("already registered")
            ? "এই ইমেইলে অ্যাকাউন্ট আছে, সাইন ইন করুন"
            : message,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-card md:p-8">
        <h1 className="text-center text-xl font-semibold md:text-2xl">
          {settings.store_name} — অ্যাডমিন
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          স্টোর পরিচালনা করতে সাইন ইন করুন
        </p>

        <Tabs defaultValue="in" className="mt-6">
          <TabsList className="w-full">
            <TabsTrigger value="in" className="flex-1">
              সাইন ইন
            </TabsTrigger>
            <TabsTrigger value="up" className="flex-1">
              নতুন অ্যাকাউন্ট
            </TabsTrigger>
          </TabsList>

          <TabsContent value="in" className="pt-5">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void handle("in", e.currentTarget);
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="in-email">ইমেইল</Label>
                <Input id="in-email" name="email" type="email" required autoComplete="email" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="in-pass">পাসওয়ার্ড</Label>
                <Input
                  id="in-pass"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                সাইন ইন করুন
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="up" className="pt-5">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void handle("up", e.currentTarget);
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="up-name">নাম</Label>
                <Input id="up-name" name="name" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="up-email">ইমেইল</Label>
                <Input id="up-email" name="email" type="email" required autoComplete="email" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="up-pass">পাসওয়ার্ড</Label>
                <Input
                  id="up-pass"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                অ্যাকাউন্ট তৈরি করুন
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
