import type { ToolbarFetchRequest } from "../contracts/AppContracts";
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
                formType:selReportType,
                refresh: cbRefresh,
                peers: inPeers.filter(val => val.trim() !== '')
            }
            
            eventBus.emit("Toolbar:Fetch:Clicked", payload);
        });
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