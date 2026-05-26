"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { themes } from "@/components/themes";
import { useToast } from "@/components/ui/toaster";
import { Loader2, ArrowLeft, ArrowRight, Check, Moon, Sun } from "lucide-react";

const audioOptions = [
  { id: "audio1", name: "Islamic Nasheed", emoji: "🎵" },
  { id: "audio2", name: "Traditional Darbar", emoji: "🥁" },
  { id: "audio3", name: "Soft Ambient", emoji: "🌙" },
  { id: "audio4", name: "Quranic Recitation", emoji: "📖" },
];

export default function CardCreatePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { addToast } = useToast();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    eidType: "",
    theme: "",
    audio: "",
    phone: "",
    customMessage: "",
    recipientName: "",
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        addToast({
          title: "Error",
          description: data.error || "Failed to create card",
          variant: "destructive",
        });
      } else {
        addToast({
          title: "Card Created!",
          description: "Your card is ready to share.",
        });
        router.push(`/dashboard?created=${data.slug}`);
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <CardHeader className="text-center px-0">
              <CardTitle className="text-2xl">Choose Eid Type</CardTitle>
              <CardDescription>Select the type of Eid card you want to create</CardDescription>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setFormData({ ...formData, eidType: "eid_al_fitr" })}
                className={`p-6 rounded-lg border-2 transition-all ${
                  formData.eidType === "eid_al_fitr"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Moon className="w-12 h-12 mx-auto mb-3 text-primary" />
                <h3 className="text-lg font-semibold">Eid Al-Fitr</h3>
                <p className="text-sm text-muted-foreground">Celebrate the end of Ramadan</p>
              </button>
              <button
                onClick={() => setFormData({ ...formData, eidType: "eid_al_adha" })}
                className={`p-6 rounded-lg border-2 transition-all ${
                  formData.eidType === "eid_al_adha"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Sun className="w-12 h-12 mx-auto mb-3 text-primary" />
                <h3 className="text-lg font-semibold">Eid Al-Adha</h3>
                <p className="text-sm text-muted-foreground">Celebrate the festival of sacrifice</p>
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <CardHeader className="text-center px-0">
              <CardTitle className="text-2xl">Choose Theme</CardTitle>
              <CardDescription>Pick a beautiful theme for your Eid card</CardDescription>
            </CardHeader>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setFormData({ ...formData, theme: theme.id })}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    formData.theme === theme.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="text-3xl mb-2">{theme.preview}</div>
                  <p className="text-xs font-medium">{theme.name}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <CardHeader className="text-center px-0">
              <CardTitle className="text-2xl">Choose Audio</CardTitle>
              <CardDescription>Add background music to your card</CardDescription>
            </CardHeader>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {audioOptions.map((audio) => (
                <button
                  key={audio.id}
                  onClick={() => setFormData({ ...formData, audio: audio.id })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.audio === audio.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="text-3xl mb-2">{audio.emoji}</div>
                  <p className="text-sm font-medium">{audio.name}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <CardHeader className="text-center px-0">
              <CardTitle className="text-2xl">Your Details</CardTitle>
              <CardDescription>Enter your message and contact info</CardDescription>
            </CardHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipientName">Recipient Name (Optional)</Label>
                <Input
                  id="recipientName"
                  placeholder="Who is this card for?"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Your Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+880 1XXX XXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customMessage">Your Message</Label>
                <textarea
                  id="customMessage"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Write your Eid wishes here..."
                  value={formData.customMessage}
                  onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!formData.eidType;
      case 2:
        return !!formData.theme;
      case 3:
        return !!formData.audio;
      case 4:
        return !!formData.phone && !!formData.customMessage;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Step {step} of 4
          </p>
        </div>

        <Card>{renderStep()}</Card>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canProceed() || isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Card
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
