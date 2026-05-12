
export type ReportTypes = { formType: "ANNUAL" | "QUARTERLY" | "VALUATION";}

export type ToolbarFetchRequest = {
    ticker: string;
    peers: string[];
    formType: ReportTypes["formType"];
    refresh: boolean;
};

export type FundamentalsRequest = {
    ticker: string;
    formType: ReportTypes["formType"];
    refresh: boolean;
}

export type FundamentalsResponse = {
    [metric:string]:  Array<string | number | null>;
}


export type FundamentalCategory =
    | "Income Statement"
    | "Cash Flow"
    | "Balance Sheet"
    | "Shareholder Returns"
    | "Growth"
    | "Ratios & Margins"
    | "Valuation Inputs"
    | "Other";

    export const categoryRank: Record<FundamentalCategory, number> = {
    "Income Statement": 1,
    "Cash Flow": 2,
    "Balance Sheet": 3,
    "Shareholder Returns": 4,
    "Growth": 5,
    "Ratios & Margins": 6,
    "Valuation Inputs": 7,
    "Other": 99,
};

export const FundamentalsDataDefinition: Record<string, FundamentalsDataType> = {
    REVENUE: {
        label: "Revenue",
        category: "Income Statement",
        format: "currency",
        defaultVisible: true,
    },
    OP_INCOME: {
        label: "Operating Income",
        category: "Income Statement",
        format: "currency",
        defaultVisible: true,
    },
    PRETAX_INCOME: {
        label: "Pretax Income",
        category: "Income Statement",
        format: "currency",
        defaultVisible: false,
    },
    NET_INCOME: {
        label: "Net Income",
        category: "Income Statement",
        format: "currency",
        defaultVisible: true,
    },
    EPS_DILUTED: {
        label: "Diluted EPS",
        category: "Income Statement",
        format: "number",
        defaultVisible: true,
    },
    WEIGHTED_AVG_SHARES_DILUTED: {
        label: "Weighted Avg Diluted Shares",
        category: "Income Statement",
        format: "shares",
        defaultVisible: false,
    },

    OP_CASH_FLOW: {
        label: "Operating Cash Flow",
        category: "Cash Flow",
        format: "currency",
        defaultVisible: true,
    },
    CAPEX: {
        label: "Capital Expenditure",
        category: "Cash Flow",
        format: "currency",
        defaultVisible: true,
    },
    FREE_CASH_FLOW: {
        label: "Free Cash Flow",
        category: "Cash Flow",
        format: "currency",
        defaultVisible: true,
    },
    FCFF: {
        label: "Free Cash Flow to Firm",
        category: "Cash Flow",
        format: "currency",
        defaultVisible: false,
    },
    FCFE: {
        label: "Free Cash Flow to Equity",
        category: "Cash Flow",
        format: "currency",
        defaultVisible: false,
    },

    RECEIVABLES: {
        label: "Receivables",
        category: "Balance Sheet",
        format: "currency",
        defaultVisible: false,
    },
    INVENTORY: {
        label: "Inventory",
        category: "Balance Sheet",
        format: "currency",
        defaultVisible: false,
    },
    PAYABLES: {
        label: "Payables",
        category: "Balance Sheet",
        format: "currency",
        defaultVisible: false,
    },
    CASH_AND_EQUIV: {
        label: "Cash & Equivalents",
        category: "Balance Sheet",
        format: "currency",
        defaultVisible: true,
    },
    LONG_TERM_DEBT: {
        label: "Long-Term Debt",
        category: "Balance Sheet",
        format: "currency",
        defaultVisible: true,
    },
    SHORT_TERM_DEBT: {
        label: "Short-Term Debt",
        category: "Balance Sheet",
        format: "currency",
        defaultVisible: false,
    },
    TOTAL_DEBT: {
        label: "Total Debt",
        category: "Balance Sheet",
        format: "currency",
        defaultVisible: true,
    },
    TOTAL_EQUITY: {
        label: "Total Equity",
        category: "Balance Sheet",
        format: "currency",
        defaultVisible: true,
    },
    INVESTED_CAPITAL: {
        label: "Invested Capital",
        category: "Balance Sheet",
        format: "currency",
        defaultVisible: false,
    },

    DIV_PER_SHARE: {
        label: "Dividend Per Share",
        category: "Shareholder Returns",
        format: "number",
        defaultVisible: true,
    },
    DIV_PAID: {
        label: "Dividends Paid",
        category: "Shareholder Returns",
        format: "currency",
        defaultVisible: true,
    },

    YOY_REVENUE_GROWTH: {
        label: "YoY Revenue Growth",
        category: "Growth",
        format: "percent",
        defaultVisible: true,
        visual: "gauge",
    },
    YOY_NET_INCOME_GROWTH: {
        label: "YoY Net Income Growth",
        category: "Growth",
        format: "percent",
        defaultVisible: true,
        visual: "gauge",
    },
    YOY_FCF_GROWTH: {
        label: "YoY FCF Growth",
        category: "Growth",
        format: "percent",
        defaultVisible: true,
        visual: "gauge",
    },
    REVENUE_CAGR_3Y: {
        label: "Revenue CAGR 3Y",
        category: "Growth",
        format: "percent",
        defaultVisible: true,
        visual: "gauge",
    },
    NET_INC_CAGR_3Y: {
        label: "Net Income CAGR 3Y",
        category: "Growth",
        format: "percent",
        defaultVisible: true,
        visual: "gauge",
    },

    OPERATING_MARGIN: {
        label: "Operating Margin",
        category: "Ratios & Margins",
        format: "percent",
        defaultVisible: true,
    },
    NET_MARGIN: {
        label: "Net Margin",
        category: "Ratios & Margins",
        format: "percent",
        defaultVisible: true,
    },
    ROE: {
        label: "Return on Equity",
        category: "Ratios & Margins",
        format: "percent",
        defaultVisible: true,
    },
    ROIC: {
        label: "Return on Invested Capital",
        category: "Ratios & Margins",
        format: "percent",
        defaultVisible: true,
    },
    DEBT_TO_EQUITY: {
        label: "Debt to Equity",
        category: "Ratios & Margins",
        format: "ratio",
        defaultVisible: true,
    },
    FCF_TO_CAPEX: {
        label: "FCF to CapEx",
        category: "Ratios & Margins",
        format: "ratio",
        defaultVisible: true,
    },
    EFFECTIVE_TAX_RATE: {
        label: "Effective Tax Rate",
        category: "Ratios & Margins",
        format: "percent",
        defaultVisible: false,
    },

    NOPAT: {
        label: "NOPAT",
        category: "Valuation Inputs",
        format: "currency",
        defaultVisible: true,
    },
    SBC: {
        label: "Stock Based Compensation",
        category: "Income Statement",
        format: "currency",
        defaultVisible: false,
    },
    TAX: {
        label: "Tax Expense",
        category: "Income Statement",
        format: "currency",
        defaultVisible: false,
    },
    DA: {
        label: "Depreciation & Amortization",
        category: "Income Statement",
        format: "currency",
        defaultVisible: false,
    },
    INTEREST_EXPENSE: {
        label: "Interest Expense",
        category: "Income Statement",
        format: "currency",
        defaultVisible: false,
    },

    EQUITY_ATTRIBUTABLE_TO_PARENT: {
        label: "Equity Attributable to Parent",
        category: "Balance Sheet",
        format: "currency",
        defaultVisible: false,
    },
    SHARES_OUTSTANDING: {
        label: "Shares Outstanding",
        category: "Balance Sheet",
        format: "shares",
        defaultVisible: false,
    },

    REVENUE_CAGR_5Y: {
        label: "Revenue CAGR 5Y",
        category: "Growth",
        format: "percent",
        defaultVisible: true,
        visual: "gauge",
    },
    NET_INC_CAGR_5Y: {
        label: "Net Income CAGR 5Y",
        category: "Growth",
        format: "percent",
        defaultVisible: true,
        visual: "gauge",
    },
};

export type FundamentalMetricValue = string | number | null;

export type FundamentalMetricFormat =
    | "currency"
    | "number"
    | "shares"
    | "percent"
    | "ratio";

export type AdaptedFundamentalRow = {
    key: string;
    category: FundamentalCategory;
    label: string;
    data: FundamentalMetricValue[];
    format?: FundamentalMetricFormat;
    defaultVisible?: boolean;
    visual?: string;
};

export type AdaptedFundamentals = {
    periods: string[];
    formTypes: string[];
    filingUrls: string[];
    rows: AdaptedFundamentalRow[];
}
