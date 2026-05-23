import { Component } from "../core/Component";
import { eventBus } from "../core/EventBus";

export class KeyEvents extends Component {
    constructor(container: string, path: string) {
        super(container, path);
    }

    protected override bindEvents(): void {
        const handle = eventBus.on('KeyEvents:DataReady', (payload) => {
            this.renderKeyEvents(payload.data);
        });
        this.eventHandles.push(handle);
    }

    private renderKeyEvents(data: any): void {
        try {
            // 1. Earnings Calendar
            const earningsDateEl = this.getElement('calendar-earnings-date');
            const earningsEpsEl = this.getElement('calendar-earnings-eps');
            const earnings = data.calendars?.earnings || [];
            
            if (earnings.length > 0) {
                const latestEarnings = earnings[0];
                const dateStr = latestEarnings.date ? new Date(latestEarnings.date).toLocaleDateString() : 'N/A';
                earningsDateEl.textContent = dateStr;
                earningsEpsEl.textContent = `Est. EPS: ${latestEarnings.epsEstimated != null ? `$${latestEarnings.epsEstimated}` : 'N/A'}`;
            } else {
                earningsDateEl.textContent = 'N/A';
                earningsEpsEl.textContent = 'Est. EPS: N/A';
            }

            // 2. Dividends Calendar
            const divDateEl = this.getElement('calendar-dividend-date');
            const divYieldEl = this.getElement('calendar-dividend-yield');
            const dividends = data.calendars?.dividends || [];

            if (dividends.length > 0) {
                const latestDiv = dividends[0];
                const dateStr = latestDiv.date ? new Date(latestDiv.date).toLocaleDateString() : 'N/A';
                divDateEl.textContent = dateStr;
                divYieldEl.textContent = `Yield: ${latestDiv.dividendYield != null ? `${(latestDiv.dividendYield * 100).toFixed(2)}%` : 'N/A'}`;
            } else {
                divDateEl.textContent = 'N/A';
                divYieldEl.textContent = 'Yield: N/A';
            }

            // 3. Insider Trades
            const listEl = this.getElement('insider-trades-list');
            listEl.innerHTML = '';

            const trades = data.insiderTrades || [];
            if (trades.length > 0) {
                // Slice to latest 10
                trades.slice(0, 10).forEach((trade: any) => {
                    const item = document.createElement('div');
                    item.style.padding = '0.5rem';
                    item.style.background = 'var(--sf-gray-0)';
                    item.style.borderRadius = '4px';
                    item.style.border = '1px solid var(--sf-border)';
                    item.style.fontSize = '0.75rem';
                    item.style.display = 'flex';
                    item.style.flexDirection = 'column';
                    item.style.gap = '0.15rem';

                    const type = trade.transactionType || '';
                    const isBuy = type.toUpperCase().includes('BUY') || type.toUpperCase().includes('ACQUISITION') || trade.transactionTypeName?.toUpperCase().includes('BUY');
                    const color = isBuy ? '#28a745' : '#dc3545';
                    const actionLabel = isBuy ? 'BUY' : 'SELL';

                    const dateStr = trade.transactionDate ? new Date(trade.transactionDate).toLocaleDateString() : '';
                    const totalValue = trade.value ? `$${Number(trade.value).toLocaleString()}` : '';
                    const price = trade.price ? `$${Number(trade.price).toFixed(2)}` : '';
                    const shares = trade.shares ? Number(trade.shares).toLocaleString() : '';

                    item.innerHTML = `
                        <div style="display: flex; justify-content: space-between; font-weight: 600;">
                            <span style="color: var(--sf-gray-9); max-width: 70%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                ${trade.reportingName || 'Unknown'}
                            </span>
                            <span style="color: ${color}; font-weight: bold; font-size: 0.7rem;">
                                ${actionLabel}
                            </span>
                        </div>
                        <div style="font-size: 0.65rem; color: var(--sf-gray-10); font-style: italic;">
                            ${trade.title || 'Insider'}
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--sf-gray-9); margin-top: 0.15rem;">
                            <span>Shares: ${shares} @ ${price}</span>
                            <span style="font-weight: 600;">Value: ${totalValue}</span>
                        </div>
                        <div style="font-size: 0.6rem; color: var(--sf-gray-10); margin-top: 0.1rem; text-align: right;">
                            Date: ${dateStr}
                        </div>
                    `;
                    listEl.appendChild(item);
                });
            } else {
                listEl.innerHTML = `<div style="font-size: 0.75rem; color: var(--sf-gray-10); text-align: center; padding-top: 1rem;">No insider trades recorded</div>`;
            }

        } catch (error) {
            console.error('Error rendering Key Events:', error);
        }
    }
}
