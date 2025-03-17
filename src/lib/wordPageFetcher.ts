import { derived, get } from 'svelte/store';
import { typingPages } from '../stores/typingStore';
import { persistCurrentCfiForBook } from '$lib/epubtools';

/**
 * The `wordsData` store provides a flattened list of all words from `typingPages`
 * and an array of word counts for each page.
 * @property {string[]} words - A flattened list of all words from the `typingPages` store.
 * @property {number[]} pageWordCount - An array containing the word count of each page.
 *
 * @example
 * $: { ({ words, pageWordCount } = $wordsData); }
 */
export const wordsData = derived(typingPages, ($typingPages) => {
	return {
		words: $typingPages.flatMap((page) => page.words),
		pageWordCount: $typingPages.map((page) => page.words.length)
	};
});

/**
 * Updates the current page index, handles navigation between pages,
 * and determines if the chapter is complete.
 *
 * @param {number} pageWordIndex - The current word index in the page.
 * @param {number} pageNumber - The current page number.
 * @param {number[]} pageWordCount - An array containing word counts for each page.
 * @returns {Object} - Updated page information.
 * @returns {number} return.pageWordIndex - Updated word index in the page.
 * @returns {number} return.pageNumber - Updated page number.
 * @returns {boolean} return.chapterComplete - Whether the chapter is complete.
 */
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
				persistCurrentCfiForBook(pages[pageNumber].cfi);
			}
		}
	}
	return { pageWordIndex, pageNumber, chapterComplete };
}
