import React from 'react';
import { useAuction } from './hooks/useAuction';
import AuctionHeader from './components/AuctionHeader';
import HomeScreen from './components/HomeScreen';
import AuctionScreen from './components/AuctionScreen';

export default function App() {
  const auctionState = useAuction();

  return (
    <div className="min-h-screen flex flex-col bg-[#060913] text-gray-100 font-sans antialiased">
      {/* Top Sticky Header */}
      <AuctionHeader
        currentCategoryConfig={auctionState.currentCategoryConfig}
        setShowResetModal={auctionState.setShowResetModal}
        showResetModal={auctionState.showResetModal}
        resetAuction={auctionState.resetAuction}
      />

      {/* Body View (Home Screen vs Auction Screen) */}
      {!auctionState.auctionStarted ? (
        <HomeScreen
          onStartAuction={auctionState.startAuction}
          playersByCategory={auctionState.playersByCategory}
        />
      ) : (
        <AuctionScreen auctionState={auctionState} />
      )}
    </div>
  );
}
