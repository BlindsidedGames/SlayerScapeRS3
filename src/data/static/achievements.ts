import { areaAchievementTaskSets } from "./areaAchievementsExtended";

export type AchievementTier = "beginner" | "easy" | "medium" | "hard" | "elite";

export interface AreaAchievement {
  id: string;
  area: string;
  tier: AchievementTier;
  label: string;
  tasks?: string[];
  total?: number;
}

const titleCase = (value: string) => value.replace(/\b\w/g, (c) => c.toUpperCase());

export const areaAchievementTasks = areaAchievementTaskSets;
export const areaAchievementTaskMap = new Map(areaAchievementTaskSets.map((entry) => [entry.id, entry]));

export const areaAchievements: AreaAchievement[] = areaAchievementTaskSets.map((entry) => {
  const tierTitle = titleCase(entry.tier);
  const areaTitle = titleCase(entry.area);
  return {
    ...entry,
    label: `${tierTitle} ${areaTitle}`
  };
});
