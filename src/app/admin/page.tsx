"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/toaster";
import { Loader2, Users, CreditCard, Eye, TrendingUp, Check, X, Clock, RefreshCw } from "lucide-react";

interface Stats {
  totalUsers:  number;
  totalCards:  number;
  totalViews:  number;
  recentUsers: Array<{ id: string; name: string | null; email: string; plan: string; createdAt: string }>;
  topCards:    Array<{ id: string; slug: string; theme: string; viewCount: number; user: { name: string | null; email: string } }>;
  themeStats:  Array<{ theme: string; _count: number }>;
  planStats:   Array<{ plan: string; _count: number }>;
}

interface Payment {
  id:            string;
  userId:        string;
  plan:          string;
  amount:        number;
  transactionId: string;
  senderNumber:  string;
  status:        string;
  createdAt:     string;
  user:          { name: string | null; email: string };
}

function StatCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <Icon className="w-5 h-5 text-amber-500 mb-3" />
      <p className="font-display font-bold text-2xl text-foreground">{value.toLocaleString()}</p>
      <p className="font-body text-sm text-foreground font-medium mt-0.5">{label}</p>
      {sub && <p className="font-body text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router     = useRouter();
  const { addToast } = useToast();
  const [stats,    setStats]    = useState<Stats | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated" && session.user.role !== "ADMIN" && session.user.role !== "MODERATOR") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, pRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/payments?status=PENDING"),
      ]);
      const [sData, pData] = await Promise.all([sRes.json(), pRes.json()]);
      if (sRes.ok)  setStats(sData);
      if (pRes.ok)  setPayments(pData.payments ?? []);
    } catch {
      addToast({ title: "Error", description: "Failed to load admin data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (status === "authenticated") fetchData();
  }, [status, fetchData]);

  const handlePayment = async (id: string, action: "approve" | "reject") => {
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/payments/${id}/${action === "approve" ? "approve" : "approve"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        addToast({ title: `Payment ${action}d`, variant: "success" });
        setPayments(p => p.filter(pay => pay.id !== id));
        fetchData();
      } else {
        addToast({ title: "Error", description: "Action failed.", variant: "destructive" });
      }
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl">🌙</Link>
            <span className="font-display font-bold text-lg text-foreground">Admin Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <Link href="/dashboard" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users}     label="Total Users"  value={stats?.totalUsers  ?? 0} />
          <StatCard icon={CreditCard} label="Total Cards" value={stats?.totalCards  ?? 0} />
          <StatCard icon={Eye}       label="Total Views"  value={stats?.totalViews  ?? 0} />
          <StatCard icon={TrendingUp} label="Pending Payments" value={payments.length} sub="awaiting review" />
        </div>

        {/* Pending payments */}
        <div className="mb-8">
          <h2 className="font-display font-bold text-xl text-foreground mb-4">Pending Payments</h2>
          {payments.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <Check className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <p className="font-body text-muted-foreground">No pending payments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map(p => (
                <div key={p.id} className="rounded-2xl border border-border bg-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-foreground">{p.user.name ?? p.user.email}</p>
                    <p className="font-body text-sm text-muted-foreground">{p.plan} · {p.amount} TK · TrxID: {p.transactionId}</p>
                    <p className="font-body text-xs text-muted-foreground">Sender: {p.senderNumber} · {new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handlePayment(p.id, "approve")} disabled={processing === p.id}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-sm font-body font-semibold transition-all disabled:opacity-50">
                      {processing === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Approve
                    </button>
                    <button onClick={() => handlePayment(p.id, "reject")} disabled={processing === p.id}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-sm font-body font-semibold transition-all disabled:opacity-50">
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent users */}
        <div className="mb-8">
          <h2 className="font-display font-bold text-xl text-foreground mb-4">Recent Users</h2>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["Name","Email","Plan","Joined"].map(h => (
                      <th key={h} className="text-left px-5 py-3 font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentUsers?.map(u => (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="px-5 py-3 font-body text-sm text-foreground">{u.name ?? "—"}</td>
                      <td className="px-5 py-3 font-body text-sm text-muted-foreground">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-body font-semibold ${u.plan === "PREMIUM" ? "bg-amber-400/15 text-amber-400" : "bg-muted text-muted-foreground"}`}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-body text-sm text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Theme stats */}
        {stats?.themeStats && stats.themeStats.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-xl text-foreground mb-4">Theme Usage</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {stats.themeStats.map(t => (
                <div key={t.theme} className="rounded-2xl border border-border bg-card p-4 text-center">
                  <p className="font-display font-bold text-2xl text-foreground">{t._count}</p>
                  <p className="font-body text-xs text-muted-foreground mt-1">{t.theme}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
