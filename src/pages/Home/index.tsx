import { useState } from 'react';
import { Header } from '@/components/home/Header';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { Collection } from '@/components/home/Collection';
import { AboutUs } from '@/components/home/AboutUs';
import { Units } from '@/components/home/Units';
import { ContactFooter } from '@/components/home/ContactFooter';
import { PrivacyPolicyModal } from '@/components/home/PrivacyPolicyModal';

export default function Home() {
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />

      <main>
        <HeroCarousel />
        <Collection />
        <AboutUs />
        <Units />
        <ContactFooter onPrivacyPolicyClick={() => setIsPrivacyPolicyOpen(true)} />
      </main>

      <PrivacyPolicyModal
        isOpen={isPrivacyPolicyOpen}
        onClose={() => setIsPrivacyPolicyOpen(false)}
      />
    </div>
  );
}