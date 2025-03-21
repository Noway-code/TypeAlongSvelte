export type Page = {
	page: number;
	section: number;
	words: Word[];
	cfi: string;
};

export type Game = 'waiting for input' | 'in progress' | 'game over';
export type Word = string;
export type Pitch = 'low' | 'high';
