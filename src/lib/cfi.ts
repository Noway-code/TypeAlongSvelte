import pkg from 'epubjs';

const { CFI } = pkg;

export const CURRENT_LOCATION_KEY = 'currentLocationCFI';

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

export function saveCfi(storageKey: string, cfi: string): void {
	localStorage.setItem(storageKey, cfi);
}

export function getSavedCfi(storageKey: string): string | null {
	return localStorage.getItem(storageKey);
}

export async function loadSavedPage(rendition: any, storageKey: string): Promise<void> {
	const cfi = getSavedCfi(storageKey);
	if (rendition && cfi) {
		await rendition.display(cfi);
	}
}

export function getCurrentCfi(rendition: any): string | null {
	if (rendition) {
		const location = rendition.currentLocation();
		return location?.start?.cfi || null;
	}
	return null;
}

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
