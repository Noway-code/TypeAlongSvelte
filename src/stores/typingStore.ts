// src/stores/typingStore.ts
import { writable } from 'svelte/store';
import type { Rendition } from 'epubjs';
import pkg from 'epubjs';

const { CFI } = pkg;

export const typingWords = writable<string[]>([]);

export const rendition = writable<Rendition | null>(null);

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
				// Last step is equal, check terminals
				if (cfi.start.terminal === cfi.end.terminal) {
					// CFIs are equal
					cfi.path.steps.push(cfi.start.steps[i]);
					// Not a range
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
