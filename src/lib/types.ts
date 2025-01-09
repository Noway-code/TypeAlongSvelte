export type Page = {
	page: number;
	section: number;
	words: Word[];
};
export type Game = 'waiting for input' | 'in progress' | 'game over';
export type Word = string;
