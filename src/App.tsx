import { useState, useMemo, useEffect } from "react";
import { 
  Trophy, 
  Film, 
  Search, 
  MapPin, 
  Clock, 
  Star, 
  Ticket, 
  X, 
  Activity, 
  Tv, 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  Languages, 
  Sun, 
  Moon, 
  Check, 
  Sparkles,
  Play,
  Share2,
  Settings,
  Plus,
  Trash2,
  RefreshCw,
  Sliders,
  Shield,
  Pencil,
  Image,
  Upload,
  Link,
  Copy,
  Send,
  Volume2,
  VolumeX,
  Eye,
  HelpCircle,
  Headphones,
  Mail
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Language, 
  Theme, 
  translations, 
  sportsMatches, 
  cinemaMovies, 
  Match, 
  Movie 
} from "./data";

import HlsVideoPlayer from "./components/HlsVideoPlayer";

const isStreamVideoOrHls = (url: string, type: string) => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return (
    type === "video" ||
    lowerUrl.includes(".m3u8") ||
    lowerUrl.includes(".mp4") ||
    lowerUrl.includes("/live/") ||
    lowerUrl.includes(".mkv") ||
    lowerUrl.includes(".webm")
  );
};

const PRESET_LOGOS = [
  { name: { ar: "ريال مدريد", en: "Real Madrid" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8633.png" },
  { name: { ar: "برشلونة", en: "Barcelona" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8634.png" },
  { name: { ar: "مانشستر سيتي", en: "Man City" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8456.png" },
  { name: { ar: "مانشستر يونايتد", en: "Man United" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10260.png" },
  { name: { ar: "أرسنال", en: "Arsenal" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9825.png" },
  { name: { ar: "ليفربول", en: "Liverpool" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8650.png" },
  { name: { ar: "بايرن ميونخ", en: "Bayern Munich" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9823.png" },
  { name: { ar: "باريس سان جيرمان", en: "PSG" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9847.png" },
  { name: { ar: "يوفنتوس", en: "Juventus" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9885.png" },
  { name: { ar: "ميلان", en: "AC Milan" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8564.png" },
  { name: { ar: "الهلال", en: "Al Hilal" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9831.png" },
  { name: { ar: "النصر", en: "Al Nassr" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9827.png" },
  { name: { ar: "الاتحاد", en: "Al Ittihad" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9829.png" },
  { name: { ar: "الأهلي", en: "Al Ahly" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10216.png" },
  { name: { ar: "الزمالك", en: "Zamalek" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/211516.png" }
];

const PRESET_STREAMS = [
  {
    name: { ar: "beIN Sports 1 HD (بث تجريبي MP4)", en: "beIN Sports 1 HD (Demo MP4)" },
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    type: "video" as const
  },
  {
    name: { ar: "قناة SSC الرياضية (بث تجريبي ملعب)", en: "SSC Sports (Stadium Demo MP4)" },
    url: "https://assets.mixkit.co/videos/preview/mixkit-soccer-player-kicking-a-ball-in-the-stadium-2314-large.mp4",
    type: "video" as const
  },
  {
    name: { ar: "بث مباشر يوتيوب (تغطية المباريات العالمية)", en: "YouTube Live Match Coverage (Demo Embed)" },
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    type: "iframe" as const
  },
  {
    name: { ar: "بث تجريبي لقناة الكأس (فيديو MP4)", en: "Al Kass Channel (Demo MP4)" },
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    type: "video" as const
  }
];

const getEmbedUrl = (url: string) => {
  if (!url) return "";
  const trimmed = url.trim();
  // If it's a full iframe tag
  if (trimmed.startsWith("<iframe")) {
    const srcMatch = trimmed.match(/src=["']([^"']+)["']/);
    if (srcMatch && srcMatch[1]) {
      return srcMatch[1];
    }
  }
  
  // YouTube URLs
  if (trimmed.includes("youtube.com") || trimmed.includes("youtu.be")) {
    if (trimmed.includes("watch?v=")) {
      const parts = trimmed.split("v=");
      if (parts.length > 1) {
        const id = parts[1].split("&")[0];
        return `https://www.youtube.com/embed/${id}?autoplay=1`;
      }
    }
    if (trimmed.includes("youtu.be/")) {
      const parts = trimmed.split("youtu.be/");
      if (parts.length > 1) {
        const id = parts[1].split("?")[0];
        return `https://www.youtube.com/embed/${id}?autoplay=1`;
      }
    }
    if (trimmed.includes("youtube.com/embed/")) {
      return trimmed;
    }
  }
  
  return trimmed;
};

export default function App() {
  // State for language (default: Arabic "ar")
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem("el_portal_lang");
      return (saved === "ar" || saved === "en") ? (saved as Language) : "ar";
    } catch (e) {
      return "ar";
    }
  });
  // State for theme (default: Black "black")
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem("el_portal_theme");
      return (saved === "black" || saved === "white") ? (saved as Theme) : "black";
    } catch (e) {
      return "black";
    }
  });

  const changeLanguage = (newLang: Language) => {
    setLang(newLang);
    try {
      localStorage.setItem("el_portal_lang", newLang);
    } catch (e) {
      console.warn("localStorage not accessible:", e);
    }
  };

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem("el_portal_theme", newTheme);
    } catch (e) {
      console.warn("localStorage not accessible:", e);
    }
  };
  
  // Active section inside the middle ("sports" or "cinema")
  const [activeTab, setActiveTab] = useState<"sports" | "cinema">("sports");
  
  // Filters and search states
  const [sportsSearch, setSportsSearch] = useState("");
  const [selectedSportFilter, setSelectedSportFilter] = useState<string>("all");
  
  const [cinemaSearch, setCinemaSearch] = useState("");
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>("all");

  // Booking simulator state
  const [selectedMovieForBooking, setSelectedMovieForBooking] = useState<Movie | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<string>("");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookingCompleted, setBookingCompleted] = useState(false);

  // Real-time matches state from server
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [selectedMatchForDetails, setSelectedMatchForDetails] = useState<any | null>(null);
  const [activeDetailsTab, setActiveDetailsTab] = useState<"events" | "stats" | "lineup">("events");

  // Admin control panel states
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminMatchIds, setAdminMatchIds] = useState<string[]>([]);
  const [isSavingAdmin, setIsSavingAdmin] = useState(false);
  const [searchDate, setSearchDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [searchedFotmobMatches, setSearchedFotmobMatches] = useState<any[]>([]);
  const [isSearchingFotmob, setIsSearchingFotmob] = useState(false);
  const [manualMatchId, setManualMatchId] = useState("");
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [adminMessage, setAdminMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // States for Editing/Overriding Matches
  const [editingMatch, setEditingMatch] = useState<any | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editTab, setEditTab] = useState<"basic" | "details" | "scorers" | "stats">("basic");
  const [logoSelectorFor, setLogoSelectorFor] = useState<"A" | "B" | null>(null);

  // Live Stream Player state
  const [userRole, setUserRole] = useState<"viewer" | "admin">("viewer");
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [streamingMatch, setStreamingMatch] = useState<any | null>(null);
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
  const [streamUrl, setStreamUrl] = useState("");
  const [streamType, setStreamType] = useState<"video" | "iframe">("iframe");
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [activeStreamIndex, setActiveStreamIndex] = useState<number>(0);
  const [editingStreams, setEditingStreams] = useState<{ name: string; url: string; type: "video" | "iframe" }[]>([]);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Buffer settings state for Admin Panel
  const [adminBufferMax, setAdminBufferMax] = useState(10);
  const [adminBufferMaxMax, setAdminBufferMaxMax] = useState(15);
  const [adminBufferSyncCount, setAdminBufferSyncCount] = useState(3);
  const [isSavingBuffer, setIsSavingBuffer] = useState(false);

  // Time-based automatic match starter clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000); // 10s tick is precise and light
    return () => clearInterval(timer);
  }, []);

  const autoProcessMatchStatus = (match: any, now: Date): any => {
    if (!match) return match;
    
    // If the match is already marked as "ended" manually, we respect that!
    if (match.status === "ended") {
      return match;
    }

    let scheduledDate: Date | null = null;

    if (match.utcTime) {
      const d = new Date(match.utcTime);
      if (!isNaN(d.getTime())) {
        scheduledDate = d;
      }
    }

    // Parse custom match time
    if (!scheduledDate) {
      const timeStr = match.time?.en || match.time?.ar || match.time || "";
      if (typeof timeStr === "string") {
        const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        const cleanStr = timeStr.replace(/[٠-٩]/g, (d) => arabicDigits.indexOf(d).toString());
        
        const matchTimeResult = cleanStr.match(/(\d{1,2}):(\d{2})/);
        if (matchTimeResult) {
          const hours = parseInt(matchTimeResult[1], 10);
          const minutes = parseInt(matchTimeResult[2], 10);
          
          const d = new Date(now);
          d.setHours(hours, minutes, 0, 0);

          const cleanStrLower = cleanStr.toLowerCase();
          if (cleanStrLower.includes("tomorrow") || cleanStrLower.includes("غد")) {
            d.setDate(d.getDate() + 1);
          } else if (cleanStrLower.includes("yesterday") || cleanStrLower.includes("أمس")) {
            d.setDate(d.getDate() - 1);
          }
          
          scheduledDate = d;
        }
      }
    }

    if (scheduledDate) {
      if (now >= scheduledDate) {
        const elapsedMs = now.getTime() - scheduledDate.getTime();
        const elapsedMinutes = Math.floor(elapsedMs / 60000);

        let periodTextEn = "Live";
        let periodTextAr = "مباشر";

        if (elapsedMinutes >= 45 && elapsedMinutes < 60) {
          periodTextEn = "HT";
          periodTextAr = "بين الشوطين";
        }

        return {
          ...match,
          status: "live",
          statusText: {
            ar: periodTextAr,
            en: periodTextEn
          },
          scoreA: match.scoreA !== undefined ? match.scoreA : 0,
          scoreB: match.scoreB !== undefined ? match.scoreB : 0
        };
      }
    }

    return match;
  };

  // Synchronize stream list when a match is selected for streaming
  useEffect(() => {
    if (streamingMatch) {
      const baseStreams = streamingMatch.streams || [];
      const initialized = [
        { 
          name: baseStreams[0]?.name && !["Server 1", "سيرفر 1"].includes(baseStreams[0].name)
            ? baseStreams[0].name 
            : (lang === "ar" ? "سيرفر 1" : "Server 1"), 
          url: baseStreams[0]?.url || streamingMatch.streamUrl || "", 
          type: baseStreams[0]?.type || streamingMatch.streamType || "iframe" 
        },
        { 
          name: baseStreams[1]?.name && !["Server 2", "سيرفر 2"].includes(baseStreams[1].name)
            ? baseStreams[1].name 
            : (lang === "ar" ? "سيرفر 2" : "Server 2"), 
          url: baseStreams[1]?.url || "", 
          type: baseStreams[1]?.type || "iframe" 
        },
        { 
          name: baseStreams[2]?.name && !["Server 3", "سيرفر 3"].includes(baseStreams[2].name)
            ? baseStreams[2].name 
            : (lang === "ar" ? "سيرفر 3" : "Server 3"), 
          url: baseStreams[2]?.url || "", 
          type: baseStreams[2]?.type || "iframe" 
        },
        { 
          name: baseStreams[3]?.name && !["Server 4", "سيرفر 4"].includes(baseStreams[3].name)
            ? baseStreams[3].name 
            : (lang === "ar" ? "سيرفر 4" : "Server 4"), 
          url: baseStreams[3]?.url || "", 
          type: baseStreams[3]?.type || "iframe" 
        }
      ];
      setEditingStreams(initialized);

      // Find first stream with a URL, default to 0
      const firstValidIdx = initialized.findIndex(s => s.url);
      const targetIdx = firstValidIdx !== -1 ? firstValidIdx : 0;
      setActiveStreamIndex(targetIdx);
      setStreamUrl(initialized[targetIdx].url);
      setStreamType(initialized[targetIdx].type);
    } else {
      setStreamUrl("");
      setStreamType("iframe");
      setActiveStreamIndex(0);
      setEditingStreams([]);
    }
  }, [streamingMatch, lang]);

  // Load matches
  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/matches");
      if (res.ok) {
        const data = await res.json();
        // De-duplicate matches by id just in case
        const uniqueMatches: any[] = [];
        const seenIds = new Set();
        if (Array.isArray(data)) {
          for (const m of data) {
            if (m && m.id && !seenIds.has(String(m.id))) {
              seenIds.add(String(m.id));
              uniqueMatches.push(m);
            }
          }
        }
        setMatches(uniqueMatches);
      }
    } catch (err) {
      console.error("Failed to load matches:", err);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  // Load admin saved match IDs
  const loadAdminMatchIds = async () => {
    try {
      const res = await fetch("/api/admin/matches");
      if (res.ok) {
        const data = await res.json();
        const rawIds = data.matchIds || [];
        setAdminMatchIds(Array.from(new Set(rawIds.map(String))));
      }
    } catch (err) {
      console.error("Failed to load admin match IDs:", err);
    }
  };

  const loadAdminBufferSettings = async () => {
    try {
      const res = await fetch("/api/admin/buffer-settings");
      if (res.ok) {
        const data = await res.json();
        setAdminBufferMax(Number(data.maxBufferLength) || 10);
        setAdminBufferMaxMax(Number(data.maxMaxBufferLength) || 15);
        setAdminBufferSyncCount(Number(data.liveSyncDurationCount) || 3);
      }
    } catch (err) {
      console.error("Failed to load admin buffer settings:", err);
    }
  };

  const handleSaveBufferSettings = async () => {
    setIsSavingBuffer(true);
    try {
      const response = await fetch("/api/admin/buffer-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maxBufferLength: adminBufferMax,
          maxMaxBufferLength: adminBufferMaxMax,
          liveSyncDurationCount: adminBufferSyncCount,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setAdminMessage({
          text: lang === "ar" ? "تم حفظ إعدادات البفر بنجاح وتطبيقها على المشاهدين!" : "Buffer settings saved successfully and applied to viewers!",
          type: "success"
        });
        setTimeout(() => setAdminMessage(null), 3000);
      } else {
        setAdminMessage({
          text: lang === "ar" ? "فشل حفظ إعدادات البفر." : "Failed to save buffer settings.",
          type: "error"
        });
      }
    } catch (error) {
      console.error("Error saving buffer settings:", error);
      setAdminMessage({
        text: lang === "ar" ? "حدث خطأ أثناء حفظ إعدادات البفر." : "An error occurred while saving buffer settings.",
        type: "error"
      });
    } finally {
      setIsSavingBuffer(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    loadAdminMatchIds();
    loadAdminBufferSettings();
    const interval = setInterval(fetchMatches, 25000); // refresh every 25s
    return () => clearInterval(interval);
  }, []);

  // Real-time server update synchronization via SSE (Server-Sent Events)
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connectSSE = () => {
      console.log("[SSE] Connecting to /api/updates...");
      eventSource = new EventSource("/api/updates");

      eventSource.onopen = () => {
        console.log("[SSE] Real-time connection established successfully");
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("[SSE] Received real-time update event:", data);
          
          if (
            data.type === "matches_updated" || 
            data.type === "match_override_updated" || 
            data.type === "team_logos_updated" || 
            data.type === "buffer_settings_updated"
          ) {
            fetchMatches();
            loadAdminMatchIds();
            loadAdminBufferSettings();
          }
        } catch (err) {
          console.error("[SSE] Failed to parse SSE event message:", err);
        }
      };

      eventSource.onerror = (err) => {
        console.warn("[SSE] Connection error, closing and scheduling reconnect...", err);
        if (eventSource) {
          eventSource.close();
        }
        reconnectTimeout = setTimeout(connectSSE, 3000);
      };
    };

    // Connect SSE after short delay so iOS Safari completes initial document rendering smoothly
    const initialSseTimer = setTimeout(() => {
      connectSSE();
    }, 300);

    return () => {
      clearTimeout(initialSseTimer);
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  useEffect(() => {
    if (!editingMatch) {
      setLogoSelectorFor(null);
    }
  }, [editingMatch]);



  // Search matches in FotMob by Date
  const handleSearchFotmobByDate = async () => {
    setIsSearchingFotmob(true);
    setAdminMessage(null);
    try {
      const cleanedDate = searchDate.replace(/-/g, "");
      const res = await fetch(`/api/fotmob/matches-by-date?date=${cleanedDate}`);
      if (res.ok) {
        const data = await res.json();
        // De-duplicate searched matches by id just in case
        const uniqueSearched: any[] = [];
        const seenSearchedIds = new Set();
        if (Array.isArray(data)) {
          for (const m of data) {
            if (m && m.id && !seenSearchedIds.has(String(m.id))) {
              seenSearchedIds.add(String(m.id));
              uniqueSearched.push(m);
            }
          }
        }
        setSearchedFotmobMatches(uniqueSearched);
        if (uniqueSearched.length === 0) {
          setAdminMessage({ text: lang === "ar" ? "لا توجد مباريات لهذا اليوم." : "No matches found for this date.", type: "error" });
        }
      } else {
        setAdminMessage({ text: lang === "ar" ? "فشل البحث في FotMob." : "Failed to search FotMob.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setAdminMessage({ text: lang === "ar" ? "خطأ في الاتصال بالخادم." : "Server connection error.", type: "error" });
    } finally {
      setIsSearchingFotmob(false);
    }
  };

  // Extract FotMob Match ID from URL or numeric string
  const extractFotmobMatchId = (input: string): string => {
    const trimmed = input.trim();
    if (!trimmed) return "";

    if (/^\d+$/.test(trimmed)) {
      return trimmed;
    }

    try {
      let urlString = trimmed;
      if (!/^https?:\/\//i.test(urlString)) {
        urlString = "https://" + urlString;
      }
      const url = new URL(urlString);
      
      // Check hash (e.g. #4653855)
      if (url.hash) {
        const hashMatch = url.hash.match(/#?(\d+)/);
        if (hashMatch && hashMatch[1]) {
          return hashMatch[1];
        }
      }

      // Check query params
      const qId = url.searchParams.get("matchId") || url.searchParams.get("id");
      if (qId && /^\d+$/.test(qId)) {
        return qId;
      }

      // Check path segments
      const segments = url.pathname.split("/").filter(Boolean);
      for (const segment of segments) {
        if (/^\d+$/.test(segment)) {
          return segment;
        }
      }
    } catch (e) {
      // Ignore URL parse error, proceed to regex fallback
    }

    // Try finding a 6-10 digit number in the string
    const match = trimmed.match(/(?:#|\b)(\d{6,10})\b/);
    if (match && match[1]) {
      return match[1];
    }

    return trimmed;
  };

  // Helper to persist updated list directly to server and refresh UI
  const saveMatchListOnServer = async (newList: string[]) => {
    setIsSavingAdmin(true);
    setAdminMessage(null);
    try {
      const res = await fetch("/api/admin/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchIds: newList })
      });
      if (res.ok) {
        setAdminMatchIds(Array.from(new Set(newList.map(String))));
        await fetchMatches(); // Re-fetch all matches with full details immediately
        return true;
      } else {
        setAdminMessage({ text: lang === "ar" ? "فشل تحديث قائمة المباريات على الخادم." : "Failed to update match list on the server.", type: "error" });
        return false;
      }
    } catch (err) {
      console.error(err);
      setAdminMessage({ text: lang === "ar" ? "خطأ في الاتصال بالخادم." : "Server connection error.", type: "error" });
      return false;
    } finally {
      setIsSavingAdmin(false);
    }
  };

  // Add match ID to admin list (supports match URL and ID parsing)
  const handleAddMatchId = async (idOrUrl: string) => {
    const parsedId = extractFotmobMatchId(idOrUrl);
    if (!parsedId || !/^[a-zA-Z0-9_-]+$/.test(parsedId)) {
      setAdminMessage({ 
        text: lang === "ar" 
          ? "المعرف المدخل غير صحيح. يرجى إدخال معرف مباراة قوقل صالح أو رقم المعرف." 
          : "The entered ID is invalid. Please enter a valid Google match ID or numeric ID.", 
        type: "error" 
      });
      return;
    }
    if (adminMatchIds.includes(parsedId)) {
      setAdminMessage({ text: lang === "ar" ? "هذه المباراة مضافة بالفعل في الصفحة الرئيسية." : "This match is already on the homepage.", type: "error" });
      return;
    }
    
    const updatedList = [...adminMatchIds, parsedId];
    const success = await saveMatchListOnServer(updatedList);
    if (success) {
      setAdminMessage({ 
        text: lang === "ar" 
          ? `تمت إضافة المباراة بنجاح وتحديث الصفحة الرئيسية تفاصيل كاملة (رقم: ${parsedId})!` 
          : `Match successfully added and homepage updated with full details (ID: ${parsedId})!`, 
        type: "success" 
      });
    }
  };

  // Remove match ID from admin list
  const handleRemoveMatchId = async (id: string) => {
    const updatedList = adminMatchIds.filter(mid => mid !== String(id));
    const success = await saveMatchListOnServer(updatedList);
    if (success) {
      setAdminMessage({ 
        text: lang === "ar" ? "تمت إزالة المباراة بنجاح من الصفحة الرئيسية!" : "Match successfully removed from the homepage!", 
        type: "success" 
      });
    }
  };

  // Deprecated manual save: auto-runs now, kept for backward compatibility reference
  const handleSaveAdminMatches = async () => {
    await saveMatchListOnServer(adminMatchIds);
    setAdminMessage({
      text: lang === "ar" ? "تمت المزامنة وحفظ جميع التغييرات بنجاح تلقائياً!" : "All changes have been successfully saved & synced automatically!",
      type: "success"
    });
  };

  const handleSaveMatchOverride = async (matchId: string, overrideData: any) => {
    setIsSavingEdit(true);
    try {
      const res = await fetch("/api/matches/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, overrideData })
      });
      if (res.ok) {
        await fetchMatches(); // reload match list immediately with details
        setEditingMatch(null); // close the editor
      } else {
        alert(lang === "ar" ? "فشل حفظ التعديلات" : "Failed to save edits");
      }
    } catch (err) {
      console.error(err);
      alert(lang === "ar" ? "خطأ في الاتصال بالخادم" : "Connection error");
    } finally {
      setIsSavingEdit(false);
    }
  };



  const handleSaveAllStreams = async (matchId: string, updatedStreams: { name: string; url: string; type: "video" | "iframe" }[]) => {
    try {
      const res = await fetch("/api/matches/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          overrideData: {
            ...streamingMatch,
            streamUrl: updatedStreams[0]?.url || "",
            streamType: updatedStreams[0]?.type || "iframe",
            streams: updatedStreams
          }
        })
      });
      if (res.ok) {
        await fetchMatches();
        setStreamingMatch(prev => {
          if (!prev) return null;
          return {
            ...prev,
            streamUrl: updatedStreams[0]?.url || "",
            streamType: updatedStreams[0]?.type || "iframe",
            streams: updatedStreams
          };
        });
        alert(lang === "ar" ? "تم حفظ وتحديث السيرفرات الأربعة بنجاح!" : "All four servers updated and saved successfully!");
      } else {
        alert(lang === "ar" ? "فشل حفظ السيرفرات" : "Failed to save servers");
      }
    } catch (err) {
      console.error(err);
      alert(lang === "ar" ? "خطأ في الاتصال بالخادم" : "Connection error");
    }
  };

  const formatMatchTime = (match: any, currentLang: "ar" | "en") => {
    if (match.utcTime) {
      try {
        const d = new Date(match.utcTime);
        if (!isNaN(d.getTime())) {
          return d.toLocaleString(currentLang === "ar" ? "ar-EG" : "en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          });
        }
      } catch (e) {
        // Fallback
      }
    }
    return match.time[currentLang] || match.time.en || "";
  };

  const shouldShowPlayButton = (match: any): boolean => {
    if (match.status === "ended") return false;
    if (match.status === "live") return true;

    if (!match.utcTime && !match.time) return true;

    let scheduledDate: Date | null = null;

    if (match.utcTime) {
      const d = new Date(match.utcTime);
      if (!isNaN(d.getTime())) {
        scheduledDate = d;
      }
    }

    if (!scheduledDate && match.time) {
      const timeStr = match.time.en || match.time.ar || (typeof match.time === "string" ? match.time : "");
      if (timeStr) {
        const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        const cleanStr = timeStr.replace(/[٠-٩]/g, (d: string) => String(arabicDigits.indexOf(d)));
        
        const matchTimeResult = cleanStr.match(/(\d{1,2}):(\d{2})/);
        if (matchTimeResult) {
          const hours = parseInt(matchTimeResult[1], 10);
          const minutes = parseInt(matchTimeResult[2], 10);
          
          const d = new Date();
          d.setHours(hours, minutes, 0, 0);

          const cleanStrLower = cleanStr.toLowerCase();
          if (cleanStrLower.includes("tomorrow") || cleanStrLower.includes("غد")) {
            d.setDate(d.getDate() + 1);
          } else if (cleanStrLower.includes("yesterday") || cleanStrLower.includes("أمس")) {
            d.setDate(d.getDate() - 1);
          }
          scheduledDate = d;
        }
      }
    }

    if (!scheduledDate) return true;

    const now = new Date();
    const startTime = scheduledDate.getTime();
    const fifteenMinsBefore = startTime - 15 * 60 * 1000;

    return now.getTime() >= fifteenMinsBefore;
  };

  const getTranslation = (val: any, fallback = "") => {
    if (!val) return fallback;
    if (typeof val === "object") {
      return val[lang] || val.en || fallback;
    }
    return val;
  };

  // Get active translations
  const t = translations[lang];

  // Map sport categories
  const sportsCategories = useMemo(() => [
    { id: "all", label: t.all },
    { id: "football", label: t.football },
    { id: "basketball", label: t.basketball },
    { id: "tennis", label: t.tennis },
    { id: "formula1", label: t.formula1 },
  ], [t]);

  // Map movie genres
  const movieGenres = useMemo(() => [
    { id: "all", label: t.all },
    { id: "scifi", label: t.scifi },
    { id: "action", label: t.action },
    { id: "drama", label: t.drama },
  ], [t]);

  // Filtered Matches
  const filteredMatches = useMemo(() => {
    const listToFilter = matches.map(m => autoProcessMatchStatus(m, currentTime));
    return listToFilter.filter(match => {
      const matchSport = match.sport === selectedSportFilter || selectedSportFilter === "all";
      const teamAName = match.teamA[lang] || match.teamA.en || "";
      const teamBName = match.teamB[lang] || match.teamB.en || "";
      const venueName = match.venue[lang] || match.venue.en || "";
      const matchesSearch = 
        teamAName.toLowerCase().includes(sportsSearch.toLowerCase()) ||
        teamBName.toLowerCase().includes(sportsSearch.toLowerCase()) ||
        venueName.toLowerCase().includes(sportsSearch.toLowerCase());
      return matchSport && matchesSearch;
    });
  }, [matches, selectedSportFilter, sportsSearch, lang, currentTime]);

  // Filtered Movies
  const filteredMovies = useMemo(() => {
    return cinemaMovies.filter(movie => {
      const matchGenre = movie.genre === selectedGenreFilter || selectedGenreFilter === "all";
      const matchesSearch = 
        movie.title[lang].toLowerCase().includes(cinemaSearch.toLowerCase()) ||
        movie.genreText[lang].toLowerCase().includes(cinemaSearch.toLowerCase()) ||
        movie.description[lang].toLowerCase().includes(cinemaSearch.toLowerCase());
      return matchGenre && matchesSearch;
    });
  }, [selectedGenreFilter, cinemaSearch, lang]);

  // Sync selected match details modal and streaming match with live clock tick updates
  useEffect(() => {
    if (selectedMatchForDetails) {
      const updated = filteredMatches.find(m => String(m.id) === String(selectedMatchForDetails.id));
      if (updated) {
        if (
          updated.status !== selectedMatchForDetails.status || 
          updated.statusText?.en !== selectedMatchForDetails.statusText?.en ||
          updated.statusText?.ar !== selectedMatchForDetails.statusText?.ar ||
          updated.scoreA !== selectedMatchForDetails.scoreA ||
          updated.scoreB !== selectedMatchForDetails.scoreB ||
          JSON.stringify(updated.scorers) !== JSON.stringify(selectedMatchForDetails.scorers) ||
          JSON.stringify(updated.stats) !== JSON.stringify(selectedMatchForDetails.stats) ||
          JSON.stringify(updated.lineups) !== JSON.stringify(selectedMatchForDetails.lineups) ||
          JSON.stringify(updated.streams) !== JSON.stringify(selectedMatchForDetails.streams) ||
          JSON.stringify(updated.customMetadata) !== JSON.stringify(selectedMatchForDetails.customMetadata)
        ) {
          setSelectedMatchForDetails(updated);
        }
      }
    }
  }, [filteredMatches, selectedMatchForDetails]);

  useEffect(() => {
    if (streamingMatch) {
      const updated = filteredMatches.find(m => String(m.id) === String(streamingMatch.id));
      if (updated) {
        if (
          updated.status !== streamingMatch.status ||
          updated.statusText?.en !== streamingMatch.statusText?.en ||
          updated.statusText?.ar !== streamingMatch.statusText?.ar ||
          JSON.stringify(updated.streams) !== JSON.stringify(streamingMatch.streams)
        ) {
          setStreamingMatch(updated);
        }
      }
    }
  }, [filteredMatches, streamingMatch]);

  // Handle Seat Click
  const handleSeatClick = (seatId: string) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatId));
    } else {
      setSelectedSeats(prev => [...prev, seatId]);
    }
  };

  // Reset Booking state
  const startBooking = (movie: Movie) => {
    setSelectedMovieForBooking(movie);
    setSelectedShowtime(movie.showtimes[0]);
    setSelectedSeats([]);
    setBookingCompleted(false);
  };

  const confirmBooking = () => {
    if (selectedSeats.length === 0) return;
    setBookingCompleted(true);
    setTimeout(() => {
      // Auto close booking modal after nice feedback
      setSelectedMovieForBooking(null);
      setBookingCompleted(false);
    }, 2500);
  };

  // Custom static seat map layout (6x6 seat matrix)
  const seatMatrix = useMemo(() => {
    const rows = ["A", "B", "C", "D", "E", "F"];
    const seats = [];
    // Pre-determine some reserved seats for realism
    const reserved = ["A3", "A4", "B2", "C5", "D4", "E1", "F6"];
    for (const r of rows) {
      for (let i = 1; i <= 6; i++) {
        const id = `${r}${i}`;
        seats.push({
          id,
          isReserved: reserved.includes(id)
        });
      }
    }
    return seats;
  }, []);

  return (
    <div 
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`min-h-screen font-sans pb-16 transition-colors duration-500 ease-in-out ${
        theme === "black" 
          ? "bg-black text-zinc-100 selection:bg-amber-500 selection:text-black" 
          : "bg-zinc-50 text-zinc-900 selection:bg-zinc-900 selection:text-white"
      }`}
    >
      {/* BACKGROUND EFFECTS (Subtle elegant styling) */}
      {theme === "black" && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] rounded-full bg-red-600/5 blur-[140px]" />
          <div className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[100px]" />
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 md:py-10">
        
        {/* UPPER GRID: Header Info + Right-Aligned Controls */}
        <div className={`flex flex-col lg:flex-row items-start justify-between gap-6 mb-10 border-b pb-8 border-dashed ${theme === 'black' ? 'border-zinc-800' : 'border-zinc-200'}`}>
          
          {/* Logo and Greeting Area */}
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${theme === 'black' ? 'bg-zinc-900 text-amber-500 border border-zinc-800' : 'bg-white text-zinc-950 border border-zinc-200 shadow-sm'}`}>
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {lang === "ar" ? "بوابة النخبة" : "Elite Portal"}
              </h1>
              <p className={`text-xs mt-1 font-medium ${theme === 'black' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {lang === "ar" ? "الرياضة والسينما في منصة واحدة فائقة السرعة" : "Premium Sports & Cinema in one responsive platform"}
              </p>
            </div>
          </div>

          {/* RIGHT SIDE CONTROLS - (العربية / English & Black / White theme toggles) */}
          <div className="flex flex-wrap items-center gap-4 lg:self-center bg-transparent self-stretch justify-end">
            
            {/* Language Selection Card */}
            <div className={`flex items-center p-1.5 rounded-xl border ${
              theme === "black" 
                ? "bg-zinc-900/80 border-zinc-800 text-zinc-300" 
                : "bg-white border-zinc-200 shadow-sm text-zinc-800"
            }`}>
              <div className="px-2 py-1 text-xs font-semibold flex items-center gap-1">
                <Languages className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">{t.language}:</span>
              </div>
              <button
                id="btn-lang-ar"
                onClick={() => changeLanguage("ar")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-300 ${
                  lang === "ar"
                    ? theme === "black" ? "bg-amber-500 text-black shadow-md shadow-amber-500/10" : "bg-zinc-950 text-white"
                    : "hover:bg-zinc-800/10"
                }`}
              >
                العربية
              </button>
              <button
                id="btn-lang-en"
                onClick={() => changeLanguage("en")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-300 ${
                  lang === "en"
                    ? theme === "black" ? "bg-amber-500 text-black shadow-md shadow-amber-500/10" : "bg-zinc-950 text-white"
                    : "hover:bg-zinc-800/10"
                }`}
              >
                English
              </button>
            </div>

            {/* Black & White Theme Toggle */}
            <div className={`flex items-center p-1.5 rounded-xl border ${
              theme === "black" 
                ? "bg-zinc-900/80 border-zinc-800 text-zinc-300" 
                : "bg-white border-zinc-200 shadow-sm text-slate-800"
            }`}>
              <div className="px-2 py-1 text-xs font-semibold flex items-center gap-1">
                {theme === "black" ? <Moon className="w-3.5 h-3.5 text-amber-400" /> : <Sun className="w-3.5 h-3.5 text-orange-500" />}
                <span className="hidden sm:inline">{t.theme}:</span>
              </div>
              <button
                id="btn-theme-black"
                onClick={() => changeTheme("black")}
                className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition-all duration-300 ${
                  theme === "black"
                    ? "bg-zinc-100 text-black font-extrabold shadow-sm"
                    : "hover:bg-zinc-200 text-slate-500"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-black border border-white" />
                {t.black}
              </button>
              <button
                id="btn-theme-white"
                onClick={() => changeTheme("white")}
                className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition-all duration-300 ${
                  theme === "white"
                    ? "bg-zinc-950 text-white font-extrabold shadow-sm"
                    : "hover:bg-zinc-800 text-zinc-400"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-white border border-zinc-800" />
                {t.white}
              </button>
            </div>

          </div>
        </div>

        {/* MIDDLE SECTION: MAIN SELECTION HUBS (Sports & Cinema) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          {/* Sports Hub Option */}
          <button
            id="tab-sports"
            onClick={() => setActiveTab("sports")}
            className={`group text-start p-6 rounded-3xl border-2 transition-all duration-500 relative overflow-hidden cursor-pointer ${
              activeTab === "sports"
                ? theme === "black"
                  ? "bg-gradient-to-br from-zinc-900 to-black border-amber-500 shadow-2xl shadow-amber-500/5 text-white"
                  : "bg-white border-zinc-900 shadow-xl text-zinc-950"
                : theme === "black"
                  ? "bg-zinc-950/60 border-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
                  : "bg-white/60 border-zinc-200 hover:border-zinc-400 text-zinc-500 hover:text-slate-800"
            }`}
          >
            {/* Hover background details for Sports card */}
            <div className={`absolute -right-12 -bottom-12 w-44 h-44 rounded-full transition-all duration-500 opacity-20 group-hover:scale-125 ${
              activeTab === "sports" ? "bg-amber-500/20" : "bg-zinc-500/10"
            }`} />

            <div className="flex items-start justify-between relative z-10">
              <div className={`p-4 rounded-2xl transition-all duration-500 ${
                activeTab === "sports"
                  ? theme === "black" ? "bg-amber-500 text-black" : "bg-zinc-950 text-white"
                  : theme === "black" ? "bg-zinc-900 text-zinc-400" : "bg-zinc-100 text-zinc-500"
              }`}>
                <Trophy className="w-7 h-7 relative z-10" />
              </div>
              
              {/* Check indicator if selected */}
              {activeTab === "sports" && (
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                  theme === "black" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-zinc-100 text-zinc-900 border border-zinc-200"
                }`}>
                  {lang === "ar" ? "نشط" : "Active"}
                </div>
              )}
            </div>

            <div className="mt-6 relative z-10">
              <h2 className="text-xl md:text-2xl font-black">{t.sports}</h2>
              <p className={`text-xs mt-2 leading-relaxed ${theme === 'black' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {t.sportsDesc}
              </p>
            </div>
          </button>

          {/* Cinema Hub Option */}
          <button
            id="tab-cinema"
            onClick={() => setActiveTab("cinema")}
            className={`group text-start p-6 rounded-3xl border-2 transition-all duration-500 relative overflow-hidden block w-full cursor-pointer ${
              activeTab === "cinema"
                ? theme === "black"
                  ? "bg-gradient-to-br from-zinc-900 to-black border-red-500 shadow-2xl shadow-red-500/5 text-white"
                  : "bg-white border-zinc-900 shadow-xl text-zinc-950"
                : theme === "black"
                  ? "bg-zinc-950/60 border-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
                  : "bg-white/60 border-zinc-200 hover:border-zinc-400 text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {/* Hover background details for Cinema card */}
            <div className={`absolute -right-12 -bottom-12 w-44 h-44 rounded-full transition-all duration-500 opacity-20 group-hover:scale-125 ${
              activeTab === "cinema" ? "bg-red-500/20" : "bg-zinc-500/10"
            }`} />

            <div className="flex items-start justify-between relative z-10">
              <div className={`p-4 rounded-2xl transition-all duration-500 ${
                activeTab === "cinema"
                  ? theme === "black" ? "bg-red-500/20 text-red-500" : "bg-zinc-950 text-white"
                  : theme === "black" ? "bg-zinc-900 text-zinc-400" : "bg-zinc-100 text-zinc-500"
              }`}>
                <Film className="w-7 h-7 relative z-10" />
              </div>

              {/* Check indicator if selected */}
              {activeTab === "cinema" && (
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                  theme === "black" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-zinc-100 text-zinc-900 border border-zinc-200"
                }`}>
                  {lang === "ar" ? "نشط" : "Active"}
                </div>
              )}
            </div>

            <div className="mt-6 relative z-10">
              <h2 className="text-xl md:text-2xl font-black">{t.cinema}</h2>
              <p className={`text-xs mt-2 leading-relaxed ${theme === 'black' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {t.cinemaDesc}
              </p>
            </div>
          </button>

        </div>

        {/* DETAILED VIEWS IN THE CENTER */}
        <div className="relative">
          <AnimatePresence mode="wait">
            
            {/* 1. SPORTS TAB CONTENT */}
            {activeTab === "sports" && (
              <motion.div
                key="sports-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                
                {/* Matches Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {filteredMatches.length > 0 ? (
                    filteredMatches.map((match, index) => {
                      const isLive = match.status === "live";
                      const isEnded = match.status === "ended";
                      const teamAName = match.teamA[lang] || match.teamA.en || "";
                      const teamBName = match.teamB[lang] || match.teamB.en || "";
                      const timeString = formatMatchTime(match, lang);
                      const venueString = match.venue[lang] || match.venue.en || "";

                      return (
                        <div
                          key={`${match.id}-${index}`}
                          onClick={() => {
                            setSelectedMatchForDetails(match);
                            setActiveDetailsTab("events");
                          }}
                          className={`p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between cursor-pointer group hover:scale-[1.01] ${
                            theme === "black"
                              ? isLive
                                ? "bg-gradient-to-br from-zinc-900 to-zinc-950 border-amber-500/30 hover:border-amber-500/50"
                                : "bg-zinc-950/40 border-zinc-800 hover:border-zinc-700"
                              : "bg-white border-zinc-200 shadow-sm hover:shadow-md hover:border-zinc-300"
                          }`}
                        >
                          {/* Live signal top line */}
                          {isLive && (
                            <div className="absolute top-0 inset-x-0 h-[2px] bg-amber-500 animate-pulse" />
                          )}

                          {/* Match Meta Row */}
                          <div className="flex items-center justify-between mb-6">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                              isLive 
                                ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                                : isEnded
                                  ? theme === "black" ? "bg-zinc-850 text-zinc-400 border border-zinc-800" : "bg-zinc-150 text-zinc-500"
                                  : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            }`}>
                              {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
                              {isLive ? match.statusText?.[lang] || match.statusText?.en || t.live : isEnded ? t.ended : t.upcoming}
                            </span>

                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-mono tracking-wider ${theme === 'black' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                {timeString}
                              </span>
                            </div>
                          </div>

                          {/* Competitors Layout */}
                          <div className="grid grid-cols-3 items-center gap-2 mb-6">
                            {/* Team A */}
                            <div className="text-center">
                              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center font-bold text-lg mb-2 shadow-sm overflow-hidden ${
                                theme === "black" ? "bg-zinc-900 border border-zinc-800 text-zinc-100" : "bg-zinc-100 border border-zinc-200 text-zinc-900"
                              }`}>
                                {match.logoA ? (
                                  <img 
                                    src={match.logoA} 
                                    alt={teamAName} 
                                    className="w-8 h-8 object-contain"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = ""; // Clear src if loading fails
                                    }}
                                  />
                                ) : (
                                  teamAName.charAt(0)
                                )}
                              </div>
                              <p className="text-xs font-bold truncate">{teamAName}</p>
                            </div>

                            {/* Play Button instead of Score */}
                            <div className="text-center flex flex-col items-center justify-center">
                              {shouldShowPlayButton(match) ? (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setStreamingMatch(match);
                                      setStreamUrl(match.streamUrl || "");
                                      setStreamType(match.streamType || "iframe");
                                      setIsStreamModalOpen(true);
                                    }}
                                    className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all transform hover:scale-110 active:scale-95 group/play border border-amber-600/15"
                                    title={lang === "ar" ? "تشغيل البث المباشر" : "Watch Live Stream"}
                                  >
                                    <Play className="w-5 h-5 fill-current ml-0.5 text-black" />
                                  </button>
                                  <span className="text-[10px] font-black text-amber-500 mt-2.5 block tracking-wider uppercase animate-pulse">
                                    {lang === "ar" ? "بث مباشر" : "Live Stream"}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                                    <span className="text-lg font-black font-mono tracking-tight text-white">{match.scoreA !== undefined ? match.scoreA : 0}</span>
                                    <span className="text-zinc-500 font-bold text-sm">:</span>
                                    <span className="text-lg font-black font-mono tracking-tight text-white">{match.scoreB !== undefined ? match.scoreB : 0}</span>
                                  </div>
                                  <span className={`text-[9px] font-extrabold mt-2.5 px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${
                                    match.status === "ended" 
                                      ? "bg-zinc-900/50 text-zinc-500 border-zinc-850" 
                                      : "bg-amber-500/5 text-amber-500/70 border-amber-500/10"
                                  }`}>
                                    {match.status === "ended" 
                                      ? (lang === "ar" ? "انتهت" : "Ended") 
                                      : (lang === "ar" ? "قريباً" : "Upcoming")}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Team B */}
                            <div className="text-center">
                              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center font-bold text-lg mb-2 shadow-sm overflow-hidden ${
                                theme === "black" ? "bg-zinc-900 border border-zinc-800 text-zinc-100" : "bg-zinc-100 border border-zinc-200 text-zinc-900"
                              }`}>
                                {match.logoB ? (
                                  <img 
                                    src={match.logoB} 
                                    alt={teamBName} 
                                    className="w-8 h-8 object-contain"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = ""; // Clear src if loading fails
                                    }}
                                  />
                                ) : (
                                  teamBName.charAt(0)
                                )}
                              </div>
                              <p className="text-xs font-bold truncate">{teamBName}</p>
                            </div>
                          </div>

                          {/* Venue & League Details */}
                          <div className={`flex items-center justify-between gap-4 pt-4 border-t text-[11px] ${
                            theme === "black" ? "border-zinc-900/80 text-zinc-500" : "border-zinc-100 text-zinc-500"
                          }`}>
                            <div className="flex items-center gap-1.5 truncate">
                              <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                              <span className="font-medium truncate">{venueString}</span>
                            </div>
                            {match.leagueName && (
                              <div className="flex items-center gap-1.5 shrink-0 max-w-[50%]">
                                {match.leagueLogo && (
                                  <img 
                                    src={match.leagueLogo} 
                                    alt="League" 
                                    className="w-3.5 h-3.5 object-contain"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                )}
                                <span className="font-bold opacity-85 text-[10px] truncate">{getTranslation(match.leagueName)}</span>
                              </div>
                            )}
                          </div>

                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-1 lg:col-span-2 text-center py-16">
                      <Tv className="w-12 h-12 mx-auto text-zinc-650 mb-3 stroke-1" />
                      <p className={`text-sm ${theme === 'black' ? 'text-zinc-500' : 'text-zinc-400'}`}>{t.noResults}</p>
                    </div>
                  )}

                </div>

              </motion.div>
            )}

            {/* 2. CINEMA TAB CONTENT (Embedded Iframe for CinemaOS) */}
            {activeTab === "cinema" && (
              <motion.div
                key="cinema-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className={`p-4 rounded-3xl border overflow-hidden ${
                  theme === "black" 
                    ? "bg-zinc-950/80 border-zinc-800" 
                    : "bg-white border-zinc-200 shadow-sm"
                }`}>
                  {/* Iframe navigation/header utility */}
                  <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 mb-4 border-b ${
                    theme === "black" ? "border-zinc-900" : "border-zinc-100"
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${
                        theme === "black" ? "bg-red-500/10 text-red-500" : "bg-zinc-100 text-zinc-900"
                      }`}>
                        <Film className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold tracking-tight">CinemaOS</h3>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {lang === "ar" ? "اتصال آمن" : "Secure Link"}
                          </span>
                        </div>
                        <p className={`text-[10px] ${theme === 'black' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                          cinemaos.live
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                      <button
                        onClick={() => {
                          const iframe = document.getElementById("cinemaos-iframe") as HTMLIFrameElement;
                          if (iframe) iframe.src = "https://cinemaos.live/";
                        }}
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 ${
                          theme === "black" 
                            ? "bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-850" 
                            : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200"
                        }`}
                        title={lang === "ar" ? "إعادة تحميل الصفحة" : "Reload Screen"}
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">{lang === "ar" ? "تحديث" : "Refresh"}</span>
                      </button>

                      <a
                        href="https://cinemaos.live/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 ${
                          theme === "black" 
                            ? "bg-white hover:bg-zinc-200 text-black border border-white" 
                            : "bg-zinc-950 hover:bg-zinc-800 text-white"
                        }`}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{lang === "ar" ? "فتح في نافذة جديدة" : "Open in New Tab"}</span>
                      </a>
                    </div>
                  </div>

                  {/* Fully responsive sandbox safe iframe */}
                  <div className={`relative w-full rounded-2xl overflow-hidden border ${
                    theme === "black" ? "border-zinc-900 bg-[#020202]" : "border-zinc-100 bg-slate-50"
                  }`}>
                    <iframe
                      id="cinemaos-iframe"
                      src="https://cinemaos.live/"
                      title="CinemaOS live client"
                      className="w-full h-[650px] md:h-[780px] lg:h-[850px] border-none"
                      allow="autoplay; encrypted-media; fullscreen"
                      sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
                    />
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

      {/* FOOTER */}
      <footer className={`fixed bottom-0 left-0 right-0 z-40 border-t py-3 text-center text-[10px] font-medium tracking-wide ${
        theme === "black" 
          ? "border-zinc-900 bg-zinc-950 text-zinc-500" 
          : "border-zinc-200 bg-white text-zinc-400"
      }`}>
        <p>© 2026 {lang === "ar" ? "بوابة النخبة للرياضة والسينما. جميع الحقوق محفوظة." : "Elite Sports & Cinema Portal. All rights reserved."}</p>
      </footer>

      {/* BOOKING MODAL (TICKET SELECTOR) */}
      <AnimatePresence>
        {selectedMovieForBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMovieForBooking(null)}
              className="absolute inset-0 bg-black/80 md:backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative z-10 w-full max-w-lg rounded-3xl p-6 md:p-8 border shadow-2xl overflow-hidden md:backdrop-blur-2xl transition-all duration-500 ${
                theme === "black"
                  ? "bg-zinc-950 border-white/[0.08] text-zinc-100"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              
              {/* Close button */}
              <button
                id="btn-close-booking"
                onClick={() => setSelectedMovieForBooking(null)}
                className={`absolute top-4 ${lang === "ar" ? "left-4" : "right-4"} p-2 rounded-xl transition-all ${
                  theme === "black" ? "hover:bg-white/10 text-zinc-400 hover:text-zinc-100" : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Status Header */}
              <div className="mb-6">
                <span className="text-[10px] uppercase tracking-widest font-black text-amber-500">
                  {t.ticketBooking}
                </span>
                <h4 className="text-xl font-black mt-1">
                  {selectedMovieForBooking.title[lang]}
                </h4>
                <p className={`text-xs mt-1 font-bold ${theme === 'black' ? 'text-zinc-500' : 'text-slate-400'}`}>
                  {selectedMovieForBooking.genreText[lang]} • {selectedMovieForBooking.price} {t.currency}
                </p>
              </div>

              {/* Success Screen */}
              {bookingCompleted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center"
                >
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <h5 className="text-lg font-black text-emerald-400">{t.bookingSuccess}</h5>
                  <p className={`text-xs mt-2 font-bold ${theme === 'black' ? 'text-zinc-500' : 'text-slate-400'}`}>
                    {t.bookingFor} {selectedMovieForBooking.title[lang]} ({selectedSeats.join(", ")})
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Select Showtime */}
                  <div>
                    <span className="text-xs font-black block mb-2">{t.showtimes}</span>
                    <div className="flex gap-2 flex-wrap">
                      {selectedMovieForBooking.showtimes.map((st, index) => (
                        <button
                          key={`${st}-${index}`}
                          onClick={() => setSelectedShowtime(st)}
                          className={`px-3.5 py-2.5 text-xs font-mono font-black rounded-xl border transition-all cursor-pointer ${
                            selectedShowtime === st
                              ? "bg-amber-500 border-amber-500 text-black shadow-md shadow-amber-500/10"
                              : theme === "black"
                                ? "bg-white/[0.03] border-white/[0.05] text-zinc-300 hover:border-white/[0.12]"
                                : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-250"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Seat Map */}
                  <div>
                    <span className="text-xs font-black block mb-2">{t.selectSeat}</span>
                    
                    {/* Screens Indicator */}
                    <div className="w-full text-center py-1 rounded-sm text-[9px] font-black tracking-widest uppercase mb-4 opacity-50 border-b border-dashed border-white/10">
                      {lang === "ar" ? "شاشة العرض" : "Cinema Screen"}
                    </div>

                    {/* Seat Grid */}
                    <div className="grid grid-cols-6 gap-2 max-w-sm mx-auto justify-center">
                      {seatMatrix.map(seat => {
                        const isSelected = selectedSeats.includes(seat.id);
                        return (
                          <button
                            key={seat.id}
                            disabled={seat.isReserved}
                            onClick={() => handleSeatClick(seat.id)}
                            className={`aspect-square rounded-lg text-[9px] font-black font-mono transition-all flex items-center justify-center cursor-pointer ${
                              seat.isReserved
                                ? theme === "black" ? "bg-white/[0.02] text-zinc-700 cursor-not-allowed opacity-20" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : isSelected
                                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/15"
                                  : theme === "black"
                                    ? "bg-white/[0.04] text-zinc-400 border border-white/[0.05] hover:bg-white/[0.1]"
                                    : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                            }`}
                          >
                            {seat.id}
                          </button>
                        );
                      })}
                    </div>

                    {/* Legend keys */}
                    <div className="flex items-center justify-center gap-4 mt-4 text-[10px] font-black text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-sm ${theme === "black" ? "bg-white/[0.04]" : "bg-slate-100"}`} />
                        <span>{t.seatAvailable}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-amber-500" />
                        <span>{t.seatSelected}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-sm opacity-30 ${theme === "black" ? "bg-white/[0.02]" : "bg-slate-200"}`} />
                        <span>{t.seatReserved}</span>
                      </div>
                    </div>

                  </div>

                  {/* Summary & Booking Confirmation */}
                  <div className={`p-4 rounded-2xl border ${
                    theme === "black" ? "bg-white/[0.02] border-white/[0.05]" : "bg-slate-50 border-slate-100"
                  }`}>
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="text-zinc-500 font-bold">{t.selectedSeats}:</span>
                      <span className="font-mono font-black">{selectedSeats.join(", ") || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs mb-4">
                      <span className="text-zinc-500 font-bold">{t.ticketPrice}:</span>
                      <span className="font-black">{selectedMovieForBooking.price} {t.currency}</span>
                    </div>
                    
                    <div className={`border-t pt-3 flex justify-between items-center font-black ${
                      theme === "black" ? "border-white/[0.05]" : "border-slate-200"
                    }`}>
                      <span className="text-sm">{t.total}:</span>
                      <span className="text-base text-amber-500 font-mono">
                        {selectedSeats.length * selectedMovieForBooking.price} {t.currency}
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    id="btn-confirm-booking"
                    onClick={confirmBooking}
                    disabled={selectedSeats.length === 0}
                    className={`w-full py-4 rounded-2xl text-xs font-black transition-all duration-300 cursor-pointer ${
                      selectedSeats.length === 0
                        ? theme === "black" ? "bg-white/[0.02] text-zinc-600 cursor-not-allowed border border-white/[0.02]" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : theme === "black"
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 shadow-md shadow-amber-500/10"
                          : "bg-zinc-950 text-white hover:bg-zinc-800"
                    }`}
                  >
                    {t.bookNow}
                  </button>

                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIVE STREAM PLAYER MODAL */}
      <AnimatePresence>
        {isStreamModalOpen && streamingMatch && (
          <div className="fixed inset-0 bg-black/95 md:backdrop-blur-md z-50 overflow-y-auto p-2 sm:p-6 flex justify-center items-start">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className={`w-full my-auto sm:my-4 ${
                isTheaterMode ? "max-w-7xl" : "max-w-5xl"
              } rounded-3xl border ${theme === 'black' ? 'border-zinc-850 bg-zinc-950 text-zinc-100' : 'border-zinc-200 bg-white text-zinc-900'} overflow-hidden shadow-2xl transition-all duration-300`}
            >
              {/* Modal Header */}
              <div className={`p-4 sm:p-6 border-b ${theme === 'black' ? 'border-zinc-900 bg-zinc-900/40' : 'border-zinc-200 bg-zinc-50'} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs sm:text-sm font-black text-red-500 tracking-wider uppercase flex items-center gap-1">
                    {lang === "ar" ? "بث مباشر" : "LIVE STREAM"}
                  </span>
                  <span className={`text-xs ${theme === 'black' ? 'text-zinc-650' : 'text-zinc-300'} hidden sm:inline`}>|</span>
                  <span className={`text-xs ${theme === 'black' ? 'text-zinc-400' : 'text-zinc-600'} font-bold hidden sm:inline`}>
                    {streamingMatch.teamA[lang] || streamingMatch.teamA.en} vs {streamingMatch.teamB[lang] || streamingMatch.teamB.en}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Theater Mode Toggle button (only when playing a stream) */}
                  {streamUrl && (
                    <button
                      onClick={() => setIsTheaterMode(!isTheaterMode)}
                      className={`p-2 rounded-xl ${theme === 'black' ? 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-100' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-800'} transition-all text-xs font-bold flex items-center gap-1`}
                      title={lang === "ar" ? "نمط السينما" : "Theater Mode"}
                    >
                      <Tv className="w-4 h-4" />
                      <span className="hidden md:inline">{lang === "ar" ? "نمط السينما" : "Theater"}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsStreamModalOpen(false);
                      setStreamingMatch(null);
                      setStreamUrl("");
                    }}
                    className={`p-2 rounded-xl ${theme === 'black' ? 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-100' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-800'} transition-all`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main Content: Player Container */}
              <div className="grid grid-cols-1 lg:grid-cols-12">
                
                {/* Left Section: Video Player & Inputs */}
                <div className="lg:col-span-12 p-4 sm:p-6 flex flex-col justify-center min-h-[300px] sm:min-h-[450px]">
                  
                  {userRole === "viewer" ? (
                    /* VIEWERS VIEW */
                    !streamUrl ? (
                      /* VIEWER EMPTY STATE */
                      <div className="text-center py-12 px-6 max-w-xl mx-auto w-full space-y-6">
                        <div className={`w-16 h-16 mx-auto rounded-full ${theme === 'black' ? 'bg-zinc-900 text-zinc-500 border border-zinc-800' : 'bg-zinc-100 text-zinc-400 border border-zinc-200'} flex items-center justify-center`}>
                          <Eye className="w-8 h-8 animate-pulse" />
                        </div>
                        <div className="space-y-2">
                          <h3 className={`text-lg sm:text-xl font-black ${theme === 'black' ? 'text-zinc-300' : 'text-zinc-800'}`}>
                            {lang === "ar" ? "رابط البث المباشر غير متوفر بعد" : "Live Stream Not Available Yet"}
                          </h3>
                          <p className={`text-xs sm:text-sm ${theme === 'black' ? 'text-zinc-400' : 'text-zinc-650'} leading-relaxed`}>
                            {lang === "ar"
                              ? "لم يقم مسؤول الموقع بإضافة رابط البث المباشر لهذه المباراة بعد. يرجى الانتظار لحين قيام المسؤول بتحديث الرابط ومتابعة البث."
                              : "The site administrator has not added the live stream link for this match yet. Please wait until the administrator configures the stream."}
                          </p>
                        </div>
                        <div className={`py-2.5 px-4 rounded-xl ${theme === 'black' ? 'bg-zinc-900/50 border border-zinc-850 text-amber-500/80' : 'bg-amber-50 border border-amber-200 text-amber-600'} inline-flex items-center gap-2 text-xs font-semibold`}>
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                          <span>{lang === "ar" ? "سيتم التحديث فور إضافته من قبل المسؤول" : "Will automatically update when added by the admin"}</span>
                        </div>
                      </div>
                    ) : (
                      /* VIEWER PLAYING STATE */
                      <div className="space-y-4">
                        {/* Video Player Display Container */}
                        <div className={`relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-black border ${theme === 'black' ? 'border-zinc-850' : 'border-zinc-200'} shadow-2xl`}>
                          
                          {!isStreamVideoOrHls(streamUrl, streamType) ? (
                            <iframe
                              src={getEmbedUrl(streamUrl)}
                              title="Live Match Stream"
                              className="w-full h-full border-0 absolute inset-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                          ) : (
                            <HlsVideoPlayer
                              src={streamUrl}
                              className="absolute inset-0 w-full h-full"
                            />
                          )}

                          {/* Top-Right watermark/status overlay */}
                          <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2 bg-black/80 px-2.5 py-1 rounded-full text-[9px] font-bold text-red-500 border border-red-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                            <span>{lang === "ar" ? "بث مباشر" : "LIVE"}</span>
                          </div>
                        </div>

                        {/* Server Selector */}
                        <div className={`flex flex-col gap-2.5 p-4 rounded-2xl ${theme === 'black' ? 'bg-zinc-900/35 border border-zinc-900/80' : 'bg-zinc-50 border border-zinc-200'}`}>
                          <span className={`text-[10px] uppercase tracking-wider font-black ${theme === 'black' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            {lang === "ar" ? "اختر سيرفر المشاهدة:" : "Choose Streaming Server:"}
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {editingStreams.map((srv, idx) => {
                              const isAvailable = !!srv.url;
                              const isSelected = activeStreamIndex === idx;
                              return (
                                <button
                                  key={`stream-selector-${idx}`}
                                  disabled={!isAvailable}
                                  onClick={() => {
                                    setActiveStreamIndex(idx);
                                    setStreamUrl(srv.url);
                                    setStreamType(srv.type);
                                  }}
                                  className={`px-3 py-2.5 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-1 border ${
                                    isSelected
                                      ? "bg-amber-500 text-black border-amber-600/20 shadow-lg shadow-amber-500/10"
                                      : isAvailable
                                      ? (theme === 'black' ? "bg-zinc-900 hover:bg-zinc-850 text-zinc-100 border-zinc-800 hover:border-zinc-750 cursor-pointer" : "bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-200 hover:border-zinc-300 cursor-pointer shadow-sm")
                                      : (theme === 'black' ? "bg-zinc-950/50 text-zinc-650 border-zinc-900/50 cursor-not-allowed opacity-50" : "bg-zinc-50 text-zinc-400 border-zinc-100 cursor-not-allowed opacity-50")
                                  }`}
                                >
                                  <span>{srv.name}</span>
                                  <span className={`text-[8px] font-bold ${isSelected ? "text-black/60" : isAvailable ? "text-emerald-500" : (theme === 'black' ? "text-zinc-500" : "text-zinc-400")}`}>
                                    {isAvailable 
                                      ? (isSelected ? (lang === "ar" ? "نشط حالياً" : "Active Now") : (lang === "ar" ? "متاح" : "Available")) 
                                      : (lang === "ar" ? "غير متاح" : "Not Configured")}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Non-editable Status Banner */}
                        <div className={`flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl ${theme === 'black' ? 'bg-zinc-900/30 border border-zinc-900' : 'bg-zinc-50 border border-zinc-200'}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                            <div className="text-xs">
                              <span className={`font-bold block ${theme === 'black' ? 'text-zinc-400' : 'text-zinc-700'}`}>
                                {lang === "ar" ? "البث المباشر نشط الآن" : "Live Stream is Active"}
                              </span>
                              <span className={`text-[10px] block ${theme === 'black' ? 'text-zinc-500' : 'text-zinc-450'}`}>
                                {lang === "ar" ? "مشاهدة ممتعة للمباراة!" : "Enjoy watching the game!"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Match Details banner below player */}
                        <div className={`p-5 rounded-2xl ${theme === 'black' ? 'bg-zinc-900/50 border border-zinc-900' : 'bg-zinc-50 border border-zinc-200'} flex items-center justify-between gap-4`}>
                          <div className="flex items-center gap-3 sm:gap-4 flex-1">
                            {/* Team A */}
                            <div className="flex items-center gap-2 truncate">
                              <div className={`w-8 h-8 rounded-full ${theme === 'black' ? 'bg-zinc-800' : 'bg-zinc-200'} flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden`}>
                                {streamingMatch.logoA ? (
                                  <img src={streamingMatch.logoA} className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                                ) : (
                                  (streamingMatch.teamA[lang] || streamingMatch.teamA.en || "").charAt(0)
                                )}
                              </div>
                              <span className="text-xs sm:text-sm font-black truncate">{streamingMatch.teamA[lang] || streamingMatch.teamA.en}</span>
                            </div>

                            <div className={`px-2 py-0.5 ${theme === 'black' ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-200 text-zinc-600'} text-[10px] font-black rounded-md shrink-0`}>VS</div>

                            {/* Team B */}
                            <div className="flex items-center gap-2 truncate">
                              <div className={`w-8 h-8 rounded-full ${theme === 'black' ? 'bg-zinc-800' : 'bg-zinc-200'} flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden`}>
                                {streamingMatch.logoB ? (
                                  <img src={streamingMatch.logoB} className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                                ) : (
                                  (streamingMatch.teamB[lang] || streamingMatch.teamB.en || "").charAt(0)
                                )}
                              </div>
                              <span className="text-xs sm:text-sm font-black truncate">{streamingMatch.teamB[lang] || streamingMatch.teamB.en}</span>
                            </div>
                          </div>

                          <div className={`text-right text-[11px] ${theme === 'black' ? 'text-zinc-400' : 'text-zinc-500'} hidden sm:block shrink-0`}>
                            <p className="font-bold text-amber-500">{getTranslation(streamingMatch.leagueName) || (lang === 'ar' ? "دوري كرة قدم" : "Football League")}</p>
                            <p className="opacity-60 text-[9px] font-mono">{formatMatchTime(streamingMatch, lang)}</p>
                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    /* ADMINISTRATOR VIEW */
                    <div className="space-y-6">
                      {/* Admin Header Info */}
                      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b ${theme === 'black' ? 'border-zinc-900' : 'border-zinc-200'} pb-4 mb-2`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                            <Settings className="w-5 h-5 text-red-500 animate-spin" style={{ animationDuration: "12s" }} />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-red-500">
                              {lang === "ar" ? "لوحة التحكم بالسيرفرات الأربعة" : "Four Servers Admin Panel"}
                            </h3>
                            <p className={`text-[10px] ${theme === 'black' ? 'text-zinc-500' : 'text-zinc-450'} leading-relaxed`}>
                              {lang === "ar" ? "يمكنك ضبط ومعاينة وحفظ 4 مصادر بث مختلفة للمباراة" : "Configure, preview, and save 4 different stream sources for this match"}
                            </p>
                          </div>
                        </div>

                        {/* View as User Toggle helper */}
                        <button
                          onClick={() => setUserRole("viewer")}
                          className={`px-3 py-1.5 rounded-lg ${theme === 'black' ? 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border-zinc-850' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-800 border-zinc-200'} text-[10px] font-bold transition-all self-end sm:self-auto`}
                        >
                          {lang === "ar" ? "معاينة كـ مشاهد 👁️" : "View as Viewer 👁️"}
                        </button>
                      </div>

                      {/* Video Player Preview (if streamUrl is set) */}
                      {streamUrl ? (
                        <div className="space-y-4">
                          <div className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-black border ${theme === 'black' ? 'border-zinc-850' : 'border-zinc-200'} shadow-2xl`}>
                            {!isStreamVideoOrHls(streamUrl, streamType) ? (
                              <iframe
                                src={getEmbedUrl(streamUrl)}
                                title="Admin Live Match Stream Preview"
                                className="w-full h-full border-0 absolute inset-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              />
                            ) : (
                              <HlsVideoPlayer
                                src={streamUrl}
                                className="absolute inset-0 w-full h-full"
                              />
                            )}

                            {/* Top-Right watermark/status overlay */}
                            <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2 bg-black/80 px-2.5 py-1 rounded-full text-[9px] font-bold text-red-500 border border-red-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                              <span>{lang === "ar" ? "معاينة البث" : "PREVIEWING"}</span>
                            </div>
                          </div>

                          {/* Preview Status Banner */}
                          <div className={`flex items-center justify-between gap-4 p-3.5 rounded-xl ${theme === 'black' ? 'bg-zinc-900/30 border border-zinc-900 text-zinc-400' : 'bg-zinc-50 border border-zinc-200 text-zinc-650'} text-xs`}>
                            <div className="truncate flex-1 min-w-0">
                              <span className={`font-bold block ${theme === 'black' ? 'text-zinc-500' : 'text-zinc-450'}`}>
                                {lang === "ar" ? "السيرفر المعاين حالياً:" : "Currently Previewing:"}
                              </span>
                              <span className={`font-mono text-[10px] ${theme === 'black' ? 'text-zinc-400' : 'text-zinc-600'} truncate block`}>
                                {editingStreams[activeStreamIndex]?.name || `Server ${activeStreamIndex + 1}`}: {streamUrl}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setStreamUrl("");
                              }}
                              className={`px-3 py-1.5 rounded-lg ${theme === 'black' ? 'bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border-zinc-700' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-700 border-zinc-300'} font-bold shrink-0 transition-all text-[10px]`}
                            >
                              {lang === "ar" ? "إيقاف المعاينة" : "Stop Preview"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* ADMIN EMPTY PREVIEW STATE */
                        <div className={`text-center py-8 rounded-2xl ${theme === 'black' ? 'bg-zinc-900/10 border border-zinc-900/50' : 'bg-zinc-50 border border-zinc-200'} space-y-3`}>
                          <div className={`w-12 h-12 mx-auto rounded-full ${theme === 'black' ? 'bg-zinc-900 text-zinc-650 border-zinc-850' : 'bg-zinc-200 text-zinc-500 border-zinc-300'} flex items-center justify-center`}>
                             <Tv className="w-6 h-6" />
                          </div>
                          <div>
                            <p className={`text-xs font-bold ${theme === 'black' ? 'text-zinc-400' : 'text-zinc-700'}`}>
                              {lang === "ar" ? "لا توجد معاينة نشطة" : "No Active Preview"}
                            </p>
                            <p className={`text-[10px] ${theme === 'black' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                              {lang === "ar" ? "انقر على 'معاينة' لأي سيرفر أدناه لتجربته وتشغيله هنا" : "Click 'Preview' on any server below to test its video feed here"}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 4 Servers Editing Fields */}
                      <div className="space-y-4 pt-2">
                        <span className={`text-[11px] uppercase tracking-wider font-black ${theme === 'black' ? 'text-zinc-400 border-zinc-900' : 'text-zinc-550 border-zinc-200'} block border-b pb-2`}>
                          {lang === "ar" ? "روابط السيرفرات الأربعة للمباراة:" : "Configuration of the 4 Servers for Match:"}
                        </span>

                        <div className="space-y-4">
                          {editingStreams.map((srv, idx) => (
                            <div key={`stream-config-${idx}`} className={`p-4 rounded-xl ${theme === 'black' ? 'bg-zinc-900/30 border border-zinc-900 hover:border-zinc-850' : 'bg-zinc-50 border border-zinc-200 hover:border-zinc-300'} transition-all space-y-3`}>
                              {/* Server Title & Preview Switch */}
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-amber-500 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  {srv.name || `Server ${idx + 1}`}
                                </span>

                                <div className="flex items-center gap-2">
                                  {srv.url && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveStreamIndex(idx);
                                        setStreamUrl(srv.url);
                                        setStreamType(srv.type);
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                                        activeStreamIndex === idx && streamUrl === srv.url
                                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                          : (theme === 'black' ? "bg-zinc-850 hover:bg-zinc-800 text-zinc-400 border-zinc-750" : "bg-zinc-200 hover:bg-zinc-300 text-zinc-600 border-zinc-300")
                                      }`}
                                    >
                                      {lang === "ar" ? "👁️ تشغيل في المعاينة" : "👁️ Test in Preview"}
                                    </button>
                                  )}
                                  
                                  {/* Auto Demo Loader */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...editingStreams];
                                      updated[idx] = {
                                        ...updated[idx],
                                        url: idx === 0 
                                          ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                                          : idx === 1
                                          ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
                                          : idx === 2
                                          ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                                          : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
                                        type: "video"
                                      };
                                      setEditingStreams(updated);
                                    }}
                                    className={`px-2 py-1 rounded ${theme === 'black' ? 'bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 hover:border-zinc-800 text-zinc-500 hover:text-zinc-350' : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:text-zinc-800'} text-[9px] font-bold transition-all`}
                                  >
                                    {lang === "ar" ? "رابط تجريبي 🪄" : "Load Demo 🪄"}
                                  </button>
                                </div>
                              </div>

                              {/* Input and Type row */}
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                {/* Server Name Input */}
                                <div className="md:col-span-3">
                                  <label className={`block text-[10px] font-bold ${theme === 'black' ? 'text-zinc-500' : 'text-zinc-500'} mb-1`}>
                                    {lang === "ar" ? "اسم السيرفر:" : "Server Name:"}
                                  </label>
                                  <input
                                    type="text"
                                    placeholder={lang === "ar" ? "مثال: سيرفر 1" : "e.g. Server 1"}
                                    value={srv.name}
                                    onChange={(e) => {
                                      const updated = [...editingStreams];
                                      updated[idx] = {
                                        ...updated[idx],
                                        name: e.target.value
                                      };
                                      setEditingStreams(updated);
                                    }}
                                    className={`w-full px-3 py-2 ${theme === 'black' ? 'bg-zinc-950 border border-zinc-850 text-zinc-100 placeholder-zinc-650' : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400'} rounded-lg text-xs focus:outline-none focus:border-amber-500 transition-all font-bold`}
                                  />
                                </div>

                                {/* URL Input */}
                                <div className="md:col-span-6">
                                  <label className={`block text-[10px] font-bold ${theme === 'black' ? 'text-zinc-500' : 'text-zinc-500'} mb-1`}>
                                    {lang === "ar" ? "رابط البث (URL / Iframe):" : "Stream URL or Iframe Embed:"}
                                  </label>
                                  <input
                                    type="text"
                                    placeholder={lang === "ar" ? "أدخل الرابط (مثال: iframe أو m3u8 أو mp4)..." : "Enter stream URL or iframe code..."}
                                    value={srv.url}
                                    onChange={(e) => {
                                      const updated = [...editingStreams];
                                      updated[idx] = {
                                        ...updated[idx],
                                        url: e.target.value
                                      };
                                      setEditingStreams(updated);
                                    }}
                                    dir="ltr"
                                    className={`w-full px-3 py-2 ${theme === 'black' ? 'bg-zinc-950 border border-zinc-850 text-zinc-100 placeholder-zinc-650' : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400'} rounded-lg text-xs focus:outline-none focus:border-amber-500 transition-all font-mono`}
                                  />
                                </div>

                                {/* Type selector */}
                                <div className="md:col-span-3">
                                  <label className={`block text-[10px] font-bold ${theme === 'black' ? 'text-zinc-500' : 'text-zinc-500'} mb-1`}>
                                    {lang === "ar" ? "نوع المشغل:" : "Player Type:"}
                                  </label>
                                  <div className={`flex gap-1 ${theme === 'black' ? 'bg-zinc-950 border border-zinc-850' : 'bg-zinc-100 border-zinc-200'} p-1 rounded-lg h-[38px] items-center`}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...editingStreams];
                                        updated[idx] = { ...updated[idx], type: "iframe" };
                                        setEditingStreams(updated);
                                      }}
                                      className={`flex-1 h-full rounded text-[10px] font-bold transition-all ${
                                        srv.type === "iframe"
                                          ? (theme === 'black' ? "bg-zinc-850 text-amber-500" : "bg-white text-amber-600 shadow-sm")
                                          : (theme === 'black' ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-500 hover:text-zinc-750")
                                      }`}
                                    >
                                      Iframe
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...editingStreams];
                                        updated[idx] = { ...updated[idx], type: "video" };
                                        setEditingStreams(updated);
                                      }}
                                      className={`flex-1 h-full rounded text-[10px] font-bold transition-all ${
                                        srv.type === "video"
                                          ? (theme === 'black' ? "bg-zinc-850 text-amber-500" : "bg-white text-amber-600 shadow-sm")
                                          : (theme === 'black' ? "text-zinc-500 hover:text-zinc-350" : "text-zinc-500 hover:text-zinc-750")
                                      }`}
                                    >
                                      Video
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className={`flex items-center justify-end gap-3 pt-4 border-t ${theme === 'black' ? 'border-zinc-900' : 'border-zinc-200'}`}>
                        {/* Save all button */}
                        <button
                          type="button"
                          onClick={() => {
                            handleSaveAllStreams(streamingMatch.id, editingStreams);
                          }}
                          className="px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-black rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 border border-green-600/15 shadow-lg shadow-green-500/10"
                        >
                          <Check className="w-4 h-4" />
                          <span>{lang === "ar" ? "حفظ وتفعيل السيرفرات الأربعة للمشاهدين 💾" : "Save All 4 Servers 💾"}</span>
                        </button>
                      </div>

                      {/* Match Details banner below player */}
                      <div className={`p-5 rounded-2xl ${theme === 'black' ? 'bg-zinc-900/50 border border-zinc-900' : 'bg-zinc-50 border border-zinc-200'} flex items-center justify-between gap-4`}>
                        <div className="flex items-center gap-3 sm:gap-4 flex-1">
                          {/* Team A */}
                          <div className="flex items-center gap-2 truncate">
                            <div className={`w-8 h-8 rounded-full ${theme === 'black' ? 'bg-zinc-800' : 'bg-zinc-200'} flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden`}>
                              {streamingMatch.logoA ? (
                                <img src={streamingMatch.logoA} className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                              ) : (
                                (streamingMatch.teamA[lang] || streamingMatch.teamA.en || "").charAt(0)
                              )}
                            </div>
                            <span className="text-xs sm:text-sm font-black truncate">{streamingMatch.teamA[lang] || streamingMatch.teamA.en}</span>
                          </div>

                          <div className={`px-2 py-0.5 ${theme === 'black' ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-200 text-zinc-600'} text-[10px] font-black rounded-md shrink-0`}>VS</div>

                          {/* Team B */}
                          <div className="flex items-center gap-2 truncate">
                            <div className={`w-8 h-8 rounded-full ${theme === 'black' ? 'bg-zinc-800' : 'bg-zinc-200'} flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden`}>
                              {streamingMatch.logoB ? (
                                <img src={streamingMatch.logoB} className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                              ) : (
                                (streamingMatch.teamB[lang] || streamingMatch.teamB.en || "").charAt(0)
                              )}
                            </div>
                            <span className="text-xs sm:text-sm font-black truncate">{streamingMatch.teamB[lang] || streamingMatch.teamB.en}</span>
                          </div>
                        </div>

                        <div className={`text-right text-[11px] ${theme === 'black' ? 'text-zinc-400' : 'text-zinc-500'} hidden sm:block shrink-0`}>
                          <p className="font-bold text-amber-500">{getTranslation(streamingMatch.leagueName) || (lang === 'ar' ? "دوري كرة قدم" : "Football League")}</p>
                          <p className="opacity-60 text-[9px] font-mono">{formatMatchTime(streamingMatch, lang)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>



              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MATCH DETAILS MODAL */}
      <AnimatePresence>
        {selectedMatchForDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 md:backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedMatchForDetails(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className={`w-full max-w-2xl rounded-3xl border overflow-hidden shadow-2xl ${
                theme === "black" ? "bg-zinc-950 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header section (Match Score & Teams) */}
              <div className={`p-6 border-b relative ${theme === 'black' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}>
                <button
                  onClick={() => setSelectedMatchForDetails(null)}
                  className={`absolute top-4 ${lang === 'ar' ? 'left-4' : 'right-4'} p-2 rounded-xl transition-all ${
                    theme === 'black' ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100' : 'hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>

                {/* League name */}
                <div className="text-center mb-4 flex items-center justify-center gap-1.5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 ${
                    theme === 'black' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                  }`}>
                    {selectedMatchForDetails.leagueLogo && (
                      <img 
                        src={selectedMatchForDetails.leagueLogo} 
                        alt="League" 
                        className="w-3.5 h-3.5 object-contain inline-block"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    {getTranslation(selectedMatchForDetails.leagueName) || (lang === "ar" ? "مباراة كرة قدم" : "Football Match")}
                  </span>
                </div>

                <div className="grid grid-cols-3 items-center gap-4 text-center">
                  {/* Home Team */}
                  <div>
                    <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center font-bold text-xl mb-3 shadow-md overflow-hidden ${
                      theme === "black" ? "bg-zinc-800 border border-zinc-700 text-zinc-100" : "bg-zinc-100 border border-zinc-200 text-zinc-900"
                    }`}>
                      {selectedMatchForDetails.logoA ? (
                        <img 
                          src={selectedMatchForDetails.logoA} 
                          alt={selectedMatchForDetails.teamA[lang] || selectedMatchForDetails.teamA.en} 
                          className="w-10 h-10 object-contain"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = ""; // Clear src if loading fails
                          }}
                        />
                      ) : (
                        (selectedMatchForDetails.teamA[lang] || selectedMatchForDetails.teamA.en || "").charAt(0)
                      )}
                    </div>
                    <p className="text-sm font-black">{selectedMatchForDetails.teamA[lang] || selectedMatchForDetails.teamA.en}</p>
                  </div>

                  {/* Score */}
                  <div>
                    {selectedMatchForDetails.scoreA !== undefined && selectedMatchForDetails.scoreB !== undefined ? (
                      <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-3xl font-black font-mono tracking-tight">{selectedMatchForDetails.scoreA}</span>
                          <span className="text-zinc-500 font-bold text-2xl">:</span>
                          <span className="text-3xl font-black font-mono tracking-tight">{selectedMatchForDetails.scoreB}</span>
                        </div>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold mt-2 ${
                          selectedMatchForDetails.status === "live" ? "bg-red-500/10 text-red-500 animate-pulse border border-red-500/20" : "bg-zinc-800 text-zinc-400"
                        }`}>
                          {selectedMatchForDetails.statusText?.[lang] || selectedMatchForDetails.statusText?.en}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className={`text-xs font-black px-4 py-1.5 rounded-xl ${theme === 'black' ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-600'}`}>
                          VS
                        </span>
                        <span className="text-[10px] text-zinc-500 mt-2 font-medium">
                          {formatMatchTime(selectedMatchForDetails, lang)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Away Team */}
                  <div>
                    <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center font-bold text-xl mb-3 shadow-md overflow-hidden ${
                      theme === "black" ? "bg-zinc-800 border border-zinc-700 text-zinc-100" : "bg-zinc-100 border border-zinc-200 text-zinc-900"
                    }`}>
                      {selectedMatchForDetails.logoB ? (
                        <img 
                          src={selectedMatchForDetails.logoB} 
                          alt={selectedMatchForDetails.teamB[lang] || selectedMatchForDetails.teamB.en} 
                          className="w-10 h-10 object-contain"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = ""; // Clear src if loading fails
                          }}
                        />
                      ) : (
                        (selectedMatchForDetails.teamB[lang] || selectedMatchForDetails.teamB.en || "").charAt(0)
                      )}
                    </div>
                    <p className="text-sm font-black">{selectedMatchForDetails.teamB[lang] || selectedMatchForDetails.teamB.en}</p>
                  </div>
                </div>
              </div>

              {/* Tab Buttons inside details modal */}
              <div className={`flex border-b ${theme === 'black' ? 'border-zinc-800 bg-zinc-900/20' : 'border-zinc-100 bg-zinc-50/50'}`}>
                <button
                  onClick={() => setActiveDetailsTab("events")}
                  className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
                    activeDetailsTab === "events"
                      ? theme === "black" ? "border-amber-500 text-amber-500 bg-amber-500/[0.02]" : "border-zinc-950 text-zinc-950 bg-zinc-100/50"
                      : "border-transparent text-zinc-500 hover:text-zinc-450"
                  }`}
                >
                  {lang === "ar" ? "الأحداث والأهداف" : "Events & Goals"}
                </button>
                <button
                  onClick={() => setActiveDetailsTab("stats")}
                  className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
                    activeDetailsTab === "stats"
                      ? theme === "black" ? "border-amber-500 text-amber-500 bg-amber-500/[0.02]" : "border-zinc-950 text-zinc-950 bg-zinc-100/50"
                      : "border-transparent text-zinc-500 hover:text-zinc-450"
                  }`}
                >
                  {lang === "ar" ? "الإحصائيات" : "Statistics"}
                </button>
                <button
                  onClick={() => setActiveDetailsTab("lineup")}
                  className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
                    activeDetailsTab === "lineup"
                      ? theme === "black" ? "border-amber-500 text-amber-500 bg-amber-500/[0.02]" : "border-zinc-950 text-zinc-950 bg-zinc-100/50"
                      : "border-transparent text-zinc-500 hover:text-zinc-455"
                  }`}
                >
                  {lang === "ar" ? "التشكيلة" : "Lineups"}
                </button>
              </div>

              {/* Modal Tab Content */}
              <div className="p-6 max-h-[350px] overflow-y-auto">
                {/* TAB 1: EVENTS / SCORERS */}
                {activeDetailsTab === "events" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-6 divide-x divide-dashed divide-zinc-800">
                      {/* Home Scorers */}
                      <div className="space-y-2 pr-2">
                        <h4 className="text-xs font-extrabold text-zinc-400 mb-2 uppercase tracking-wider">
                          {lang === "ar" ? "أهداف الأرض" : "Home Goals"}
                        </h4>
                        {selectedMatchForDetails.scorers?.home?.length > 0 ? (
                          selectedMatchForDetails.scorers.home.map((goal: any, index: number) => (
                            <div key={`details-goal-home-${index}`} className="flex items-center gap-2 text-xs">
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold font-mono text-[10px]">
                                {goal.time}'
                              </span>
                              <div>
                                <p className="font-bold">{getTranslation(goal.name)}</p>
                                {goal.assist && <p className="text-[10px] text-zinc-500">Assist: {getTranslation(goal.assist)}</p>}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-zinc-500 italic">
                            {lang === "ar" ? "لا توجد أهداف" : "No goals scored"}
                          </p>
                        )}
                      </div>

                      {/* Away Scorers */}
                      <div className="space-y-2 pl-4">
                        <h4 className="text-xs font-extrabold text-zinc-400 mb-2 uppercase tracking-wider">
                          {lang === "ar" ? "أهداف الضيوف" : "Away Goals"}
                        </h4>
                        {selectedMatchForDetails.scorers?.away?.length > 0 ? (
                          selectedMatchForDetails.scorers.away.map((goal: any, index: number) => (
                            <div key={`details-goal-away-${index}`} className="flex items-center gap-2 text-xs">
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold font-mono text-[10px]">
                                {goal.time}'
                              </span>
                              <div>
                                <p className="font-bold">{getTranslation(goal.name)}</p>
                                {goal.assist && <p className="text-[10px] text-zinc-500">Assist: {getTranslation(goal.assist)}</p>}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-zinc-500 italic">
                            {lang === "ar" ? "لا توجد أهداف" : "No goals scored"}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Venue details */}
                    <div className={`mt-6 pt-4 border-t text-xs flex items-center justify-between ${theme === 'black' ? 'border-zinc-800 text-zinc-400' : 'border-zinc-100 text-zinc-500'}`}>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-zinc-500" />
                        <span>{selectedMatchForDetails.venue[lang] || selectedMatchForDetails.venue.en}</span>
                      </span>
                      <span>
                        {lang === "ar" ? "كرة قدم" : "Football"}
                      </span>
                    </div>
                  </div>
                )}

                {/* TAB 2: STATS */}
                {activeDetailsTab === "stats" && (
                  <div className="space-y-4">
                    {selectedMatchForDetails.stats?.length > 0 ? (
                      selectedMatchForDetails.stats.map((stat: any, index: number) => {
                        const homeVal = parseFloat(stat.home) || 0;
                        const awayVal = parseFloat(stat.away) || 0;
                        const total = homeVal + awayVal;
                        const homePercent = total > 0 ? (homeVal / total) * 100 : 50;
                        const awayPercent = total > 0 ? (awayVal / total) * 100 : 50;

                        return (
                          <div key={`details-stat-${index}`} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                              <span>{stat.home}</span>
                              <span className="text-zinc-400 font-medium">{getTranslation(stat.title)}</span>
                              <span>{stat.away}</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                              <div
                                className="h-full bg-amber-500 transition-all duration-500"
                                style={{ width: `${homePercent}%` }}
                              />
                              <div
                                className="h-full bg-red-600 transition-all duration-500"
                                style={{ width: `${awayPercent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <Tv className="w-12 h-12 text-zinc-700 mx-auto mb-2" />
                        <p className="text-sm text-zinc-500">
                          {lang === "ar" ? "الإحصائيات المباشرة ستتوفر فور ركلة البداية." : "Live stats will update as soon as the match kicks off."}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: LINEUPS */}
                {activeDetailsTab === "lineup" && (
                  <div className="space-y-6">
                    {selectedMatchForDetails.lineups ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Home Lineup */}
                        <div>
                          <h4 className="text-xs font-extrabold text-amber-500 mb-3 border-b border-amber-500/10 pb-1 tracking-wider uppercase">
                            {lang === "ar" ? "تشكيلة الأرض" : "Home XI"}
                          </h4>
                          <div className="space-y-2">
                            {selectedMatchForDetails.lineups.home?.players?.map((p: any, i: number) => (
                              <div key={`lineup-home-player-${i}`} className="flex items-center gap-2 text-xs">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[9px] ${
                                  theme === 'black' ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'
                                }`}>
                                  {p.shirtNumber}
                                </span>
                                <span className="font-semibold">{p.name}</span>
                                <span className="text-[9px] text-zinc-500 uppercase">{p.role}</span>
                              </div>
                            ))}
                          </div>

                          <h5 className="text-[11px] font-bold text-zinc-500 mt-4 mb-2">
                            {lang === "ar" ? "الاحتياط" : "Substitutes"}
                          </h5>
                          <div className="space-y-1.5 opacity-80">
                            {selectedMatchForDetails.lineups.home?.bench?.map((p: any, i: number) => (
                              <div key={`lineup-home-bench-${i}`} className="flex items-center gap-2 text-[11px]">
                                <span className="text-[9px] text-zinc-500">#{p.shirtNumber}</span>
                                <span>{p.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Away Lineup */}
                        <div>
                          <h4 className="text-xs font-extrabold text-red-500 mb-3 border-b border-red-500/10 pb-1 tracking-wider uppercase">
                            {lang === "ar" ? "تشكيلة الضيوف" : "Away XI"}
                          </h4>
                          <div className="space-y-2">
                            {selectedMatchForDetails.lineups.away?.players?.map((p: any, i: number) => (
                              <div key={`lineup-away-player-${i}`} className="flex items-center gap-2 text-xs">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[9px] ${
                                  theme === 'black' ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'
                                }`}>
                                  {p.shirtNumber}
                                </span>
                                <span className="font-semibold">{p.name}</span>
                                <span className="text-[9px] text-zinc-500 uppercase">{p.role}</span>
                              </div>
                            ))}
                          </div>

                          <h5 className="text-[11px] font-bold text-zinc-500 mt-4 mb-2">
                            {lang === "ar" ? "الاحتياط" : "Substitutes"}
                          </h5>
                          <div className="space-y-1.5 opacity-80">
                            {selectedMatchForDetails.lineups.away?.bench?.map((p: any, i: number) => (
                              <div key={`lineup-away-bench-${i}`} className="flex items-center gap-2 text-[11px]">
                                <span className="text-[9px] text-zinc-500">#{p.shirtNumber}</span>
                                <span>{p.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <Shield className="w-12 h-12 text-zinc-750 mx-auto mb-2 stroke-1" />
                        <p className="text-sm text-zinc-400">
                          {lang === "ar" ? "التشكيلة الرسمية ستتوفر قبل بداية المباراة بحوالي ٦٠ دقيقة." : "Official lineups will be available approximately 60 minutes before kickoff."}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADMIN CONTROL PANEL MODAL */}
      <AnimatePresence>
        {isAdminOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 md:backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsAdminOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className={`w-full max-w-2xl rounded-3xl border overflow-hidden shadow-2xl flex flex-col ${
                theme === "black" ? "bg-zinc-950 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Admin Header */}
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold tracking-tight">
                    {lang === "ar" ? "لوحة التحكم بمدير البوابة" : "Elite Portal Control Panel"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsAdminOpen(false)}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content Body */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[450px]">
                {/* Success/Error Message */}
                {adminMessage && (
                  <div className={`p-3 rounded-xl text-xs font-bold border ${
                    adminMessage.type === "success"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}>
                    {adminMessage.text}
                  </div>
                )}

                {/* Custom Match Addition */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
                    {lang === "ar" ? "١. إضافة مباراة جديدة" : "1. Add New Match"}
                  </h4>
                  <button
                    type="button"
                    onClick={async () => {
                      const customId = `custom_${Date.now()}`;
                      const success = await saveMatchListOnServer([...adminMatchIds, customId]);
                      if (success) {
                        setEditingMatch({
                          id: customId,
                          sport: "football",
                          teamA: { ar: "ريال مدريد", en: "Real Madrid" },
                          teamB: { ar: "برشلونة", en: "Barcelona" },
                          scoreA: 0,
                          scoreB: 0,
                          status: "upcoming",
                          statusText: { ar: "لم تبدأ", en: "Upcoming" },
                          time: { ar: "٢٠:٠٠", en: "20:00" },
                          venue: { ar: "سانتياغو برنابيو", en: "Santiago Bernabéu" },
                          leagueName: "La Liga",
                          scorers: { home: [], away: [] },
                          stats: [],
                          lineups: null
                        });
                        setEditTab("basic");
                      }
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10 transition whitespace-nowrap cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === "ar" ? "إنشاء مباراة مخصصة جديدة" : "Create New Custom Match"}</span>
                  </button>
                </div>

                {/* Current Saved Matches list with IDs */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
                    {lang === "ar" ? "٢. قائمة المباريات النشطة المحددة" : "2. Active Match Selection"}
                  </h4>
                  <div className="border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-900 bg-zinc-900/30">
                    {adminMatchIds.length > 0 ? (
                      adminMatchIds.map((id, index) => {
                        const foundMatch = matches.find(m => String(m.id) === String(id));
                        const label = foundMatch
                          ? `${foundMatch.teamA[lang] || foundMatch.teamA.en} vs ${foundMatch.teamB[lang] || foundMatch.teamB.en}`
                          : (lang === "ar" ? `مباراة قوقل رقم: ${id}` : `Google Match ID: ${id}`);

                        return (
                          <div key={`${id}-${index}`} className="p-2.5 flex items-center justify-between gap-4 text-xs">
                            <div>
                              <p className="font-bold">{label}</p>
                              <p className="text-[10px] text-zinc-500 font-mono">ID: {id}</p>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => {
                                  const fm = matches.find(m => String(m.id) === String(id)) || {
                                    id,
                                    sport: "football",
                                    teamA: { ar: "فريق أ", en: "Team A" },
                                    teamB: { ar: "فريق ب", en: "Team B" },
                                    scoreA: 0,
                                    scoreB: 0,
                                    status: "upcoming",
                                    statusText: { ar: "لم تبدأ", en: "Upcoming" },
                                    time: { ar: "٢٠:٠٠", en: "20:00" },
                                    venue: { ar: "ملعب", en: "Stadium" },
                                    leagueName: "La Liga",
                                    scorers: { home: [], away: [] },
                                    stats: [],
                                    lineups: null
                                  };
                                  setEditingMatch(fm);
                                  setEditTab("basic");
                                }}
                                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-500 border border-zinc-800 transition"
                                title={lang === "ar" ? "تعديل المباراة" : "Edit match"}
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveMatchId(id)}
                                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-500/10 hover:text-red-400 text-zinc-400 border border-zinc-800 transition"
                                title={lang === "ar" ? "حذف من القائمة" : "Delete match"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-6 text-center text-zinc-500 text-xs italic">
                        {lang === "ar" ? "قائمتك فارغة تماماً. لن يتم عرض مباريات في البوابة!" : "Your list is empty. No matches will be displayed!"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Buffer Settings (Controllable by Admin only) */}
                <div className="space-y-4 pt-5 border-t border-zinc-800">
                  <h4 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-amber-500" />
                    <span>{lang === "ar" ? "٣. إعدادات بفر المشغل للمشاهدين" : "3. Viewer Player Buffer Settings"}</span>
                  </h4>
                  <p className="text-[11px] text-zinc-500 font-bold leading-relaxed">
                    {lang === "ar"
                      ? "تحكم في سعة التخزين المؤقت (Buffer) للمشاهدين لتحسين ثبات البث وتقليل التقطيع."
                      : "Control player buffer capacity for viewers to improve stream stability and reduce buffering."}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-900/20 p-4 rounded-2xl border border-zinc-900/80">
                    {/* Max Buffer Length */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">
                        {lang === "ar" ? "أقصى طول للبفر (ثانية)" : "Max Buffer Length (sec)"}
                      </label>
                      <input
                        type="number"
                        min="2"
                        max="60"
                        value={adminBufferMax}
                        onChange={(e) => setAdminBufferMax(Math.max(2, parseInt(e.target.value) || 10))}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-[9px] text-zinc-500 block">
                        {lang === "ar" ? "كلما زاد، قل التقطيع وزاد التأخير" : "Higher means less stutter, more latency"}
                      </span>
                    </div>

                    {/* Max Max Buffer Length */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">
                        {lang === "ar" ? "الحد الأقصى للبفر (ثانية)" : "Max-Max Buffer Length (sec)"}
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="120"
                        value={adminBufferMaxMax}
                        onChange={(e) => setAdminBufferMaxMax(Math.max(5, parseInt(e.target.value) || 15))}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-[9px] text-zinc-500 block">
                        {lang === "ar" ? "الحد الأقصى المطلق للتخزين" : "Absolute maximum buffer allowed"}
                      </span>
                    </div>

                    {/* Live Sync Duration Count */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">
                        {lang === "ar" ? "عدد قطع تزامن البث المباشر" : "Live Sync Segment Count"}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={adminBufferSyncCount}
                        onChange={(e) => setAdminBufferSyncCount(Math.max(1, parseInt(e.target.value) || 3))}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-[9px] text-zinc-500 block">
                        {lang === "ar" ? "عدد الأجزاء للتزامن مع البث المباشر" : "Number of segments to sync with live"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleSaveBufferSettings}
                      disabled={isSavingBuffer}
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-amber-500 rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 animate-pulse"
                    >
                      {isSavingBuffer ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>{lang === "ar" ? "حفظ وتطبيق البفر للمشاهدين" : "Save & Apply Buffer Settings"}</span>
                    </button>
                  </div>
                </div>
          </div>

              {/* Admin Footer */}
              <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  {lang === "ar" ? "يتم حفظ وإلغاء المباريات تلقائياً في الصفحة الرئيسية فوراً." : "Matches are automatically saved & updated on the homepage instantly."}
                </span>
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setIsAdminOpen(false)}
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-extrabold rounded-xl transition flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{lang === "ar" ? "موافق (إغلاق)" : "Done (Close)"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* EDIT MATCH DETAILS MODAL */}
        {editingMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingMatch(null)}
            className="fixed inset-0 bg-black/85 md:backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto font-sans"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className={`w-full max-w-lg rounded-3xl border overflow-hidden shadow-2xl flex flex-col ${
                theme === "black" ? "bg-zinc-950 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
                <div className="flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-amber-500 animate-pulse" />
                  <h3 className="text-base font-bold tracking-tight">
                    {lang === "ar" ? "تعديل تفاصيل لوحة المباراة" : "Edit Match Card Details"}
                  </h3>
                </div>
                <button
                  onClick={() => setEditingMatch(null)}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tab Selector */}
              <div className="flex border-b border-zinc-800/80 bg-zinc-900/10 p-1">
                {(["basic", "details", "scorers", "stats"] as const).map((tab) => {
                  const labels = {
                    basic: lang === "ar" ? "الأساسي" : "Basic",
                    details: lang === "ar" ? "التفاصيل" : "Details",
                    scorers: lang === "ar" ? "الهدافين" : "Scorers",
                    stats: lang === "ar" ? "الإحصائيات" : "Stats"
                  };
                  return (
                    <button
                      key={tab}
                      onClick={() => setEditTab(tab)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                        editTab === tab
                          ? "bg-amber-500 text-black shadow-md shadow-amber-500/10"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                      }`}
                    >
                      {labels[tab]}
                    </button>
                  );
                })}
              </div>



              {/* Form Scrollable Body */}
              <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto">
                {adminMessage && (
                  <div className={`p-3 text-xs rounded-xl font-bold flex items-center justify-between border ${
                    adminMessage.type === "success" 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}>
                    <span>{adminMessage.text}</span>
                    <button onClick={() => setAdminMessage(null)} className="text-[10px] underline hover:text-white ml-2 cursor-pointer">
                      {lang === "ar" ? "إغلاق" : "Dismiss"}
                    </button>
                  </div>
                )}
                {editTab === "basic" && (
                  <div className="space-y-4">
                    {/* Team A (Home) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                          {lang === "ar" ? "الفريق أ (عربي)" : "Team A (AR)"}
                        </label>
                        <input
                          type="text"
                          value={editingMatch.teamA?.ar || ""}
                          onChange={(e) => setEditingMatch({
                            ...editingMatch,
                            teamA: { ...(editingMatch.teamA || {}), ar: e.target.value }
                          })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                          {lang === "ar" ? "الفريق أ (إنجليزي)" : "Team A (EN)"}
                        </label>
                        <input
                          type="text"
                          value={editingMatch.teamA?.en || ""}
                          onChange={(e) => setEditingMatch({
                            ...editingMatch,
                            teamA: { ...(editingMatch.teamA || {}), en: e.target.value }
                          })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Team A Logo Selector (Studio) */}
                    <div className="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-950/40 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                            {editingMatch.logoA ? (
                              <img src={editingMatch.logoA} alt="Team A Logo" className="w-6.5 h-6.5 object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <Image className="w-4 h-4 text-zinc-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">
                              {lang === "ar" ? "شعار الفريق أ" : "Team A Logo"}
                            </span>
                            <span className="text-[9px] text-zinc-500 truncate block max-w-[150px]" title={editingMatch.logoA || ""}>
                              {editingMatch.logoA ? (editingMatch.logoA.startsWith("data:") ? (lang === "ar" ? "صورة مرفوعة (الاستوديو)" : "Uploaded (Studio)") : (lang === "ar" ? "رابط مخصص" : "Custom Link")) : (lang === "ar" ? "الشعار الافتراضي" : "Default Logo")}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setLogoSelectorFor(logoSelectorFor === "A" ? null : "A")}
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 ${
                              logoSelectorFor === "A" 
                                ? "bg-amber-500 text-black shadow-md shadow-amber-500/15" 
                                : "bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{lang === "ar" ? "تعديل الشعار" : "Edit Logo"}</span>
                          </button>
                          {editingMatch.logoA && (
                            <button
                              type="button"
                              onClick={() => setEditingMatch({ ...editingMatch, logoA: "" })}
                              className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-red-500/10 hover:text-red-400 text-zinc-400 transition"
                              title={lang === "ar" ? "حذف الشعار" : "Delete Logo"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {logoSelectorFor === "A" && (
                        <div className="pt-2.5 border-t border-zinc-800/60 space-y-3">
                          {/* File Uploader */}
                          <div>
                            <label className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                              {lang === "ar" ? "١. الرفع من استوديو الجهاز" : "1. Upload from Device Gallery/Studio"}
                            </label>
                            <label className="flex flex-col items-center justify-center w-full h-16 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 cursor-pointer transition">
                              <div className="flex flex-col items-center justify-center text-center px-4">
                                <Upload className="w-4 h-4 text-amber-500 mb-1" />
                                <p className="text-[9px] font-bold text-zinc-300">
                                  {lang === "ar" ? "اضغط لاختيار صورة من الاستوديو" : "Click to choose photo from Studio"}
                                </p>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setEditingMatch({
                                        ...editingMatch,
                                        logoA: reader.result as string
                                      });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>

                          {/* Quick Club Logo Selector */}
                          <div>
                            <label className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                              {lang === "ar" ? "٢. اختيار من استوديو الأندية الشهيرة" : "2. Choose from Popular Clubs Gallery"}
                            </label>
                            <div className="grid grid-cols-5 gap-1.5 max-h-[85px] overflow-y-auto p-1.5 border border-zinc-800/40 rounded-xl bg-zinc-900/20">
                              {PRESET_LOGOS.map((club, idx) => (
                                <button
                                  key={`preset-logoA-${idx}`}
                                  type="button"
                                  onClick={() => {
                                    setEditingMatch({
                                      ...editingMatch,
                                      logoA: club.logo
                                    });
                                  }}
                                  className={`p-1 rounded-lg border flex flex-col items-center justify-center gap-1 transition ${
                                    editingMatch.logoA === club.logo
                                      ? "bg-amber-500/10 border-amber-500"
                                      : "bg-zinc-900/40 border-zinc-800/50 hover:bg-zinc-900"
                                  }`}
                                  title={club.name[lang] || club.name.en}
                                >
                                  <img src={club.logo} alt={club.name.en} className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                                  <span className="text-[8px] text-zinc-400 truncate max-w-full font-medium">
                                    {club.name[lang] || club.name.en}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Manual URL Input */}
                          <div>
                            <label className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                              {lang === "ar" ? "٣. رابط مباشر للشعار" : "3. Direct Logo URL"}
                            </label>
                            <input
                              type="text"
                              value={editingMatch.logoA && !editingMatch.logoA.startsWith("data:") ? editingMatch.logoA : ""}
                              onChange={(e) => setEditingMatch({ ...editingMatch, logoA: e.target.value })}
                              placeholder="https://example.com/logo.png"
                              className="w-full px-2.5 py-1.5 text-[11px] rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Team B (Away) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                          {lang === "ar" ? "الفريق ب (عربي)" : "Team B (AR)"}
                        </label>
                        <input
                          type="text"
                          value={editingMatch.teamB?.ar || ""}
                          onChange={(e) => setEditingMatch({
                            ...editingMatch,
                            teamB: { ...(editingMatch.teamB || {}), ar: e.target.value }
                          })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                          {lang === "ar" ? "الفريق ب (إنجليزي)" : "Team B (EN)"}
                        </label>
                        <input
                          type="text"
                          value={editingMatch.teamB?.en || ""}
                          onChange={(e) => setEditingMatch({
                            ...editingMatch,
                            teamB: { ...(editingMatch.teamB || {}), en: e.target.value }
                          })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Team B Logo Selector (Studio) */}
                    <div className="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-950/40 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                            {editingMatch.logoB ? (
                              <img src={editingMatch.logoB} alt="Team B Logo" className="w-6.5 h-6.5 object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <Image className="w-4 h-4 text-zinc-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">
                              {lang === "ar" ? "شعار الفريق ب" : "Team B Logo"}
                            </span>
                            <span className="text-[9px] text-zinc-500 truncate block max-w-[150px]" title={editingMatch.logoB || ""}>
                              {editingMatch.logoB ? (editingMatch.logoB.startsWith("data:") ? (lang === "ar" ? "صورة مرفوعة (الاستوديو)" : "Uploaded (Studio)") : (lang === "ar" ? "رابط مخصص" : "Custom Link")) : (lang === "ar" ? "الشعار الافتراضي" : "Default Logo")}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setLogoSelectorFor(logoSelectorFor === "B" ? null : "B")}
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 ${
                              logoSelectorFor === "B" 
                                ? "bg-amber-500 text-black shadow-md shadow-amber-500/15" 
                                : "bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{lang === "ar" ? "تعديل الشعار" : "Edit Logo"}</span>
                          </button>
                          {editingMatch.logoB && (
                            <button
                              type="button"
                              onClick={() => setEditingMatch({ ...editingMatch, logoB: "" })}
                              className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-red-500/10 hover:text-red-400 text-zinc-400 transition"
                              title={lang === "ar" ? "حذف الشعار" : "Delete Logo"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {logoSelectorFor === "B" && (
                        <div className="pt-2.5 border-t border-zinc-800/60 space-y-3">
                          {/* File Uploader */}
                          <div>
                            <label className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                              {lang === "ar" ? "١. الرفع من استوديو الجهاز" : "1. Upload from Device Gallery/Studio"}
                            </label>
                            <label className="flex flex-col items-center justify-center w-full h-16 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 cursor-pointer transition">
                              <div className="flex flex-col items-center justify-center text-center px-4">
                                <Upload className="w-4 h-4 text-amber-500 mb-1" />
                                <p className="text-[9px] font-bold text-zinc-300">
                                  {lang === "ar" ? "اضغط لاختيار صورة من الاستوديو" : "Click to choose photo from Studio"}
                                </p>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setEditingMatch({
                                        ...editingMatch,
                                        logoB: reader.result as string
                                      });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>

                          {/* Quick Club Logo Selector */}
                          <div>
                            <label className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                              {lang === "ar" ? "٢. اختيار من استوديو الأندية الشهيرة" : "2. Choose from Popular Clubs Gallery"}
                            </label>
                            <div className="grid grid-cols-5 gap-1.5 max-h-[85px] overflow-y-auto p-1.5 border border-zinc-800/40 rounded-xl bg-zinc-900/20">
                              {PRESET_LOGOS.map((club, idx) => (
                                <button
                                  key={`preset-logoB-${idx}`}
                                  type="button"
                                  onClick={() => {
                                    setEditingMatch({
                                      ...editingMatch,
                                      logoB: club.logo
                                    });
                                  }}
                                  className={`p-1 rounded-lg border flex flex-col items-center justify-center gap-1 transition ${
                                    editingMatch.logoB === club.logo
                                      ? "bg-amber-500/10 border-amber-500"
                                      : "bg-zinc-900/40 border-zinc-800/50 hover:bg-zinc-900"
                                  }`}
                                  title={club.name[lang] || club.name.en}
                                >
                                  <img src={club.logo} alt={club.name.en} className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                                  <span className="text-[8px] text-zinc-400 truncate max-w-full font-medium">
                                    {club.name[lang] || club.name.en}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Manual URL Input */}
                          <div>
                            <label className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                              {lang === "ar" ? "٣. رابط مباشر للشعار" : "3. Direct Logo URL"}
                            </label>
                            <input
                              type="text"
                              value={editingMatch.logoB && !editingMatch.logoB.startsWith("data:") ? editingMatch.logoB : ""}
                              onChange={(e) => setEditingMatch({ ...editingMatch, logoB: e.target.value })}
                              placeholder="https://example.com/logo.png"
                              className="w-full px-2.5 py-1.5 text-[11px] rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Scores */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                          {lang === "ar" ? "أهداف الفريق أ" : "Team A Score"}
                        </label>
                        <input
                          type="number"
                          value={editingMatch.scoreA !== undefined ? editingMatch.scoreA : ""}
                          onChange={(e) => setEditingMatch({
                            ...editingMatch,
                            scoreA: e.target.value === "" ? 0 : Number(e.target.value)
                          })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                          {lang === "ar" ? "أهداف الفريق ب" : "Team B Score"}
                        </label>
                        <input
                          type="number"
                          value={editingMatch.scoreB !== undefined ? editingMatch.scoreB : ""}
                          onChange={(e) => setEditingMatch({
                            ...editingMatch,
                            scoreB: e.target.value === "" ? 0 : Number(e.target.value)
                          })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                        {lang === "ar" ? "حالة المباراة" : "Match Status"}
                      </label>
                      <select
                        value={editingMatch.status || "upcoming"}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingMatch({
                            ...editingMatch,
                            status: val,
                            statusText: {
                              ar: val === "live" ? "مباشر" : val === "ended" ? "انتهت" : "لم تبدأ",
                              en: val === "live" ? "Live" : val === "ended" ? "FT" : "Upcoming"
                            }
                          });
                        }}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="upcoming">{lang === "ar" ? "لم تبدأ (Upcoming)" : "Upcoming"}</option>
                        <option value="live">{lang === "ar" ? "مباشر (Live)" : "Live"}</option>
                        <option value="ended">{lang === "ar" ? "انتهت (Ended)" : "Ended"}</option>
                      </select>
                    </div>

                    {/* League Name */}
                    <div>
                      <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                        {lang === "ar" ? "اسم الدوري" : "League Name"}
                      </label>
                      <input
                        type="text"
                        value={typeof editingMatch.leagueName === "object" ? (editingMatch.leagueName.en || "") : (editingMatch.leagueName || "")}
                        onChange={(e) => setEditingMatch({
                          ...editingMatch,
                          leagueName: e.target.value
                        })}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                        placeholder={lang === "ar" ? "أدخل اسم الدوري بالإنجليزي ليترجم تلقائياً" : "Enter League Name in English to auto-translate"}
                      />
                    </div>
                  </div>
                )}

                {editTab === "details" && (
                  <div className="space-y-4">
                    {/* Time formatted */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                          {lang === "ar" ? "توقيت المباراة (عربي)" : "Match Time (AR)"}
                        </label>
                        <input
                          type="text"
                          value={editingMatch.time?.ar || ""}
                          onChange={(e) => setEditingMatch({
                            ...editingMatch,
                            time: { ...(editingMatch.time || {}), ar: e.target.value }
                          })}
                          placeholder="اليوم، ٢٠:٠٠"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                          {lang === "ar" ? "توقيت المباراة (إنجليزي)" : "Match Time (EN)"}
                        </label>
                        <input
                          type="text"
                          value={editingMatch.time?.en || ""}
                          onChange={(e) => setEditingMatch({
                            ...editingMatch,
                            time: { ...(editingMatch.time || {}), en: e.target.value }
                          })}
                          placeholder="Today, 20:00"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Venue / Stadium */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                          {lang === "ar" ? "الملعب (عربي)" : "Venue (AR)"}
                        </label>
                        <input
                          type="text"
                          value={editingMatch.venue?.ar || ""}
                          onChange={(e) => setEditingMatch({
                            ...editingMatch,
                            venue: { ...(editingMatch.venue || {}), ar: e.target.value }
                          })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                          {lang === "ar" ? "الملعب (إنجليزي)" : "Venue (EN)"}
                        </label>
                        <input
                          type="text"
                          value={editingMatch.venue?.en || ""}
                          onChange={(e) => setEditingMatch({
                            ...editingMatch,
                            venue: { ...(editingMatch.venue || {}), en: e.target.value }
                          })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Status Text (e.g. 90', FT, Live, Upcoming) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                          {lang === "ar" ? "نص الحالة (عربي)" : "Status Text (AR)"}
                        </label>
                        <input
                          type="text"
                          value={editingMatch.statusText?.ar || ""}
                          onChange={(e) => setEditingMatch({
                            ...editingMatch,
                            statusText: { ...(editingMatch.statusText || {}), ar: e.target.value }
                          })}
                          placeholder="مباشر '٤٥"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                          {lang === "ar" ? "نص الحالة (إنجليزي)" : "Status Text (EN)"}
                        </label>
                        <input
                          type="text"
                          value={editingMatch.statusText?.en || ""}
                          onChange={(e) => setEditingMatch({
                            ...editingMatch,
                            statusText: { ...(editingMatch.statusText || {}), en: e.target.value }
                          })}
                          placeholder="Live 45'"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {editTab === "scorers" && (
                  <div className="space-y-4">
                    {/* Home Goals (Team A) */}
                    <div className="border border-zinc-900 p-3 rounded-2xl bg-zinc-900/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-amber-500 uppercase tracking-wider">
                          {lang === "ar" ? `أهداف ${editingMatch.teamA?.[lang] || "الفريق أ"}` : `${editingMatch.teamA?.en || "Team A"} Goals`}
                        </span>
                        <button
                          onClick={() => {
                            const current = editingMatch.scorers?.home || [];
                            const updated = [...current, { name: "Player", time: "45'", type: "Goal" }];
                            setEditingMatch({
                              ...editingMatch,
                              scorers: { ...(editingMatch.scorers || {}), home: updated }
                            });
                          }}
                          className="p-1 text-[10px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-zinc-300 font-bold flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          {lang === "ar" ? "إضافة هدف" : "Add Goal"}
                        </button>
                      </div>
                      
                      {(editingMatch.scorers?.home || []).map((goal: any, index: number) => (
                        <div key={`edit-scorer-home-${index}`} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={typeof goal.name === "object" ? (goal.name.en || "") : (goal.name || "")}
                            onChange={(e) => {
                              const updated = [...(editingMatch.scorers?.home || [])];
                              updated[index] = { ...updated[index], name: e.target.value };
                              setEditingMatch({
                                ...editingMatch,
                                scorers: { ...(editingMatch.scorers || {}), home: updated }
                              });
                            }}
                            placeholder={lang === "ar" ? "اسم اللاعب" : "Player Name"}
                            className="flex-1 px-2 py-1 text-[11px] rounded bg-zinc-900 border border-zinc-800 text-white"
                          />
                          <input
                            type="text"
                            value={goal.time || ""}
                            onChange={(e) => {
                              const updated = [...(editingMatch.scorers?.home || [])];
                              updated[index] = { ...updated[index], time: e.target.value };
                              setEditingMatch({
                                ...editingMatch,
                                scorers: { ...(editingMatch.scorers || {}), home: updated }
                              });
                            }}
                            placeholder="45'"
                            className="w-12 px-2 py-1 text-[11px] rounded bg-zinc-900 border border-zinc-800 text-white text-center"
                          />
                          <button
                            onClick={() => {
                              const updated = (editingMatch.scorers?.home || []).filter((_: any, i: number) => i !== index);
                              setEditingMatch({
                                ...editingMatch,
                                scorers: { ...(editingMatch.scorers || {}), home: updated }
                              });
                            }}
                            className="p-1 rounded text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Away Goals (Team B) */}
                    <div className="border border-zinc-900 p-3 rounded-2xl bg-zinc-900/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-amber-500 uppercase tracking-wider">
                          {lang === "ar" ? `أهداف ${editingMatch.teamB?.[lang] || "الفريق ب"}` : `${editingMatch.teamB?.en || "Team B"} Goals`}
                        </span>
                        <button
                          onClick={() => {
                            const current = editingMatch.scorers?.away || [];
                            const updated = [...current, { name: "Player", time: "45'", type: "Goal" }];
                            setEditingMatch({
                              ...editingMatch,
                              scorers: { ...(editingMatch.scorers || {}), away: updated }
                            });
                          }}
                          className="p-1 text-[10px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-zinc-300 font-bold flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          {lang === "ar" ? "إضافة هدف" : "Add Goal"}
                        </button>
                      </div>
                      
                      {(editingMatch.scorers?.away || []).map((goal: any, index: number) => (
                        <div key={`edit-scorer-away-${index}`} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={typeof goal.name === "object" ? (goal.name.en || "") : (goal.name || "")}
                            onChange={(e) => {
                              const updated = [...(editingMatch.scorers?.away || [])];
                              updated[index] = { ...updated[index], name: e.target.value };
                              setEditingMatch({
                                ...editingMatch,
                                scorers: { ...(editingMatch.scorers || {}), away: updated }
                              });
                            }}
                            placeholder={lang === "ar" ? "اسم اللاعب" : "Player Name"}
                            className="flex-1 px-2 py-1 text-[11px] rounded bg-zinc-900 border border-zinc-800 text-white"
                          />
                          <input
                            type="text"
                            value={goal.time || ""}
                            onChange={(e) => {
                              const updated = [...(editingMatch.scorers?.away || [])];
                              updated[index] = { ...updated[index], time: e.target.value };
                              setEditingMatch({
                                ...editingMatch,
                                scorers: { ...(editingMatch.scorers || {}), away: updated }
                              });
                            }}
                            placeholder="45'"
                            className="w-12 px-2 py-1 text-[11px] rounded bg-zinc-900 border border-zinc-800 text-white text-center"
                          />
                          <button
                            onClick={() => {
                              const updated = (editingMatch.scorers?.away || []).filter((_: any, i: number) => i !== index);
                              setEditingMatch({
                                ...editingMatch,
                                scorers: { ...(editingMatch.scorers || {}), away: updated }
                              });
                            }}
                            className="p-1 rounded text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {editTab === "stats" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
                        {lang === "ar" ? "إحصائيات المباراة الرئيسية" : "Main Match Statistics"}
                      </span>
                      <button
                        onClick={() => {
                          const current = editingMatch.stats || [];
                          const updated = [...current, { title: "Possession", home: "50%", away: "50%" }];
                          setEditingMatch({
                            ...editingMatch,
                            stats: updated
                          });
                        }}
                        className="p-1 text-[10px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-zinc-300 font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        {lang === "ar" ? "إضافة إحصائية" : "Add Stat Row"}
                      </button>
                    </div>

                    {(editingMatch.stats || []).map((stat: any, index: number) => (
                      <div key={`edit-stat-${index}`} className="flex gap-2 items-center p-2 border border-zinc-900 rounded-xl bg-zinc-900/5">
                        <input
                          type="text"
                          value={typeof stat.title === "object" ? (stat.title.en || "") : (stat.title || "")}
                          onChange={(e) => {
                            const updated = [...(editingMatch.stats || [])];
                            updated[index] = { ...updated[index], title: e.target.value };
                            setEditingMatch({
                              ...editingMatch,
                              stats: updated
                            });
                          }}
                          placeholder="Stat Title (e.g. Shots)"
                          className="flex-1 px-2 py-1 text-[11px] rounded bg-zinc-900 border border-zinc-800 text-white"
                        />
                        <input
                          type="text"
                          value={stat.home !== undefined ? stat.home : ""}
                          onChange={(e) => {
                            const updated = [...(editingMatch.stats || [])];
                            updated[index] = { ...updated[index], home: e.target.value };
                            setEditingMatch({
                              ...editingMatch,
                              stats: updated
                            });
                          }}
                          placeholder="Home"
                          className="w-14 px-2 py-1 text-[11px] rounded bg-zinc-900 border border-zinc-800 text-white text-center font-mono"
                        />
                        <span className="text-zinc-500 font-bold text-xs">:</span>
                        <input
                          type="text"
                          value={stat.away !== undefined ? stat.away : ""}
                          onChange={(e) => {
                            const updated = [...(editingMatch.stats || [])];
                            updated[index] = { ...updated[index], away: e.target.value };
                            setEditingMatch({
                              ...editingMatch,
                              stats: updated
                            });
                          }}
                          placeholder="Away"
                          className="w-14 px-2 py-1 text-[11px] rounded bg-zinc-900 border border-zinc-800 text-white text-center font-mono"
                        />
                        <button
                          onClick={() => {
                            const updated = (editingMatch.stats || []).filter((_: any, i: number) => i !== index);
                            setEditingMatch({
                              ...editingMatch,
                              stats: updated
                            });
                          }}
                          className="p-1 rounded text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-2.5">
                <button
                  onClick={() => setEditingMatch(null)}
                  className="px-4 py-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl transition"
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={() => handleSaveMatchOverride(editingMatch.id, editingMatch)}
                  disabled={isSavingEdit}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSavingEdit ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{lang === "ar" ? "حفظ التعديلات" : "Save Changes"}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Support & Controls Bubble (Bottom Left) */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
        <AnimatePresence>
          {isSupportOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className={`p-4 rounded-2xl border shadow-xl flex flex-col gap-3 min-w-[220px] ${
                theme === "black"
                  ? "bg-zinc-950/95 border-zinc-800 text-white"
                  : "bg-white/95 border-zinc-200 text-zinc-900 shadow-zinc-300/30"
              }`}
            >
              {/* Header inside popup */}
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/20 dark:border-zinc-800">
                <HelpCircle className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="text-xs font-black tracking-wider uppercase">
                  {lang === "ar" ? "الدعم والتحكم" : "Support & Role"}
                </span>
              </div>

              {/* Role Selection Option */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-zinc-400 font-bold block">
                  {lang === "ar" ? "اختر الصلاحية:" : "Select Role:"}
                </span>
                <div className={`flex items-center p-1 rounded-xl border ${
                  theme === "black" ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-200"
                }`}>
                  <button
                    onClick={() => setUserRole("viewer")}
                    className={`flex-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                      userRole === "viewer"
                        ? "bg-amber-500 text-black shadow-sm font-black"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{lang === "ar" ? "مشاهد" : "Viewer"}</span>
                  </button>
                  <button
                    onClick={() => setUserRole("admin")}
                    className={`flex-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                      userRole === "admin"
                        ? "bg-red-500 text-white shadow-sm font-black"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>{lang === "ar" ? "مسؤول" : "Admin"}</span>
                  </button>
                </div>
              </div>

              {/* Admin Panel Access inside Support Popover (If Admin is selected) */}
              {userRole === "admin" && (
                <button
                  onClick={() => {
                    setIsAdminOpen(true);
                    setAdminMessage(null);
                    loadAdminMatchIds();
                    setIsSupportOpen(false); // Auto close
                  }}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all duration-300 ${
                    theme === "black"
                      ? "bg-zinc-900 border-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-800"
                      : "bg-zinc-50 border-zinc-200 text-zinc-800 hover:bg-zinc-100"
                  }`}
                >
                  <Settings className="w-4 h-4 text-red-500 animate-spin-slow" />
                  <span className="text-xs font-bold">
                    {lang === "ar" ? "لوحة التحكم" : "Admin Panel"}
                  </span>
                </button>
              )}

              {/* Extra Support Info */}
              <div className="border-t border-zinc-800/10 dark:border-zinc-800/50 pt-3 mt-1 space-y-2">
                <div className="text-[10px] text-zinc-400 font-bold block">
                  {lang === "ar" ? "الدعم الفني:" : "Technical Support:"}
                </div>
                <a
                  href="mailto:asdda9019@gmail.com"
                  className={`flex items-center gap-2 p-2 rounded-xl border text-xs transition-all ${
                    theme === "black"
                      ? "bg-zinc-900 border-zinc-800 text-amber-500 hover:text-amber-400 hover:bg-zinc-850"
                      : "bg-zinc-50 border-zinc-200 text-amber-600 hover:text-amber-700 hover:bg-zinc-100"
                  }`}
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="font-mono text-[11px] select-all truncate">
                    asdda9019@gmail.com
                  </span>
                </a>
                <div className="text-[9px] text-zinc-500 text-center pt-1">
                  {lang === "ar" ? "الدعم الفني والخدمات المتميزة ⚡" : "Premium support & services ⚡"}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Support Button (Circle) */}
        <button
          onClick={() => setIsSupportOpen(!isSupportOpen)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 shadow-lg border relative ${
            isSupportOpen 
              ? "bg-amber-500 text-black border-amber-600" 
              : theme === "black"
                ? "bg-zinc-900 text-zinc-200 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850"
                : "bg-white text-zinc-850 border-zinc-200 hover:bg-zinc-50 shadow-md"
          }`}
          title={lang === "ar" ? "الدعم والصلاحيات" : "Support & Roles"}
        >
          {isSupportOpen ? (
            <X className="w-5 h-5 font-bold" />
          ) : (
            <Headphones className="w-5 h-5 text-amber-500" />
          )}
          
          {/* Notification Badge if Closed */}
          {!isSupportOpen && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          )}
        </button>
      </div>

    </div>
  );
}
