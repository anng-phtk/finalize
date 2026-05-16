import type { FilingHistoryResponse } from "../contracts/FilingsContracts";
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

    async fetchFilingText(ticker: string, period: string, url: string): Promise<string> {
        console.log(`Requesting filing text for ${ticker} at ${period}: ${url}`);
        // This is a placeholder for the actual API call
        // const res = await fetch(`${this.BASE_URL}/api/filing-text?url=${encodeURIComponent(url)}`);
        // return await res.text();
        return `Mock filing text for ${ticker} (${period})`;
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
        /**
         * Data shape
            {
            "symbol": "AAPL",
            "beta": 1.065,
            "analyst": {
                "averageRating": "1.9 - Buy",
                "targetMeanPrice": 305.28094,
                "targetHighPrice": 400,
                "targetLowPrice": 215,
                "numberOfAnalysts": 42
            },
            "valuation": {

            },
            "source": "yahoo",
            "fetchedAt": "2026-05-12T19:52:43.185Z"
            }
         */
        const url = `${this.BASE_URL}/api/quote/${ticker}?refresh=${String(refresh)}`;
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`${res.status}: ${res.statusText}: Server returned an error for ${ticker}.`);
        }
        const rawData = await res.json() as ResearchDataResponse;

        return rawData;
    }
}


export const API = new Api()