"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, MapPin } from "lucide-react";
import {
  EventsSectionContent,
  EventsSectionStyle,
  WeddingEvent,
} from "@/types/wedding";
import { RichText } from "@/components/ui/RichText";

interface EventsSectionProps {
  events: WeddingEvent[];
  content?: EventsSectionContent;
  style?: EventsSectionStyle;
}

const defaultContent: EventsSectionContent = {
  eyebrow: "With love and blessings",
  title: "Wedding Events",
  description: "Join us for the celebrations leading to our forever.",
};

const defaultStyle: EventsSectionStyle = {
  backgroundColor: "#FBF4EA",
  cardBackground: "#FFF9F2",
  headingColor: "#4A2226",
  bodyColor: "#6B625A",
  accentColor: "#8A3441",
  lineColor: "#C99A58",
  borderColor: "#EBDCC9",
};

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return `rgba(201, 154, 88, ${alpha})`;
  const value = Number.parseInt(normalized, 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
}

function stripMarkup(value: string) {
  return value.replace(/<[^>]*>/g, "");
}

function getEventImage(evt: WeddingEvent): string {
  if (evt.image && evt.image.trim()) return evt.image;
  const name = (evt.name || "").toLowerCase();
  if (name.includes("haldi")) return "/images/events/haldi.jpg";
  if (name.includes("mehendi") || name.includes("mehndi")) return "/images/events/mehendi.jpg";
  if (name.includes("sangeet") || name.includes("garba") || name.includes("dance")) return "/images/events/sangeet.jpg";
  if (name.includes("phera") || name.includes("wedding") || name.includes("shaadi") || name.includes("mandap")) return "/images/events/pheras.jpg";
  if (name.includes("reception") || name.includes("dinner")) return "/images/events/reception.jpg";
  return "/images/events/haldi.jpg";
}

function EventsFloral({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 150 220" className="pointer-events-none absolute left-0 top-16 h-48 w-32 opacity-20 sm:h-56 sm:w-40" fill="none" aria-hidden="true">
      <g stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2">
        <path d="M4 211C54 172 74 115 69 39M35 187c39-24 68-59 88-107" />
        <path d="M37 169C16 160 7 145 9 130c20 4 31 17 28 39ZM57 136c-19-12-25-28-19-43 18 8 26 23 19 43ZM69 97C54 83 52 67 60 54c15 11 19 26 9 43ZM78 144c6-20 18-31 34-32-1 18-12 29-34 32ZM101 111c7-18 19-27 34-26-3 16-14 26-34 26Z" fill={hexToRgba(color, 0.06)} />
        <g transform="translate(49 42)">
          <ellipse cx="0" cy="-16" rx="10" ry="19" />
          <ellipse cx="0" cy="-16" rx="10" ry="19" transform="rotate(72)" />
          <ellipse cx="0" cy="-16" rx="10" ry="19" transform="rotate(144)" />
          <ellipse cx="0" cy="-16" rx="10" ry="19" transform="rotate(216)" />
          <ellipse cx="0" cy="-16" rx="10" ry="19" transform="rotate(288)" />
          <circle r="5" fill={hexToRgba(color, 0.12)} />
        </g>
      </g>
    </svg>
  );
}

export function EventsSection({ events, content, style }: EventsSectionProps) {
  const sortedEvents = [...events].sort((a, b) => a.order - b.order);
  const sectionContent = { ...defaultContent, ...(content || {}) };
  const sectionStyle = { ...defaultStyle, ...(style || {}) };

  return (
    <section
      id="events"
      className="relative overflow-hidden border-t py-20 sm:py-28"
      style={{
        backgroundColor: sectionStyle.backgroundColor,
        color: sectionStyle.bodyColor,
        borderColor: hexToRgba(sectionStyle.borderColor, 0.75),
      }}
    >
      <EventsFloral color={sectionStyle.accentColor} />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-8">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-70px" }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mb-12 max-w-2xl text-center sm:mb-16"
        >
          <p className="text-[10px] font-medium tracking-[0.26em] sm:text-xs" style={{ color: sectionStyle.bodyColor }}>
            <RichText content={sectionContent.eyebrow} />
          </p>
          <h2 className="mt-5 font-editorial-serif text-4xl font-normal sm:text-6xl" style={{ color: sectionStyle.headingColor }}>
            <RichText content={sectionContent.title} />
          </h2>
          <div className="mt-4 flex items-center justify-center gap-3" aria-hidden="true">
            <span className="h-px w-14 sm:w-20" style={{ backgroundColor: hexToRgba(sectionStyle.lineColor, 0.72) }} />
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" style={{ color: sectionStyle.accentColor }}>
              <path d="M12 3c1.5 3.4 3.2 5.1 5.8 6.4-2.5.6-4.4 1.8-5.8 4-1.4-2.2-3.3-3.4-5.8-4C8.8 8.1 10.5 6.4 12 3Z" fill="currentColor" opacity=".72" />
              <path d="M4 11.5c2.9.3 5.5 1.7 8 4.6 2.5-2.9 5.1-4.3 8-4.6-1.1 4.5-3.8 7.4-8 9.5-4.2-2.1-6.9-5-8-9.5Z" stroke="currentColor" strokeWidth="1" />
            </svg>
            <span className="h-px w-14 sm:w-20" style={{ backgroundColor: hexToRgba(sectionStyle.lineColor, 0.72) }} />
          </div>
          {sectionContent.description && (
            <p className="mx-auto mt-4 max-w-lg text-sm font-light leading-relaxed sm:text-base" style={{ color: sectionStyle.bodyColor }}>
              <RichText content={sectionContent.description} />
            </p>
          )}
        </motion.header>

        <div className="relative mx-auto max-w-4xl pl-8 sm:pl-12">
          <div
            className="pointer-events-none absolute bottom-4 left-[10px] top-4 w-px sm:left-[18px]"
            style={{ backgroundColor: hexToRgba(sectionStyle.lineColor, 0.72) }}
            aria-hidden="true"
          />

          <div className="space-y-4 sm:space-y-5">
            {sortedEvents.map((evt, index) => {
              const eventImage = getEventImage(evt);
              const cardContents = (
                <>
                  <div className="relative min-h-[7.25rem] overflow-hidden sm:min-h-36" style={{ backgroundColor: hexToRgba(sectionStyle.borderColor, 0.45) }}>
                    <Image
                      src={eventImage}
                      alt={stripMarkup(evt.name)}
                      fill
                      sizes="(max-width: 640px) 96px, 176px"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                    />
                  </div>

                  <div className="min-w-0 self-center px-4 py-4 sm:px-6">
                    <h3 className="truncate font-editorial-serif text-xl leading-tight sm:text-3xl" style={{ color: sectionStyle.headingColor }}>
                      <RichText content={evt.name} />
                    </h3>
                    <div className="mt-2.5 flex min-w-0 items-center gap-2 text-[11px] sm:text-sm" style={{ color: sectionStyle.bodyColor }}>
                      <Calendar className="h-3.5 w-3.5 shrink-0" style={{ color: sectionStyle.accentColor }} />
                      <span className="truncate"><RichText content={evt.date} /></span>
                      {evt.time && <span aria-hidden="true" className="opacity-55">|</span>}
                      {evt.time && <span className="shrink-0"><RichText content={evt.time} /></span>}
                    </div>
                    <div className="mt-2 flex min-w-0 items-center gap-2 text-[11px] sm:text-sm" style={{ color: sectionStyle.bodyColor }}>
                      <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: sectionStyle.accentColor }} />
                      <span className="truncate"><RichText content={evt.venue} /></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center pr-2 sm:pr-5" style={{ color: sectionStyle.accentColor }}>
                    <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 sm:h-6 sm:w-6" aria-hidden="true" />
                  </div>
                </>
              );

              return (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, x: 22 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="relative"
                >
                  <span
                    className="pointer-events-none absolute -left-[28px] top-1/2 z-10 h-3 w-3 -translate-y-1/2 rounded-full border-[3px] sm:-left-[36px] sm:h-3.5 sm:w-3.5"
                    style={{
                      backgroundColor: sectionStyle.accentColor,
                      borderColor: sectionStyle.lineColor,
                      boxShadow: `0 0 0 3px ${sectionStyle.backgroundColor}`,
                    }}
                    aria-hidden="true"
                  />

                  {evt.mapsUrl ? (
                    <a
                      href={evt.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open map for ${stripMarkup(evt.name)}`}
                      className="group grid grid-cols-[6rem_minmax(0,1fr)_2rem] overflow-hidden rounded-2xl border shadow-[0_10px_32px_rgba(98,61,35,0.055)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(98,61,35,0.09)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 sm:grid-cols-[11rem_minmax(0,1fr)_2.75rem]"
                      style={{ backgroundColor: sectionStyle.cardBackground, borderColor: sectionStyle.borderColor, outlineColor: sectionStyle.accentColor }}
                    >
                      {cardContents}
                    </a>
                  ) : (
                    <article
                      className="group grid grid-cols-[6rem_minmax(0,1fr)_2rem] overflow-hidden rounded-2xl border shadow-[0_10px_32px_rgba(98,61,35,0.055)] sm:grid-cols-[11rem_minmax(0,1fr)_2.75rem]"
                      style={{ backgroundColor: sectionStyle.cardBackground, borderColor: sectionStyle.borderColor }}
                    >
                      {cardContents}
                    </article>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
