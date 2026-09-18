import { useState, useMemo, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CATEGORY_ORDER,
  CATEGORY_CONFIG,
  getPlayersByCategory,
  findPlayerByNumber
} from '../utils/playerUtils';
import { MPL_TEAMS, INITIAL_POINTS, TOTAL_BUDGET, MAX_SQUAD_SIZE } from '../utils/teamData';
import realtimeService from '../services/realtimeService';

const STORAGE_KEY = 'mpl_s4_auction_state';

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return {
        stage: parsed.stage || 'HOME',
        mode: parsed.mode || 'LANDING',
        currentCategoryKey: parsed.currentCategoryKey || CATEGORY_ORDER[0],
        playerStatuses: parsed.playerStatuses && typeof parsed.playerStatuses === 'object' ? parsed.playerStatuses : {},
        unsoldRoundProcessed: Array.isArray(parsed.unsoldRoundProcessed)
          ? new Set(parsed.unsoldRoundProcessed)
          : new Set(),
        teamAssignments: parsed.teamAssignments && typeof parsed.teamAssignments === 'object' ? parsed.teamAssignments : {},
        auctionHistory: Array.isArray(parsed.auctionHistory) ? parsed.auctionHistory : [],
        isAdmin: Boolean(parsed.isAdmin),
        currentPlayerData: parsed.currentPlayerData || null
      };
    }
  } catch (err) {
    console.error('Failed to load auction state from localStorage:', err);
  }
  return null;
}

export function useAuction() {
  const savedState = useMemo(() => loadInitialState(), []);

  const [mode, setMode] = useState(() => savedState?.mode || 'LANDING'); // 'LANDING' | 'ADMIN' | 'USER'
  const [stage, setStage] = useState(() => savedState?.stage || 'HOME'); // 'HOME' | 'MAIN_AUCTION' | 'MAIN_COMPLETED' | 'UNSOLD_ROUND' | 'FINAL_COMPLETED'
  const [currentCategoryKey, setCurrentCategoryKey] = useState(() => savedState?.currentCategoryKey || CATEGORY_ORDER[0]);
  const [playerStatuses, setPlayerStatuses] = useState(() => savedState?.playerStatuses || {}); // { [playerId]: 'SOLD' | 'UNSOLD' }
  const [unsoldRoundProcessed, setUnsoldRoundProcessed] = useState(() => savedState?.unsoldRoundProcessed || new Set()); // Set of playerIds processed in Unsold Round
  const [teamAssignments, setTeamAssignments] = useState(() => savedState?.teamAssignments || {}); // { [playerId]: { playerId, playerNumber, name, role, teamId, teamName, boughtPrice, timestamp } }
  const [auctionHistory, setAuctionHistory] = useState(() => savedState?.auctionHistory || []);
  const [isAdmin, setIsAdmin] = useState(() => savedState?.isAdmin ?? (savedState?.mode === 'ADMIN'));

  // Current player being displayed in the auction (shared across Admin/User)
  const [currentPlayerData, setCurrentPlayerData] = useState(() => savedState?.currentPlayerData || null);

  // Active view navigation tab: 'AUCTION' | 'TEAMS' | 'HISTORY'
  const [activeTab, setActiveTab] = useState('AUCTION');

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [enteredNumber, setEnteredNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Modal for adding / editing player purchase to a team
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [addPlayerModalData, setAddPlayerModalData] = useState(null);

  // Team detail viewing
  const [selectedTeamIdForView, setSelectedTeamIdForView] = useState(null);

  // Connection status from realtime service: 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED'
  const [connectionStatus, setConnectionStatus] = useState(() => realtimeService.status || 'CONNECTED');

  // Listen for realtime connection status and incoming state updates from Admin device
  useEffect(() => {
    const unsubStatus = realtimeService.onStatusChange((status) => {
      setConnectionStatus(status);
    });

    const unsubState = realtimeService.onStateUpdate((remoteState) => {
      if (!remoteState || typeof remoteState !== 'object') return;

      // If viewer mode (not Admin), apply authoritative state broadcast from Admin
      if (!isAdmin) {
        if (remoteState.stage !== undefined) setStage(remoteState.stage);
        if (remoteState.currentCategoryKey !== undefined) setCurrentCategoryKey(remoteState.currentCategoryKey);
        if (remoteState.playerStatuses) setPlayerStatuses(remoteState.playerStatuses);
        if (remoteState.unsoldRoundProcessed) {
          setUnsoldRoundProcessed(new Set(remoteState.unsoldRoundProcessed));
        }
        if (remoteState.teamAssignments) setTeamAssignments(remoteState.teamAssignments);
        if (remoteState.auctionHistory) setAuctionHistory(remoteState.auctionHistory);
        if (remoteState.currentPlayerData !== undefined) setCurrentPlayerData(remoteState.currentPlayerData);
      }
    });

    return () => {
      unsubStatus();
      unsubState();
    };
  }, [isAdmin]);

  // Persist state locally and broadcast from Admin device to all viewer devices in real-time
  useEffect(() => {
    try {
      const payload = {
        stage,
        currentCategoryKey,
        playerStatuses,
        unsoldRoundProcessed: Array.from(unsoldRoundProcessed),
        teamAssignments,
        auctionHistory,
        currentPlayerData
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...payload, mode, isAdmin }));

      // Broadcast authoritative state to all connected devices in real time
      if (isAdmin) {
        realtimeService.sendState(payload);
      }
    } catch (err) {
      console.error('Failed to save or broadcast auction state:', err);
    }
  }, [stage, mode, currentCategoryKey, playerStatuses, unsoldRoundProcessed, teamAssignments, auctionHistory, isAdmin, currentPlayerData]);

  // Most recently sold player
  const justSoldPlayer = useMemo(() => {
    const historyPurchase = auctionHistory.find(
      (h) => h.action === 'PURCHASE' || h.action === 'EDIT'
    );
    if (historyPurchase) return historyPurchase;

    const assignedValues = Object.values(teamAssignments);
    if (assignedValues.length > 0) {
      return assignedValues[assignedValues.length - 1];
    }
    return null;
  }, [auctionHistory, teamAssignments]);

  // Grouped player lists from filesystem
  const playersByCategory = useMemo(() => getPlayersByCategory(), []);

  // All players flat list
  const allPlayers = useMemo(() => {
    return Object.values(playersByCategory).flat();
  }, [playersByCategory]);

  const currentCategoryConfig = CATEGORY_CONFIG[currentCategoryKey] || CATEGORY_CONFIG['Bowler'];
  const currentCategoryIndex = CATEGORY_ORDER.indexOf(currentCategoryKey);

  // Calculate Team stats dynamically from teamAssignments
  const teamsWithStats = useMemo(() => {
    return MPL_TEAMS.map((team) => {
      const assignedPlayers = Object.values(teamAssignments).filter(
        (a) => a.teamId === team.id || a.teamName === team.name
      );
      const spentPoints = assignedPlayers.reduce(
        (sum, p) => sum + (Number(p.boughtPrice) || 0),
        0
      );
      const remainingPoints = team.initialPoints - spentPoints;
      const playerCount = assignedPlayers.length;
      const slotsLeft = MAX_SQUAD_SIZE - playerCount;
      const isFull = playerCount >= MAX_SQUAD_SIZE;

      let capacityStatus = 'AVAILABLE';
      if (isFull) capacityStatus = 'FULL';
      else if (playerCount >= MAX_SQUAD_SIZE - 1) capacityStatus = 'ALMOST_FULL';

      return {
        ...team,
        spentPoints,
        remainingPoints,
        playerCount,
        slotsLeft,
        isFull,
        capacityStatus,
        players: assignedPlayers
      };
    });
  }, [teamAssignments]);

  // Global Budget Stats
  const globalTeamStats = useMemo(() => {
    const totalSpent = teamsWithStats.reduce((sum, t) => sum + t.spentPoints, 0);
    const totalRemaining = TOTAL_BUDGET - totalSpent;
    const totalSoldAssigned = Object.keys(teamAssignments).length;
    const fullTeams = teamsWithStats.filter((t) => t.isFull).length;
    return {
      totalTeams: MPL_TEAMS.length,
      totalBudget: TOTAL_BUDGET,
      totalSpent,
      totalRemaining,
      totalSoldAssigned,
      fullTeams
    };
  }, [teamsWithStats, teamAssignments]);

  // Unsold players list
  const unsoldPlayers = useMemo(() => {
    return allPlayers.filter((p) => playerStatuses[p.id] === 'UNSOLD' && !teamAssignments[p.id]);
  }, [allPlayers, playerStatuses, teamAssignments]);

  // Per-category and Global Stats calculation
  const stats = useMemo(() => {
    const categoryStats = {};
    let totalPlayers = allPlayers.length;
    let totalProcessedMain = 0;
    let totalSold = 0;
    let totalUnsold = 0;

    CATEGORY_ORDER.forEach((catKey) => {
      const list = playersByCategory[catKey] || [];
      const catTotal = list.length;
      let catProcessedMain = 0;
      let catSold = 0;
      let catUnsold = 0;
      let catUnsoldRoundProcessed = 0;

      list.forEach((p) => {
        const st = playerStatuses[p.id];
        if (st) {
          catProcessedMain += 1;
          totalProcessedMain += 1;
          if (st === 'SOLD') {
            catSold += 1;
            totalSold += 1;
          } else if (st === 'UNSOLD') {
            catUnsold += 1;
            totalUnsold += 1;
          }
        }
        if (unsoldRoundProcessed.has(p.id)) {
          catUnsoldRoundProcessed += 1;
        }
      });

      categoryStats[catKey] = {
        total: catTotal,
        processedMain: catProcessedMain,
        sold: catSold,
        unsold: catUnsold,
        remainingMain: catTotal - catProcessedMain,
        unsoldRoundTotal: catUnsold,
        unsoldRoundProcessed: catUnsoldRoundProcessed,
        unsoldRoundRemaining: catUnsold - catUnsoldRoundProcessed
      };
    });

    const isMainAuctionCompleted = totalPlayers > 0 && totalProcessedMain >= totalPlayers;

    // Unsold round tracking
    let totalUnsoldRoundItems = totalUnsold;
    let totalUnsoldRoundProcessed = unsoldRoundProcessed.size;

    return {
      categoryStats,
      totalPlayers,
      totalProcessedMain,
      totalSold,
      totalUnsold,
      totalRemainingMain: totalPlayers - totalProcessedMain,
      isMainAuctionCompleted,
      totalUnsoldRoundItems,
      totalUnsoldRoundProcessed,
      totalUnsoldRoundRemaining: totalUnsoldRoundItems - totalUnsoldRoundProcessed
    };
  }, [allPlayers, playersByCategory, playerStatuses, unsoldRoundProcessed]);

  const auctionStarted = stage !== 'HOME' && mode !== 'LANDING';

  // Mode Selection Handlers
  const selectUserMode = useCallback(() => {
    setIsAdmin(false);
    setMode('USER');
    if (stage === 'HOME') {
      setStage('MAIN_AUCTION');
    }
  }, [stage]);

  const selectAdminMode = useCallback(() => {
    if (isAdmin) {
      setMode('ADMIN');
      if (stage === 'HOME') {
        setStage('MAIN_AUCTION');
      }
    } else {
      setShowAdminModal(true);
    }
  }, [isAdmin, stage]);

  const returnToLanding = useCallback(() => {
    setMode('LANDING');
  }, []);

  // Admin Auth Handlers
  const loginAdmin = useCallback((userId, password) => {
    const u = String(userId || '').trim();
    const p = String(password || '');
    if ((u === 'Madathur' || u.toLowerCase() === 'madathur') && p === 'mpls4') {
      setIsAdmin(true);
      setMode('ADMIN');
      setShowAdminModal(false);
      setErrorMessage('');
      if (stage === 'HOME') {
        setStage('MAIN_AUCTION');
      }
      return { success: true };
    }
    return { success: false, message: 'Invalid User ID or Password' };
  }, [stage]);

  const logoutAdmin = useCallback(() => {
    setIsAdmin(false);
    setMode('USER');
  }, []);

  // Switch Category anytime
  const selectCategory = useCallback((catKey) => {
    if (CATEGORY_ORDER.includes(catKey)) {
      setCurrentCategoryKey(catKey);
      setSelectedPlayer(null);
      setEnteredNumber('');
      setErrorMessage('');
    }
  }, []);

  // Handle start auction from home screen
  const startAuction = useCallback(() => {
    setStage('MAIN_AUCTION');
    setCurrentCategoryKey(CATEGORY_ORDER[0]);
    setErrorMessage('');
    setSelectedPlayer(null);
    setEnteredNumber('');
  }, []);

  // Handle player number submission by auctioneer
  const submitPlayerNumber = useCallback((numberToSubmit) => {
    const targetNumber = numberToSubmit !== undefined ? numberToSubmit : enteredNumber;
    setErrorMessage('');

    if (stage === 'MAIN_COMPLETED') {
      setErrorMessage('MAIN AUCTION IS ALREADY COMPLETED. PLEASE START UNSOLD ROUND.');
      return false;
    }

    if (stage === 'FINAL_COMPLETED') {
      setErrorMessage('AUCTION IS ALREADY COMPLETED.');
      return false;
    }

    const result = findPlayerByNumber(
      currentCategoryKey,
      targetNumber,
      playerStatuses,
      unsoldRoundProcessed,
      stage
    );

    if (!result.success) {
      setErrorMessage(result.message);
      return false;
    }

    // Successfully found valid player card to reveal!
    setSelectedPlayer(result.player);
    setEnteredNumber('');
    setErrorMessage('');

    // Persist current player for live User mode sync
    setCurrentPlayerData({
      id: result.player.id,
      number: result.player.number,
      category: result.player.category,
      path: result.player.path,
      fileName: result.player.fileName,
      status: 'BIDDING'
    });

    return true;
  }, [enteredNumber, stage, currentCategoryKey, playerStatuses, unsoldRoundProcessed]);

  // Mark currently revealed player as SOLD
  const markPlayerSold = useCallback(() => {
    if (!isAdmin) {
      setErrorMessage('ADMIN PERMISSION REQUIRED FOR THIS ACTION');
      return;
    }
    if (!selectedPlayer) return;

    const playerId = selectedPlayer.id;

    setPlayerStatuses((prev) => {
      const nextStatuses = { ...prev, [playerId]: 'SOLD' };
      return nextStatuses;
    });

    if (stage === 'UNSOLD_ROUND') {
      setUnsoldRoundProcessed((prev) => new Set([...prev, playerId]));
    }

    setErrorMessage('');

    // Update current player status
    setCurrentPlayerData((prev) => prev ? { ...prev, status: 'SOLD' } : prev);

    // Automatically prompt modal to assign player to team
    const initialTeamData = {
      playerId,
      playerNumber: selectedPlayer.number,
      category: selectedPlayer.category,
      role: selectedPlayer.category,
      name: `Player #${selectedPlayer.number}`,
      teamId: MPL_TEAMS[0].id,
      boughtPrice: '',
      isEdit: false
    };
    setAddPlayerModalData(initialTeamData);
    setShowAddPlayerModal(true);

    // Check completion condition
    if (stage === 'MAIN_AUCTION') {
      const nextProcessedCount = stats.totalProcessedMain + 1;
      if (nextProcessedCount >= stats.totalPlayers) {
        if (stats.totalUnsold > 0) {
          setStage('MAIN_COMPLETED');
        } else {
          setStage('FINAL_COMPLETED');
        }
      }
    } else if (stage === 'UNSOLD_ROUND') {
      const nextUnsoldProcessed = stats.totalUnsoldRoundProcessed + 1;
      if (nextUnsoldProcessed >= stats.totalUnsoldRoundItems) {
        setStage('FINAL_COMPLETED');
      }
    }
  }, [isAdmin, selectedPlayer, stage, stats]);

  // Mark currently revealed player as UNSOLD
  const markPlayerUnsold = useCallback(() => {
    if (!isAdmin) {
      setErrorMessage('ADMIN PERMISSION REQUIRED FOR THIS ACTION');
      return;
    }
    if (!selectedPlayer) return;

    const playerId = selectedPlayer.id;

    // Remove any team assignment if previously assigned
    setTeamAssignments((prev) => {
      if (prev[playerId]) {
        const copy = { ...prev };
        delete copy[playerId];
        return copy;
      }
      return prev;
    });

    setPlayerStatuses((prev) => {
      const nextStatuses = { ...prev, [playerId]: 'UNSOLD' };
      return nextStatuses;
    });

    if (stage === 'UNSOLD_ROUND') {
      setUnsoldRoundProcessed((prev) => new Set([...prev, playerId]));
    }

    // Update current player status
    setCurrentPlayerData((prev) => prev ? { ...prev, status: 'UNSOLD' } : prev);

    setSelectedPlayer(null);
    setEnteredNumber('');
    setErrorMessage('');

    // Check completion condition
    if (stage === 'MAIN_AUCTION') {
      const nextProcessedCount = stats.totalProcessedMain + 1;
      if (nextProcessedCount >= stats.totalPlayers) {
        setStage('MAIN_COMPLETED');
      }
    } else if (stage === 'UNSOLD_ROUND') {
      const nextUnsoldProcessed = stats.totalUnsoldRoundProcessed + 1;
      if (nextUnsoldProcessed >= stats.totalUnsoldRoundItems) {
        setStage('FINAL_COMPLETED');
      }
    }
  }, [isAdmin, selectedPlayer, stage, stats]);

  // Open modal to assign team for current player or specific player
  const openAssignTeamModal = useCallback((playerObj) => {
    const target = playerObj || selectedPlayer;
    if (!target) return;

    const existing = teamAssignments[target.id];
    setAddPlayerModalData({
      playerId: target.id,
      playerNumber: target.number,
      category: target.category,
      role: existing?.role || target.category,
      name: existing?.name || `Player #${target.number}`,
      teamId: existing?.teamId || MPL_TEAMS[0].id,
      boughtPrice: existing?.boughtPrice ?? '',
      isEdit: Boolean(existing)
    });
    setShowAddPlayerModal(true);
  }, [selectedPlayer, teamAssignments]);

  // Add / Assign Player to Team Handler
  const addPlayerToTeam = useCallback(
    ({ playerId, playerNumber, name, role, teamId, boughtPrice }) => {
      if (!isAdmin) {
        return { success: false, message: 'ADMIN AUTHORIZATION REQUIRED' };
      }

      if (!playerId) {
        return { success: false, message: 'INVALID PLAYER ID' };
      }

      const priceNum = Number(boughtPrice);
      if (isNaN(priceNum) || priceNum <= 0) {
        return { success: false, message: 'BOUGHT PRICE MUST BE A VALID NUMBER GREATER THAN 0' };
      }

      const targetTeam = teamsWithStats.find((t) => t.id === teamId || t.name === teamId);
      if (!targetTeam) {
        return { success: false, message: 'PLEASE SELECT A VALID TEAM' };
      }

      const existing = teamAssignments[playerId];
      const isEdit = Boolean(existing);

      // Check 12-player squad limit
      const isSameTeam = isEdit && existing.teamId === targetTeam.id;
      const effectivePlayerCount = isSameTeam ? targetTeam.playerCount : targetTeam.playerCount;

      if (!isSameTeam && targetTeam.isFull) {
        return {
          success: false,
          message: `TEAM FULL! ${targetTeam.name} HAS ALREADY PURCHASED ${MAX_SQUAD_SIZE} PLAYERS. MAXIMUM SQUAD SIZE IS ${MAX_SQUAD_SIZE} PLAYERS. THIS PLAYER CANNOT BE ASSIGNED TO THIS TEAM.`
        };
      }

      // If editing from one team to another, check new team capacity
      if (isEdit && !isSameTeam && targetTeam.playerCount >= MAX_SQUAD_SIZE) {
        return {
          success: false,
          message: `TEAM FULL! ${targetTeam.name} ALREADY HAS ${MAX_SQUAD_SIZE} PLAYERS.`
        };
      }

      // Validate team remaining points (allow refund if same team during edit)
      const availablePoints = isSameTeam
        ? targetTeam.remainingPoints + Number(existing.boughtPrice)
        : targetTeam.remainingPoints;

      if (availablePoints < priceNum) {
        return {
          success: false,
          message: `INSUFFICIENT TEAM POINTS FOR ${targetTeam.name}. AVAILABLE: ${availablePoints.toLocaleString()} PTS, REQUIRED: ${priceNum.toLocaleString()} PTS`
        };
      }

      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const assignment = {
        playerId,
        playerNumber: String(playerNumber),
        name: name ? String(name).trim() : `Player #${playerNumber}`,
        role: role || 'Batsman',
        teamId: targetTeam.id,
        teamName: targetTeam.name,
        boughtPrice: priceNum,
        timestamp: timeString
      };

      setTeamAssignments((prev) => ({ ...prev, [playerId]: assignment }));
      setPlayerStatuses((prev) => ({ ...prev, [playerId]: 'SOLD' }));

      if (stage === 'UNSOLD_ROUND') {
        setUnsoldRoundProcessed((prev) => new Set([...prev, playerId]));
      }

      // Record in History
      setAuctionHistory((prev) => [
        {
          id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          timestamp: timeString,
          playerId,
          playerNumber: String(playerNumber),
          name: assignment.name,
          role: assignment.role,
          teamName: targetTeam.name,
          price: priceNum,
          action: isEdit ? 'EDIT' : 'PURCHASE'
        },
        ...prev
      ]);

      // Update currentPlayerData with sold info
      setCurrentPlayerData((prev) => prev && prev.id === playerId ? {
        ...prev,
        status: 'ASSIGNED',
        teamName: targetTeam.name,
        boughtPrice: priceNum,
        playerName: assignment.name,
        role: assignment.role
      } : prev);

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.error('Confetti animation error:', e);
      }

      setShowAddPlayerModal(false);
      setAddPlayerModalData(null);
      setSelectedPlayer(null);
      setEnteredNumber('');
      setErrorMessage('');

      return { success: true };
    },
    [isAdmin, teamAssignments, teamsWithStats, stage]
  );

  // Delete player purchase assignment
  const deletePlayerPurchase = useCallback(
    (playerId) => {
      if (!isAdmin) {
        return { success: false, message: 'ADMIN AUTHORIZATION REQUIRED' };
      }

      const existing = teamAssignments[playerId];
      if (!existing) {
        return { success: false, message: 'PLAYER ASSIGNMENT NOT FOUND' };
      }

      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setTeamAssignments((prev) => {
        const copy = { ...prev };
        delete copy[playerId];
        return copy;
      });

      // Status reverts to UNSOLD or cleared
      setPlayerStatuses((prev) => {
        const copy = { ...prev };
        delete copy[playerId];
        return copy;
      });

      setAuctionHistory((prev) => [
        {
          id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          timestamp: timeString,
          playerId,
          playerNumber: existing.playerNumber,
          name: existing.name,
          role: existing.role,
          teamName: existing.teamName,
          price: existing.boughtPrice,
          action: 'DELETE'
        },
        ...prev
      ]);

      return { success: true };
    },
    [isAdmin, teamAssignments]
  );

  // Start Unsold Round
  const startUnsoldRound = useCallback(() => {
    setStage('UNSOLD_ROUND');
    setSelectedPlayer(null);
    setEnteredNumber('');
    setErrorMessage('');
    setCurrentPlayerData(null);
    for (const catKey of CATEGORY_ORDER) {
      if (stats.categoryStats[catKey]?.unsoldRoundTotal > 0) {
        setCurrentCategoryKey(catKey);
        break;
      }
    }
  }, [stats.categoryStats]);

  // Reset entire auction
  const resetAuction = useCallback(() => {
    if (!isAdmin) {
      setErrorMessage('ADMIN PERMISSION REQUIRED TO RESET AUCTION');
      return;
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear auction state from localStorage:', err);
    }
    setPlayerStatuses({});
    setUnsoldRoundProcessed(new Set());
    setTeamAssignments({});
    setAuctionHistory([]);
    setStage('HOME');
    setMode('LANDING');
    setCurrentCategoryKey(CATEGORY_ORDER[0]);
    setSelectedPlayer(null);
    setEnteredNumber('');
    setErrorMessage('');
    setShowResetModal(false);
    setCurrentPlayerData(null);

    // Broadcast reset state to all connected devices
    realtimeService.sendState({
      stage: 'HOME',
      currentCategoryKey: CATEGORY_ORDER[0],
      playerStatuses: {},
      unsoldRoundProcessed: [],
      teamAssignments: {},
      auctionHistory: [],
      currentPlayerData: null
    });
  }, [isAdmin]);

  return {
    mode,
    selectUserMode,
    selectAdminMode,
    returnToLanding,
    auctionStarted,
    stage,
    startAuction,
    currentCategoryKey,
    currentCategoryConfig,
    currentCategoryIndex,
    selectCategory,
    playersByCategory,
    allPlayers,
    selectedPlayer,
    enteredNumber,
    setEnteredNumber,
    errorMessage,
    submitPlayerNumber,
    markPlayerSold,
    markPlayerUnsold,
    startUnsoldRound,
    resetAuction,
    showResetModal,
    setShowResetModal,
    stats,
    playerStatuses,
    unsoldRoundProcessed,

    // Team & Admin Extensions
    isAdmin,
    loginAdmin,
    logoutAdmin,
    showAdminModal,
    setShowAdminModal,
    activeTab,
    setActiveTab,
    teamsWithStats,
    globalTeamStats,
    teamAssignments,
    auctionHistory,
    justSoldPlayer,
    showAddPlayerModal,
    setShowAddPlayerModal,
    addPlayerModalData,
    openAssignTeamModal,
    addPlayerToTeam,
    deletePlayerPurchase,
    selectedTeamIdForView,
    setSelectedTeamIdForView,

    // Live sync
    currentPlayerData,
    unsoldPlayers,
    connectionStatus
  };
}
