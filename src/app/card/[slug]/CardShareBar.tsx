"use client";

import { useState } from "react";
import { Copy, CheckCheck, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  slug: string;
}

export default function CardShareBar({ slug }: Props) {
  const [copied, setCopied] = useState(false);

  const cardUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/card/${slug}`
      : `/card/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for browsers that block clipboard without HTTPS
      const el = document.createElement("textarea");
      el.value = cardUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = async () => {
    // Web Share API — works natively on Android and iOS Safari.
    // Falls back to copy if the browser doesn't support it.
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Eid Mubarak! 🌙",
          text: "I sent you an Eid greeting card — open it!",
          url: cardUrl,
        });
      } catch {
        // User dismissed the share sheet — no action needed
      }
    } else {
      // Browser doesn't support Web Share API (e.g. desktop Chrome)
      await handleCopy();
    }
  };

  return (
    <div className="sticky bottom-0 z-40 flex items-center justify-center gap-3 py-3 px-4 bg-background/80 backdrop-blur border-t">
      <span className="text-sm text-muted-foreground hidden sm:inline">
        Share this card:
      </span>

      {/* Copy link */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="gap-2 min-w-[130px]"
      >
        {copied ? (
          <>
            <CheckCheck className="w-4 h-4 text-green-600" />
            <span className="text-green-600">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copy Link
          </>
        )}
      </Button>

      {/* Share (native on mobile, copies on desktop) */}
      <Button size="sm" onClick={handleShare} className="gap-2">
        <Share2 className="w-4 h-4" />
        Share
      </Button>
    </div>
  );
}
