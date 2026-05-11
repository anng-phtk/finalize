import type { FundamentalsRequest, FundamentalsResponse } from "../contracts/AppContracts";

export class Api {
    private BASE_URL: string = 'http://localhost:3000';
    private FUNDAMENTALS_ENDPOINT: string = 'api/fundamentals';

    async fetchFundamentals(requestData:FundamentalsRequest):Promise<FundamentalsResponse> {
        const url = `${this.BASE_URL}/${this.FUNDAMENTALS_ENDPOINT}/${requestData.ticker}?reportType=${requestData.formType}&refresh=${String(requestData.refresh)}`;
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`${res.status}: ${res.statusText}: Server returned an error for ${requestData.ticker}.`);
        }
        const rawData = await res.json() as FundamentalsResponse;

        return rawData;
    }
}

export const API = new Api()