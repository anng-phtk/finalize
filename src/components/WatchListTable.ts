import { type ResearchDataResponse } from "../contracts/WatchlistContracts";
import { Component } from "../core/Component";
import { eventBus } from "../core/EventBus";
import { formatCell } from "../core/helper";
import { tickerResearchStore } from "../store/TickerResearchStore";

export class WatchListTable extends Component {
    constructor(rootId: string, templatePath: string) {
        super(rootId, templatePath);
    }

    protected bindEvents(): void {
        const updateTable = () => {
            this.renderAll();
        };

        eventBus.on('WatchList:Ticker:DataReady', updateTable);
        eventBus.on('WatchList:Peers:DataReady', updateTable);

        this.getElement('watchlist-table-body').addEventListener('click', (evt: Event) => {
            evt.preventDefault();
            evt.stopPropagation();
            if ((evt.target as HTMLTableCellElement).closest('td')?.dataset.ticker) {
                let selectedTicker: string = (evt.target as HTMLTableCellElement).closest('td')?.dataset.ticker as string;
                eventBus.emit("WatchList:Ticker:Selected", { ticker: selectedTicker, formType: 'ANNUAL', refresh: false });
            }
        });
    }

    private renderAll() {
        const tbody = this.getElement('watchlist-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';
        const allData = tickerResearchStore.getAll();

        const countEl = this.getElement('watchlist-count');
        if (countEl) countEl.textContent = `${allData.length} items`;

        allData.forEach(data => {
            this.renderRow(tbody, data);
        });
    }

    private renderRow(tbody: HTMLElement, data: ResearchDataResponse) {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td style="text-align: left;" data-ticker="${data.symbol}">
                <div style="display: flex; flex-direction: column;">
                    <span style="font-weight: bold; color: var(--sf-gray-10);">${data.symbol}</span>
                    <span style="font-size: 0.7rem; color: var(--sf-gray-8);">${data.shortName}</span>
                </div>
            </td>
            <td >${formatCell(data.price?.current, 'PRICE')}</td>
            <td>${formatCell(data.price?.change, 'CHANGE')}</td>
            <td>${formatCell(data.price?.changePercent, 'CHANGE_PERCENT')}</td>
            <td>${data.analyst?.averageRating || '-'}</td>
            <td>${data.valuation?.marketCap ? (data.valuation.marketCap / 1e9).toFixed(2) + 'B' : '-'}</td>
            <td>${data.valuation?.trailingPE ? data.valuation.trailingPE.toFixed(2) : '-'}</td>
        `;

        tbody.appendChild(tr);
    }
}