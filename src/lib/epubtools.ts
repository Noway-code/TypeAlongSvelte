import { get, writable } from 'svelte/store';
import pkg, { type Book, type Rendition } from 'epubjs';
import { type Page } from '$lib/types';
import { typingPages, rendition, currentLocationCFI } from '../stores/typingStore';
import { createRangeCfi, getSavedCfi, loadSavedPage, saveCfi, updateCurrentLocation } from './cfi';
import { updateBookDetails } from '$lib/storage';

export const book = writable<Book | null>(null);

// Composite key generator for a book's CFI
function getLocationKey(identifier: string): string {
	return `currentLocationCFI_${identifier}`;
}

export async function storeCurrentLocation(): Promise<void> {
	const r = get(rendition);
	if (!r) return;
	const rangeCfi = updateCurrentLocation(r);
	if (rangeCfi) {
		currentLocationCFI.set(rangeCfi);
		console.log('Stored current location:', rangeCfi);
		const identifier = localStorage.getItem('openedBook');
		if (identifier) {
			const key = getLocationKey(identifier);
			localStorage.setItem(key, rangeCfi);
			updateBookDetails(identifier, { location_cfi: rangeCfi });
		}
	}
}

export function savePage(): void {
	const r = get(rendition);
	if (r) {
		const location = r.currentLocation();
		const cfi = location?.start?.cfi;
		if (cfi) {
			saveCfi('currentLocationCFI', cfi);
			const identifier = localStorage.getItem('openedBook');
			if (identifier) {
				const key = getLocationKey(identifier);
				localStorage.setItem(key, cfi);
				updateBookDetails(identifier, { location_cfi: cfi });
			}
			console.log('Saved page at CFI:', cfi);
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
			console.log('Current page at CFI:', cfi);
			return cfi;
		}
	}
	return null;
}

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
