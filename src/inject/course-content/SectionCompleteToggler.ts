import { BaseModel } from "inject/models/base-model";
import { SECTION_COMPLETE_TOGGLE_ENABLED } from "inject/constants";
import { getLocalMessage } from "utils/locales";


export class SectionCompleteToggler<T extends HTMLUListElement | HTMLDivElement> extends BaseModel<T> {
  permitted = true;
  constructor() {
    super();

    this.init();
  }

  private async init() {
    await this.subscribeToPreference(SECTION_COMPLETE_TOGGLE_ENABLED.key, SECTION_COMPLETE_TOGGLE_ENABLED.default, this.setPermition);
    this.onDomAdd(this.validateCurriculumContainer, this.actionOnCurriculumContainer);
  }

  private setPermition = (permission) => {
    this.permitted = permission;
  }

  private validateCurriculumContainer = (element: T) => {
    return this.permitted
      && element.querySelector("div[data-purpose='curriculum-section-container']") ? true : false;
  }

  private actionOnCurriculumContainer = (element: T) => {
    const sections = element.querySelectorAll("div[data-purpose^='section-panel-'] div[role='region']");
    sections.forEach(section => {
      this.attemptToAddTogglerToSection(section as HTMLDivElement);
    })
  }

  private attemptToAddTogglerToSection = (section: HTMLDivElement) => {
    // Already added
    if (this.getSectionToggler(section)) { return; }

    section.children[0].insertAdjacentHTML("beforebegin", `<div class='up-toggle-section-completed' data-purpose='up-toggle-section-completed'></div>`);
    section
      .querySelector(`div[data-purpose='up-toggle-section-completed']`)
      .addEventListener("click", this.onToggleCompleted);

    this.updateSectionTogglerContent(section);
  }

  private getSectionToggler = (element: HTMLDivElement) => {
    return element.parentNode.querySelector('div[data-purpose="up-toggle-section-completed"]')
  }
  /**
   * SectionPanel
   *    SectionHeading: (Section 14: NATS streaming server)
   *    ulElement: (list of course, 261, 267, 268, 269....)
  */
  private analyze(section: HTMLDivElement) {
    const allCheckboxes = section.querySelectorAll("input[type='checkbox']");
    const lessons: Array<HTMLInputElement> = [];
    for (let it = 0; it < allCheckboxes.length; it++) {
      lessons.push(allCheckboxes[it] as HTMLInputElement);
    }
    const completedCount = lessons.filter((input) => input.checked).length;

    return {
      lessons,
      total: lessons.length,
      allCompleted: completedCount === lessons.length,
    };
  }

  private onToggleCompleted = (e: any) => {
    const section = e.target.parentNode;
    const { lessons, allCompleted } = this.analyze(section);
    const newStatus = !allCompleted;

    lessons.forEach(input => {
      if (input.checked !== newStatus) {
        input.click();
      }
    });

    this.updateSectionTogglerContent(section);
  }

  private updateSectionTogglerContent = (section: HTMLDivElement) => {
    const { allCompleted } = this.analyze(section);
    const togglerElement = this.getSectionToggler(section) as HTMLDivElement;
    const toggleText = getLocalMessage(allCompleted ? "mark_all_uncompleted" : "mark_all_completed");

    togglerElement.innerText = toggleText;
  }
}
