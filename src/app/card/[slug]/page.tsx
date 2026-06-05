// src/app/card/[slug]/page.tsx
// Server Component — fetches card from DB, increments view count, renders theme.

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ThemeCard } from "@/components/themes";
import { getRandomDuas } from "@/lib/duas";
import CardShareBar from "./CardShareBar";
import CardFooter from "./CardFooter";

interface PageProps {
  params: { slug: string };
}

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
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? "https://salami-saas.vercel.app";

  return {
    title,
    description: desc,
    openGraph: { title, description: desc, type: "website", siteName: "EidCard", url: `${appUrl}/card/${params.slug}` },
    twitter:    { card: "summary_large_image", title, description: desc },
  };
}

export default async function CardPage({ params }: PageProps) {
  const card = await prisma.card.findUnique({
    where: { slug: params.slug, isPublished: true, isActive: true },
  });
  if (!card) notFound();

  // Non-blocking view increment
  prisma.card
    .update({ where: { id: card.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  const duas = getRandomDuas(card.eidType, 3);

  return (
    <div className="ec-theme-root">
      <ThemeCard
        themeId={card.theme}
        eidType={card.eidType}
        recipientName={card.recipientName ?? undefined}
        customMessage={card.customMessage}
        phone={card.phone}
        duas={duas}
      />
      <CardShareBar slug={params.slug} recipientName={card.recipientName ?? undefined} />
      <CardFooter />
    </div>
  );
}
