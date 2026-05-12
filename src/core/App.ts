import { fundamentalsAdapter } from "../adapters/FundamentalsAdapter";
import { FundamentalsTable } from "../components/FundamentalsTable";
import { PeerComparison } from "../components/PeerComparison";
import { Toolbar } from "../components/Toolbar";
import { WatchListTable } from "../components/WatchListTable";
import type { AdaptedFundamentals, ReportTypes, ToolbarFetchRequest } from "../contracts/AppContracts";
import type { WatchlistTickerSelected } from "../contracts/WatchlistContracts";
import { fundamentalsStore } from "../store/FundamentalsStore";
import { peersStore } from "../store/TickerPeersStore";
import { tickerResearchStore } from "../store/TickerResearchStore";
import { API } from "./Api";
import { eventBus } from "./EventBus";

document.addEventListener('DOMContentLoaded', async () => {
    console.log('App Started');
    initializeLayout();
    await initializeComponents();
});

let fundamentalsTable: FundamentalsTable;
let peerComparison: PeerComparison;


eventBus.on('Toolbar:Fetch:Clicked', async (payload: ToolbarFetchRequest) => {
    // 1. Ensure data for main ticker
    await ensureFundamentalsData(payload.ticker, payload.formType, payload.refresh, true);

    // 2. Ensure data for peers
    if (payload.peers && payload.peers.length > 0) {
        peersStore.setPeers(payload.ticker, payload.peers);

        await Promise.allSettled(
            payload.peers.map(peer => ensureFundamentalsData(peer, payload.formType, payload.refresh))
        );
    }

    // 3. Get Watchlist data
    await ensureResearchData(payload.ticker, payload.refresh, true);

    if (payload.peers && payload.peers.length > 0) {
        await Promise.allSettled(
            payload.peers.map(peer => ensureResearchData(peer, payload.refresh))
        );
    }
});


const ensureResearchData = async (ticker: string, refresh: boolean, emitEventForPrimary: boolean = false) => {
    let researchData = tickerResearchStore.get(ticker);
    if (researchData && !refresh) {
        return;
    }
    researchData = await API.fetchResearchData(ticker, refresh);
    tickerResearchStore.set(ticker, researchData);
    if (emitEventForPrimary) eventBus.emit('WatchList:Ticker:DataReady', { ticker });
    else eventBus.emit('WatchList:Peers:DataReady', { ticker });
}


const ensureFundamentalsData = async (ticker: string, formType: ReportTypes["formType"], refresh: boolean, emitEventForPrimary: boolean = false) => {
    let adaptedData: AdaptedFundamentals | undefined;

    // 1. If refresh is false: look for adapted data in cache
    if (!refresh) {
        const cached = fundamentalsStore.get(ticker, formType);
        if (cached) {
            adaptedData = cached.data;
        }
    }

    // 2. If cache miss (or refresh is true): fetch, adapt, and store
    if (!adaptedData) {
        try {
            console.log(`Fetching data for ${ticker}...`);
            const rawData = await API.fetchFundamentals({ ticker, formType, refresh });
            adaptedData = fundamentalsAdapter.adaptData(rawData);
            fundamentalsStore.set(ticker, formType, adaptedData);
        } catch (error) {
            console.error(`Failed to fetch data for ${ticker}:`, error);
            return;
        }
    }

    // 3. Emit data-ready event
    if (emitEventForPrimary) eventBus.emit('Fundamentals:Ticker:DataReady', { ticker, formType });
    else eventBus.emit('Fundamentals:Peer:DataReady', { ticker, formType });
};


eventBus.on('Fundamentals:FilingForm:TextRequested', async (payload) => {
    console.log('Filing text requested, calling API...', payload);
    const text = await API.fetchFilingText(payload.ticker, payload.period, payload.url);
    console.log('Received filing text:', text);
    // Future: emit an event to show this text in a viewer component
});
eventBus.on("WatchList:Ticker:Selected", (payload: WatchlistTickerSelected) => {
    const peers = peersStore.getPeers(payload.ticker);
    eventBus.emit("Toolbar:Defaults:Requested", {
        ...payload,
        peers
    });
});




async function initializeComponents() {
    console.log(`called`);
    try {
        let toolbar = new Toolbar('toolbar-container', '/components/toolbar/toolbar.html');
        await toolbar.mount();

        fundamentalsTable = new FundamentalsTable('main-content', '/components/fundamentals-viewer/fundamentals-table.html');
        await fundamentalsTable.mount();

        peerComparison = new PeerComparison('main-content', '/components/peer-comparison/peer-comparison.html');
        // It will mount on demand via events

        let watchlist = new WatchListTable('watchlist-container', '/components/watchlist-viewer/watchlist-table.html');
        await watchlist.mount();
    } catch (err) {
        console.log(err)
    }
}

// Handle view swapping
eventBus.on('Fundamentals:Ticker:DataReady', async (payload) => {
    await fundamentalsTable.mount();
    const cached = fundamentalsStore.get(payload.ticker, payload.formType);
    if (cached) {
        fundamentalsTable.renderTable(payload.ticker, payload.formType, cached.data);
    }
});

eventBus.on('Toolbar:Comparison:Requested', async (payload) => {
    await peerComparison.mount();
    peerComparison.loadAndRender(payload.ticker, payload.peers);
});


function initializeLayout() {
    const leftPane = document.getElementById('main-left') || null;
    const collapseLeftBtn = document.getElementById('btn-collapse-left');
    const expandLeftBtn = document.getElementById('btn-expand-left')
    leftPane?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (leftPane?.classList.contains('collapsed')) leftPane?.classList.toggle('collapsed');

    });

    collapseLeftBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (leftPane?.classList.contains('expanded')) leftPane?.classList.remove('expanded')
        if (!leftPane?.classList.contains('collapsed')) leftPane?.classList.add('collapsed');
    });

    expandLeftBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        leftPane?.classList.toggle('expanded');
    })


    const rightPane = document.getElementById('main-right') || null;
    const collapseRightBtn = document.getElementById('btn-collapse-right');
    const expandRightBtn = document.getElementById('btn-expand-right');

    rightPane?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (rightPane?.classList.contains('collapsed')) rightPane?.classList.toggle('collapsed');

    });

    collapseRightBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (rightPane?.classList.contains('expanded')) rightPane?.classList.remove('expanded')
        if (!rightPane?.classList.contains('collapsed')) rightPane?.classList.add('collapsed');
    });

    expandRightBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        rightPane?.classList.toggle('expanded');
    });


    const footerPane = document.getElementById('main-footer') || null;

    footerPane?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (footerPane?.classList.contains('collapsed-vertical')) footerPane?.classList.toggle('collapsed-vertical');

    });

    document.getElementById('btn-collapse-footer')?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!footerPane?.classList.contains('collapsed-vertical')) footerPane?.classList.add('collapsed-vertical');
    });
}