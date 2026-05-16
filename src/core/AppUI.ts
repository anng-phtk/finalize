import { FundamentalChart } from "../components/FundamentalChart";
import { FundamentalsTable } from "../components/FundamentalsTable";
import { PeerComparison } from "../components/PeerComparison";
import { PeerComparisonChart } from "../components/PeerComparisonChart";
import { Toolbar } from "../components/Toolbar";
import { WatchListTable } from "../components/WatchListTable";
import { FilingsListTable } from "../components/FilingsListTable";
import type { AppState, PaneState } from "../contracts/UIContracts";

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

export async function initializeComponents() {
    console.log(`called`);
    try {
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
    } catch (err) {
        console.error('Initialization error:', err);
    }
}


export const toggleChartArea = (paneId: string) => {
    const pane = document.getElementById(paneId);
    if (!pane) return;
    pane.classList.toggle('collapsed-vertical');
};