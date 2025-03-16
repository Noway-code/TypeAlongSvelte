import {  writable } from 'svelte/store';
import {  type Rendition } from 'epubjs';
import { type Page } from '$lib/types';

export const typingPages = writable<Page[]>([]);
export const rendition = writable<Rendition | null>(null);
