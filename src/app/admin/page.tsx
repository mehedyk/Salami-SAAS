"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/footer";
import { useToast } from "@/components/ui/toaster";
import { Loader2, Users, CreditCard, Eye, TrendingUp, Check, X, Clock } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalCards: number;
  totalViews: number;
  recentUsers: Array<{ id: string; name: string | null; email: string; plan: string; createdAt: Date }>;
  topCards: Array<{ id: string; slug: string; theme: string; viewCount: number; user: { name: string | null; email: string } }>;
  themeStats: Array<{ theme: string; _count: number }>;
  planStats: Array<{ plan: string; _count: number }>;
}

interface PaymentRequest {
  id: string;
  userId: string;
  plan: string;
  amount: number;
  transactionId: string;
  senderNumber: string;
  status: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addToast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN" && session?.user?.role !== "MODERATOR") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated" && (session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR")) {
      fetchData();
    }
  }, [status, session]);

  const fetchData = async () => {
    try {
      const [statsRes, paymentsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/payments?status=PENDING"),
      ]);
      const statsData = await statsRes.json();
      const paymentsData = await paymentsRes.json();
      setStats(statsData);
      setPaymentRequests(paymentsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovePayment = async (id: string, approve: boolean) => {
    setIsProcessing(id);
    try {
      const res = await fetch(`/api/admin/payments/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: approve ? "APPROVED" : "REJECTED",
          adminNote: approve ? "Payment verified." : "Invalid transaction details.",
        }),
      });

      if (res.ok) {
        addToast({ title: approve ? "Payment Approved" : "Payment Rejected" });
        setPaymentRequests(paymentRequests.filter((r) => r.id !== id));
        // Refresh stats to show new premium user count
        const statsRes = await fetch("/api/admin/stats");
        const statsData = await statsRes.json();
        setStats(statsData);
      } else {
        addToast({ title: "Error", description: "Failed to process request", variant: "destructive" });
      }
    } catch (error) {
      addToast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    } finally {
      setIsProcessing(null);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Failed to load statistics</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">EidCard</Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <span className="text-sm text-muted-foreground font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
              {session?.user?.role === "ADMIN" ? "Admin" : "Moderator"}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
              <CreditCard className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCards}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {stats.planStats.find((p) => p.plan === "PREMIUM")?._count || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Payments Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-bold">Pending Payments</h2>
            {paymentRequests.length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                {paymentRequests.length}
              </span>
            )}
          </div>
          
          {paymentRequests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No pending payment requests at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {paymentRequests.map((request) => (
                <Card key={request.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="py-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{request.user.name || "N/A"}</span>
                          <span className="text-xs text-muted-foreground">({request.user.email})</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          <p>Plan: <span className="font-semibold text-primary">{request.plan}</span></p>
                          <p>Amount: <span className="font-semibold">{request.amount} TK</span></p>
                          <p>TrxID: <code className="bg-muted px-1 rounded font-bold">{request.transactionId}</code></p>
                          <p>Sender: <span className="font-semibold">{request.senderNumber}</span></p>
                        </div>
                        <p className="text-xs text-muted-foreground">Submitted: {new Date(request.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <Button 
                          size="sm" 
                          className="flex-1 md:flex-none bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprovePayment(request.id, true)}
                          disabled={!!isProcessing}
                        >
                          {isProcessing === request.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <><Check className="w-4 h-4 mr-1" /> Approve</>
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="flex-1 md:flex-none"
                          onClick={() => handleApprovePayment(request.id, false)}
                          disabled={!!isProcessing}
                        >
                          {isProcessing === request.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <><X className="w-4 h-4 mr-1" /> Reject</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Analytics & Users Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Cards */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Top Cards</CardTitle>
              <CardDescription>Most viewed Eid cards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topCards.slice(0, 5).map((card, index) => (
                  <div key={card.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-4">#{index + 1}</span>
                      <div>
                        <Link href={`/card/${card.slug}`} target="_blank" className="font-medium hover:text-primary transition-colors flex items-center gap-1">
                          {card.slug} <Eye className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                        </Link>
                        <p className="text-xs text-muted-foreground">{card.theme}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold">{card.viewCount}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Latest registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="pb-3 font-medium">User</th>
                      <th className="pb-3 font-medium">Plan</th>
                      <th className="pb-3 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {stats.recentUsers.map((user) => (
                      <tr key={user.id} className="border-t hover:bg-muted/50 transition-colors">
                        <td className="py-3">
                          <div className="flex flex-col">
                            <span className="font-medium">{user.name || "N/A"}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${user.plan === "PREMIUM" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                            {user.plan}
                          </span>
                        </td>
                        <td className="py-3 text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
