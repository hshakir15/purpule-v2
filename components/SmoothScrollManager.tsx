'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface SmoothScrollManagerProps {
  isUnlocked: boolean;
}

export default function SmoothScrollManager({ isUnlocked }: SmoothScrollManagerProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const isMobileOrTouch = () => {
      return (
        window.innerWidth <= 1024 ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
      );
    };

    const initLenis = () => {
      if (isMobileOrTouch()) {
        if (lenisRef.current) {
          lenisRef.current.destroy();
          lenisRef.current = null;
        }
        document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped', 'lenis-scrolling');
        document.body.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped', 'lenis-scrolling');
        return;
      }

      lenisRef.current = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        syncTouch: false,
        touchMultiplier: 0,
        infinite: false,
      });

      lenisRef.current.on('scroll', () => {
        ScrollTrigger.update();
      });

      gsap.ticker.add((time) => {
        if (lenisRef.current) {
          lenisRef.current.raf(time * 1000);
        }
      });
      gsap.ticker.lagSmoothing(0);

      if (!isUnlocked && lenisRef.current) {
        lenisRef.current.stop();
      }
    };

    initLenis();

    const handleResize = () => {
      if (isMobileOrTouch()) {
        if (lenisRef.current) {
          lenisRef.current.destroy();
          lenisRef.current = null;
          document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped', 'lenis-scrolling');
          document.body.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped', 'lenis-scrolling');
        }
      } else if (!lenisRef.current) {
        initLenis();
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const preventTouchScroll = (e: TouchEvent) => {
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    const preventWheelScroll = (e: WheelEvent) => {
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    const preventKeyScroll = (e: KeyboardEvent) => {
      const scrollKeys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ', 'Spacebar'];
      if (scrollKeys.includes(e.key)) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };

    if (isUnlocked) {
      document.documentElement.classList.remove('scroll-locked');
      document.body.classList.remove('scroll-locked');
      if (lenisRef.current) {
        lenisRef.current.start();
        lenisRef.current.resize();
      }
    } else {
      document.documentElement.classList.add('scroll-locked');
      document.body.classList.add('scroll-locked');
      if (lenisRef.current) {
        lenisRef.current.stop();
      }

      window.addEventListener('touchmove', preventTouchScroll, { passive: false });
      window.addEventListener('wheel', preventWheelScroll, { passive: false });
      window.addEventListener('keydown', preventKeyScroll, { passive: false });

      return () => {
        window.removeEventListener('touchmove', preventTouchScroll);
        window.removeEventListener('wheel', preventWheelScroll);
        window.removeEventListener('keydown', preventKeyScroll);
      };
    }
  }, [isUnlocked]);

  return null;
}
