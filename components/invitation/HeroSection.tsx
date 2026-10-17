"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { HeroStyle, WeddingDetails } from "@/types/wedding";
import { RichText } from "@/components/ui/RichText";

interface HeroSectionProps {
  wedding: WeddingDetails;
}

const LOCAL_HERO_IMAGE = "/images/hero-wedding.jpg";
const DEFAULT_HERO_STYLE: HeroStyle = {
  backgroundColor: "#17130F",
  overlayColor: "#120C08",
  textColor: "#FFF9F0",
  accentColor: "#C99B4E",
  paperColor: "#F7F0E8",
  paperHeadingColor: "#4A2926",
  paperTextColor: "#68615B",
  botanicalColor: "#C49A52",
};

function plainText(value?: string) {
  return (value || "").replace(/<[^>]*>/g, "").trim();
}

function colorWithAlpha(color: string, alpha: number) {
  const normalized = color.replace("#", "");
  const fullHex =
    normalized.length === 3
      ? normalized
        .split("")
        .map((character) => `${character}${character}`)
        .join("")
      : normalized;
  const value = Number.parseInt(fullHex, 16);

  if (!Number.isFinite(value) || fullHex.length !== 6) {
    return `rgba(18, 12, 8, ${alpha})`;
  }

  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255
    }, ${alpha})`;
}

function formatWeddingDate(value?: string) {
  const [year, month, day] = (value || "2026-12-18")
    .split("-")
    .map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1, 12);

  if (Number.isNaN(date.getTime())) {
    return {
      hero: "DEC 18, 2026",
      full: "18 DECEMBER 2026",
    };
  }

  return {
    hero: date
      .toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      .toUpperCase(),
    full: date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
      .toUpperCase(),
  };
}

function CornerBotanical({
  className = "",
  style,
}: Pick<React.SVGProps<SVGSVGElement>, "className" | "style">) {
  return (
    <svg
      viewBox="0 0 170 180"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M13 177C41 137 56 101 61 63C63 43 70 27 86 10M58 84C42 72 29 69 14 76M56 102C76 89 91 84 111 87M49 123C31 116 20 118 7 130M42 143C59 132 72 128 88 131"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M15 75C22 59 37 58 54 78C38 86 25 84 15 75ZM110 87C105 70 90 67 63 91C82 100 98 97 110 87ZM7 130C16 112 32 109 48 126C34 140 19 140 7 130ZM88 131C82 116 68 113 44 141C62 147 77 143 88 131ZM86 10C104 17 107 32 91 50C77 39 76 24 86 10Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle cx="61" cy="63" r="3" fill="currentColor" />
      <circle cx="49" cy="123" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function HeroSection({ wedding }: HeroSectionProps) {
  const heroRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [heroImageSrc, setHeroImageSrc] = useState(
    wedding.heroImage || LOCAL_HERO_IMAGE,
  );
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const contentY = useTransform(scrollYProgress, [0, 0.72], [0, 48]);
  const contentOpacity = useTransform(
    scrollYProgress,
    [0, 0.56, 0.82],
    [1, 1, 0],
  );

  useEffect(() => {
    setHeroImageSrc(wedding.heroImage || LOCAL_HERO_IMAGE);
  }, [wedding.heroImage]);

  const date = useMemo(
    () => formatWeddingDate(wedding.weddingDate),
    [wedding.weddingDate],
  );
  const couple = `${plainText(wedding.groomName)} and ${plainText(
    wedding.brideName,
  )}`;
  const place = plainText(wedding.city) || plainText(wedding.location);
  const heroStyle = { ...DEFAULT_HERO_STYLE, ...wedding.heroStyle };
  const darkOverlay = heroStyle.overlayColor;

  return (
    <section
      ref={heroRef}
      id="hero"
      aria-label={`Wedding invitation for ${couple}`}
      className="relative isolate overflow-hidden"
      style={{ backgroundColor: heroStyle.paperColor }}
    >
      <div
        className="relative h-[72svh] min-h-[500px] max-h-[760px] overflow-hidden lg:h-[100svh] lg:min-h-[720px] lg:max-h-none"
        style={{
          backgroundColor: heroStyle.backgroundColor,
          color: heroStyle.textColor,
        }}
      >
        <motion.div
          aria-hidden="true"
          className="absolute -inset-16 hidden scale-110 opacity-55 blur-2xl lg:block"
          style={prefersReducedMotion ? undefined : { y: imageY }}
        >
          <Image
            src={heroImageSrc}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center brightness-[0.42] saturate-[0.62] sepia-[0.12]"
          />
        </motion.div>

        <div className="absolute inset-0 lg:bottom-14">
          <Image
            src={heroImageSrc}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 67vw, 100vw"
            onError={() => {
              if (heroImageSrc !== LOCAL_HERO_IMAGE) {
                setHeroImageSrc(LOCAL_HERO_IMAGE);
              }
            }}
            className="scale-[1.035] object-cover object-[50%_54%] brightness-[0.56] saturate-[0.72] sepia-[0.12] lg:scale-100 lg:object-contain lg:object-center"
          />
        </div>

        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${colorWithAlpha(
                darkOverlay,
                0.58,
              )} 0%, ${colorWithAlpha(darkOverlay, 0.13)} 34%, ${colorWithAlpha(
                darkOverlay,
                0.28,
              )} 66%, ${colorWithAlpha(darkOverlay, 0.78)} 100%)`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, transparent 28%, ${colorWithAlpha(
                darkOverlay,
                0.52,
              )} 100%)`,
            }}
          />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-grain opacity-20" />

        <CornerBotanical
          className="pointer-events-none absolute -bottom-1 -left-3 z-[2] h-36 w-36 rotate-[4deg] opacity-70 sm:h-48 sm:w-48"
          style={{ color: heroStyle.botanicalColor }}
        />
        <CornerBotanical
          className="pointer-events-none absolute -bottom-1 -right-3 z-[2] h-36 w-36 scale-x-[-1] rotate-[-4deg] opacity-70 sm:h-48 sm:w-48"
          style={{ color: heroStyle.botanicalColor }}
        />

        <motion.div
          className="relative z-10 mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-6 pb-20 pt-12 text-center sm:pb-24"
          style={
            prefersReducedMotion
              ? undefined
              : { y: contentY, opacity: contentOpacity }
          }
          initial={prefersReducedMotion ? false : "hidden"}
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.13, delayChildren: 0.12 },
            },
          }}
        >
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 14 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4 text-[9px] font-semibold uppercase tracking-[0.48em] sm:text-[11px]"
            style={{ color: heroStyle.textColor }}
          >
            <RichText content={wedding.heroEyebrow ?? "The Wedding of"} />
          </motion.p>

          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 22 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center font-editorial-serif font-light leading-[0.82] tracking-[-0.035em]"
            style={{
              color: heroStyle.textColor,
              filter: `drop-shadow(0 3px 18px ${colorWithAlpha(
                heroStyle.overlayColor,
                0.58,
              )})`,
            }}
          >
            <RichText
              content={wedding.groomName}
              className="text-[clamp(3.8rem,11vw,7.6rem)]"
            />
            <span
              className="my-2 font-editorial-serif text-[clamp(2.5rem,7vw,4.8rem)] font-light italic leading-none"
              style={{ color: heroStyle.accentColor }}
            >
              &amp;
            </span>
            <RichText
              content={wedding.brideName}
              className="text-[clamp(3.8rem,11vw,7.6rem)]"
            />
          </motion.h1>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 14 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 space-y-2 text-[9px] font-semibold uppercase tracking-[0.38em] sm:text-[11px]"
            style={{ color: heroStyle.textColor }}
          >
            <p>{date.hero}</p>
            {place && <p>{place}</p>}
          </motion.div>

          <motion.a
            href="#hero-date"
            aria-label="Scroll to the wedding date"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
            }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute bottom-12 flex min-h-12 min-w-20 flex-col items-center justify-center gap-1 outline-none transition-opacity hover:opacity-75 focus-visible:rounded-sm focus-visible:ring-2 sm:bottom-14"
            style={
              {
                color: heroStyle.textColor,
                "--tw-ring-color": heroStyle.accentColor,
              } as React.CSSProperties
            }
          >
            <span className="text-[9px] font-semibold uppercase tracking-[0.35em]">
              <RichText content={wedding.heroScrollLabel ?? "Scroll"} />
            </span>
            <motion.svg
              viewBox="0 0 20 12"
              className="h-3 w-5"
              fill="none"
              aria-hidden="true"
              animate={prefersReducedMotion ? undefined : { y: [0, 4, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: [0.76, 0, 0.24, 1],
              }}
            >
              <path
                d="m3 3.5 7 6 7-6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </motion.a>
        </motion.div>

        <svg
          viewBox="0 0 100 12"
          preserveAspectRatio="none"
          className="pointer-events-none absolute -bottom-px left-0 z-[3] h-10 w-full sm:h-14"
          style={{ color: heroStyle.paperColor }}
          aria-hidden="true"
        >
          <path d="M0 2.5Q50 11.5 100 2.5V12H0Z" fill="currentColor" />
          <path
            d="M0 2.5Q50 11.5 100 2.5"
            fill="none"
            stroke={colorWithAlpha(heroStyle.accentColor, 0.5)}
            strokeWidth="0.25"
          />
        </svg>
      </div>
    </section>
  );
}
