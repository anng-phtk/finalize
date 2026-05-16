import { type AdaptedFundamentals, type AdaptedFundamentalRow } from "../contracts/FundamentalsContracts";
import { Component } from "../core/Component";
import { eventBus } from "../core/EventBus";
import { formatCell, humanizeMetric } from "../core/helper";
import { fundamentalsStore } from "../store/FundamentalsStore";

export class FundamentalsTable extends Component {
    constructor(container: string, path: string) {
        super(container, path);
    }

    protected override bindEvents(): void {
        const handle = eventBus.on('Fundamentals:Ticker:DataReady', async (payload) => {
            const cached = fundamentalsStore.get(payload.ticker, payload.formType);
            if (cached) {
                this.renderTable(payload.ticker, payload.formType, cached.data);
            }
        });
        this.eventHandles.push(handle);

        const chartHandle = eventBus.on('Fundamentals:Chart:DataChanged', (payload) => {
            this.activeMetricKeys = payload.series.map(s => s.metricKey);
            if (this.currentData) {
                this.renderRows(this.currentData.rows);
            }
        });
        this.eventHandles.push(chartHandle);
    }

    private currentTicker: string = '';
    private currentData: AdaptedFundamentals | null = null;
    private activeMetricKeys: string[] = [];

    public renderTable(ticker: string, formType: string, data: AdaptedFundamentals): void {
        try {
            this.currentTicker = ticker;
            this.currentData = data;
            this.getElement('table-ticker').textContent = ticker;
            this.getElement('table-reportType').textContent = formType;

            this.renderFormRow(ticker, data);
            this.renderHeaders(data.periods);
            this.renderRows(data.rows);
        } catch (error) {
            console.error('Error rendering table:', error);
        }
    }

    private renderFormRow(ticker: string, data: AdaptedFundamentals): void {
        const formRow = this.getElement('table-form-row');
        // Clear existing (keep the first 'Form' column)
        while (formRow.children.length > 1) {
            formRow.removeChild(formRow.lastChild!);
        }

        data.formTypes.forEach((type, index) => {
            const th = document.createElement('th');
            const button = document.createElement('button');
            button.className = 'btn-filing-form';
            button.textContent = type;

            const period = data.periods[index];
            const url = data.filingUrls[index];

            button.onclick = (e) => {
                e.stopPropagation();
                eventBus.emit('Fundamentals:FilingForm:TextRequested', {
                    ticker,
                    period,
                    url
                });
            };

            th.appendChild(button);
            formRow.appendChild(th);
        });
    }

    private renderHeaders(periods: string[]): void {
        const headerRow = this.getElement('table-header-row');

        // Clear existing periods (keep the first 'Metric' column)
        while (headerRow.children.length > 1) {
            headerRow.removeChild(headerRow.lastChild!);
        }

        periods.forEach(period => {
            const th = document.createElement('th');
            th.textContent = period;
            headerRow.appendChild(th);
        });
    }

    private renderRows(rows: AdaptedFundamentalRow[]): void {
        const tbody = this.getElement('table-body');
        tbody.innerHTML = '';

        let currentCategory = '';

        rows.forEach(row => {
            // Check if we need to add a category header
            if (row.category !== currentCategory) {
                currentCategory = row.category;
                const catRow = document.createElement('tr');
                catRow.className = 'category-row';
                const catCell = document.createElement('td');
                catCell.colSpan = 100; // Span all columns
                catCell.textContent = currentCategory;
                catRow.appendChild(catCell);
                tbody.appendChild(catRow);
            }

            const tr = document.createElement('tr');
            tr.className = 'metric-row-clickable';
            if (row.defaultVisible === false) {
                tr.classList.add('row-hidden');
            }

            tr.onclick = () => {
                if (this.currentTicker && this.currentData) {
                    eventBus.emit('Fundamentals:Chart:SeriesAdded', {
                        ticker: this.currentTicker,
                        metricKey: row.key,
                        label: row.label,
                        data: row.data as (number | null)[],
                        periods: this.currentData.periods,
                        unit: row.format === 'percent' ? '%' : (row.format === 'ratio' ? 'pure' : 'USD')
                    });
                }
            };

            const isActive = this.activeMetricKeys.includes(row.key);

            const labelCell = document.createElement('td');
            labelCell.className = 'metric-label';

            const toggleIcon = document.createElement('i');
            toggleIcon.className = `bi bi-bar-chart-line chart-toggle ${isActive ? 'is-active' : ''}`;
            labelCell.appendChild(toggleIcon);

            const labelSpan = document.createElement('span');
            labelSpan.textContent = humanizeMetric(row.label);
            labelCell.appendChild(labelSpan);

            tr.appendChild(labelCell);

            row.data.forEach(val => {
                const td = document.createElement('td');
                td.innerHTML = formatCell(val, row.key);
                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });
    }
}

