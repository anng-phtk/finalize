import type { ResearchDataResponse } from "../contracts/WatchlistContracts";

export class TickerResearchStore {
    private readonly maxEntries = 50;
    private data: Map<string, ResearchDataResponse> = new Map();

    public set(ticker: string, researchData: ResearchDataResponse): void {
        const upperTicker = ticker.toUpperCase();
        
        // Evict if already exists to move to end (insertion order)
        if (this.data.has(upperTicker)) {
            this.data.delete(upperTicker);
        }
        
        this.data.set(upperTicker, researchData);

        // Evict oldest if over limit
        if (this.data.size > this.maxEntries) {
            const firstKey = this.data.keys().next().value;
            if (firstKey) this.data.delete(firstKey);
        }
    }

    public get(ticker: string): ResearchDataResponse | undefined {
        return this.data.get(ticker.toUpperCase());
    }

    public getAll(): ResearchDataResponse[] {
        // Return values in reverse insertion order (newest first)
        return Array.from(this.data.values()).reverse();
    }

    public clear(ticker: string): void {
        this.data.delete(ticker.toUpperCase());
    }

    public clearAll(): void {
        this.data.clear();
    }
}

export const tickerResearchStore = new TickerResearchStore();