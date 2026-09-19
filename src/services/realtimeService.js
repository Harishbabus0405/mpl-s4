/**
 * MPL S4 Real-Time Auction Synchronization Service
 * Powered by Supabase Realtime (Cloud WebSocket + Postgres Replication) + BroadcastChannel
 */

import supabase from '../lib/supabase';

class RealtimeAuctionService {
  constructor() {
    this.status = 'DISCONNECTED'; // 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED'
    this.statusListeners = new Set();
    this.stateListeners = new Set();
    this.channel = null;
    this.broadcastChannel = null;
    this.reconnectTimer = null;
    this.isSyncingToDb = false;
    this.broadcastSupabaseChannel = null;
    this.dbSupabaseChannel = null;

    // 1. Same-device 0ms multi-tab synchronization via BroadcastChannel
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('mpl_s4_auction_channel');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'STATE_UPDATE' && event.data.payload) {
            this.notifyStateListeners(event.data.payload, 'broadcast_channel');
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel initialization warning:', err);
      }
    }

    // 2. Initialize Supabase Realtime channel and window online/offline listeners
    if (typeof window !== 'undefined') {
      this.initSupabaseRealtime();

      window.addEventListener('online', () => {
        console.log('🟢 Network online, reconnecting Supabase Realtime...');
        this.setStatus('RECONNECTING');
        this.initSupabaseRealtime();
        this.fetchLatestState();
      });

      window.addEventListener('offline', () => {
        console.warn('🔴 Network offline');
        this.setStatus('DISCONNECTED');
      });

      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            this.fetchLatestState();
          }
        });
      }
    }
  }

  setStatus(newStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.statusListeners.forEach((listener) => {
        try {
          listener(newStatus);
        } catch (e) {
          console.error('Error in status listener:', e);
        }
      });
    }
  }

  onStatusChange(callback) {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => this.statusListeners.delete(callback);
  }

  onStateUpdate(callback) {
    this.stateListeners.add(callback);
    return () => this.stateListeners.delete(callback);
  }

  notifyStateListeners(state, source = 'supabase') {
    if (!state || typeof state !== 'object') return;
    this.stateListeners.forEach((listener) => {
      try {
        listener(state, source);
      } catch (e) {
        console.error('Error in state listener:', e);
      }
    });
  }

  /**
   * Initialize Supabase Realtime Channels
   * Channel 1: 'mpl_auction_live' - Pure broadcast channel (never fails due to table missing/RLS)
   * Channel 2: 'mpl_auction_db' - Postgres changes channel (listens to database row updates)
   */
  initSupabaseRealtime() {
    this.setStatus('RECONNECTING');

    // Clean up old channels if any
    if (this.broadcastSupabaseChannel) {
      try { supabase.removeChannel(this.broadcastSupabaseChannel); } catch (e) {}
    }
    if (this.dbSupabaseChannel) {
      try { supabase.removeChannel(this.dbSupabaseChannel); } catch (e) {}
    }

    // 1. PURE BROADCAST CHANNEL (Sub-50ms ultra-low latency Admin -> Mobile)
    this.broadcastSupabaseChannel = supabase.channel('mpl_auction_live', {
      config: {
        broadcast: { self: false, ack: false }
      }
    });

    this.broadcastSupabaseChannel.on('broadcast', { event: 'AUCTION_STATE_UPDATE' }, (payload) => {
      if (payload?.payload) {
        this.notifyStateListeners(payload.payload, 'supabase_broadcast');
      }
    });

    this.broadcastSupabaseChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('🟢 Supabase Realtime broadcast channel connected: SUBSCRIBED');
        this.setStatus('CONNECTED');
        this.fetchLatestState();
      } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
        console.warn('⚠️ Supabase Broadcast channel notice:', status);
        this.setStatus('RECONNECTING');
      } else if (status === 'CLOSED') {
        this.setStatus('DISCONNECTED');
      }
    });

    // 2. DATABASE REPLICATION CHANNEL (Postgres row updates)
    try {
      this.dbSupabaseChannel = supabase.channel('mpl_auction_db');
      this.dbSupabaseChannel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'auction_state' },
        (payload) => {
          if (payload?.new?.full_snapshot) {
            this.notifyStateListeners(payload.new.full_snapshot, 'supabase_postgres');
          }
        }
      );
      this.dbSupabaseChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('🟢 Supabase Postgres changes channel connected: SUBSCRIBED');
        }
      });
    } catch (err) {
      console.warn('Notice setting up Postgres changes channel:', err);
    }
  }

  /**
   * Fetch the authoritative latest auction state from Supabase Database
   */
  async fetchLatestState() {
    try {
      const { data, error } = await supabase
        .from('auction_state')
        .select('*')
        .eq('id', 'current')
        .maybeSingle();

      if (error) {
        return null;
      }

      if (data && data.full_snapshot && typeof data.full_snapshot === 'object') {
        this.notifyStateListeners(data.full_snapshot, 'supabase_initial_fetch');
        return data.full_snapshot;
      }
    } catch (err) {
      // Graceful fallback
    }
    return null;
  }

  /**
   * Broadcast updated state from Admin to all connected devices in real time
   * @param {Object} state - Authoritative auction state
   */
  sendState(state) {
    if (!state) return;

    // 1. Same-device multi-tab instantaneous sync
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'STATE_UPDATE', payload: state });
      } catch (err) {
        console.warn('BroadcastChannel error:', err);
      }
    }

    // 2. Cloud Realtime Broadcast (Admin -> All Connected Devices globally)
    if (this.broadcastSupabaseChannel) {
      try {
        this.broadcastSupabaseChannel.send({
          type: 'broadcast',
          event: 'AUCTION_STATE_UPDATE',
          payload: state
        }).catch((err) => {
          console.warn('Supabase broadcast send notice:', err);
        });
      } catch (err) {
        console.warn('Supabase broadcast send error:', err);
      }
    }

    // 3. Persist asynchronously to Supabase Postgres database
    this.persistStateToDb(state);
  }

  /**
   * Asynchronously upsert current auction state to Supabase Postgres database
   */
  async persistStateToDb(state) {
    if (this.isSyncingToDb) return;
    this.isSyncingToDb = true;

    try {
      const dbPayload = {
        id: 'current',
        auction_phase: state.stage || 'HOME',
        current_category_key: state.currentCategoryKey || 'BOWLERS',
        current_player_id: state.currentPlayerData ? String(state.currentPlayerData.number || state.currentPlayerData.id) : null,
        current_player_data: state.currentPlayerData || null,
        player_statuses: state.playerStatuses || {},
        unsold_round_processed: state.unsoldRoundProcessed || [],
        team_assignments: state.teamAssignments || {},
        full_snapshot: state,
        main_auction_completed: state.stage === 'MAIN_COMPLETED' || state.stage === 'FINAL_COMPLETED',
        unsold_round_started: state.stage === 'UNSOLD_ROUND',
        auction_completed: state.stage === 'FINAL_COMPLETED',
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('auction_state')
        .upsert(dbPayload, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase database upsert notice:', error.message);
      }
    } catch (err) {
      console.warn('Failed to persist state to Supabase database:', err);
    } finally {
      this.isSyncingToDb = false;
    }
  }

  /**
   * Log player sale to auction_history table
   */
  async logSaleToHistory(playerData, team, boughtPrice, auctionRound = 'MAIN_AUCTION') {
    try {
      const record = {
        player_id: String(playerData.id || playerData.number),
        player_number: Number(playerData.number || playerData.id),
        player_name: String(playerData.name || '').toUpperCase(),
        role: String(playerData.role || '').toUpperCase(),
        team_id: String(team.id),
        team_name: String(team.name),
        bought_price: Number(boughtPrice),
        auction_round: String(auctionRound),
        action: 'PURCHASE',
        sold_at: new Date().toISOString()
      };

      await supabase.from('auction_history').insert(record);

      // Also update team points & player count in teams table
      if (team.id) {
        await supabase
          .from('teams')
          .update({
            remaining_points: team.remainingPoints - boughtPrice,
            player_count: team.playerCount + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', team.id);
      }
    } catch (err) {
      console.warn('Notice logging sale to Supabase history:', err);
    }
  }

  /**
   * Reset the auction state in Supabase Database
   */
  async resetRemoteState() {
    try {
      const resetSnapshot = {
        stage: 'HOME',
        currentCategoryKey: 'BOWLERS',
        playerStatuses: {},
        unsoldRoundProcessed: [],
        teamAssignments: {},
        auctionHistory: [],
        currentPlayerData: null
      };

      await supabase
        .from('auction_state')
        .upsert({
          id: 'current',
          auction_phase: 'HOME',
          current_category_key: 'BOWLERS',
          current_player_id: null,
          current_player_data: null,
          player_statuses: {},
          unsold_round_processed: [],
          team_assignments: {},
          full_snapshot: resetSnapshot,
          main_auction_completed: false,
          unsold_round_started: false,
          auction_completed: false,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      // Reset team points in Supabase
      await supabase
        .from('teams')
        .update({
          remaining_points: 25000,
          player_count: 0,
          updated_at: new Date().toISOString()
        })
        .neq('id', 'non-existent');

      // Clear auction history in Supabase
      await supabase
        .from('auction_history')
        .delete()
        .neq('id', 0);
    } catch (err) {
      console.warn('Notice resetting Supabase remote state:', err);
    }
  }
}

export const realtimeService = new RealtimeAuctionService();
export default realtimeService;
