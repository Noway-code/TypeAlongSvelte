import { get, writable } from 'svelte/store';
import pkg, { type Book, type Rendition } from 'epubjs';
import { type Page } from '$lib/types';
import { typingPages, rendition, currentLocationCFI } from '../stores/typingStore';
import { createRangeCfi, getSavedCfi, loadSavedPage, saveCfi, updateCurrentLocation } from './cfi';
import { updateBookDetails } from '$lib/storage';

export const book = writable<Book | null>(null);

export async function storeCurrentLocation() {
	const r = get(rendition);
	if (!r) return;
	const rangeCfi = updateCurrentLocation(r);
	if (rangeCfi) {
		currentLocationCFI.set(rangeCfi);
		console.log('Stored current location:', rangeCfi);

		persistCurrentLocation(rangeCfi)
	}
}

export function savePage(): void {
	const r = get(rendition);
	if (r) {
		const location = r.currentLocation();
		const cfi = location?.start?.cfi;
		if (cfi) {
			saveCfi('currentLocationCFI', cfi);
			persistCurrentLocation(cfi);
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

export function persistCurrentLocation(cfi: string): void {
	localStorage.setItem('currentLocationCFI', cfi);
	const identifier = localStorage.getItem('openedBook');
	if (identifier) {
		updateBookDetails(identifier, { location_cfi: cfi });
	}
}

export async function loadPage() {
	const r = get(rendition);
	if (r) {
		await loadSavedPage(r, 'currentLocationCFI');
		console.log('Loaded page at CFI:', getSavedCfi('currentLocationCFI'));
	} else {
		console.log('No saved page found or no rendition available.');
	}
}
