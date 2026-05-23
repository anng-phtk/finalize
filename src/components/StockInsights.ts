import { Component } from "../core/Component";
import { eventBus } from "../core/EventBus";

export class StockInsights extends Component {
    constructor(container: string, path: string) {
        super(container, path);
    }

    protected override bindEvents(): void {
        const handle = eventBus.on('Insights:DataReady', (payload) => {
            this.renderInsights(payload.data);
        });
        this.eventHandles.push(handle);
    }

    private renderInsights(data: any): void {
        try {
            // 1. Recommendation
            const ratingEl = this.getElement('insights-rating');
            const targetEl = this.getElement('insights-target');
            
            if (data.recommendation) {
                ratingEl.textContent = data.recommendation.rating || 'N/A';
                if (data.recommendation.rating === 'BUY') {
                    ratingEl.style.color = '#28a745';
                } else if (data.recommendation.rating === 'SELL') {
                    ratingEl.style.color = '#dc3545';
                } else {
                    ratingEl.style.color = '#ffc107';
                }
                targetEl.textContent = data.recommendation.targetPrice ? `$${data.recommendation.targetPrice}` : 'N/A';
            } else {
                ratingEl.textContent = 'N/A';
                targetEl.textContent = 'N/A';
            }

            // 2. Outlooks
            const outlooks = data.instrumentInfo?.outlooks || {};
            const renderOutlook = (elId: string, outlookData: any) => {
                const el = this.getElement(elId);
                if (outlookData && outlookData.direction) {
                    el.textContent = `${outlookData.direction} (${outlookData.score ?? 0})`;
                    if (outlookData.direction.toUpperCase() === 'BULLISH' || outlookData.direction.toUpperCase() === 'UP') {
                        el.style.color = '#28a745';
                    } else if (outlookData.direction.toUpperCase() === 'BEARISH' || outlookData.direction.toUpperCase() === 'DOWN') {
                        el.style.color = '#dc3545';
                    } else {
                        el.style.color = '#6c757d';
                    }
                } else {
                    el.textContent = 'N/A';
                    el.style.color = 'inherit';
                }
            };

            renderOutlook('outlook-short', outlooks.shortTerm);
            renderOutlook('outlook-intermediate', outlooks.intermediateTerm);
            renderOutlook('outlook-long', outlooks.longTerm);

            // 3. Technicals
            const technicals = data.instrumentInfo?.technicals || {};
            const supEl = this.getElement('tech-support');
            const resEl = this.getElement('tech-resistance');
            const stopEl = this.getElement('tech-stoploss');

            supEl.textContent = technicals.support ? `$${Number(technicals.support).toFixed(2)}` : 'N/A';
            resEl.textContent = technicals.resistance ? `$${Number(technicals.resistance).toFixed(2)}` : 'N/A';
            stopEl.textContent = technicals.stopLoss ? `$${Number(technicals.stopLoss).toFixed(2)}` : 'N/A';

            // 4. Valuation Description
            const valDescEl = this.getElement('valuation-desc');
            const val = data.instrumentInfo?.valuation;
            if (val && val.description) {
                const discountText = val.discount ? ` (${val.discount} Discount)` : '';
                valDescEl.textContent = `${val.description}${discountText}`;
            } else {
                valDescEl.textContent = 'No valuation insight description available.';
            }

            // 5. Significant Developments
            const sigDevsList = this.getElement('sig-devs-list');
            sigDevsList.innerHTML = '';
            
            const sigDevs = data.sigDevs || [];
            if (sigDevs.length > 0) {
                sigDevs.forEach((dev: any) => {
                    const item = document.createElement('div');
                    item.style.padding = '0.5rem';
                    item.style.background = 'var(--sf-gray-0)';
                    item.style.borderRadius = '4px';
                    item.style.border = '1px solid var(--sf-border)';
                    item.style.fontSize = '0.75rem';
                    item.style.display = 'flex';
                    item.style.flexDirection = 'column';
                    item.style.gap = '0.25rem';

                    const dateStr = dev.date ? new Date(dev.date).toLocaleDateString() : '';
                    item.innerHTML = `
                        <div style="font-weight: 600; color: var(--sf-gray-9);">${dev.headline || 'No Headline'}</div>
                        <div style="font-size: 0.65rem; color: var(--sf-gray-10);">${dateStr}</div>
                    `;
                    sigDevsList.appendChild(item);
                });
            } else {
                sigDevsList.innerHTML = `<div style="font-size: 0.75rem; color: var(--sf-gray-10); text-align: center; padding-top: 1rem;">No developments found</div>`;
            }

        } catch (error) {
            console.error('Error rendering Stock Insights:', error);
        }
    }
}
