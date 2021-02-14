
type IObservable<T> = {
  preference: string,
  onChange: (changedValue: T) => void,
}

export class UserPreference {
  private observables: IObservable<any>[] = [];

  constructor() {
    this.init();
  }

  private init() {
    chrome.storage.onChanged.addListener(this.onStorageChange);
  }

  private onStorageChange = (changes: { [key: string]: chrome.storage.StorageChange; }) => {
    for (let key in changes) {
      const storageChange = changes[key];

      this.observables.forEach(({ preference, onChange }) => {
        if (preference === key) {
          onChange(storageChange.newValue);
        }
      })
    }
  }

  subscribe<P>(preference: string, onChange: (changedValue: P) => void) {
    this.observables.push({ preference, onChange });
  }

  async get<P>(preference: string, defaultValue: P) {
    return new Promise((resolve: (value: P) => void, reject) => {
      chrome.storage.sync.get([preference], (result) => {
        if (chrome.runtime.lastError) {
          reject(Error(chrome.runtime.lastError.message));
        }

        const value = result[preference];
        if (typeof (value) === "undefined") {
          this.set<P>(preference, defaultValue);
          resolve(defaultValue);
        }
        else {
          resolve(value);
        }
      });
    });
  }

  async set<P>(preference: string, value: P) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({ [preference]: value }, () => {
        chrome.runtime.lastError
          ? reject(Error(chrome.runtime.lastError.message))
          : resolve();
      });
    });
  }
}
