export type AchievementTier = "beginner" | "easy" | "medium" | "hard" | "elite";

export interface AreaAchievement {
  id: string;
  area: string;
  tier: AchievementTier;
  label: string;
}

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const titleCase = (value: string) => value.replace(/\b\w/g, (c) => c.toUpperCase());

const achievementTuples: Array<{ tier: AchievementTier; area: string }> = [
  { tier: "beginner", area: "Lumbridge" },
  { tier: "easy", area: "Ardougne" },
  { tier: "easy", area: "Daemonheim" },
  { tier: "easy", area: "Desert" },
  { tier: "easy", area: "Falador" },
  { tier: "easy", area: "Fremennik" },
  { tier: "easy", area: "Karamja" },
  { tier: "easy", area: "Lumbridge" },
  { tier: "easy", area: "Morytania" },
  { tier: "easy", area: "Seers' Village" },
  { tier: "easy", area: "Tirannwn" },
  { tier: "easy", area: "Underworld" },
  { tier: "easy", area: "Varrock" },
  { tier: "easy", area: "Wilderness" },
  { tier: "medium", area: "Ardougne" },
  { tier: "medium", area: "Daemonheim" },
  { tier: "medium", area: "Desert" },
  { tier: "medium", area: "Falador" },
  { tier: "medium", area: "Fremennik" },
  { tier: "medium", area: "Karamja" },
  { tier: "medium", area: "Lumbridge" },
  { tier: "medium", area: "Morytania" },
  { tier: "medium", area: "Seers' Village" },
  { tier: "medium", area: "Tirannwn" },
  { tier: "medium", area: "Underworld" },
  { tier: "medium", area: "Varrock" },
  { tier: "medium", area: "Wilderness" },
  { tier: "hard", area: "Ardougne" },
  { tier: "hard", area: "Daemonheim" },
  { tier: "hard", area: "Desert" },
  { tier: "hard", area: "Falador" },
  { tier: "hard", area: "Fremennik" },
  { tier: "hard", area: "Karamja" },
  { tier: "hard", area: "Lumbridge" },
  { tier: "hard", area: "Morytania" },
  { tier: "hard", area: "Seers' Village" },
  { tier: "hard", area: "Tirannwn" },
  { tier: "hard", area: "Underworld" },
  { tier: "hard", area: "Varrock" },
  { tier: "hard", area: "Wilderness" },
  { tier: "elite", area: "Ardougne" },
  { tier: "elite", area: "Daemonheim" },
  { tier: "elite", area: "Desert" },
  { tier: "elite", area: "Falador" },
  { tier: "elite", area: "Fremennik" },
  { tier: "elite", area: "Karamja" },
  { tier: "elite", area: "Morytania" },
  { tier: "elite", area: "Seers' Village" },
  { tier: "elite", area: "Tirannwn" },
  { tier: "elite", area: "Underworld" },
  { tier: "elite", area: "Varrock" },
  { tier: "elite", area: "Wilderness" }
];

export const areaAchievements: AreaAchievement[] = achievementTuples.map((entry) => {
  const tierTitle = titleCase(entry.tier);
  const areaTitle = titleCase(entry.area);
  const id = `${entry.tier}-${slugify(entry.area)}`;
  return {
    ...entry,
    id,
    label: `${tierTitle} ${areaTitle}`
  };
});
