const BOOKS_KEY = 'books';

export interface BookDetails {
	title: string;
	author: string;
	cover: string;
	publisher: string;
	language: string;
	description: string;
	subjects: string[];
	publicationDate: string;
	identifier: string;
	source: string;
	toc: Array<{ label: string; href: string }>;
	pageProgression: string;
	location_cfi: string;
	downloadUrl?: string;
}

export function getStoredBooks(): BookDetails[] {
	const booksStr = localStorage.getItem(BOOKS_KEY);
	if (!booksStr) return [];
	try {
		return JSON.parse(booksStr) as BookDetails[];
	} catch (error) {
		console.error('Error parsing stored books:', error);
		return [];
	}
}

export function storeBook(newBook: BookDetails): void {
	const books = getStoredBooks();
	if (books.some((book) => book.identifier === newBook.identifier)) return;
	books.push(newBook);
	localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
}

export function updateBookDetails(identifier: string, updatedFields: Partial<BookDetails>): void {
	const books = getStoredBooks();
	const updatedBooks = books.map((book) =>
		book.identifier === identifier ? { ...book, ...updatedFields } : book
	);
	localStorage.setItem(BOOKS_KEY, JSON.stringify(updatedBooks));
}

export function getBookByIdentifier(identifier: string): BookDetails | null {
	const books = getStoredBooks();
	return books.find((book) => book.identifier === identifier) || null;
}

export function getBookCfi(identifier: string): string | null {
	const book = getBookByIdentifier(identifier);
	return book ? book.location_cfi : null;
}

export function setBookCfi(identifier: string, cfi: string): void {
	updateBookDetails(identifier, { location_cfi: cfi });
}

export function addCoverToBook(identifier: string, cover: string): void {
	const books = getStoredBooks();
	const updatedBooks = books.map((book) =>
		book.identifier === identifier ? { ...book, cover } : book
	);
	localStorage.setItem(BOOKS_KEY, JSON.stringify(updatedBooks));
}

export function removeBook(identifier: string): void {
	const books = getStoredBooks();
	const updatedBooks = books.filter((book) => book.identifier !== identifier);
	localStorage.setItem(BOOKS_KEY, JSON.stringify(updatedBooks));
}

export function clearStoredBooks(): void {
	localStorage.removeItem(BOOKS_KEY);
}
