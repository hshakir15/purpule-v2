'use client';

import React, { useState, useEffect } from 'react';
import AudioWidget from '@/components/AudioWidget';
import FloralParticles from '@/components/FloralParticles';
import HeroSection from '@/components/HeroSection';
import CoupleSection from '@/components/CoupleSection';
import SaveDateSection from '@/components/SaveDateSection';
import EventsSection from '@/components/EventsSection';
import BlessingsSection from '@/components/BlessingsSection';
import CountdownSection from '@/components/CountdownSection';
import VenueSection from '@/components/VenueSection';
import RsvpSection from '@/components/RsvpSection';
import FooterSection from '@/components/FooterSection';
import SmoothScrollManager from '@/components/SmoothScrollManager';

export default function Home() {
  const [isInvitationOpen, setIsInvitationOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Ensure page always starts from the beginning on refresh
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <>
      {/* Lenis Smooth Scroll Management (Desktop only, strictly native on mobile) */}
      <SmoothScrollManager isUnlocked={isInvitationOpen} />

      {/* FLOATING BOTANICAL PARTICLES (PETALS, BLOSSOMS & LEAVES) */}
      <FloralParticles active={isInvitationOpen} />

      {/* FLOATING AUDIO CONTROLLER */}
      <AudioWidget />

      {/* HERO SECTION: FIRST FRAME VISIBLE, PLAYS ONLY ON USER TOUCH, STOPS ON LAST FRAME */}
      <HeroSection onInvitationOpen={() => setIsInvitationOpen(true)} />

      {/* MAIN CONTENT CONTAINER WITH PINK WATERCOLOR BACKGROUND */}
      <main className="pink-theme-bg text-[#6B3150] relative z-10">
        {/* BRIDE & GROOM SECTION */}
        <CoupleSection />

        {/* SAVE OUR SPECIAL DATE & CALENDAR SECTION */}
        <SaveDateSection />

        {/* WEDDING DETAILS SECTION */}
        <EventsSection />

        {/* BLESSINGS & MOMENTS SECTION (CAROUSEL) */}
        <BlessingsSection />

        {/* COUNTING DOWN CARD SECTION */}
        <CountdownSection />

        {/* VENUE & LOCATION SECTION */}
        <VenueSection />

        {/* RSVP SECTION & CLOSING ELEMENTS */}
        <RsvpSection />

        {/* FOOTER */}
        <FooterSection />
      </main>
    </>
  );
}
