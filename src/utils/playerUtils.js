/**
 * MPL S4 Player Utility Module
 * Automatically scans photos/ directory using Vite import.meta.glob.
 * Extracts player numbers from filenames and categories from parent folder names.
 */

// Import all image files from photos directory
const photoModules = import.meta.glob('../../photos/**/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
});

export const CATEGORY_ORDER = ['Bowler', 'Keeper', 'Batsman', 'All-Rounder'];

export const CATEGORY_CONFIG = {
  Bowler: {
    id: 'Bowler',
    displayName: 'BOWLERS',
    singularName: 'BOWLER',
    emoji: '⚾',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-700',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    borderGlow: 'shadow-[0_0_30px_rgba(16,185,129,0.3)]',
    folderNames: ['bowler', 'bowlers']
  },
  Batsman: {
    id: 'Batsman',
    displayName: 'BATSMAN',
    singularName: 'BATSMAN',
    emoji: '🏏',
    color: 'gold',
    gradient: 'from-amber-500 to-yellow-700',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    borderGlow: 'shadow-[0_0_30px_rgba(245,158,11,0.3)]',
    folderNames: ['batsman', 'batsmen']
  },
  'All-Rounder': {
    id: 'All-Rounder',
    displayName: 'ALL-ROUNDERS',
    singularName: 'ALL-ROUNDER',
    emoji: '⚡',
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-700',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    borderGlow: 'shadow-[0_0_30px_rgba(6,182,212,0.3)]',
    folderNames: ['all-rounder', 'all-rounders', 'allrounder']
  },
  Keeper: {
    id: 'Keeper',
    displayName: 'WICKET KEEPERS',
    singularName: 'WICKET KEEPER',
    emoji: '🧤',
    color: 'pink',
    gradient: 'from-pink-500 to-rose-700',
    badgeBg: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
    borderGlow: 'shadow-[0_0_30px_rgba(236,72,153,0.3)]',
    folderNames: ['keeper', 'keepers', 'wk-batsman', 'wk-batsmen']
  }
};

/**
 * Normalizes category folder name to standard category ID
 */
function normalizeCategory(folderName) {
  const lower = folderName.toLowerCase();
  for (const categoryId of CATEGORY_ORDER) {
    const config = CATEGORY_CONFIG[categoryId];
    if (categoryId.toLowerCase() === lower || config.folderNames.includes(lower)) {
      return categoryId;
    }
  }
  return null;
}

/**
 * Parse all loaded modules into structured player dataset
 */
export function getAllPlayers() {
  const players = [];

  for (const [path, url] of Object.entries(photoModules)) {
    // path example: ../../photos/Bowler/75.png or ../../photos/Wk-Batsman/106.png
    const parts = path.split('/');
    if (parts.length < 2) continue;

    const fileName = parts[parts.length - 1]; // e.g. 75.png
    const folderName = parts[parts.length - 2]; // e.g. Bowler or Wk-Batsman

    const category = normalizeCategory(folderName);
    if (!category) continue;

    // Extract player number from filename (e.g. "75.png" -> "75", "007.jpg" -> "007")
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1) continue;

    const rawNumber = fileName.substring(0, lastDotIndex).trim();
    if (!rawNumber) continue;

    players.push({
      number: rawNumber,
      category,
      fileName,
      path: url,
      id: `${category}_${rawNumber}`
    });
  }

  return players;
}

/**
 * Get all players grouped by category
 */
export function getPlayersByCategory() {
  const all = getAllPlayers();
  const grouped = {
    Bowler: [],
    Batsman: [],
    'All-Rounder': [],
    Keeper: []
  };

  all.forEach((player) => {
    if (grouped[player.category]) {
      grouped[player.category].push(player);
    }
  });

  return grouped;
}

/**
 * Look up player by entered string number in specific category ONLY
 * Returns: { success: true, player: obj } OR { success: false, message: string, code: string }
 */
export function findPlayerByNumber(
  category,
  enteredInput,
  playerStatuses = {},
  unsoldRoundProcessed = new Set(),
  stage = 'MAIN_AUCTION'
) {
  const inputStr = String(enteredInput || '').trim();

  if (!inputStr) {
    return {
      success: false,
      code: 'EMPTY_INPUT',
      message: 'PLEASE ENTER A PLAYER NUMBER'
    };
  }

  // Validate numeric input (allow numbers, positive integer strings)
  if (!/^\d+$/.test(inputStr)) {
    return {
      success: false,
      code: 'INVALID_INPUT',
      message: 'PLEASE ENTER A VALID PLAYER NUMBER'
    };
  }

  const categoryPlayers = getPlayersByCategory()[category] || [];

  // 1. Try exact string match first (preserves leading zeros like "007")
  let matchedPlayer = categoryPlayers.find((p) => p.number === inputStr);

  // 2. Fall back to numeric match (e.g., entered "75" matches "075" or vice versa)
  if (!matchedPlayer) {
    const inputAsNum = parseInt(inputStr, 10);
    matchedPlayer = categoryPlayers.find(
      (p) => parseInt(p.number, 10) === inputAsNum
    );
  }

  const categorySingular = CATEGORY_CONFIG[category]?.singularName || category.toUpperCase();

  if (!matchedPlayer) {
    return {
      success: false,
      code: 'NOT_FOUND',
      message: `PLAYER #${inputStr} NOT FOUND IN ${categorySingular} CATEGORY`
    };
  }

  const currentStatus = playerStatuses[matchedPlayer.id];

  if (stage === 'MAIN_AUCTION') {
    if (currentStatus) {
      return {
        success: false,
        code: 'ALREADY_PROCESSED',
        player: matchedPlayer,
        message: `PLAYER #${matchedPlayer.number} ALREADY PROCESSED (${currentStatus})`
      };
    }
  } else if (stage === 'UNSOLD_ROUND') {
    if (currentStatus === 'SOLD') {
      return {
        success: false,
        code: 'ALREADY_SOLD',
        player: matchedPlayer,
        message: `PLAYER #${matchedPlayer.number} IS ALREADY SOLD`
      };
    }
    if (currentStatus !== 'UNSOLD') {
      return {
        success: false,
        code: 'NOT_UNSOLD',
        player: matchedPlayer,
        message: `PLAYER #${matchedPlayer.number} IS NOT IN UNSOLD LIST`
      };
    }
    if (unsoldRoundProcessed.has(matchedPlayer.id)) {
      return {
        success: false,
        code: 'ALREADY_PROCESSED_UNSOLD',
        player: matchedPlayer,
        message: `PLAYER #${matchedPlayer.number} ALREADY PROCESSED IN UNSOLD ROUND`
      };
    }
  }

  return {
    success: true,
    player: matchedPlayer
  };
}

