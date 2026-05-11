import { type AppEventsMap } from "../events/AppEvents";

class EventBus {
    private handlers:Map<keyof AppEventsMap, Set<Function>> = new Map();

    on<K extends keyof AppEventsMap>(eventName:K, callback:(data:AppEventsMap[K])=> void): () => void {
        if (!this.handlers.has(eventName)) this.handlers.set(eventName, new Set<Function>());

        this.handlers.get(eventName)?.add(callback);

        return () => {
            this.handlers.get(eventName)?.delete(callback as Function);
        }
    }

    emit<K extends keyof AppEventsMap>(eventName:K, data:AppEventsMap[K]): void {
        if (!this.handlers.has(eventName)) return;

        this.handlers.get(eventName)?.forEach( (handler:Function) => {
            handler(data);
        })
    }
}

export const eventBus = new EventBus(); 