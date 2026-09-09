import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "অ্যাডমিন প্যানেল — স্টোর ব্যবস্থাপনা" },
      { name: "description", content: "পণ্য, অর্ডার, ক্যাটাগরি ও সেটিংস পরিচালনার অ্যাডমিন প্যানেল।" },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "অ্যাডমিন প্যানেল" },
      { property: "og:description", content: "স্টোর ব্যবস্থাপনার নিয়ন্ত্রণ কেন্দ্র।" },
    ],
  }),
  component: AdminGate,
});

function AdminGate() {
  const { session, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !session) void navigate({ to: "/auth" });
  }, [isLoading, session, navigate]);

  if (isLoading || (session && !isAdmin)) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface px-4 text-center">
        {isLoading ? (
          <Loader2 className="size-6 animate-spin text-primary" />
        ) : (
          <div className="max-w-sm space-y-4">
            <h1 className="text-lg font-semibold">প্রবেশের অনুমতি নেই</h1>
            <p className="text-sm text-muted-foreground">
              এই অ্যাকাউন্টটি অ্যাডমিন হিসেবে নিবন্ধিত নয়। স্টোরের মালিকের কাছে অ্যাডমিন অনুমতির
              জন্য অনুরোধ করুন।
            </p>
            <Button variant="outline" onClick={() => void signOut()}>
              অন্য অ্যাকাউন্টে সাইন ইন করুন
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (!session) return null;

  return (
    <AdminShell>
      {/* Nested admin pages render here. */}
      <Outlet />
    </AdminShell>
  );
}
