# Relaxed Slayer Mode — Rules & Requirements

## 1. Overview

Relaxed Slayer Mode is a progression ruleset where:

* **Slayer tasks drive progression** via **Slayer Keys**.
* **Tiles** on a board represent unlocks (skill ranges, quests, achievements, etc.).
* You can **trade, use the GE, and play normally**, as long as you respect tile-based progression.
* **Ground items are always allowed while you are on a Slayer task.**

This mode is meant to feel like normal RS3 with an extra meta-game layered on top, rather than a hardcore challenge mode.

---

## 2. Core Concepts

### 2.1 Tiles and the Board

* The run is played on a 2D grid of **tiles**.

* Each tile represents a single unlockable objective, such as:

  * Skill band (e.g. “Attack 1–10”, “Attack 11–20”)
  * Quest (e.g. “Plague’s End”)
  * Achievement set (e.g. “Lumbridge & Draynor — Easy Tasks”)
  * Allowance / utility / meta (optional; see other modes)

* Each tile has a **state**:

  * `Hidden` — not yet visible
  * `Visible` — revealed but locked
  * `Unlocked` — can legally be worked on
  * `Claimed` — objective completed in-game

* **Fog of war**:

  * Only tiles adjacent to your **claimed** tiles are visible.
  * You may only unlock **visible** tiles.

### 2.2 Slayer Keys

* **Slayer Keys** are a meta-currency used to unlock tiles.
* Keys are obtained by completing Slayer tasks.
* Each Slayer master has its own **key pool** (per run) and a diminishing chance to drop keys as the pool empties (exact formula is an implementation detail).

General idea:

> More tasks completed → more chances at keys → more tiles unlocked → more progression.

---

## 3. Gameplay Rules (Relaxed Mode)

### 3.1 Account and Trading

* Can be played on **any account type** (main, Ironman, etc.).
* **Trading is allowed**:

  * You may freely trade with other players.
  * You may freely use the **Grand Exchange** (buy and sell).
* No extra restrictions on services, boosts, or help from friends beyond what the tiles allow (e.g. if a quest is locked, you still shouldn’t complete it even if someone drags you through it).

---

### 3.2 Skills and Skill Bands

* Each skill is divided into **bands** (e.g. 10-level chunks: 1–10, 11–20, etc.).
* Each **Skill Band tile** unlocks training in that skill up to that band’s maximum level.

**Rules:**

1. You may only **intentionally train a non-combat skill** up to the highest unlocked band for that skill, but supply-focused skills (e.g., Herblore, Cooking, Crafting) may exceed their band as long as you only perform recipes that require levels you have already unlocked.

   * Example: If you have unlocked "Firemaking 1-10" but not "Firemaking 11-20", you should not train Firemaking past level 10.
   * Supply-focused skills follow this recipe cap: you can brew potions or cook food even if the XP pushes you past your unlocked band, but you may only create items that require levels within that band.
   * Combat skills may be trained past their current band while you are actively on a Slayer task, but you still may not equip gear that requires higher levels than you have unlocked.

2. **Quest XP and lamps** that overshoot into a higher band are allowed, but:

   * You still treat that higher band as **locked for actions** (e.g. you shouldn’t use content requiring the higher level until you unlock that band’s tile).
   * You may choose to auto-claim or mark that band as “overcapped via XP” in your tool for bookkeeping.

This keeps progression tied to Slayer Keys and tile unlocks without being overly punishing.

---

### 3.3 Quests and Achievements

* **Quest tiles**: each quest (or quest group) has its own tile.
* **Achievement tiles**: each area tier or selected set (e.g. “Morytania — Hard Tasks”) has its own tile.

**Rules:**

1. You may only **start or complete** a quest if its tile is **unlocked**.
2. You may only **intentionally complete** an achievement set / diary tier if its tile is **unlocked**.
3. Accidentally completing part of an achievement set before unlocking the tile is allowed, but:

   * The tile should still be unlocked and claimed when you officially recognize that progress.

---

### 3.4 Slayer and Combat

Slayer remains the engine of progression, so most combat should funnel through your current assignment. Off-task fighting only exists when a quest or similar requirement forces you away from that task.

**Rules:**

1. **Slayer tasks are the only source of Slayer Keys.**

   * Completing a Slayer task rolls for one or more keys from that master's key pool.

2. **On-task combat**:

   * Strongly encouraged; it's how you progress, earn keys, and justify looting while grinding.

3. **Off-task combat**:

   * Discouraged outside of quests or other required objectives. Handle those exceptions quickly and treat them as detours, not parallel training paths.
   * Off-task kills still **do not generate Slayer Keys**, and you should return to a Slayer assignment once the requirement is complete.

4. Slayer master choice:

   * You may use any Slayer master you normally qualify for in RS3.
   * Your app may track key pools per master, but the player in-game follows standard Slayer rules.

The net effect: Stay on Slayer task whenever possible; quest-related detours are permitted, but **only Slayer tasks actually move your board forward**.
---

### 3.5 Ground Items

This includes drops, spawns, and items on the floor.

**Global rule for this mode:**

* **While you have an active Slayer task**:

  * You may freely pick up **any ground items** in the task area.
  * This includes:

    * Loot from monsters on task
    * Random spawns in the task area
    * Clue scrolls, rare drops, etc.

*Expect to be on task when collecting loot.* If a quest temporarily pulls you away, only grab quest-critical items and resume your assignment before farming drops.

---

### 3.6 Shops, Currency, and Economy

Relaxed mode ignores the Allowance/shops restrictions from the harder mode.

* You may use **any shops** in the game normally.
* You may buy and sell freely at the **Grand Exchange**.
* No special GP tracking or shop caps; the economy is standard RS3.

The only constraint is still: **don’t use shop purchases to bypass locked tiles** (e.g. don’t use items to complete a locked quest).

---

### 3.7 Using Tiles and Keys

**Unlocking tiles**

* Each tile has a **key cost**, typically:

  * Skill band: 1 key
  * Individual quest: 1–2 keys
  * Big, late-game quest or achievement set: 2–3 keys

* You may only unlock tiles that:

  * Are **visible** (fog of war rule), and
  * You can afford with your available key count.

**Claiming tiles**

* A tile is **claimed** when the in-game requirement is met:

  * Skill band: you reach at least the band’s max level (or the required threshold).
  * Quest: the quest is completed in your quest log.
  * Achievement: all tasks for that set are completed.

Once claimed, adjacent tiles are revealed.

---

### 3.8 Death and Failure

Relaxed mode is not meant to punish you heavily for dying.

* Dying in-game has **no additional SlayerScape penalties** beyond normal RS3 death mechanics.
* The run never “fails”; you can always keep playing, even if progression is slow.

If you want a bit more spice later, you can optionally add:

* “On death, lose 1 key” or
* “On death, temporarily lock 1 random unlocked tile”

— but that’s outside the base relaxed rules.

---

## 4. Implementation Requirements (for the companion app)

This section is for you as the developer.

To support **Relaxed Slayer Mode**, your app needs to provide at least:

### 4.1 Core Data Structures

1. **Tiles and Board**

   * Data model for tiles:

     * Type (`skill_band`, `quest`, `achievement`, `utility`)
     * Payload (e.g. which skill, which quest ID, which achievement set)
     * Coordinates (x, y)
     * State (`hidden`, `visible`, `unlocked`, `claimed`)

   * Data model for board:

     * Set of tiles
     * Adjacency rules (4-directional or 8-directional)

2. **Slayer Keys**

   * Track for each player/run:

     * Total keys owned
     * Keys per master (if you use per-master pools)

   * Functionality to:

     * Grant keys on task completion
     * Spend keys to unlock tiles

3. **Progress Tracking**

   * Track whether each tile is:

     * Unlocked
     * Claimed

   * Ideally: integrate with RS3 data (hiscores, RuneMetrics) to auto-claim completed bands/quests, but manual toggling is acceptable.

---

### 4.2 Rule Engine / Config

You should have configuration values (per mode) such as:

* `mode_name = "Relaxed Slayer Mode"`
* `allow_trading = true`
* `allow_ge = true`
* `ground_items_on_task = "allowed"`
* `ground_items_off_task = "allowed"`
* `limit_combat_to_slayer_tasks = false`
* `skill_band_size = 10`
* `off_task_kills_generate_keys = false`
* `death_penalty = "none"`

Your rules engine should consult these flags when:

* Calculating whether a given action is legal under the rules
* Displaying hints/warnings to the player (e.g. “You’re training a skill in a locked band.”)

---

### 4.3 Minimal External Game Data

Relaxed mode doesn’t *need* deep integration, but to make it nice:

* **Skills**

  * List of RS3 skills with max levels (99/120/150) and IDs.

* **Quests**

  * List of quests (name, ID) for generating quest tiles.

* **Achievements (optional)**

  * List of area task sets you want to use for tiles.

* **Slayer (optional for relaxed mode)**

  * At minimum, a way for the user to record “task completed” so you can award keys.
  * Full task/master data is nicer but not strictly required if user enters completions manually.

You can start with **manual input** for everything (user marks tasks complete, manually claims tiles), then later wire in APIs if you want automation.

---

If you want this formatted for **Discord**, **Markdown documentation**, or **Steam announcement style**, just tell me.
