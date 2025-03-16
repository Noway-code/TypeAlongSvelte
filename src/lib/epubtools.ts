import { get, writable } from 'svelte/store';
import { type Book } from 'epubjs';
import { rendition } from '../stores/typingStore';
import { loadSavedPage, updateCurrentLocation } from './cfi';
import { updateBookDetails } from '$lib/storage';

export const book = writable<Book | null>(null);

/*
 * Get opened book identifier
 */
function getOpenedBookIdentifier(): string | null {
	return localStorage.getItem('openedBook');
}

/*
 * Append identifier to get composite key for localStorage
 * @param {string} identifier - stored EPUB identifier
 */
export function getLocationKey(identifier: string): string {
	return `currentLocationCFI_${identifier}`;
}

/*
 * Set composite key and cfi to localStorage and update the associated book in Books
 * @param {String} cfi - cfi
 */
export function persistCurrentCfiForBook(cfi: string): void {
	const identifier = getOpenedBookIdentifier();
	if (identifier) {
		const key = getLocationKey(identifier);
		localStorage.setItem(key, cfi);
		updateBookDetails(identifier, { location_cfi: cfi });
	}
}

/*
 * Update currentLocationCFI to current rendition CFI, the associate composite key localstorage, and the book localStorage
 * @example
 * // Going to next chapter
 * await storeCurrentLocation();
 */
export async function storeCurrentLocation(): Promise<void> {
	const r = get(rendition);
	if (!r) return;
	const rangeCfi = updateCurrentLocation(r);
	if (rangeCfi) {
		console.log('Stored current location:', rangeCfi);
		const identifier = localStorage.getItem('openedBook');
		if (identifier) {
			const key = getLocationKey(identifier);
			localStorage.setItem(key, rangeCfi);
			updateBookDetails(identifier, { location_cfi: rangeCfi });
		}
	}
}

/*
 * Set currentLocationCFI to current CFI, composite key, and books
 */
// export function savePage(): void {
// 	const r = get(rendition);
// 	if (r) {
// 		const location = r.currentLocation();
// 		const cfi = location?.start?.cfi;
// 		if (cfi) {
// 			saveCfi('currentLocationCFI', cfi);
// 			const identifier = localStorage.getItem('openedBook');
// 			if (identifier) {
// 				const key = getLocationKey(identifier);
// 				localStorage.setItem(key, cfi);
// 				updateBookDetails(identifier, { location_cfi: cfi });
// 			}
// 			console.log('Saved page at CFI:', cfi);
// 		} else {
// 			console.log('No valid CFI found in current location.');
// 		}
// 	} else {
// 		console.log('No rendition available to save page.');
// 	}
// }

/*
 * Grab the current page cfi extracted from range CFI of Rendition.
 * @example
 * const cfi = getPageCFI();
const page = {
	page: currentIndex,
	section: currentIndex,
	words: newWords,
	cfi: cfi
};
 */
export function getPageCFI(): string | null {
	const r = get(rendition);
	if (r) {
		const location = r.currentLocation();
		const cfi = location?.start?.cfi;
		if (cfi) {
			console.log('Current page at CFI:', cfi);
			return cfi;
		}
	}
	return null;
}

/*
 * Load CFI from composite key and update the rendition to the stored cfi, else empty display.
 */
export async function loadPage(): Promise<void> {
	const r = get(rendition);
	const identifier = localStorage.getItem('openedBook');
	if (r && identifier) {
		const key = getLocationKey(identifier);
		const savedLocation = localStorage.getItem(key);
		if (savedLocation) {
			await loadSavedPage(r, key);
			console.log('Loaded page at CFI:', savedLocation);
		} else {
			console.log('No saved location for this book, displaying default start.');
			await r.display();
		}
	} else {
		console.log('No saved page found or no rendition available.');
	}
}
