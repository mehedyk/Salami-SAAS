"use client";

import { useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/layout/footer";
import { useToast } from "@/components/ui/toaster";
import { Plus, Copy, ExternalLink, Edit, Trash2, Loader2, Crown } from "lucide-react";
import { useState } from "react";

interface Card {
  id: string;
  slug: string;
  eidType: string;
  theme: string;
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const justCreated = searchParams.get("created");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (justCreated) {
      addToast({
        title: "Card Created! 🎉",
        description: "Your Eid card is ready to share with the world.",
      });
    }
  }, [justCreated, addToast]);

  const fetchCards = useCallback(async () => {
    try {
      const res = await fetch("/api/cards");
      const data = await res.json();
      setCards(data);
    } catch (error) {
      addToast({ title: "Error", description: "Failed to load cards", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchCards();
    }
  }, [status, fetchCards]);

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/card/${slug}`;
    navigator.clipboard.writeText(url);
    addToast({ title: "Link Copied!", description: "Share this link with your loved ones." });
  };

  const deleteCard = async (id: string) => {
    if (!confirm("Are you sure you want to delete this card?")) return;
    setDeletingId(id);

    try {
      await fetch(`/api/cards/${id}`, { method: "DELETE" });
      setCards(cards.filter((c) => c.id !== id));
      addToast({ title: "Card Deleted" });
    } catch (error) {
      addToast({ title: "Error", description: "Failed to delete card", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isPremium = session?.user?.plan === "PREMIUM";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">EidCard</Link>
          <div className="flex items-center gap-4">
            {isPremium && (
              <span className="flex items-center gap-1 text-sm text-primary">
                <Crown className="w-4 h-4" /> Premium
              </span>
            )}
            <Link href="/dashboard/card/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Card
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {session?.user?.name || "User"}</h1>
          <p className="text-muted-foreground">
            {cards.length === 0
              ? "You haven't created any cards yet."
              : `You have ${cards.length} card${cards.length > 1 ? "s" : ""}`}
          </p>
        </div>

        {!isPremium && (
          <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Upgrade to Premium</h3>
                  <p className="text-sm text-muted-foreground">Unlimited cards, lifetime access, and more features.</p>
                </div>
                <Link href="/pricing">
                  <Button>Upgrade Now - 99 TK</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {cards.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Create Your First Eid Card</h2>
              <p className="text-muted-foreground mb-6">Spread the joy of Eid with your loved ones</p>
              <Link href="/dashboard/card/create">
                <Button size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Card
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <Card key={card.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {card.eidType === "eid_al_fitr" ? "Eid Al-Fitr" : "Eid Al-Adha"}
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {card.viewCount} views
                    </span>
                  </div>
                  <CardDescription>
                    Theme: {card.theme} • Created {new Date(card.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyLink(card.slug)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>
                    <Link href={`/card/${card.slug}`} target="_blank">
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    {isPremium && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteCard(card.id)}
                        disabled={deletingId === card.id}
                      >
                        {deletingId === card.id ? (
                          <Loader2 className="w-4 h-4" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
