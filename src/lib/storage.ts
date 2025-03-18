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

/**
 * Retrieves the list of stored books from localStorage.
 *
 * @returns {BookDetails[]} - An array of stored book details.
 * @throws {SyntaxError} Throws an error if the stored data is not valid JSON.
 *
 * @example
 * const books = getStoredBooks();
 */
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

/**
 * Fetch books, if it isn't already in the list then push it on to the end and re-store it
 * @param {BookDetails} newBook - book to be added to list
 */
export function storeBook(newBook: BookDetails): void {
	const books = getStoredBooks();
	if (books.some((book) => book.identifier === newBook.identifier)) return;
	books.push(newBook);
	localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
}

/**
 * Find book from books by identifier, update fields with new object if identifier matches otherwise return same array.
 * @param {string} identifier - book identifier
 * @param {Partial<BookDetails>} updatedFields - fields with values to change
 * @example
 * updateBookDetails(identifier, { location_cfi: cfi });
 */
export function updateBookDetails(identifier: string, updatedFields: Partial<BookDetails>): void {
	const books = getStoredBooks();
	/*
	 * Iterate over books til we find the matching identifier
	 * If it matches, it creates a new book object by merging the existing book object with the updatedFields object using the spread operator (...).
	 * If it doesn't match, it returns the original book object.
	 */
	const updatedBooks = books.map((book) =>
		book.identifier === identifier ? { ...book, ...updatedFields } : book
	);
	localStorage.setItem(BOOKS_KEY, JSON.stringify(updatedBooks));
}

/**
 * Return book that matches the passed identifier
 * @param {string} identifier - identifier
 */
export function getBookByIdentifier(identifier: string): BookDetails | null {
	const books = getStoredBooks();
	return books.find((book) => book.identifier === identifier) || null;
}

/**
 * Return book that matches the passed identifier
 * @param {string} identifier - identifier
 */
export function getBookCfi(identifier: string): string | null {
	const book = getBookByIdentifier(identifier);
	return book ? book.location_cfi : null;
}