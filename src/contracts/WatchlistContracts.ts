export type ResearchRequest = {
    ticker: string;
    refresh: boolean;
}

export type ResearchPriceData = {
    current: number;
    change: number;
    changePercent: number;
    open: number;
    previousClose: number;
    dayLow: number;
    dayHigh: number;
    volume: number;
    bid: number;
    ask: number;
}

export type ResearchValuationData = {
    marketCap: number;
    trailingPE: number;
    forwardPE: number;
    priceToBook: number;
    bookValue: number;
    epsTTM: number;
    epsForward: number;
    epsCurrentYear: number;
}

export type ResearchDataResponse = {
    symbol: string;
    shortName: string;
    longName: string;
    exchange: string;
    currency: string;
    marketState: string;
    beta: number;
    price: ResearchPriceData;
    valuation: ResearchValuationData;
    analyst: {
        averageRating: string;
        targetMeanPrice?: number;
        targetHighPrice?: number;
        targetLowPrice?: number;
        numberOfAnalysts?: number;
    };
    source: string;
    fetchedAt: string;
}

export type WatchlistTickerSelected = {
    ticker: string;
    formType: 'ANNUAL';
    refresh: boolean;
}