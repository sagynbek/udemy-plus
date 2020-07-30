import { emitAddedNode, emitRemovedNode } from "inject/player/video-player";

export const runMutationObserver = () => {
    // Select the node that will be observed for mutations
    const targetNode = document.documentElement || document.body;

    // Options for the observer (which mutations to observe)
    const config = { attributes: true, childList: true, subtree: true };

    // Callback function to execute when mutations are observed
    const callback: MutationCallback = function (mutationsList: MutationRecord[], observer: MutationObserver) {
        // Use traditional 'for loops' for IE 11
        for (let mutation of mutationsList) {
            const { addedNodes, removedNodes } = mutation;

            if (mutation.type === 'childList') {
                addedNodes.forEach(addedNode => {
                    // @ts-ignore
                    emitAddedNode(addedNode, mutation);
                });

                removedNodes.forEach(removedNode => {
                    // @ts-ignore
                    emitRemovedNode(removedNode, mutation);
                })
            }
            else if (mutation.type === 'attributes') {
                // console.log('The ' + mutation.attributeName + ' attribute was modified.');
            }
        }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);

    // Later, you can stop observing
    // observer.disconnect();

    return observer;
}
