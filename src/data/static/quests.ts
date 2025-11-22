export interface QuestDefinition {
  id: string;
  name: string;
  difficulty: "novice" | "intermediate" | "experienced" | "master" | "grandmaster";
  members: boolean;
}

export const sampleQuests: QuestDefinition[] = [
  { id: "quest-a0", name: "Plague's End", difficulty: "grandmaster", members: true },
  { id: "quest-a1", name: "While Guthix Sleeps", difficulty: "master", members: true },
  { id: "quest-a2", name: "The World Wakes", difficulty: "master", members: true },
  { id: "quest-a3", name: "Ritual of the Mahjarrat", difficulty: "master", members: true },
  { id: "quest-a4", name: "A Soul's Bane", difficulty: "novice", members: true }
];
