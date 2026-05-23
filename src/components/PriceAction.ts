import { Component } from "../core/Component";
import { eventBus } from "../core/EventBus";

export class PriceAction extends Component {
    private chart: any = null;

    constructor(container: string, path: string) {
        super(container, path);
    }

    protected override bindEvents(): void {
        const handle = eventBus.on('PriceHistory:DataReady', (payload) => {
            this.renderChart(payload.ticker, payload.data);
        });
        this.eventHandles.push(handle);
    }

    private renderChart(ticker: string, data: any): void {
        try {
            // Update Title
            const titleEl = this.getElement('price-chart-title');
            titleEl.textContent = `Price Action - ${ticker}`;

            const canvas = this.getElement('price-action-chart') as HTMLCanvasElement;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const bars = data.bars || [];
            
            // Map labels and prices
            const labels = bars.map((b: any) => new Date(b.date).toLocaleDateString());
            const prices = bars.map((b: any) => b.close);

            if (this.chart) {
                this.chart.destroy();
            }

            const Chart = (window as any).Chart;
            if (!Chart) {
                console.error('Chart.js not loaded');
                return;
            }

            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: `${ticker} Close Price`,
                        data: prices,
                        borderColor: '#198754',
                        backgroundColor: 'rgba(25, 135, 84, 0.1)',
                        borderWidth: 2,
                        pointRadius: 0, // Hide points for speed/aesthetics unless hovered
                        pointHoverRadius: 5,
                        fill: true,
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        legend: {
                            display: false // Title handles it
                        },
                        tooltip: {
                            callbacks: {
                                label: (context: any) => {
                                    return `Close: $${Number(context.raw).toFixed(2)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                maxTicksLimit: 8,
                                font: {
                                    size: 9
                                }
                            }
                        },
                        y: {
                            grid: {
                                color: 'var(--sf-border)'
                            },
                            ticks: {
                                font: {
                                    size: 9
                                },
                                callback: (value: any) => `$${Number(value).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error rendering Price Action chart:', error);
        }
    }

    protected override onUnmount(): void {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        super.onUnmount();
    }
}
