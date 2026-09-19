/**
 * MPL S4 - 200-User Load & Reliability Automation Test Runner
 */
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

const SUPABASE_URL = 'https://fwcvbxeyqwvtojqrhewq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_MV8rFe45liwh7WiUvL3rvw_7RTOr4oN';

const TARGET_CLIENTS = 200;
const BATCH_SIZE = 15;
const BATCH_DELAY_MS = 250; // stagger channel joins to prevent bursting >100 joins/sec

console.log('====================================================');
console.log(`Starting MPL S4 Load & Reliability Test: Target ${TARGET_CLIENTS} Clients`);
console.log('====================================================');

const clients = [];
const stats = {
  attempted: 0,
  subscribed: 0,
  timedOut: 0,
  channelError: 0,
  closed: 0,
  errors: []
};

// Create an Admin client for broadcasting and DB operations
const adminClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: { websocket: WebSocket, params: { eventsPerSecond: 20 } }
});

const adminLiveChannel = adminClient.channel('mpl_auction_live', {
  config: { broadcast: { self: false, ack: true } }
});

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectAdmin() {
  return new Promise((resolve, reject) => {
    adminLiveChannel.subscribe((status) => {
      console.log(`[Admin] Broadcast Channel Status: ${status}`);
      if (status === 'SUBSCRIBED') resolve();
      if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') reject(new Error(status));
    });
  });
}

// Client factory
function createTestClient(id) {
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    realtime: {
      websocket: WebSocket,
      params: { eventsPerSecond: 10 }
    }
  });

  const clientData = {
    id,
    sb,
    liveChannel: null,
    status: 'INITIAL',
    receivedEvents: [],
    disconnect: () => {
      if (clientData.liveChannel) {
        try { sb.removeChannel(clientData.liveChannel); } catch (e) {}
      }
    }
  };

  const ch = sb.channel('mpl_auction_live', {
    config: { broadcast: { self: false, ack: false } }
  });

  ch.on('broadcast', { event: 'AUCTION_STATE_UPDATE' }, (payload) => {
    const receivedAt = Date.now();
    clientData.receivedEvents.push({
      event: 'AUCTION_STATE_UPDATE',
      payload: payload?.payload,
      receivedAt
    });
  });

  ch.subscribe((status) => {
    clientData.status = status;
    if (status === 'SUBSCRIBED') {
      stats.subscribed++;
    } else if (status === 'TIMED_OUT') {
      stats.timedOut++;
    } else if (status === 'CHANNEL_ERROR') {
      stats.channelError++;
    } else if (status === 'CLOSED') {
      stats.closed++;
    }
  });

  clientData.liveChannel = ch;
  return clientData;
}

async function main() {
  try {
    console.log('\n--- STEP 1: Connecting Admin Channel ---');
    await connectAdmin();
    console.log('✅ Admin broadcast channel connected and ready.');

    console.log(`\n--- STEP 2: Ramping up ${TARGET_CLIENTS} concurrent User Mode clients ---`);
    const startTime = Date.now();

    for (let i = 0; i < TARGET_CLIENTS; i += BATCH_SIZE) {
      const batchEnd = Math.min(i + BATCH_SIZE, TARGET_CLIENTS);
      for (let j = i; j < batchEnd; j++) {
        stats.attempted++;
        const c = createTestClient(j + 1);
        clients.push(c);
      }
      process.stdout.write(`\rConnecting clients... [${clients.length}/${TARGET_CLIENTS}]`);
      await sleep(BATCH_DELAY_MS);
    }
    console.log('\nAll client join requests dispatched. Waiting 5s for subscriptions to settle...');
    await sleep(5000);

    const connectionDuration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\nConnection Ramp-Up Completed in ${connectionDuration}s:`);
    console.log(`- Attempted:      ${stats.attempted}`);
    console.log(`- SUBSCRIBED:     ${stats.subscribed} (${((stats.subscribed / stats.attempted) * 100).toFixed(1)}%)`);
    console.log(`- TIMED_OUT:      ${stats.timedOut}`);
    console.log(`- CHANNEL_ERROR:  ${stats.channelError}`);
    console.log(`- CLOSED:         ${stats.closed}`);

    // Verify Active Connected Clients
    const activeClients = clients.filter(c => c.status === 'SUBSCRIBED');
    console.log(`- Currently Active Connected: ${activeClients.length}`);

    // ==========================================
    // STEP 3: Admin -> 200 Users Event Broadcasts
    // ==========================================
    console.log('\n--- STEP 3: Admin Broadcast Tests ---');

    // Event A: SHOW PLAYER #48
    console.log('\n[Event A] SHOW PLAYER #48:');
    const showPayload = {
      stage: 'MAIN_AUCTION',
      currentCategoryKey: 'Bowler',
      currentPlayerData: {
        id: 'Bowler_48',
        number: '48',
        category: 'Bowler',
        path: '/photos/Bowler/48.png',
        fileName: '48.png',
        status: 'BIDDING'
      },
      playerStatuses: {},
      teamAssignments: {},
      auctionHistory: [],
      timestamp: Date.now()
    };

    const sendTimeA = Date.now();
    await adminLiveChannel.send({
      type: 'broadcast',
      event: 'AUCTION_STATE_UPDATE',
      payload: showPayload
    });

    // Also persist to DB as real Admin does
    await adminClient.from('auction_state').upsert({
      id: 'current',
      auction_phase: 'MAIN_AUCTION',
      current_category_key: 'Bowler',
      current_player_id: '48',
      current_player_data: showPayload.currentPlayerData,
      full_snapshot: showPayload,
      updated_at: new Date().toISOString()
    });

    await sleep(2500);

    // Measure Event A delivery
    const receivedCountA = activeClients.filter(c =>
      c.receivedEvents.some(e => e.payload?.currentPlayerData?.number === '48' && e.payload?.currentPlayerData?.status === 'BIDDING')
    ).length;
    const latenciesA = activeClients
      .map(c => {
        const ev = c.receivedEvents.find(e => e.payload?.currentPlayerData?.number === '48');
        return ev ? ev.receivedAt - sendTimeA : null;
      })
      .filter(l => l !== null);
    const avgLatencyA = latenciesA.length ? (latenciesA.reduce((a, b) => a + b, 0) / latenciesA.length).toFixed(1) : 0;
    const maxLatencyA = latenciesA.length ? Math.max(...latenciesA) : 0;

    console.log(`- Event A Delivered: ${receivedCountA} / ${activeClients.length} (${((receivedCountA / activeClients.length) * 100).toFixed(1)}%)`);
    console.log(`- Latency: Avg ${avgLatencyA}ms | Max ${maxLatencyA}ms`);

    // Event B: SOLD Player #48 to MADATHUR GPNCC for 3000 points
    console.log('\n[Event B] SOLD Player #48 -> MADATHUR GPNCC (3000 pts):');
    const soldPayload = {
      stage: 'MAIN_AUCTION',
      currentCategoryKey: 'Bowler',
      currentPlayerData: {
        id: 'Bowler_48',
        number: '48',
        category: 'Bowler',
        path: '/photos/Bowler/48.png',
        fileName: '48.png',
        status: 'ASSIGNED',
        teamName: 'MADATHUR GPNCC',
        boughtPrice: 3000,
        playerName: 'Player #48',
        role: 'Bowler'
      },
      playerStatuses: { 'Bowler_48': 'SOLD' },
      teamAssignments: {
        'Bowler_48': {
          playerId: 'Bowler_48',
          playerNumber: '48',
          name: 'Player #48',
          role: 'Bowler',
          teamId: 'team-9',
          teamName: 'MADATHUR GPNCC',
          boughtPrice: 3000,
          timestamp: '12:00 PM'
        }
      },
      auctionHistory: [
        {
          id: `hist_${Date.now()}`,
          timestamp: '12:00 PM',
          playerId: 'Bowler_48',
          playerNumber: '48',
          name: 'Player #48',
          role: 'Bowler',
          teamName: 'MADATHUR GPNCC',
          price: 3000,
          action: 'PURCHASE'
        }
      ],
      timestamp: Date.now()
    };

    const sendTimeB = Date.now();
    await adminLiveChannel.send({
      type: 'broadcast',
      event: 'AUCTION_STATE_UPDATE',
      payload: soldPayload
    });

    // DB Upsert for SOLD
    await adminClient.from('auction_state').upsert({
      id: 'current',
      auction_phase: 'MAIN_AUCTION',
      current_category_key: 'Bowler',
      current_player_id: '48',
      current_player_data: soldPayload.currentPlayerData,
      player_statuses: soldPayload.playerStatuses,
      team_assignments: soldPayload.teamAssignments,
      full_snapshot: soldPayload,
      updated_at: new Date().toISOString()
    });

    // Log to auction_history table
    await adminClient.from('auction_history').insert({
      player_id: 'Bowler_48',
      player_number: 48,
      player_name: 'PLAYER #48',
      role: 'BOWLER',
      team_id: 'team-9',
      team_name: 'MADATHUR GPNCC',
      bought_price: 3000,
      auction_round: 'MAIN_AUCTION',
      action: 'PURCHASE',
      sold_at: new Date().toISOString()
    });

    // Update teams table
    await adminClient.from('teams').update({
      remaining_points: 25000 - 3000,
      player_count: 1,
      updated_at: new Date().toISOString()
    }).eq('id', 'team-9');

    await sleep(2500);

    const receivedCountB = activeClients.filter(c =>
      c.receivedEvents.some(e => e.payload?.currentPlayerData?.status === 'ASSIGNED' && e.payload?.currentPlayerData?.teamName === 'MADATHUR GPNCC')
    ).length;
    console.log(`- Event B Delivered: ${receivedCountB} / ${activeClients.length} (${((receivedCountB / activeClients.length) * 100).toFixed(1)}%)`);

    // Event C: UNSOLD Player #107 (Bowler)
    console.log('\n[Event C] UNSOLD Player #107:');
    const unsoldPayload = {
      stage: 'MAIN_AUCTION',
      currentCategoryKey: 'Bowler',
      currentPlayerData: {
        id: 'Bowler_107',
        number: '107',
        category: 'Bowler',
        path: '/photos/Bowler/107.png',
        fileName: '107.png',
        status: 'UNSOLD'
      },
      playerStatuses: { 'Bowler_48': 'SOLD', 'Bowler_107': 'UNSOLD' },
      teamAssignments: soldPayload.teamAssignments,
      auctionHistory: soldPayload.auctionHistory,
      timestamp: Date.now()
    };

    await adminLiveChannel.send({
      type: 'broadcast',
      event: 'AUCTION_STATE_UPDATE',
      payload: unsoldPayload
    });

    await adminClient.from('auction_state').upsert({
      id: 'current',
      auction_phase: 'MAIN_AUCTION',
      current_category_key: 'Bowler',
      current_player_id: '107',
      current_player_data: unsoldPayload.currentPlayerData,
      player_statuses: unsoldPayload.playerStatuses,
      team_assignments: unsoldPayload.teamAssignments,
      full_snapshot: unsoldPayload,
      updated_at: new Date().toISOString()
    });

    await sleep(2500);

    const receivedCountC = activeClients.filter(c =>
      c.receivedEvents.some(e => e.payload?.currentPlayerData?.number === '107' && e.payload?.currentPlayerData?.status === 'UNSOLD')
    ).length;
    console.log(`- Event C Delivered: ${receivedCountC} / ${activeClients.length} (${((receivedCountC / activeClients.length) * 100).toFixed(1)}%)`);

    // ==========================================
    // STEP 4: Database Source of Truth Verification
    // ==========================================
    console.log('\n--- STEP 4: Database Source of Truth Verification ---');
    const { data: dbState } = await adminClient.from('auction_state').select('*').eq('id', 'current').single();
    const { data: dbHistory, count: histCount } = await adminClient.from('auction_history').select('*', { count: 'exact' });
    const { data: dbTeam } = await adminClient.from('teams').select('*').eq('id', 'team-9').single();

    console.log('Database Check:');
    console.log(`- auction_state current player: #${dbState?.current_player_id} (Status: ${dbState?.current_player_data?.status})`);
    console.log(`- auction_state player_statuses: ${JSON.stringify(dbState?.player_statuses)}`);
    console.log(`- auction_history count: ${histCount} (Latest: ${dbHistory?.[0]?.player_name} to ${dbHistory?.[0]?.team_name} @ ${dbHistory?.[0]?.bought_price})`);
    console.log(`- teams (MADATHUR GPNCC): Remaining Points: ${dbTeam?.remaining_points} (Expected: 22000), Player Count: ${dbTeam?.player_count} (Expected: 1)`);

    const dbIntegrityPass =
      dbState?.current_player_id === '107' &&
      dbState?.player_statuses?.['Bowler_48'] === 'SOLD' &&
      dbState?.player_statuses?.['Bowler_107'] === 'UNSOLD' &&
      histCount >= 1 &&
      dbTeam?.remaining_points === 22000 &&
      dbTeam?.player_count === 1;
    console.log(`Database Source of Truth Pass: ${dbIntegrityPass ? '✅ PASS' : '❌ FAIL'}`);

    // ==========================================
    // STEP 5: Disconnect & Reconnect Test
    // ==========================================
    console.log('\n--- STEP 5: Disconnect & Reconnect Recovery Test ---');
    // Take 10 clients, disconnect them
    const testCohort = activeClients.slice(0, 10);
    console.log(`Simulating temporary network drop for 10 clients...`);
    for (const c of testCohort) {
      c.disconnect();
    }
    await sleep(1000);

    // Admin performs another action while they are disconnected:
    // Reveal Bowler #108
    console.log('Admin reveals Player #108 while 10 clients are disconnected...');
    const nextPlayerPayload = {
      stage: 'MAIN_AUCTION',
      currentCategoryKey: 'Bowler',
      currentPlayerData: {
        id: 'Bowler_108',
        number: '108',
        category: 'Bowler',
        path: '/photos/Bowler/108.png',
        fileName: '108.png',
        status: 'BIDDING'
      },
      playerStatuses: { 'Bowler_48': 'SOLD', 'Bowler_107': 'UNSOLD' },
      teamAssignments: soldPayload.teamAssignments,
      auctionHistory: soldPayload.auctionHistory,
      timestamp: Date.now()
    };

    // Update DB
    await adminClient.from('auction_state').upsert({
      id: 'current',
      auction_phase: 'MAIN_AUCTION',
      current_category_key: 'Bowler',
      current_player_id: '108',
      current_player_data: nextPlayerPayload.currentPlayerData,
      player_statuses: nextPlayerPayload.playerStatuses,
      team_assignments: nextPlayerPayload.teamAssignments,
      full_snapshot: nextPlayerPayload,
      updated_at: new Date().toISOString()
    });

    // Broadcast to the rest of the world
    await adminLiveChannel.send({
      type: 'broadcast',
      event: 'AUCTION_STATE_UPDATE',
      payload: nextPlayerPayload
    });

    console.log('Reconnecting the 10 clients and fetching authoritative state from DB...');
    let recoveredCount = 0;
    for (const c of testCohort) {
      // simulate fetchLatestState()
      const { data: latest } = await c.sb.from('auction_state').select('*').eq('id', 'current').single();
      if (latest?.full_snapshot?.currentPlayerData?.number === '108') {
        recoveredCount++;
      }
    }
    console.log(`- Reconnected Clients Recovered Latest State from DB: ${recoveredCount} / 10 (${((recoveredCount / 10) * 100).toFixed(0)}%)`);

    // Clean up all clients
    console.log('\n--- CLEANUP: Disconnecting all test clients ---');
    for (const c of clients) {
      c.disconnect();
    }
    adminClient.removeChannel(adminLiveChannel);
    console.log('All test connections cleanly closed.');

    console.log('\n====================================================');
    console.log('TEST SUMMARY COMPLETED');
    console.log('====================================================');
  } catch (err) {
    console.error('Fatal error during load test:', err);
  }
}

main();
