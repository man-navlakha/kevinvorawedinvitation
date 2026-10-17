"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { StoryItem, CoupleInfo } from "@/types/wedding";
import { BotanicalMotif } from "@/components/ui/BotanicalMotif";
import { RichText } from "@/components/ui/RichText";

interface StorySectionProps {
  story: StoryItem[];
  couple: CoupleInfo;
}

const stripMarkup = (value: string) => value.replace(/<[^>]*>/g, "");

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return `rgba(184, 135, 61, ${alpha})`;
  const value = Number.parseInt(normalized, 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
}

function OrnamentDivider({ color, compact = false }: { color: string; compact?: boolean }) {
  return (
    <div className={`flex items-center justify-center ${compact ? "gap-2" : "gap-3"}`} aria-hidden="true">
      <span className={`${compact ? "w-16" : "w-24 sm:w-32"} h-px`} style={{ backgroundColor: color }} />
      <svg viewBox="0 0 36 36" className={compact ? "h-5 w-5" : "h-7 w-7"} fill="none" style={{ color }}>
        <path d="M18 3c2.8 5.1 5.8 7.7 9.8 9.4-3.7.2-6.8 1.4-9.8 4.5-3-3.1-6.1-4.3-9.8-4.5C12.2 9.2 15.2 6.4 18 3Z" stroke="currentColor" strokeWidth="1.4" />
        <path d="M18 16.8c4.2-3.2 8-3.8 13-2.9-1.9 6.5-6.3 10.7-13 13.1-6.7-2.4-11.1-6.6-13-13.1 5-.9 8.8-.3 13 2.9Z" stroke="currentColor" strokeWidth="1.4" />
        <path d="M18 17v15M11.5 16.6c.7 5 2.9 8.5 6.5 10.4M24.5 16.6c-.7 5-2.9 8.5-6.5 10.4" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      <span className={`${compact ? "w-16" : "w-24 sm:w-32"} h-px`} style={{ backgroundColor: color }} />
    </div>
  );
}

function BotanicalCorner({ color, flowerColor, className = "" }: { color: string; flowerColor: string; className?: string }) {
  return (
    <svg viewBox="0 0 260 300" className={`pointer-events-none absolute ${className}`} fill="none" aria-hidden="true">
      <g stroke={color} strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 278C50 225 72 167 79 98C83 61 99 31 129 10" strokeWidth="1.45" />
        <path d="M35 256C89 229 126 187 144 129C153 99 172 73 202 52" strokeWidth="1.2" />
        <path d="M75 214C130 205 174 178 208 134" strokeWidth="1.15" />
        <g fill={hexToRgba(color, 0.07)} strokeWidth="1.1">
          <path d="M31 237C13 219 10 200 17 184C36 197 43 214 31 237Z" />
          <path d="M55 203C38 183 38 164 47 149C64 164 69 183 55 203Z" />
          <path d="M75 163C60 143 62 124 72 110C88 127 91 145 75 163Z" />
          <path d="M99 222C105 197 119 184 137 181C136 203 124 217 99 222Z" />
          <path d="M127 180C134 157 148 145 166 143C163 164 151 177 127 180Z" />
          <path d="M153 127C160 106 174 95 192 94C188 114 176 125 153 127Z" />
          <path d="M185 157C195 138 209 130 226 132C220 150 207 159 185 157Z" />
        </g>
      </g>
      <g transform="translate(62 72)">
        <g fill={hexToRgba(flowerColor, 0.14)} stroke={color} strokeWidth="1.05">
          <ellipse cx="0" cy="-31" rx="17" ry="34" />
          <ellipse cx="0" cy="-31" rx="17" ry="34" transform="rotate(60)" />
          <ellipse cx="0" cy="-31" rx="17" ry="34" transform="rotate(120)" />
          <ellipse cx="0" cy="-31" rx="17" ry="34" transform="rotate(180)" />
          <ellipse cx="0" cy="-31" rx="17" ry="34" transform="rotate(240)" />
          <ellipse cx="0" cy="-31" rx="17" ry="34" transform="rotate(300)" />
        </g>
        <circle r="10" fill={hexToRgba(flowerColor, 0.28)} stroke={color} strokeWidth="1" />
        <g stroke={color} strokeWidth="0.8" opacity=".75">
          <path d="M0-9v18M-9 0H9M-6-6 6 6M6-6-6 6" />
        </g>
      </g>
    </svg>
  );
}


function FloatingPetal({ color, className }: { color: string; className: string }) {
  return (
    <svg viewBox="0 0 42 25" className={`pointer-events-none absolute ${className}`} aria-hidden="true">
      <path d="M2 20C13 1 27-4 40 5C32 20 19 27 2 20Z" fill={hexToRgba(color, 0.58)} />
      <path d="M7 18C17 12 25 8 35 6" fill="none" stroke={hexToRgba(color, 0.42)} strokeWidth="1" />
    </svg>
  );
}

interface CoupleProfileCardProps {
  photo: string;
  name: string;
  title?: string;
  bio: string;
  style: {
    cardBackground: string;
    headingColor: string;
    bodyColor: string;
    accentColor: string;
    borderColor: string;
    petalColor: string;
  };
  delay: number;
}

function CoupleProfileCard({ photo, name, title, bio, style, delay }: CoupleProfileCardProps) {
  const plainName = stripMarkup(name);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex min-h-[38rem] flex-col items-center overflow-hidden rounded-[2.15rem] border px-5 pb-12 pt-11 text-center shadow-[0_20px_55px_rgba(112,72,35,0.07)] sm:min-h-[43rem] sm:px-12 sm:pb-14 sm:pt-14"
      style={{
        backgroundColor: style.cardBackground,
        borderColor: hexToRgba(style.borderColor, 0.62),
        boxShadow: `0 22px 65px ${hexToRgba(style.accentColor, 0.08)}, inset 0 0 70px ${hexToRgba(style.petalColor || style.accentColor, 0.035)}`,
      }}
    > <FloatingPetal color={style.petalColor || style.accentColor} className="left-[7%] top-[22%] h-5 w-8 -rotate-12 opacity-75" />
      <FloatingPetal color={style.petalColor || style.accentColor} className="right-[7%] top-[43%] h-5 w-9 rotate-[24deg] opacity-70" />

      <div className="relative mb-8 flex w-full max-w-xl items-center justify-center sm:mb-10">
        <div className="relative h-52 w-52 overflow-hidden rounded-full border-2 p-1.5 shadow-[0_13px_28px_rgba(77,39,24,0.12)] sm:h-72 sm:w-72" style={{ borderColor: style.borderColor, backgroundColor: style.cardBackground }}>
          <div className="relative h-full w-full overflow-hidden rounded-full">
            {photo ? (
              <Image src={photo} alt={plainName} fill sizes="(max-width: 640px) 208px, 288px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-5xl font-editorial-serif" style={{ backgroundColor: hexToRgba(style.accentColor, 0.1), color: style.headingColor }}>
                {plainName.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>

      <h4 className="font-editorial-serif text-4xl leading-tight sm:text-5xl" style={{ color: style.headingColor }}>
        <RichText content={name} />
      </h4>
      <div className="my-4">
        <OrnamentDivider color={style.accentColor} compact />
      </div>
      {title && (
        <p className="max-w-2xl text-[11px] font-semibold uppercase leading-relaxed tracking-[0.16em] sm:text-sm sm:tracking-[0.17em]" style={{ color: style.accentColor }}>
          <RichText content={title} />
        </p>
      )}
      <p className="mt-5 max-w-2xl text-base font-light leading-relaxed sm:text-xl" style={{ color: style.bodyColor }}>
        <RichText content={bio} />
      </p>
    </motion.article>
  );
}

export function StorySection({ story, couple }: StorySectionProps) {
  const sortedStory = [...story].sort((a, b) => a.order - b.order);
  const sectionContent = {
    eyebrow: "The Groom & Bride",
    title: "Meet The Couple",
    description: "Two different worlds, one beautiful journey filled with love, laughter and endless dreams.",
    ...(couple.sectionContent || {}),
  };
  const sectionStyle = {
    backgroundColor: "#FFF9F0",
    cardBackground: "#FFFCF7",
    headingColor: "#681326",
    bodyColor: "#665E55",
    accentColor: "#B8873D",
    borderColor: "#D8AF6B",
    petalColor: "#B9184B",
    ...(couple.sectionStyle || {}),
  };

  return (
    <section id="story" className="relative py-24 sm:py-32 bg-[#FFFCF7] text-[#202020] overflow-hidden">
      {/* Decorative Background Floral Details */}
      <div className="absolute top-1/4 -right-16 w-64 h-64 rounded-full bg-[#C9B38C]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-16 w-64 h-64 rounded-full bg-[#B58F8F]/5 blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6">
        {/* Section Heading */}
        <div className="text-center space-y-3 mb-16 sm:mb-24">
          <span className="text-[11px] sm:text-xs font-medium tracking-[0.35em] text-[#9E814D] uppercase">
            How Forever Began
          </span>
          <h2 className="font-editorial-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-wide text-[#202020]">
            Our Story
          </h2>
          <div className="pt-2">
            <BotanicalMotif variant="divider" />
          </div>
          {couple.quote && (
            <p className="max-w-xl mx-auto font-editorial-serif text-lg sm:text-xl italic text-[#736B63] pt-3">
              &ldquo;<RichText content={couple.quote} />&rdquo;
            </p>
          )}
        </div>

        {/* Story Milestones Timeline */}
        <div className="relative">
          {/* Vertical central connector line (desktop) */}
          <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-[1px] -translate-x-1/2 bg-gradient-to-b from-[#C9B38C]/20 via-[#C9B38C]/60 to-[#C9B38C]/20" />

          <div className="space-y-16 sm:space-y-24">
            {sortedStory.map((item, index) => {
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-16 ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Central Node on Desktop */}
                  <div className="hidden md:flex absolute left-1/2 top-10 -translate-x-1/2 items-center justify-center">
                    <div className="w-5 h-5 rounded-full border-2 border-[#C9B38C] bg-[#FFFCF7] flex items-center justify-center shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-[#9E814D]" />
                    </div>
                  </div>

                  {/* Story Image / Photo */}
                  <div className="w-full md:w-1/2 flex justify-center">
                    {item.image ? (
                      <div className="relative w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-[#C9B38C]/30 group">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 400px"
                          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                      </div>
                    ) : (
                      <div className="w-full max-w-sm aspect-[4/3] rounded-2xl bg-[#F8F5EF] border border-[#C9B38C]/30 flex items-center justify-center p-6 text-center">
                        <BotanicalMotif variant="ring" className="w-12 h-12 text-[#C9B38C]" />
                      </div>
                    )}
                  </div>

                  {/* Story Narrative Text */}
                  <div className={`w-full md:w-1/2 text-center ${isEven ? "md:text-right" : "md:text-left"}`}>
                    <span className="inline-block px-3 py-1 rounded-full bg-[#F8F5EF] border border-[#C9B38C]/30 text-xs font-semibold tracking-widest text-[#9E814D] mb-3">
                      {item.year}
                    </span>
                    <h3 className="font-editorial-serif text-2xl sm:text-3xl font-normal text-[#202020] mb-3">
                      <RichText content={item.title} />
                    </h3>
                    <p className="text-sm sm:text-base text-[#575048] leading-relaxed font-light">
                      <RichText content={item.description} />
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Couple Mini Profile Cards - Groom First */}
        {(couple.bridePhoto || couple.groomPhoto) && (
          <div
            className="relative left-1/2 mt-28 w-screen -translate-x-1/2 overflow-hidden border-y py-20 sm:mt-36 sm:py-28"
            style={{
              backgroundColor: sectionStyle.backgroundColor,
              borderColor: hexToRgba(sectionStyle.borderColor, 0.32),
            }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem]" aria-hidden="true" style={{ background: `radial-gradient(circle at 50% 20%, ${hexToRgba(sectionStyle.cardBackground, 0.85)}, transparent 68%)` }} />
            <BotanicalCorner color={sectionStyle.accentColor} flowerColor={sectionStyle.petalColor} className="left-0 top-0 h-36 w-32 opacity-55 sm:left-3 sm:top-3 sm:h-44 sm:w-40" />
            <BotanicalCorner color={sectionStyle.accentColor} flowerColor={sectionStyle.petalColor} className="right-0 top-0 h-36 w-32 -scale-x-100 opacity-55 sm:right-3 sm:top-3 sm:h-44 sm:w-40" />
            <BotanicalCorner color={sectionStyle.accentColor} flowerColor={sectionStyle.petalColor} className="bottom-1 left-0 h-40 w-36 -scale-y-100 opacity-45 sm:bottom-3 sm:left-3 sm:h-48 sm:w-44" />
            <BotanicalCorner color={sectionStyle.accentColor} flowerColor={sectionStyle.petalColor} className="bottom-1 right-0 h-40 w-36 -scale-x-100 -scale-y-100 opacity-45 sm:bottom-3 sm:right-3 sm:h-48 sm:w-44" />

            <FloatingPetal color={sectionStyle.petalColor} className="left-[14%] top-[8%] h-6 w-10 -rotate-[20deg]" />
            <FloatingPetal color={sectionStyle.petalColor} className="right-[17%] top-[4%] h-5 w-9 rotate-[25deg] opacity-70" />
            <FloatingPetal color={sectionStyle.petalColor} className="left-[9%] top-[38%] h-5 w-9 rotate-[8deg] opacity-55" />
            <FloatingPetal color={sectionStyle.petalColor} className="right-[8%] top-[56%] h-5 w-9 -rotate-[18deg] opacity-55" />
            <FloatingPetal color={sectionStyle.petalColor} className="left-[11%] bottom-[21%] h-6 w-10 rotate-[30deg] opacity-50" />
            <FloatingPetal color={sectionStyle.petalColor} className="right-[12%] bottom-[9%] h-5 w-9 -rotate-[25deg] opacity-55" />

            <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8">
              <motion.header
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="mx-auto mb-14 max-w-3xl text-center sm:mb-20"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.38em] sm:text-sm" style={{ color: sectionStyle.accentColor }}>
                  <RichText content={sectionContent.eyebrow} />
                </p>
                <div className="mt-5">
                  <OrnamentDivider color={sectionStyle.accentColor} compact />
                </div>
                <h3 className="mt-7 font-editorial-serif text-5xl leading-[0.98] sm:text-7xl" style={{ color: sectionStyle.headingColor }}>
                  <RichText content={sectionContent.title} />
                </h3>
                <p className="mx-auto mt-7 max-w-2xl text-base font-light leading-relaxed sm:text-2xl" style={{ color: sectionStyle.bodyColor }}>
                  <RichText content={sectionContent.description} />
                </p>
              </motion.header>

              <div className="relative mx-auto flex max-w-4xl flex-col gap-9 sm:gap-12">
                <CoupleProfileCard
                  photo={couple.groomPhoto}
                  name={couple.groomName}
                  title={couple.groomTitle}
                  bio={couple.groomBio}
                  style={sectionStyle}
                  delay={0.05}
                />
                <CoupleProfileCard
                  photo={couple.bridePhoto}
                  name={couple.brideName}
                  title={couple.brideTitle}
                  bio={couple.brideBio}
                  style={sectionStyle}
                  delay={0.14}
                />
              </div>
              <div className="mt-14 sm:mt-20">
                <OrnamentDivider color={sectionStyle.accentColor} />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
