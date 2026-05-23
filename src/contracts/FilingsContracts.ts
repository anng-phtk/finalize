export interface FilingHistoryRow {
    accessionNumber: string;
    form: string;
    reportDate: string;
    filingUrl: string;
    primaryDocument: string;
}

export interface FilingHistoryResponse {
    ticker: string;
    rows: FilingHistoryRow[];
}

export interface FilingItem {
    confidence: number;
    tables: string[];
    text: string;
}

export type FilingTextResponse = Record<string, FilingItem>;
