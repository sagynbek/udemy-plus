export function isChromiumBased() {
    return navigator.userAgent.toLowerCase().includes('chrome') || navigator.userAgent.toLowerCase().includes('chromium');
}

export function isFirefox() {
    return navigator.userAgent.includes('Firefox');
}

export function isVivaldi() {
    return navigator.userAgent.toLowerCase().includes('vivaldi');
}

export function isYaBrowser() {
    return navigator.userAgent.toLowerCase().includes('yabrowser');
}

export function isOpera() {
    const agent = navigator.userAgent.toLowerCase();
    return agent.includes('opr') || agent.includes('opera');
}

export function isEdge() {
    return navigator.userAgent.includes('Edg');
}

export function isWindows() {
    if (typeof navigator === 'undefined') {
        return null;
    }
    return navigator.platform.toLowerCase().startsWith('win');
}

export function isMacOS() {
    if (typeof navigator === 'undefined') {
        return null;
    }
    return navigator.platform.toLowerCase().startsWith('mac');
}

export function isMobile() {
    if (typeof navigator === 'undefined') {
        return null;
    }
    return navigator.userAgent.toLowerCase().includes('mobile');
}

export function getChromeVersion() {
    const agent = navigator.userAgent.toLowerCase();
    const m = agent.match(/chrom[e|ium]\/([^ ]+)/);
    if (m && m[1]) {
        return m[1];
    }
    return null;
}

export function compareChromeVersions($a: string, $b: string) {
    const a = $a.split('.').map((x) => parseInt(x));
    const b = $b.split('.').map((x) => parseInt(x));
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return a[i] < b[i] ? -1 : 1;
        }
    }
    return 0;
}

export function isDefinedSelectorSupported() {
    try {
        document.querySelector(':defined');
        return true;
    } catch (err) {
        return false;
    }
}

export const IS_SHADOW_DOM_SUPPORTED = typeof ShadowRoot === 'function';

export function isCSSStyleSheetConstructorSupported() {
    try {
        new CSSStyleSheet();
        return true;
    } catch (err) {
        return false;
    }
}
