import {  writable } from 'svelte/store';
import pkg, {  type Rendition } from 'epubjs';
import { type Page } from '$lib/types';
// @ts-ignore
const { CFI } = pkg;

export const typingPages = writable<Page[]>([]);
export const rendition = writable<Rendition | null>(null);
export const currentLocationCFI = writable<string | null>(null);
