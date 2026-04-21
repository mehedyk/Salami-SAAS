import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Github, Mail, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-primary">EidCard</Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">About Us</h1>

        <div className="prose prose-lg max-w-none">
          <section className="text-center mb-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-5xl">🕌</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              At EidCard, our mission is to spread the joy and blessings of Eid to every corner of the world. 
              We believe that technology should bring people closer, making it easier to share heartfelt 
              greetings with loved ones during the most sacred times.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-center">Meet the Developer</h2>
            <div className="bg-card rounded-lg border p-8 text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-5xl">👨‍💻</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">S.M. Mehedy Kawser</h3>
              <p className="text-muted-foreground mb-4">Software Engineer & Founder</p>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                A passionate software engineering student dedicated to building impactful solutions. 
                With a focus on problem-solving and automation, Mehedy created EidCard to help people 
                share the joy of Eid with modern technology.
              </p>
              <div className="flex justify-center gap-4">
                <a
                  href="https://github.com/mehedyk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Github className="w-5 h-5" />
                  GitHub Profile
                </a>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-center">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card rounded-lg border p-6 text-center">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="font-bold mb-2">10 Beautiful Themes</h3>
                <p className="text-sm text-muted-foreground">
                  Choose from a variety of stunning Eid-themed designs
                </p>
              </div>
              <div className="bg-card rounded-lg border p-6 text-center">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="font-bold mb-2">Shareable Links</h3>
                <p className="text-sm text-muted-foreground">
                  Generate unique links to share with anyone
                </p>
              </div>
              <div className="bg-card rounded-lg border p-6 text-center">
                <div className="text-4xl mb-4">🎵</div>
                <h3 className="font-bold mb-2">Audio Options</h3>
                <p className="text-sm text-muted-foreground">
                  Add background music to your Eid cards
                </p>
              </div>
            </div>
          </section>

          <section className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🤝</span>
                <div>
                  <h3 className="font-bold">Community First</h3>
                  <p className="text-sm text-muted-foreground">
                    Built for the Muslim community worldwide
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <h3 className="font-bold">Privacy & Security</h3>
                  <p className="text-sm text-muted-foreground">
                    Your data is always protected
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <h3 className="font-bold">Quality Design</h3>
                  <p className="text-sm text-muted-foreground">
                    Beautiful cards crafted with care
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🌍</span>
                <div>
                  <h3 className="font-bold">Accessibility</h3>
                  <p className="text-sm text-muted-foreground">
                    Free and easy to use for everyone
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="text-center bg-primary/5 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
            <p className="text-muted-foreground mb-6">
              Have questions, suggestions, or feedback? We&apos;d love to hear from you!
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="https://github.com/mehedyk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Github className="w-5 h-5" />
                GitHub
              </a>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
