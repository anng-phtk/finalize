import type { ReportTypes, ToolbarFetchRequest } from "../contracts/AppContracts";

export type AppEventsMap = FundamentalsEventsMap & WatchListEventsMap & ToolbarEventsMap;

type FundamentalsEventsMap = {
    'Toolbar:Fetch:Clicked': ToolbarFetchRequest;
    'Fundamentals:Ticker:DataReady': {
        ticker: string;
        formType: ReportTypes["formType"];
    };
    'Fundamentals:Peer:DataReady': {
        ticker: string;
        formType: ReportTypes["formType"];
    };
    'Fundamentals:FilingForm:TextRequested': {
        ticker: string;
        period: string;
        url: string;
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
}