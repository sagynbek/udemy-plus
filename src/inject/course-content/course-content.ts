import { SectionCompleteManipulator } from "./models/SectionCompleteManipulator";

const addedNodeListeners = [addedContentSectionListener];
const removedNodeListeners = [removedContentSectionListener];

function emitAddedNode(addedNode: HTMLElement, mutation: MutationRecord) {
  addedNodeListeners.forEach(listener => listener(addedNode, mutation));
}
function emitRemovedNode(removedNode: HTMLElement, mutation: MutationRecord) {
  removedNodeListeners.forEach(listener => listener(removedNode, mutation));
}



// #region Toggle section completed
function addedContentSectionListener(addedNode: HTMLElement, mutation: MutationRecord) {
  // section list is opened
  if (
    addedNode.localName === "ul"
    && addedNode.parentNode
    && addedNode.parentNode.querySelector('div[data-purpose="section-heading"]')
  ) {
    SectionCompleteManipulator.foundLessonsSectionUl(addedNode as HTMLUListElement);
  }

  if (
    addedNode.localName === "div" // section panel, containing list of sections
    && addedNode.querySelector('div[data-purpose="curriculum-section-container"] div[data-purpose*="section-panel"]>ul')
  ) {
    const allOpenSectionUls = addedNode.querySelectorAll('div[data-purpose="curriculum-section-container"] div[data-purpose*="section-panel"]>ul');
    allOpenSectionUls.forEach(ul => {
      SectionCompleteManipulator.foundLessonsSectionUl(ul as HTMLUListElement);
    });
  }
}

/**
 * Removes toggle if section closes
*/
function removedContentSectionListener(removedNode: HTMLElement, mutation: MutationRecord) {
  // section list is opened
  if (removedNode.localName === "ul"
    && mutation.target
    && (mutation.target as HTMLElement).querySelector('div[data-purpose="up-toggle-section-completed"]')
  ) {
    const curriculumSectionContainer = mutation.target as HTMLElement;
    const sectionHeading = curriculumSectionContainer.querySelector('div[data-purpose="up-toggle-section-completed"]');
    sectionHeading && sectionHeading.remove();
  }
}
// #endregion



export {
  emitAddedNode as emitAddedCourseContent,
  emitRemovedNode as emitRemovedCourseContent
};
