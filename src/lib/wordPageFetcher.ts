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
}): { pageWordIndex: number; pageNumber: number } {
	if (pageWordIndex === pageWordCount[pageNumber]) {
		pageNumber += 1;
		pageWordIndex = 0;

		const pages = get(typingPages);
		if (pages[pageNumber] && pages[pageNumber].cfi){
			localStorage.setItem('currentLocationCFI', pages[pageNumber].cfi);
		}

	}
	return { pageWordIndex, pageNumber };
}
