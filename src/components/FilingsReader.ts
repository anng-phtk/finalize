import type { FilingTextResponse } from "../contracts/FilingsContracts";
import { Component } from "../core/Component";
import { eventBus } from "../core/EventBus";

declare const marked: any;

export class FilingsReader extends Component {
    constructor(container: string, path: string) {
        super(container, path);
    }

    protected override bindEvents(): void {
        const handle = eventBus.on('FilingsReader:DataReady', (payload: { ticker: string, period: string, data: FilingTextResponse }) => {
            this.renderData(payload.ticker, payload.period, payload.data);
            
            const modal = document.getElementById('filings-modal');
            if (modal) modal.classList.remove('hidden');
        });
        this.eventHandles.push(handle);

        const closeBtn = this.getElement('btn-close-reader');
        if (closeBtn) {
            closeBtn.onclick = () => {
                const modal = document.getElementById('filings-modal');
                if (modal) modal.classList.add('hidden');
            };
        }
    }

    public renderData(ticker: string, period: string, data: FilingTextResponse): void {
        try {
            const titleEl = this.getElement('reader-title');
            if (titleEl) {
                titleEl.textContent = `Filing Reader - ${ticker} (${period})`;
            }

            const textEl = this.getElement('reader-text');
            const tablesEl = this.getElement('reader-tables');

            let allMarkdown = '';
            let allTables: string[] = [];

            if (data && typeof data === 'object') {
                for (const [itemName, item] of Object.entries(data)) {
                    if (item.text) {
                        allMarkdown += `\n\n### ${itemName}\n\n${item.text}`;
                    }
                    if (item.tables && item.tables.length > 0) {
                        allTables.push(`<h4>${itemName} Tables</h4>`);
                        allTables = allTables.concat(item.tables);
                    }
                }
            }

            if (textEl) {
                if (allMarkdown.trim()) {
                    if (typeof marked !== 'undefined') {
                        textEl.innerHTML = marked.parse(allMarkdown);
                    } else {
                        textEl.innerHTML = `<pre style="white-space: pre-wrap; font-family: inherit;">${allMarkdown}</pre>`;
                    }
                } else {
                    textEl.innerHTML = '<em>No narrative text available for this filing.</em>';
                }
            }

            if (tablesEl) {
                if (allTables.length > 0) {
                    // Render all html tables
                    tablesEl.innerHTML = allTables.join('<hr style="margin: 20px 0; border: 0; border-top: 1px solid var(--border-color, #ccc);" />');
                } else {
                    tablesEl.innerHTML = '<em>No tables extracted for this filing.</em>';
                }
            }
        } catch (error) {
            console.error('Error rendering filings reader data:', error);
        }
    }
}
