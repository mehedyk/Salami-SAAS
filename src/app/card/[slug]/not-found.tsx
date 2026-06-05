import Link from "next/link";

export default function CardNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center"
         style={{ background: "linear-gradient(135deg, #07061a 0%, #0d0b2e 50%, #0a1628 100%)" }}>
      <div className="text-6xl mb-6 animate-float">🌙</div>
      <h1 className="font-display font-bold text-4xl text-white mb-3">Card Not Found</h1>
      <p className="font-body text-white/50 text-lg mb-8 max-w-sm">
        This card may have been removed or the link is incorrect.
      </p>
      <Link href="/" className="btn-primary px-8 py-4 rounded-2xl text-base">
        Back to EidCard
      </Link>
    </div>
  );
}
