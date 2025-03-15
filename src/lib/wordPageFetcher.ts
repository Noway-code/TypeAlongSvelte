import { derived, get } from 'svelte/store';
import { typingPages } from '../stores/typingStore';
import type { Word } from '$lib/types';
import { persistCurrentLocation } from '$lib/epubtools';

export const wordsData = derived(typingPages, ($typingPages) => ({
	words: $typingPages.flatMap((page) => page.words),
	pageWordCount: $typingPages.map((page) => page.words.length)
}));

export function updatePage({
	pageWordIndex,
	pageNumber,
	pageWordCount
}: {
	pageWordIndex: number;
	pageNumber: number;
	pageWordCount: number[];
}): { pageWordIndex: number; pageNumber: number; chapterComplete: boolean } {
	const pages = get(typingPages);
	let chapterComplete = false;
	if (pageWordIndex === pageWordCount[pageNumber]) {
		if (pageNumber === pages.length - 1) {
			chapterComplete = true;
		} else {
			pageNumber += 1;
			pageWordIndex = 0;
			if (pages[pageNumber] && pages[pageNumber].cfi) {
				persistCurrentLocation(pages[pageNumber].cfi);
			}
		}
	}
	return { pageWordIndex, pageNumber, chapterComplete };
}
