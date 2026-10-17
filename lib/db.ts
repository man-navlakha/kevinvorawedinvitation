import { Pool } from "pg";
import { revalidatePath } from "next/cache";
import {
  WeddingData,
  WeddingDetails,
  CoupleInfo,
  StoryItem,
  WeddingEvent,
  TimelineItem,
  VenueInfo,
  GalleryItem,
  FamilyInfo,
  RSVPRecord,
  GuestWishRecord,
  ShagunRecord,
  MusicTrack,
  SectionVisibility,
} from "@/types/wedding";
import { initialWeddingData } from "@/data/defaultData";

const DATABASE_URL = process.env.DB_url;
if (!DATABASE_URL) {
  throw new Error("DB_url is not configured. PostgreSQL is required for wedding data.");
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes("localhost") ? undefined : { rejectUnauthorized: false },
});

let schemaReady: Promise<void> | null = null;
let memoryCache: WeddingData | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 1500;
let storeVersion = 0;

export interface DatabaseSyncResult {
  databaseSaved: boolean;
  isConfigured: true;
  provider: "database";
  databaseConfigured: boolean;
  databaseError?: string;
  url?: string;
  error?: string;
}

async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const readOnlyResult = await pool.query("SHOW transaction_read_only");
      if (readOnlyResult.rows[0]?.transaction_read_only === "on") {
        throw new Error(
          "The configured PostgreSQL connection is read-only. Set DB_url to a writable Neon branch/endpoint before using the wedding admin."
        );
      }

      await pool.query(`
        CREATE TABLE IF NOT EXISTS wedding_store (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          data JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await pool.query(
        "INSERT INTO wedding_store (id, data) VALUES (1, $1::jsonb) ON CONFLICT (id) DO NOTHING",
        [JSON.stringify(initialWeddingData)]
      );
    })();
  }
  await schemaReady;
}

export function getStoreVersion(): number {
  if (memoryCache?.wedding?.updatedAt) return new Date(memoryCache.wedding.updatedAt).getTime();
  return storeVersion;
}

export function normalizeMediaUrl(url: any): any {
  return typeof url === "string" ? url.trim() : url;
}

export function sanitizeMediaUrls<T>(obj: T): T {
  if (typeof obj === "string") return normalizeMediaUrl(obj) as T;
  if (Array.isArray(obj)) return obj.map((item) => sanitizeMediaUrls(item)) as T;
  if (obj && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) result[key] = sanitizeMediaUrls(value);
    return result as T;
  }
  return obj;
}

function deepMergeWeddingData(parsed: any): WeddingData {
  if (!parsed || typeof parsed !== "object") return initialWeddingData;
  const cleanParsed = sanitizeMediaUrls(parsed);
  return {
    ...initialWeddingData,
    ...cleanParsed,
    wedding: {
      ...initialWeddingData.wedding,
      ...(cleanParsed.wedding || {}),
      textStyling: {
        ...(initialWeddingData.wedding.textStyling as any),
        ...(cleanParsed.wedding?.textStyling || {}),
      },
      heroStyle: {
        ...(initialWeddingData.wedding.heroStyle as any),
        ...(cleanParsed.wedding?.heroStyle || {}),
      },
      dateRevealContent: {
        ...(initialWeddingData.wedding.dateRevealContent as any),
        ...(cleanParsed.wedding?.dateRevealContent || {}),
      },
      dateRevealStyle: {
        ...(initialWeddingData.wedding.dateRevealStyle as any),
        ...(cleanParsed.wedding?.dateRevealStyle || {}),
      },
      eventsSectionContent: {
        ...(initialWeddingData.wedding.eventsSectionContent as any),
        ...(cleanParsed.wedding?.eventsSectionContent || {}),
      },
      eventsSectionStyle: {
        ...(initialWeddingData.wedding.eventsSectionStyle as any),
        ...(cleanParsed.wedding?.eventsSectionStyle || {}),
      },
    },
    couple: {
      ...initialWeddingData.couple,
      ...(cleanParsed.couple || {}),
      sectionContent: {
        ...(initialWeddingData.couple.sectionContent as any),
        ...(cleanParsed.couple?.sectionContent || {}),
      },
      sectionStyle: {
        ...(initialWeddingData.couple.sectionStyle as any),
        ...(cleanParsed.couple?.sectionStyle || {}),
      },
    },
    family: { ...initialWeddingData.family, ...(cleanParsed.family || {}) },
    sectionVisibility: { ...initialWeddingData.sectionVisibility, ...(cleanParsed.sectionVisibility || {}) },
    venue: { ...initialWeddingData.venue, ...(cleanParsed.venue || {}) },
    events: Array.isArray(cleanParsed.events) ? cleanParsed.events : initialWeddingData.events,
    story: Array.isArray(cleanParsed.story) ? cleanParsed.story : initialWeddingData.story,
    timeline: Array.isArray(cleanParsed.timeline) ? cleanParsed.timeline : initialWeddingData.timeline,
    gallery: Array.isArray(cleanParsed.gallery) ? cleanParsed.gallery : initialWeddingData.gallery,
    rsvps: Array.isArray(cleanParsed.rsvps) ? cleanParsed.rsvps : initialWeddingData.rsvps,
    wishes: Array.isArray(cleanParsed.wishes) ? cleanParsed.wishes : initialWeddingData.wishes,
    shagun: Array.isArray(cleanParsed.shagun) ? cleanParsed.shagun : initialWeddingData.shagun,
    musicLibrary: Array.isArray(cleanParsed.musicLibrary) ? cleanParsed.musicLibrary : initialWeddingData.musicLibrary,
  };
}

async function ensureStore(forceFresh = false): Promise<WeddingData> {
  if (!forceFresh && memoryCache && Date.now() - lastCacheTime < CACHE_TTL_MS) return memoryCache;
  await ensureSchema();
  const result = await pool.query("SELECT data, EXTRACT(EPOCH FROM updated_at) * 1000 AS version FROM wedding_store WHERE id = 1");
  const row = result.rows[0];
  const data = deepMergeWeddingData(row?.data || initialWeddingData);
  memoryCache = data;
  lastCacheTime = Date.now();
  storeVersion = row?.version ? Number(row.version) : Date.now();
  return data;
}

async function saveStore(data: WeddingData): Promise<DatabaseSyncResult> {
  const nowIso = new Date().toISOString();
  const merged = deepMergeWeddingData({ ...data, wedding: { ...data.wedding, updatedAt: nowIso } });
  await ensureSchema();
  await pool.query(
    "INSERT INTO wedding_store (id, data, updated_at) VALUES (1, $1::jsonb, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at",
    [JSON.stringify(merged), nowIso]
  );
  memoryCache = merged;
  lastCacheTime = Date.now();
  storeVersion = new Date(nowIso).getTime();
  try { revalidatePath("/"); revalidatePath("/admin"); } catch {}
  return {
    databaseSaved: true,
    isConfigured: true,
    provider: "database",
    databaseConfigured: true,
  };
}
export async function getWeddingData(forceFresh: boolean = false): Promise<WeddingData> {
  return await ensureStore(forceFresh);
}

export type MutationResult<T> = T & {
  data: T;
  sync: DatabaseSyncResult;
};

export async function updateWeddingDetails(updates: Partial<WeddingDetails>): Promise<MutationResult<WeddingDetails>> {
  const data = await ensureStore(false);
  const nowIso = new Date().toISOString();
  data.wedding = {
    ...data.wedding,
    ...updates,
    updatedAt: nowIso,
  };
  const sync = await saveStore(data);
  return Object.assign({}, data.wedding, { data: data.wedding, sync });
}

export async function updateCoupleInfo(updates: Partial<CoupleInfo>): Promise<MutationResult<CoupleInfo>> {
  const data = await ensureStore(false);
  data.couple = {
    ...data.couple,
    ...updates,
  };
  const sync = await saveStore(data);
  return Object.assign({}, data.couple, { data: data.couple, sync });
}

export async function updateSectionVisibility(updates: Partial<SectionVisibility>): Promise<MutationResult<SectionVisibility>> {
  const data = await ensureStore(false);
  data.sectionVisibility = {
    ...data.sectionVisibility,
    ...updates,
  };
  const sync = await saveStore(data);
  return Object.assign({}, data.sectionVisibility, { data: data.sectionVisibility, sync });
}

export async function getEvents(): Promise<WeddingEvent[]> {
  const data = await ensureStore();
  return (data.events || []).sort((a, b) => a.order - b.order);
}

export async function createEvent(event: Omit<WeddingEvent, "id">): Promise<MutationResult<WeddingEvent>> {
  const data = await ensureStore(false);
  const newEvent: WeddingEvent = {
    ...event,
    id: `event-${Date.now()}`,
    order: event.order ?? (data.events.length + 1),
  };
  data.events.push(newEvent);
  const sync = await saveStore(data);
  return Object.assign({}, newEvent, { data: newEvent, sync });
}

export async function updateEvent(id: string, updates: Partial<WeddingEvent>): Promise<MutationResult<WeddingEvent>> {
  const data = await ensureStore(false);
  const idx = data.events.findIndex((e) => e.id === id);
  if (idx === -1) throw new Error("Event not found");
  data.events[idx] = { ...data.events[idx], ...updates };
  const sync = await saveStore(data);
  return Object.assign({}, data.events[idx], { data: data.events[idx], sync });
}

export async function deleteEvent(id: string): Promise<{ success: boolean; sync: DatabaseSyncResult }> {
  const data = await ensureStore(false);
  data.events = data.events.filter((e) => e.id !== id);
  const sync = await saveStore(data);
  return { success: true, sync };
}

export async function reorderEvents(orderedIds: string[]): Promise<{ data: WeddingEvent[]; sync: DatabaseSyncResult }> {
  const data = await ensureStore(false);
  data.events.forEach((evt) => {
    const idx = orderedIds.indexOf(evt.id);
    if (idx !== -1) {
      evt.order = idx + 1;
    }
  });
  data.events.sort((a, b) => a.order - b.order);
  const sync = await saveStore(data);
  return { data: data.events, sync };
}

export async function updateStory(items: StoryItem[]): Promise<{ data: StoryItem[]; sync: DatabaseSyncResult }> {
  const data = await ensureStore(false);
  data.story = items;
  const sync = await saveStore(data);
  return { data: data.story, sync };
}

export async function updateTimeline(items: TimelineItem[]): Promise<{ data: TimelineItem[]; sync: DatabaseSyncResult }> {
  const data = await ensureStore(false);
  data.timeline = items;
  const sync = await saveStore(data);
  return { data: data.timeline, sync };
}

export async function updateVenue(updates: Partial<VenueInfo>): Promise<MutationResult<VenueInfo>> {
  const data = await ensureStore(false);
  data.venue = { ...data.venue, ...updates };
  const sync = await saveStore(data);
  return Object.assign({}, data.venue, { data: data.venue, sync });
}

export async function getGallery(): Promise<GalleryItem[]> {
  const data = await ensureStore();
  return (data.gallery || []).sort((a, b) => a.order - b.order);
}

export async function addGalleryItem(item: Omit<GalleryItem, "id">): Promise<MutationResult<GalleryItem>> {
  const data = await ensureStore(false);
  const newItem: GalleryItem = {
    ...item,
    id: `gal-${Date.now()}`,
    order: item.order ?? (data.gallery.length + 1),
  };
  data.gallery.push(newItem);
  const sync = await saveStore(data);
  return Object.assign({}, newItem, { data: newItem, sync });
}

export async function deleteGalleryItem(id: string): Promise<{ success: boolean; sync: DatabaseSyncResult }> {
  const data = await ensureStore(false);
  data.gallery = data.gallery.filter((g) => g.id !== id);
  const sync = await saveStore(data);
  return { success: true, sync };
}

export async function updateGallery(items: GalleryItem[]): Promise<{ data: GalleryItem[]; sync: DatabaseSyncResult }> {
  const data = await ensureStore(false);
  data.gallery = items;
  const sync = await saveStore(data);
  return { data: data.gallery, sync };
}

export async function updateFamily(updates: Partial<FamilyInfo>): Promise<MutationResult<FamilyInfo>> {
  const data = await ensureStore(false);
  data.family = { ...data.family, ...updates };
  const sync = await saveStore(data);
  return Object.assign({}, data.family, { data: data.family, sync });
}

export async function getRSVPs(): Promise<RSVPRecord[]> {
  const data = await ensureStore();
  return data.rsvps || [];
}

export async function addRSVP(entry: Omit<RSVPRecord, "id" | "submittedAt">): Promise<MutationResult<RSVPRecord>> {
  const data = await ensureStore(true);
  const newRsvp: RSVPRecord = {
    ...entry,
    id: `rsvp-${Date.now()}`,
    submittedAt: new Date().toISOString(),
  };
  data.rsvps.unshift(newRsvp);
  const sync = await saveStore(data);
  return Object.assign({}, newRsvp, { data: newRsvp, sync });
}

export async function deleteRSVP(id: string): Promise<{ success: boolean; sync: DatabaseSyncResult }> {
  const data = await ensureStore(true);
  data.rsvps = data.rsvps.filter((r) => r.id !== id);
  const sync = await saveStore(data);
  return { success: true, sync };
}

export async function getWishes(): Promise<GuestWishRecord[]> {
  const data = await ensureStore();
  return data.wishes || [];
}

export async function addWish(entry: { name: string; message: string }): Promise<MutationResult<GuestWishRecord>> {
  const data = await ensureStore(true);
  const newWish: GuestWishRecord = {
    id: `wish-${Date.now()}`,
    name: entry.name,
    message: entry.message,
    status: "pending",
    submittedAt: new Date().toISOString(),
  };
  data.wishes.unshift(newWish);
  const sync = await saveStore(data);
  return Object.assign({}, newWish, { data: newWish, sync });
}

export async function updateWishStatus(id: string, status: "pending" | "approved" | "hidden"): Promise<MutationResult<GuestWishRecord>> {
  const data = await ensureStore(true);
  const wish = data.wishes.find((w) => w.id === id);
  if (!wish) throw new Error("Wish not found");
  wish.status = status;
  const sync = await saveStore(data);
  return Object.assign({}, wish, { data: wish, sync });
}

export async function deleteWish(id: string): Promise<{ success: boolean; sync: DatabaseSyncResult }> {
  const data = await ensureStore(true);
  data.wishes = data.wishes.filter((w) => w.id !== id);
  const sync = await saveStore(data);
  return { success: true, sync };
}

// --- SHAGUN / MONEY COLLECTION REPOSITORY ---
export async function getShagun(): Promise<ShagunRecord[]> {
  const data = await ensureStore();
  return data.shagun || [];
}

export async function addShagun(entry: Omit<ShagunRecord, "id" | "date">): Promise<MutationResult<ShagunRecord>> {
  const data = await ensureStore(true);
  const newEntry: ShagunRecord = {
    ...entry,
    id: `shagun-${Date.now()}`,
    date: new Date().toISOString(),
  };
  if (!data.shagun) data.shagun = [];
  data.shagun.unshift(newEntry);
  const sync = await saveStore(data);
  return Object.assign({}, newEntry, { data: newEntry, sync });
}

export async function updateShagun(id: string, updates: Partial<ShagunRecord>): Promise<MutationResult<ShagunRecord>> {
  const data = await ensureStore(true);
  if (!data.shagun) data.shagun = [];
  const idx = data.shagun.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error("Shagun record not found");
  data.shagun[idx] = { ...data.shagun[idx], ...updates };
  const sync = await saveStore(data);
  return Object.assign({}, data.shagun[idx], { data: data.shagun[idx], sync });
}

export async function deleteShagun(id: string): Promise<{ success: boolean; sync: DatabaseSyncResult }> {
  const data = await ensureStore(true);
  if (!data.shagun) data.shagun = [];
  data.shagun = data.shagun.filter((s) => s.id !== id);
  const sync = await saveStore(data);
  return { success: true, sync };
}

// --- MUSIC LIBRARY REPOSITORY ---
export async function getMusicLibrary(): Promise<MusicTrack[]> {
  const data = await ensureStore();
  return data.musicLibrary || [];
}

export async function addMusicTrack(track: Omit<MusicTrack, "id" | "addedAt">): Promise<MutationResult<MusicTrack>> {
  const data = await ensureStore(true);
  if (!data.musicLibrary) data.musicLibrary = [];
  const newTrack: MusicTrack = {
    ...track,
    id: `music-${Date.now()}`,
    addedAt: new Date().toISOString(),
  };
  if (newTrack.isActive) {
    data.musicLibrary.forEach((m) => (m.isActive = false));
    data.wedding.ambientMusicUrl = newTrack.url;
  }
  data.musicLibrary.push(newTrack);
  const sync = await saveStore(data);
  return Object.assign({}, newTrack, { data: newTrack, sync });
}

export async function setActiveMusicTrack(id: string): Promise<MutationResult<MusicTrack>> {
  const data = await ensureStore(true);
  if (!data.musicLibrary) data.musicLibrary = [];
  let selectedTrack: MusicTrack | null = null;
  data.musicLibrary.forEach((m) => {
    if (m.id === id) {
      m.isActive = true;
      selectedTrack = m;
    } else {
      m.isActive = false;
    }
  });
  if (!selectedTrack) throw new Error("Track not found");
  data.wedding.ambientMusicUrl = (selectedTrack as MusicTrack).url;
  const sync = await saveStore(data);
  return Object.assign({}, selectedTrack, { data: selectedTrack, sync });
}

export async function updateMusicTrack(id: string, updates: Partial<MusicTrack>): Promise<MutationResult<MusicTrack>> {
  const data = await ensureStore(true);
  if (!data.musicLibrary) data.musicLibrary = [];
  const idx = data.musicLibrary.findIndex((m) => m.id === id);
  if (idx === -1) throw new Error("Track not found");
  data.musicLibrary[idx] = { ...data.musicLibrary[idx], ...updates };
  if (updates.isActive || data.musicLibrary[idx].isActive) {
    if (updates.isActive) {
      data.musicLibrary.forEach((m) => {
        if (m.id !== id) m.isActive = false;
      });
    }
    data.wedding.ambientMusicUrl = data.musicLibrary[idx].url;
  }
  const sync = await saveStore(data);
  return Object.assign({}, data.musicLibrary[idx], { data: data.musicLibrary[idx], sync });
}

export async function deleteMusicTrack(id: string): Promise<{ success: boolean; sync: DatabaseSyncResult }> {
  const data = await ensureStore(true);
  if (!data.musicLibrary) data.musicLibrary = [];
  data.musicLibrary = data.musicLibrary.filter((m) => m.id !== id);
  const sync = await saveStore(data);
  return { success: true, sync };
}

export async function restoreWeddingData(
  fullData: WeddingData
): Promise<{ data: WeddingData; sync: DatabaseSyncResult }> {
  const current = await ensureStore(true);
  const merged: WeddingData = deepMergeWeddingData({
    ...current,
    ...fullData,
    wedding: {
      ...current.wedding,
      ...(fullData.wedding || {}),
      updatedAt: new Date().toISOString(),
    },
    couple: {
      ...current.couple,
      ...(fullData.couple || {}),
    },
    family: {
      ...current.family,
      ...(fullData.family || {}),
    },
    sectionVisibility: {
      ...current.sectionVisibility,
      ...(fullData.sectionVisibility || {}),
    },
    shagun: fullData.shagun || current.shagun,
    musicLibrary: fullData.musicLibrary || current.musicLibrary,
  });
  const sync = await saveStore(merged);
  return { data: merged, sync };
}
