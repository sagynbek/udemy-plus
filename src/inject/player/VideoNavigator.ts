import { BaseModel } from "inject/models/base-model";


export class VideoNavigator<T extends HTMLDivElement> extends BaseModel<T> {
  permitted = true;

  constructor() {
    super();

    this.init();
  }

  private async init() {
    if (this.permitted) {
      document.addEventListener('keydown', this.checkOnKeyDown);
    }
  }

  private checkOnKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey) {
      if (e.key === "ArrowLeft") {
        this.handleNavigateToPrevious();
      }
      if (e.key === "ArrowRight") {
        this.handleNavigateToNext();
      }
    }
  }

  private handleNavigateToPrevious = () => {
    const item = document.querySelector("#go-to-previous-item") as HTMLDivElement;
    item && item.click();
  }

  private handleNavigateToNext = () => {
    const item = document.querySelector("#go-to-next-item") as HTMLDivElement;
    item && item.click();
  }
}
