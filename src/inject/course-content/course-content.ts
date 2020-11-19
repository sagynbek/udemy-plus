import { SectionCompleteManipulator } from "./models/SectionCompleteManipulator";

const addedNodeListeners = [addedContentSectionListener];
const removedNodeListeners = [removedContentSectionListener];

function emitAddedNode(addedNode: Node, mutation: MutationRecord) {
  addedNodeListeners.forEach(listener => listener(addedNode, mutation));
}
function emitRemovedNode(removedNode: Node, mutation: MutationRecord) {
  removedNodeListeners.forEach(listener => listener(removedNode, mutation));
}



// #region Toggle section completed
function addedContentSectionListener(addedNode: Node, mutation: MutationRecord) {
  // section list is opened
  if (
    addedNode.nodeName === "UL"
    && addedNode.parentNode
    && addedNode.parentNode.querySelector('div[data-purpose="section-heading"]')
  ) {
    SectionCompleteManipulator.foundLessonsSectionUl(addedNode as HTMLUListElement);
  }

  if (
    addedNode.nodeName === "DIV" // section panel, containing list of sections
    && (addedNode as HTMLDivElement).querySelector('div[data-purpose="curriculum-section-container"] div[data-purpose*="section-panel"]>ul')
  ) {
    const allOpenSectionUls = (addedNode as HTMLDivElement).querySelectorAll('div[data-purpose="curriculum-section-container"] div[data-purpose*="section-panel"]>ul');
    allOpenSectionUls.forEach(ul => {
      SectionCompleteManipulator.foundLessonsSectionUl(ul as HTMLUListElement);
    });
  }
}

/**
 * Removes toggle if section closes
*/
function removedContentSectionListener(removedNode: Node, mutation: MutationRecord) {
  // section list is opened
  if (removedNode.nodeName === "UL"
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
