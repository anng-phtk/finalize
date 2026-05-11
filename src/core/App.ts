import { fundamentalsAdapter } from "../adapters/FundamentalsAdapter";
import { Toolbar } from "../components/Toolbar";
import type { FundamentalsRequest, ToolbarFetchRequest } from "../contracts/AppContracts";
import { fundamentalsStore } from "../store/FundamentalsStore";
import { API } from "./Api";
import { eventBus } from "./EventBus";

document.addEventListener('DOMContentLoaded', async () => {
    console.log('App Started');
    initializeLayout();
    initializeComponents();
});


eventBus.on('Toolbar:Fetch:Clicked', async (payload: ToolbarFetchRequest) => {
    if (!payload.refresh) 
        if (!fundamentalsStore.get(payload.ticker, payload.formType)) fetchData(payload);   

});


const fetchData = (payload: ToolbarFetchRequest) => {
    if (!payload.refresh) {
        
    }

    const tickerRequest: FundamentalsRequest = {
        ticker: payload.ticker,
        formType: payload.formType,
        refresh: payload.refresh
    } as FundamentalsRequest


    console.log(`Requesting data for :`, tickerRequest);

    const tickerResult = await API.fetchFundamentals(tickerRequest);

    const adaptedData = fundamentalsAdapter.adaptData(tickerResult);
    console.log(`adapted data: `, adaptedData)

    const peerRequests: FundamentalsRequest[] = payload.peers.map((peer) => ({
        ticker: peer,
        formType: payload.formType,
        refresh: payload.refresh
    }));

    console.log("Requesting peers", peerRequests);

    const peerResults = await Promise.allSettled(
        peerRequests.map((request) => API.fetchFundamentals(request))
    );

    console.log(`ticker`, tickerResult);
    console.log(`peers`, peerResults);
}


async function initializeComponents() {
    console.log(`called`);
    try {
        let toolbar = new Toolbar('toolbar-container', '/components/toolbar/toolbar.html');
        await toolbar.mount();
    } catch (err) {
        console.log(err)
    }
}

function initializeLayout() {
    const leftPane = document.getElementById('main-left') || null;
    const collapseLeftBtn = document.getElementById('btn-collapse-left');
    const expandLeftBtn = document.getElementById('btn-expand-left')
    leftPane?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (leftPane?.classList.contains('collapsed')) leftPane?.classList.toggle('collapsed');

    });

    collapseLeftBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (leftPane?.classList.contains('expanded')) leftPane?.classList.remove('expanded')
        if (!leftPane?.classList.contains('collapsed')) leftPane?.classList.add('collapsed');
    });

    expandLeftBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        leftPane?.classList.toggle('expanded');
    })


    const rightPane = document.getElementById('main-right') || null;
    const collapseRightBtn = document.getElementById('btn-collapse-right');
    const expandRightBtn = document.getElementById('btn-expand-right');

    rightPane?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (rightPane?.classList.contains('collapsed')) rightPane?.classList.toggle('collapsed');

    });

    collapseRightBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (rightPane?.classList.contains('expanded')) rightPane?.classList.remove('expanded')
        if (!rightPane?.classList.contains('collapsed')) rightPane?.classList.add('collapsed');
    });

    expandRightBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        rightPane?.classList.toggle('expanded');
    });


    const footerPane = document.getElementById('main-footer') || null;

    footerPane?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (footerPane?.classList.contains('collapsed-vertical')) footerPane?.classList.toggle('collapsed-vertical');

    });

    document.getElementById('btn-collapse-footer')?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!footerPane?.classList.contains('collapsed-vertical')) footerPane?.classList.add('collapsed-vertical');
    });
}