import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/footer";
import { ArrowRight, Heart, Star, Share2, Sparkles, Users, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">EidCard</div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-32 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Share the Joy of{" "}
              <span className="text-primary">Eid</span> with the World
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up">
              Create beautiful, personalized Eid cards in minutes. Choose from 10 stunning
              themes, add your message, and share the happiness with your loved ones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-float">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8">
                  Create Your Card <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/card/demo">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  See Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { icon: Users, title: "Sign Up", desc: "Create your free account in seconds" },
                { icon: Sparkles, title: "Choose Theme", desc: "Pick from 10 beautiful Eid themes" },
                { icon: Heart, title: "Add Message", desc: "Personalize with your own message" },
                { icon: Share2, title: "Share Link", desc: "Share your card with anyone" },
              ].map((item, i) => (
                <div key={i} className="text-center p-6 rounded-lg border bg-card">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Sparkles,
                  title: "10 Beautiful Themes",
                  desc: "Choose from a variety of stunning Eid themes designed with love.",
                },
                {
                  icon: Star,
                  title: "Premium Experience",
                  desc: "Upgrade to premium for unlimited cards and lifetime access.",
                },
                {
                  icon: Shield,
                  title: "Secure & Private",
                  desc: "Your data is safe with us. We never share your information.",
                },
              ].map((item, i) => (
                <div key={i} className="p-6">
                  <div className="w-12 h-12 mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Spread Eid Joy?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of people sharing Eid greetings with their loved ones.
            </p>
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
