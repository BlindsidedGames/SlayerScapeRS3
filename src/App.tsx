import type React from "react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { relaxedRules } from "./data/config";
import { areaAchievements, type AchievementTier } from "./data/static/achievements";
import { makeBands, skills as staticSkills } from "./data/static/skills";
import { sampleQuests } from "./data/static/quests";
import type { RunState, SlayerMaster, Tile, TileState, TileType } from "./data/models";
import { db, seedDefaults } from "./store/db";

type Quest = { id: string; name: string; order: number };
type SkillDef = { id: string; name: string; maxLevel: number; elite?: boolean };
type Achievement = { id: string; label: string; tier: AchievementTier };

const QUEST_STRATEGY_URL =
  "https://runescape.wiki/api.php?action=parse&page=Quests/Strategy&prop=text&formatversion=2&format=json&origin=*";

const slugify = (value: string, separator = "-") =>
  value
    .trim()
    .toLowerCase()
    .replace(/['\"]/g, "")
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp(`${separator}+`, "g"), separator)
    .replace(new RegExp(`^${separator}|${separator}$`, "g"), "");

const normalizeSkillId = (skillId: string) => slugify(skillId, "_");

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
  quest: "/icons/quest.png",
  achievement: "/icons/achievement.png",
  utility: "/icons/slayer-key.png"
};

const coinIconBrackets = [
  { threshold: 10000, src: "/icons/coins/coins-10000.png" },
  { threshold: 1000, src: "/icons/coins/coins-1000.png" },
  { threshold: 250, src: "/icons/coins/coins-250.png" },
  { threshold: 100, src: "/icons/coins/coins-100.png" },
  { threshold: 25, src: "/icons/coins/coins-25.png" },
  { threshold: 5, src: "/icons/coins/coins-5.png" },
  { threshold: 4, src: "/icons/coins/coins-4.png" },
  { threshold: 3, src: "/icons/coins/coins-3.png" },
  { threshold: 2, src: "/icons/coins/coins-2.png" },
  { threshold: 1, src: "/icons/coins/coins-1.png" }
] as const;

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

const questFallback: Quest[] = sampleQuests.map((q, idx) => ({
  id: q.id,
  name: q.name,
  order: idx
}));

const parseQuestStrategyHtml = (html?: string): Quest[] => {
  if (!html) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const rows = Array.from(doc.querySelectorAll<HTMLTableRowElement>("table.oqg-table tr[data-rowid]"));
  return rows
    .map((row, idx) => {
      const title = row.getAttribute("data-rowid") || row.querySelector("a[title]")?.getAttribute("title") || `Quest ${idx + 1}`;
      return { id: `quest-${slugify(title)}`, name: title, order: idx };
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
  const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW();
  const [skills, setSkills] = useState<SkillDef[]>(staticSkills);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [questStatus, setQuestStatus] = useState<"idle" | "loading" | "ready" | "error">("loading");
  const [skillStatus, setSkillStatus] = useState<"idle" | "loading" | "ready" | "error">("loading");
  const [board, setBoard] = useState<Tile[]>([]);
  const [boardSize, setBoardSize] = useState(9);
  const [gp, setGp] = useState(0);
  const [keys, setKeys] = useState(0);
  const [showSkills, setShowSkills] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const [showMasters, setShowMasters] = useState(true);
  const [masters, setMasters] = useState<SlayerMaster[]>(slayerMasterSeed);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [selectedTile, setSelectedTile] = useState<string | null>(null);
  const [hoveredTile, setHoveredTile] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [boardReady, setBoardReady] = useState(false);
  const [restoredBoard, setRestoredBoard] = useState(false);
  const [activeRun, setActiveRun] = useState<RunState | null>(null);
  const tileRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const loadState = async () => {
      try {
        await seedDefaults();
        const run = await db.runs.get("demo-run");
        const savedBoard = run ? await db.boards.get(run.boardId) : null;
        if (run) {
          setActiveRun(run);
          setGp(run.gp ?? 0);
          setKeys(run.keys ?? 0);
          if (run.masters?.length) setMasters(run.masters);
          if (run.offset) setOffset(clampOffset(run.offset));
          if (run.boardSize) setBoardSize(run.boardSize);
        }
        if (savedBoard?.tiles?.length) {
          setBoard(savedBoard.tiles);
          setBoardSize(boardDimensionFromTiles(savedBoard.tiles));
          setRestoredBoard(true);
        }
      } catch (err) {
        console.error("Failed to load saved state", err);
      } finally {
        setBoardReady(true);
      }
    };
    loadState();
  }, []);

  useEffect(() => {
    const fetchQuests = async () => {
      try {
        setQuestStatus("loading");
        const res = await fetch(QUEST_STRATEGY_URL);
        const data = await res.json();
        const html = data?.parse?.text as string | undefined;
        const list = parseQuestStrategyHtml(html);
        if (list?.length) {
          setQuests(list);
          setQuestStatus("ready");
        } else {
          setQuests(questFallback);
          setQuestStatus("error");
        }
      } catch (err) {
        console.error("Quest fetch failed", err);
        setQuests(questFallback);
        setQuestStatus("error");
      }
    };
    fetchQuests();
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
      entries[normalized] = `/icons/skills/${normalized}.png`;
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
      entries[m.avatar] = `/icons/slayer-masters/${m.avatar}.png`;
    });
    return entries;
  }, [masters]);

  const bands = useMemo(
    () =>
      skills.map((s) => ({
        ...s,
        bands: makeBands(s.maxLevel, relaxedRules.skillBandSize)
      })),
    [skills]
  );

  const achievementsList = useMemo<Achievement[]>(() => areaAchievements.map((a) => ({ id: a.id, label: a.label, tier: a.tier })), []);

  const orderedQuests = useMemo(() => (quests.length ? quests : questFallback), [quests]);

  const tileLookup = useMemo(() => {
    const map = new Map<string, Tile>();
    board.forEach((t) => map.set(`${t.coords.x},${t.coords.y}`, t));
    return map;
  }, [board]);

  const boardForRender = useMemo(
    () => [...board].sort((a, b) => a.coords.y - b.coords.y || a.coords.x - b.coords.x),
    [board]
  );

  const generateBoard = useCallback(() => {
    const questCount = Math.max(orderedQuests.length, 1);
    const skillTiles = bands.flatMap((skill) =>
      skill.bands.map((band) => ({
        priority: band[0],
        tile: {
          id: `skill-${skill.id}-${band[0]}-${band[1]}`,
          type: "skill_band" as TileType,
          payload: { label: `${skill.name} ${band[0]}-${band[1]}`, skill: skill.id, band },
          coords: { x: 0, y: 0 },
          cost: 1,
          state: "hidden" as TileState
        }
      }))
    );

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
    setBoardSize(size);
    setSelectedTile(null);
    setHoveredTile(null);
    setOffset({ x: 0, y: 0 });
    setRestoredBoard(false);
    setGp(0);
    setKeys(0);
    setMasters(allocateKeyPools(requiredKeys));
  }, [achievementsList, bands, orderedQuests]);

  useEffect(() => {
    if (!boardReady || restoredBoard) return;
    if (questStatus === "loading" || questStatus === "idle") return;
    if (skillStatus === "loading" || skillStatus === "idle") return;
    if (board.length > 0) return;
    generateBoard();
  }, [board.length, boardReady, generateBoard, questStatus, restoredBoard, skillStatus]);

  const activeTileId = selectedTile ?? hoveredTile;
  const activeTile = useMemo(() => board.find((t) => t.id === activeTileId) ?? null, [board, activeTileId]);
  const selectionLocked = selectedTile === activeTile?.id;
  const activeSkillIcon = getSkillIcon(activeTile?.payload.skill);

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
    dragRef.current = { startX: e.clientX, startY: e.clientY, originX: offset.x, originY: offset.y };
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
    setOffset({ x: dragRef.current.originX + dx, y: dragRef.current.originY + dy });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    dragRef.current = null;
  };

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
    async (nextBoard = board, nextGp = gp, nextKeys = keys, nextMasters = masters, nextOffset = offset) => {
      try {
        const now = new Date().toISOString();
        const clampedOffset = clampOffset(nextOffset);
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
            tiles: nextBoard
          });
          await db.runs.put(updatedRun);
        });
        setActiveRun(updatedRun);
      } catch (err) {
        console.error("Failed to persist state", err);
      }
    },
    [activeRun, board, boardSize, gp, keys, masters, offset]
  );

  useEffect(() => {
    if (!boardReady) return;
    persistState(board, gp, keys, masters, offset);
  }, [board, gp, keys, masters, offset, boardReady, persistState]);

  return (
    <div className="stage">
      <div className="board-layer">
        <div
          className="board-full"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDragStart={(e) => e.preventDefault()}
          style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
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
                          🔒
                        </div>
                      )}
                      {tile.state === "claimed" && (
                        <div className="tile-overlay tick" aria-hidden="true">
                          ✓
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
        <div className="hud">
          <div className="hud-left">
            <div className="stat">
              <img className="stat-icon" src={getCoinIcon(gp)} alt="Gold pieces" />
              <span className="value">{numberFormatter.format(gp)}</span>
              <span className="stat-label">gp</span>
            </div>
            <div className="stat">
              <img className="key-icon" src="/icons/slayer-key.png" alt="Keys" />
              <span className="value">{keys}</span>
            </div>
            <button className="pill-btn" onClick={() => setShowMasters((v) => !v)}>
              {showMasters ? "Hide" : "Show"} Slayer Masters
            </button>
            <button className="pill-btn" onClick={generateBoard}>
              Reset Board
            </button>
            <button className="pill-btn" onClick={() => setOffset({ x: 0, y: 0 })}>
              Center Board
            </button>
            <button className="pill-btn" onClick={revealEntireBoard}>
              Reveal Board
            </button>
          </div>
          <div className="hud-right">
            <button className="pill-btn" onClick={() => setShowSkills(true)}>
              <img className="pill-icon" src="/icons/skills-icon.png" alt="" aria-hidden="true" />
              Unlocked Skills
            </button>
            <button className="pill-btn" onClick={() => setShowQuests(true)}>
              <img className="pill-icon" src="/icons/quest-icon.png" alt="" aria-hidden="true" />
              Unlocked Quests
            </button>
            {needRefresh && (
              <button className="pill-btn" onClick={() => updateServiceWorker(true)}>
                Update App
              </button>
            )}
            {offlineReady && <span className="stat">Offline ready</span>}
          </div>
        </div>

        {showMasters && (
          <aside className="panel masters">
            <div className="panel-title">
              <h3>Slayer Masters</h3>
              <span className="muted">1 key per tile</span>
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
              activeTile.state === "locked" ? (
                <button className="action-btn" disabled={keys < activeTile.cost} onClick={() => handleTileAction(activeTile)}>
                  <img src="/icons/slayer-key.png" alt="Key" /> Unlock ({activeTile.cost})
                </button>
              ) : activeTile.state === "unlocked" ? (
                <button className="action-btn" onClick={() => handleTileAction(activeTile)}>
                  Complete
                </button>
              ) : (
                <button className="action-btn" disabled>
                  Completed
                </button>
              )
            ) : (
              <div className="tooltip-hint">Hover to preview, click to lock and interact</div>
            )}
          </div>
        </div>
      )}

      {showSkills && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Skills & Caps</div>
              <button className="close" onClick={() => setShowSkills(false)}>
                X
              </button>
            </div>
            <p className="muted" style={{ marginBottom: 8 }}>
              Source: {skillStatus === "ready" ? "RS Wiki cargo (live)" : "Fallback data"} - Band size {relaxedRules.skillBandSize}
            </p>
            <div className="list" style={{ maxHeight: "60vh", overflow: "auto" }}>
              {bands.map((s) => {
                const icon = getSkillIcon(s.id);
                return (
                  <div key={s.id} className="list-row">
                    <span>
                      {icon ? <img className="tiny-icon" src={icon} alt={s.name} /> : null}
                      <span>{s.name}</span>
                    </span>
                    <span className="muted">
                      cap {s.maxLevel} - {s.bands.length} bands
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showQuests && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Quests</div>
              <button className="close" onClick={() => setShowQuests(false)}>
                X
              </button>
            </div>
            <p className="muted" style={{ marginBottom: 8 }}>
              Source: {questStatus === "ready" ? "RS Wiki quest strategy (ordered)" : "Fallback data"} - {orderedQuests.length} entries
            </p>
            <div className="list" style={{ maxHeight: "60vh", overflow: "auto" }}>
              {orderedQuests.map((q) => (
                <div key={q.id} className="list-row">
                  <span className="muted">#{q.order + 1}</span> {q.name}
                </div>
              ))}
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
