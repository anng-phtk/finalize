export type AppState = {
    leftPaneState: PaneState;
    rightPaneState: PaneState;
    footerState: PaneState;
}

export type PaneState = 'expanded' | 'collapsed' | 'invisible' | 'default';

export type ChartViewState = 'invisible' | 'visible' | 'default';