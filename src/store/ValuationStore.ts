export type ValuationThesis = {
    baseFCF: { value: number; note: string };
    growth1: { value: number; note: string };
    wacc: { value: number; note: string };
    terminalGrowth: { value: number; note: string };
    intrinsicPrice: number;
};

class ValuationStore {
    private readonly STORAGE_KEY = 'finalysis_valuation_theses';
    private cache: Map<string, ValuationThesis>;

    constructor() {
        this.cache = new Map();
        this.loadFromStorage();
    }

    private loadFromStorage() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                for (const [key, val] of Object.entries(parsed)) {
                    this.cache.set(key, val as ValuationThesis);
                }
            }
        } catch (error) {
            console.error('Failed to load valuation theses from localStorage', error);
        }
    }

    private saveToStorage() {
        try {
            const obj = Object.fromEntries(this.cache.entries());
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(obj));
        } catch (error) {
            console.error('Failed to save valuation theses to localStorage', error);
        }
    }

    public getThesis(ticker: string): ValuationThesis | undefined {
        return this.cache.get(ticker.toUpperCase());
    }

    public saveThesis(ticker: string, thesis: ValuationThesis): void {
        this.cache.set(ticker.toUpperCase(), thesis);
        this.saveToStorage();
    }

    public clearThesis(ticker: string): void {
        this.cache.delete(ticker.toUpperCase());
        this.saveToStorage();
    }
}

export const valuationStore = new ValuationStore();
