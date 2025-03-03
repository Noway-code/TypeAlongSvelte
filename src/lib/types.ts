export type Page = {
	page: number;
	section: number;
	words: Word[];
	cfi: string;
};
export type StoredBook = {
	title: string;
	author: string;
	cover: string;
	description: string;
	language: string;
	publicationDate: string;
	identifier: string;
	toc: string[];
}
export type Game = 'waiting for input' | 'in progress' | 'game over';
export type Word = string;
export type Pitch = 'low' | 'high';
