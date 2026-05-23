import { Component } from "../core/Component";
import { eventBus } from "../core/EventBus";
import type { ChartSeries } from "../contracts/FundamentalsContracts";
import { formatNumber } from "../core/helper";

export class FundamentalChart extends Component {
    private chart: any = null;

    constructor(container: string, path: string) {
        super(container, path);
    }

    protected override bindEvents(): void {
        const handle = eventBus.on('Fundamentals:Chart:DataChanged', (payload) => {
            this.updateChart(payload.series, payload.periods);
        });
        this.eventHandles.push(handle);
    }

    protected override onMount(): void {
        // Will wait for DataChanged event
    }

    private updateChart(series: ChartSeries[], periods: string[]) {
        if (!series || series.length === 0) {
            console.log('No chart series to display');
            return;
        }

        const canvas = this.getElement('fundamentals-chart-canvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // reverse periods for chronological order if they are descending
        const chartPeriods = [...periods].reverse();

        const datasets = series.map((s, index) => {
            const isRatio = s.unit === '%' || s.unit === 'pure';
            const data = [...s.data].reverse();

            // Determine Y-axis (Currency vs Percentage/Pure)
            const yAxisID = isRatio ? 'y-axis-ratio' : 'y-axis-currency';

            return {
                label: `${s.ticker}: ${s.label}`,
                data: data,
                type: isRatio ? 'line' : 'bar',
                borderColor: this.getColor(index),
                backgroundColor: this.getColor(index, 0.4),
                yAxisID: yAxisID,
                borderWidth: 2,
                tension: 0.3
            };
        });

        if (this.chart) {
            this.chart.destroy();
        }

        const Chart = (window as any).Chart;
        if (!Chart) {
            console.error('Chart.js not loaded');
            return;
        }

        this.chart = new Chart(ctx, {
            type: 'bar', // Base type
            data: {
                labels: chartPeriods,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },

                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom', // top, bottom, left, right
                        labels: {
                            font: { size: 10 },        // make text smaller
                            boxWidth: 12,              // shrink color box
                            boxHeight: 10,             // v4 only
                            usePointStyle: true,       // circles instead of rectangles
                            padding: 8
                        }
                    }
                },
                scales: {
                    'y-axis-currency': {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'USD / Units' },
                        ticks: {
                            callback: (value: any) => formatNumber(value, 'USD', 0)
                        }
                    },
                    'y-axis-ratio': {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'Ratio / %' },
                        grid: { drawOnChartArea: false },
                        ticks: {
                            callback: (value: any) => formatNumber(value, 'PERCENT', 0)
                        }
                    }
                }
            }
        });

        this.updateLegend(series);

        // Update Panel Title and Status
        const titleEl = this.getElement('chart-panel-title');
        const statusEl = this.getElement('chart-status-text');

        if (series.length > 0) {
            titleEl.textContent = `Visualizing: ${series.map(s => s.metricKey).join(', ')}`;
            statusEl.textContent = `${series.length} metrics selected (Max 4)`;
        } else {
            titleEl.textContent = 'Visualizer';
            statusEl.textContent = 'Select metrics from the table to compare';
        }
    }

    private updateLegend(series: ChartSeries[]) {
        const legend = this.getElement('chart-legend');
        legend.innerHTML = '';
        series.forEach((s, index) => {
            const item = document.createElement('div');
            item.className = 'legend-item';
            item.innerHTML = `
                <div class="legend-color" style="background-color: ${this.getColor(index)}"></div>
                <span>${s.ticker}: ${s.label}</span>
            `;
            legend.appendChild(item);
        });
    }

    private getColor(index: number, alpha: number = 1): string {
        const colors = [
            `rgba(54, 162, 235, ${alpha})`,   // blue
            `rgba(255, 99, 132, ${alpha})`,   // red
            `rgba(75, 192, 192, ${alpha})`,   // teal
            `rgba(255, 206, 86, ${alpha})`,   // yellow
        ];
        return colors[index % colors.length];
    }
}
