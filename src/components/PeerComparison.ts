import { type AdaptedFundamentals } from "../contracts/FundamentalsContracts";
import { Component } from "../core/Component";
import { eventBus } from "../core/EventBus";
import { formatCell, humanizeMetric } from "../core/helper";
import { fundamentalsStore } from "../store/FundamentalsStore";

declare const XLSX: any;

export class PeerComparison extends Component {
    constructor(container: string, path: string) {
        super(container, path);
    }

    protected override bindEvents(): void {
        const handle = eventBus.on('Fundamentals:Peer:DataReady', async (payload: { ticker: string, peers: string[] | null }) => {
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

        const btnTsv = this.getElement('btn-export-tsv');
        if (btnTsv) btnTsv.onclick = () => this.exportData('clipboard');
        
        const btnCsv = this.getElement('btn-export-csv');
        if (btnCsv) btnCsv.onclick = () => this.exportData('csv');
        
        const btnXlsx = this.getElement('btn-export-xlsx');
        if (btnXlsx) btnXlsx.onclick = () => this.exportData('xlsx');
    }

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

    private exportData(format: 'clipboard' | 'csv' | 'xlsx'): void {
        if (!this.lastDataMap || this.lastTickers.length === 0) return;

        const aoa: any[][] = [];
        
        const tickerRow: string[] = [''];
        const periodRow: string[] = ['Metric'];

        this.lastTickers.forEach(ticker => {
            const data = this.lastDataMap!.get(ticker)!;
            const periods = data.periods;
            
            tickerRow.push(ticker);
            for (let i = 1; i < periods.length; i++) {
                tickerRow.push('');
            }
            
            periodRow.push(...periods);
        });

        aoa.push(tickerRow);
        aoa.push(periodRow);

        const primaryData = this.lastDataMap.get(this.lastTickers[0]);
        if (!primaryData) return;

        primaryData.rows.forEach(pRow => {
            if (pRow.defaultVisible === false) return; 
            
            const dataRow: any[] = [humanizeMetric(pRow.label)];
            
            this.lastTickers.forEach(ticker => {
                const data = this.lastDataMap!.get(ticker)!;
                const tickerRow = data.rows.find(r => r.key === pRow.key);
                
                if (tickerRow) {
                    const exportData = tickerRow.data.map(val => val == null ? 'null' : val);
                    dataRow.push(...exportData);
                } else {
                    for (let i = 0; i < data.periods.length; i++) {
                        dataRow.push('null');
                    }
                }
            });
            
            aoa.push(dataRow);
        });

        if (typeof XLSX === 'undefined') {
            console.error('SheetJS (XLSX) is not loaded.');
            return;
        }

        const ws = XLSX.utils.aoa_to_sheet(aoa);

        for (const key in ws) {
            if (!ws[key] || ws[key].t !== 'n') continue;
            const val = ws[key].v;
            if (Math.abs(val) >= 1000000 && Number.isInteger(val)) {
                ws[key].z = '#,##0';
            } else if (!Number.isInteger(val)) {
                ws[key].z = '0.00';
            }
        }

        if (format === 'clipboard') {
            const csv = XLSX.utils.sheet_to_csv(ws, { FS: ',', display: true });
            navigator.clipboard.writeText(csv).then(() => {
                console.log('CSV copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        } else if (format === 'csv') {
            const csv = XLSX.utils.sheet_to_csv(ws, { FS: ',', display: true });
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `peer_comparison.csv`;
            link.click();
        } else if (format === 'xlsx') {
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Peer Comparison");
            XLSX.writeFile(wb, `peer_comparison.xlsx`);
        }
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
