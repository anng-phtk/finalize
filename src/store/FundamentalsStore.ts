import type {
    AdaptedFundamentalRow,
    AdaptedFundamentals,
    FundamentalsRequest
} from "../contracts/FundamentalsContracts";

export type FundamentalsCacheKey = `${string}:${FundamentalsRequest["formType"]}`;

export type CachedFundamentals = {
    key: FundamentalsCacheKey;
    ticker: string;
    formType: FundamentalsRequest["formType"];
    data: AdaptedFundamentals;
    loadedAt: number;
};


function makeKey(
    ticker: string,
    formType: FundamentalsRequest["formType"]
): FundamentalsCacheKey {
    return `${ticker.trim().toUpperCase()}:${formType}`;
}

class FundamentalsStore {
    private readonly maxEntries = 50;
    private readonly cache = new Map<FundamentalsCacheKey, CachedFundamentals>();

    get(
        ticker: string,
        formType: FundamentalsRequest["formType"]
    ): CachedFundamentals | undefined {
        const key = makeKey(ticker, formType);
        const item = this.cache.get(key);

        if (!item) return undefined;

        this.cache.delete(key);
        this.cache.set(key, item);

        return item;
    }

    set(
        ticker: string,
        formType: FundamentalsRequest["formType"],
        data: AdaptedFundamentals
    ): CachedFundamentals {
        const key = makeKey(ticker, formType);

        const item: CachedFundamentals = {
            key,
            ticker: ticker.trim().toUpperCase(),
            formType,
            data,
            loadedAt: Date.now()
        };


        if (this.cache.has(key)) {
            this.cache.delete(key);
        }

        this.cache.set(key, item);
        this.evictOldest();

        return item;
    }

    delete(
        ticker: string,
        formType: FundamentalsRequest["formType"]
    ): void {
        this.cache.delete(makeKey(ticker, formType));
    }

    clear(): void {
        this.cache.clear();
    }

    hasData() {
        return this.cache.size > 0;
    }

    private evictOldest(): void {
        while (this.cache.size > this.maxEntries) {
            const oldestKey = this.cache.keys().next().value;

            if (!oldestKey) return;

            this.cache.delete(oldestKey);
        }
    }
}

export const fundamentalsStore = new FundamentalsStore();