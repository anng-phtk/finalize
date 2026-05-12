export function formatCell(val: any, metric: string): string {
    if (val == null || val === '') return '<span class="text-muted">—</span>';

    let num = Number(val);
    if (isNaN(num)) return String(val);

    let formattedNum = formatNumber(num, metric, 2);
    let badgeHtml = '';

    // 2. Alerting Pills (Badges)
    if (metric.includes('GROWTH') || metric.includes('CAGR') || metric.includes('MARGIN') || metric.includes('ROE') || metric.includes('ROIC') || metric.includes('RETURN')) {
        if (num > 0.20) {
            badgeHtml = `<span class="badge bg-success ms-2" style="font-size: 0.65em; letter-spacing: 0.5px;">HYPER</span>`;
        } else if (num > 0.10) {
            badgeHtml = `<span class="badge bg-success bg-opacity-75 ms-2" style="font-size: 0.65em; letter-spacing: 0.5px;">HIGH</span>`;
        } else if (num > 0) {
            badgeHtml = `<span class="badge bg-primary ms-2" style="font-size: 0.65em; letter-spacing: 0.5px;">GROWTH</span>`;
        } else if (num < 0) {
            badgeHtml = `<span class="badge bg-danger ms-2" style="font-size: 0.65em; letter-spacing: 0.5px;">DECLINE</span>`;
        }
    }

    // 3. Final Render Assembly
    let finalHtml = formattedNum + badgeHtml;
    if (num < 0 && !metric.includes('GROWTH') && !metric.includes('CAGR')) {
        // Red text for negative absolute values, but keep growth colors isolated to the pills
        finalHtml = `<span class="text-danger">${finalHtml}</span>`;
    }

    return finalHtml;
}

export function formatNumber(val: any, metric: string, precision: number = 3): string {
    if (val == null || val === "") return "—";

    const num = Number(val);
    if (isNaN(num)) return String(val);

    const absVal = Math.abs(num);
    const isPercent = metric.includes('MARGIN') || metric.includes('GROWTH') || metric.includes('CAGR') || metric.includes('ROE') || metric.includes('ROIC') || metric.includes('COST_OF') || metric.includes('WACC') || metric === 'RE' || metric === 'RD' || metric.includes('PERCENT');
    const isRatio = metric === 'PE_RATIO' || metric === 'PE' || metric === 'BETA' || metric.includes('DEBT_TO_EQUITY') || metric.includes('FCF_TO_CAPEX');
    const isPerShare = metric.includes('PER_SHARE') || metric.includes('EPS');

    if (isPercent) {
        return `${(num * 100).toFixed(precision)}%`;
    }

    if (metric === 'PE_RATIO' || metric === 'PE') {
        return `${num.toFixed(precision)}x`;
    }

    if (isRatio) {
        return num.toFixed(precision);
    }

    if (isPerShare) {
        return `$${num.toFixed(precision)}`;
    }

    if (absVal >= 1e12) {
        return `$ ${(num / 1e12).toFixed(precision)} T`;
    }

    if (absVal >= 1e9) {
        return `$ ${(num / 1e9).toFixed(precision)} B`;
    }

    if (absVal >= 1e6) {
        return `$ ${(num / 1e6).toFixed(precision)} M`;
    }

    return `$ ${num.toLocaleString(undefined, { maximumFractionDigits: precision })}`;
}

export function humanizeMetric(metric: string): string {
    return metric.replace(/_/g, " ");
}
