/**
 * MPL S4 Tournament - 16 Teams Data Definition & Utilities
 */

export const INITIAL_POINTS = 25000;
export const MAX_SQUAD_SIZE = 12;

export const MPL_TEAMS = [
  { id: 'team-1', name: 'MADATHUR SHINING STARS', owner: 'SURYA', initialPoints: INITIAL_POINTS },
  { id: 'team-2', name: 'MADATHUR CSK', owner: 'MANI', initialPoints: INITIAL_POINTS },
  { id: 'team-3', name: 'MADATHUR VEERANS', owner: 'PRASANTH', initialPoints: INITIAL_POINTS },
  { id: 'team-4', name: 'MADATHUR MI', owner: 'MANIYA', initialPoints: INITIAL_POINTS },
  { id: 'team-5', name: 'MADATHUR MONSTERS', owner: 'VM', initialPoints: INITIAL_POINTS },
  { id: 'team-6', name: 'MADATHUR MCC', owner: 'JANAGAN', initialPoints: INITIAL_POINTS },
  { id: 'team-7', name: 'MADATHUR SUPER KINGS', owner: 'KARTHI', initialPoints: INITIAL_POINTS },
  { id: 'team-8', name: 'MADATHUR JYMKHANA', owner: 'GOPINATH', initialPoints: INITIAL_POINTS },
  { id: 'team-9', name: 'MADATHUR GPNCC', owner: 'KENNADY', initialPoints: INITIAL_POINTS },
  { id: 'team-10', name: 'MADATHUR SYNDICATE', owner: 'BALA', initialPoints: INITIAL_POINTS },
  { id: 'team-11', name: 'MADATHUR RDX', owner: 'SANJAY Ss', initialPoints: INITIAL_POINTS },
  { id: 'team-12', name: 'MADATHUR LIONS', owner: 'VARMA', initialPoints: INITIAL_POINTS },
  { id: 'team-13', name: 'MADATHUR DEFENDERS', owner: 'SUBHASH', initialPoints: INITIAL_POINTS },
  { id: 'team-14', name: 'MADATHUR BAD EAGLES', owner: 'RAMDASS', initialPoints: INITIAL_POINTS },
  { id: 'team-15', name: 'MADATHUR A2G', owner: 'RANJITH', initialPoints: INITIAL_POINTS },
  { id: 'team-16', name: 'MADATHUR CHASERS', owner: 'KAVI', initialPoints: INITIAL_POINTS }
];

export const TOTAL_BUDGET = MPL_TEAMS.length * INITIAL_POINTS; // 400,000 Points

export function getTeamById(teamId) {
  return MPL_TEAMS.find((t) => t.id === teamId || t.name === teamId);
}

/**
 * Escape a CSV field value to handle commas, quotes, and special characters
 */
function escapeCSV(value) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generate CSV content string for a single team
 * @param {Object} teamWithStats - Team object with players, spentPoints, remainingPoints
 * @returns {string} CSV content
 */
export function generateTeamCSV(teamWithStats) {
  const rows = ['Player Number,Player Name,Role,Team Name,Bought Points'];
  
  teamWithStats.players.forEach((p) => {
    rows.push([
      escapeCSV(p.playerNumber),
      escapeCSV(p.name),
      escapeCSV(p.role),
      escapeCSV(teamWithStats.name),
      escapeCSV(p.boughtPrice)
    ].join(','));
  });

  rows.push('');
  rows.push(`Total Players,${teamWithStats.playerCount}`);
  rows.push(`Total Spent,${teamWithStats.spentPoints}`);
  rows.push(`Initial Points,${teamWithStats.initialPoints}`);
  rows.push(`Remaining Points,${teamWithStats.remainingPoints}`);

  return rows.join('\n');
}

/**
 * Trigger browser download of a CSV file
 */
export function downloadTeamCSV(teamWithStats) {
  const csvContent = generateTeamCSV(teamWithStats);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${teamWithStats.name}.csv`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
