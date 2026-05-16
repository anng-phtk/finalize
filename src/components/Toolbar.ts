import type { ToolbarFetchRequest } from "../contracts/FundamentalsContracts";
import { Component } from "../core/Component";
import { eventBus } from "../core/EventBus";


type reportType = ToolbarFetchRequest["formType"];

export class Toolbar extends Component {

    constructor(container: string, path: string) {
        super(container, path);
    }

    protected override bindEvents(): void {
        this.getElement<HTMLButtonElement>('btn-fetch').addEventListener('click', (evt: Event) => {
            const inTicker: string = this.getElement<HTMLInputElement>('in-ticker').value || '';

            if (!inTicker) return; // show a toast 

            const selReportType: reportType = this.toReportType(this.getElement<HTMLSelectElement>('sel-reportType').value);
            const cbRefresh: boolean = this.getElement<HTMLInputElement>('cb-refresh').checked || false;
            const inPeers: string[] = [this.getElement<HTMLInputElement>('in-peer-1').value || '', this.getElement<HTMLInputElement>('in-peer-2').value || '', this.getElement<HTMLInputElement>('in-peer-3').value || ''];


            const payload: ToolbarFetchRequest = {
                ticker: inTicker,
                formType: selReportType,
                refresh: cbRefresh,
                peers: inPeers.filter(val => val.trim() !== '')
            }
            // emit the event
            eventBus.emit("Toolbar:Fetch:Clicked", payload);
        });

        this.getElement('btn-compare').addEventListener('click', () => {
            const inTicker: string = this.getElement<HTMLInputElement>('in-ticker').value || '';
            if (!inTicker) return;

            const inPeers: string[] = [
                this.getElement<HTMLInputElement>('in-peer-1').value || '',
                this.getElement<HTMLInputElement>('in-peer-2').value || '',
                this.getElement<HTMLInputElement>('in-peer-3').value || ''
            ].filter(val => val.trim() !== '');

            eventBus.emit("Toolbar:Comparison:Requested", {
                ticker: inTicker,
                peers: inPeers
            });
        });

        eventBus.on("Toolbar:Defaults:Requested", (payload: ToolbarFetchRequest) => {

            this.setDefaults(payload.ticker, payload.formType, payload.refresh, payload.peers);
            // emit the event to load defaults
            eventBus.emit("Toolbar:Fetch:Clicked", payload);
        });

        this.getElement('btn-clear').addEventListener('click', () => {
            eventBus.emit("Toolbar:Clear:Clicked", {});
        });
    }

    setDefaults(ticker: string = 'AAPL', selReportType: reportType = 'ANNUAL', refresh: boolean = false, peers: string[] = ['']) {
        this.getElement<HTMLInputElement>('in-ticker').value = ticker;
        this.getElement<HTMLSelectElement>('sel-reportType').value = selReportType;
        this.getElement<HTMLInputElement>('cb-refresh').checked = refresh;
        this.setPeer(1, peers[0] ?? '');
        this.setPeer(2, peers[1] ?? '');
        this.setPeer(3, peers[2] ?? '');
    }

    setPeer(index: 1 | 2 | 3, ticker: string) {
        this.getElement<HTMLInputElement>(`in-peer-${index}`).value = ticker;
    }

    toReportType(value: string): reportType {
        if (
            value === "ANNUAL" ||
            value === "QUARTERLY" ||
            value === "VALUATION"
        ) {
            return value;
        }

        throw new Error(`Invalid report type: ${value}`);
    }
}