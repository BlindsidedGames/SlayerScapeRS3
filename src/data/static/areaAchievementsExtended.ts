export type DiaryTier = "beginner" | "easy" | "medium" | "hard" | "elite";

export interface DiarySet {
  id: string; // slug: tier-area e.g., "easy-ardougne"
  area: string;
  tier: DiaryTier;
  name: string;
  description: string;
  members: boolean;
  points: number;
}

export interface DiaryRequirement {
  id: string; // matches diary set id
  skills: Array<{ skill: string; level: number; boostable?: boolean }>;
  quests: string[];
  items: string[];
  notes?: string;
}

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export interface AreaAchievementTaskSet {
  id: string;
  area: string;
  tier: DiaryTier;
  tasks: string[];
  total: number;
}

type AreaAchievementTaskSource = { area: string; tier: DiaryTier; tasks: string[] };

const areaAchievementTaskSource: AreaAchievementTaskSource[] = [
  {
    area: "Ardougne",
    tier: "easy",
    tasks: [
      "The Essence of Magic - Have Wizard Cromperty teleport you to the essence mine.",
      "Yoink! - Attempt to steal from any stall in Ardougne Market, or from any guard.",
      "Silky Smooth - Sell silk to the silk trader in Ardougne for 60gp each by haggling.",
      "Preaching to the Infected - Use the altar in West Ardougne's church.",
      "Playing the Waiting Game - Enter the Castle Wars waiting room.",
      "Gone Fishing - Non-ironman: Go out fishing on the Fishing Trawler. Ironman: Attempt to board the Fishing Trawler.",
      "Boot Camp - Enter the Combat Training Camp north of West Ardougne.",
      "A Cat is For Life... - Talk to a civilian in West Ardougne about selling a cat.",
      "Creator and Destroyer - Kill a unicow in the Tower of Life.",
      "Red Revolution - Get a civilian to throw a tomato at the army recruiter in West Ardougne.",
      "Going on a Summer Holiday - Sail from East Ardougne to Karamja.",
      "Breaking and Entering - Attempt to picklock a certain door east of the gem stall in Ardougne's marketplace.",
      "P-P-P-Pick Up Some Prizes - Spend some Penguin Points with Larry (or Chuck) at Ardougne Zoo.",
      "A Gift from Khazard - Use the Summoning obelisk to the east of the Fight Arena.",
      "Party Pooper - Pop a balloon in the monastery south of Ardougne.",
      "Vial Deeds - Buy a water-filled vial from the general store run by Aemad and Kortan.",
      "Star Seeker - Use the noticeboard near the Observatory to gather information about shooting stars.",
      "Dukes of Khazard - Kill something on the Khazard Battlefield.",
      "Don't Eat the Pointy Bit - Buy a skewered kebab from the Poison Arrow pub.",
      "Bargain Hunter - View the Hunter equipment in Aleck's shop in Yanille.",
      "Are You Being Served? - Talk to the chief servant at the servants' guild to find out about servants for your house.",
      "No Time to Lose - Use a ring of duelling to teleport to Castle Wars.",
      "They're Long and Pointy - Talk to Tindel Marchant about identifying swords on Kandarin's east coast.",
    ]
  },
  {
    area: "Ardougne",
    tier: "medium",
    tasks: [
      "A Visit to Charlie - Enter the unicorn pen in Ardougne Zoo using the fairy rings.",
      "I Wonder What This Does - Teleport to the Wilderness using the lever in Ardougne.",
      "Sandy's Secret Getaway - Grapple over Yanille's south wall.",
      "I Know a Shortcut - Craft some runes at Ourania Altar.",
      "Volatile Valuables - Sell some rubium to Ezekial Lovecraft in Witchaven.",
      "What, a Melon? - Pick watermelons from the Farming patch north of Ardougne.",
      "Ardougne Express - Cast the Ardougne Teleport spell.",
      "Arriving in Style - Travel to Castle Wars by hot-air balloon.",
      "By the Bucketload - Claim buckets of sand from Bert in Yanille.",
      "Meeting History, Again - After Meeting History, return to the past and talk to Sarah about Herblore.",
      "Fearless Fishing - Catch a fish at the Fishing Platform using either a net or rod.",
      "Water Logged - Cross the River Dougne using the log balance.",
      "Green Fingers - Pickpocket the master farmer north of Ardougne.",
      "A Natural Thief - Attempt to steal a nature rune from a chest in a house to the east of Ardougne market.",
      "The Coal Train - Mine some coal at the site between Witchaven and the Legends' Guild.",
      "Are You Chicken? - Kill a swordchick in the Tower of Life.",
    ]
  },
  {
    area: "Ardougne",
    tier: "hard",
    tasks: [
      "Brace Yourself - Recharge a combat bracelet or a skills necklace at the Legends' Guild.",
      "Shadow Boxing - Kill a shadow warrior in the Legends' Guild basement.",
      "Just Like That - Enter the Magic Guild in Yanille.",
      "Nice View - Use the portal in the Magic Guild to teleport to Thormac's tower.",
      "You're the Dirty Rascal - Be on the winning side in a game of Castle Wars.",
      "Ourania Mania - Cast the Ourania Teleport spell.",
      "Not on My Watch - Pickpocket a watchman in Yanille while wearing gloves of silence.",
      "It Just Croaked - Kill a frogeel in the Tower of Life.",
      "Get Your Stinking Hands Off Me - Have a monkey minder put you in Ardougne Zoo's monkey cage.",
      "Vine-detta - Kill your own jade vine after the Back to my Roots quest.",
      "Living on a Prayer - Use the Air Guitar emote near the musician outside the monastery south of Ardougne.",
      "Who Wants to Watch the Watchtower? - Cast the Watchtower Teleport spell.",
      "Monkey Business - Cross the monkey bars in the Yanille Agility Dungeon.",
      "It's My Newt - Catch a red salamander from the Hunter area outside of Ourania Altar.",
      "A Taste of the Exotic - Pick a papaya or coconut from the fruit tree patch near Tree Gnome Village.",
      "Blood Bank Withdrawal - Attempt to steal blood runes from the chest in the chaos druid tower's dungeon.",
      "Artillery Strike - Use a catapult in Castle Wars after gaining the knowledge from the Catapult Construction quest.",
    ]
  },
  {
    area: "Ardougne",
    tier: "elite",
    tasks: [
      "Catching Some Rays - Non-ironman: Catch a manta ray in the Fishing Trawler activity. Ironman: Successfully cook a rocktail on the Witchaven dock.",
      "Abyssal Valet - Have an abyssal titan familiar hold essence for you while runecrafting at Ourania Altar.",
      "You Could Just Knock - Attempt to picklock the door to the basement in Yanille Agility Dungeon.",
      "Honestly, It's Not a Purse - Remove pure or impure essence from a giant pouch at Ourania Altar.",
      "Almost Made in Ardougne - Make a rune crossbow from scratch, performing each step within either Witchaven or Yanille.",
    ]
  },
  {
    area: "Daemonheim",
    tier: "easy",
    tasks: [
      "Setting Up - Make a full suit of tier 1 armour (helm, body, legs, boots, gloves).",
      "It's Dangerous to go Alone - Non-ironman: Complete a dungeon in a team of more than 1. Ironman: Complete a medium, complexity 6 dungeon.",
      "Kitchen Aid - Non-ironman: Feed a team mate some food to heal them. Ironman: Attempt to feed a Dungeoneering familiar.",
      "The Lone Dungeoneer - Complete a dungeon, solo.",
      "Dere-licked - Complete an abandoned floor on any complexity, solo.",
      "Take It From the Top - Reset your current floor progress.",
      "Change of a Dress - Switch to another bind loadout.",
      "Gorajo Fandango - Use a combat familiar to help fight a boss using their standard attacks.",
      "You're Not the Boss of Me - Defeat the boss on floor 1, solo.",
      "A Road Less Travelled - Pass the guards guarding the Wilderness entrance.",
      "Invisible Ink - Use a ring of kinship on a fire within a dungeon.",
      "Untouchable - Complete a floor without dying, solo.",
      "Fashion Victim - Wear a full suit of any tier 1 armour (helm, body, legs, boots, gloves).",
      "Sinking Fast - Regular accounts, Ironman accounts, Hardcore Ironman accounts, and Regular Group Ironman accounts: Complete a sinkhole. Competitive Group Ironman: Locate a sinkhole.",
      "Tales of Old - Complete a Fremennik Saga (abridged or unabridged) after talking to Skaldrun.",
      "A Flicker in Darkness - Use a crater to convert a memory of tier 2 or higher to energy.",
    ]
  },
  {
    area: "Daemonheim",
    tier: "medium",
    tasks: [
      "You Got Some Nice Drapes There - Complete a furnished floor solo on any complexity.",
      "I Want It All - Gain the Beast Mode title on a complexity 6 floor solo.",
      "And I Want It Now - Complete a complexity 6 floor solo in under 6 minutes.",
      "Marm's Armoury - Make use of either an autoheater, gem bag, herbicide, bonecrusher or charming imp.",
      "Tactical Retreat - Flee from any boss using a self-made gatestone.",
      "Port Enter - Create a portent of passage V or above.",
      "Totem Pole Position - Non-ironman: Hand in a total of 20 items in a single sinkhole. Ironman: Enter the 6 resource dungeons with an entry requirement equal to or less than Dungeoneering level 35 within 6 minutes.",
      "Nice to Meet You, Wall - Kill Rammernaut without getting charged, or make him stun himself.",
      "300 - Complete Three's Company with 100%.",
      "Drink Me - Boost your Magic level with a self-made tier 2+ potion (from seed).",
      "Spinal Trap - Set a spinebeam trap that you made yourself.",
      "Cache Box - Unlock a level 40+ chest.",
      "Up to the Gods - Sacrifice a frost dragon bone on a prayer altar from a dragon you killed yourself in a solo dungeon.",
    ]
  },
  {
    area: "Daemonheim",
    tier: "hard",
    tasks: [
      "Occult Classic - Complete an occult floor solo on any complexity.",
      "Stacked - Start a floor with 225 of any type of ammo bound to you.",
      "Kinprovements - Wear a ring of kinship with a fully upgraded role, e.g. Tank, Medic.",
      "Lawful Crafting - Craft some law runes while inside a dungeon.",
      "Thanks for the Memories - Harvest memories from a tier 8 (or higher) spring.",
      "Healing Factor - Use the Rapid Renewal prayer for 1 minute within a dungeon.",
      "Alcrabholic - Kill a 'rum'-pumped crab in the 'Rum'geon on Braindeath Island.",
      "Hoof Rot - Have Bal'Lak the Pummeller walk onto his own rifts in a solo dungeon.",
      "A Prayer Opportunity - Build a prayer altar in the starting room and fill up your prayer points from it.",
      "The Wanderer - Imbue a catalytic wand on a runecrafting altar.",
      "Get Stuffed - Make a bouldabass & edicap potato from the raw ingredients and eat it in a boss fight.",
      "Epic Epic - Complete all Sagas with 100%.",
    ]
  },
  {
    area: "Daemonheim",
    tier: "elite",
    tasks: [
      "Any fin is Possible - Cook 1 of each type of fish.",
      "Orbful - Craft and wield a spiritbloom orb.",
      "Top Hat - Create a promethium full helm from scratch.",
      "In the Darkness Bind Them - Wear 4 bound items.",
      "Pass the Port - Create and use a portent of restoration IX or higher.",
      "Gulega-d to Rest - Kill the warped gulega, but avoid his 1 lifepoint attack in a solo dungeon.",
    ]
  },
  {
    area: "Desert",
    tier: "easy",
    tasks: [
      "Assassin's Feed - Eagle-dive into hay cart after Diamond in the Rough.",
      "Touring Gear - Wear full desert clothing.",
      "Memento Mori - View Het's Oasis memorial board.",
      "Fool's Gold - Catch golden warbler.",
      "Don't You Dare Close Your Eyes - Use magic carpets.",
      "Slash Fund - Get water from cactus.",
      "Kookookachat - Talk to Khoochak.",
      "Fire at Will - Craft fire rune.",
      "Seems Legit - Get 5 artefacts from Pyramid Plunder.",
      "Extra Cheese - Exchange pizazz points.",
      "I Like to Watch - Spectate Dominion Tower.",
      "Wiggle Room - Troubadour dance near Citharede Abbey.",
    ]
  },
  {
    area: "Desert",
    tier: "medium",
    tasks: [
      "Faster than a Speeding Bullet - Ride eagle to desert.",
      "So Su Me - Solve easy runedoku.",
      "A Bridge Not Far - Cross River Lum via crossbow.",
      "Heathen Idle - Pray at Elidinis statuette.",
      "Away with the Kalphites - Use fairy ring near Kalphite Lair.",
      "All Square - Sell pyramid top to Simon.",
      "Goat Harralander? - Make combat potion after killing goat.",
      "Taken for Granite - Mine granite.",
      "Unbeetleable - Create spirit kalphite pouch.",
      "An Teak - Attempt to cut teak at Uzer.",
      "Overcut - Boost stats at Amascut's altar.",
    ]
  },
  {
    area: "Desert",
    tier: "hard",
    tasks: [
      "Skinful - Use Humidify to fill waterskin.",
      "Water on the Brain - Equip charged water tiara.",
      "More Fletcher than Sumona - Fletch broad ammo in Sumona's house.",
      "Ug Thankee Kindly - Make ugthanki kebab.",
      "Nipped in the Bug - Use dreadnip on KQ.",
      "Drafty in Here - Kill dust devil.",
      "Enaqua - Fill waterskin in Enakhra's temple.",
      "Say It, Don't Spray It - Hear Al the Camel poem.",
      "1001 Kharidian Spikes - Harvest cactus spines.",
      "Ice-Cold Killer - Freeze with Ice Burst.",
      "Ludikeris - Kill scarab mage/locust rider/kalphite with Keris.",
      "Security through Obscurity - Use Bedabin chest.",
      "Wake-Up Call - Open lvl61 sarcophagus.",
      "Open Sesame - Enter Al Kharid resource dungeon.",
    ]
  },
  {
    area: "Desert",
    tier: "elite",
    tasks: [
      "Staff on Stryke - Kill strykewyrm w/ Slayer helm + ancient staff.",
      "Room Service - Open final Pyramid Plunder sarcophagus.",
      "Sun Shade - Place dominion marker incl. Sunfreet.",
      "A, B, Cithara - Play Holy Cithara in Abbey.",
      "Ankle Support - Wear ankh + Scabaras mask.",
      "I'm Super - Make super antifire flask from scratch.",
    ]
  },
  {
    area: "Falador",
    tier: "easy",
    tasks: [
      "Amulet of Weedspeak - Buy amulet from Sarah.",
      "The Good Stuff - Buy stat beer.",
      "Chain Store - Buy black chainbody & try on.",
      "Sir Mitt - Climb White Knights' Castle.",
      "Family Values - Discover family crest.",
      "Sniffing Out the Mole - Enter mole lair.",
      "Chinchompa Powered! - Feed Ridgeley.",
      "Fill Yer Bucket - Fill bucket north of west bank.",
      "Elementary Medicine - Heal elemental wizard.",
      "It's Not Wabbit Season - Kill duck.",
      "My Way or the Highway - Kill highwayman.",
      "Making My Mind Up - Make mind tiara.",
      "Mudskip the Light Fantastic - Recharge prayer Port Sarim altar.",
      "Disarm and Embark - Take boat to Entrana.",
      "Going Along With the 'Fro - Talk to Party Pete.",
    ]
  },
  {
    area: "Falador",
    tier: "medium",
    tasks: [
      "Fruit of the Loom - Craft fruit basket.",
      "Is It So Hard to Walk Round? - Crawl under south wall.",
      "Climbing the Walls - Grapple & jump north wall.",
      "It's Nothing Personal - Increase White Knight rep.",
      "Ice the Icy - Kill ice giant.",
      "Blinded With Science - Light bullseye lantern.",
      "They Have Families to Feed - Pickpocket guard.",
      "Stoic Sweetcorn Guardian - Place scarecrow.",
      "Look Spiffy For Tiffy - Salute Sir Tiffy in initiate.",
      "Do They Come in Other Colours? - Smith blurite limbs.",
      "These Aren't the Coins You're Looking For - Free travel to Musa Point.",
      "Kitty Litter - Summon cat at sandy patch.",
    ]
  },
  {
    area: "Falador",
    tier: "hard",
    tasks: [
      "It Matches My Eyes - Dye cape pink.",
      "Child of Saradomin - Change family crest.",
      "Mass Production - Craft 140 mind runes.",
      "It Spoiled My View - Cut yew/magic you grew.",
      "The Stonemasons - Enter Mining Guild.",
      "I Heard You Like Mudskips - Fairy ring to Mudskipper Point.",
      "The Mogre Mash - Kill mogre.",
      "Why Oh Wyvern - Kill skeletal wyvern.",
      "Banned For Life - Summon ibis at fishing store.",
      "A Knight in the Darkness - Ascend Dark Wizards' Tower in proselyte.",
    ]
  },
  {
    area: "Falador",
    tier: "elite",
    tasks: [
      "When This Cavern's Rockin'... - Catch rocktail LRC.",
      "...You'd Best Come A-cookin' - Cook rocktail in Falador area.",
      "Concentration Is Key - Mine concentrated gold.",
      "I Swear I Heard It Scream - Chop homegrown magic tree.",
      "I've Changed My Mind! - Hydra regrows tree.",
      "A String and a Flare - Cast String Jewellery at furnace.",
      "Altar-ed State - Disable curses with Turmoil at White Knights' altar.",
    ]
  },
  {
    area: "Fremennik",
    tier: "easy",
    tasks: [
      "Bring the Antipoisons - Kill a cave crawler in the Fremennik Slayer Dungeon.",
      "Why Won't You Die? - Kill five rock crabs on the shore near Rellekka or on Waterbirth Island.",
      "King Conifer - Find the highest tree on the Fremennik mainland.",
      "Assaulted Goodies - View the rewards in the Barbarian Assault tutorial.",
      "Oxymoron Incarnate - Speak to Otto Godblessed about barbarian training.",
      "Why Did the Lobster Blush? - Collect three seaweed from the shore north-east of Rellekka.",
      "Hunting the Hunter - Find the hunting expert on the northern ice plains.",
      "Peer Off the Pier - Catch a fish off one of Rellekka's piers.",
      "A Familiar Feeling - Use the Summoning obelisk near Rellekka's gate.",
      "Endangered Species - Kill an adult black unicorn.",
    ]
  },
  {
    area: "Fremennik",
    tier: "medium",
    tasks: [
      "Fremennik History 101 - Learn the history of the Fremennik and outerlanders from Chieftain Brundt.",
      "Cool Story, Bro - Watch a shouting match between the Fremennik isles' tower guards.",
      "Who's a Good Boy? - Interact with a pet rock.",
      "Only Takes a Little Vial - Make three vials in the furnace building at Rellekka.",
      "You Know You Want It! - Go to the Fossegrimen and charm her into accepting a raw bass.",
      "Yak Attack - Wear yak-hide armour and kill an ice troll.",
      "Fremmental - Make cheese in the dairy churn in Rellekka.",
      "Fairy Mountaineering - Use a fairy ring to appear on a mountaintop, near the windswept tree.",
      "You Really Don't Need Any More Shoes - Look at Yrsa's options for recolouring your boots in her clothes shop in Rellekka.",
      "Big Game Hunter - Successfully hunt a sabre-toothed kyatt.",
      "Grand Theft Fish - Steal a fish from Rellekka's market.",
    ]
  },
  {
    area: "Fremennik",
    tier: "hard",
    tasks: [
      "Defeating Deadly Dagannoths - Kill three dagannoths in the first layer of Waterbirth Island's dungeon.",
      "Dress to Impress - Wear rockshell, spined or skeletal armour and have the locals use an honorific with your Fremennik name.",
      "The Graceful Barbarian - Complete the Barbarian Outpost Agility Course.",
      "Runes on the Moon - Mine pure essence on Lunar Isle.",
      "Pyre At Will - Make a barbarian pyre ship from arctic pine.",
      "Fish Fingers - Catch a tuna without a harpoon.",
      "Easy As Pie - Bake a pie using Magic.",
      "How to Maim Your Dragon - Kill a mithril dragon.",
      "A Periodic Table - Get mahogany from your Etceterian subjects.",
    ]
  },
  {
    area: "Fremennik",
    tier: "elite",
    tasks: [
      "Jaws Breaker - Catch a shark with bare hands on Jatizso.",
      "Limber Lumber Jumper - Complete the high-level section of the Barbarian Agility course while wearing an agile top.",
      "Astronomical! - Craft at least 56 astral runes simultaneously, without using pouches or familiars.",
      "First Stryke - Kill an ice strykewyrm (you do not need to be assigned these as your slayer target to complete this Task).",
      "Leap of Faith - Jump the chasm in the Fremennik Slayer Dungeon to gain quick access to the pyrefiends.",
      "No Smoke Without Pyre - Make a pyre ship from magic logs.",
      "This Hasta Work - Smith a rune hasta at Otto's anvil.",
      "Potting With Otto - Make a Super Ranging Mix within Otto's house.",
      "Axe'll Grease - Use Balmung to kill a dagannoth.",
    ]
  },
  {
    area: "Karamja",
    tier: "easy",
    tasks: [
      "Five a Day - Pick 5 bananas from the plantation located east of the volcano.",
      "I'm Lichen This! - Use the rope swing to travel to the moss giant island north-west of Karamja.",
      "Golden Shores - Mine some gold from the rocks on the north-west peninsula of Karamja.",
      "Put to Port in Port Sarim - Travel to Port Sarim via the dock east of Musa Point.",
      "Avast Ardougne! - Travel to Ardougne via the port near Brimhaven.",
      "Show That You Cairn - Explore Cairn Island to the west of Karamja.",
      "Fruity Catch - Use the fishing spots north of the banana plantation.",
      "Beachcomber - Collect 5 seaweed from anywhere on Karamja.",
      "TzHaar Wars - Attempt the TzHaar Fight Pit or Fight Cave.",
      "It's a Jungle Ogre - Kill a jogre in the Pothole dungeon.",
    ]
  },
  {
    area: "Karamja",
    tier: "medium",
    tasks: [
      "Just the Ticket - Claim a ticket from Brimhaven Agility Arena.",
      "Back Cran-door - Discover the hidden wall in the dungeon below the volcano.",
      "Dungeons and Dragons - Visit the isle of Crandor via the dungeon below the volcano.",
      "Horseless Carriage - Use Vigroy and Hajedy's cart service.",
      "They Like Me! They Really Like Me! - Earn 100% favour in the village of Tai Bwo Wannai.",
      "Arachnophagia - Cook a spider on a stick.",
      "Romancing the Stone - Mine a ruby from a gem rock in Shilo Village.",
      "I'm a Lumberjack and I'm Okay - Cut a log from a teak tree.",
      "I Sleep All Night and I Work All Day - Cut a log from a mahogany tree.",
      "To Catch a Karambwan - Catch a karambwan.",
      "That's Not a Knife... - Exchange gems for a machete.",
      "Falling With Style - Use the gnome glider to travel to Karamja.",
      "Scourge of Scurvy - Grow a healthy fruit tree in the patch near Brimhaven.",
      "Hunters of the Horned Graahk - Trap a horned graahk.",
      "The Roots of All Evil - Chop the vines to gain deeper access to Brimhaven Dungeon.",
      "Points of No Return - Cross the spiky pit using the stepping stones within Brimhaven Dungeon.",
      "Stairway to Haven - Climb the stairs within Brimhaven Dungeon.",
      "Thank You, Madam - Charter the Lady of the Waves from Cairn Isle to Port Khazard.",
      "Shipping Out From the Shipyard - Charter a ship from the shipyard in the far east of Karamja.",
    ]
  },
  {
    area: "Karamja",
    tier: "hard",
    tasks: [
      "Flawless Victory - Become the champion of the Fight Pit.",
      "Play Dead, Doggy - Kill a Ket-Zek in the Fight Cave.",
      "I'd Be Kharazi to Eat This - Eat an oomlie wrap.",
      "At One With Nature - Craft some nature runes.",
      "Drop It Like It's Hot - Cook a karambwan thoroughly.",
      "Deadwing - Kill a deathwing in the dungeon under the Kharazi Jungle.",
      "Quick As a Shot - Use the crossbow shortcut south of the volcano.",
      "A Palm For Each Finger - Collect 5 palm leaves.",
      "Yes, My Master - Be assigned a Slayer task in Shilo Village.",
      "Can Opener - Kill a metal dragon in Brimhaven Dungeon.",
    ]
  },
  {
    area: "Karamja",
    tier: "elite",
    tasks: [
      "At One Plus Fifty-Five With Nature - Craft 56 nature runes simultaneously, without using pouches or familiars.",
      "The Power of Lava - Equip a TzHaar fire cape while standing in TzHaar.",
      "Boxing Clever - Box-trap a monkey on Karamja.",
      "It's a Snap - Buy a snapdragon from Pirate Jackie the Fruit and create a super restore potion in Brimhaven.",
      "Crunchy Coating - Cook a shark over a sulphur pit.",
      "Walkies! - Take your chameleon for a walk around Cairn Isle to see its egg-home.",
      "Tread Carefully - Use the stepping stone across the river in Shilo village[sic].",
      "Ten in a Row - Gain 75+ Slayer points from Lapalok.",
    ]
  },
  {
    area: "Lumbridge",
    tier: "beginner",
    tasks: [
      "Master of All I Survey - Climb to the highest point in Lumbridge.",
      "Raise the Roof - Raise the flag on the roof of the Lumbridge bank.",
      "Hail to the Duke, Baby - Speak to Horacio, the Duke of Lumbridge.",
      "Doom! - Speak with the Doomsayer about the Warning System.",
      "Sage Advice - Talk to the Lumbridge Sage.",
      "Window Shopping - Browse Lumbridge's general store.",
      "Wait, That's Not a Sheep - Visit Fred the Farmer's chicken and sheep farm.",
      "Herald the Dawn - Claim a herald cape from the herald of Lumbridge.",
      "Clay More - Mine clay north-west of the Lumbridge flour mill.",
      "Just Add Water - Make soft clay.",
      "Very Potter - Make a pot on a potter's wheel.",
      "Hotpot - Fire a pot in a pottery oven.",
      "In the Countyard - Enter Draynor Mansion courtyard.",
      "Grinding My Gears - Grind flour in Lumbridge mill.",
      "Beware of Pigzilla - Visit Draynor Village market.",
      "The Rules of Engagement - Learn rules from Draynor's town crier.",
      "Tower Power - Climb to the top of the Wizards' Tower.",
      "Take Your Pick - Mine copper south-east of Lumbridge Swamp.",
      "Shrimpin' Ain't Easy - Catch shrimp east of Lumbridge Swamp.",
      "The Fruit of the Sea - Sell a raw shrimp.",
      "A Grave Consideration - View gravestones with Father Aereck.",
      "Tinkle the Ivories - Play church organ.",
      "Ring My Bell - Ring the church bell.",
      "Docking Out - Enter Al Kharid via west gate.",
    ]
  },
  {
    area: "Lumbridge",
    tier: "easy",
    tasks: [
      "Artisan Crafting - Create a clay ring in Draynor pottery oven.",
      "Bless Is More - Bless ring with Father Aereck.",
      "Morgan the Merrier - Sell clay ring to Morgan.",
      "Iron On - Mine iron ore south-west Lumbridge Swamp.",
      "And It Was THIS Big! - Catch a pike east of Lumbridge Castle.",
      "Belter of a Smelter - Smelt a steel bar.",
      "Nowt Tool Look At - Search swamp shed.",
      "You Doity Rat - Kill a giant rat.",
      "It Was Dead Already! - Cut a swamp tree.",
      "Camping Trip - Make campfire in swamp.",
      "Ratatouille - Cook rat meat.",
      "Slippery When Wet - Craft water runes.",
      "I Can't Hear Dead People - Get replacement ghostspeak amulet.",
      "Come In Here and Say That - Taunt lesser demon in Wizards' Tower.",
      "What Is This Place? - Sedridor teleports you to essence mine.",
      "Money Down the Drayn - Access Draynor bank.",
      "Klept-Old-Man-ia - Ask Wise Old Man to check bank.",
      "Eye on the Prize - Look through Wise Old Man's telescope.",
      "Draaaaaiiiiiins... - Kill zombie in jailhouse sewers.",
    ]
  },
  {
    area: "Lumbridge",
    tier: "medium",
    tasks: [
      "Steel Justice - Smith steel longsword in jailhouse sewers.",
      "Ease of Access - Cast Lumbridge Teleport.",
      "Everybody Loves Coal! - Mine coal south-west swamp.",
      "Weeping Willow - Cut willow east of castle.",
      "Willow the Wisp of Smoke - Light willow fire on castle gatehouse.",
      "A Meal Fit For a Duke - Cook lobster in castle kitchen.",
      "Always Be Prepared - Try to obtain anti-dragon shield.",
      "Hi Ho, Silver - Mine silver north of Al Kharid.",
      "Lovely With a Squeeze of Lemon - Catch salmon east of castle.",
      "One Day, You Shall Be a Fork - Smelt silver bar.",
      "Made to Order - Craft holy symbol.",
      "Where's The Beef? - Get Beefy Bill to bank something.",
    ]
  },
  {
    area: "Lumbridge",
    tier: "hard",
    tasks: [
      "A Body in the Sewers - Smith mithril platebody in sewers.",
      "Building Up Strength - Make amulet of strength fully in Lumbridge.",
      "Have Your Cake and Eat It - Cook chocolate cake in castle kitchen.",
      "Blast and Hellfire - Cast Fire Blast on local monsters.",
      "Gods, Give Me Strength - Pray with Mystic Might at church altar.",
      "Not Waving But Drowning - Craft 100+ water runes without aids.",
      "Are Yew As Fired Up As I Am? - Burn yew log on castle east gatehouse.",
    ]
  },
  {
    area: "Morytania",
    tier: "easy",
    tasks: [
      "Chisellin' Conchiolin - Craft your own snelm in Morytania.",
      "It's Only Wafer Thin - Cook a thin snail in Morytania.",
      "Dislike-Anthrope - Kill a werewolf in its human form using the wolfbane dagger whilst in Canifis.",
      "Cranius Lupus - Finish a game of Werewolf Skullball.",
      "Lab Clean-up Assistant - Kill an experiment under Castle Fenkenstrain.",
      "Fortified Spirit - Restore and boost your prayer points at the altar in the Nature Grotto.",
      "Struck A-Ghast - Kill a ghast in Morytania.",
      "Blooming Marvellous - Using either a Silver Sickle or the Ivandis Flail, grow some fungus in the swamp using Bloom.",
      "Only Going Forward. We Can't Find Reverse - Take an easy companion through an easy route of Temple Trekking.",
      "If It Bleeds... - Kill anything on the ground floor of the Slayer Tower.",
      "Wurt A Bundle - Harvest limpwurt in the farming patch near Port Phasmatys.",
    ]
  },
  {
    area: "Morytania",
    tier: "medium",
    tasks: [
      "Charter A Course - Take a trip on a charter ship to the Port Phasmatys dock.",
      "Travelling On The Slime Trail - Use an ectophial to return to Port Phasmatys.",
      "The Yeast They Can Do - Exchange ecto-tokens for brewing yeast with Metarialus in The Green Ghost inn's cellar.",
      "Flamtaer Will Get You Everywhere - Use a Flamtaer hammer to help fix the Shades of Mort'ton temple.",
      "Who You Gonna Ring? - Use the fairy rings to travel to the Haunted Woods.",
      "Barking Up the Wrong Tree - Obtain some bark from hollow trees.",
      "Gate Spectre-ations - Enter through the western gate of Port Phasmatys.",
      "Ready? Trek! - Take a medium companion through a medium route of Temple Trekking.",
      "Don't Stop Me If I Start To Ramble - Complete a Burgh de Rott Ramble.",
      "Plenty Mort Where That Came From - Unlock a chest in the Shade Catacombs.",
      "Izzy Wizzy Let's Get Lizzy - Trap a green salamander in the Haunted Woods.",
      "Finding Your Balance - Mix a Guthix Balance potion while in Morytania.",
      "The Beer Inn-spectre - Start any ale brewing below the Green Ghost Inn.",
      "Brain Bending - Telegrab the pickled brain on a table in the Hair of the Dog.",
      "I Wonder How Far It Ghost? - Explore the tunnel from the cellar under the Hair of the Dog.",
      "Obvious Forgery - Make a batch of cannonballs in Port Phasmatys.",
      "The Higher, The Badder - Kill anything on the first floor (upstairs) of the Slayer Tower.",
      "Fun Guy But Bitter - Harvest bittercap mushrooms in the farming patch near Canifis.",
      "Polterheist - Mine the mithril vein in the north-west corner of level 2 of the Abandoned Mine.",
      "Ad-Myre The Goods - View the stock in Razmire Builders' Merchants shop.",
    ]
  },
  {
    area: "Morytania",
    tier: "hard",
    tasks: [
      "Detarnation - Kill Tarn Razorlor (or visit his lair if he's already dead).",
      "Runecraft Carrier - Break a Blood Altar teletablet.",
      "Shade-Shattering Ka-Bloom - Cast Bloom using a Flail of Ivandis, upgraded with at least 200 burnt vyre corpses.",
      "They'll Just Throw It Away Again - Hand in your stick at the end of the Werewolf Agility Course.",
      "Time Salver - Use the shortcut to cross the River Salve without going through the temple.",
      "Huge Success - Attune your house portal to Kharyrll, or use yours if it has already been attuned.",
      "I Brought Your Stuff Back - Equip one item from a set of Barrows gear in the Barrows.",
      "Just One More Key... - Use a Columbarium key to unlock an alcove.",
      "Raising The Stakes - Fletch a blisterwood polearm within Morytania.",
      "Trekkin' Ain't Easy - Take a hard companion through a hard route of Temple Trekking.",
      "Better Than Cursing The Darkness - Burn a Haunted Wood torch while wearing the Ring of fire.",
    ]
  },
  {
    area: "Morytania",
    tier: "elite",
    tasks: [
      "Whip: It Good - Kill an abyssal demon in the Slayer Tower.",
      "As You Might Expect - Craft blood runes at the Blood Altar.",
      "Thoroughly A-Ghast - Summon a ghast familiar in Morytania.",
      "As Good As Renew - Farm and mix the ingredients for a prayer renewal potion entirely in Morytania.",
      "Fremennik Export - Fish shark barehanded off the Burgh de Rott dock.",
      "Not Such a Rotten Idea - Teleport to Burgh de Rott using a games necklace.",
      "Set It On Fiyr - Burn a fiyr shade with pyre wood.",
      "Bros Before Barrows - Defeat the first seven Barrows Brothers, including Akrisae.",
      "On Wings Of Bling - Use Drakan's Medallion to teleport to Darkmeyer.",
    ]
  },
  {
    area: "Seers' Village",
    tier: "easy",
    tasks: [
      "Reflax Actions - Pick five flax from the flax field.",
      "Why? - Walk clockwise around the big mysterious statue.",
      "Stir, Galahad - Have Sir Galahad make you a cup of tea.",
      "La Morte D'Arthur - Take a poison chalice to King Arthur.",
      "Another String to Your Bow - Spin five bowstrings.",
      "Bunch of Flours - Fill five pots with flour from the Sinclair Mansion.",
      "Happy Hour - Give five locals a glass of cider in the Forester's Arms.",
      "Jute Alors! - Plant some jute.",
      "Sinclair Swirling - Use the churn in the Sinclair Mansion garden.",
      "Grand Candle - Buy a candle from the candle-maker.",
      "A Seer-ing Light - Pray at the Seers' Village altar.",
      "Mack Rolled - Catch a mackerel.",
    ]
  },
  {
    area: "Seers' Village",
    tier: "medium",
    tasks: [
      "Fleeing the Scene - Use the Sinclair Mansion to Fremennik Province Agility shortcut.",
      "It's a Slightly Magical Stick. - Talk to Thormac the sorcerer about making mystic staves.",
      "King Coal - Transport a full load (224 pieces) of coal to Seers' Village.",
      "I Can Seer My House From Here - Find the highest point in Seers' Village.",
      "Mastering the Elements - Defeat each type of elemental in the Elemental Workshop.",
      "It's Only a Model - Teleport to Camelot.",
      "Sniper Training - Kill one guard on each tower of the Ranging Guild using a regular shieldbow.",
      "Arch Archer - Have the Ranging Guild judge congratulate you for acquiring over 1,000 archery tickets.",
      "What, No Cuddly Toy? - Buy something from the ticket exchange in the Ranging Guild.",
      "Familiar Fire Familiarity - Use a familiar to make a maple fire within Seers' Village.",
      "At Least It Doesn't Need Walking - Get a pet fish from Harry.",
      "All Your Bass... - Catch and cook a bass in Catherby.",
    ]
  },
  {
    area: "Seers' Village",
    tier: "hard",
    tasks: [
      "At Home on the Range - Teleport to the Ranging Guild.",
      "See Yew at Five - Cut five sets of yew logs. (X/5)",
      "The Short of It - String a magic shortbow in Seers' Village bank.",
      "Prayer of Attorney - Enter the Seers' Village courthouse with your Piety prayer turned on.",
      "Beware of the Dog - Use the fairy ring in McGrubor's Wood.",
      "Twisted Fire Starter - Burn a magic log in Seers' Village.",
      "Alch-aholic - Cast High-level Alchemy on a magic shortbow in Seers' Village bank.",
      "Gonna Need a Bigger Boat - Catch five sharks in Catherby.",
      "Gonna Need a Bigger Range - Cook five sharks on the range north of Catherby bank using the cooking gauntlets.",
      "Water Palaver - Charge five water orbs in one go.",
      "Island Hopper - Use the grapple shortcut to get from the water obelisk island to Catherby beach.",
    ]
  },
  {
    area: "Seers' Village",
    tier: "elite",
    tasks: [
      "It's a Trap! No, Wait, It's a Pie - Make an admiral pie from scratch within Seers' Village/Catherby.",
      "Make a Bolt For It - Make an enchanted diamond-tipped bolt from scratch within the Seers' Village area.",
      "The Long of It - Make a magic shieldbow from scratch within the Seers' Village area.",
      "Plenty - potion - entiary - Make an extreme Ranging potion from scratch and drink it within the Ranging Guild.",
      "Moon Raker - Cast Fertile Soil on a patch within the Seers' Village area.",
    ]
  },
  {
    area: "Tirannwn",
    tier: "easy",
    tasks: [
      "Iban You from Hurting Me! - Kill a disciple of Iban while using Iban's staff.",
      "Driven, Underground - Navigate the Underground Pass, using the thieving shortcuts and talking to Klank on the way through about his gloves. (X/2)",
      "Arandar-bout Way - Enter through the gates of the Arandar Pass while wearing only a full set of Mourner gear.",
      "Blowing Your Own Trumpet - Get Gwir in Lletya to remind you about your previous adventures in the elven lands.",
      "The Motherlode - Use the Tirannwn lodestone.",
      "Tyrassed to Impress - Equip a Tyras helm inside Tyras Camp.",
      "Lime Ordeal - Mine limestone at the mountains of Arandar.",
      "Leaf Me Alone - Attempt to pass a leaf trap.",
      "Fairy Liquid - Teleport to the fairy ring in the Poison Waste.",
      "Stand Still, Eluned! - Have Eluned or Ilfeen recharge a teleport crystal for you in Isafdar.",
      "Casting Shadows - Kill a shadow in the Temple of Light with a shadow spell.",
      "Sick and Twisted - Kill a warped terrorbird or tortoise in the Warped Poison Waste Dungeon.",
    ]
  },
  {
    area: "Tirannwn",
    tier: "medium",
    tasks: [
      "Harrowed Lands - Make harralander tar in the Poison Waste using tar sourced in Tirannwn.",
      "Bowing Out and About - Create a yew shieldbow from scratch in the elven lands. (X/5)",
      "An Act of War - Purchase a halberd from the Tyras Camp, then use it to kill an elf in the Elf Camp.",
      "Sharks are Good for the Elf - Bank a shark fished from the elven lands using the Elf Camp deposit box.",
      "Gnome Roaming - Exit Tirannwn through the Galarpos Mountains.",
      "Mufflebirds - Attempt to pass a poison bolt tripwire trap.",
      "The Circle of Life - Use Pawya meat in a grenwall trap.",
      "Papa Pawya - Trap a pawya in the elven lands using a papaya you have harvested from a tree grown in the elven lands.",
      "Pretty and Witty and Dead - Create death runes from at least 20 pure essence whilst wearing a death tiara at the Death Altar.",
      "Light Transit - Enter the Temple of Light using a teleport crystal.",
      "Stranger and Stranger - Create a stranger plant pouch at the Well of Voyage.",
    ]
  },
  {
    area: "Tirannwn",
    tier: "hard",
    tasks: [
      "Sing-Along-a-Seren Verse 1 - During the Amlodd Voice of Seren : create a Titan's Constitution summoning scroll.",
      "Sing-Along-a-Seren Verse 2 - During the Cadarn Voice of Seren : use a crystal bow to damage a Cadarn elf.",
      "Sing-Along-a-Seren Verse 3 - During the Crwys Voice of Seren : cut a magic log in the Crwys district.",
      "Sing-Along-a-Seren Verse 4 - During the Hefin Voice of Seren : complete one lap of the Hefin Agility Course successfully.",
      "Sing-Along-a-Seren Verse 5 - During the Iorwerth Voice of Seren : use a crystal dagger to damage an Iorwerth elf.",
      "Sing-Along-a-Seren Verse 6 - During the Meilyr Voice of Seren : craft a perfect juju farming potion using moss you harvested yourself.",
      "Sing-Along-a-Seren Verse 7 - During the Trahaearn Voice of Seren : mine an adamantite or runite rock.",
      "What a Rush - Play a non-reward game of Rush of Blood.",
      "The Diplomatic Approach - Find and speak to the elf lords and ladies from each of the eight clans inside the walls of Prifddinas. (X/8)",
      "Hefin And Puffin' - Take a shortcut on the Hefin Agility Course.",
      "Long Way From Home - Complete the Hefin Agility course with a light creature familiar summoned.",
      "Because You're Iorwerth It - Defeat an Iorwerth warrior while under the influence of the Iorwerth prayer altar.",
      "Cadarn Tootin' - Swap to the Ancient spellbook at the Cadarn grimoire, then defeat a Cadarn elf whilst using the Ancient spellbook.",
      "A Face in the Clouds - Bring a mound of bacon, bread and a chocolate bar to Seren.",
      "Brace for Additional Impact - Wear a bracelet of clay while mining soft clay in the Ithell district of Prifddinas.",
      "Thank You, Deer - Exchange a familiar pouch for shards with Lord Amlodd.",
      "Disco Impling - Do a dance in the impling collector's house with at least ten other implings present.",
      "Can I Have Some Morvran? - Complete a Morvran slayer assignment that has been both preferred and extended.",
      "B Sharp, Not Flat - Play and retune each of the harps in the Ithell Harmonium.",
      "Casting a Shadow - Throw a blissful shadow core into the Amlodd crater.",
      "A Clean Slate - Cleanse the Corrupted Seren Stone with at least one crystal.",
    ]
  },
  {
    area: "Tirannwn",
    tier: "elite",
    tasks: [
      "99 With a Flake - Unfurl a flag in the Max Guild garden or jump for joy if you have already unfurled them all.",
      "Robot of Sherwood - Pickpocket a Trahaearn elf while wearing the Trahaearn exoskeleton set.",
      "The Crested Guest is Best - Visit Seren and bow or curtsy whilst wearing the Crest of Seren.",
      "Ace of Dungeons - Complete a Daemonheim dungeon while you have one of the gorajo cards active.",
      "Weave Come a Long Way - Make a level 90 milestone cape using a loom in Prifddinas.",
      "Properly Metal - Clear wave 15 in a Gold or Platinum wave of the Rush of Blood D&D.",
      "Respect your Elders - Chop a log from an elder tree you have grown in the Prifddinas farming patch, then fletch it into a shortbow. (X/2)",
      "Xena-Phile - Sing an attuned crystal weapon from an attuned seed in the Ithell area of Prifddinas.",
      "The Expensive Range - Create a grand ranging potion in a crystal flask from nothing but raw ingredients.",
    ]
  },
  {
    area: "Underworld",
    tier: "easy",
    tasks: [
      "The One Stop Occultist's Shop - Buy something from the Lupe's Soul Supplies shop in the City of Um.",
      "Don't Lose Your Focus - Deposit a ritual focus object into the focus storage at the City of Um ritual site.",
      "A View to Die For - Find the amazing viewpoint overlooking the City of Um that will give you hours of enjoyment.",
      "Lesser Ritualist - Complete a Lesser Necroplasm ritual.",
      "I'm Ready to Believe You! - Dispel any ritual disturbance while performing a Necromancy ritual.",
      "And They Called Him Weapon Poison+++ - Kill a ghostly troll with Necromancy in the cave entrance to Trollgrav.",
      "My Skeleton Can Beat Up Your Skeleton - Have a Skeleton Warrior conjured while fighting a skeleton.",
      "A Prayer for the Dying - Talk to Selene to learn a Necromancy prayer.",
      "Damage Without Consequences - Use the Finger of Death ability while having 6 stacks of Necrosis to avoid draining any adrenaline.",
      "Poltergeist Pen Pal - Craft some regular ghostly ink while in the City of Um",
      "Nobody Tell Guthix - Craft some spirit or bone runes.",
      "Basic Soul Forgery - Upgrade a piece of Death Skull or Deathwarden equipment to tier 20.",
    ]
  },
  {
    area: "Underworld",
    tier: "medium",
    tasks: [
      "Mourning Ritual - Complete a communion ritual using a memento.",
      "A Grave Concoction - Make a Necromancy potion while in the City of Um.",
      "Command & Calcium - Use the Command Skeleton Warrior ability.",
      "Dying to Get In - Teleport to the City of Um using the City of Um Teleport incantation.",
      "Bone-a Fide Shield - Use the defensive ability Reflect while the Lesser Bone Shield incantation is active.",
      "Glyph it a Try - Use any alteration glyph in a ritual.",
      "Tis Merely a Flesh Rune - Craft some flesh runes.",
      "My Undead Can Beat Up Your Undead - Have either a Putrid Zombie or Vengeful Ghost conjured while fighting the matching creature.",
      "We All Bloat Down Here - Make an enemy apply Bloated to at least 2 targets on death.",
      "Advanced Soul Forgery - Upgrade a piece of Death Skull or Deathwarden equipment to tier 50.",
    ]
  },
  {
    area: "Underworld",
    tier: "hard",
    tasks: [
      "Ghost Hunter - Catch a ghostly impling while wearing a full set of ghostly robes.",
      "A Fungal Fun Ghoul - Spin some fungal bowstring at the spinning wheel in the City of Um.",
      "Isn't Mushroom Down Here - Plant some morchella mushrooms in the City of Um.",
      "Do You Like Jazz? - Rest whilst listening to the Dead Beats in the City of Um.",
      "Food for the Sole - Catch and cook a ghostly sole in the City of Um.",
      "Necro Necronium - Smelt a necronium bar at the smithy in the City of Um.",
      "My, My, Miasma - Craft some miasma runes.",
      "Passing the Test - Create a passing bracelet, performing each step in the City of Um.",
      "Volley Ghoul - Hit an enemy with Volley of Souls with at least 3 residual soul stacks within the City of Um.",
    ]
  },
  {
    area: "Underworld",
    tier: "elite",
    tasks: [
      "Undead to Rites - Teleport to the Ungael ritual site using the Ungael Teleport incantation.",
      "B.Y.O.B. - Make an overload potion within The Last Call in the City of Um.",
      "Down with the Disturbances - Dispel 6 ritual disturbances within a single ritual.",
      "He's My Berry Pie - Give a blueberry pie to Thalmund in the City of Um.",
      "A Sorrow State of Affairs - Activate the Sorrow prayer over the River Noumenon.",
      "Fetch Me Their Souls - Craft a soul rune at the soul altar with a soul cape equipped.",
      "A Game of Cat and Amascut - Speak to Mekhat within the Sanctum of Rebirth.",
      "Owl Be Seeing You - Track 8 of the owls in the City of Um.",
    ]
  },
  {
    area: "Varrock",
    tier: "easy",
    tasks: [
      "Strike a Pose - Have Thessalia show outfits.",
      "Essential Facilitator - Aubury teleports you to essence mine.",
      "Doing the Ironing - Mine iron ore SW of Varrock.",
      "Plank You Very Much - Make plank at Fort Forinthry.",
      "Making Learning Fun! - Enter level 2 of Stronghold of Security.",
      "Jumping-off Point - Jump fence south of Varrock.",
      "No Good to Me Alive - Chop dead tree SE Varrock wall.",
      "Read All About It - Buy Varrock Herald.",
      "Dog and Bone - Give a bone to a stray dog.",
      "Pot Stop - Make & fire a bowl in Barbarian Village.",
      "On the Ragged Edge - Enter Edgeville Dungeon.",
      "Relocation, Relocation, Relocation - Move POH portal.",
      "It Belongs in a Museum - Speak to Haig Halen with 50 Kudos.",
      "Journey to the Centre of the Earth Altar - Enter Earth altar.",
      "Jackanory - Get story from Elsie.",
      "Limey - Mine limestone near Paterdomus.",
      "Sherpa's Delight - Catch trout east of Barbarian Village.",
      "King of the Castle - Find highest point in Varrock.",
      "Stick the Knife In - Enter cobweb corridor in sewers.",
    ]
  },
  {
    area: "Varrock",
    tier: "medium",
    tasks: [
      "Double-strength Weaksauce - Apothecary makes strength potion.",
      "Champion! - Enter Champions' Guild.",
      "What Lies Below? - Use Dagon-hai shortcut.",
      "With a Ten-foot Pole - Fill rat pole.",
      "Can't Make an Omelette - Escape Varrock spider lair.",
      "Point of En-tree - Use spirit tree GE.",
      "Unlocking Your Emotions - Perform SOS emotes.",
      "A Lick of Paint - Choose kitten colour.",
      "For Fast Transactions - Use shortcut NW of GE.",
      "You Wouldn't Like Me When I'm Angry - Enter A Soul's Bane.",
      "Return to Senntisten - Use Dig Site pendant.",
      "Promised the Earth - Enchant earth tiara.",
      "Royale With Thieve - Pickpocket palace guard.",
      "Like a Varrocket - Cast Varrock Teleport.",
      "Challenge Vannaka - Get Slayer task from Vannaka.",
      "My Fort Smells of Syrup - Make maple plank at Fort.",
      "Master Scrumper - Pick fruit from White Tree.",
      "Engage - Balloon travel from Varrock.",
      "Faster, Pussycat! Kill! Kill! - Get cat training medal.",
      "Dial V For Varrock - Use fairy ring west of Varrock.",
      "The Body Shop - Browse Oziach's armour.",
    ]
  },
  {
    area: "Varrock",
    tier: "hard",
    tasks: [
      "Burning Bush - Pick poison ivy in Varrock.",
      "Security Isn't a Dirty Word - Use crevice by moss giants.",
      "Lighten Up - Trade for spottier cape.",
      "Put Your Smithing Hat On - Smith adamant med helm by Aubury.",
      "Kudos on the Kudos! - Speak to apprentice at 153 Kudos.",
      "Who Ate All the Pie? - Give Romily a wild pie.",
      "Battle of the Elements - Craft air battlestaff.",
      "Intersceptre - Use skull sceptre teleport.",
      "Changing Rooms - Upgrade POH appearance.",
      "Keeping Tabs on Varrock - Make Varrock teletab.",
      "Hand-Me-Downs - Get new Family Crest gauntlets.",
      "Waka-Waka-Waka - Make waka canoe near Edgeville.",
      "Living on the Edge - Ancient Home Teleport to Edgeville.",
    ]
  },
  {
    area: "Varrock",
    tier: "elite",
    tasks: [
      "Stick a Bork In Him, He's Done - Defeat Bork.",
      "Nomadness - Swap Soul Wars cape.",
      "Arborehole - Chop magic tree in sewers resource dungeon.",
      "It All Adze Up - Incinerate log in palace patch.",
      "Mind Your Back - Dagon'hai mind control backfires.",
      "Red, Red Pies of Summer - Bake summer pie in Cooking Guild.",
      "Splitting Headache - Kill skeleton at Senntisten with Soul Split.",
      "A Bolt from the Blue - Make 10 rune bolts in Varrock.",
      "A Ton of Earth - Craft 100 earth runes without aids.",
    ]
  },
  {
    area: "Wilderness",
    tier: "easy",
    tasks: [
      "Highway to the Danger Zone! - Enter the Wilderness by any means.",
      "Chaosteo - Offer some bones on the Chaos Altar in level 12 Wilderness.",
      "Taking the Subway - Enter the chaos tunnels from an entrance in the Wilderness.",
      "Take a Potato Chip...and Eat it! - View the recent wilderness kills on the death list noticeboard in Edgeville.",
      "Hold My Beer While I PK This Guy - View your bank in the Wilderness via one of the Wilderness cape sellers.",
      "Ten-uous Link - Reach a score of 10 using the strange switches in the Wilderness.",
      "Unlocked and Loded - Teleport to the lodestone in the Wilderness.",
      "Ex-posing Yourself - Find out about the history of the Wilderness from Vala.",
    ]
  },
  {
    area: "Wilderness",
    tier: "medium",
    tasks: [
      "Don't Axe for Permission - Loot a chest in the magic axe hut in the deep Wilderness.",
      "Filthy Rich - Open the chest in the Lava Maze with a muddy key.",
      "Hardcore Parkour - Complete a full lap of the Wilderness agility course.",
      "Liquid Luck - Create a luck potion from scratch whilst in the Wilderness.",
      "Notatrivialtask - Persuade Noterazzo in the Bandit Camp to show you his goods.",
      "A Barrel of Staffs - Purchase a God staff from the Chamber guardian in the Mage Arena.",
      "A Pizza the Loot - Create an anchovy pizza from scratch in the Bandit Camp and give it to Fat Tony. (X/5)",
      "Wet and Wildy - Use a waka canoe to travel to the Wilderness.",
      "I'm Just Bor-rogue-ing it - Pickpocket a rogue in Rogues' Castle.",
      "Doyouthinkhesaurus - Catch a Black Salamander near the Boneyard.",
    ]
  },
  {
    area: "Wilderness",
    tier: "hard",
    tasks: [
      "Nerves of Stele - Activate and teleport from each of the Wilderness teleport obelisks.",
      "Contract Killer - Complete one of Erskine's Wilderness slayer contracts.",
      "pUrE a ChAoS oF cOrPsE! - Defeat the Chaos Elemental, dealing the most damage.",
      "What Potion? - Make a Camouflage potion whilst in the Wilderness from scratch.",
      "There's Magic in the Air - Charge an orb at the obelisk of air.",
      "I'm the King of the Wild! - Non-ironman: Defeat the King Black Dragon with the Wilderness entrance's buff, dealing the most damage. Ironman: Defeat an instanced King Black Dragon after entering via the Wilderness artefact.",
      "The Root of the Problem - Harvest a Limpwurt Root from the Farming patch in the Western Ruins.",
      "Cement His Torment - Defeat a Tormented wraith.",
    ]
  },
  {
    area: "Wilderness",
    tier: "elite",
    tasks: [
      "Camping is in Tents - Non-ironman: Loot supplies from a Wilderness Warbands camp. Ironman: Check a warband camp for supplies.",
      "Lava Palava - Defeat a lava strykewyrm.",
      "Rev-enge! - Defeat one of each revenant creature in the Forinthry dungeon.",
      "Harming Moths - Capture a charming moth.",
      "Come At Me, Bro! - Create an aggression potion from scratch whilst in the Wilderness.",
      "Smooth Bakriminel - Create some bakriminel bolts from scratch in the Wilderness.",
    ]
  },
];

export const areaAchievementTaskSets: AreaAchievementTaskSet[] = areaAchievementTaskSource.map((entry) => ({
  ...entry,
  id: `${entry.tier}-${slugify(entry.area)}`,
  total: entry.tasks.length
}));

export const diarySets: DiarySet[] = [
  { id: "beginner-lumbridge", area: "Lumbridge", tier: "beginner", name: "Lumbridge Set Tasks - Beginner", description: "Given by Explorer Jack in Lumbridge for completing all Beginner Tasks in Lumbridge.", members: false, points: 5 },
  { id: "easy-lumbridge", area: "Lumbridge", tier: "easy", name: "Lumbridge Set Tasks - Easy", description: "Given by Bob, the axe seller in Lumbridge, for completing all Easy Tasks in Lumbridge.", members: false, points: 5 },
  { id: "easy-varrock", area: "Varrock", tier: "easy", name: "Varrock Set Tasks - Easy", description: "Given by Rat Burgiss south of Varrock for completing all Easy Tasks in Varrock.", members: true, points: 5 },
  { id: "easy-falador", area: "Falador", tier: "easy", name: "Falador Set Tasks - Easy", description: "Given by Redbeard Frank in Port Sarim for completing all Easy Tasks in Falador.", members: true, points: 5 },
  { id: "easy-desert", area: "Desert", tier: "easy", name: "Desert Set Tasks - Easy", description: "Given by Grand Vizier Hassan in either Al Kharid Palace or Menaphos Merchant District for completing all Easy Tasks in the Kharidian desert.", members: true, points: 5 },
  { id: "easy-morytania", area: "Morytania", tier: "easy", name: "Morytania Set Tasks - Easy", description: "Given by Hiylik Myna, east of Paterdomus, for completing all Easy Tasks in Morytania.", members: true, points: 5 },
  { id: "easy-karamja", area: "Karamja", tier: "easy", name: "Karamja Set Tasks - Easy", description: "Given by Pirate Jackie the Fruit outside Brimhaven Agility Arena for completing all Easy Tasks in Karamja.", members: true, points: 5 },
  { id: "easy-seers-village", area: "Seers' Village", tier: "easy", name: "Seers' Village Set Tasks - Easy", description: "Given by any seer in Seers' Village for completing all Easy Tasks in Seers' Village.", members: true, points: 5 },
  { id: "easy-fremennik", area: "Fremennik", tier: "easy", name: "Fremennik Set Tasks - Easy", description: "Given by the council workman on the bridge south of Rellekka for completing all Easy Tasks in the Fremennik Province.", members: true, points: 5 },
  { id: "easy-ardougne", area: "Ardougne", tier: "easy", name: "Ardougne Set Tasks - Easy", description: "Given by Doctor Orbon in Ardougne Church for completing all Easy Tasks in Ardougne.", members: true, points: 5 },
  { id: "easy-tirannwn", area: "Tirannwn", tier: "easy", name: "Tirannwn Set Tasks - Easy", description: "Given by the elf tracker near the Tirannwn lodestone for completing all Easy Tasks in Tirannwn.", members: true, points: 5 },
  { id: "easy-daemonheim", area: "Daemonheim", tier: "easy", name: "Daemonheim Set Tasks - Easy", description: "Given by Drangund, the Dungeoneering Tutor, in the camp for completing all Easy Tasks in Daemonheim.", members: true, points: 5 },
  { id: "easy-wilderness", area: "Wilderness", tier: "easy", name: "Wilderness Set Tasks - Easy", description: "Given by Mr Ex, north of Edgeville bank, for completing all Easy Tasks in the Wilderness.", members: true, points: 5 },
  { id: "easy-underworld", area: "Underworld", tier: "easy", name: "Underworld Set Tasks - Easy", description: "Given by Icthlarin, near the ritual site in the City of Um, for completing all Easy Tasks in the Underworld.", members: true, points: 5 },
  { id: "medium-lumbridge", area: "Lumbridge", tier: "medium", name: "Lumbridge Set Tasks - Medium", description: "Given by Ned in Draynor Village for completing all Medium Tasks in Lumbridge.", members: false, points: 10 },
  { id: "medium-varrock", area: "Varrock", tier: "medium", name: "Varrock Set Tasks - Medium", description: "Given by Reldo in Varrock Palace's library for completing all Medium Tasks in Varrock.", members: true, points: 10 },
  { id: "medium-falador", area: "Falador", tier: "medium", name: "Falador Set Tasks - Medium", description: "Given by the chemist in Rimmington for completing all Medium Tasks in Falador.", members: true, points: 10 },
  { id: "medium-desert", area: "Desert", tier: "medium", name: "Desert Set Tasks - Medium", description: "Given by Zahur in Nardah for completing all Medium Tasks in the Kharidian desert.", members: true, points: 10 },
  { id: "medium-morytania", area: "Morytania", tier: "medium", name: "Morytania Set Tasks - Medium", description: "Given by Robin, in Port Phasmatys, for completing all Medium Tasks in Morytania.", members: true, points: 10 },
  { id: "medium-karamja", area: "Karamja", tier: "medium", name: "Karamja Set Tasks - Medium", description: "Given by Kaleb Paramaya in Shilo Village for completing all Medium Tasks in Karamja.", members: true, points: 10 },
  { id: "medium-seers-village", area: "Seers' Village", tier: "medium", name: "Seers' Village Set Tasks - Medium", description: "Given by Stankers at the coal mine west of Seers' Village for completing all Medium Tasks in Seers' Village.", members: true, points: 10 },
  { id: "medium-fremennik", area: "Fremennik", tier: "medium", name: "Fremennik Set Tasks - Medium", description: "Given by Yrsa in Rellekka for completing all Medium Tasks in the Fremennik Province.", members: true, points: 10 },
  { id: "medium-ardougne", area: "Ardougne", tier: "medium", name: "Ardougne Set Tasks - Medium", description: "Given by the town crier in East Ardougne's market for completing all Medium Tasks in Ardougne.", members: true, points: 10 },
  { id: "medium-tirannwn", area: "Tirannwn", tier: "medium", name: "Tirannwn Set Tasks - Medium", description: "Given by Gwir in Lletya for completing all Medium Tasks in Tirannwn.", members: true, points: 10 },
  { id: "medium-daemonheim", area: "Daemonheim", tier: "medium", name: "Daemonheim Set Tasks - Medium", description: "Given by Marmaros, the Rewards Trader, in the camp for completing all Medium Tasks in Daemonheim.", members: true, points: 10 },
  { id: "medium-wilderness", area: "Wilderness", tier: "medium", name: "Wilderness Set Tasks - Medium", description: "Given by Mandrith, near the Pirates' Hideout in the Wilderness, for completing all Medium Tasks in the Wilderness.", members: true, points: 10 },
  { id: "medium-underworld", area: "Underworld", tier: "medium", name: "Underworld Set Tasks - Medium", description: "Given by Frank, east of the main plaza in Um, for completing all Medium Tasks in the Underworld.", members: true, points: 10 },
  { id: "hard-lumbridge", area: "Lumbridge", tier: "hard", name: "Lumbridge Set Tasks - Hard", description: "Given by Ned in Draynor Village for completing all Hard Tasks in Lumbridge.", members: false, points: 15 },
  { id: "hard-varrock", area: "Varrock", tier: "hard", name: "Varrock Set Tasks - Hard", description: "Given by Vannaka in Edgeville for completing all Hard Tasks in Varrock.", members: true, points: 15 },
  { id: "hard-falador", area: "Falador", tier: "hard", name: "Falador Set Tasks - Hard", description: "Given by Sir Vyvin's squire in Falador Castle for completing all Hard Tasks in Falador.", members: true, points: 15 },
  { id: "hard-desert", area: "Desert", tier: "hard", name: "Desert Set Tasks - Hard", description: "Given by Hakeem the Mayor in Pollnivneach for completing all Hard Tasks in the Kharidian desert.", members: true, points: 15 },
  { id: "hard-morytania", area: "Morytania", tier: "hard", name: "Morytania Set Tasks - Hard", description: "Given by the Strange Old Man, at the Barrows, for completing all Hard Tasks in Morytania.", members: true, points: 15 },
  { id: "hard-karamja", area: "Karamja", tier: "hard", name: "Karamja Set Tasks - Hard", description: "Given by any jungle forester north of Kharazi Jungle for completing all Hard Tasks in Karamja.", members: true, points: 15 },
  { id: "hard-seers-village", area: "Seers' Village", tier: "hard", name: "Seers' Village Set Tasks - Hard", description: "Given by Sir Kay in Camelot Castle for completing all Hard Tasks in Seers' Village.", members: true, points: 15 },
  { id: "hard-fremennik", area: "Fremennik", tier: "hard", name: "Fremennik Set Tasks - Hard", description: "Given by Advisor Ghrim in Miscellania for completing all Hard Tasks in the Fremennik Province.", members: true, points: 15 },
  { id: "hard-ardougne", area: "Ardougne", tier: "hard", name: "Ardougne Set Tasks - Hard", description: "Given by Aleck in Yanille for completing all Hard Tasks in Ardougne.", members: true, points: 15 },
  { id: "hard-tirannwn", area: "Tirannwn", tier: "hard", name: "Tirannwn Set Tasks - Hard", description: "Given by Arianwyn in the Cadarn district for completing all Hard Tasks in Tirannwn.", members: true, points: 15 },
  { id: "hard-daemonheim", area: "Daemonheim", tier: "hard", name: "Daemonheim Set Tasks - Hard", description: "Given by Talsar in the camp for completing all Hard Tasks in Daemonheim.", members: true, points: 15 },
  { id: "hard-wilderness", area: "Wilderness", tier: "hard", name: "Wilderness Set Tasks - Hard", description: "Given by Quercus, at the ditch north of the Grand Exchange, for completing all Hard Tasks in the Wilderness.", members: true, points: 15 },
  { id: "hard-underworld", area: "Underworld", tier: "hard", name: "Underworld Set Tasks - Hard", description: "Given by Kili, by the smithy in Um, for completing all Hard Tasks in the Underworld.", members: true, points: 15 },
  { id: "elite-varrock", area: "Varrock", tier: "elite", name: "Varrock Set Tasks - Elite", description: "Given by Vannaka in Edgeville for completing all Elite Tasks in Varrock.", members: true, points: 25 },
  { id: "elite-falador", area: "Falador", tier: "elite", name: "Falador Set Tasks - Elite", description: "Given by Sir Vyvin's squire in Falador Castle for completing all Elite Tasks in Falador.", members: true, points: 25 },
  { id: "elite-desert", area: "Desert", tier: "elite", name: "Desert Set Tasks - Elite", description: "Given by the Golem in Uzer for completing all Elite Tasks in the Kharidian desert.", members: true, points: 25 },
  { id: "elite-morytania", area: "Morytania", tier: "elite", name: "Morytania Set Tasks - Elite", description: "Given by Old Man Ral, in Meiyerditch, for completing all Elite Tasks in Morytania.", members: true, points: 25 },
  { id: "elite-karamja", area: "Karamja", tier: "elite", name: "Karamja Set Tasks - Elite", description: "Given by any jungle forester north of Kharazi Jungle for completing all Elite Tasks in Karamja.", members: true, points: 25 },
  { id: "elite-seers-village", area: "Seers' Village", tier: "elite", name: "Seers' Village Set Tasks - Elite", description: "Given by Sir Kay in Camelot Castle for completing all Elite Tasks in Seers' Village.", members: true, points: 25 },
  { id: "elite-fremennik", area: "Fremennik", tier: "elite", name: "Fremennik Set Tasks - Elite", description: "Given by Advisor Ghrim in Miscellania for completing all Elite Tasks in the Fremennik Province.", members: true, points: 25 },
  { id: "elite-ardougne", area: "Ardougne", tier: "elite", name: "Ardougne Set Tasks - Elite", description: "Given by Aleck in Yanille for completing all Elite Tasks in Ardougne.", members: true, points: 25 },
  { id: "elite-tirannwn", area: "Tirannwn", tier: "elite", name: "Tirannwn Set Tasks - Elite", description: "Given by Elen at the Max Guild for completing all Elite Tasks in Tirannwn.", members: true, points: 25 },
  { id: "elite-daemonheim", area: "Daemonheim", tier: "elite", name: "Daemonheim Set Tasks - Elite", description: "Given by Thok in the camp for completing all Elite Tasks in Daemonheim.", members: true, points: 25 },
  { id: "elite-wilderness", area: "Wilderness", tier: "elite", name: "Wilderness Set Tasks - Elite", description: "Given by Kolodion, in the Mage Arena bank, for completing all Elite Tasks in the Wilderness.", members: true, points: 25 },
  { id: "elite-underworld", area: "Underworld", tier: "elite", name: "Underworld Set Tasks - Elite", description: "Given by Crunchy, in The Last Call in Um, for completing all Elite Tasks in the Underworld.", members: true, points: 25 },
  { id: "task-master", area: "All", tier: "elite", name: "Task Master", description: "Complete all the listed area achievement sets.", members: true, points: 0 }
];

// Normalize ids to slug form if needed
for (const entry of diarySets) {
  const expected = `${entry.tier}-${slugify(entry.area)}`;
  if (entry.id !== expected) {
    entry.id = expected;
  }
}

export const diaryRequirements: DiaryRequirement[] = [
  {
    id: "beginner-lumbridge",
    skills: [],
    quests: ["The Restless Ghost"],
    items: ["Empty pot", "Bucket of water", "Clay", "Wheat", "Raw shrimps"],
    notes: "Beginner Lumbridge diary; tool-belt items omitted."
  },
  {
    id: "easy-lumbridge",
    skills: [
      { skill: "Mining", level: 10 },
      { skill: "Fishing", level: 25 },
      { skill: "Smithing", level: 20 },
      { skill: "Runecrafting", level: 5 },
      { skill: "Crafting", level: 4 }
    ],
    quests: ["The Restless Ghost"],
    items: [
      "Clay or soft clay",
      "Fishing bait",
      "Iron ore",
      "Coal",
      "Plain clay ring",
      "Bucket of water",
      "Water tiara/talisman or access to Water Altar",
      "Pure/rune essence",
      "Weapon for zombie/rat",
      "Ghostspeak amulet"
    ],
    notes: "20 Mining/20 Smithing/23 Crafting only if mind tiara not already owned."
  },
  {
    id: "medium-lumbridge",
    skills: [
      { skill: "Smithing", level: 20 },
      { skill: "Magic", level: 31 },
      { skill: "Firemaking", level: 30 },
      { skill: "Cooking", level: 40 },
      { skill: "Woodcutting", level: 20 },
      { skill: "Crafting", level: 16 },
      { skill: "Fishing", level: 30 },
      { skill: "Mining", level: 20 }
    ],
    quests: ["Cook's Assistant", "Dragon Slayer (started)", "The Restless Ghost"],
    items: [
      "2 unnoted steel bars",
      "3 air runes or air staff",
      "1 earth rune/staff",
      "1 law rune",
      "Raw lobster",
      "Silver ore",
      "5 feathers",
      "11 willow logs",
      "Cowhide or pot of flour or raw beef",
      "Holy mould"
    ],
    notes: "Magic staff can cover air/earth; willow logs for bow/cooking steps."
  },
  {
    id: "hard-lumbridge",
    skills: [
      { skill: "Smithing", level: 68 },
      { skill: "Magic", level: 71 },
      { skill: "Hunter", level: 59 },
      { skill: "Combat", level: 63 },
      { skill: "Slayer", level: 59 },
      { skill: "Woodcutting", level: 72 },
      { skill: "Farming", level: 57 },
      { skill: "Agility", level: 57 },
      { skill: "Herblore", level: 45 },
      { skill: "Music", level: 500 }
    ],
    quests: ["Back to my Roots", "Catapult Construction", "Legends' Quest", "Lunar Diplomacy", "Monkey Madness", "Tower of Life", "Watchtower"],
    items: [
      "Raw cave eel",
      "Giant frog legs",
      "Slash weapon or knife",
      "Hatchet with slash",
      "Grown jade vine",
      "Papaya or palm tree grown",
      "Small fishing net",
      "Rope",
      "Karamja monkey greegree",
      "Combat bracelet or skills necklace",
      "8 earth + 3 law + 2 astral + 2 water runes",
      "Gloves of silence",
      "Lockpick/hairclip",
      "Dragonstone bracelet (or drop)"
    ],
    notes: "Craft dragonstone bracelet only if not obtained as drop; music tracks for Shilo slip."
  },
  {
    id: "easy-ardougne",
    skills: [
      { skill: "Fishing", level: 15 },
      { skill: "Thieving", level: 16 },
      { skill: "Construction", level: 10 }
    ],
    quests: ["Biohazard", "Gertrude's Cat", "Monk's Friend", "Plague City", "Tower of Life"],
    items: [
      "~350 coins",
      "Silk or vial of stench",
      "Full or overgrown cat",
      "Unicorn horn",
      "Cowhide",
      "Ring of duelling",
      "Weapon/Ardougne teleports"
    ],
    notes: "27 Crafting/27 Magic/40 Smithing only needed if no emerald ring/ring of duelling drop."
  },
  {
    id: "medium-ardougne",
    skills: [
      { skill: "Mining", level: 46 },
      { skill: "Strength", level: 38 },
      { skill: "Agility", level: 39 },
      { skill: "Fishing", level: 31 },
      { skill: "Thieving", level: 28 },
      { skill: "Firemaking", level: 50 },
      { skill: "Magic", level: 51 },
      { skill: "Farming", level: 49 },
      { skill: "Herblore", level: 57 }
    ],
    quests: [
      "A Fairy Tale II - Cure a Queen (partial)",
      "Kennith's Concerns",
      "Meeting History",
      "Plague City",
      "Sea Slug",
      "The Hand in the Sand",
      "Tower of Life"
    ],
    items: [
      "Raw swordfish",
      "Raw chicken",
      "2 law + 2 water runes with staff (Ardougne teleport)",
      "Lunar or Dramen staff",
      "Pure essence",
      "Watermelon seeds (or curry leaves for safety)",
      "Mithril grapple + crossbow",
      "Enchanted key",
      "Yew logs (if Castle Wars balloon not unlocked)"
    ],
    notes: "Mithril grapple not required if dropped; balloon unlock removes yew log need."
  },
  {
    id: "hard-ardougne",
    skills: [
      { skill: "Thieving", level: 50 },
      { skill: "Magic", level: 71 },
      { skill: "Hunter", level: 59 },
      { skill: "Combat", level: 63 },
      { skill: "Slayer", level: 59 },
      { skill: "Woodcutting", level: 72 },
      { skill: "Farming", level: 57 },
      { skill: "Agility", level: 57 },
      { skill: "Herblore", level: 45 },
      { skill: "Music", level: 500 }
    ],
    quests: ["Back to my Roots", "Catapult Construction", "Legends' Quest", "Lunar Diplomacy", "Monkey Madness", "Tower of Life", "Watchtower"],
    items: [
      "Raw cave eel",
      "Giant frog legs",
      "Slash weapon",
      "Monkey greegree",
      "Papaya/palm tree grown",
      "Small fishing net",
      "Rope",
      "Combat bracelet/skills necklace",
      "8 earth + 3 law + 2 astral + 2 water",
      "Gloves of silence",
      "Lockpick/hairclip",
      "Hatchet (slash)"
    ],
    notes: "Crafting only if bracelet not dropped."
  },
  {
    id: "elite-ardougne",
    skills: [
      { skill: "Smithing", level: 50 },
      { skill: "Fishing", level: 81, boostable: true },
      { skill: "Thieving", level: 82 },
      { skill: "Crafting", level: 100 },
      { skill: "Fletching", level: 69 },
      { skill: "Runecrafting", level: 75 },
      { skill: "Summoning", level: 93 }
    ],
    quests: [],
    items: [
      "Pure essence (for abyssal titan store)",
      "Giant pouch",
      "Lockpick/hairclip",
      "Rune bar",
      "2 yew logs",
      "Raw beef or bear meat",
      "Abyssal titan pouch",
      "Fishing trawler equipment"
    ],
    notes: "Fishing 90 if catching rocktail yourself; lower if purchasing."
  },
  {
    id: "easy-daemonheim",
    skills: [
      { skill: "Dungeoneering", level: 23 },
      { skill: "Smithing", level: 7, boostable: true },
      { skill: "Crafting", level: 8, boostable: true },
      { skill: "Divination", level: 10 }
    ],
    quests: [],
    items: [],
    notes: "All required items can be obtained within Daemonheim."
  },
  {
    id: "medium-daemonheim",
    skills: [
      { skill: "Divination", level: 45, boostable: true },
      { skill: "Fletching", level: 43, boostable: true },
      { skill: "Thieving", level: 40, boostable: true },
      { skill: "Hunter", level: 40, boostable: true },
      { skill: "Farming", level: 40, boostable: true },
      { skill: "Herblore", level: 36, boostable: true },
      { skill: "Dungeoneering", level: 35, boostable: true },
      { skill: "Magic", level: 32, boostable: true },
      { skill: "Attack", level: 30, boostable: true },
      { skill: "Ranged", level: 30, boostable: true }
    ],
    quests: ["Waterfall Quest"],
    items: [],
    notes: "All items obtainable in Daemonheim; Marm's Armory handled separately."
  },
  {
    id: "hard-daemonheim",
    skills: [
      { skill: "Construction", level: 75 },
      { skill: "Strength", level: 75 },
      { skill: "Farming", level: 68 },
      { skill: "Dungeoneering", level: 71, boostable: true },
      { skill: "Divination", level: 70, boostable: true },
      { skill: "Cooking", level: 69 },
      { skill: "Prayer", level: 65 },
      { skill: "Attack", level: 60 },
      { skill: "Agility", level: 55 },
      { skill: "Runecrafting", level: 54, boostable: true },
      { skill: "Magic", level: 30 },
      { skill: "Ranged", level: 30 },
      { skill: "Smithing", level: 74, boostable: true },
      { skill: "Thieving", level: 74, boostable: true },
      { skill: "Defence", level: 76, boostable: true },
      { skill: "Summoning", level: 65, boostable: true },
      { skill: "Slayer", level: 61, boostable: true }
    ],
    quests: ["Salt in the Wound", "A Clockwork Syringe"],
    items: [],
    notes: "All required items save ring of kinship can be obtained within Daemonheim."
  },
  {
    id: "easy-falador",
    skills: [
      { skill: "Defence", level: 25 },
      { skill: "Construction", level: 16 }
    ],
    quests: [],
    items: [
      "1,650 coins",
      "Spade",
      "Tinderbox",
      "Cheese",
      "Bucket",
      "Ranged/Magic weapon or halberd (duck)",
      "Mind talisman",
      "Tiara",
      "Runes for elemental spell",
      "Magical weapon for elemental spell"
    ],
    notes: "20 Mining/20 Smithing/23 Crafting only if mind tiara not already owned."
  },
  {
    id: "medium-falador",
    skills: [
      { skill: "Prayer", level: 10 },
      { skill: "Mining", level: 9 },
      { skill: "Smithing", level: 20, boostable: true },
      { skill: "Construction", level: 36, boostable: true },
      { skill: "Thieving", level: 49, boostable: true },
      { skill: "Magic", level: 49, boostable: true },
      { skill: "Farming", level: 47, boostable: true },
      { skill: "Agility", level: 44, boostable: true },
      { skill: "Crafting", level: 36, boostable: true },
      { skill: "Firemaking", level: 37, boostable: true }
    ],
    quests: ["Wanted!", "The Knight's Sword", "Garden of Tranquillity (started)", "Gertrude's Cat"],
    items: [
      "Swamp tar",
      "Willow branches",
      "Crossbow (mith or better) and grapple OR enhanced grappling hook",
      "Bullseye lantern",
      "Sweetcorn seeds",
      "8 empty glass vials",
      "Armor for level 47 ice giant",
      "Level 30 black knight gear or better",
      "Cat"
    ],
    notes: "30 Farming not required if willow branches from Spirit implings; 59 Fletching/30 Smithing not required if mith grapple dropped."
  },
  {
    id: "hard-falador",
    skills: [
      { skill: "Construction", level: 16 },
      { skill: "Defence", level: 30 },
      { skill: "Runecrafting", level: 56 },
      { skill: "Summoning", level: 56 },
      { skill: "Mining", level: 60 },
      { skill: "Prayer", level: 70 },
      { skill: "Slayer", level: 72 },
      { skill: "Farming", level: 60 },
      { skill: "Woodcutting", level: 70 }
    ],
    quests: ["A Fairy Tale II - Cure a Queen (started)", "The Slug Menace", "The Hand in the Sand"],
    items: [
      "Spade",
      "Lunar or Dramen staff (or wicked hood with runes)",
      "28/25 essence",
      "Cape",
      "Fishing explosive",
      "Ibis pouch",
      "5,020 coins and pink dye",
      "Skeletal Wyvern gear",
      "Yew or magic sapling (protect with cactus spines)"
    ],
    notes: "Mind altar access via omni/tiara/talisman; lore activity Morytania for Mogre."
  },
  {
    id: "medium-desert",
    skills: [
      { skill: "Prayer", level: 43 },
      { skill: "Defence", level: 35 },
      { skill: "Woodcutting", level: 30 },
      { skill: "Summoning", level: 25 },
      { skill: "Mining", level: 30 },
      { skill: "Crafting", level: 33 },
      { skill: "Farming", level: 49 },
      { skill: "Herblore", level: 30 },
      { skill: "Agility", level: 37 },
      { skill: "Ranged", level: 19 },
      { skill: "Strength", level: 19 }
    ],
    quests: ["Eagles' Peak", "The Feud", "Spirits of the Elid", "A Fairy Tale II - Cure a Queen (started)", "Missing My Mummy"],
    items: [
      "Crossbow (or Lumbridge hidey-hole unlock)",
      "Mithril grapple",
      "Dramen staff (for fairy rings)",
      "Pyramid top (walkthrough)",
      "Mortar and pestle",
      "Clean harralander",
      "Pouch (Summoning)",
      "51 spirit shards",
      "Blue charm",
      "Potato cactus",
      "Rope",
      "Optional dye items (snake skins, wolf furs, sheep shears)",
      "1 mithril bar, 1 mithril bolt, 1 rope (for optional grapple drop)"
    ],
    notes: "30 Fletching/30 Smithing not needed if grapple dropped; items exclude tool belt."
  },
  {
    id: "medium-karamja",
    skills: [
      { skill: "Agility", level: 40 },
      { skill: "Woodcutting", level: 50 },
      { skill: "Cooking", level: 46 },
      { skill: "Fishing", level: 65, boostable: true },
      { skill: "Farming", level: 27 },
      { skill: "Attack", level: 40 },
      { skill: "Strength", level: 50 },
      { skill: "Mining", level: 40 },
      { skill: "Slayer", level: 40 }
    ],
    quests: ["Jungle Potion", "Tai Bwo Wannai Trio", "Shilo Village", "Dragon Slayer"],
    items: [
      "1,085+ Tai Bwo Wannai cleanup favour (trading sticks)",
      "Spider carcass",
      "Arctic pine logs",
      "Antipoison",
      "Food",
      "One-click teleport",
      "Jade/Red topaz (3 total)",
      "Gout tuber",
      "Plant pot",
      "100-1200 trading sticks",
      "Teasing stick",
      "Logs",
      "Machete"
    ],
    notes: "Easier with Tai Bwo favor; minigame gear suggested."
  },
  {
    id: "hard-karamja",
    skills: [
      { skill: "Combat", level: 100 },
      { skill: "Runecrafting", level: 44, boostable: true },
      { skill: "Strength", level: 40 },
      { skill: "Agility", level: 53 },
      { skill: "Cooking", level: 30 },
      { skill: "Woodcutting", level: 34 },
      { skill: "Ranged", level: 42 },
      { skill: "Slayer", level: 50 },
      { skill: "Thieving", level: 50 },
      { skill: "Mining", level: 52 },
      { skill: "Fishing", level: 65, boostable: true }
    ],
    quests: ["Legend's Quest", "Rune Mysteries", "Tai Bwo Wannai Trio", "Shilo Village"],
    items: [
      "High combat gear",
      "Oomlie wrap",
      "Nature talisman/tiara/staff",
      "Omni talisman/tiara/staff or wicked hood",
      "Pure essence",
      "Raw karambwan",
      "Lockpick",
      "Mithril crossbow (or better)",
      "Mithril grapple",
      "Anti-dragon shield and antifire potions",
      "Palm leaf (for ironmen)"
    ],
    notes: "Fishing 65 for karambwan if caught; fishing boost acceptable."
  },
  {
    id: "elite-karamja",
    skills: [
      { skill: "Runecrafting", level: 91, boostable: true },
      { skill: "Summoning", level: 95 },
      { skill: "Hunter", level: 27 },
      { skill: "Herblore", level: 83 },
      { skill: "Cooking", level: 80 },
      { skill: "Agility", level: 74 },
      { skill: "Slayer", level: 50 },
      { skill: "Fishing", level: 96, boostable: true }
    ],
    quests: ["While Guthix Sleeps", "Smoking Kills", "Shilo Village"],
    items: [
      "Nature talisman/tiara/staff or wicked hood",
      "Box trap",
      "Vial of water",
      "Raw shark",
      "Chameleon (pet)",
      "Fire cape",
      "TokHaar-Kal or TzHaar requirements",
      "Super antifire (2 dose)",
      "Super ranging potion (2 dose)",
      "Balmung"
    ],
    notes: "Runecrafting boostable with abyssal titan; Fire cape/TokHaar-Kal for lava tasks."
  },
  {
    id: "easy-fremennik",
    skills: [{ skill: "Slayer", level: 10 }],
    quests: [],
    items: [
      "No runes/arrows to do Barbarian Assault tutorial",
      "Combat gear",
      "Antipoison (recommended)",
      "Games necklace (recommended)"
    ],
    notes: "Tool-belt items omitted."
  },
  {
    id: "medium-fremennik",
    skills: [
      { skill: "Hunter", level: 55, boostable: true },
      { skill: "Cooking", level: 48, boostable: true },
      { skill: "Thieving", level: 42, boostable: true },
      { skill: "Crafting", level: 33, boostable: true },
      { skill: "Defence", level: 20 }
    ],
    quests: ["The Fremennik Trials", "Partial: The Fremennik Isles", "Partial: Garden of Tranquillity", "A Fairy Tale II - Cure a Queen"],
    items: [
      "Dramen/Lunar staff (unless Fairy Tale III done)",
      "Pet rock",
      "3 molten glass",
      "Yak-hide armour (top+legs)",
      "Ring of Charos (a)",
      "Enchanted lyre",
      "Bucket of milk",
      "500 coins",
      "Teasing stick"
    ],
    notes: "Fairy rings reduce walking; milk can be bucket + cow."
  },
  {
    id: "hard-fremennik",
    skills: [
      { skill: "Magic", level: 65 },
      { skill: "Mining", level: 60 },
      { skill: "Fishing", level: 62 },
      { skill: "Woodcutting", level: 54 },
      { skill: "Crafting", level: 52 },
      { skill: "Firemaking", level: 52 },
      { skill: "Defence", level: 50 },
      { skill: "Strength", level: 35 },
      { skill: "Agility", level: 37 }
    ],
    quests: ["Bar Crawl (miniquest)", "Lunar Diplomacy", "Royal Trouble", "The Fremennik Trials"],
    items: [
      "Dagannoth-killing gear (level 74/92)",
      "Spined/rockshell/skeletal armour cost (coins shown on GE price)",
      "Arctic pine logs",
      "Runes for bake pie (1 astral, 5 fire, 4 water)",
      "Any uncooked pie",
      "Coins to pay Etceterian woodcutters",
      "Games necklace (suggested)"
    ],
    notes: "Barbarian Assault levels recommended for BA tasks."
  },
  {
    id: "elite-fremennik",
    skills: [
      { skill: "Fishing", level: 96 },
      { skill: "Slayer", level: 93 },
      { skill: "Agility", level: 90 },
      { skill: "Smithing", level: 90 },
      { skill: "Crafting", level: 85 },
      { skill: "Runecrafting", level: 82, boostable: true },
      { skill: "Herblore", level: 80 },
      { skill: "Strength", level: 76 },
      { skill: "Attack", level: 75 }
    ],
    quests: ["Lunar Diplomacy"],
    items: [
      "Agile top",
      "Full pure essence inventory",
      "Combat gear for ice strykewyrm",
      "Fire cape/TokHaar-Kal (for ice strykewyrm task)",
      "Magic logs",
      "Mangled or chewed bones",
      "Magic logs + rune bar",
      "2-dose super ranging potion + caviar",
      "Balmung"
    ],
    notes: "Magic level for catalytic anima stones if using; pure essence for runes."
  },
  {
    id: "medium-varrock",
    skills: [
      { skill: "Agility", level: 21 },
      { skill: "Combat", level: 30 },
      { skill: "Construction", level: 30 },
      { skill: "Farming", level: 45 },
      { skill: "Magic", level: 49 },
      { skill: "Prayer", level: 10 },
      { skill: "Runecrafting", level: 30 },
      { skill: "Thieving", level: 25 },
      { skill: "Mining", level: 40 },
      { skill: "Smithing", level: 30 },
      { skill: "Herblore", level: 16 },
      { skill: "Hunter", level: 1 }
    ],
    quests: [
      "Enlightened Journey",
      "A Fairy Tale I - Growing Pains",
      "A Fairy Tale II - Cure a Queen",
      "Garden of Tranquillity",
      "Gertrude's Cat",
      "Icthlarin's Little Helper",
      "Priest in Peril",
      "Ratcatchers",
      "Rune Mysteries",
      "What Lies Below"
    ],
    items: [
      "Chaos talisman or altar access",
      "Tiara",
      "Impious ashes",
      "Pure essence",
      "Monty (cat)",
      "Logs for balloon (3 charges)",
      "Dusty key",
      "Red spiders' eggs",
      "Ring of Charos (a)",
      "Hatchet",
      "3-4 fire runes",
      "Lunar staff or Dramen staff",
      "Digsite pendant or staff",
      "Tiara mould"
    ],
    notes: "Digsite pendant OR staff if Fairy Tale III not done; balloon charges require logs."
  },
  {
    id: "hard-wilderness",
    skills: [
      { skill: "Farming", level: 57 },
      { skill: "Herblore", level: 65 },
      { skill: "Magic", level: 66 },
      { skill: "Summoning", level: 60 }
    ],
    quests: ["Summer's End"],
    items: [
      "Combat gear",
      "Vial of water",
      "Grimy bloodweed",
      "Black salamander",
      "Unpowered orb",
      "30 air runes",
      "3 cosmic runes",
      "Limpwurt seed",
      "Jennica's ring",
      "Black armour (full set incl. weapon)"
    ],
    notes: "Bloodweed/salamander obtainable during task; gear must be black for revenant tasks."
  },
  {
    id: "hard-tirannwn",
    skills: [
      { skill: "Farming", level: 75 },
      { skill: "Agility", level: 77 },
      { skill: "Divination", level: 81 },
      { skill: "Herblore", level: 77 },
      { skill: "Hunter", level: 70 },
      { skill: "Ranged", level: 70 },
      { skill: "Woodcutting", level: 80, boostable: true },
      { skill: "Crafting", level: 75 },
      { skill: "Combat", level: 120 },
      { skill: "Cooking", level: 54 }
    ],
    quests: ["Bringing Home the Bacon", "Desert Treasure", "Legacy of Seergaze", "Regicide"],
    items: [
      "Moss titan/ice titan/fire titan pouch",
      "Crystal bow",
      "Crystal dagger",
      "Harmony moss (grown yourself)",
      "Juju farming potion",
      "Light creature pouch",
      "Bacon from boar",
      "Bracelet of clay",
      "Asgarnia/magic shells",
      "Cleansing crystal",
      "100 Slayer reward points"
    ],
    notes: "Some tasks require Voice of Seren rotations; see diary for timing."
  },
  {
    id: "elite-tirannwn",
    skills: [
      { skill: "Dungeoneering", level: 95 },
      { skill: "Slayer", level: 95 },
      { skill: "Thieving", level: 95 },
      { skill: "All other skills", level: 90, boostable: false }
    ],
    quests: [
      "Blood Runs Deep",
      "The Branches of Darkmeyer",
      "The Elder Kiln",
      "Plague's End",
      "Ritual of the Mahjarrat",
      "The Void Stares Back",
      "The Chosen Commander",
      "The Firemaker's Curse"
    ],
    items: [
      "Trahaearn exoskeleton set",
      "Gorajio card",
      "9 balls of wool",
      "Elder seed or planted elder tree",
      "Attuned crystal weapon seed",
      "Super ranging potion (4)",
      "Crystal attuned weapon",
      "Summoning pouches for shadow creatures"
    ],
    notes: "Requires at least one skill 99 or Quest Cape; elder tree tasks need grown elder."
  },
  {
    id: "hard-underworld",
    skills: [
      { skill: "Fletching", level: 82 },
      { skill: "Farming", level: 74 },
      { skill: "Necromancy", level: 80 },
      { skill: "Fishing", level: 66 },
      { skill: "Cooking", level: 66 },
      { skill: "Magic", level: 66 },
      { skill: "Smithing", level: 70 },
      { skill: "Runecrafting", level: 60 },
      { skill: "Crafting", level: 79 },
      { skill: "Hunter", level: 68 },
      { skill: "Mining", level: 70 },
      { skill: "Extinction", level: 70 }
    ],
    quests: ["The Curse of Zaros (miniquest)", "Kili Row", "Mycoque's Moonsong"],
    items: [
      "5 tempered fungal shaft",
      "1 morchella mushroom spore",
      "Fishing bait",
      "1 necrite ore",
      "1 phasmatite",
      "1 impure essence",
      "1 uncuts moonstone",
      "1 ensouled bar",
      "1 cosmic rune + 15 earth + 15 water (or staves)",
      "All Ghostly robe outfit",
      "Siphon and Conduit (Necromancy weapons)"
    ],
    notes: "Baitless fishing optional if baitless unlock; Necromancy gear required."
  }
];
