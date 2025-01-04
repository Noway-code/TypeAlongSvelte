// src/stores/typingStore.ts
import { writable } from 'svelte/store';
import type { Rendition } from 'epubjs';

export const typingWords = writable<string[]>([]);

export const rendition = writable<Rendition | null>(null);
