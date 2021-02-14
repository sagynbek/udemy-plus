import { ObserverWrapper } from "inject/utils/observer";
import { logWarn } from '../utils/log';


type ISubsribableActions = | "add" | "remove" | "attributes";

type IObservable<T> = {
  validate: (node: T) => boolean;
  callback: (node: T) => void;
}

type IObservablesObject<T> = {
  [key in ISubsribableActions]: IObservable<T>[];
};


export class DomObserver {
  private static instance: DomObserver;
  private observerWrapper: ObserverWrapper;
  private observables: IObservablesObject<Node>;

  static getInstance() {
    if (!this.instance) {
      this.instance = new DomObserver;
    }
    return this.instance;
  }

  private constructor() {
    this.observables = {
      add: [],
      remove: [],
      attributes: []
    }

    this.observerWrapper = new ObserverWrapper
      (
        document.documentElement || document.body,
        this.onObserverCallback,
        {
          attributes: true,
          childList: true,
          subtree: true,
        }
      );
  }

  subscribe<P extends Node>(validate: (node: P) => boolean, callback: (node: P) => void, action: ISubsribableActions) {
    this.observables[action].push({ validate, callback });
  }

  private onObserverCallback = (mutationsList: MutationRecord[]) => {
    for (let it = 0; it < mutationsList.length; it++) {
      const { type, addedNodes, removedNodes, target } = mutationsList[it];

      if (type === "attributes") {
        this.checkAndCallCallback("attributes", target);
      }
      else if (type === "childList") {
        addedNodes.forEach(added => { this.checkAndCallCallback("add", added); });
        removedNodes.forEach(removed => { this.checkAndCallCallback("remove", removed); });
      }
    }
  }

  private checkAndCallCallback(action: ISubsribableActions, target: Node) {
    this.observables[action].forEach(({ validate, callback }) => {
      try {
        validate(target) && callback(target);
      } catch (err) {
        logWarn(err)
      }
    });
  }
}
