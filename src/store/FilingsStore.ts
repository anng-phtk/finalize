import type { FilingHistoryResponse } from "../contracts/FilingsContracts";

class FilingsStore {
    private cache: Map<string, FilingHistoryResponse>;
    private readonly maxEntries: number;

    constructor(maxEntries: number = 20) {
        this.cache = new Map();
        this.maxEntries = maxEntries;
    }

    set(ticker: string, data: FilingHistoryResponse): void {
        const key = ticker.toUpperCase();

        if (this.cache.size >= this.maxEntries && !this.cache.has(key)) {
            this.evictOldest();
        }

        this.cache.set(key, data);
    }

    get(ticker: string): FilingHistoryResponse | undefined {
        const key = ticker.toUpperCase();
        return this.cache.get(key);
    }

    clear(): void {
        this.cache.clear();
    }

    hasData(): boolean {
        return this.cache.size > 0;
    }

    private evictOldest(): void {
        if (this.cache.size > 0) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) {
                this.cache.delete(oldestKey);
            }
        }
    }
}

export const filingsStore = new FilingsStore();
