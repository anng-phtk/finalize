import { eventBus } from "../core/EventBus";

export function initializeToast() {
    const container = document.getElementById('toast-container');
    if (!container) return;

    container.style.display = 'none';
    let timeoutId: any = null;

    const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
        let colorClass = 'text-primary';
        let headerText = 'Notification';

        if (type === 'success') {
            colorClass = 'text-success';
            headerText = 'Success';
        } else if (type === 'error') {
            colorClass = 'text-danger';
            headerText = 'Error';
        }

        container.innerHTML = `
            <div style="padding: 1rem;">
                <div class="toast-header ${colorClass} mb-1" style="font-weight: 500;">
                    <i class="bi bi-info-circle me-1"></i> ${headerText}
                </div>
                <div class="toast-body" style="font-size: 0.85rem; color: var(--sf-gray-8);">
                    ${message}
                </div>
            </div>
        `;
        
        container.style.display = 'flex';
        container.style.backgroundColor = 'var(--sf-gray-0, #fff)';
        container.style.borderLeft = `4px solid var(--bs-${type === 'error' ? 'danger' : (type === 'success' ? 'success' : 'primary')})`;

        if (timeoutId) clearTimeout(timeoutId);

        // Hide after 2 seconds
        timeoutId = setTimeout(() => {
            container.style.display = 'none';
        }, 2000);
    };

    eventBus.on('System:EventBus:Activity', (payload) => {
        const { eventName, payload: eventData } = payload;
        
        // Define which events trigger toasts
        if (eventName === 'Toolbar:Fetch:Clicked') {
            showToast(`Fetching data for ${eventData.ticker}...`, 'info');
        } else if (eventName === 'Toolbar:Comparison:Requested') {
            showToast(`Fetching peer comparison data...`, 'info');
        } else if (eventName === 'Fundamentals:FilingForm:TextRequested') {
            showToast(`Fetching filing narrative...`, 'info');
        } else if (eventName === 'Fundamentals:Ticker:DataReady') {
            showToast(`Fundamentals loaded for ${eventData.ticker}`, 'success');
        } else if (eventName === 'Fundamentals:Peer:DataReady') {
            showToast(`Peer data loaded`, 'success');
        } else if (eventName === 'FilingsReader:DataReady') {
            showToast(`Filing text loaded`, 'success');
        } else if (eventName.endsWith('Error')) {
            const errCause = (eventData as any).cause;
            const errMsg = errCause ? String(errCause) : 'An error occurred';
            showToast(`Error: ${errMsg}`, 'error');
        }
    });
}