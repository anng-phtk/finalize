import { Component } from "../core/Component";
import { eventBus } from "../core/EventBus";
import { formatNumber } from "../core/helper";

export class PeerComparisonChart extends Component {
    private chart: any = null;

    constructor(container: string, path: string) {
        super(container, path);
    }

    protected override bindEvents(): void {
        const handle = eventBus.on('Peer:Chart:DataChanged', (payload) => {
            this.updateChart(payload.metrics, payload.timeline);
        });
        this.eventHandles.push(handle);


        this.getElement('btn-chart-collapse').addEventListener('click', () => {
            eventBus.emit('Peer:Chart:Collapse', { containerId: this.container.id });
        });

    }

    protected override onMount(): void {
        // No initial data for peer chart usually
    }

    private updateChart(metrics: any[], timeline: string[]) {
        if (!metrics || metrics.length === 0) {
            if (this.chart) {
                this.chart.destroy();
                this.chart = null;
            }
            this.getElement('peer-chart-status').textContent = 'Select metrics from the peer table to compare';
            return;
        }

        const ctx = (this.getElement('peer-chart-canvas') as HTMLCanvasElement).getContext('2d');
        if (!ctx) return;

        const datasets: any[] = [];

        const defaultColors = [
            '#3B82F6', // blue
            '#EF4444', // red
            '#10B981', // emerald
            '#F59E0B', // amber
            '#8B5CF6', // violet
            '#22C55E', // green
            '#F97316', // orange
        ]

        //const defaultColors = [
        //'rgba(75, 192, 192, 1)',
        //'rgba(255, 159, 64, 1)',
        //'rgba(153, 102, 255, 1)',
        //'rgba(201, 203, 207, 1)'
        //];

        metrics.forEach((metric) => {
            const isRatio = metric.unit === '%' || metric.unit === 'pure';
            const yAxisID = isRatio ? 'y-axis-ratio' : 'y-axis-currency';

            metric.peersData.forEach((peer: any, pIdx: number) => {
                // const color = tickerColors[peer.ticker] || defaultColors[pIdx % defaultColors.length];
                const color = defaultColors[pIdx % defaultColors.length];

                datasets.push({
                    label: `${peer.ticker}: ${metric.label}`,
                    data: peer.data,
                    type: isRatio ? 'line' : 'bar',
                    yAxisID: yAxisID,
                    borderColor: color,
                    backgroundColor: isRatio ? 'transparent' : color.replace('1)', '0.5)'),
                    borderWidth: 2,
                    tension: 0.3,
                    fill: false
                });
            });
        });

        if (this.chart) {
            this.chart.destroy();
        }

        const Chart = (window as any).Chart;
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: timeline,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                //interaction: { mode: 'index', intersect: false },
                interaction: { mode: 'index', intersect: false },
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
                        position: 'left',
                        title: { display: true, text: 'USD / Units' },
                        ticks: {
                            callback: (value: any) => formatNumber(value, 'USD', 0)
                        }
                    },
                    'y-axis-ratio': {
                        type: 'linear',
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

        this.updateLegend(metrics);
        this.getElement('peer-chart-status').textContent = `${metrics.length} metrics across peers`;
    }

    private updateLegend(metrics: any[]) {
        const legend = this.getElement('peer-chart-legend');
        legend.innerHTML = '';

        // Simplified legend: show metrics and peer info
        metrics.forEach(m => {
            const item = document.createElement('div');
            item.innerHTML = `<strong>${m.label}</strong>: ${m.peersData.map((p: any) => p.ticker).join(', ')}`;
            legend.appendChild(item);
        });
    }
}
