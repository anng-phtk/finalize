import { categoryRank, FundamentalsDataDefinition, type AdaptedFundamentalRow, type AdaptedFundamentals, type FundamentalsResponse } from "../contracts/FundamentalsContracts";


class FundamentalsAdapter {
    //private map
    adaptData(rawData: FundamentalsResponse): AdaptedFundamentals {
        const dataByCategory: AdaptedFundamentalRow[] = [];
        const periods = (rawData["reportedPeriods"] as string[]) || [];
        const formTypes = (rawData["FORM_TYPE"] as string[]) || [];
        const filingUrls = (rawData["FILING_URL"] as string[]) || [];

        for (const [key, value] of Object.entries(rawData)) {
            if (key === "reportedPeriods" || key === "FORM_TYPE" || key === "FILING_URL") {
                continue;
            }

            const definition = FundamentalsDataDefinition[key];

            const item: AdaptedFundamentalRow = {
                key,
                category: definition?.category ?? "Other",
                label: definition?.label ?? key,
                data: value,
                format: definition?.format,
                defaultVisible: definition?.defaultVisible,
                visual: definition?.visual,
            };

            dataByCategory.push(item);
        }

        dataByCategory.sort(
            (a, b) => categoryRank[a.category] - categoryRank[b.category]
        );

        return {
            periods,
            formTypes,
            filingUrls,
            rows: dataByCategory
        };
    }
}




export const fundamentalsAdapter = new FundamentalsAdapter();