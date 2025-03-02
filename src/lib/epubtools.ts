// file: src/lib/epubtools.ts
// noinspection TypeScriptUnresolvedReference

import { get, writable } from 'svelte/store';
import pkg, { type Book, type Rendition } from 'epubjs';
import { type Page } from '$lib/types';
import { typingPages, rendition, currentLocationCFI } from '../stores/typingStore';
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

// New store to hold the saved page CFI
export const savedPageCFI = writable<string | null>(null);

/**
 * Saves the current page's starting CFI from the rendition.
 */
export function savePage(): void {
	const r = get(rendition);
	if (r) {
		const location = r.currentLocation();
		const cfi = location?.start?.cfi;
		if (cfi) {
			savedPageCFI.set(location.start.cfi);
			localStorage.setItem('currentLocationCFI', location.start.cfi);
			console.log('Saved page at CFI:', location.start.cfi);
		} else {
			console.log('No valid CFI found in current location.');
		}
	} else {
		console.log('No rendition available to save page.');
	}
}

export function getPageCFI(): string | null {
	const r = get(rendition);
	if (r) {
		const location = r.currentLocation();
		const cfi = location?.start?.cfi;
		if (cfi) {
			console.log('Current page at CFI:', location.start.cfi);
			return cfi;
		}
	}
	return null;
}

/**
 * Loads the saved page by instructing the rendition to display the saved CFI.
 */
export async function loadPage() {
	const r = get(rendition);
	const cfi = localStorage.getItem('currentLocationCFI');
	if (r && cfi) {
		await r.display(cfi);
		console.log('Loaded page at CFI:', cfi);
	} else {
		console.log('No saved page found or no rendition available.');
	}
}
