import type React from "react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { relaxedRules } from "./data/config";
import { areaAchievements, areaAchievementTasks, type AchievementTier } from "./data/static/achievements";
import { diaryRequirements, diarySets, type DiaryRequirement, type DiarySet } from "./data/static/areaAchievementsExtended";
import { makeBands, skills as staticSkills } from "./data/static/skills";
import { sampleQuests } from "./data/static/quests";
import type { AchievementProgress, RunState, SlayerMaster, Tile, TileState, TileType } from "./data/models";
import { db, seedDefaults } from "./store/db";
import { exportAll, importBundle, type ExportBundle } from "./store/export";
import { APP_VERSION } from "./version";
import { changelogEntries } from "./changelog";

type Quest = { id: string; name: string; order: number; quickGuide?: string };
type SkillDef = { id: string; name: string; maxLevel: number; elite?: boolean };
type Achievement = { id: string; label: string; tier: AchievementTier };
type AchievementTaskEntry = {
  id: string;
  area: string;
  tier: AchievementTier;
  tasks: string[];
  total: number;
  meta?: DiarySet;
  requirements?: DiaryRequirement;
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const QUEST_STRATEGY_URL =
  "https://runescape.wiki/api.php?action=parse&page=Quests/Strategy&prop=text&formatversion=2&format=json&origin=*";

const runemetricsProfileUrl = (player: string) =>
  `https://apps.runescape.com/runemetrics/profile/profile?user=${encodeURIComponent(player)}&activities=0`;

const hiscoreLiteUrl = (player: string) => `https://secure.runescape.com/m=hiscore/index_lite.ws?player=${encodeURIComponent(player)}`;

const runemetricsQuestsUrl = (player: string) =>
  `https://apps.runescape.com/runemetrics/quests?user=${encodeURIComponent(player)}`;

const proxyUrls = (url: string) => [
  // CORS proxy (passes scheme in query)
  `https://corsproxy.io/?${encodeURIComponent(url)}`,
  // AllOrigins fallbacks (rate limited; keep after corsproxy)
  `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}&cacheBust=${Date.now()}`,
  `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&cacheBust=${Date.now()}`
];

const hiscoreSkillOrder = [
  "attack",
  "defence",
  "strength",
  "constitution",
  "ranged",
  "prayer",
  "magic",
  "cooking",
  "woodcutting",
  "fletching",
  "fishing",
  "firemaking",
  "crafting",
  "smithing",
  "mining",
  "herblore",
  "agility",
  "thieving",
  "slayer",
  "farming",
  "runecrafting",
  "hunter",
  "construction",
  "summoning",
  "dungeoneering",
  "divination",
  "invention",
  "archaeology",
  "necromancy"
] as const;

const EXEMPT_SKILL_IDS = [
  "attack",
  "strength",
  "defence",
  "constitution",
  "ranged",
  "magic",
  "prayer",
  "summoning",
  "slayer",
  "necromancy"
];

const achievementTierOrder: Record<AchievementTier, number> = {
  beginner: 0,
  easy: 1,
  medium: 2,
  hard: 3,
  elite: 4
};

const slugify = (value: string, separator = "-") =>
  value
    .trim()
    .toLowerCase()
    .replace(/['\"]/g, "")
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp(`${separator}+`, "g"), separator)
    .replace(new RegExp(`^${separator}|${separator}$`, "g"), "");

const normalizeSkillId = (skillId: string) => slugify(skillId, "_");

const formatTitleCase = (value: string) => value.replace(/\b\w/g, (c) => c.toUpperCase());

const assetPath = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;

const QUEST_CACHE_KEY = "quest-strategy-cache:v1";
const QUEST_CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24h

const quickGuideUrl = (title: string) => {
  const sanitized = title.trim().replace(/\s+/g, "_");
  return `https://runescape.wiki/w/${encodeURIComponent(sanitized)}/Quick_guide`;
};

const shuffle = <T,>(arr: T[]) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

type MasterSeed = SlayerMaster & { weight: number };

const slayerMasterSeed: MasterSeed[] = [
  { id: "turael", name: "Turael", tasks: 0, keysFound: 0, keyPool: 0, requirement: "None", avatar: "turael", weight: 1 },
  { id: "jacquelyn", name: "Jacquelyn", tasks: 0, keysFound: 0, keyPool: 0, requirement: "None", avatar: "jacquelyn", weight: 1 },
  { id: "vannaka", name: "Vannaka", tasks: 0, keysFound: 0, keyPool: 0, requirement: "Slayer 30", avatar: "vannaka", weight: 2 },
  { id: "raptor", name: "The Raptor", tasks: 0, keysFound: 0, keyPool: 0, requirement: "Slayer 35", avatar: "the_raptor", weight: 2 },
  { id: "mazchna", name: "Mazchna", tasks: 0, keysFound: 0, keyPool: 0, requirement: "Slayer 50", avatar: "mazchna", weight: 3 },
  { id: "chaeldar", name: "Chaeldar", tasks: 0, keysFound: 0, keyPool: 0, requirement: "Slayer 75 - Lost City", avatar: "chaeldar", weight: 4 },
  { id: "sumona", name: "Sumona", tasks: 0, keysFound: 0, keyPool: 0, requirement: "Slayer 90", avatar: "sumona", weight: 5 },
  { id: "duradel", name: "Duradel", tasks: 0, keysFound: 0, keyPool: 0, requirement: "Slayer 100 - Smoking Kills", avatar: "duradel", weight: 6 },
  { id: "kuradal", name: "Kuradal", tasks: 0, keysFound: 0, keyPool: 0, requirement: "Slayer 110 - Shilo Village", avatar: "kuradal", weight: 7 },
  { id: "morvran", name: "Morvran", tasks: 0, keysFound: 0, keyPool: 0, requirement: "Slayer 120 - Barbarian Training", avatar: "morvran", weight: 8 },
  { id: "laniakea", name: "Laniakea", tasks: 0, keysFound: 0, keyPool: 0, requirement: "Slayer 120 - Exploring Anachronia", avatar: "laniakea", weight: 8 },
  { id: "mandrith", name: "Mandrith", tasks: 0, keysFound: 0, keyPool: 0, requirement: "Slayer 120", avatar: "mandrith", weight: 5 }
];

const typeIcons = {
  quest: assetPath("icons/quest.png"),
  achievement: assetPath("icons/achievement.png"),
  utility: assetPath("icons/slayer-key.png")
};

const wikiIcon = assetPath("icons/wiki.jpg");

const RELAXED_RULES_STORAGE_KEY = "relaxed-rules-seen:v1";

const relaxedRulesSections = [
  {
    title: "Core loop",
    bullets: [
      "Slayer tasks grant Slayer Keys that you spend to unlock visible tiles on the fogged board.",
      "Tiles cover skill bands, quests, achievement sets, or utility unlocks; claiming a tile reveals its neighbors."
    ]
  },
  {
    title: "Skills & XP",
    bullets: [
      "Non-combat training stops at the highest unlocked band for that skill.",
      "Supply skills (Herblore, Cooking, Crafting, etc.) can overcap if you only use recipes inside the unlocked band.",
      "Combat skills can rise past a band while you are on-task; quest XP and lamps can overcap but higher bands stay locked for usage."
    ]
  },
  {
    title: "Quests & achievements",
    bullets: [
      "Only start or complete a quest or diary tier when its tile is unlocked.",
      "Accidental progress before unlocking is fine - formally unlock and claim when you recognize it."
    ]
  },
  {
    title: "Slayer & combat",
    bullets: [
      "Only Slayer tasks generate Slayer Keys.",
      "Off-task combat never yields keys and should be quick detours for requirements; use any Slayer master you qualify for.",
      "Stay on assignment when possible to keep progression tied to Slayer tasks."
    ]
  },
  {
    title: "Loot & economy",
    bullets: [
      "On-task ground items in the task area are always allowed.",
      "Off-task, stick to quest-critical items instead of farming drops.",
      "Trading, GE, and shops are all allowed - avoid using them to bypass locked tiles."
    ]
  },
  {
    title: "Unlock costs & failures",
    bullets: [
      "Typical costs: skill band 1 key; quests 1-2 keys; late quests or achievements 2-3 keys.",
      "You may only unlock visible tiles; claimed tiles reveal adjacent options.",
      "Relaxed mode adds no extra death penalty."
    ]
  }
] as const;

const coinIconBrackets = [
  { threshold: 10000, src: assetPath("icons/coins/coins-10000.png") },
  { threshold: 1000, src: assetPath("icons/coins/coins-1000.png") },
  { threshold: 250, src: assetPath("icons/coins/coins-250.png") },
  { threshold: 100, src: assetPath("icons/coins/coins-100.png") },
  { threshold: 25, src: assetPath("icons/coins/coins-25.png") },
  { threshold: 5, src: assetPath("icons/coins/coins-5.png") },
  { threshold: 4, src: assetPath("icons/coins/coins-4.png") },
  { threshold: 3, src: assetPath("icons/coins/coins-3.png") },
  { threshold: 2, src: assetPath("icons/coins/coins-2.png") },
  { threshold: 1, src: assetPath("icons/coins/coins-1.png") }
] as const;

const MOBILE_BREAKPOINT = 960;

const getCoinIcon = (amount: number) => {
  // 10k art is used for any stack at or above that size to mirror the game's icon rules.
  const match = coinIconBrackets.find((entry) => amount >= entry.threshold);
  return (match ?? coinIconBrackets[coinIconBrackets.length - 1]).src;
};

const numberFormatter = new Intl.NumberFormat("en-US");

const clampOffset = (offset: { x: number; y: number }, limit = 1200) => ({
  x: Math.min(Math.max(offset.x, -limit), limit),
  y: Math.min(Math.max(offset.y, -limit), limit)
});

const isRectOnScreen = (rect: DOMRect, padding = 36) => {
  const { innerWidth, innerHeight } = window;
  return rect.right > padding && rect.left < innerWidth - padding && rect.bottom > padding && rect.top < innerHeight - padding;
};

const questFallback: Quest[] = sampleQuests.map((q, idx) => ({
  id: q.id,
  name: q.name,
  order: idx,
  quickGuide: quickGuideUrl(q.name)
}));

const parseQuestStrategyHtml = (html?: string): Quest[] => {
  if (!html) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const rows = Array.from(doc.querySelectorAll<HTMLTableRowElement>("table.oqg-table tr[data-rowid]"));
  return rows
    .map((row, idx) => {
      const title = row.getAttribute("data-rowid") || row.querySelector("a[title]")?.getAttribute("title") || `Quest ${idx + 1}`;
      return { id: `quest-${slugify(title)}`, name: title, order: idx, quickGuide: quickGuideUrl(title) };
    })
    .filter((quest, idx, list) => quest.name && list.findIndex((q) => q.id === quest.id) === idx);
};

const achievementBias: Record<AchievementTier, number> = {
  beginner: 10,
  easy: 25,
  medium: 55,
  hard: 85,
  elite: 115
};

const FREE_TILE_COUNT = 6;

const coordsByDistance = (size: number) => {
  const center = Math.floor(size / 2);
  const coords: Array<{ x: number; y: number; d: number; angle: number }> = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.abs(x - center) + Math.abs(y - center);
      const angle = Math.atan2(y - center, x - center);
      coords.push({ x, y, d, angle });
    }
  }
  return coords.sort((a, b) => a.d - b.d || a.angle - b.angle);
};

const nextOdd = (value: number) => (value % 2 === 0 ? value + 1 : value);

const boardDimensionFromTiles = (tiles: Tile[]) => {
  if (!tiles.length) return 0;
  const maxX = Math.max(...tiles.map((t) => t.coords.x));
  const maxY = Math.max(...tiles.map((t) => t.coords.y));
  return Math.max(maxX, maxY) + 1;
};

const allocateKeyPools = (totalKeys: number): SlayerMaster[] => {
  const totalWeight = slayerMasterSeed.reduce((sum, m) => sum + m.weight, 0) || 1;
  const weighted = slayerMasterSeed.map((m) => {
    const { weight, ...seed } = m;
    const share = (weight / totalWeight) * totalKeys;
    return { seed, weight, share };
  });
  const baseAllocations = weighted.map((w) => Math.floor(w.share));
  let allocations = baseAllocations.map((alloc) => Math.max(1, alloc));
  let allocated = allocations.reduce((sum, val) => sum + val, 0);
  let remaining = Math.max(totalKeys - allocated, 0);
  const distributionOrder = [...weighted].sort((a, b) => b.weight - a.weight || b.share - a.share);
  const idToIndex = new Map(weighted.map((w, idx) => [w.seed.id, idx]));
  for (const entry of distributionOrder) {
    if (remaining <= 0) break;
    const idx = idToIndex.get(entry.seed.id);
    if (idx === undefined) continue;
    allocations[idx] += 1;
    allocated += 1;
    remaining -= 1;
  }
  return weighted.map((entry, idx) => ({
    ...entry.seed,
    keyPool: Math.max(1, allocations[idx]),
    keysFound: 0,
    tasks: 0
  }));
};

function App() {
  useRegisterSW();
  const [skills, setSkills] = useState<SkillDef[]>(staticSkills);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [questStatus, setQuestStatus] = useState<"idle" | "loading" | "ready" | "error">("loading");
  const [skillStatus, setSkillStatus] = useState<"idle" | "loading" | "ready" | "error">("loading");
  const [board, setBoard] = useState<Tile[]>([]);
  const [boardSize, setBoardSize] = useState(9);
  const [exemptSkillIds, setExemptSkillIds] = useState<string[]>(EXEMPT_SKILL_IDS);
  const [showExemptModal, setShowExemptModal] = useState(false);
  const [pendingBoardAction, setPendingBoardAction] = useState<"none" | "generate">("none");
  const [boardCaps, setBoardCaps] = useState<Record<string, number> | null>(null);
  const [gp, setGp] = useState(0);
  const [keys, setKeys] = useState(0);
  const [showSkills, setShowSkills] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const [showAchievementDiaries, setShowAchievementDiaries] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [hasSeenRules, setHasSeenRules] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(RELAXED_RULES_STORAGE_KEY) === "true";
  });
  const [showMasters, setShowMasters] = useState(true);
  const [showUndiscovered, setShowUndiscovered] = useState(true);
  const [achievementProgress, setAchievementProgress] = useState<Record<string, AchievementProgress>>({});
  const [expandedAchievementIds, setExpandedAchievementIds] = useState<string[]>([]);
  const [masters, setMasters] = useState<SlayerMaster[]>(slayerMasterSeed);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [selectedTile, setSelectedTile] = useState<string | null>(null);
  const [hoveredTile, setHoveredTile] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [boardReady, setBoardReady] = useState(false);
  const [restoredBoard, setRestoredBoard] = useState(false);
  const [activeRun, setActiveRun] = useState<RunState | null>(null);
  const [dataMessage, setDataMessage] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [collapsedVersions, setCollapsedVersions] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(changelogEntries.map((entry, idx) => [entry.version, idx > 0]))
  );
  const [isMobileLayout, setIsMobileLayout] = useState(
    typeof window !== "undefined" ? window.innerWidth <= MOBILE_BREAKPOINT : false
  );
  const [playerName, setPlayerName] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("playerName") ?? "";
  });
  const [playerLookupStatus, setPlayerLookupStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [playerSkillLevels, setPlayerSkillLevels] = useState<Record<string, number>>({});
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [resolvedPlayer, setResolvedPlayer] = useState<string | null>(null);
  const [playerQuestStatus, setPlayerQuestStatus] = useState<Record<string, string>>({});
  const [playerQuestLookupStatus, setPlayerQuestLookupStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [playerQuestError, setPlayerQuestError] = useState<string | null>(null);
  const [lastLookupName, setLastLookupName] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installStatus, setInstallStatus] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(offset);
  const boardTransformRef = useRef(`translate(${offset.x}px, ${offset.y}px)`);
  const tileRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const centerPendingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const isDraggingRef = useRef(false);
  const mobileLayoutRef = useRef(false);
  const offsetLimit = useMemo(() => Math.max(boardSize * 40, 360), [boardSize]);
  const clampOffsetForBoard = useCallback((next: { x: number; y: number }) => clampOffset(next, offsetLimit), [offsetLimit]);

  const normalizeAchievementProgress = useCallback(
    (taskCount: number, existing?: AchievementProgress): AchievementProgress => ({
      tasks: Array.from({ length: taskCount }, (_, idx) => existing?.tasks?.[idx] ?? false)
    }),
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("achievementProgress");
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, AchievementProgress>;
        setAchievementProgress(parsed);
      }
    } catch (err) {
      console.error("Failed to restore achievement progress", err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("achievementProgress", JSON.stringify(achievementProgress));
    } catch (err) {
      console.error("Failed to persist achievement progress", err);
    }
  }, [achievementProgress]);

  useEffect(() => {
    offsetRef.current = offset;
    boardTransformRef.current = `translate(${offset.x}px, ${offset.y}px)`;
    const boardEl = boardRef.current;
    if (boardEl) {
      boardEl.style.transform = boardTransformRef.current;
    }
  }, [offset]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hasSeenRules) {
      localStorage.setItem(RELAXED_RULES_STORAGE_KEY, "true");
    }
  }, [hasSeenRules]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallStatus(null);
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setInstallStatus("App installed");
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const hydrateFromDb = useCallback(async () => {
    try {
      await seedDefaults();
      const run = (await db.runs.get("demo-run")) ?? (await db.runs.toCollection().first());
      const savedBoard = run ? await db.boards.get(run.boardId) : null;
      const fallbackBoardSize = run?.boardSize ?? 9;
      const savedCaps = savedBoard?.skillCapOverrides ?? null;

      setActiveRun(run ?? null);
      setGp(run?.gp ?? 0);
      setKeys(run?.keys ?? 0);
      setMasters(run?.masters?.length ? run.masters : slayerMasterSeed);
      setOffset(run?.offset ? clampOffsetForBoard(run.offset) : { x: 0, y: 0 });

      if (savedBoard?.tiles?.length) {
        const derivedSize = boardDimensionFromTiles(savedBoard.tiles);
        setBoard(savedBoard.tiles);
        setBoardSize(derivedSize || fallbackBoardSize);
        setBoardCaps(savedCaps);
        setRestoredBoard(true);
      } else {
        setBoard([]);
        setBoardSize(fallbackBoardSize);
        setBoardCaps(null);
        setRestoredBoard(false);
      }
    } catch (err) {
      console.error("Failed to load saved state", err);
    } finally {
      setBoardReady(true);
    }
  }, []);

  useEffect(() => {
    void hydrateFromDb();
  }, [hydrateFromDb]);

  useEffect(() => {
    if (!boardReady) return;
    if (!hasSeenRules) {
      setShowRules(true);
    }
  }, [boardReady, hasSeenRules]);

  useEffect(() => {
    let cancelled = false;

    const cached = (() => {
      try {
        const raw = sessionStorage.getItem(QUEST_CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as { quests?: Quest[]; timestamp?: number };
        if (!Array.isArray(parsed?.quests) || !parsed.quests.length || typeof parsed.timestamp !== "number") return null;
        const isFresh = Date.now() - parsed.timestamp < QUEST_CACHE_TTL_MS;
        return { quests: parsed.quests, isFresh };
      } catch (err) {
        console.error("Quest cache parse failed", err);
        return null;
      }
    })();

    if (cached?.quests?.length) {
      setQuests(cached.quests);
      setQuestStatus("ready");
      if (cached.isFresh) {
        return () => {
          cancelled = true;
        };
      }
    }

    const fetchQuests = async () => {
      if (!cached?.quests?.length) {
        setQuestStatus("loading");
      }

      try {
        const res = await fetch(QUEST_STRATEGY_URL, { cache: "no-store" });
        const data = await res.json();
        const html = data?.parse?.text as string | undefined;
        const list = parseQuestStrategyHtml(html);
        if (list?.length) {
          if (cancelled) return;
          setQuests(list);
          setQuestStatus("ready");
          try {
            sessionStorage.setItem(QUEST_CACHE_KEY, JSON.stringify({ quests: list, timestamp: Date.now() }));
          } catch (err) {
            console.warn("Quest cache write failed", err);
          }
          return;
        }
      } catch (err) {
        console.error("Quest fetch failed", err);
      }

      if (cancelled) return;
      if (!cached?.quests?.length) {
        setQuests(questFallback);
        setQuestStatus("error");
      } else {
        setQuestStatus("ready");
      }
    };

    const timer = window.setTimeout(() => void fetchQuests(), cached?.quests?.length ? 200 : 60);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setSkillStatus("loading");
        const res = await fetch(
          "https://runescape.wiki/api.php?action=cargoquery&format=json&tables=skills&fields=skills.skill,skills.maximumLevel&limit=50&origin=*"
        );
        const data = await res.json();
        const rows = data?.cargoquery as Array<{ title: { skill: string; maximumLevel: string } }>;
        if (rows?.length) {
          const parsed: SkillDef[] = rows.map((r) => ({
            id: r.title.skill.toLowerCase(),
            name: r.title.skill,
            maxLevel: Number(r.title.maximumLevel) || 99
          }));
          setSkills(parsed);
          setSkillStatus("ready");
        } else {
          setSkillStatus("error");
        }
      } catch (err) {
        console.error("Skill fetch failed", err);
        setSkillStatus("error");
      }
    };
    fetchSkills();
  }, []);

  const skillIconMap = useMemo(() => {
    const entries: Record<string, string> = {};
    const registerIcon = (id: string) => {
      const normalized = normalizeSkillId(id);
      entries[normalized] = assetPath(`icons/skills/${normalized}.png`);
    };

    staticSkills.forEach((s) => registerIcon(s.id));
    skills.forEach((s) => registerIcon(s.id));
    return entries;
  }, [skills]);

  const getSkillIcon = useCallback(
    (skillId?: string | null) => {
      if (!skillId) return undefined;
      return skillIconMap[normalizeSkillId(skillId)];
    },
    [skillIconMap]
  );

  const masterIconMap = useMemo(() => {
    const entries: Record<string, string> = {};
    [...masters, ...slayerMasterSeed].forEach((m) => {
      entries[m.avatar] = assetPath(`icons/slayer-masters/${m.avatar}.png`);
    });
    return entries;
  }, [masters]);

  const orderedSkillsForDisplay = useMemo(() => {
    const skillDisplayOrder = [
      "attack",
      "constitution",
      "mining",
      "strength",
      "agility",
      "smithing",
      "defence",
      "herblore",
      "fishing",
      "ranged",
      "thieving",
      "cooking",
      "prayer",
      "crafting",
      "firemaking",
      "magic",
      "fletching",
      "woodcutting",
      "runecrafting",
      "slayer",
      "farming",
      "construction",
      "hunter",
      "summoning",
      "dungeoneering",
      "divination",
      "invention",
      "archaeology",
      "necromancy"
    ];
    const explicitOrder = new Map(skillDisplayOrder.map((id, idx) => [id, idx]));
    const fallbackOrder = new Map(staticSkills.map((s, idx) => [s.id, idx + skillDisplayOrder.length]));
    return [...skills].sort((a, b) => {
      const aIdx = explicitOrder.get(a.id) ?? fallbackOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER;
      const bIdx = explicitOrder.get(b.id) ?? fallbackOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER;
      return aIdx - bIdx || a.name.localeCompare(b.name);
    });
  }, [skills]);

  const exemptOptions = useMemo(
    () =>
      EXEMPT_SKILL_IDS.map((id) => {
        const normalized = normalizeSkillId(id);
        return skills.find((s) => normalizeSkillId(s.id) === normalized) ?? { id, name: formatTitleCase(id), maxLevel: 99 };
      }),
    [skills]
  );

  const bands = useMemo(
    () =>
      skills.map((s) => ({
        ...s,
        bands: makeBands(s.maxLevel, relaxedRules.skillBandSize, s.id === "constitution" ? 10 : 1)
      })),
    [skills]
  );

  const skillCaps = useMemo<Record<string, number>>(
    () => {
      const caps: Record<string, number> = {};
      skills.forEach((s) => {
        const startLevel = s.id === "constitution" ? 10 : 1;
        const override = boardCaps?.[s.id];
        caps[s.id] = typeof override === "number" ? override : startLevel;
      });
      board.forEach((t) => {
        if (t.type !== "skill_band") return;
        const skillId = t.payload.skill;
        const band = t.payload.band;
        const accessible = t.state === "unlocked" || t.state === "claimed";
        if (!skillId || !band || !accessible) return;
        const [, end] = band;
        caps[skillId] = Math.max(caps[skillId] ?? 1, end);
      });
      return caps;
    },
    [board, boardCaps, skills]
  );

  const achievementsList = useMemo<Achievement[]>(() => areaAchievements.map((a) => ({ id: a.id, label: a.label, tier: a.tier })), []);

  const achievementTaskSets = useMemo<AchievementTaskEntry[]>(
    () =>
      areaAchievementTasks.map((entry) => {
        const meta = diarySets.find((d) => d.id === entry.id);
        const requirements = diaryRequirements.find((r) => r.id === entry.id);
        return { ...entry, meta, requirements };
      }),
    []
  );

  const meetsSkillRequirement = useCallback(
    (skill: string, level: number) => {
      const value = playerSkillLevels[normalizeSkillId(skill)];
      return typeof value === "number" ? value >= level : undefined;
    },
    [playerSkillLevels]
  );

  const meetsQuestRequirement = useCallback(
    (quest: string) => {
      const status = playerQuestStatus[slugify(quest)];
      if (!status) return undefined;
      return status.toLowerCase().includes("complete");
    },
    [playerQuestStatus]
  );

  const achievementsByArea = useMemo(
    () => {
      const grouped = new Map<string, AchievementTaskEntry[]>();
      achievementTaskSets.forEach((entry) => {
        const list = grouped.get(entry.area) ?? [];
        list.push(entry);
        grouped.set(entry.area, list);
      });
      return [...grouped.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([area, sets]) => ({
          area,
          sets: sets.sort((a, b) => achievementTierOrder[a.tier] - achievementTierOrder[b.tier])
        }));
    },
    [achievementTaskSets]
  );

  const discoveredAchievementIds = useMemo(() => {
    const ids = new Set<string>();
    board.forEach((tile) => {
      if (tile.type === "achievement" && tile.state !== "hidden") {
        const achievementId = tile.payload.achievementId as string | undefined;
        if (achievementId) ids.add(achievementId);
      }
    });
    return ids;
  }, [board]);

  const achievementProgressSummary = useMemo(() => {
    let completed = 0;
    let total = 0;
    for (const entry of achievementTaskSets) {
      const progress = normalizeAchievementProgress(entry.tasks.length, achievementProgress[entry.id]);
      completed += progress.tasks.filter(Boolean).length;
      total += entry.tasks.length;
    }
    return { completed, total };
  }, [achievementProgress, achievementTaskSets, normalizeAchievementProgress]);

  const getAchievementProgress = useCallback(
    (setId: string, taskCount: number) => normalizeAchievementProgress(taskCount, achievementProgress[setId]),
    [achievementProgress, normalizeAchievementProgress]
  );

  const toggleAchievementTask = useCallback(
    (setId: string, taskIndex: number, taskCount: number) => {
      setAchievementProgress((curr) => {
        const normalized = normalizeAchievementProgress(taskCount, curr[setId]);
        normalized.tasks[taskIndex] = !normalized.tasks[taskIndex];
        return { ...curr, [setId]: normalized };
      });
    },
    [normalizeAchievementProgress]
  );

  const setAllAchievementTasks = useCallback((setId: string, taskCount: number, value: boolean) => {
    setAchievementProgress((curr) => ({
      ...curr,
      [setId]: { tasks: Array.from({ length: taskCount }, () => value) }
    }));
  }, []);

  const normalizeAchievementProgressMap = useCallback(
    (incoming?: Record<string, AchievementProgress>) => {
      const next: Record<string, AchievementProgress> = {};
      achievementTaskSets.forEach((entry) => {
        next[entry.id] = normalizeAchievementProgress(entry.tasks.length, incoming?.[entry.id]);
      });
      return next;
    },
    [achievementTaskSets, normalizeAchievementProgress]
  );

  const toggleChangelogVersion = useCallback((version: string) => {
    setCollapsedVersions((curr) => ({ ...curr, [version]: !curr[version] }));
  }, []);

  const toggleAchievementExpansion = useCallback((id: string) => {
    setExpandedAchievementIds((curr) => (curr.includes(id) ? curr.filter((val) => val !== id) : [...curr, id]));
  }, []);

  const orderedQuests = useMemo(() => (quests.length ? quests : questFallback), [quests]);
  const questTiles = useMemo(() => board.filter((t) => t.type === "quest"), [board]);
  const questTileMap = useMemo(() => {
    const map = new Map<string, Tile>();
    questTiles.forEach((t) => map.set(t.id, t));
    return map;
  }, [questTiles]);

  const questEntries = useMemo(
    () =>
      orderedQuests.map((q) => ({
        quest: q,
        tile: questTileMap.get(q.id)
      })),
    [orderedQuests, questTileMap]
  );

  const questQuestStatus = useMemo(() => {
    const map = new Map<string, string>();
    questEntries.forEach(({ quest }) => {
      const key = slugify(quest.name);
      const status = playerQuestStatus[key];
      if (status) map.set(quest.id, status);
    });
    return map;
  }, [playerQuestStatus, questEntries]);

  const formatQuestStatus = (status?: string | null) => {
    if (!status) return null;
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const visibleQuests = useMemo(
    () => questEntries.filter((entry) => entry.tile && entry.tile.state !== "hidden"),
    [questEntries]
  );

  const availableQuests = useMemo(() => visibleQuests.filter((entry) => entry.tile?.state === "unlocked"), [visibleQuests]);
  const unlockableQuests = useMemo(() => visibleQuests.filter((entry) => entry.tile?.state === "locked"), [visibleQuests]);
  const completedQuests = useMemo(() => visibleQuests.filter((entry) => entry.tile?.state === "claimed"), [visibleQuests]);

  const tileLookup = useMemo(() => {
    const map = new Map<string, Tile>();
    board.forEach((t) => map.set(`${t.coords.x},${t.coords.y}`, t));
    return map;
  }, [board]);

  const boardForRender = useMemo(
    () => [...board].sort((a, b) => a.coords.y - b.coords.y || a.coords.x - b.coords.x),
    [board]
  );

  const generateBoard = useCallback(
    (selectedExempt?: string[]) => {
      const exemptSet = new Set((selectedExempt ?? exemptSkillIds).map(normalizeSkillId));
      const questCount = Math.max(orderedQuests.length, 1);
      const baseCaps: Record<string, number> = {};
      const skillTiles = bands.flatMap((skill) => {
        const normalized = normalizeSkillId(skill.id);
        const startLevel = skill.id === "constitution" ? 10 : 1;
        if (exemptSet.has(normalized)) {
          baseCaps[skill.id] = skill.maxLevel;
          return [];
        }
        baseCaps[skill.id] = startLevel;
        return skill.bands.map((band) => ({
          priority: band[0],
          tile: {
            id: `skill-${skill.id}-${band[0]}-${band[1]}`,
            type: "skill_band" as TileType,
            payload: { label: `${skill.name} ${band[0]}-${band[1]}`, skill: skill.id, band },
            coords: { x: 0, y: 0 },
            cost: 1,
            state: "hidden" as TileState
          }
        }));
      });

      const questTiles = orderedQuests.map((q) => ({
        priority: (q.order / questCount) * 120,
        tile: {
          id: q.id,
          type: "quest" as TileType,
          payload: { label: q.name, questId: q.id },
          coords: { x: 0, y: 0 },
          cost: 1,
          state: "hidden" as TileState
        }
      }));

      const achievementTiles = achievementsList.map((ach, idx) => ({
        priority: achievementBias[ach.tier] + idx * 0.05,
        tile: {
          id: `achievement-${ach.id}`,
          type: "achievement" as TileType,
          payload: { label: ach.label, achievementId: ach.id },
          coords: { x: 0, y: 0 },
          cost: 1,
          state: "hidden" as TileState
        }
      }));

      const freeTiles = Array.from({ length: FREE_TILE_COUNT }, (_, idx) => {
        const priority = idx < 2 ? 0.5 + idx * 0.25 : 6 + (idx - 2) * 2;
        return {
          priority,
          tile: {
            id: `free-${idx}`,
            type: "utility" as TileType,
            payload: { label: "Free tile" },
            coords: { x: 0, y: 0 },
            cost: 0,
            state: "hidden" as TileState
          }
        };
      });

      const combined = [...skillTiles, ...achievementTiles, ...questTiles, ...freeTiles]
        .map((entry) => ({ ...entry, priority: entry.priority + Math.random() * 4 }))
        .sort((a, b) => a.priority - b.priority || a.tile.id.localeCompare(b.tile.id));

      const requiredKeys = skillTiles.length + questTiles.length + achievementTiles.length;
      const totalTiles = combined.length + 1; // include the start tile
      const size = nextOdd(Math.max(7, Math.ceil(Math.sqrt(totalTiles + 6))));
      const center = Math.floor(size / 2);
      const coordsByRing: Record<number, Array<{ x: number; y: number; d: number; angle: number }>> = {};
      coordsByDistance(size)
        .filter((c) => !(c.x === center && c.y === center))
        .forEach((coord) => {
          coordsByRing[coord.d] = coordsByRing[coord.d] ?? [];
          coordsByRing[coord.d].push(coord);
        });

      const ringOrder = Object.keys(coordsByRing)
        .map(Number)
        .sort((a, b) => a - b);
      const coords = ringOrder.flatMap((d) => shuffle(coordsByRing[d]));

      const placedTiles: Tile[] = combined.map((entry, idx) => {
        const coord = coords[idx] ?? coords[coords.length - 1];
        const distance = Math.abs(coord.x - center) + Math.abs(coord.y - center);
        const initialState: TileState = distance === 1 ? "locked" : "hidden";
        return {
          ...entry.tile,
          coords: { x: coord.x, y: coord.y },
          cost: entry.tile.cost ?? 1,
          state: initialState
        };
      });

      const startTile: Tile = {
        id: "start",
        type: "utility",
        payload: { label: "Start" },
        coords: { x: center, y: center },
        cost: 0,
        state: "claimed"
      };

      setBoard([startTile, ...placedTiles]);
      setBoardCaps(baseCaps);
      setBoardSize(size);
      setSelectedTile(null);
      setHoveredTile(null);
      setRestoredBoard(false);
      setGp(0);
      setKeys(0);
      setMasters(allocateKeyPools(requiredKeys));
      centerPendingRef.current = true;
    },
    [achievementsList, bands, exemptSkillIds, orderedQuests]
  );

  useEffect(() => {
    if (!boardReady || restoredBoard) return;
    if (!hasSeenRules) return;
    if (questStatus === "loading" || questStatus === "idle") return;
    if (skillStatus === "loading" || skillStatus === "idle") return;
    if (board.length > 0) return;
    if (pendingBoardAction === "generate") return;
    setPendingBoardAction("generate");
    setShowExemptModal(true);
  }, [board.length, boardReady, hasSeenRules, pendingBoardAction, questStatus, restoredBoard, skillStatus]);

const activeTileId = selectedTile ?? hoveredTile;
const activeTile = useMemo(() => board.find((t) => t.id === activeTileId) ?? null, [board, activeTileId]);
const selectionLocked = selectedTile === activeTile?.id;
const activeSkillIcon = getSkillIcon(activeTile?.payload.skill);
const activeQuestGuideUrl = activeTile?.type === "quest" ? quickGuideUrl(activeTile.payload.label) : null;

  const updateTooltipPosition = useCallback(() => {
    if (!activeTileId) {
      setTooltipPos(null);
      return;
    }
    const el = tileRefs.current.get(activeTileId);
    if (!el) {
      setTooltipPos(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
  }, [activeTileId]);

  useLayoutEffect(() => {
    updateTooltipPosition();
  }, [updateTooltipPosition, offset, board]);

  useEffect(() => {
    window.addEventListener("resize", updateTooltipPosition);
    return () => window.removeEventListener("resize", updateTooltipPosition);
  }, [updateTooltipPosition]);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: offsetRef.current.x,
      originY: offsetRef.current.y
    };
    isDraggingRef.current = false;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const moved = Math.abs(dx) > 2 || Math.abs(dy) > 2;
    if (moved && !isDraggingRef.current) {
      isDraggingRef.current = true;
      setSelectedTile(null);
      setHoveredTile(null);
    }
    const nextOffset = clampOffsetForBoard({ x: dragRef.current.originX + dx, y: dragRef.current.originY + dy });
    offsetRef.current = nextOffset;
    boardTransformRef.current = `translate(${nextOffset.x}px, ${nextOffset.y}px)`;
    if (boardRef.current) {
      boardRef.current.style.transform = boardTransformRef.current;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    dragRef.current = null;
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setOffset((prev) => {
        if (prev.x === offsetRef.current.x && prev.y === offsetRef.current.y) return prev;
        return offsetRef.current;
      });
    }
  };

  const centerOnTile = useCallback((tileId: string) => {
    const el = tileRefs.current.get(tileId);
    if (!el) {
      setOffset({ x: 0, y: 0 });
      return;
    }
    const rect = el.getBoundingClientRect();
    const targetX = window.innerWidth / 2;
    const targetY = window.innerHeight / 2;
    const dx = targetX - (rect.left + rect.width / 2);
    const dy = targetY - (rect.top + rect.height / 2);
    setOffset((prev) => clampOffsetForBoard({ x: prev.x + dx, y: prev.y + dy }));
  }, [clampOffsetForBoard]);

  const ensureStartVisible = useCallback(() => {
    const startEl = tileRefs.current.get("start");
    if (!startEl) return;
    const rect = startEl.getBoundingClientRect();
    if (!isRectOnScreen(rect)) {
      centerOnTile("start");
    }
  }, [centerOnTile]);

  useLayoutEffect(() => {
    if (centerPendingRef.current) {
      centerPendingRef.current = false;
      centerOnTile("start");
    }
    ensureStartVisible();
  }, [board, centerOnTile, ensureStartVisible]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      const wasMobile = mobileLayoutRef.current;
      const next = window.innerWidth <= MOBILE_BREAKPOINT;
      mobileLayoutRef.current = next;
      setIsMobileLayout(next);
      const crossedBreakpoint = (next && !wasMobile) || (!next && wasMobile);
      if (crossedBreakpoint && boardReady) {
        centerOnTile("start");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [boardReady, centerOnTile]);

  useEffect(() => {
    if (!boardReady) return;
    const timer = window.setTimeout(() => ensureStartVisible(), 120);
    return () => clearTimeout(timer);
  }, [boardReady, ensureStartVisible, boardSize]);

  const handleCompleteTask = (id: string) => {
    let awarded = 0;
    const updatedMasters = masters.map((m) => {
      if (m.id !== id) return m;
      const remaining = Math.max(m.keyPool - m.keysFound, 0);
      const chance = remaining > 0 ? remaining / m.keyPool : 0;
      const roll = Math.random();
      const gotKey = roll < chance ? 1 : 0;
      awarded += gotKey;
      return {
        ...m,
        tasks: m.tasks + 1,
        keysFound: m.keysFound + gotKey
      };
    });
    setMasters(updatedMasters);
    if (awarded > 0) {
      setKeys((k) => k + awarded);
    }
  };

  const revealAdjacents = (cx: number, cy: number, tiles: Tile[]) => {
    return tiles.map((t) => {
      const isNeighbor = Math.abs(t.coords.x - cx) + Math.abs(t.coords.y - cy) === 1;
      if (isNeighbor && t.state === "hidden") {
        return { ...t, state: "locked" as TileState };
      }
      return t;
    });
  };

  const convertLegacyBoard = useCallback(() => {
    if (boardCaps) return;
    const exemptSet = new Set(exemptSkillIds.map(normalizeSkillId));
    const overrides: Record<string, number> = {};
    skills.forEach((s) => {
      const normalized = normalizeSkillId(s.id);
      const startLevel = s.id === "constitution" ? 10 : 1;
      overrides[s.id] = exemptSet.has(normalized) ? s.maxLevel : startLevel;
    });

    let refunded = 0;
    const revealTargets: Array<{ x: number; y: number }> = [];
    let updatedBoard = board.map((t) => {
      if (t.type !== "skill_band") return t;
      const skillId = t.payload.skill;
      if (!skillId) return t;
      const normalized = normalizeSkillId(skillId);
      if (!exemptSet.has(normalized)) return t;
      if (t.state === "unlocked" || t.state === "claimed") {
        refunded += t.cost ?? 1;
      }
      revealTargets.push({ x: t.coords.x, y: t.coords.y });
      return { ...t, state: "claimed" as TileState };
    });

    revealTargets.forEach(({ x, y }) => {
      updatedBoard = revealAdjacents(x, y, updatedBoard);
    });

    if (refunded > 0) {
      setKeys((k) => k + refunded);
    }

    setBoard(updatedBoard);
    setBoardCaps(overrides);
    setSelectedTile(null);
    setHoveredTile(null);
  }, [board, boardCaps, exemptSkillIds, revealAdjacents, skills]);

  const toggleExemptSkill = useCallback((skillId: string) => {
    setExemptSkillIds((prev) => {
      const exists = prev.includes(skillId);
      if (exists) return prev.filter((id) => id !== skillId);
      return [...prev, skillId];
    });
  }, []);

  const handleUseDefaultExempt = useCallback(() => {
    setExemptSkillIds(EXEMPT_SKILL_IDS);
  }, []);

  const handleConfirmExempt = useCallback(() => {
    generateBoard(exemptSkillIds);
    setPendingBoardAction("none");
    setShowExemptModal(false);
  }, [exemptSkillIds, generateBoard]);

  const handleTileAction = (tile: Tile | null) => {
    if (!tile || tile.state === "hidden" || tile.state === "claimed") return;
    if (tile.state === "locked") {
      if (keys < tile.cost) return;
      setKeys((k) => k - tile.cost);
      setBoard((prev) =>
        prev.map((t) => {
          if (t.id === tile.id) return { ...t, state: "unlocked" as TileState };
          return t;
        })
      );
      setSelectedTile(tile.id);
    } else if (tile.state === "unlocked") {
      setBoard((prev) => {
        const updated = prev.map((t) => {
          if (t.id === tile.id) return { ...t, state: "claimed" as TileState };
          return t;
        });
        return revealAdjacents(tile.coords.x, tile.coords.y, updated);
      });
      setSelectedTile(null);
      setHoveredTile(null);
    }
  };

  const unlockQuestTile = useCallback(
    (questId: string) => {
      const target = board.find((t) => t.id === questId && t.state === "locked");
      if (!target) return;
      const cost = target.cost ?? 1;
      if (keys < cost) return;

      setKeys((k) => Math.max(0, k - cost));
      setBoard((prev) =>
        prev.map((t) => (t.id === questId && t.state === "locked" ? { ...t, state: "unlocked" as TileState } : t))
      );
      setSelectedTile((curr) => (curr === questId ? null : curr));
      setHoveredTile((curr) => (curr === questId ? null : curr));
    },
    [board, keys]
  );

  const completeQuestTile = useCallback(
    (questId: string) => {
      setBoard((prev) => {
        const target = prev.find((t) => t.id === questId);
        if (!target || target.type !== "quest" || target.state !== "unlocked") return prev;
        const updated = prev.map((t) => (t.id === questId ? { ...t, state: "claimed" as TileState } : t));
        return revealAdjacents(target.coords.x, target.coords.y, updated);
      });
      setSelectedTile((curr) => (curr === questId ? null : curr));
      setHoveredTile((curr) => (curr === questId ? null : curr));
    },
    [revealAdjacents]
  );

  const mapRunemetricsSkills = (skillsArr?: Array<{ name?: string; level?: number }>) => {
    const map: Record<string, number> = {};
    (skillsArr ?? []).forEach((s) => {
      if (!s?.name) return;
      const key = normalizeSkillId(s.name);
      if (typeof s.level === "number" && Number.isFinite(s.level)) {
        map[key] = s.level;
      }
    });
    return map;
  };

  const fetchWithTimeout = async (url: string, ms = 6000) => {
    const controller = new AbortController();
    const id = window.setTimeout(() => controller.abort(), ms);
    try {
      return await fetch(url, { cache: "no-store", signal: controller.signal, mode: "cors", credentials: "omit" });
    } finally {
      clearTimeout(id);
    }
  };

  const tryFetchJson = async (url: string) => {
    for (const proxied of proxyUrls(url)) {
      try {
        const res = await fetchWithTimeout(proxied);
        if (!res.ok || res.status === 429) continue;
        if (proxied.includes("/get?")) {
          const wrapper = await res.json().catch(() => null);
          if (wrapper?.contents) return JSON.parse(wrapper.contents);
        } else {
          return await res.json();
        }
      } catch (err) {
        // try next proxy
      }
    }
    return null;
  };

  const tryFetchText = async (url: string) => {
    for (const proxied of proxyUrls(url)) {
      try {
        const res = await fetchWithTimeout(proxied);
        if (!res.ok || res.status === 429) continue;
        if (proxied.includes("/get?")) {
          const wrapper = await res.json().catch(() => null);
          if (wrapper?.contents) return wrapper.contents as string;
        } else {
          return res.text();
        }
      } catch (err) {
        // try next proxy
      }
    }
    return null;
  };

  const mapHiscoreSkills = (csv: string) => {
    const map: Record<string, number> = {};
    const lines = csv.trim().split(/\r?\n/);
    const startIndex = 1; // line 0 is overall/total
    hiscoreSkillOrder.forEach((id, idx) => {
      const line = lines[idx + startIndex];
      if (!line) return;
      const parts = line.split(",");
      const level = Number(parts[1]);
      if (Number.isFinite(level)) {
        map[id] = level;
      }
    });
    return map;
  };

  const lookupPlayerSkills = useCallback(async () => {
    const name = playerName.trim();
    if (!name) return;
    setPlayerLookupStatus("loading");
    setPlayerError(null);
    setResolvedPlayer(null);
    setPlayerSkillLevels({});
    try {
      const data = await tryFetchJson(runemetricsProfileUrl(name));
      if (data && !data.error && Array.isArray(data.skills)) {
        const mapped = mapRunemetricsSkills(data.skills);
        if (Object.keys(mapped).length) {
          setPlayerSkillLevels(mapped);
          setPlayerLookupStatus("ready");
          setResolvedPlayer((data as { name?: string })?.name || name);
          setLastLookupName(name.toLowerCase());
          return;
        }
      }
    } catch (err) {
      // fall through to hiscore
    }

    try {
      const text = await tryFetchText(hiscoreLiteUrl(name));
      if (text) {
        const mapped = mapHiscoreSkills(text);
        if (Object.keys(mapped).length) {
          setPlayerSkillLevels(mapped);
          setPlayerLookupStatus("ready");
          setResolvedPlayer(name);
          setLastLookupName(name.toLowerCase());
          return;
        }
      }
      setPlayerLookupStatus("error");
      setPlayerError("No skill data found");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setPlayerLookupStatus("error");
      setPlayerError(message);
    }
  }, [playerName]);

  const mapRunemetricsQuests = (questsArr?: Array<{ title?: string; status?: string }>) => {
    const map: Record<string, string> = {};
    (questsArr ?? []).forEach((q) => {
      if (!q?.title) return;
      const key = slugify(q.title);
      if (q.status) {
        map[key] = q.status.toLowerCase();
      }
    });
    return map;
  };

  const lookupPlayerQuests = useCallback(async () => {
    const name = playerName.trim();
    if (!name) return;
    setPlayerQuestLookupStatus("loading");
    setPlayerQuestError(null);
    const data = await tryFetchJson(runemetricsQuestsUrl(name));
    const questArray = Array.isArray(data) ? data : Array.isArray(data?.quests) ? data.quests : null;
    console.info("[Runemetrics quests] Raw response", { player: name, data });
    if (questArray) {
      const mapped = mapRunemetricsQuests(questArray);
      console.info("[Runemetrics quests] Parsed quest map", mapped);
      if (Object.keys(mapped).length) {
        setPlayerQuestStatus(mapped);
        setPlayerQuestLookupStatus("ready");
        setLastLookupName(name.toLowerCase());
        return;
      }
    }
    const error = (data as { error?: string })?.error || "Quest data not available";
    console.warn("[Runemetrics quests] Quest data not available", { player: name, data, questArray });
    setPlayerQuestLookupStatus("error");
    setPlayerQuestError(error);
  }, [playerName]);

  const lookupPlayerData = useCallback(() => {
    lookupPlayerSkills();
    lookupPlayerQuests();
  }, [lookupPlayerQuests, lookupPlayerSkills]);

  const handleOpenQuests = useCallback(() => {
    setShowQuests(true);
    void lookupPlayerQuests();
  }, [lookupPlayerQuests]);

  useEffect(() => {
    if (!playerName.trim()) return;
    setPlayerLookupStatus("idle");
    setPlayerQuestLookupStatus("idle");
  }, [playerName]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("playerName", playerName);
  }, [playerName]);

  useEffect(() => {
    if (
      showSkills &&
      playerName.trim() &&
      playerLookupStatus === "idle" &&
      playerName.trim().toLowerCase() !== lastLookupName
    ) {
      lookupPlayerData();
    }
  }, [lastLookupName, lookupPlayerData, playerLookupStatus, playerName, showSkills]);

  useEffect(() => {
    if (
      showQuests &&
      playerName.trim() &&
      playerQuestLookupStatus === "idle" &&
      playerName.trim().toLowerCase() !== lastLookupName
    ) {
      lookupPlayerQuests();
    }
  }, [lastLookupName, lookupPlayerQuests, playerName, playerQuestLookupStatus, showQuests]);

  const handleTileSelect = (tileId: string) => {
    setSelectedTile((prev) => (prev === tileId ? null : tileId));
    setHoveredTile(null);
  };

  const revealEntireBoard = () => {
    setBoard((prev) =>
      prev.map((t) => {
        if (t.state === "hidden") return { ...t, state: "locked" as TileState };
        return t;
      })
    );
  };

  const isHiddenFrontier = useCallback(
    (tile: Tile) => {
      if (tile.state !== "hidden") return false;
      const { x, y } = tile.coords;
      const dirs = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1]
      ];
      return dirs.some(([dx, dy]) => {
        const neighbor = tileLookup.get(`${x + dx},${y + dy}`);
        return neighbor && neighbor.state !== "hidden";
      });
    },
    [tileLookup]
  );

  const persistState = useCallback(
    async (
      nextBoard = board,
      nextGp = gp,
      nextKeys = keys,
      nextMasters = masters,
      nextOffset = offset,
      nextCaps = boardCaps
    ) => {
      try {
        const now = new Date().toISOString();
        const clampedOffset = clampOffsetForBoard(nextOffset);
        const baseRun: RunState =
          activeRun ?? {
            id: "demo-run",
            name: "Demo Run",
            ruleConfigId: "relaxed-mode",
            boardId: "starter-board",
            gp: nextGp,
            keys: nextKeys,
            history: [],
            createdAt: now,
            updatedAt: now
          };
        const updatedRun: RunState = {
          ...baseRun,
          gp: nextGp,
          keys: nextKeys,
          masters: nextMasters,
          offset: clampedOffset,
          boardSize,
          updatedAt: now
        };
        await db.transaction("rw", [db.runs, db.boards], async () => {
          await db.boards.put({
            id: baseRun.boardId,
            name: "Starter Board",
            adjacency: "4-way",
            tiles: nextBoard,
            skillCapOverrides: nextCaps ?? undefined
          });
          await db.runs.put(updatedRun);
        });
        setActiveRun(updatedRun);
      } catch (err) {
        console.error("Failed to persist state", err);
      }
    },
    [activeRun, board, boardCaps, boardSize, gp, keys, masters, offset]
  );

  useEffect(() => {
    if (!boardReady) return;
    persistState(board, gp, keys, masters, offset, boardCaps);
  }, [board, boardCaps, gp, keys, masters, offset, boardReady, persistState]);

  const handleInstallClick = useCallback(async () => {
    if (!installPrompt) {
      setInstallStatus("Install prompt not available. Use the browser menu to install.");
      return;
    }
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setInstallStatus(
        choice?.outcome === "accepted"
          ? "Install started—confirm in your browser."
          : "Install dismissed."
      );
    } catch (err) {
      console.error("Install prompt failed", err);
      setInstallStatus("Could not show the install prompt. Try your browser menu.");
    } finally {
      setInstallPrompt(null);
    }
  }, [installPrompt]);

  const handleExportData = useCallback(async () => {
    try {
      setDataError(null);
      setDataMessage(null);
      setIsExporting(true);
      const normalizedProgress = normalizeAchievementProgressMap(achievementProgress);
      const bundle = await exportAll({
        achievementProgress: normalizedProgress,
        playerName: playerName.trim() || undefined,
        version: APP_VERSION
      });
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const versionTag = `v${bundle.version || APP_VERSION}`;
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `slayerscape-${versionTag}-export-${timestamp}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setDataMessage(`Exported data (v${bundle.version}).`);
    } catch (err) {
      console.error("Failed to export data", err);
      setDataError("Export failed. Check console for details.");
    } finally {
      setIsExporting(false);
    }
  }, [achievementProgress, normalizeAchievementProgressMap, playerName]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImportFile = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      setIsImporting(true);
      setDataMessage(null);
      setDataError(null);
      setBoardReady(false);
      try {
        const text = await file.text();
        const parsed = JSON.parse(text) as ExportBundle;
        if (!Array.isArray((parsed as { runs?: unknown }).runs) || !Array.isArray(parsed.boards) || !Array.isArray(parsed.rules)) {
          throw new Error("Invalid export file: missing runs, boards, or rules.");
        }
        await importBundle(parsed);
        setAchievementProgress(normalizeAchievementProgressMap(parsed.achievementProgress));
        if (parsed.playerName) setPlayerName(parsed.playerName);
        await hydrateFromDb();
        setDataMessage(`Import complete${parsed.version ? ` (v${parsed.version})` : ""}.`);
      } catch (err: unknown) {
        console.error("Failed to import data", err);
        const message = err instanceof Error ? err.message : "Import failed. Please use a valid export file.";
        setDataError(message);
      } finally {
        setIsImporting(false);
        setBoardReady(true);
        event.target.value = "";
      }
    },
    [hydrateFromDb, normalizeAchievementProgressMap]
  );

  const handleCloseRules = useCallback(() => {
    setShowRules(false);
    setHasSeenRules(true);
    if (!restoredBoard && board.length === 0 && questStatus !== "loading" && questStatus !== "idle" && skillStatus !== "loading" && skillStatus !== "idle") {
      setPendingBoardAction("generate");
      setShowExemptModal(true);
    }
  }, [board.length, questStatus, restoredBoard, skillStatus]);

  const handleOpenRules = useCallback(() => {
    setShowRules(true);
  }, []);

  return (
    <div className="stage">
      <div className="board-layer">
        <div
          className="board-full"
          ref={boardRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDragStart={(e) => e.preventDefault()}
          style={{ transform: boardTransformRef.current }}
        >
          <div
            className="board"
            style={{
              gridTemplateColumns: `repeat(${boardSize}, 72px)`,
              gridTemplateRows: `repeat(${boardSize}, 72px)`
            }}
          >
            {boardForRender.map((tile) => {
              const frontier = isHiddenFrontier(tile);
              const shouldShowContent = tile.state !== "hidden";
              const skillIcon = getSkillIcon(tile.payload.skill);
              return (
                <div
                  key={tile.id}
                  ref={(el) => {
                    if (el) tileRefs.current.set(tile.id, el);
                    else tileRefs.current.delete(tile.id);
                  }}
                  className={`${tileClass(tile.state)}${selectedTile === tile.id ? " is-selected" : ""}${
                    frontier ? " frontier" : ""
                  }`}
                  style={{ gridColumnStart: tile.coords.x + 1, gridRowStart: tile.coords.y + 1 }}
                  onClick={(e) => {
                    if (isDraggingRef.current) return;
                    handleTileSelect(tile.id);
                  }}
                  onMouseEnter={() => setHoveredTile(tile.id)}
                  onMouseLeave={() => {
                    if (selectedTile !== tile.id) {
                      setHoveredTile((curr) => (curr === tile.id ? null : curr));
                    }
                  }}
                >
                  {shouldShowContent && (
                    <>
                      <div className="tile-icon">
                        {tile.type === "skill_band" && skillIcon ? (
                          <img src={skillIcon} alt={tile.payload.label} draggable={false} />
                        ) : (
                          <img src={typeIcons[tile.type] ?? typeIcons.utility} alt={tile.type} draggable={false} />
                        )}
                      </div>
                      {tile.state === "locked" && (
                        <div className="tile-overlay lock" aria-hidden="true">
                          <img src={assetPath("icons/lock.png")} alt="" />
                        </div>
                      )}
                      {tile.state === "claimed" && (
                        <div className="tile-overlay tick" aria-hidden="true">
                          <img src={assetPath("icons/check.png")} alt="" />
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="overlay">
        <div className="hud-float top-left">
          <div className="stat">
            <img className="key-icon" src={assetPath("icons/slayer-key.png")} alt="Keys" />
            <span className="value">{keys}</span>
          </div>
        </div>
        <div className="hud-float top-right">
          <form
            className="player-inline compact"
            onSubmit={(e) => {
              e.preventDefault();
              if (playerLookupStatus === "loading") return;
              lookupPlayerData();
            }}
          >
            <input
              className="player-inline-input"
              type="text"
              placeholder="Player name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onFocus={(e) => e.target.select()}
            />
          <button className="pill-btn small" type="submit" disabled={!playerName.trim() || playerLookupStatus === "loading"}>
            {playerLookupStatus === "loading" ? "Fetching..." : "Lookup"}
          </button>
        </form>
        <button
          className="icon-btn framed"
          onClick={() => setShowMasters((v) => !v)}
          aria-label={showMasters ? "Hide Slayer Masters" : "Show Slayer Masters"}
        >
          <img src={assetPath("icons/skills/slayer.png")} alt="" aria-hidden="true" />
        </button>
        <button className="icon-btn framed" onClick={() => setShowSkills(true)} aria-label="Unlocked Skills">
          <img src={assetPath("icons/skills-icon.png")} alt="" aria-hidden="true" />
        </button>
        <button className="icon-btn framed" onClick={handleOpenQuests} aria-label="Unlocked Quests">
          <img src={assetPath("icons/quest.png")} alt="" aria-hidden="true" />
        </button>
        <button
          className="icon-btn framed"
          onClick={() => setShowAchievementDiaries(true)}
          aria-label="Achievement Diaries"
        >
          <img src={assetPath("icons/achievement.png")} alt="" aria-hidden="true" />
        </button>
        <button className="icon-btn framed" onClick={handleOpenRules} aria-label="Relaxed Mode Rules">
          <img src={assetPath("icons/rules-icon.png")} alt="" aria-hidden="true" />
        </button>
        <button className="icon-btn framed" onClick={() => setShowOptions(true)} aria-label="Board Options">
          <img src={assetPath("icons/Options_icon.png")} alt="" aria-hidden="true" />
        </button>
      </div>

        {showMasters && (
          <aside className={`panel masters${isMobileLayout ? " mobile" : ""}`}>
            <div className="panel-title">
              <h3>Slayer Masters</h3>
              <span className="muted">1 key per tile</span>
              <button className="panel-close" onClick={() => setShowMasters(false)}>
                X
              </button>
            </div>
            <div className="slayer-list">
              {masters.map((m) => {
                const progress = m.keyPool ? Math.min((m.keysFound / m.keyPool) * 100, 100) : 0;
                const keysRemaining = Math.max(m.keyPool - m.keysFound, 0);
                return (
                  <div key={m.id} className="slayer-card">
                    <div className="slayer-avatar">
                      {masterIconMap[m.avatar] ? (
                        <img src={masterIconMap[m.avatar]} alt={m.name} />
                      ) : (
                        m.avatar[0]?.toUpperCase()
                      )}
                    </div>
                    <div className="slayer-body">
                      <div className="slayer-header">
                        <div className="slayer-name">{m.name}</div>
                        <span className="slayer-tag">{m.requirement}</span>
                      </div>
                      <div className="slayer-stats">
                        <span className="slayer-pill">
                          <span className="label">Tasks</span>
                          <strong>{m.tasks}</strong>
                        </span>
                        <span className="slayer-pill">
                          <span className="label">Keys</span>
                          <strong>
                            {m.keysFound}/{m.keyPool}
                          </strong>
                        </span>
                        <span className="slayer-pill subtle">
                          <span className="label">Left</span>
                          <strong>{keysRemaining}</strong>
                        </span>
                      </div>
                      <div className="slayer-actions">
                        <button className="btn-ghost" onClick={() => handleCompleteTask(m.id)}>
                          Complete Task
                        </button>
                      </div>
                      <div className="slayer-progress">
                        <div className="slayer-progress-bar">
                          <span className="slayer-progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="slayer-progress-text">{progress.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        )}
      </div>

      {activeTile && tooltipPos && activeTile.state !== "hidden" && (
        <div className="floating-tooltip" style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}>
          <div className="tooltip-card">
            <div className="tooltip-icon">
              {activeTile.type === "skill_band" && activeSkillIcon ? (
                <img src={activeSkillIcon} alt={activeTile.payload.label} />
              ) : (
                <img src={typeIcons[activeTile.type] ?? typeIcons.utility} alt={activeTile.type} />
              )}
            </div>
            <div className="tooltip-text">
              <div className="tooltip-title">{activeTile.payload.label}</div>
              {activeTile.payload.band && (
                <div className="tooltip-sub">
                  Band {activeTile.payload.band[0]}-{activeTile.payload.band[1]}
                </div>
              )}
              <div className="tooltip-sub">
                State: {activeTile.state} - Cost: {activeTile.cost} key{activeTile.cost > 1 ? "s" : ""}
              </div>
            </div>
          </div>
          <div className="tooltip-action">
            {selectionLocked ? (
              <>
                {activeQuestGuideUrl ? (
                  <a className="pill-btn small" href={activeQuestGuideUrl} target="_blank" rel="noreferrer">
                    <img className="pill-icon" src={wikiIcon} alt="" aria-hidden="true" />
                    Quick guide
                  </a>
                ) : null}
                {activeTile.state === "locked" ? (
                  <button className="action-btn" disabled={keys < activeTile.cost} onClick={() => handleTileAction(activeTile)}>
                    <img src={assetPath("icons/slayer-key.png")} alt="Key" /> Unlock ({activeTile.cost})
                  </button>
                ) : activeTile.state === "unlocked" ? (
                  <button className="action-btn" onClick={() => handleTileAction(activeTile)}>
                    Complete
                  </button>
                ) : (
                  <button className="action-btn" disabled>
                    Completed
                  </button>
                )}
              </>
            ) : (
              <div className="tooltip-hint">Hover to preview, click to lock and interact</div>
            )}
          </div>
        </div>
      )}

      {showOptions && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal options-modal">
            <div className="modal-header">
              <div className="modal-title">Board Options</div>
              <button className="close" onClick={() => setShowOptions(false)}>
                X
              </button>
            </div>
            <div className="list">
              <div className="list-row">
                <div>
                  <div>Reset Board</div>
                  <div className="muted">Generate a fresh Slayer board.</div>
                </div>
                <button
                  className="pill-btn"
                  onClick={() => {
                    setShowOptions(false);
                    setPendingBoardAction("generate");
                    setShowExemptModal(true);
                  }}
                >
                  Reset
                </button>
              </div>
              {!boardCaps && (
                <div className="list-row">
                  <div>
                    <div>Convert legacy board</div>
                    <div className="muted">Max combat/Slayer skills and refund keys spent on those tiles.</div>
                  </div>
                  <button
                    className="pill-btn"
                    onClick={() => {
                      setShowOptions(false);
                      convertLegacyBoard();
                    }}
                  >
                    Convert
                  </button>
                </div>
              )}
              <div className="list-row">
                <div>
                  <div>Center Board</div>
                  <div className="muted">Jump back to the starting tile.</div>
                </div>
                <button
                  className="pill-btn"
                  onClick={() => {
                    setShowOptions(false);
                    centerOnTile("start");
                  }}
                >
                  Center
                </button>
              </div>
              <div className="list-row">
                <div>
                  <div>Reveal Board</div>
                  <div className="muted">Peek at every tile without unlocking.</div>
                </div>
                <button
                  className="pill-btn"
                  onClick={() => {
                    setShowOptions(false);
                    revealEntireBoard();
                  }}
                >
                  Reveal
                </button>
              </div>
            </div>

            <div className="modal-subhead">Settings</div>
            <div className="list">
              <div className="list-row">
                <div>
                  <div>Version</div>
                  <div className="muted">v{APP_VERSION}</div>
                </div>
                <button
                  className="pill-btn"
                  onClick={() => {
                    setShowOptions(false);
                    setShowChangelog(true);
                  }}
                >
                  Changelog
                </button>
              </div>
              <div className="list-row">
                <div>
                  <div>Install app</div>
                  <div className="muted">Add SlayerScape as an app shortcut; click if the browser prompt is missing.</div>
                </div>
                <button className="pill-btn" onClick={handleInstallClick}>{installPrompt ? "Install" : "How to install"}</button>
              </div>
              <div className="list-row">
                <div>
                  <div>Export data</div>
                  <div className="muted">Download boards, runs, and diary progress.</div>
                </div>
                <button className="pill-btn" onClick={handleExportData} disabled={isExporting}>
                  {isExporting ? "Exporting..." : "Export"}
                </button>
              </div>
              <div className="list-row">
                <div>
                  <div>Import data</div>
                  <div className="muted">Replace local data with a saved export.</div>
                </div>
                <button className="pill-btn" onClick={handleImportClick} disabled={isImporting}>
                  {isImporting ? "Importing..." : "Import"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json"
                  style={{ display: "none" }}
                  onChange={handleImportFile}
                />
              </div>
              {installStatus && (
                <div className="list-row status-row">
                  <div className="status-text">{installStatus}</div>
                </div>
              )}
              {(dataMessage || dataError) && (
                <div className={`list-row status-row${dataError ? " error" : ""}`}>
                  <div className="status-text">{dataError ?? dataMessage}</div>
                </div>
              )}
            </div>

            <div className="modal-subhead">Credits</div>
            <div className="list">
              <div className="list-row">
                <div>
                  <div>RS3 SlayerScape</div>
                  <div className="muted">
                    Created by{" "}
                    <a href="https://www.youtube.com/@vathreon" target="_blank" rel="noreferrer">
                      Vathreon
                    </a>
                  </div>
                </div>
              </div>
              <div className="list-row">
                <div>
                  <div>Original idea</div>
                  <div className="muted">
                    Inspired by{" "}
                    <a href="https://www.youtube.com/@DanPlaysOSRS" target="_blank" rel="noreferrer">
                      DanPlaysOSRS
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-subhead">Resources</div>
            <div className="resource-links">
              <a className="resource-link" href="https://runescape.wiki/" target="_blank" rel="noreferrer">
                <img className="wiki-icon" src={assetPath("icons/wiki.jpg")} alt="RuneScape Wiki icon" />
                <span>RuneScape Wiki</span>
              </a>
              <a
                className="resource-link"
                href="https://github.com/BlindsidedGames/SlayerScapeRS3/issues"
                target="_blank"
                rel="noreferrer"
              >
                <img src={assetPath("icons/feedback-icon.png")} alt="Give feedback" />
                <span>Give feedback</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {showChangelog && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal changelog-modal">
            <div className="modal-header">
              <div className="modal-title">Changelog</div>
              <button className="close" onClick={() => setShowChangelog(false)}>
                X
              </button>
            </div>
            <p className="muted" style={{ marginBottom: 12 }}>
              Keep this updated when features change. Latest versions expand by default; click a version to collapse or expand it.
            </p>
            <div className="changelog-list">
              {changelogEntries.map((entry) => {
                const collapsed = collapsedVersions[entry.version] ?? false;
                return (
                  <div className="changelog-entry" key={entry.version}>
                    <button className="changelog-toggle" onClick={() => toggleChangelogVersion(entry.version)}>
                      <div className="changelog-meta">
                        <div className="changelog-version">v{entry.version}</div>
                        {entry.date ? <div className="changelog-date muted">{entry.date}</div> : null}
                      </div>
                      <span className="changelog-chevron">{collapsed ? "+" : "-"}</span>
                    </button>
                    {!collapsed && (
                      <ul className="changelog-notes">
                        {entry.notes.map((note, idx) => (
                          <li key={`${entry.version}-note-${idx}`}>{note}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showSkills && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal skills-modal">
            <div className="modal-header">
              <div className="modal-title">Skills & Caps</div>
              <button className="close" onClick={() => setShowSkills(false)}>
                X
              </button>
            </div>
            <div className="player-status muted">
              {playerLookupStatus === "loading"
                ? "Fetching stats..."
                : playerLookupStatus === "ready" && resolvedPlayer
                ? `Showing stats for ${resolvedPlayer}`
                : playerLookupStatus === "error"
                ? `Could not load stats${playerError ? `: ${playerError}` : ""}`
                : playerName.trim()
                ? `Ready to fetch stats for ${playerName}`
                : "Set a player name in the HUD to load stats"}
            </div>
            <div className="skills-grid">
              {orderedSkillsForDisplay.map((s) => {
                const icon = getSkillIcon(s.id);
                const cap = skillCaps[s.id] ?? (s.id === "constitution" ? 10 : 1);
                const atMax = cap >= s.maxLevel;
                const normalizedId = normalizeSkillId(s.id);
                const playerLevel = playerSkillLevels[normalizedId];
                return (
                  <div
                    key={s.id}
                    className={`skill-chip${s.elite ? " elite" : ""}${atMax ? " maxed" : ""}`}
                    title={`${s.name}: ${playerLevel ?? "-"} / ${cap}`}
                  >
                    <div className="skill-icon">
                      {icon ? <img src={icon} alt={s.name} /> : <span className="skill-letter">{s.name[0]}</span>}
                    </div>
                    <div className="skill-level">
                      <span className="level-value">{playerLevel ?? "-"}</span>
                      <span className="level-cap">/ {cap}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showAchievementDiaries && (
      <div className="modal-backdrop" role="presentation">
          <div className="modal quests-modal achievements-modal">
            <div className="modal-header">
              <div className="modal-title">Achievement Diaries</div>
              <button className="close" onClick={() => setShowAchievementDiaries(false)}>
                X
              </button>
            </div>
            <p className="muted" style={{ marginBottom: 12 }}>
              Manually track area achievements. Expand a tier to see requirements and tick off tasks as you finish them.
              <br />
              Progress: {achievementProgressSummary.completed}/{achievementProgressSummary.total} tasks
            </p>
            <div className="achievement-toolbar">
              <label className="achievement-toggle">
                <input type="checkbox" checked={showUndiscovered} onChange={(e) => setShowUndiscovered(e.target.checked)} />
                <span>Show undiscovered diaries</span>
              </label>
            </div>
            <div className="quest-sections">
              {achievementsByArea.map(({ area, sets }) => {
                const filteredSets = showUndiscovered
                  ? sets
                  : sets.filter((entry) => {
                      const progress = getAchievementProgress(entry.id, entry.tasks.length);
                      const isDiscovered = discoveredAchievementIds.has(entry.id) || progress.tasks.some(Boolean);
                      return isDiscovered;
                    });
                if (!filteredSets.length) return null;
                const totalTasks = filteredSets.reduce((sum, s) => sum + s.tasks.length, 0);
                return (
                  <div key={area} className="quest-section">
                    <div className="section-head">
                      <span>{area}</span>
                      <span className="muted">{totalTasks} tasks</span>
                    </div>
                    <div className="quest-list">
                      {filteredSets.map((entry) => {
                        const progress = getAchievementProgress(entry.id, entry.tasks.length);
                        const checkedCount = progress.tasks.filter(Boolean).length;
                        const isDiscovered = discoveredAchievementIds.has(entry.id) || progress.tasks.some(Boolean);
                        const allDone = entry.tasks.length > 0 && checkedCount === entry.tasks.length;
                        const isExpanded = expandedAchievementIds.includes(entry.id);
                        const requirement = entry.requirements;
                        return (
                          <div key={entry.id} className={`quest-card achievement-card${allDone ? " completed" : ""}`}>
                            <div className="quest-info">
                              <div className="quest-name">{`${formatTitleCase(entry.tier)} ${entry.area}`}</div>
                              <div className="quest-meta muted">
                                {checkedCount}/{entry.tasks.length} tasks
                                {entry.meta?.points ? ` · ${entry.meta.points} pts` : ""}
                                {entry.meta?.members === false ? " · F2P" : ""}
                              </div>
                              {entry.meta?.description ? <div className="muted">{entry.meta.description}</div> : null}
                            </div>
                            <div className="quest-actions">
                              <button className="pill-btn small" onClick={() => toggleAchievementExpansion(entry.id)} aria-expanded={isExpanded}>
                                {isExpanded ? "Hide" : "View"}
                              </button>
                              <button
                                className="pill-btn small"
                                onClick={() => setAllAchievementTasks(entry.id, entry.tasks.length, !allDone)}
                                disabled={!entry.tasks.length}
                              >
                                {allDone ? "Reset" : "Mark all"}
                              </button>
                            </div>
                            {isExpanded && (
                              <div className="achievement-body">
                                {requirement ? (
                                  <div className="achievement-reqs">
                                    <div>
                                      <strong>Skills</strong>
                                      <div className="req-chips">
                                        {requirement.skills.length
                                          ? requirement.skills.map((s, idx) => {
                                              const met = meetsSkillRequirement(s.skill, s.level);
                                              return (
                                                <span key={`${entry.id}-skill-${idx}`} className={`req-chip${met ? " met" : ""}`}>
                                                  <span className="req-name">{s.skill}</span>
                                                  <span className="req-level">
                                                    {s.level}
                                                    {s.boostable ? "*" : ""}
                                                  </span>
                                                </span>
                                              );
                                            })
                                          : "None"}
                                      </div>
                                    </div>
                                    <div>
                                      <strong>Quests</strong>
                                      <div className="req-chips">
                                        {requirement.quests.length
                                          ? requirement.quests.map((q, idx) => {
                                              const met = meetsQuestRequirement(q);
                                              return (
                                                <span key={`${entry.id}-quest-${idx}`} className={`req-chip${met ? " met" : ""}`}>
                                                  <span className="req-name">{q}</span>
                                                </span>
                                              );
                                            })
                                          : "None"}
                                      </div>
                                    </div>
                                    <div>
                                      <strong>Items</strong>
                                      <div className="req-chips muted">
                                        {requirement.items.length ? requirement.items.join(", ") : "None"}
                                      </div>
                                    </div>
                                    {requirement.notes ? (
                                      <div>
                                        <strong>Notes</strong>
                                        <div className="muted">{requirement.notes}</div>
                                      </div>
                                    ) : null}
                                  </div>
                                ) : null}
                                <div className="task-grid">
                                  {entry.tasks.map((task, idx) => {
                                    const taskId = `${entry.id}-${idx}`;
                                    return (
                                      <label key={taskId} className="task-line">
                                        <input
                                          type="checkbox"
                                          checked={progress.tasks[idx]}
                                          onChange={() => toggleAchievementTask(entry.id, idx, entry.tasks.length)}
                                        />
                                        <span className="task-text">{task}</span>
                                      </label>
                                    );
                                  })}
                                  {!entry.tasks.length && <div className="empty-state">No task list for this tier yet.</div>}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showQuests && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal quests-modal">
            <div className="modal-header">
              <div className="modal-title">Quests</div>
              <button className="close" onClick={() => setShowQuests(false)}>
                X
              </button>
            </div>
            <p className="muted" style={{ marginBottom: 12 }}>
              Shows quests you can act on right now. Source: {questStatus === "ready" ? "RS Wiki quest strategy (ordered)" : "Fallback data"}.
              {playerName.trim() ? ` Player: ${resolvedPlayer ?? playerName}.` : ""}
              {playerQuestLookupStatus === "loading"
                ? " Fetching quest status..."
                : playerQuestLookupStatus === "error"
                ? ` Quest status unavailable${playerQuestError ? `: ${playerQuestError}` : ""}.`
                : ""}
            </p>
            <div className="quest-sections">
              <div className="quest-section">
                <div className="section-head">
                  <span>Available now</span>
                  <span className="muted">{availableQuests.length} ready</span>
                </div>
                <div className="quest-list">
                  {availableQuests.length ? (
                    availableQuests.map(({ quest }) => {
                      const guideUrl = quest.quickGuide ?? quickGuideUrl(quest.name);
                      return (
                        <div key={quest.id} className="quest-card">
                          <div className="quest-info">
                            <div className="quest-name">{quest.name}</div>
                            <div className="quest-meta muted">#{quest.order + 1}</div>
                            {questQuestStatus.get(quest.id) ? (
                              <div className="quest-status-tag">{formatQuestStatus(questQuestStatus.get(quest.id))}</div>
                            ) : null}
                          </div>
                          <div className="quest-actions">
                            <a className="pill-btn small" href={guideUrl} target="_blank" rel="noreferrer">
                              <img className="pill-icon" src={wikiIcon} alt="" aria-hidden="true" />
                              Quick guide
                            </a>
                            <button className="pill-btn" onClick={() => completeQuestTile(quest.id)}>
                              Complete
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-state">No quests unlocked right now.</div>
                  )}
                </div>
              </div>

              <div className="quest-section">
                <div className="section-head">
                  <span>Unlockable</span>
                  <span className="muted">Visible locked quests</span>
                </div>
                <div className="quest-list">
                  {unlockableQuests.length ? (
                    unlockableQuests.map(({ quest, tile }) => {
                      const cost = tile?.cost ?? 1;
                      const canUnlock = tile?.state === "locked" && keys >= cost;
                      const questStatusLabel = questQuestStatus.get(quest.id);
                      const guideUrl = quest.quickGuide ?? quickGuideUrl(quest.name);
                      return (
                        <div key={quest.id} className="quest-card">
                          <div className="quest-info">
                            <div className="quest-name">{quest.name}</div>
                            <div className="quest-meta muted">#{quest.order + 1} - Cost {cost} key{cost > 1 ? "s" : ""}</div>
                            {questStatusLabel ? <div className="quest-status-tag">{formatQuestStatus(questStatusLabel)}</div> : null}
                          </div>
                          <div className="quest-actions">
                            <a className="pill-btn small" href={guideUrl} target="_blank" rel="noreferrer">
                              <img className="pill-icon" src={wikiIcon} alt="" aria-hidden="true" />
                              Quick guide
                            </a>
                            <button className="pill-btn" disabled={!canUnlock} onClick={() => unlockQuestTile(quest.id)}>
                              Unlock
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-state">No visible locked quests yet.</div>
                  )}
                </div>
              </div>

              <div className="quest-section">
                <div className="section-head">
                  <span>Completed</span>
                  <span className="muted">{completedQuests.length}</span>
                </div>
                <div className="quest-list completed">
                  {completedQuests.length ? (
                    completedQuests.map(({ quest }) => {
                      const guideUrl = quest.quickGuide ?? quickGuideUrl(quest.name);
                      return (
                        <div key={quest.id} className="quest-card completed">
                          <div className="quest-info">
                            <div className="quest-name">{quest.name}</div>
                            <div className="quest-meta muted">#{quest.order + 1}</div>
                            {questQuestStatus.get(quest.id) ? (
                              <div className="quest-status-tag">{formatQuestStatus(questQuestStatus.get(quest.id))}</div>
                            ) : null}
                          </div>
                          <div className="quest-actions">
                            <a className="pill-btn small" href={guideUrl} target="_blank" rel="noreferrer">
                              <img className="pill-icon" src={wikiIcon} alt="" aria-hidden="true" />
                              Quick guide
                            </a>
                            <span className="quest-status">Done</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-state">No quests completed yet.</div>
                  )}
                </div>
              </div>
            </div>
        </div>
      </div>
      )}

      {showExemptModal && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal options-modal">
            <div className="modal-header">
              <div className="modal-title">Skill exemptions</div>
              <button
                className="close"
                onClick={() => {
                  setShowExemptModal(false);
                  setPendingBoardAction("none");
                }}
              >
                X
              </button>
            </div>
            <p className="muted" style={{ marginBottom: 12 }}>
              Choose skills to start at their max level. These skills won't roll tiles on the new board.
            </p>
            <div className="list">
              {exemptOptions.map((skill) => {
                const checked = exemptSkillIds.includes(skill.id);
                return (
                  <label key={skill.id} className="list-row">
                    <div>
                      <div>{skill.name}</div>
                      <div className="muted">Max {skill.maxLevel}</div>
                    </div>
                    <input type="checkbox" checked={checked} onChange={() => toggleExemptSkill(skill.id)} />
                  </label>
                );
              })}
            </div>
            <div className="modal-actions" style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
              <button className="pill-btn" onClick={handleUseDefaultExempt}>
                Use recommended
              </button>
              <button className="pill-btn" onClick={handleConfirmExempt}>
                Generate board
              </button>
            </div>
          </div>
        </div>
      )}

      {showRules && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal rules-modal">
            <div className="modal-header">
              <div className="modal-title">Relaxed Slayer Mode Rules</div>
              <button className="close" onClick={handleCloseRules}>
                X
              </button>
            </div>
            <p className="muted" style={{ marginBottom: 10 }}>
              Pulled from RELAXED_MODE.md. Relaxed mode keeps RS3 normalcy while tying progression to Slayer tasks and board tiles.
            </p>
            <div className="rule-badges">
              <span className="rule-badge">Trading & GE allowed</span>
              <span className="rule-badge">Ground items allowed on-task</span>
              <span className="rule-badge">Keys come from Slayer tasks</span>
            </div>
            <div className="rule-grid">
              {relaxedRulesSections.map((section) => (
                <div key={section.title} className="rule-card">
                  <div className="rule-title">{section.title}</div>
                  <ul>
                    {section.bullets.map((item, idx) => (
                      <li key={`${section.title}-${idx}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="rules-footer">
              <button className="pill-btn" onClick={handleCloseRules}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const tileClass = (state: TileState) => {
  if (state === "claimed") return "tile claimed";
  if (state === "unlocked") return "tile unlocked";
  if (state === "hidden") return "tile hidden";
  return "tile locked";
};

export default App;

