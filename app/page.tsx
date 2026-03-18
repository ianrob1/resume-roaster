import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { DonationsFooter } from "@/components/DonationsFooter";

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />
      <Hero />
      <DonationsFooter />
    </main>
  );
}
