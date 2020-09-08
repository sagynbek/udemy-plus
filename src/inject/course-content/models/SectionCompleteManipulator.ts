import { getLocalMessage } from "utils/locales";


export class SectionCompleteManipulator {
  /** 
   * SectionPanel
   *    SectionHeading: (Section 14: NATS streaming server)
   *    ulElement: (list of course, 261, 267, 268, 269....)
  */
  static analyze(sectionPanel: HTMLElement) {
    const ulElement: HTMLUListElement | null = sectionPanel.querySelector('ul');

    // @ts-ignore
    const lessons: Array<HTMLInputElement> = [...ulElement.querySelectorAll("input[type='checkbox']")];
    const completedCount = lessons.filter((input) => input.checked).length;

    return {
      lessons,
      total: lessons.length,
      allCompleted: completedCount === lessons.length,
    }
  }

  static getActionText(allCompleted: boolean) {
    return getLocalMessage(allCompleted ? 'mark_all_uncompleted' : 'mark_all_completed');
  }

  static addIntoSectionPanel(sectionPanel: HTMLElement) {
    const { allCompleted } = this.analyze(sectionPanel);


    const toggleText = SectionCompleteManipulator.getActionText(allCompleted);
    sectionPanel.children[0].insertAdjacentHTML('afterend', `<div class='up-toggle-section-completed' data-purpose='up-toggle-section-completed'>${toggleText}</div>`)
    // @ts-ignore
    sectionPanel.querySelector(`div[data-purpose='up-toggle-section-completed']`).addEventListener('click', this.onToggleCompleted);
  }

  static onToggleCompleted(e: any) {
    const { lessons, allCompleted } = SectionCompleteManipulator.analyze(e.target.parentNode);

    const newStatus = !allCompleted;
    lessons.forEach(input => {
      if (input.checked !== newStatus) {
        input.click();
      }
    });
    const toggleText = SectionCompleteManipulator.getActionText(newStatus);
    e.target.innerText = toggleText;
  }

  static foundLessonsSectionUl(ul: HTMLUListElement) {
    try {
      const curriculumSectionContainer = ul.parentNode;
      if (!curriculumSectionContainer) { return; }

      const sectionHeading = curriculumSectionContainer.querySelector('div[data-purpose="section-heading"]');
      if (sectionHeading && sectionHeading.parentElement) {
        SectionCompleteManipulator.addIntoSectionPanel(sectionHeading.parentElement);
      }
    } catch (err) {
      console.warn("Error occured while setting up SectionCompleteToggler")
    }
  }
}