export class PeersStore {
    private peers: Map<string, string[]> = new Map();

    private normalizeTicker(ticker: string): string {
        return ticker.trim().toUpperCase();
    }

    public setPeers(ticker: string, peerTickers: string[]): void {
        const normalTicker = this.normalizeTicker(ticker);
        if (!normalTicker) return;

        const cleanPeers = peerTickers
            .map(p => this.normalizeTicker(p))
            .filter(p => p && p !== normalTicker)
            .slice(0, 3);

        this.peers.set(normalTicker, cleanPeers);
    }

    /**
     * Search strategy: 
     * 1. Check if the ticker is a primary key (direct match).
     * 2. If not, search all peer lists to see if this ticker belongs to a cohort.
     * 3. If found in a cohort, return the other members of that group.
     */
    public getPeers(ticker: string): string[] {
        const target = this.normalizeTicker(ticker);

        // 1. Direct match
        if (this.peers.has(target)) {
            return this.peers.get(target) || [];
        }

        // 2. Deep search cohorts
        for (const [primary, peers] of this.peers.entries()) {
            if (peers.includes(target)) {
                // Return the primary + other peers (excluding the target itself)
                return [primary, ...peers.filter(p => p !== target)].slice(0, 3);
            }
        }

        return [];
    }

    public clearPeers(ticker: string): void {
        this.peers.delete(this.normalizeTicker(ticker));
    }
}

export const peersStore = new PeersStore();
