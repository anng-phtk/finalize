export abstract class Component {
    protected container: HTMLElement;
    protected elements = new Map<string, HTMLElement>();
    private templatePath: string = '';
    constructor(containerId: string, path: string,) {
        const container = document.getElementById(containerId);
        this.templatePath = path;
        if (!container) {
            throw new Error(`Container not found: ${containerId}`);
        }

        this.container = container;
    }

    public async mount(): Promise<void> {
        const html = await this.loadTemplate(this.templatePath);
        this.setHtml(html);
        this.cacheElements();
        this.bindEvents();
        this.afterRender();
    }

    protected async loadTemplate(templatePath: string): Promise<string> {
        const response = await fetch(templatePath);

        if (!response.ok) {
            throw new Error(`Failed to load template: ${templatePath}`);
        }

        return response.text();
    }

    protected setHtml(html: string): void {
        this.container.innerHTML = html;
    }

    protected cacheElements(): void {
        this.elements.clear();

        this.container.querySelectorAll<HTMLElement>("[id]").forEach((element) => {
            this.elements.set(element.id, element);
        });
    }
    // helper method to add a single element to the cache, useful for dynamically added elements after initial render
    protected addElementToCache<T extends HTMLElement = HTMLElement>(id: string, element: T): void {
        this.elements.set(id, element);
    }

    protected getElement<T extends HTMLElement = HTMLElement>(id: string): T {
        const element = this.elements.get(id);

        if (!element) {
            throw new Error(`Element not found in component: ${id}`);
        }

        return element as T;
    }


    protected afterRender(): void {
        // optional override
    }

    protected abstract bindEvents(): void;

}