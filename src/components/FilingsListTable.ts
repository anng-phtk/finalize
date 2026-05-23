import { Component } from "../core/Component";
import { eventBus } from "../core/EventBus";
import { filingsStore } from "../store/FilingsStore";
import type { FilingHistoryResponse } from "../contracts/FilingsContracts";

export class FilingsListTable extends Component {
    constructor(container: string, path: string) {
        super(container, path);
    }

    protected override bindEvents(): void {
        const handle = eventBus.on('Filings:History:DataReady', (payload) => {
            const data = filingsStore.get(payload.ticker);
            if (data) {
                this.renderTable(data);
            }
        });
        this.eventHandles.push(handle);
    }

    public renderTable(data: FilingHistoryResponse): void {
        const tbody = this.getElement('filings-table-body');
        const countSpan = this.getElement('filings-count');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        if (!data || !data.rows || data.rows.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 3;
            td.textContent = 'No filings found.';
            td.style.textAlign = 'center';
            tr.appendChild(td);
            tbody.appendChild(tr);
            if (countSpan) countSpan.textContent = '0 filings';
            return;
        }

        data.rows.forEach(row => {
            const tr = document.createElement('tr');
            
            // Form type
            const formTd = document.createElement('td');
            formTd.style.textAlign = 'left';
            formTd.innerHTML = `<strong>${row.form}</strong>`;
            
            // Report Date
            const dateTd = document.createElement('td');
            dateTd.textContent = row.reportDate;
            
            // Link
            const linkTd = document.createElement('td');
            const link = document.createElement('a');
            link.href = row.filingUrl;
            link.target = "_blank";
            link.innerHTML = '<i class="bi bi-box-arrow-up-right"></i>';
            linkTd.appendChild(link);
            
            // Interactive row click for future extraction functionality
            tr.style.cursor = 'pointer';
            tr.onclick = (e) => {
                // Prevent opening new tab if they explicitly clicked the icon link
                if ((e.target as HTMLElement).closest('a')) return;
                
                // For now just open in a new tab, but this is the hook for extraction API
                window.open(row.filingUrl, '_blank');
            };

            tr.appendChild(formTd);
            tr.appendChild(dateTd);
            tr.appendChild(linkTd);
            tbody.appendChild(tr);
        });

        if (countSpan) {
            countSpan.textContent = `${data.rows.length} filings`;
        }
    }
}
