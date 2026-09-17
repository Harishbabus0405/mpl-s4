import React from 'react';
import CategoryProgress from './CategoryProgress';
import PlayerInput from './PlayerInput';
import PlayerCard from './PlayerCard';
import CategoryComplete from './CategoryComplete';
import FinalScreen from './FinalScreen';

export default function AuctionScreen({ auctionState }) {
  const {
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
    usedPlayers
  } = auctionState;

  if (isAuctionCompleted) {
    return (
      <FinalScreen
        onResetAuction={resetAuction}
        totalPlayersShown={usedPlayers.size}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-65px)]">
      {/* Category Progress Stepper Header */}
      <CategoryProgress
        currentCategoryIndex={currentCategoryIndex}
        currentCategoryShownCount={currentCategoryShownCount}
        currentCategoryTotal={currentCategoryTotal}
        playersByCategory={playersByCategory}
        usedPlayers={usedPlayers}
      />

      {/* Main Live Auction Work Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between space-y-6">
        {/* Category Header Banner */}
        <div className="text-center space-y-1 animate-fade-in">
          <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white uppercase tracking-wider flex items-center justify-center space-x-3">
            <span>{currentCategoryConfig.emoji}</span>
            <span>{currentCategoryConfig.displayName} AUCTION</span>
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-widest">
            ENTER PLAYER NUMBER TO DISPLAY PLAYER CARD
          </p>
        </div>

        {/* Player Input Area */}
        <PlayerInput
          enteredNumber={enteredNumber}
          setEnteredNumber={setEnteredNumber}
          onSubmit={() => submitPlayerNumber()}
          errorMessage={errorMessage}
          disabled={isCategoryCompleted}
        />

        {/* Player Card Display or Category Complete Card */}
        {isCategoryCompleted ? (
          <CategoryComplete
            currentCategoryConfig={currentCategoryConfig}
            currentCategoryIndex={currentCategoryIndex}
            onStartNextCategory={startNextCategory}
            totalCategoryPlayers={currentCategoryTotal}
          />
        ) : (
          <PlayerCard
            selectedPlayer={selectedPlayer}
            currentCategoryConfig={currentCategoryConfig}
          />
        )}
      </main>
    </div>
  );
}
