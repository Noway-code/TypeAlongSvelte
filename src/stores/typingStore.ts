import { writable } from 'svelte/store';

export const typingWords = writable<string[]>([]);
