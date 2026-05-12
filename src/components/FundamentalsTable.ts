import { type AdaptedFundamentals, type AdaptedFundamentalRow } from "../contracts/AppContracts";
import { Component } from "../core/Component";
import { eventBus } from "../core/EventBus";
import { formatCell, humanizeMetric } from "../core/helper";
import { fundamentalsStore } from "../store/FundamentalsStore";

export class FundamentalsTable extends Component {
    constructor(container: string, path: string) {
        super(container, path);
    }

    protected override bindEvents(): void {
        // Handled by App.ts for view swapping
    }

    public renderTable(ticker: string, formType: string, data: AdaptedFundamentals): void {
        try {
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

            button.onclick = () => {
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
            if (row.defaultVisible === false) {
                tr.classList.add('row-hidden');
            }

            const labelCell = document.createElement('td');
            labelCell.className = 'metric-label';
            labelCell.textContent = humanizeMetric(row.label);
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

