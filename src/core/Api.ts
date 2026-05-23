import type { FilingHistoryResponse, FilingTextResponse } from "../contracts/FilingsContracts";
import type { FundamentalsRequest, FundamentalsResponse } from "../contracts/FundamentalsContracts";
import type { ResearchDataResponse } from "../contracts/WatchlistContracts";

export class Api {
    private BASE_URL: string = 'http://localhost:3000';
    private FUNDAMENTALS_ENDPOINT: string = 'api/fundamentals';

    async fetchFundamentals(requestData: FundamentalsRequest): Promise<FundamentalsResponse> {
        const url = `${this.BASE_URL}/${this.FUNDAMENTALS_ENDPOINT}/${requestData.ticker}?mode=${requestData.formType}&refresh=${String(requestData.refresh)}`;
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`${res.status}: ${res.statusText}: Server returned an error for ${requestData.ticker}.`);
        }
        const rawData = await res.json() as FundamentalsResponse;

        return rawData;
    }

    async fetchFilingText(ticker: string, period: string, url: string): Promise<FilingTextResponse> {
        console.log(`Requesting filing text for ${ticker} at ${period}: ${url}`);
        const res = await fetch(`${this.BASE_URL}/api/filings/parse?url=${encodeURIComponent(url)}`);
        if (!res.ok) {
            throw new Error(`${res.status}: ${res.statusText}: Server returned an error for ${ticker}.`);
        }
        return await res.json() as FilingTextResponse;
    }

    async fetchFilingHistory(ticker: string, refresh: boolean = false): Promise<FilingHistoryResponse> {
        const url = `${this.BASE_URL}/api/filings/${ticker}?refresh=${String(refresh)}`;
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`${res.status}: ${res.statusText}: Server returned an error for ${ticker}.`);
        }
        return await res.json() as FilingHistoryResponse;
    }

    async fetchResearchData(ticker: string, refresh: boolean = false): Promise<ResearchDataResponse> {
        const url = `${this.BASE_URL}/api/quote/${ticker}?refresh=${String(refresh)}`;
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`${res.status}: ${res.statusText}: Server returned an error for ${ticker}.`);
        }
        const rawData = await res.json() as ResearchDataResponse;

        return rawData;
    }

    async fetchStockInsights(ticker: string, refresh: boolean = false): Promise<any> {
        const url = `${this.BASE_URL}/api/quote/${ticker}/insights?refresh=${String(refresh)}`;
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`${res.status}: ${res.statusText}: Failed to fetch insights for ${ticker}.`);
        }
        return await res.json();
    }

    async fetchFmpInsights(ticker: string, refresh: boolean = false): Promise<any> {
        const url = `${this.BASE_URL}/api/insights/${ticker}?refresh=${String(refresh)}`;
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`${res.status}: ${res.statusText}: Failed to fetch key events for ${ticker}.`);
        }
        return await res.json();
    }

    async fetchPriceHistory(ticker: string, refresh: boolean = false): Promise<any> {
        const url = `${this.BASE_URL}/api/quote/${ticker}/history?refresh=${String(refresh)}`;
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`${res.status}: ${res.statusText}: Failed to fetch price history for ${ticker}.`);
        }
        return await res.json();
    }
}


export const API = new Api()