export class ObserverWrapper {
  observer: MutationObserver;

  constructor(private target: Node, private callback: MutationCallback, private options?: MutationObserverInit) {
    this.observer = new MutationObserver(this.callback);
    this.init();
  }

  private init() {
    this.observer.observe(this.target, this.options);
  }

  disconnect() {
    this.observer.disconnect();
  }
}
