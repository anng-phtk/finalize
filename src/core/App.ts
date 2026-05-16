import { initializeLayout, initializeComponents, peerComparison, fundamentalsTable, setPaneState, setElementVisibility, toggleChartArea } from "./AppUI";

import { fundamentalsAdapter } from "../adapters/FundamentalsAdapter";
import type { AdaptedFundamentals, ReportTypes, ToolbarFetchRequest } from "../contracts/FundamentalsContracts";
import type { WatchlistTickerSelected } from "../contracts/WatchlistContracts";
import { fundamentalsStore } from "../store/FundamentalsStore";
import { filingsStore } from "../store/FilingsStore";
import { peersStore } from "../store/TickerPeersStore";
import { tickerResearchStore } from "../store/TickerResearchStore";
import { API } from "./Api";
import { eventBus } from "./EventBus";
import { fundamentalChartStore } from "../store/FundamentalChartStore";
import { peerChartStore } from "../store/PeerChartStore";
//-------------------------
// ALL DOM EVENT LISTENERS
//-------------------------
document.addEventListener('DOMContentLoaded', async () => {
    console.log('App Started');
    initializeLayout({
        leftPaneState: 'collapsed',
        rightPaneState: 'collapsed',
        footerState: 'collapsed'
    });
    await initializeComponents();
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
    else eventBus.emit('Fundamentals:Peer:DataReady', { ticker, peers: peersStore.getPeers(ticker) });
};

const ensureFilingsData = async (ticker: string, refresh: boolean) => {
    let hasData = filingsStore.get(ticker) !== undefined;
    if (hasData && !refresh) {
        eventBus.emit('Filings:History:DataReady', { ticker });
        return;
    }

    try {
        console.log(`Fetching filings history for ${ticker}...`);
        const data = await API.fetchFilingHistory(ticker, refresh);
        filingsStore.set(ticker, data);
        eventBus.emit('Filings:History:DataReady', { ticker });
    } catch (error) {
        console.error(`Failed to fetch filings for ${ticker}:`, error);
        eventBus.emit('Filings:History:DataError', { ticker, cause: error });
    }
};

//-------------------------
// ALL EVENT BUS LISTENERS
//-------------------------

eventBus.on('Toolbar:Fetch:Clicked', async (payload: ToolbarFetchRequest) => {
    // 1. Reset state for new fetch
    fundamentalChartStore.clear();
    peerChartStore.clear();

    // 2. Ensure table is mounted
    await fundamentalsTable?.mount();

    // 2. Ensure data for main ticker
    await ensureFundamentalsData(payload.ticker, payload.formType, payload.refresh, true);

    // 3. Ensure data for peers
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

    // 4. Get Filings Data
    await ensureFilingsData(payload.ticker, payload.refresh);
});
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


eventBus.on('Toolbar:Comparison:Requested', async (payload: { ticker: string, peers: string[] }) => {
    console.log('Toolbar:Comparison:Requested - Ensuring ANNUAL data for group', payload);

    const allTickers = [payload.ticker, ...payload.peers];

    // 1. Fetch missing ANNUAL data for all tickers in the group
    await Promise.allSettled(
        allTickers.map(t => ensureFundamentalsData(t, 'ANNUAL', false))
    );

    // 2. Mount and Emit
    await peerComparison?.mount();

    eventBus.emit('Fundamentals:Peer:DataReady', {
        peers: payload.peers,
        ticker: payload.ticker
    });
});

eventBus.on('Fundamentals:Chart:SeriesAdded', (payload) => {
    fundamentalChartStore.addSeries({
        ticker: payload.ticker,
        metricKey: payload.metricKey,
        label: payload.label,
        data: payload.data,
        unit: payload.unit
    }, payload.periods);
});

eventBus.on('Peer:Chart:SeriesAdded', (payload) => {
    peerChartStore.addMetric({
        metricKey: payload.metricKey,
        label: payload.label,
        unit: payload.unit
    }, payload.peers);
});

eventBus.on('Toolbar:Clear:Clicked', () => {
    console.log('Toolbar:Clear:Clicked - Clearing all stores');
    fundamentalChartStore.clear();
    peerChartStore.clear();
});


let rightPaneCollapseTimeout: any = null;
let leftPaneCollapseTimeout: any = null;

const checkLeftPaneAutoState = () => {
    // Left pane has data if either fundamentals OR filings exist
    if (fundamentalsStore.hasData() || filingsStore.hasData()) {
        setPaneState('main-left', 'default');
    } else {
        if (!leftPaneCollapseTimeout) {
            leftPaneCollapseTimeout = setTimeout(() => {
                setPaneState('main-left', 'collapsed');
            }, 500);
        }
    }
}

eventBus.on('WatchList:Ticker:DataReady', () => {
    checkLeftPaneAutoState();
});

eventBus.on('Fundamentals:Ticker:DataReady', () => {
    checkLeftPaneAutoState();
});

eventBus.on('Filings:History:DataReady', () => {
    checkLeftPaneAutoState();
});

eventBus.on('Fundamentals:Peer:DataReady', () => {
    checkLeftPaneAutoState();
});
eventBus.on('Fundamentals:Chart:SeriesAdded', () => {
    setPaneState('main-left', 'collapsed');
});
eventBus.on('Peer:Chart:SeriesAdded', () => {
    setPaneState('main-left', 'collapsed');
});

eventBus.on('Peer:Chart:Collapse', () => {
    toggleChartArea('right-applet-primary');
})

const checkRightPaneAutoState = () => {
    const isPrimaryVisible = !document.getElementById('right-applet-primary')?.classList.contains('invisible');
    const isSecondaryVisible = !document.getElementById('right-applet-secondary')?.classList.contains('invisible');

    if (!isPrimaryVisible && !isSecondaryVisible) {
        // Both charts empty -> start collapse timer
        if (!rightPaneCollapseTimeout) {
            rightPaneCollapseTimeout = setTimeout(() => {
                setPaneState('main-right', 'collapsed');
            }, 500);
        }
    } else {
        // At least one chart has data -> cancel timer and expand
        if (rightPaneCollapseTimeout) {
            clearTimeout(rightPaneCollapseTimeout);
            rightPaneCollapseTimeout = null;
        }

        // Only expand if currently collapsed
        const rightPane = document.getElementById('main-right');
        if (rightPane?.classList.contains('collapsed')) {
            setPaneState('main-right', 'expanded');
        }
    }
};

eventBus.on('Fundamentals:Chart:DataChanged', (payload) => {
    const hasData = payload.series.length > 0;
    setElementVisibility('right-applet-primary', hasData);
    checkRightPaneAutoState();
});

eventBus.on('Peer:Chart:DataChanged', (payload) => {
    const hasData = payload.metrics.length > 0;
    setElementVisibility('right-applet-secondary', hasData);
    checkRightPaneAutoState();
});
