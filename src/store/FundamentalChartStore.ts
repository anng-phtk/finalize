import type { ChartSeries } from "../contracts/FundamentalsContracts";
import { eventBus } from "../core/EventBus";

class FundamentalChartStore {
    private series: ChartSeries[] = [];
    private periods: string[] = [];
    private readonly MAX_SERIES = 4;

    public addSeries(newSeries: ChartSeries, periods: string[]) {
        // If periods changed significantly (different ticker maybe?), we might need to reset
        // For now, let's assume we keep the most recent periods provided
        this.periods = periods;

        // Check if already exists (toggle off)
        const existingIndex = this.series.findIndex(s => s.ticker === newSeries.ticker && s.metricKey === newSeries.metricKey);
        
        if (existingIndex !== -1) {
            this.series.splice(existingIndex, 1);
        } else {
            // Add new, maintain window
            if (this.series.length >= this.MAX_SERIES) {
                this.series.shift();
            }
            this.series.push(newSeries);
        }

        this.notify();
    }

    public getSeries(): ChartSeries[] {
        return [...this.series];
    }

    public getPeriods(): string[] {
        return [...this.periods];
    }

    public clear() {
        this.series = [];
        this.notify();
    }

    private notify() {
        eventBus.emit('Fundamentals:Chart:DataChanged', {
            series: this.getSeries(),
            periods: this.getPeriods()
        });
    }
}

export const fundamentalChartStore = new FundamentalChartStore();
