import { derived, get } from 'svelte/store';

import { typingPages } from '../stores/typingStore';
import type { Word } from '$lib/types';

export const wordsData = derived(typingPages, ($typingWords) => {
	return {
		words: $typingWords.flatMap((page) => page.words),
		pageWordCount: $typingWords.map((page) => page.words.length)
	};
});

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
				localStorage.setItem('currentLocationCFI', pages[pageNumber].cfi);
			}
		}
	}
	return { pageWordIndex, pageNumber, chapterComplete };
}
