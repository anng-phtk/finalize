
export class PeersStore {

    private peers: Map<string, Set<string>> = new Map();
    normalizeTicker(ticker: string): string {
        return ticker.trim();
    }

    setPeers(ticker: string, peerTickers: string[]): void {
        const normalTicker = this.normalizeTicker(ticker);

        if (!normalTicker) {
            return;
        }

        const peerSet = new Set<string>();

        for (const peer of peerTickers) {
            const normalPeer = this.normalizeTicker(peer);
            if (!normalPeer) {
                continue;
            }
            
            if (normalPeer === normalTicker) {
                continue;
            }

            peerSet.add(normalPeer);

            if (peerSet.size >= 3) {
                break;
            }
        }

        this.peers.set(normalTicker, peerSet);
    }

    getPeers(ticker: string): Array<string> {
        const normalTicker: string = this.normalizeTicker(ticker);

        if (!this.peers.has(normalTicker)) return [];

        const listPeers: string[] = new Array();
        this.peers.get(normalTicker)?.forEach((peer: string) => {
            listPeers.push(this.normalizeTicker(peer));
        });

        return listPeers;
    }

    clearPeers(ticker: string): void {
        const normalTicker: string = this.normalizeTicker(ticker);
        if (this.peers.has(ticker)) this.peers.delete(normalTicker);
    }
}