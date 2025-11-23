export type ChangelogEntry = {
  version: string;
  date?: string;
  notes: string[];
};

// Keep newest entries first.
export const changelogEntries: ChangelogEntry[] = [
  {
    version: "0.0.9",
    date: "2025-11-23",
    notes: [
      "Prompted players to choose which combat/Constitution/Prayer/Summoning skills start maxed before every board generation or reset, skipping tiles for the selected skills."
    ]
  },
  {
    version: "0.0.8",
    date: "2025-11-23",
    notes: [
      "Stopped rolling combat, Slayer, and Necromancy skill tiles on new boards and auto-max their caps on start.",
      "Added a Convert Legacy Board option that maxes those combat caps and refunds keys already spent on their tiles."
    ]
  },
  {
    version: "0.0.7",
    date: "2025-11-23",
    notes: [
      "Added extra breathing room to the right of skill numbers and matched cap text size to the player level text in Skills & Caps.",
      "Adjusted Skills & Caps status line spacing under the header for better breathing room.",
      "Removed elite styling from the Skills & Caps list so all skill tiles use the same border and shadow.",
      "Evened the padding around skill icon tiles and shrunk icon fill slightly so artwork sits centered without overflow.",
      "Normalized padding around skill icons to be even on all sides, reduced icon size to prevent overflow, and kept the tighter chips layout.",
      "Inserted Dungeoneering into the Skills & Caps display order between Summoning and Divination.",
      "Sorted Skills & Caps into the requested 3-wide order, tightened chip padding further, and resized icons so they fit the background cleanly with slightly larger level numbers.",
      "Expanded skill icon backgrounds and trimmed chip padding so icons feel larger without growing the overall tiles.",
      "Enlarged skill icons inside the Skills & Caps tiles without increasing the chip size.",
      "Forced the Skills & Caps modal to a fixed 3-column grid and tightened padding around the skill icons.",
      "Tightened spacing in the Skills & Caps grid so the modal fits more rows without scrolling."
    ]
  },
  {
    version: "0.0.6",
    date: "2025-11-23",
    notes: [
      "Made board panning bypass full React re-renders and only persist after a drag ends, keeping the fully revealed grid responsive."
    ]
  },
  {
    version: "0.0.5",
    date: "2025-11-23",
    notes: [
      "Added RuneScape Wiki quick guide buttons to quest tiles and quest lists, linking directly to each quest's quick guide with a wiki icon."
    ]
  },
  {
    version: "0.0.3",
    date: "2025-11-23",
    notes: [
      "Added an Install App button in Board Options > Settings that surfaces the PWA install prompt and gives guidance when the browser hides it."
    ]
  },
  {
    version: "0.0.2",
    date: "2025-11-22",
    notes: [
      "Refreshed achievement and quest data and updated UI assets.",
      "Prepared deployment build with latest fixes."
    ]
  },
  {
    version: "0.0.1",
    date: "2025-11-22",
    notes: [
      "Added import/export for runs, boards, rules, and achievement progress.",
      "Introduced settings section with version display and changelog access."
    ]
  }
];
