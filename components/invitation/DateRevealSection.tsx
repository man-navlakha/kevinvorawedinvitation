"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, Calendar, Clock, MapPin } from "lucide-react";
import confetti from "canvas-confetti";
import {
  DateRevealContent,
  DateRevealStyle,
  WeddingDetails,
} from "@/types/wedding";
import { RichText } from "@/components/ui/RichText";

interface DateRevealSectionProps {
  wedding: WeddingDetails;
  className?: string;
}

const DEFAULT_WEDDING_DATE = "2026-12-04";
const DEFAULT_WEDDING_TIME = "12:00 PM";
const DEFAULT_CARD_IMAGE = "/images/Kevin and Moksha Wedding Invitation.png";
const DEFAULT_BLESSING_IMAGE = "/images/png shree.jpg";

const DEFAULT_CONTENT: DateRevealContent = {
  ganeshLabel: "Shree Ganeshay Namah",
  weddingDayLabel: "Wedding day",
  ceremonyLabel: "Ceremony muhurat",
  venueLabel: "The venue",
  calendarButtonLabel: "Add to Google Calendar",
};

const DEFAULT_STYLE: DateRevealStyle = {
  sectionBackground: "#F7F0E8",
  cardBackground: "#FFF9F1",
  featureBackground: "#6F1027",
  featureText: "#FFF7EB",
  accentColor: "#C49A5B",
  headingColor: "#2F201C",
  bodyColor: "#68615B",
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
    return `rgba(111, 16, 39, ${alpha})`;
  }

  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${
    value & 255
  }, ${alpha})`;
}

function getWeddingDate(dateValue?: string, timeValue?: string) {
  const dateMatch = (dateValue || DEFAULT_WEDDING_DATE).match(
    /^(\d{4})-(\d{2})-(\d{2})/,
  );
  const timeMatch = plainText(timeValue || DEFAULT_WEDDING_TIME).match(
    /(\d{1,2}):(\d{2})\s*(AM|PM)?/i,
  );

  if (!dateMatch) return new Date(2026, 11, 4, 12);

  const [, year, month, day] = dateMatch;
  let hours = timeMatch ? Number(timeMatch[1]) : 12;
  const minutes = timeMatch ? Number(timeMatch[2]) : 0;
  const meridiem = timeMatch?.[3]?.toUpperCase();

  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day), hours, minutes);
  return Number.isNaN(parsedDate.getTime())
    ? new Date(2026, 11, 4, 12)
    : parsedDate;
}

function formatCalendarStamp(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(
    date.getDate(),
  )}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
}

function FloralCorner({
  className = "",
  color,
}: {
  className?: string;
  color: string;
}) {
  return (
    <svg
      viewBox="0 0 180 220"
      fill="none"
      className={className}
      style={{ color }}
      aria-hidden="true"
    >
      <path
        d="M17 216C54 168 64 120 73 73C77 50 91 28 113 10M67 103C44 91 25 94 10 111M64 126C89 111 111 108 135 119M52 158C34 148 18 151 6 168M91 49C115 44 133 51 149 69"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M10 111C22 86 45 84 68 104C48 121 27 122 10 111ZM135 119C126 96 102 95 68 124C95 137 119 132 135 119ZM6 168C19 144 39 143 55 158C41 178 21 180 6 168ZM149 69C139 47 116 43 91 50C103 73 126 81 149 69Z"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx="73" cy="73" r="3" fill="currentColor" />
      <circle cx="52" cy="158" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function DateRevealSection({
  wedding,
  className = "",
}: DateRevealSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const prefersReducedMotion = useReducedMotion();
  const date = useMemo(
    () => getWeddingDate(wedding.weddingDate, wedding.weddingTime),
    [wedding.weddingDate, wedding.weddingTime],
  );
  const [cardImage, setCardImage] = useState(
    wedding.dateRevealImage || DEFAULT_CARD_IMAGE,
  );
  const [blessingImage, setBlessingImage] = useState(
    wedding.dateRevealBlessingImage || DEFAULT_BLESSING_IMAGE,
  );

  useEffect(() => {
    setCardImage(wedding.dateRevealImage || DEFAULT_CARD_IMAGE);
  }, [wedding.dateRevealImage]);

  useEffect(() => {
    setBlessingImage(
      wedding.dateRevealBlessingImage || DEFAULT_BLESSING_IMAGE,
    );
  }, [wedding.dateRevealBlessingImage]);

  const content = { ...DEFAULT_CONTENT, ...wedding.dateRevealContent };
  const style = { ...DEFAULT_STYLE, ...wedding.dateRevealStyle };
  const fullDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const cleanGroom = plainText(wedding.groomName) || "Kevin";
  const cleanBride = plainText(wedding.brideName) || "Moksha";
  const cleanVenue = plainText(wedding.location) || "Kunvarbai Jain Dharmshala";
  const cleanCity = plainText(wedding.city) || "Jamnagar, Gujarat";

  const googleCalendarUrl = useMemo(() => {
    const end = new Date(date.getTime() + 5 * 60 * 60 * 1000);
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `${cleanGroom} & ${cleanBride} Wedding Celebration`,
      dates: `${formatCalendarStamp(date)}/${formatCalendarStamp(end)}`,
      details: `Join us as we celebrate the wedding of ${cleanGroom} and ${cleanBride}.`,
      location: `${cleanVenue}, ${cleanCity}`,
      ctz: "Asia/Kolkata",
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }, [cleanBride, cleanCity, cleanGroom, cleanVenue, date]);

  const triggerCelebration = useCallback(() => {
    if (prefersReducedMotion) return;

    try {
      confetti({
        particleCount: 54,
        spread: 74,
        startVelocity: 25,
        gravity: 0.78,
        scalar: 0.82,
        origin: { x: 0.42, y: 0.58 },
        colors: [
          style.accentColor,
          style.featureText,
          style.featureBackground,
        ],
        disableForReducedMotion: true,
      });
    } catch {
      // The invitation remains usable when the canvas API is unavailable.
    }
  }, [prefersReducedMotion, style.accentColor, style.featureBackground, style.featureText]);

  const motionInitial = prefersReducedMotion
    ? false
    : { opacity: 0, y: 32, scale: 0.985 };
  return (
    <section
      ref={sectionRef}
      id="save-date"
      className={`relative isolate overflow-hidden py-12 sm:py-20 lg:py-24 ${className}`}
      style={{
        backgroundColor: style.sectionBackground,
        color: style.bodyColor,
      }}
    >
      <div className="pointer-events-none absolute inset-0 -z-20 bg-grain opacity-45" />
      <FloralCorner
        className="pointer-events-none absolute -left-12 -top-12 -z-10 h-52 w-44 rotate-[16deg] opacity-35 sm:h-72 sm:w-60"
        color={style.accentColor}
      />
      <FloralCorner
        className="pointer-events-none absolute -bottom-20 -right-16 -z-10 h-56 w-48 scale-x-[-1] rotate-[-8deg] opacity-25 sm:h-72 sm:w-60"
        color={style.accentColor}
      />

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-7">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mb-7 aspect-[1176/346] w-full max-w-[560px] overflow-hidden sm:mb-9"
        >
          <Image
            src={blessingImage}
            alt={plainText(content.ganeshLabel) || "Shree Ganesh blessing"}
            fill
            sizes="(min-width: 640px) 560px, 92vw"
            onError={() => {
              if (blessingImage !== DEFAULT_BLESSING_IMAGE) {
                setBlessingImage(DEFAULT_BLESSING_IMAGE);
              }
            }}
            className="object-contain object-center"
          />
        </motion.div>

        <motion.div
          initial={motionInitial}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : undefined}
          transition={{ duration: 0.9, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[1.75rem] border shadow-[0_30px_90px_-34px_rgba(77,39,29,0.46)] sm:rounded-[2.25rem]"
          style={{
            backgroundColor: style.cardBackground,
            borderColor: colorWithAlpha(style.accentColor, 0.42),
          }}
        >
          <div className="grid md:grid-cols-[0.88fr_1.12fr]">
            <div
              className="relative aspect-[2/3] min-h-[520px] overflow-hidden md:aspect-auto md:min-h-[720px]"
              style={{ backgroundColor: style.featureBackground }}
            >
              <Image
                src={cardImage}
                alt={`${cleanGroom} weds ${cleanBride}, ${fullDate}`}
                fill
                sizes="(min-width: 768px) 44vw, 100vw"
                onError={() => {
                  if (cardImage !== DEFAULT_CARD_IMAGE) {
                    setCardImage(DEFAULT_CARD_IMAGE);
                  }
                }}
                className="object-cover object-center"
              />
              <button
                type="button"
                onClick={triggerCelebration}
                aria-label={`Celebrate ${cleanGroom} and ${cleanBride}'s wedding date`}
                className="absolute inset-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset"
                style={
                  {
                    "--tw-ring-color": style.accentColor,
                  } as React.CSSProperties
                }
              />
            </div>

            <div className="relative flex flex-col justify-center overflow-hidden px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
              <div
                className="pointer-events-none absolute inset-0 opacity-70"
                style={{
                  background: `radial-gradient(circle at 100% 0%, ${colorWithAlpha(
                    style.accentColor,
                    0.13,
                  )}, transparent 38%)`,
                }}
              />
              <FloralCorner
                className="pointer-events-none absolute -left-14 -top-20 h-52 w-44 rotate-[90deg] opacity-[0.14]"
                color={style.accentColor}
              />
              <FloralCorner
                className="pointer-events-none absolute -right-16 -top-20 h-52 w-44 scale-x-[-1] rotate-[-90deg] opacity-[0.14]"
                color={style.accentColor}
              />

              <div className="relative z-10">
                <h2
                  className="text-center font-editorial-serif text-[clamp(3rem,5vw,5rem)] font-medium leading-none tracking-[-0.035em]"
                  style={{ color: style.headingColor }}
                >
                  <RichText content={wedding.saveDateTitle ?? "Save the Date"} />
                </h2>
                <div className="my-5 flex items-center justify-center gap-3" aria-hidden="true">
                  <span
                    className="h-px w-16"
                    style={{ backgroundColor: colorWithAlpha(style.accentColor, 0.65) }}
                  />
                  <span
                    className="h-2.5 w-2.5 rotate-45 border"
                    style={{ borderColor: style.accentColor }}
                  />
                  <span
                    className="h-px w-16"
                    style={{ backgroundColor: colorWithAlpha(style.accentColor, 0.65) }}
                  />
                </div>
                <p
                  className="text-center text-[9px] font-semibold uppercase tracking-[0.34em] sm:text-[10px]"
                  style={{ color: style.bodyColor }}
                >
                  <RichText
                    content={wedding.heroTagline ?? "Two hearts, one beautiful journey"}
                  />
                </p>

                <div className="mt-8 space-y-4">
                  <div
                    className="grid min-h-[112px] grid-cols-[88px_1fr] overflow-hidden rounded-2xl border sm:grid-cols-[108px_1fr]"
                    style={{
                      borderColor: colorWithAlpha(style.accentColor, 0.48),
                      backgroundColor: colorWithAlpha(style.cardBackground, 0.76),
                    }}
                  >
                    <div
                      className="flex items-center justify-center"
                      style={{ backgroundColor: style.featureBackground }}
                    >
                      <div
                        className="flex h-16 w-14 items-center justify-center rounded-t-[2rem] border"
                        style={{
                          color: style.accentColor,
                          borderColor: colorWithAlpha(style.accentColor, 0.72),
                        }}
                      >
                        <Calendar className="h-7 w-7" strokeWidth={1.4} />
                      </div>
                    </div>
                    <div className="flex flex-col justify-center px-5 py-4">
                      <p
                        className="text-[9px] font-semibold uppercase tracking-[0.28em]"
                        style={{ color: style.accentColor }}
                      >
                        <RichText content={content.weddingDayLabel} />
                      </p>
                      <p
                        className="mt-2 font-editorial-serif text-xl leading-tight sm:text-2xl"
                        style={{ color: style.headingColor }}
                      >
                        {fullDate}
                      </p>
                    </div>
                  </div>

                  <div
                    className="grid min-h-[112px] grid-cols-[88px_1fr] overflow-hidden rounded-2xl border sm:grid-cols-[108px_1fr]"
                    style={{
                      borderColor: colorWithAlpha(style.accentColor, 0.48),
                      backgroundColor: colorWithAlpha(style.cardBackground, 0.76),
                    }}
                  >
                    <div
                      className="flex items-center justify-center"
                      style={{ backgroundColor: style.featureBackground }}
                    >
                      <div
                        className="flex h-16 w-14 items-center justify-center rounded-t-[2rem] border"
                        style={{
                          color: style.accentColor,
                          borderColor: colorWithAlpha(style.accentColor, 0.72),
                        }}
                      >
                        <Clock className="h-7 w-7" strokeWidth={1.4} />
                      </div>
                    </div>
                    <div className="flex flex-col justify-center px-5 py-4">
                      <p
                        className="text-[9px] font-semibold uppercase tracking-[0.28em]"
                        style={{ color: style.accentColor }}
                      >
                        <RichText content={content.ceremonyLabel} />
                      </p>
                      <p
                        className="mt-2 font-editorial-serif text-xl leading-tight sm:text-2xl"
                        style={{ color: style.headingColor }}
                      >
                        <RichText
                          content={`${plainText(wedding.weddingTime) || DEFAULT_WEDDING_TIME} onwards`}
                        />
                      </p>
                    </div>
                  </div>

                  <div
                    className="grid min-h-[124px] grid-cols-[88px_1fr] overflow-hidden rounded-2xl border sm:grid-cols-[108px_1fr]"
                    style={{
                      borderColor: colorWithAlpha(style.accentColor, 0.48),
                      backgroundColor: colorWithAlpha(style.cardBackground, 0.76),
                    }}
                  >
                    <div
                      className="flex items-center justify-center"
                      style={{ backgroundColor: style.featureBackground }}
                    >
                      <div
                        className="flex h-16 w-14 items-center justify-center rounded-t-[2rem] border"
                        style={{
                          color: style.accentColor,
                          borderColor: colorWithAlpha(style.accentColor, 0.72),
                        }}
                      >
                        <MapPin className="h-7 w-7" strokeWidth={1.4} />
                      </div>
                    </div>
                    <div className="flex min-w-0 flex-col justify-center px-5 py-4">
                      <p
                        className="text-[9px] font-semibold uppercase tracking-[0.28em]"
                        style={{ color: style.accentColor }}
                      >
                        <RichText content={content.venueLabel} />
                      </p>
                      <p
                        className="mt-2 font-editorial-serif text-xl leading-tight sm:text-2xl"
                        style={{ color: style.headingColor }}
                      >
                        <RichText content={wedding.location || cleanVenue} />
                      </p>
                      <p className="mt-1 text-xs" style={{ color: style.bodyColor }}>
                        <RichText content={wedding.city || cleanCity} />
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href={googleCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={triggerCelebration}
                  className="mt-7 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full px-6 py-3 font-editorial-serif text-lg shadow-[0_14px_30px_-18px_rgba(76,13,31,0.9)] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={
                    {
                      backgroundColor: style.featureBackground,
                      color: style.featureText,
                      "--tw-ring-color": style.accentColor,
                    } as React.CSSProperties
                  }
                >
                  <Calendar
                    className="h-4 w-4"
                    style={{ color: style.accentColor }}
                    strokeWidth={1.7}
                  />
                  <RichText content={content.calendarButtonLabel} />
                  <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
                </a>

                {wedding.hashtag && (
                  <p
                    className="mt-7 text-center font-editorial-serif text-3xl tracking-wide"
                    style={{ color: style.headingColor }}
                  >
                    <RichText content={wedding.hashtag} />
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
