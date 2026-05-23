import { Component } from "../core/Component";
import { eventBus } from "../core/EventBus";
import { fundamentalsStore } from "../store/FundamentalsStore";
import { valuationStore } from "../store/ValuationStore";
import type { ValuationThesis } from "../store/ValuationStore";

export class ValuationDCF extends Component {
    private currentTicker: string = '';
    private overrides: Set<string> = new Set();

    constructor() {
        super("valuation-stage-container", "/components/valuation/valuation-dcf.html");
    }

    protected bindEvents(): void {
        const loadHandle = eventBus.on("Valuation:Model:Load", (payload: { ticker: string, refresh: boolean }) => {
            this.loadData(payload.ticker, false);
        });
        this.eventHandles.push(loadHandle);

        const inputs = ['inp-fcf', 'inp-shares', 'inp-netdebt', 'inp-g1', 'inp-g2', 'inp-wacc', 'inp-tg'];
        inputs.forEach(id => {
            const el = this.getElement<HTMLInputElement>(id);
            if (el) {
                el.addEventListener('input', () => this.calculateModel());
            }
        });

        const resetBtn = this.getElement('btn-reset-dcf');
        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                if (this.currentTicker) {
                    this.overrides.clear();
                    valuationStore.clearThesis(this.currentTicker);
                    this.loadData(this.currentTicker, true);
                }
            });
        }

        const overrideFields = ['inp-out-tv', 'inp-out-pv-tv', 'inp-out-ev', 'inp-out-equity', 'inp-out-price'];
        overrideFields.forEach(id => {
            const el = this.getElement<HTMLInputElement>(id);
            if (el) {
                el.addEventListener('input', () => {
                    this.overrides.add(id);
                    el.classList.add('border-warning');
                    this.calculateModel();
                });
            }
        });

        const finalizeBtns = this.container.querySelectorAll('#btn-finalize-dcf');
        finalizeBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const valuationState = this.finalizeValuation();
                if (valuationState) {
                    valuationStore.saveThesis(this.currentTicker, valuationState);
                    eventBus.emit("Valuation:Model:Finalized", {
                        ticker: this.currentTicker,
                        data: valuationState
                    });
                }
            });
        });
    }

    private loadData(ticker: string, forceReset: boolean = false) {
        this.currentTicker = ticker;
        this.getElement("dcf-ticker").innerText = ticker;
        const overrideFields = ['inp-out-tv', 'inp-out-pv-tv', 'inp-out-ev', 'inp-out-equity', 'inp-out-price'];
        this.overrides.clear();
        overrideFields.forEach(id => {
            const el = this.getElement<HTMLInputElement>(id);
            if (el) {
                el.classList.remove('border-warning');
            }
        });
        const dataCache = fundamentalsStore.get(ticker, 'ANNUAL');
        const data = dataCache ? dataCache.data : null;

        let fcfAvg = 0;
        let shares = 0;
        let netDebt = 0;

        if (data && data.rows) {
            const fcfRow = data.rows.find(r => r.key === 'FREE_CASH_FLOW');
            const sharesRow = data.rows.find(r => r.key === 'SHARES_OUTSTANDING');
            const debtRow = data.rows.find(r => r.key === 'TOTAL_DEBT');
            const cashRow = data.rows.find(r => r.key === 'CASH_AND_EQUIV');

            if (fcfRow && fcfRow.data && fcfRow.data.length >= 3) {
                fcfAvg = (Number(fcfRow.data[0] || 0) + Number(fcfRow.data[1] || 0) + Number(fcfRow.data[2] || 0)) / 3;
            } else if (fcfRow && fcfRow.data && fcfRow.data.length > 0) {
                fcfAvg = Number(fcfRow.data[0] || 0);
            }

            if (sharesRow && sharesRow.data && sharesRow.data.length > 0) {
                shares = Number(sharesRow.data[0] || 0);
            }

            const debt = (debtRow && debtRow.data && debtRow.data.length > 0) ? Number(debtRow.data[0] || 0) : 0;
            const cash = (cashRow && cashRow.data && cashRow.data.length > 0) ? Number(cashRow.data[0] || 0) : 0;
            netDebt = debt - cash;
        }

        this.getElement<HTMLInputElement>("inp-fcf").value = (fcfAvg / 1e9).toFixed(2);
        this.getElement<HTMLInputElement>("inp-shares").value = (shares / 1e9).toFixed(2);
        this.getElement<HTMLInputElement>("inp-netdebt").value = (netDebt / 1e9).toFixed(2);

        if (forceReset) {
            this.getElement<HTMLInputElement>("inp-g1").value = "10";
            this.getElement<HTMLInputElement>("inp-g2").value = "4";
            this.getElement<HTMLInputElement>("inp-wacc").value = "9";
            this.getElement<HTMLInputElement>("inp-tg").value = "3";
            
            const notes = ['note-fcf', 'note-shares', 'note-netdebt', 'note-wacc', 'note-tg', 'note-out-tv', 'note-out-pv-tv', 'note-out-weight', 'note-out-ev', 'note-out-equity', 'note-out-price'];
            notes.forEach(id => {
                const el = this.getElement<HTMLInputElement>(id);
                if (el) el.value = '';
            });
        } else {
            const existingThesis = valuationStore.getThesis(ticker);
            if (existingThesis) {
                this.getElement<HTMLInputElement>("inp-fcf").value = existingThesis.baseFCF.value.toString();
                this.getElement<HTMLInputElement>("note-fcf").value = existingThesis.baseFCF.note || "";
                this.getElement<HTMLInputElement>("inp-g1").value = existingThesis.growth1.value.toString();
                this.getElement<HTMLInputElement>("inp-wacc").value = existingThesis.wacc.value.toString();
                this.getElement<HTMLInputElement>("note-wacc").value = existingThesis.wacc.note || "";
                this.getElement<HTMLInputElement>("inp-tg").value = existingThesis.terminalGrowth.value.toString();
                this.getElement<HTMLInputElement>("note-tg").value = existingThesis.terminalGrowth.note || "";
            } else {
                this.getElement<HTMLInputElement>("inp-g1").value = "10";
                this.getElement<HTMLInputElement>("inp-g2").value = "4";
                this.getElement<HTMLInputElement>("inp-wacc").value = "9";
                this.getElement<HTMLInputElement>("inp-tg").value = "3";
                
                const notes = ['note-fcf', 'note-shares', 'note-netdebt', 'note-wacc', 'note-tg', 'note-out-tv', 'note-out-pv-tv', 'note-out-weight', 'note-out-ev', 'note-out-equity', 'note-out-price'];
                notes.forEach(id => {
                    const el = this.getElement<HTMLInputElement>(id);
                    if (el) el.value = '';
                });
            }
        }

        this.calculateModel();
    }

    private calculateModel() {
        const baseFCF = parseFloat(this.getElement<HTMLInputElement>("inp-fcf").value) || 0;
        const shares = parseFloat(this.getElement<HTMLInputElement>("inp-shares").value) || 0;
        const netDebt = parseFloat(this.getElement<HTMLInputElement>("inp-netdebt").value) || 0;

        const g1Val = parseFloat(this.getElement<HTMLInputElement>("inp-g1").value);
        const g2Val = parseFloat(this.getElement<HTMLInputElement>("inp-g2").value);
        const waccVal = parseFloat(this.getElement<HTMLInputElement>("inp-wacc").value);
        const tgVal = parseFloat(this.getElement<HTMLInputElement>("inp-tg").value);

        this.getElement("val-g1").innerText = g1Val + "%";
        this.getElement("val-g2").innerText = g2Val + "%";
        this.getElement("val-wacc").innerText = waccVal + "%";
        this.getElement("val-tg").innerText = tgVal + "%";

        const g1 = g1Val / 100;
        const g2Target = g2Val / 100;
        const wacc = waccVal / 100;
        const tg = tgVal / 100;

        const projectedFCF: number[] = [];
        const pvOfFCF: number[] = [];
        let sumPV = 0;
        let currentFCF = baseFCF;
        const decayStep = (g1 - g2Target) / 5;

        for (let year = 1; year <= 10; year++) {
            let growthRate = year <= 5 ? g1 : g1 - (decayStep * (year - 5));
            currentFCF = currentFCF * (1 + growthRate);
            projectedFCF.push(currentFCF);

            let discountFactor = Math.pow(1 + wacc, year);
            let pv = currentFCF / discountFactor;
            pvOfFCF.push(pv);
            sumPV += pv;

            const gCell = this.container.querySelector(`#g-${year}`) as HTMLElement;
            const cfCell = this.container.querySelector(`#cf-${year}`) as HTMLElement;
            const dfCell = this.container.querySelector(`#df-${year}`) as HTMLElement;
            const pvCell = this.container.querySelector(`#pv-${year}`) as HTMLElement;

            if (gCell) gCell.innerText = (growthRate * 100).toFixed(1) + "%";
            if (cfCell) cfCell.innerText = currentFCF.toFixed(1);
            if (dfCell) dfCell.innerText = discountFactor.toFixed(2);
            if (pvCell) pvCell.innerText = pv.toFixed(1);
        }

        const fcfYear10 = projectedFCF[9] || 0;

        let terminalValue = (fcfYear10 * (1 + tg)) / (wacc - tg);
        if (this.overrides.has("inp-out-tv")) {
            terminalValue = parseFloat(this.getElement<HTMLInputElement>("inp-out-tv").value) || 0;
        } else {
            this.getElement<HTMLInputElement>("inp-out-tv").value = terminalValue.toFixed(1);
        }

        let pvOfTV = terminalValue / Math.pow(1 + wacc, 10);
        if (this.overrides.has("inp-out-pv-tv")) {
            pvOfTV = parseFloat(this.getElement<HTMLInputElement>("inp-out-pv-tv").value) || 0;
        } else {
            this.getElement<HTMLInputElement>("inp-out-pv-tv").value = pvOfTV.toFixed(1);
        }

        let enterpriseValue = sumPV + pvOfTV;
        if (this.overrides.has("inp-out-ev")) {
            enterpriseValue = parseFloat(this.getElement<HTMLInputElement>("inp-out-ev").value) || 0;
        } else {
            this.getElement<HTMLInputElement>("inp-out-ev").value = enterpriseValue.toFixed(1);
        }

        let equityValue = enterpriseValue - netDebt;
        if (this.overrides.has("inp-out-equity")) {
            equityValue = parseFloat(this.getElement<HTMLInputElement>("inp-out-equity").value) || 0;
        } else {
            this.getElement<HTMLInputElement>("inp-out-equity").value = equityValue.toFixed(1);
        }

        let intrinsicPrice = shares > 0 ? (equityValue / shares) : 0;
        if (this.overrides.has("inp-out-price")) {
            intrinsicPrice = parseFloat(this.getElement<HTMLInputElement>("inp-out-price").value) || 0;
        } else {
            this.getElement<HTMLInputElement>("inp-out-price").value = intrinsicPrice.toFixed(2);
        }

        const terminalWeight = (enterpriseValue > 0) ? (pvOfTV / enterpriseValue) * 100 : 0;
        this.getElement("out-terminal-weight").innerText = terminalWeight.toFixed(0) + "%";

        this.getElement("out-sum-pv").innerText = "$" + sumPV.toFixed(2) + "B";
    }

    private finalizeValuation(): ValuationThesis | undefined {
        if (!this.currentTicker) return undefined;

        const valuationState: ValuationThesis = {
            baseFCF: {
                value: parseFloat(this.getElement<HTMLInputElement>("inp-fcf").value) || 0,
                note: this.getElement<HTMLInputElement>("note-fcf").value
            },
            growth1: {
                value: parseFloat(this.getElement<HTMLInputElement>("inp-g1").value) || 0,
                note: "Years 1-5"
            },
            wacc: {
                value: parseFloat(this.getElement<HTMLInputElement>("inp-wacc").value) || 0,
                note: this.getElement<HTMLInputElement>("note-wacc").value
            },
            terminalGrowth: {
                value: parseFloat(this.getElement<HTMLInputElement>("inp-tg").value) || 0,
                note: this.getElement<HTMLInputElement>("note-tg").value
            },
            intrinsicPrice: parseFloat(this.getElement<HTMLInputElement>("inp-out-price").value) || 0
        };

        const btns = this.container.querySelectorAll('#btn-finalize-dcf');
        btns.forEach(btn => {
            const originalHtml = btn.innerHTML;
            btn.innerHTML = `<i class="bi bi-check2-all me-2"></i> Thesis Saved`;
            setTimeout(() => {
                btn.innerHTML = originalHtml;
            }, 2000);
        });

        return valuationState;
    }
}
