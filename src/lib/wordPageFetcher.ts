import { derived } from 'svelte/store';
import { typingWords } from '../stores/typingStore';
import type { Word } from '$lib/types';

export const wordsData = derived(typingWords, ($typingWords) => {
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
	}
	return { pageWordIndex, pageNumber };
}
