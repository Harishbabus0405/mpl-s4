import { useState, useMemo, useCallback } from 'react';
import {
  CATEGORY_ORDER,
  CATEGORY_CONFIG,
  getPlayersByCategory,
  findPlayerByNumber
} from '../utils/playerUtils';

export function useAuction() {
  const [auctionStarted, setAuctionStarted] = useState(false);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [usedPlayers, setUsedPlayers] = useState(new Set());
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [enteredNumber, setEnteredNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  // Grouped player lists from filesystem
  const playersByCategory = useMemo(() => getPlayersByCategory(), []);

  const currentCategoryKey = CATEGORY_ORDER[currentCategoryIndex];
  const currentCategoryConfig = CATEGORY_CONFIG[currentCategoryKey];

  // Current category total players count detected from files
  const currentCategoryTotal = (playersByCategory[currentCategoryKey] || []).length;

  // Number of used players in current category
  const currentCategoryShownCount = useMemo(() => {
    const list = playersByCategory[currentCategoryKey] || [];
    return list.filter((p) => usedPlayers.has(p.id)).length;
  }, [playersByCategory, currentCategoryKey, usedPlayers]);

  // Is active category completed?
  const isCategoryCompleted = currentCategoryTotal > 0 && currentCategoryShownCount >= currentCategoryTotal;

  // Is whole auction completed?
  const isAuctionCompleted = currentCategoryIndex >= CATEGORY_ORDER.length - 1 && isCategoryCompleted;

  // Handle start auction from home screen
  const startAuction = useCallback(() => {
    setAuctionStarted(true);
    setErrorMessage('');
    setSelectedPlayer(null);
    setEnteredNumber('');
  }, []);

  // Handle player number submission by auctioneer
  const submitPlayerNumber = useCallback((numberToSubmit) => {
    const targetNumber = numberToSubmit !== undefined ? numberToSubmit : enteredNumber;
    setErrorMessage('');

    if (isCategoryCompleted) {
      setErrorMessage(`ALL ${currentCategoryConfig.displayName} HAVE ALREADY BEEN REVEALED.`);
      return false;
    }

    const result = findPlayerByNumber(currentCategoryKey, targetNumber, usedPlayers);

    if (!result.success) {
      setErrorMessage(result.message);
      return false;
    }

    // Successfully found valid, unused player!
    setSelectedPlayer(result.player);
    setUsedPlayers((prev) => new Set([...prev, result.player.id]));
    setEnteredNumber('');
    setErrorMessage('');
    return true;
  }, [enteredNumber, isCategoryCompleted, currentCategoryKey, currentCategoryConfig, usedPlayers]);

  // Advance to next category
  const startNextCategory = useCallback(() => {
    if (currentCategoryIndex < CATEGORY_ORDER.length - 1) {
      setCurrentCategoryIndex((prev) => prev + 1);
      setSelectedPlayer(null);
      setEnteredNumber('');
      setErrorMessage('');
    }
  }, [currentCategoryIndex]);

  // Reset entire auction
  const resetAuction = useCallback(() => {
    setUsedPlayers(new Set());
    setCurrentCategoryIndex(0);
    setSelectedPlayer(null);
    setEnteredNumber('');
    setErrorMessage('');
    setAuctionStarted(false);
    setShowResetModal(false);
  }, []);

  return {
    auctionStarted,
    startAuction,
    currentCategoryKey,
    currentCategoryConfig,
    currentCategoryIndex,
    playersByCategory,
    currentCategoryTotal,
    currentCategoryShownCount,
    isCategoryCompleted,
    isAuctionCompleted,
    selectedPlayer,
    enteredNumber,
    setEnteredNumber,
    errorMessage,
    submitPlayerNumber,
    startNextCategory,
    resetAuction,
    showResetModal,
    setShowResetModal
  };
}
