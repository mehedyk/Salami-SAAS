import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { renderTheme } from "@/components/themes";
import { getRandomDuas } from "@/lib/duas";
import { Footer } from "@/components/layout/footer";
import CardShareBar from "./CardShareBar";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps) {
  const card = await prisma.card.findUnique({
    where: { slug: params.slug, isPublished: true },
  });

  if (!card) return { title: "Card Not Found" };

  return {
    title: `Eid Mubarak from ${card.recipientName || "Someone Special"}`,
    description: card.customMessage,
    openGraph: {
      title: `Eid Mubarak! 🌙`,
      description: card.customMessage,
    },
  };
}

export default async function CardPage({ params }: PageProps) {
  const card = await prisma.card.findUnique({
    where: { slug: params.slug, isPublished: true, isActive: true },
  });

  if (!card) notFound();

  const duas = getRandomDuas(card.eidType, 3);

  return (
    <div className="min-h-screen">
      {renderTheme({
        themeId: card.theme,
        eidType: card.eidType,
        recipientName: card.recipientName || undefined,
        customMessage: card.customMessage,
        phone: card.phone,
        duas,
      })}

      {/* Share bar — lets the recipient copy or share the card link */}
      <CardShareBar slug={params.slug} />

      <Footer />
    </div>
  );
}
