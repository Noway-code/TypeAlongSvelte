import pkg from 'epubjs';

const { CFI } = pkg;

export const CURRENT_LOCATION_KEY = 'currentLocationCFI';

// magic CFI library
/**
 * Creates a range CFI from two CFIs by determining the common path.
 *
 * @param {string} startCfi - The starting CFI.
 * @param {string} endCfi - The ending CFI.
 * @returns {string} The generated range CFI.
 *
 * @example
 * const rangeCfi = createRangeCfi("epubcfi(/6/14!/4/2/14/1:0)", "epubcfi(/6/14!/4/2/14/1:1)");
 */
export function createRangeCfi(startCfi: string, endCfi: string): string {
	const cfiInstance = new CFI();
	const start = cfiInstance.parse(startCfi);
	const end = cfiInstance.parse(endCfi);
	const commonSteps: any[] = [];
	const minSteps = Math.min(start.path.steps.length, end.path.steps.length);
	for (let i = 0; i < minSteps; i++) {
		if (cfiInstance.equalStep(start.path.steps[i], end.path.steps[i])) {
			commonSteps.push(start.path.steps[i]);
		} else {
			break;
		}
	}
	const uniqueStart = { ...start.path, steps: start.path.steps.slice(commonSteps.length) };
	const uniqueEnd = { ...end.path, steps: end.path.steps.slice(commonSteps.length) };
	return `epubcfi(${cfiInstance.segmentString(start.base)}!${cfiInstance.segmentString({
		steps: commonSteps,
		terminal: null
	})},${cfiInstance.segmentString(uniqueStart)},${cfiInstance.segmentString(uniqueEnd)})`;
}

/**
 * Generic store cfi as key method
 * @param {string} storageKey - LocalStorage key name
 * @param {string} cfi - cfi
 * @example
 * const cfi = location?.start?.cfi;
 * saveCfi('currentLocationCFI', cfi);
 */
export function saveCfi(storageKey: string, cfi: string): void {
	localStorage.setItem(storageKey, cfi);
}

/**
 * Generic get cfi from key method
 * @param {string} storageKey - LocalStorage key name
 * @example
 * const cfi = getSavedCfi('currentLocationCFI');
 */
export function getSavedCfi(storageKey: string): string | null {
	return localStorage.getItem(storageKey);
}

//TODO: Update to rendition type
/**
 * Get the saved CFI from localStorage by name, **update** rendition to that cfi
 * @param {any} rendition - Display of book in set view type
 * @param {string} storageKey - LocalStorage key name
 * @example
 * const r = get(rendition);
 * const identifier = localStorage.getItem('openedBook');
 * const key = getLocationKey(identifier);
 * await loadSavedPage(r, key);
 */
export async function loadSavedPage(rendition: any, storageKey: string): Promise<void> {
	const cfi = getSavedCfi(storageKey);
	if (rendition && cfi) {
		await rendition.display(cfi);
	}
}

/**
 * Make range CFI from rendition current location, set it as currentLocationCFI LocalStorage, and return the CFI.
 * @param {any} rendition - Display of book in set view type
 * @param {string} storageKey - LocalStorage key name (Default:CurrentLocationCFI)
 * @example
 * const rangeCfi = updateCurrentLocation(r);
 * if (rangeCfi) {
 * ...
 * } */
export function updateCurrentLocation(
	rendition: any,
	storageKey: string = CURRENT_LOCATION_KEY
): string | void {
	if (!rendition) return;
	const location = rendition.currentLocation();
	if (!location || !location.start?.cfi || !location.end?.cfi) {
		console.error('Current location or CFIs not available');
		return;
	}
	try {
		const rangeCfi = createRangeCfi(location.start.cfi, location.end.cfi);
		saveCfi(storageKey, rangeCfi);
		return rangeCfi;
	} catch (error) {
		console.error('Failed to update current location:', error);
	}
}
