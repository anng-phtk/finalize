import { eventBus } from "../core/EventBus";
import { fundamentalsStore } from "./FundamentalsStore";

interface SelectedMetric {
    metricKey: string;
    label: string;
    unit: string | null;
}

class PeerChartStore {
    private selectedMetrics: SelectedMetric[] = [];
    private activePeers: string[] = [];
    private readonly MAX_METRICS = 2;

    public getSelectedMetrics() {
        return [...this.selectedMetrics];
    }

    public addMetric(metric: SelectedMetric, peers: string[]) {
        this.activePeers = peers;

        const existingIndex = this.selectedMetrics.findIndex(m => m.metricKey === metric.metricKey);

        if (existingIndex !== -1) {
            this.selectedMetrics.splice(existingIndex, 1);
        } else {
            if (this.selectedMetrics.length >= this.MAX_METRICS) {
                this.selectedMetrics.shift();
            }
            this.selectedMetrics.push(metric);
        }

        this.notify();
    }

    public clear() {
        this.selectedMetrics = [];
        this.notify();
    }

    private notify() {
        const result = this.prepareData();
        eventBus.emit('Peer:Chart:DataChanged', result);
    }

    private prepareData() {
        if (this.selectedMetrics.length === 0 || this.activePeers.length === 0) {
            return { metrics: [], timeline: [] };
        }

        // 1. Build Global Timeline (Years)
        const allYearsSet = new Set<string>();
        const peerDataMap = new Map<string, any>(); // ticker -> { periods, data }

        this.activePeers.forEach(ticker => {
            // Check all forms (mostly 10K for peer comparison)
            const cached = fundamentalsStore.get(ticker, 'ANNUAL');
            if (cached) {
                const years = cached.data.periods.map(p => p.substring(0, 4));
                years.forEach(y => allYearsSet.add(y));
                peerDataMap.set(ticker, cached.data);
            }
        });

        const sortedTimeline = Array.from(allYearsSet).sort();

        // 2. Align metrics for each peer
        const metrics = this.selectedMetrics.map(metric => {
            const peersData = this.activePeers.map(ticker => {
                const adaptedData = peerDataMap.get(ticker);
                const alignedValues: (number | null)[] = new Array(sortedTimeline.length).fill(null);

                if (adaptedData) {
                    const row = adaptedData.rows.find((r: any) => r.key === metric.metricKey);
                    if (row) {
                        adaptedData.periods.forEach((p: string, idx: number) => {
                            const year = p.substring(0, 4);
                            const timelineIdx = sortedTimeline.indexOf(year);
                            if (timelineIdx !== -1) {
                                alignedValues[timelineIdx] = row.data[idx] as number;
                            }
                        });
                    }
                }

                return {
                    ticker,
                    data: alignedValues,
                    years: sortedTimeline
                };
            });

            return {
                ...metric,
                peersData
            };
        });

        return {
            metrics,
            timeline: sortedTimeline
        };
    }
}

export const peerChartStore = new PeerChartStore();
