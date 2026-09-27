'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CalendarPlus, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const FLORAL_ASSETS = Array.from({ length: 36 }, (_, i) => `/assets/images/floating_petals/petal_${i + 1}.png`);

export default function SaveDateSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const floralBurstContainerRef = useRef<HTMLDivElement | null>(null);

  const [isScratchComplete, setIsScratchComplete] = useState(false);
  const [isCanvasVisible, setIsCanvasVisible] = useState(true);

  const textContentRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const isRevealedRef = useRef(false);
  const checkProgressThrottleRef = useRef<number>(0);
  const scratchStrokeCountRef = useRef<number>(0);

  // Preload Floral Image Sprites & 3D Gold Hand Icon
  const preloadedImagesRef = useRef<{ [src: string]: HTMLImageElement }>({});
  const handIconRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    FLORAL_ASSETS.forEach((src) => {
      const img = new Image();
      img.src = src;
      preloadedImagesRef.current[src] = img;
    });

    const handImg = new Image();
    handImg.src = '/assets/images/scratch_hand_icon.png';
    handImg.onload = () => {
      handIconRef.current = handImg;
      if (!isRevealedRef.current) {
        drawScratchSurface();
      }
    };
    handIconRef.current = handImg;
  }, []);

  // Trigger Cinematic Physics-Driven Floral Explosion
  const triggerFloralBlast = useCallback(() => {
    const card = cardContainerRef.current;
    if (!card) return;

    const cardRect = card.getBoundingClientRect();
    const originX = cardRect.left + cardRect.width / 2;
    const originY = cardRect.top + cardRect.height / 2;
    const isMobile = window.innerWidth < 640;

    // Card physical celebration punch
    gsap.fromTo(
      card,
      { scale: 0.93 },
      { scale: 1, duration: 0.75, ease: 'back.out(2.8)' }
    );

    // Create full-screen fixed overlay canvas for unobstructed 360° explosion
    const blastCanvas = document.createElement('canvas');
    blastCanvas.style.position = 'fixed';
    blastCanvas.style.top = '0';
    blastCanvas.style.left = '0';
    blastCanvas.style.width = '100vw';
    blastCanvas.style.height = '100vh';
    blastCanvas.style.pointerEvents = 'none';
    blastCanvas.style.zIndex = '99999';
    document.body.appendChild(blastCanvas);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    blastCanvas.width = Math.floor(window.innerWidth * dpr);
    blastCanvas.height = Math.floor(window.innerHeight * dpr);

    const ctx = blastCanvas.getContext('2d');
    if (!ctx) {
      if (blastCanvas.parentNode) blastCanvas.parentNode.removeChild(blastCanvas);
      return;
    }
    ctx.scale(dpr, dpr);

    // Particle Data Structure
    interface BlastParticle {
      type: 'flower' | 'sparkle';
      img?: HTMLImageElement;
      layer: 'foreground' | 'midground' | 'background';
      x: number;
      y: number;
      vx: number;
      vy: number;
      baseWidth: number;
      baseHeight: number;
      scale: number;
      scaleX: number;
      scaleY: number;
      targetScale: number;
      rotation: number;
      rotSpeed: number;
      flipPhase: number;
      flipSpeed: number;
      gravity: number;
      dragX: number;
      dragY: number;
      windFactor: number;
      opacity: number;
      sparkleType?: 'star' | 'dot';
      sparkleSize?: number;
      seed: number;
    }

    const particles: BlastParticle[] = [];

    // Distinct layer sprite mappings with new purple, lilac & blue translucent petals
    const foregroundSprites = [
      '/assets/images/floating_petals/petal_1.png',
      '/assets/images/floating_petals/petal_2.png',
      '/assets/images/floating_petals/petal_6.png',
      '/assets/images/floating_petals/petal_10.png',
      '/assets/images/floating_petals/petal_11.png',
      '/assets/images/floating_petals/petal_17.png',
      '/assets/images/floating_petals/petal_21.png',
      '/assets/images/floating_petals/petal_23.png',
      '/assets/images/floating_petals/petal_28.png',
      '/assets/images/floating_petals/petal_34.png',
    ];
    const midgroundSprites = [
      '/assets/images/floating_petals/petal_3.png',
      '/assets/images/floating_petals/petal_4.png',
      '/assets/images/floating_petals/petal_5.png',
      '/assets/images/floating_petals/petal_7.png',
      '/assets/images/floating_petals/petal_8.png',
      '/assets/images/floating_petals/petal_12.png',
      '/assets/images/floating_petals/petal_13.png',
      '/assets/images/floating_petals/petal_18.png',
      '/assets/images/floating_petals/petal_19.png',
      '/assets/images/floating_petals/petal_20.png',
      '/assets/images/floating_petals/petal_22.png',
      '/assets/images/floating_petals/petal_24.png',
      '/assets/images/floating_petals/petal_29.png',
      '/assets/images/floating_petals/petal_32.png',
      '/assets/images/floating_petals/petal_35.png',
    ];
    const backgroundSprites = [
      '/assets/images/floating_petals/petal_9.png',
      '/assets/images/floating_petals/petal_14.png',
      '/assets/images/floating_petals/petal_15.png',
      '/assets/images/floating_petals/petal_16.png',
      '/assets/images/floating_petals/petal_25.png',
      '/assets/images/floating_petals/petal_26.png',
      '/assets/images/floating_petals/petal_27.png',
      '/assets/images/floating_petals/petal_30.png',
      '/assets/images/floating_petals/petal_31.png',
      '/assets/images/floating_petals/petal_33.png',
      '/assets/images/floating_petals/petal_36.png',
    ];

    const floralCount = isMobile ? 42 : 55;

    // 1. Generate Botanical Elements with Real Physics Properties (Small, Dainty Petals)
    for (let i = 0; i < floralCount; i++) {
      let layer: 'foreground' | 'midground' | 'background';
      let spriteList: string[];
      let baseWidth: number;
      let gravity: number;
      let dragX: number;
      let dragY: number;
      let windFactor: number;
      let vSpeed: number;

      const layerRand = Math.random();
      if (layerRand < 0.28) {
        // FOREGROUND: Small-Medium graceful petals
        layer = 'foreground';
        spriteList = foregroundSprites;
        baseWidth = isMobile ? 14 + Math.random() * 5 : 18 + Math.random() * 6;
        gravity = 280 + Math.random() * 60;
        dragX = 1.9 + Math.random() * 0.3;
        dragY = 1.5 + Math.random() * 0.3;
        windFactor = 0.85 + Math.random() * 0.25;
        vSpeed = isMobile ? 550 + Math.random() * 400 : 700 + Math.random() * 500;
      } else if (layerRand < 0.72) {
        // MIDGROUND: Small delicate fluttering petals
        layer = 'midground';
        spriteList = midgroundSprites;
        baseWidth = isMobile ? 10 + Math.random() * 4 : 13 + Math.random() * 5;
        gravity = 220 + Math.random() * 50;
        dragX = 2.2 + Math.random() * 0.4;
        dragY = 1.8 + Math.random() * 0.3;
        windFactor = 1.15 + Math.random() * 0.35;
        vSpeed = isMobile ? 650 + Math.random() * 500 : 850 + Math.random() * 600;
      } else {
        // BACKGROUND: Tiny lightweight drifting petals
        layer = 'background';
        spriteList = backgroundSprites;
        baseWidth = isMobile ? 7 + Math.random() * 3 : 9 + Math.random() * 4;
        gravity = 150 + Math.random() * 50;
        dragX = 2.6 + Math.random() * 0.4;
        dragY = 2.1 + Math.random() * 0.3;
        windFactor = 1.5 + Math.random() * 0.5;
        vSpeed = isMobile ? 750 + Math.random() * 550 : 950 + Math.random() * 650;
      }

      const spritePath = spriteList[i % spriteList.length];
      const img = preloadedImagesRef.current[spritePath] || new Image();
      if (!img.src) img.src = spritePath;

      // Blast Directional Launch Angle
      // Biased upward (-90°), upper-left (-135°), upper-right (-45°), and sideways
      const angleCategory = Math.random();
      let angleRad: number;
      if (angleCategory < 0.40) {
        // Upward high blast
        angleRad = (-Math.PI / 2) + (Math.random() - 0.5) * 0.85;
      } else if (angleCategory < 0.65) {
        // Upper-Left burst
        angleRad = (-Math.PI * 0.75) + (Math.random() - 0.5) * 0.75;
      } else if (angleCategory < 0.90) {
        // Upper-Right burst (wind will curve them back left!)
        angleRad = (-Math.PI * 0.25) + (Math.random() - 0.5) * 0.75;
      } else {
        // Sideways release
        angleRad = Math.random() < 0.5
          ? (Math.random() - 0.5) * 0.55
          : Math.PI + (Math.random() - 0.5) * 0.55;
      }

      // Initial origin from inside card with natural jitter
      const jitterX = (Math.random() - 0.5) * (cardRect.width * 0.4);
      const jitterY = (Math.random() - 0.5) * (cardRect.height * 0.35);

      const vx = Math.cos(angleRad) * vSpeed;
      const vy = Math.sin(angleRad) * vSpeed;

      particles.push({
        type: 'flower',
        img,
        layer,
        x: originX + jitterX,
        y: originY + jitterY,
        vx,
        vy,
        baseWidth,
        baseHeight: baseWidth,
        scale: 0.2,
        scaleX: 0.2,
        scaleY: 0.2,
        targetScale: 1.0,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 8.0,
        flipPhase: Math.random() * Math.PI * 2,
        flipSpeed: 3.5 + Math.random() * 6.5,
        gravity,
        dragX,
        dragY,
        windFactor,
        opacity: 0,
        seed: Math.random() * 100,
      });
    }

    // 2. Generate Golden Sparkles & Ember Flares
    const sparkCount = isMobile ? 18 : 26;
    for (let j = 0; j < sparkCount; j++) {
      const isStar = j % 2 === 0;
      const angleRad = Math.random() * Math.PI * 2;
      const sparkSpeed = isMobile ? 800 + Math.random() * 800 : 1100 + Math.random() * 1000;

      particles.push({
        type: 'sparkle',
        layer: 'foreground',
        x: originX + (Math.random() - 0.5) * 40,
        y: originY + (Math.random() - 0.5) * 30,
        vx: Math.cos(angleRad) * sparkSpeed,
        vy: Math.sin(angleRad) * sparkSpeed,
        baseWidth: isStar ? (isMobile ? 14 : 18) : (isMobile ? 5 : 7),
        baseHeight: isStar ? (isMobile ? 14 : 18) : (isMobile ? 5 : 7),
        scale: 0.2,
        scaleX: 0.2,
        scaleY: 0.2,
        targetScale: 1.0,
        rotation: 0,
        rotSpeed: (Math.random() - 0.5) * 4.0,
        flipPhase: 0,
        flipSpeed: 0,
        gravity: 85 + Math.random() * 50,
        dragX: 3.8 + Math.random() * 0.8,
        dragY: 3.8 + Math.random() * 0.8,
        windFactor: 1.1,
        opacity: 0,
        sparkleType: isStar ? 'star' : 'dot',
        sparkleSize: isStar ? (isMobile ? 14 : 18) : (isMobile ? 5 : 7),
        seed: Math.random() * 100,
      });
    }

    // Sort particles by layer for 3D depth: background -> midground -> foreground
    particles.sort((a, b) => {
      const order = { background: 0, midground: 1, foreground: 2 };
      return order[a.layer] - order[b.layer];
    });

    // 3. Continuous Physics Simulation Loop (5.0 seconds total)
    const startTime = performance.now();
    let lastTime = startTime;
    let animId: number;

    const animatePhysics = (currentTime: number) => {
      let dt = (currentTime - lastTime) / 1000;
      if (dt > 0.035) dt = 0.035;
      lastTime = currentTime;

      const elapsed = (currentTime - startTime) / 1000;

      // Finish and cleanup at 5.0s
      if (elapsed >= 5.0) {
        cancelAnimationFrame(animId);
        if (blastCanvas.parentNode) {
          blastCanvas.parentNode.removeChild(blastCanvas);
        }
        return;
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Continuous gentle wind airflow from RIGHT -> LEFT (negative X direction)
      const baseWindAcc = -140; // px/s^2 leftward push
      const windHarmonic = Math.sin(elapsed * 2.3) * 48 + Math.cos(elapsed * 4.2) * 22;
      const globalWindAcc = baseWindAcc + windHarmonic;

      // Wind influence gradually takes full command as explosive blast slows down
      const windBlend = Math.min(1.0, Math.max(0.2, elapsed / 0.65));

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Air Resistance (Drag)
        p.vx *= Math.max(0, 1 - p.dragX * dt);
        p.vy *= Math.max(0, 1 - p.dragY * dt);

        // 2. Wind Acceleration (RIGHT -> LEFT)
        p.vx += globalWindAcc * p.windFactor * windBlend * dt;

        // 3. Gravity Acceleration (DOWNWARD)
        p.vy += p.gravity * dt;

        // 4. Update Position
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // 5. Angular Rotation & 3D Tumbling Flutter
        p.rotation += p.rotSpeed * dt;
        p.flipPhase += p.flipSpeed * dt;

        // 6. Scale: rapid explosion in 0.0 - 0.22s
        if (elapsed < 0.22) {
          const t = elapsed / 0.22;
          p.scale = p.targetScale * (0.2 + 0.8 * t);
        } else {
          p.scale = p.targetScale;
        }

        p.scaleX = p.scale * Math.cos(p.flipPhase);
        p.scaleY = p.scale * (0.85 + 0.15 * Math.sin(p.flipPhase * 1.3));

        // 7. Opacity Progression
        if (elapsed < 0.08) {
          p.opacity = elapsed / 0.08;
        } else if (elapsed > 3.4) {
          p.opacity = Math.max(0, 1.0 - (elapsed - 3.4) / 1.6);
        } else {
          p.opacity = 1.0;
        }

        // Draw particle
        if (p.opacity <= 0) continue;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(p.scaleX, p.scaleY);

        if (p.type === 'flower' && p.img) {
          if (p.layer === 'foreground') {
            ctx.shadowColor = 'rgba(180, 140, 80, 0.38)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 4;
          } else if (p.layer === 'midground') {
            ctx.shadowColor = 'rgba(180, 140, 80, 0.22)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetY = 2;
          }

          const w = p.baseWidth;
          const h = p.baseHeight;
          try {
            ctx.drawImage(p.img, -w / 2, -h / 2, w, h);
          } catch (e) {}
        } else if (p.type === 'sparkle') {
          ctx.shadowColor = 'rgba(212, 175, 55, 0.95)';
          ctx.shadowBlur = 12;

          if (p.sparkleType === 'star') {
            ctx.fillStyle = '#C9A227';
            ctx.font = `bold ${Math.round(p.sparkleSize || 16)}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✦', 0, 0);
          } else {
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(0, 0, (p.sparkleSize || 4) / 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(animatePhysics);
    };

    animId = requestAnimationFrame(animatePhysics);
  }, []);

  // Complete Reveal & Clean Inside Text Transition (Zero Previous Text Ghosting)
  const completeReveal = useCallback(() => {
    if (isRevealedRef.current) return;
    isRevealedRef.current = true;
    setIsScratchComplete(true);

    const canvas = canvasRef.current;
    if (canvas) {
      // Immediately clear the scratch canvas surface to completely eliminate previous foil text
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      setIsCanvasVisible(false);
    }

    // Graceful slower unveiling of inside date and blessing text
    const textContainer = textContentRef.current;
    if (textContainer) {
      gsap.fromTo(
        textContainer.children,
        { opacity: 0, y: 14, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.3,
          stagger: 0.12,
          ease: 'power2.out',
        }
      );
    }

    triggerFloralBlast();
  }, [triggerFloralBlast]);

  // Measure Cleared Percentage
  const checkScratchPercentage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealedRef.current) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    if (w === 0 || h === 0) return;

    // Fast sampling grid: 12x8 = 96 points
    const cols = 12;
    const rows = 8;
    let clearedPoints = 0;
    const totalPoints = cols * rows;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const x = Math.floor((c + 0.5) * (w / cols));
        const y = Math.floor((r + 0.5) * (h / rows));
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        if (pixel[3] < 128) {
          clearedPoints++;
        }
      }
    }

    const percentage = (clearedPoints / totalPoints) * 100;
    const isMobile = window.innerWidth < 640;
    const requiredPercentage = isMobile ? 58 : 52;
    const requiredStrokes = isMobile ? 60 : 45;

    // Perfectly balanced scratch pacing
    if (percentage >= requiredPercentage || (percentage >= (isMobile ? 42 : 35) && scratchStrokeCountRef.current > requiredStrokes)) {
      completeReveal();
    }
  }, [completeReveal]);

  // Render Scratch Surface Canvas
  const drawScratchSurface = useCallback(() => {
    const canvas = canvasRef.current;
    const card = cardContainerRef.current;
    if (!canvas || !card || isRevealedRef.current) return;

    const rect = card.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Direct pixel coordinate dimensions
    const w = canvas.width;
    const h = canvas.height;

    // 1. Warm Alabaster & Champagne Gold Luxury Base Gradient
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#fdfaf5');
    gradient.addColorStop(0.5, '#f8eee2');
    gradient.addColorStop(1, '#f3e4d4');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // 2. Subtle Micro Gold Fleck Texture
    ctx.fillStyle = 'rgba(212, 175, 55, 0.09)';
    for (let i = 0; i < 220; i++) {
      const rx = (Math.sin(i * 997) * 0.5 + 0.5) * w;
      const ry = (Math.cos(i * 641) * 0.5 + 0.5) * h;
      const rSize = ((Math.sin(i * 133) * 0.5 + 0.5) * 2.2 + 0.8) * dpr;
      ctx.beginPath();
      ctx.arc(rx, ry, rSize, 0, Math.PI * 2);
      ctx.fill();
    }    // 3. Scratch Cue Typography, Touch Icon & Star Divider (Matching Reference Design)
    const centerX = w / 2;
    const centerY = h / 2;

    // Top Star with Horizontal Flourish Lines: "—— ✦ ——"
    const starY = centerY - 38 * dpr;
    const lineLength = 30 * dpr;
    const gap = 13 * dpr;

    ctx.beginPath();
    ctx.moveTo(centerX - gap - lineLength, starY);
    ctx.lineTo(centerX - gap, starY);
    ctx.strokeStyle = 'rgba(201, 162, 39, 0.45)';
    ctx.lineWidth = 1 * dpr;
    ctx.stroke();

    ctx.fillStyle = '#C9A227';
    ctx.font = `${Math.round(15 * dpr)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦', centerX, starY);

    ctx.beginPath();
    ctx.moveTo(centerX + gap, starY);
    ctx.lineTo(centerX + gap + lineLength, starY);
    ctx.stroke();

    // Main Hint: "SCRATCH TO REVEAL"
    ctx.fillStyle = '#6B3150';
    ctx.font = `bold ${Math.round(14 * dpr)}px "Cinzel", serif`;
    ctx.letterSpacing = `${0.22 * dpr}em`;
    ctx.fillText('SCRATCH TO REVEAL', centerX, centerY - 14 * dpr);

    // 3D Metallic Gold Hand Icon with Tap Ripple Circles
    const iconY = centerY + 14 * dpr;
    const handImg = handIconRef.current;
    const iconSize = 46 * dpr;

    if (handImg && handImg.complete && handImg.naturalWidth > 0) {
      const aspect = handImg.naturalHeight / handImg.naturalWidth;
      const imgW = iconSize;
      const imgH = iconSize * aspect;
      ctx.drawImage(handImg, centerX - imgW / 2, iconY - imgH / 2 - 2 * dpr, imgW, imgH);
    } else {
      // Vector fallback while loading
      ctx.save();
      ctx.translate(centerX - 1.5 * dpr, iconY);
      const iconScale = dpr * 1.15;
      ctx.scale(iconScale, iconScale);
      ctx.strokeStyle = '#C9A227';
      ctx.lineWidth = 1.3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.arc(0, -12, 5.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#C9A227';
      ctx.beginPath();
      ctx.arc(0, -12, 1.6, 0, Math.PI * 2);
      ctx.fill();

      const handPath = new Path2D(
        'M 0 -11 C -1.8 -11 -3 -9.8 -3 -8 L -3 0.5 C -4 -0.2 -5.5 -0.5 -6.8 0.5 C -8.2 1.6 -8.2 3.8 -7 5.5 L -3.8 10 C -2.2 12.5 0.2 14 3 14 L 5.5 14 C 8.2 14 10.5 12.2 11 9.5 L 11.8 5 C 12 4 11.2 3 10.2 3 C 9.2 3 8.8 3.8 8.8 4.5 L 8.8 2.5 C 8.8 1.5 8 0.8 7 0.8 C 6.3 0.8 5.8 1.2 5.6 1.8 L 5.6 0 C 5.6 -1 4.8 -1.8 3.8 -1.8 C 3 -1.8 2.5 -1.3 2.3 -0.7 L 2.3 -8 C 2.3 -9.8 1.8 -11 0 -11 Z'
      );
      ctx.stroke(handPath);
      ctx.restore();
    }

    // Sub-Hint: "Save Our Special Date"
    ctx.fillStyle = '#C9A227';
    ctx.font = `italic ${Math.round(15 * dpr)}px "Cormorant Garamond", Georgia, serif`;
    ctx.letterSpacing = `${0.04 * dpr}em`;
    ctx.fillText('Save Our Special Date', centerX, centerY + 46 * dpr);

    ctx.globalCompositeOperation = 'source-over';
  }, []);

  // Initialize Canvas & Resize Listeners
  useEffect(() => {
    drawScratchSurface();

    const handleResize = () => {
      if (!isRevealedRef.current) {
        drawScratchSurface();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawScratchSurface]);

  // Robust Coordinate Calculation & Scratch Erasing
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const eraseStroke = (x1: number, y1: number, x2: number, y2: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = canvas.width / rect.width;
    // Balanced scratch brush radius (23px mobile / 30px desktop)
    const baseRadius = window.innerWidth < 640 ? 23 : 30;
    const brushRadius = baseRadius * dpr;

    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = brushRadius * 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Solid circle at current point
    ctx.beginPath();
    ctx.arc(x2, y2, brushRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // Pointer Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isRevealedRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}

    isDrawingRef.current = true;
    const pt = getCanvasCoords(e);
    lastPointRef.current = pt;

    // Instant circular erase at touch point
    eraseStroke(pt.x, pt.y, pt.x, pt.y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || isRevealedRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas || !lastPointRef.current) return;

    const pt = getCanvasCoords(e);
    eraseStroke(lastPointRef.current.x, lastPointRef.current.y, pt.x, pt.y);
    lastPointRef.current = pt;
    scratchStrokeCountRef.current++;

    // Throttle progress sampling (~75ms)
    const now = Date.now();
    if (now - checkProgressThrottleRef.current > 75) {
      checkProgressThrottleRef.current = now;
      checkScratchPercentage();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch (err) {}
    checkScratchPercentage();
  };

  // Calendar Integration Helpers
  const isAppleDevice = () => {
    if (typeof navigator === 'undefined') return false;
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
    const platform = navigator.platform || '';
    const maxTouchPoints = navigator.maxTouchPoints || 0;

    const isIOS = /iPad|iPhone|iPod/.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1);
    const isMac = /Macintosh|MacIntel|MacPPC|Mac68K/.test(platform) || /Mac OS X/.test(userAgent);

    return isIOS || isMac;
  };

  const handleAddToCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAppleDevice()) {
      downloadICS();
    } else {
      addToGoogleCalendar();
    }
  };

  const addToGoogleCalendar = () => {
    const title = encodeURIComponent('Safina & Ghalib — Nikah Ceremony');
    const details = encodeURIComponent(
      'Join us in celebrating the holy Nikah union of Safina & Ghalib at Royal Heritage Palace.'
    );
    const location = encodeURIComponent('Royal Heritage Palace, Lake Palace Road, Udaipur, Rajasthan');
    const dates = '20261212T053000Z/20261212T160000Z';

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
    window.open(googleCalendarUrl, '_blank');
  };

  const downloadICS = () => {
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Safina & Ghalib Wedding//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:safina-ghalib-nikah-20261212@weddinginvitation',
      'DTSTAMP:20261212T000000Z',
      'SUMMARY:Safina & Ghalib — Nikah Ceremony',
      'DESCRIPTION:Join us for the holy Nikah ceremony of Safina & Ghalib at Royal Heritage Palace.',
      'LOCATION:Royal Heritage Palace, Lake Palace Road, Udaipur, Rajasthan',
      'DTSTART:20261212T053000Z',
      'DTEND:20261212T160000Z',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'Safina-Ghalib-Nikah.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      try {
        window.URL.revokeObjectURL(link.href);
      } catch (e) {}
    }, 1500);
  };

  return (
    <section ref={sectionRef} id="save-date-section" className="relative py-12 sm:py-16 px-4">
      <div className="w-[91%] max-w-[480px] mx-auto relative">
        {/* FLORAL CELEBRATION BURST CONTAINER */}
        <div
          ref={floralBurstContainerRef}
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none z-50 overflow-visible"
        ></div>

        {/* SCRATCH CARD CONTAINER */}
        <div
          ref={cardContainerRef}
          className="wedding-card relative px-5 py-7 sm:px-8 sm:py-9 text-center overflow-hidden rounded-[28px] sm:rounded-[34px] border border-[#e5daf0] shadow-[0_16px_50px_rgba(110,60,160,0.08)] select-none"
        >
          {/* UNDERLYING WEDDING DATE CONTENT */}
          <div ref={textContentRef} className="relative z-[5] space-y-3">
            <span className="text-[#C9A227] font-script text-2xl sm:text-4xl block mb-1">
              Save Our Special Date
            </span>
            <h2 className="font-cinzel text-xl sm:text-2xl md:text-3xl text-[#6B3150] uppercase tracking-[0.18em] font-bold mb-2">
              December 12, 2026
            </h2>

            {/* Barakallahu Lakuma & Blessing Text */}
            <div className="max-w-sm mx-auto pt-1 pb-2 space-y-1.5">
              <div className="flex items-center justify-center gap-2 w-24 sm:w-28 mx-auto mb-1.5 opacity-80">
                <span className="h-[1px] bg-[#E5D3A3] flex-1"></span>
                <span className="text-[#C9A227] text-[8px]">❖</span>
                <span className="h-[1px] bg-[#E5D3A3] flex-1"></span>
              </div>
              <p className="font-serif italic text-base sm:text-lg text-[#6B3150]">
                Barakallahu Lakuma
              </p>
              <p className="font-sans text-[12.5px] sm:text-[13px] text-[#6B3150] leading-relaxed max-w-xs mx-auto">
                May Allah bless you, and shower His blessings upon you, and unite you both in goodness.
              </p>
            </div>

            {/* Add to Calendar Button (Auto-detects Apple / Google Calendar) */}
            <div className="pt-2 flex items-center justify-center">
              <button
                onClick={handleAddToCalendar}
                className="inline-flex items-center gap-2 px-6 py-2.5 sm:px-7 sm:py-3 rounded-full bg-white/90 border border-[#C9A227]/50 text-[#6B3150] font-sans text-xs sm:text-[13px] tracking-wider uppercase font-semibold hover:bg-[#C9A227] hover:text-white active:scale-95 transition-all shadow-md cursor-pointer"
              >
                <CalendarPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C9A227]" />
                Add to Calendar
              </button>
            </div>
          </div>

          {/* OVERLAY SCRATCH CANVAS */}
          {isCanvasVisible && (
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="absolute inset-0 w-full h-full rounded-[28px] sm:rounded-[34px] z-20 cursor-grab active:cursor-grabbing touch-none transition-opacity duration-300"
              style={{ touchAction: 'none' }}
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    </section>
  );
}
