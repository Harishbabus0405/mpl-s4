import React, { useState } from 'react';
import { useAuction } from './hooks/useAuction';
import LandingPage from './components/LandingPage';
import AuctionHeader from './components/AuctionHeader';
import HomeScreen from './components/HomeScreen';
import AuctionScreen from './components/AuctionScreen';
import AdminLoginModal from './components/AdminLoginModal';
import AddPlayerModal from './components/AddPlayerModal';
import AuctionHistoryModal from './components/AuctionHistoryModal';

export default function App() {
  const auctionState = useAuction();
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const isMobileViewer = isMobile && !auctionState.isAdmin;

  // If in Landing Mode, render Cinematic First Page
  if (auctionState.mode === 'LANDING') {
    return (
      <>
        <LandingPage
          onSelectUserMode={auctionState.selectUserMode}
          onSelectAdminMode={auctionState.selectAdminMode}
        />

        {/* Admin Login Modal from Landing Page */}
        <AdminLoginModal
          isOpen={auctionState.showAdminModal}
          onClose={() => auctionState.setShowAdminModal(false)}
          onLogin={auctionState.loginAdmin}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#060913] text-gray-100 font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* Top Sticky Header (Hidden on Mobile User Mode since MobileUserView has its own native mobile header) */}
      {!isMobileViewer && (
        <AuctionHeader
          currentCategoryConfig={auctionState.currentCategoryConfig}
          setShowResetModal={auctionState.setShowResetModal}
          showResetModal={auctionState.showResetModal}
          resetAuction={auctionState.resetAuction}
          stage={auctionState.stage}
          activeTab={auctionState.activeTab}
          setActiveTab={auctionState.setActiveTab}
          isAdmin={auctionState.isAdmin}
          setShowAdminModal={auctionState.setShowAdminModal}
          logoutAdmin={auctionState.logoutAdmin}
          setShowHistoryModal={setShowHistoryModal}
          returnToLanding={auctionState.returnToLanding}
          stats={auctionState.stats}
          connectionStatus={auctionState.connectionStatus}
        />
      )}

      {/* Body View (Home Screen vs Auction Screen vs Teams View) */}
      {auctionState.activeTab === 'TEAMS' ? (
        <AuctionScreen auctionState={auctionState} />
      ) : !auctionState.auctionStarted ? (
        <HomeScreen
          onStartAuction={auctionState.startAuction}
          playersByCategory={auctionState.playersByCategory}
        />
      ) : (
        <AuctionScreen auctionState={auctionState} />
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={auctionState.showAdminModal}
        onClose={() => auctionState.setShowAdminModal(false)}
        onLogin={auctionState.loginAdmin}
      />

      {/* Add / Edit Player Purchase Modal */}
      <AddPlayerModal
        isOpen={auctionState.showAddPlayerModal}
        onClose={() => auctionState.setShowAddPlayerModal(false)}
        initialData={auctionState.addPlayerModalData}
        teamsWithStats={auctionState.teamsWithStats}
        onSubmit={auctionState.addPlayerToTeam}
      />

      {/* Audit History Log Modal */}
      <AuctionHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        auctionHistory={auctionState.auctionHistory}
      />
    </div>
  );
}
