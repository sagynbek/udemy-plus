import { DomObserver } from "./dom-observer";
import { UserPreference } from "./user-preference";


export abstract class BaseModel<T extends Node>{
  private userPreference: UserPreference;
  private domObserver: DomObserver;

  constructor() {
    this.userPreference = new UserPreference();
    this.domObserver = DomObserver.getInstance();
  }

  protected async getPreference<P>(preference: string, defaultValue: P) {
    return await this.userPreference.get<P>(preference, defaultValue);
  }
  /** 
   * Subscribes and calls onChange on subscription
  */
  protected async subscribeToPreference<P>(preference: string, defaultValue: P, onChange: (changedValue: P) => void) {
    this.userPreference.subscribe(preference, onChange);
    onChange(await this.getPreference(preference, defaultValue));
  }

  protected onDomAttributeChange(validate: (node: T) => boolean, callback: (node: T) => void) {
    this.domObserver.subscribe(validate, callback, "attributes");
  }
  protected onDomAdd(validate: (node: T) => boolean, callback: (node: T) => void) {
    this.domObserver.subscribe(validate, callback, "add");
  }
  protected onDomRemove(validate: (node: T) => boolean, callback: (node: T) => void) {
    this.domObserver.subscribe(validate, callback, "remove");
  }
}
