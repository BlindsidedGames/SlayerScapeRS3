import { RuleConfig } from "./models";

export const relaxedRules: RuleConfig = {
  id: "relaxed-mode",
  name: "Relaxed Slayer Mode",
  skillBandSize: 10,
  allowTrading: true,
  allowGE: true,
  groundItemsOnTask: "allowed",
  groundItemsOffTask: "allowed",
  limitCombatToSlayerTasks: false,
  offTaskKillsGenerateKeys: false,
  deathPenalty: "none"
};
