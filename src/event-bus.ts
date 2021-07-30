import { EventSource } from "./plugins/plugin";

class EventBus {
  subscribers: { [event: string]: ((source: EventSource) => void)[] } = {};

  emit(event: string, source: EventSource) {
    this.subscribers[event]?.forEach((subscriber) => {
      subscriber(source);
    });
  }

  on(event: string, callback: (source: EventSource) => void) {
    console.log("on", event);
    if (!this.subscribers[event]) this.subscribers[event] = [];
    this.subscribers[event].push(callback);
  }

  clear() {
    for (const key of Object.keys(this.subscribers)) {
      this.subscribers[key] = [];
      delete this.subscribers[key];
    }
  }
}

export { EventBus };
