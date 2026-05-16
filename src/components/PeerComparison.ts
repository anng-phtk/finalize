import { type AdaptedFundamentals } from "../contracts/FundamentalsContracts";
import { Component } from "../core/Component";
import { eventBus } from "../core/EventBus";
import { formatCell, humanizeMetric } from "../core/helper";
import { fundamentalsStore } from "../store/FundamentalsStore";

export class PeerComparison extends Component {
    constructor(container: string, path: string) {
        super(container, path);
    }

    protected override bindEvents(): void {
        const handle = eventBus.on('Fundamentals:Peer:DataReady', async (payload: { ticker: string, formType: string, peers: string[] | null }) => {
            this.currentPeers = [payload.ticker, ...(payload.peers || [])];
            this.loadAndRender(payload.ticker, payload.peers || []);
        });
        this.eventHandles.push(handle);

        const chartHandle = eventBus.on('Peer:Chart:DataChanged', (payload) => {
            this.activeMetricKeys = payload.metrics.map(m => m.metricKey);
            if (this.lastDataMap) {
                this.renderBody(this.lastTickers, this.lastDataMap);
            }
        });
        this.eventHandles.push(chartHandle);
    }

    private currentPeers: string[] = [];
    private lastTickers: string[] = [];
    private lastDataMap: Map<string, AdaptedFundamentals> | null = null;
    private activeMetricKeys: string[] = [];

    public loadAndRender(primary: string, peers: string[]) {
        const tickers = [primary, ...peers];
        const dataMap: Map<string, AdaptedFundamentals> = new Map();

        // Collect latest 10-K for each ticker
        for (const ticker of tickers) {
            const cached = fundamentalsStore.get(ticker, 'ANNUAL');
            if (cached) {
                dataMap.set(ticker, cached.data);
            }
        }

        if (dataMap.size === 0) {
            console.warn('No ANNUAL data found for any tickers in comparison group.');
            return;
        }

        this.renderTable(tickers, dataMap);
    }

    private renderTable(tickers: string[], dataMap: Map<string, AdaptedFundamentals>) {
        const activeTickers = tickers.filter(t => dataMap.has(t));
        this.lastTickers = activeTickers;
        this.lastDataMap = dataMap;
        this.renderTickerRow(activeTickers);
        this.renderFormRow(activeTickers, dataMap);
        this.renderHeaderRow(activeTickers, dataMap);
        this.renderBody(activeTickers, dataMap);
    }

    private renderTickerRow(tickers: string[]) {
        const row = this.getElement('comp-ticker-row');
        // Clear existing (keep the first 'Ticker' column)
        while (row.children.length > 1) row.removeChild(row.lastChild!);

        tickers.forEach(ticker => {
            const th = document.createElement('th');
            th.textContent = ticker;
            row.appendChild(th);
        });
    }

    private renderFormRow(tickers: string[], dataMap: Map<string, AdaptedFundamentals>) {
        const row = this.getElement('comp-form-row');
        // Clear existing (keep the first 'Form' column)
        while (row.children.length > 1) row.removeChild(row.lastChild!);

        tickers.forEach(ticker => {
            const data = dataMap.get(ticker)!;
            const th = document.createElement('th');
            const button = document.createElement('button');
            button.className = 'btn-filing-form';
            button.textContent = data.formTypes[0] || '10-K'; // Latest

            button.onclick = () => {
                eventBus.emit('Fundamentals:FilingForm:TextRequested', {
                    ticker,
                    period: data.periods[0],
                    url: data.filingUrls[0]
                });
            };

            th.appendChild(button);
            row.appendChild(th);
        });
    }

    private renderHeaderRow(tickers: string[], dataMap: Map<string, AdaptedFundamentals>) {
        const row = this.getElement('comp-header-row');
        // Clear existing (keep the first 'Metric' column)
        while (row.children.length > 1) row.removeChild(row.lastChild!);

        tickers.forEach(ticker => {
            const data = dataMap.get(ticker)!;
            const th = document.createElement('th');
            th.textContent = data.periods[0] || '-';
            row.appendChild(th);
        });
    }

    private renderBody(tickers: string[], dataMap: Map<string, AdaptedFundamentals>) {
        const tbody = this.getElement('comp-table-body');
        tbody.innerHTML = '';

        // Use primary ticker as template for rows
        const primaryData = dataMap.get(tickers[0]);
        if (!primaryData) return;

        let currentCategory = '';

        primaryData.rows.forEach(pRow => {
            // Category handling
            if (pRow.category !== currentCategory) {
                currentCategory = pRow.category;
                const catRow = document.createElement('tr');
                catRow.className = 'category-row';
                const catCell = document.createElement('td');
                catCell.colSpan = 100;
                catCell.textContent = currentCategory;
                catRow.appendChild(catCell);
                tbody.appendChild(catRow);
            }

            const tr = document.createElement('tr');
            if (pRow.defaultVisible === false) {
                tr.classList.add('row-hidden');
            }

            const isActive = this.activeMetricKeys.includes(pRow.key);

            const labelCell = document.createElement('td');
            labelCell.className = 'metric-label';
            labelCell.classList.add('metric-row-clickable');

            const toggleIcon = document.createElement('i');
            toggleIcon.className = `bi bi-bar-chart-line chart-toggle ${isActive ? 'is-active' : ''}`;
            labelCell.appendChild(toggleIcon);

            const labelSpan = document.createElement('span');
            labelSpan.textContent = humanizeMetric(pRow.label);
            labelCell.appendChild(labelSpan);

            labelCell.onclick = () => {
                eventBus.emit('Peer:Chart:SeriesAdded', {
                    metricKey: pRow.key,
                    label: pRow.label,
                    unit: pRow.format === 'percent' ? '%' : (pRow.format === 'ratio' ? 'pure' : 'USD'),
                    peers: tickers
                });
            };

            tr.appendChild(labelCell);

            // Add data for each ticker
            tickers.forEach(ticker => {
                const data = dataMap.get(ticker)!;
                const tickerRow = data.rows.find(r => r.key === pRow.key);
                const val = tickerRow ? tickerRow.data[0] : null; // Latest value

                const td = document.createElement('td');
                td.innerHTML = formatCell(val, pRow.key);
                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });
    }
}
