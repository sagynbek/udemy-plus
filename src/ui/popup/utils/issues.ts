import {getChromeVersion, compareChromeVersions, isWindows, isMacOS, isVivaldi, isOpera, isYaBrowser, isEdge} from '../../../utils/platform';

export function popupHasBuiltInBorders() {
    const chromeVersion = getChromeVersion();
    return Boolean(
        chromeVersion &&
        !isVivaldi() &&
        !isYaBrowser() &&
        !isOpera() &&
        isWindows() &&
        compareChromeVersions(chromeVersion, '62.0.3167.0') < 0
    );
}

export function popupHasBuiltInHorizontalBorders() {
    const chromeVersion = getChromeVersion();
    return Boolean(
        chromeVersion &&
        !isVivaldi() &&
        !isYaBrowser() &&
        !isEdge() &&
        !isOpera() && (
            (isWindows() && compareChromeVersions(chromeVersion, '62.0.3167.0') >= 0) && compareChromeVersions(chromeVersion, '74.0.0.0') < 0 ||
            (isMacOS() && compareChromeVersions(chromeVersion, '67.0.3373.0') >= 0 && compareChromeVersions(chromeVersion, '73.0.3661.0') < 0)
        )
    );
}

export function fixNotClosingPopupOnNavigation() {
    document.addEventListener('click', (e) => {
        if (e.defaultPrevented || e.button === 2) {
            return;
        }
        let target = e.target as HTMLElement;
        while (target && !(target instanceof HTMLAnchorElement)) {
            target = target.parentElement;
        }
        if (target && target.hasAttribute('href')) {
            chrome.tabs.create({url: target.getAttribute('href')});
            e.preventDefault();
            window.close();
        }
    });
}
