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
}

export function getStoredBooks(): BookDetails[] {
	const booksStr = localStorage.getItem('books');
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
	if (books.some(book => book.identifier === newBook.identifier)) return;
	books.push(newBook);
	localStorage.setItem('books', JSON.stringify(books));
}

export function addCoverToBook(identifier: string, cover: string): void {
	const books = getStoredBooks();
	const updatedBooks = books.map(book =>
		book.identifier === identifier ? { ...book, cover } : book
	);
	localStorage.setItem('books', JSON.stringify(updatedBooks));
}

export function removeBook(identifier: string): void {
	const books = getStoredBooks();
	const updatedBooks = books.filter(book => book.identifier !== identifier);
	localStorage.setItem('books', JSON.stringify(updatedBooks));
}

export function clearStoredBooks(): void {
	localStorage.removeItem('books');
}
