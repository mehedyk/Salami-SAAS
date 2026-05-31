// src/app/card/[slug]/page.tsx
// Server Component — fetches card from DB, increments view count, renders theme.

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { renderTheme } from "@/components/themes";
import { getRandomDuas } from "@/lib/duas";
import CardShareBar from "./CardShareBar";
import CardFooter from "./CardFooter";

interface PageProps {
  params: { slug: string };
}

// ── Metadata (OG tags for WhatsApp / Facebook previews) ──────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const card = await prisma.card.findUnique({
    where: { slug: params.slug, isPublished: true },
    select: { recipientName: true, customMessage: true, eidType: true },
  });

  if (!card) return { title: "Card Not Found | EidCard" };

  const eidLabel = card.eidType === "eid_al_adha" ? "Eid Al-Adha" : "Eid Al-Fitr";
  const forLine  = card.recipientName ? ` for ${card.recipientName}` : "";
  const title    = `🌙 ${eidLabel} Mubarak${forLine}`;
  const desc     = card.customMessage.slice(0, 160);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://eidcard.vercel.app";

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      type:     "website",
      siteName: "EidCard",
      url:      `${appUrl}/card/${params.slug}`,
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description: desc,
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function CardPage({ params }: PageProps) {
  // Fetch card — must be published AND active
  const card = await prisma.card.findUnique({
    where: {
      slug:        params.slug,
      isPublished: true,
      isActive:    true,
    },
  });

  if (!card) notFound();

  // Increment view count in the background (fire-and-forget, non-blocking)
  prisma.card
    .update({ where: { id: card.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => { /* non-critical */ });

  // Pick 3 contextual duas for this card's eid type
  const duas = getRandomDuas(card.eidType, 3);

  return (
    // ec-theme-root resets Tailwind bleed (defined in globals.css)
    <div className="ec-theme-root">
      {renderTheme({
        themeId:       card.theme,
        eidType:       card.eidType,
        recipientName: card.recipientName ?? undefined,
        customMessage: card.customMessage,
        phone:         card.phone,
        duas,
      })}

      {/* Sticky share bar — client component */}
      <CardShareBar slug={params.slug} recipientName={card.recipientName ?? undefined} />

      {/* Minimal card footer */}
      <CardFooter />
    </div>
  );
}
