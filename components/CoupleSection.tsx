'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function CoupleSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    if (!section) return;

    const brideCard = section.querySelector('.bride-card');
    const centerHeart = section.querySelector('.heart-divider-desktop');
    const groomCard = section.querySelector('.groom-card');
    const header = section.querySelector('h2');

    if (header) {
      gsap.fromTo(
        header,
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: 1.05,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: header,
            start: 'top 88%',
            once: true,
          },
        }
      );
    }

    if (brideCard) {
      gsap.fromTo(
        brideCard,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 1.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: brideCard,
            start: 'top 85%',
            once: true,
          },
        }
      );
    }

    if (centerHeart) {
      gsap.fromTo(
        centerHeart,
        { opacity: 0, scale: 0.5 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.85,
          ease: 'back.out(1.8)',
          scrollTrigger: {
            trigger: centerHeart,
            start: 'top 85%',
            once: true,
          },
        }
      );
    }

    if (groomCard) {
      gsap.fromTo(
        groomCard,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 1.15,
          delay: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: groomCard,
            start: 'top 85%',
            once: true,
          },
        }
      );
    }
  }, []);

  return (
    <section ref={sectionRef} id="couple-section" className="relative py-12 sm:py-16 px-4 overflow-hidden">
      {/* Corner Floral Cascades (Top-Left & Top-Right) */}
      <img
        src="/assets/images/corner_floral_left.png?v=11"
        alt="Top Left Floral Decoration"
        className="absolute top-0 left-0 w-28 sm:w-44 md:w-56 lg:w-72 pointer-events-none z-10 select-none opacity-80 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
      />
      <img
        src="/assets/images/corner_floral_right.png?v=11"
        alt="Top Right Floral Decoration"
        className="absolute top-0 right-0 w-28 sm:w-44 md:w-56 lg:w-72 pointer-events-none z-10 select-none opacity-80 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
      />

      <div className="max-w-4xl mx-auto text-[#6B3150] relative z-20">
        {/* Section Header: Bride & Groom */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl text-[#6B3150] font-bold tracking-[0.15em]">
            Bride & Groom
          </h2>

          {/* Decorative Line with White Heart */}
          <div className="flex items-center justify-center gap-3 w-36 sm:w-48 mx-auto mt-2.5 opacity-90">
            <span className="h-[1.5px] bg-[#E5D3A3]/60 flex-1"></span>
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-[0_1px_2px_rgba(180,140,80,0.35)] shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ffffff" stroke="#C9A227" strokeWidth="1" />
            </svg>
            <span className="h-[1.5px] bg-[#E5D3A3]/60 flex-1"></span>
          </div>
        </div>

        {/* Portraits & Details Grid */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-3 sm:gap-6 md:gap-12 relative">
          {/* BRIDE CARD */}
          <div className="bride-card flex flex-col items-center text-center flex-1 max-w-[280px]">
            {/* Circular Portrait with Gold Ring & Floral Accents */}
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56">
              {/* Golden Halo Ring */}
              <div className="absolute inset-0 rounded-full portrait-halo-ring pointer-events-none z-10"></div>
              <div className="w-full h-full rounded-full overflow-hidden p-1.5">
                <img
                  src="/assets/images/bride.jpg"
                  alt="Safina - The Bride"
                  className="w-full h-full object-cover object-center rounded-full scale-105 hover:scale-110 transition-transform duration-700"
                />
              </div>
              {/* Floral Bouquet Ornament (Bottom Left) */}
              <img
                src="/assets/images/floral_left.png?v=9"
                alt="Floral ornament"
                className="absolute bottom-2 -left-2 sm:bottom-3 sm:-left-3 md:bottom-3 md:-left-3 w-24 sm:w-32 md:w-38 pointer-events-none filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.18)] z-20 select-none opacity-80"
              />
            </div>

            {/* Bride Name in Script */}
            <h3 className="couple-script-name text-4xl sm:text-5xl md:text-6xl font-bold mt-4 sm:mt-5 mb-1 tracking-normal">
              Safina
            </h3>

            {/* Bride Parents */}
            <p className="couple-parent-text text-sm sm:text-base md:text-lg font-medium leading-snug">
              D/O Mr. Haneef
              <br />
              & Mrs. Mumtaz
            </p>
          </div>

          {/* MOBILE ONLY: VERTICAL HEART DIVIDER */}
          <div className="flex sm:hidden items-center justify-center my-0.5 select-none pointer-events-none">
            <img
              src="/assets/images/couple_heart_ornament.png?v=9"
              alt="Heart Divider"
              className="w-[65px] h-auto filter drop-shadow-[0_4px_16px_rgba(180,90,105,0.25)]"
            />
          </div>

          {/* DESKTOP ONLY: HORIZONTAL HEART ORNAMENT DIVIDER */}
          <div className="heart-divider-desktop hidden sm:flex items-center justify-center sm:self-start sm:mt-[78px] md:mt-[94px] select-none pointer-events-none px-2 z-20 flex-shrink-0">
            <img
              src="/assets/images/couple_heart_horizontal.png?v=9"
              alt="Couple Heart Divider"
              className="w-[105px] md:w-[115px] h-auto object-contain filter drop-shadow-[0_2px_10px_rgba(180,90,105,0.22)]"
            />
          </div>

          {/* GROOM CARD */}
          <div className="groom-card flex flex-col items-center text-center flex-1 max-w-[280px]">
            {/* Circular Portrait with Gold Ring & Floral Accents */}
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56">
              {/* Golden Halo Ring */}
              <div className="absolute inset-0 rounded-full portrait-halo-ring pointer-events-none z-10"></div>
              <div className="w-full h-full rounded-full overflow-hidden p-1.5">
                <img
                  src="/assets/images/groom.jpg"
                  alt="Ghalib - The Groom"
                  className="w-full h-full object-cover object-top rounded-full scale-105 hover:scale-110 transition-transform duration-700"
                />
              </div>
              {/* Floral Bouquet Ornament (Bottom Right) */}
              <img
                src="/assets/images/floral_right.png?v=9"
                alt="Floral ornament"
                className="absolute bottom-2 -right-2 sm:bottom-3 sm:-right-3 md:bottom-3 md:-right-3 w-24 sm:w-32 md:w-38 pointer-events-none filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.18)] z-20 select-none opacity-80"
              />
            </div>

            {/* Groom Name in Script */}
            <h3 className="couple-script-name text-4xl sm:text-5xl md:text-6xl font-bold mt-4 sm:mt-5 mb-1 tracking-normal">
              Ghalib
            </h3>

            {/* Groom Parents */}
            <p className="couple-parent-text text-sm sm:text-base md:text-lg font-medium leading-snug">
              S/O Mr. Hameed
              <br />
              & Mrs. Shabana
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
