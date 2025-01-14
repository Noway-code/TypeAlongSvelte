import { get, writable } from 'svelte/store';
import pkg, { type Book, type Rendition } from 'epubjs';
import { type Page } from '$lib/types';
import { typingWords, rendition, currentLocationCFI } from '../stores/typingStore';
// @ts-ignore
const { CFI } = pkg;
/**
 * This store will hold the Book instance.
 */
export const book = writable<Book | null>(null);

/**
 * Generates a CFI range string from two CFI locations.
 * @param a - Starting CFI string.
 * @param b - Ending CFI string.
 * @returns A range CFI string.
 */
export const makeRangeCfi = (a: string, b: string): string => {
	const CFIInstance = new CFI();
	const start = CFIInstance.parse(a);
	const end = CFIInstance.parse(b);

	const cfi = {
		range: true,
		base: start.base,
		path: {
			steps: [],
			terminal: null
		},
		start: start.path,
		end: end.path
	};

	const len = cfi.start.steps.length;
	for (let i = 0; i < len; i++) {
		if (CFIInstance.equalStep(cfi.start.steps[i], cfi.end.steps[i])) {
			if (i === len - 1) {
				if (cfi.start.terminal === cfi.end.terminal) {
					cfi.path.steps.push(cfi.start.steps[i]);
					cfi.range = false;
				}
			} else {
				cfi.path.steps.push(cfi.start.steps[i]);
			}
		} else {
			break;
		}
	}
	cfi.start.steps = cfi.start.steps.slice(cfi.path.steps.length);
	cfi.end.steps = cfi.end.steps.slice(cfi.path.steps.length);

	return `epubcfi(${CFIInstance.segmentString(cfi.base)}!${CFIInstance.segmentString(cfi.path)},${CFIInstance.segmentString(cfi.start)},${CFIInstance.segmentString(cfi.end)})`;
};

/**
 * Fetches words from the current page using CFI-based range extraction.
 * This function now reads both `rendition` and `book` directly from the stores.
 */
// export async function fetchPageWords() {
// 	const r = get(rendition);
// 	const b = get(book);
// 	if (!r || !b) return [];
//
// 	const currentLocation = r.currentLocation();
// 	if (
// 		!currentLocation ||
// 		!currentLocation.start ||
// 		!currentLocation.end ||
// 		!currentLocation.start.cfi ||
// 		!currentLocation.end.cfi
// 	) {
// 		console.error('Failed to get current location:', currentLocation);
// 		return [];
// 	}
//
// 	try {
// 		// @ts-ignore
// 		const rangeCfi = makeRangeCfi(currentLocation.start.cfi, currentLocation.end.cfi);
// 		const range = await b.getRange(rangeCfi);
// 		const extractedText = range.toString();
// 		return extractedText.split(/\s+/).filter((word) => word.length > 0);
// 	} catch (error) {
// 		console.error('Failed to extract words using CFI range:', error);
// 		return [];
// 	}
// }

export async function storeCurrentLocation() {
	const r = get(rendition);
	const b = get(book);
	if (!r || !b) return;
	const currentLocation = r.currentLocation();
	if (!currentLocation) return [];

	try {
		// @ts-ignore
		const rangeCfi = makeRangeCfi(currentLocation.start.cfi, currentLocation.end.cfi);
		currentLocationCFI.set(rangeCfi);
		console.log('Stored current location:', rangeCfi);
	} catch (error) {
		console.error('Failed to store current location:', error);
	}
}

export function fetchVisibleWords() {
	const r = get(rendition);
	if (!r) return [];
	const contents = r.getContents();
	let text = '';
	contents.forEach((content) => {
		text += content.document.body.innerText + ' ';
	});
	return text.trim().split(/\s+/).filter((word) => word.length > 0);
}
