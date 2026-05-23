import { FundamentalChart } from "../components/FundamentalChart";
import { FundamentalsTable } from "../components/FundamentalsTable";
import { PeerComparison } from "../components/PeerComparison";
import { PeerComparisonChart } from "../components/PeerComparisonChart";
import { Toolbar } from "../components/Toolbar";
import { WatchListTable } from "../components/WatchListTable";
import { FilingsListTable } from "../components/FilingsListTable";
import { FilingsReader } from "../components/FilingsReader";
import type { AppState, PaneState } from "../contracts/UIContracts";
import { initializeToast } from "../components/Toast";
import { StockInsights } from "../components/StockInsights";
import { KeyEvents } from "../components/KeyEvents";
import { PriceAction } from "../components/PriceAction";
import { ValuationDCF } from "../components/ValuationDCF";

export function setElementVisibility(id: string, isVisible: boolean) {
    const el = document.getElementById(id);
    if (!el) return;
    if (isVisible) el.classList.remove('invisible');
    else el.classList.add('invisible');
}

export function setPaneState(paneId: string, state: PaneState) {
    const pane = document.getElementById(paneId);
    if (!pane) return;

    // Remove all possible state classes
    pane.classList.remove('expanded', 'collapsed', 'invisible', 'collapsed-vertical');

    // Add the new state class
    if (state === 'default') return; // Default uses the base CSS widths

    if (paneId === 'main-footer' && state === 'collapsed') {
        pane.classList.add('collapsed-vertical');
    } else {
        pane.classList.add(state);
    }
}

export function initializeLayout(initialState: AppState | null = null) {
    const state: AppState = initialState || {
        leftPaneState: "collapsed",
        rightPaneState: "collapsed",
        footerState: "collapsed",
    };

    // Apply initial states
    setPaneState('main-left', state.leftPaneState);
    setPaneState('main-right', state.rightPaneState);
    setPaneState('main-footer', state.footerState);

    // Helper to toggle between two states
    const toggleStates = (paneId: string, primaryState: PaneState, secondaryState: PaneState) => {
        const pane = document.getElementById(paneId);
        if (!pane) return;

        const currentState = pane.classList.contains(primaryState) ? primaryState :
            (pane.classList.contains(secondaryState) ? secondaryState : 'default');

        if (currentState === primaryState) {
            setPaneState(paneId, secondaryState);
        } else {
            setPaneState(paneId, primaryState);
        }
    };

    // Left Pane Listeners
    document.getElementById('btn-collapse-left')?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleStates('main-left', 'collapsed', 'default');
    });
    document.getElementById('btn-expand-left')?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleStates('main-left', 'expanded', 'default');
    });
    document.getElementById('main-left')?.addEventListener('click', (e) => {
        const pane = e.currentTarget as HTMLElement;
        if (pane.classList.contains('collapsed')) {
            setPaneState('main-left', 'default');
        }
    });

    // Right Pane Listeners
    document.getElementById('btn-collapse-right')?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleStates('main-right', 'collapsed', 'default');
    });
    document.getElementById('btn-expand-right')?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleStates('main-right', 'expanded', 'default');
    });
    document.getElementById('main-right')?.addEventListener('click', (e) => {
        const pane = e.currentTarget as HTMLElement;
        if (pane.classList.contains('collapsed')) {
            setPaneState('main-right', 'default');
        }
    });

    // Footer Listeners
    document.getElementById('btn-collapse-footer')?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleStates('main-footer', 'collapsed', 'default');
    });
    document.getElementById('main-footer')?.addEventListener('click', (e) => {
        const pane = e.currentTarget as HTMLElement;
        if (pane.classList.contains('collapsed-vertical')) {
            setPaneState('main-footer', 'default');
        }
    });
}

export let toolbar: Toolbar | null = null;
export let fundamentalsTable: FundamentalsTable | null = null;
export let peerComparison: PeerComparison | null = null;
export let watchlist: WatchListTable | null = null;
export let filingsListTable: FilingsListTable | null = null;
export let fundamentalChart: FundamentalChart | null = null;
export let peerComparisonChart: PeerComparisonChart | null = null;
export let filingsReader: FilingsReader | null = null;
export let stockInsights: StockInsights | null = null;
export let keyEvents: KeyEvents | null = null;
export let priceAction: PriceAction | null = null;
export let valuationDCF: ValuationDCF | null = null;

export async function initializeComponents() {
    console.log(`called`);
    try {
        initializeToast();

        toolbar = new Toolbar('toolbar-container', '/components/toolbar/toolbar.html');
        await toolbar.mount();

        fundamentalsTable = new FundamentalsTable('main-content', '/components/fundamentals-viewer/fundamentals-table.html');
        await fundamentalsTable.mount();

        peerComparison = new PeerComparison('main-content', '/components/peer-comparison/peer-comparison.html');

        watchlist = new WatchListTable('watchlist-container', '/components/watchlist-viewer/watchlist-table.html');
        await watchlist.mount();

        filingsListTable = new FilingsListTable('filings-list-container', '/components/filings-viewer/filings-list-table.html');
        await filingsListTable.mount();

        fundamentalChart = new FundamentalChart('right-applet-primary', '/components/fundamentals-viewer/fundamental-chart-viewer.html');
        await fundamentalChart.mount();

        peerComparisonChart = new PeerComparisonChart('right-applet-secondary', '/components/peer-comparison/peer-comparison-chart-viewer.html');
        await peerComparisonChart.mount();

        filingsReader = new FilingsReader('filings-reader-container', '/components/filings-viewer/filings-reader.html');
        await filingsReader.mount();

        stockInsights = new StockInsights('stock-insights-container', '/components/insights/stock-insights.html');
        await stockInsights.mount();

        keyEvents = new KeyEvents('earnings-calendar-container', '/components/insights/key-events.html');
        await keyEvents.mount();

        priceAction = new PriceAction('price-action-container', '/components/insights/price-action.html');
        await priceAction.mount();

        valuationDCF = new ValuationDCF();
        await valuationDCF.mount();
    } catch (err) {
        console.error('Initialization error:', err);
    }
}


export const toggleChartArea = (paneId: string) => {
    const pane = document.getElementById(paneId);
    if (!pane) return;
    pane.classList.toggle('collapsed-vertical');
};




let rightPaneCollapseTimeout: any = null;
let leftPaneCollapseTimeout: any = null;

export const checkLeftPaneAutoState = (hasData: boolean) => {
    // Left pane has data if either fundamentals OR filings exist
    if (hasData) {
        setPaneState('main-left', 'default');
    } else {
        if (!leftPaneCollapseTimeout) {
            leftPaneCollapseTimeout = setTimeout(() => {
                setPaneState('main-left', 'collapsed');
            }, 500);
        }
    }
}

export const checkRightPaneAutoState = () => {
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