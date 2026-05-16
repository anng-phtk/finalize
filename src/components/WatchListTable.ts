import { type ResearchDataResponse } from "../contracts/WatchlistContracts";
import { Component } from "../core/Component";
import { eventBus } from "../core/EventBus";
import { formatCell } from "../core/helper";
import { tickerResearchStore } from "../store/TickerResearchStore";

export class WatchListTable extends Component {
    constructor(rootId: string, templatePath: string) {
        super(rootId, templatePath);
    }

    protected override bindEvents(): void {
        const updateTable = () => {
            this.renderAll();
        };

        this.eventHandles.push(eventBus.on('WatchList:Ticker:DataReady', updateTable));
        this.eventHandles.push(eventBus.on('WatchList:Peers:DataReady', updateTable));

        this.getElement('watchlist-table-body').addEventListener('click', (evt: Event) => {
            evt.preventDefault();
            evt.stopPropagation();
            const td = (evt.target as HTMLElement).closest('td');
            if (td?.dataset.ticker) {
                let selectedTicker: string = td.dataset.ticker;
                eventBus.emit("WatchList:Ticker:Selected", { ticker: selectedTicker, formType: 'ANNUAL', refresh: false });
            }
        });
    }

    protected override onMount(): void {
        this.renderAll();
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