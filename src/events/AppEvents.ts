import type {
    ReportTypes,
    ToolbarFetchRequest,
    ChartSeries,
    PeerChartMetric
} from "../contracts/FundamentalsContracts";

export type AppEventsMap = FundamentalsEventsMap & WatchListEventsMap & ToolbarEventsMap & PeerComparisonEventsMap & FilingsEventsMap & ToastEventsMap & SystemEventsMap & InsightsEventsMap & ValuationEventsMap;

export interface ValuationEventsMap {
    'Valuation:Model:Load': { ticker: string; refresh: boolean };
    'Valuation:Model:Finalized': { ticker: string; data: any };
}

type InsightsEventsMap = {
    'Insights:DataReady': {
        ticker: string;
        data: any;
    };
    'KeyEvents:DataReady': {
        ticker: string;
        data: any;
    };
    'PriceHistory:DataReady': {
        ticker: string;
        data: any;
    };
};

type SystemEventsMap = {
    'System:EventBus:Activity': {
        eventName: string;
        payload: any;
    };
};

type ToastEventsMap = {
    'Request:Sent': { message: string };
    'Request:InProgress': { message: string };
    'Request:Completed': { message: string, type?: 'success' | 'error' };
};

type FilingsEventsMap = {
    'Filings:History:DataReady': {
        ticker: string;
    };
    'Filings:History:DataError': {
        ticker: string;
        cause?: unknown;
    };
    'FilingsReader:DataReady': {
        ticker: string;
        period: string;
        data: import('../contracts/FilingsContracts').FilingTextResponse;
    };
};

type PeerComparisonEventsMap = {
    'Peer:Chart:SeriesAdded': {
        metricKey: string;
        label: string;
        unit: string | null;
        peers: string[];
    };
    'Peer:Chart:DataChanged': {
        metrics: PeerChartMetric[];
        timeline: string[];
    };
    'Peer:Chart:Collapse': { containerId: string };
}

type FundamentalsEventsMap = {
    'Toolbar:Fetch:Clicked': ToolbarFetchRequest;
    'Fundamentals:Ticker:DataReady': {
        ticker: string;
        formType: ReportTypes["formType"];
    };
    'Fundamentals:Peer:DataReady': {
        ticker: string;
        peers: string[] | null;
    };
    'Fundamentals:FilingForm:TextRequested': {
        ticker: string;
        period: string;
        url: string;
    };
    'Fundamentals:Chart:SeriesAdded': {
        ticker: string;
        metricKey: string;
        label: string;
        data: (number | null)[];
        periods: string[];
        unit: string | null;
    };
    'Fundamentals:Chart:DataChanged': {
        series: ChartSeries[];
        periods: string[];
    };
};

type WatchListEventsMap = {
    'WatchList:Ticker:DataReady': {
        ticker: string;
    };
    'WatchList:Ticker:Selected': {
        ticker: string;
        formType: 'ANNUAL';
        refresh: boolean;
    };

    'WatchList:Peers:DataReady': {
        ticker: string;
    };
    'WatchList:Ticker:DataError': {
        ticker: string;
        cause?: unknown;
    };
    'WatchList:Peers:DataError': {
        ticker: string;
        cause?: unknown;
    };
}

type ToolbarEventsMap = {
    'Toolbar:Defaults:Requested': {
        ticker: string;
        formType: 'ANNUAL';
        refresh: boolean;
        peers: string[];
    };
    'Toolbar:Comparison:Requested': {
        ticker: string;
        peers: string[];
    };
    'Toolbar:Clear:Clicked': void;
    'Toolbar:Insights:Requested': { ticker: string, refresh: boolean };
    'Toolbar:Valuation:Requested': { ticker: string, refresh: boolean };
}
