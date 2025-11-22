import { Board, Tile } from "../models";
import { v4 as uuid } from "uuid";

const tile = (data: Partial<Tile>): Tile => {
  if (!data.payload) throw new Error("payload required");
  return {
    id: data.id ?? uuid(),
    type: data.type ?? "skill_band",
    payload: data.payload,
    coords: data.coords ?? { x: 0, y: 0 },
    cost: data.cost ?? 1,
    state: data.state ?? "hidden"
  };
};

export const sampleBoard: Board = {
  id: "sample-board",
  name: "Sample Layout",
  adjacency: "4-way",
  tiles: [
    tile({
      payload: { label: "Attack 1-10", skill: "attack", band: [1, 10] },
      coords: { x: 0, y: 0 },
      state: "claimed"
    }),
    tile({
      payload: { label: "Slayer 1-10", skill: "slayer", band: [1, 10] },
      coords: { x: 1, y: 0 },
      state: "unlocked"
    }),
    tile({
      payload: { label: "Quest: Plague's End", questId: "plagues_end" },
      coords: { x: 1, y: 1 },
      type: "quest",
      cost: 2,
      state: "visible"
    }),
    tile({
      payload: { label: "Lumbridge Easy", achievementId: "lumbridge-easy" },
      coords: { x: 2, y: 1 },
      type: "achievement",
      cost: 2,
      state: "hidden"
    }),
    tile({
      payload: { label: "Utility: Bank chest unlock" },
      coords: { x: 0, y: 1 },
      type: "utility",
      cost: 1,
      state: "visible"
    })
  ]
};
