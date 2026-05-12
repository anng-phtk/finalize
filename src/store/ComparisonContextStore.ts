export class ComparisonContextStore {
    private tickers: string[] = [];

    setGroup(primary: string, peers: string[]): void {
        this.tickers = [primary, ...peers]
            .map((ticker) => ticker.trim().toUpperCase())
            .filter((ticker) => ticker.length > 0)
            .filter((ticker, index, array) => array.indexOf(ticker) === index)
            .slice(0, 4);
    }

    getPeersFor(selectedTicker: string): string[] {
        const selected = selectedTicker.trim().toUpperCase();

        return this.tickers
            .filter((ticker) => ticker !== selected)
            .slice(0, 3);
    }

    clear(): void {
        this.tickers = [];
    }
}

export const comparisonContextStore = new ComparisonContextStore();
