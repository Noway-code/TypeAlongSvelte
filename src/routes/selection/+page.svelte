<script lang="ts">
	import { getStoredBooks, type BookDetails, addCoverToBook, getBookCfi, updateBookDetails } from '$lib/storage';
	import { fade } from 'svelte/transition';
	import { Button, Textarea } from 'flowbite-svelte';
	import ePub from 'epubjs';
	import { book } from '$lib/epubtools';
	import { goto } from '$app/navigation';
	import { getLocationKey } from '$lib/epubtools';
	import { get, writable } from 'svelte/store';

	// Data source: 'local' uses localStorage; 'public' uses Gutendex.
	let dataSource: 'local' | 'public' = 'local';

	// Reactive books list: updates based on the data source.
	let bookDetails: BookDetails[] = getStoredBooks();

	let uploadedFile = writable<File | null>(null);
	let coverUrls: Record<string, string> = {};
	export let selectedBook: { identifier: string; downloadUrl: string } | null = null;

	async function downloadAndLoadBook(gutenbergUrl: string, filename = "book.epub") {
		try {
			const proxyUrl = `http://localhost:8000/api/download?url=${encodeURIComponent(gutenbergUrl)}`;
			const response = await fetch(proxyUrl);
			if (!response.ok) {
				throw new Error("Failed to download EPUB");
			}
			const blob = await response.blob();
			const file = new File([blob], filename, { type: "application/epub+zip" });
			uploadedFile.set(file);
			await uploadEpub();
		} catch (error) {
			console.error("Error downloading or uploading book:", error);
		}
	}


	// Fetch 5 books from Gutendex and cache them under "publicBooks"
	async function fetchPublicBooks(): Promise<BookDetails[]> {
		const cacheKey = 'publicBooks';
		const cached = localStorage.getItem(cacheKey);

		if (cached) {
			try {
				return JSON.parse(cached) as BookDetails[];
			} catch (error) {
				console.error('Error parsing cached public books:', error);
			}
		}

		try {
			const response = await fetch('https://gutendex.com/books/?page=1');
			const data = await response.json();

			// Limit to 5 books
			const results = data.results.slice(0, 5);
			const books: BookDetails[] = results.map((b: any) => ({
				title: b.title,
				author: (b.authors && b.authors.length > 0) ? b.authors[0].name : "Unknown",
				cover: b.formats['image/jpeg'] || "",
				publisher: "Project Gutenberg",
				language: (b.languages && b.languages[0]) || "en",
				description: b.summaries[0] || "",
				subjects: b.subjects || [],
				publicationDate: "",
				identifier: `gutendex-${b.id}`,
				source: "gutendex",
				toc: [{ label: "Chapter 1", href: "#" }], // Dummy ToC data
				pageProgression: "ltr",
				downloadUrl: b.formats['application/epub+zip'],
			}));

			localStorage.setItem(cacheKey, JSON.stringify(books));
			return books;
		} catch (error) {
			console.error('Error fetching public books:', error);
			return [];
		}
	}

	// Switch data source by setting the source and updating bookDetails.
	async function setDataSource(source: 'local' | 'public') {
		dataSource = source;
		bookDetails = dataSource === 'local'
			? getStoredBooks()
			: await fetchPublicBooks();

		closeModal();
	}

	function openModal(book: BookDetails) {
		selectedBook = book;
	}

	function closeModal() {
		selectedBook = null;
	}

	function handleKeyDown(event: KeyboardEvent, book: BookDetails) {
		if (event.key === 'Enter' || event.key === ' ') {
			openModal(book);
			event.preventDefault();
		}
	}

	function addCoverToBookHandler(book: BookDetails, url: string) {
		coverUrls[book.identifier] = '';
		book.cover = url;

		if (dataSource === 'local') {
			updateBookDetails(book.identifier, {cover: url});
			bookDetails = getStoredBooks();
		} else {
			bookDetails = bookDetails.map(b =>
				b.identifier === book.identifier ? { ...b, cover: url } : b
			);
		}
	}

	function handleChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			uploadedFile.set(target.files[0]);
		}
	}
	async function uploadEpub() {
		const file = get(uploadedFile);
		if (!file) return;
		const newBook = ePub(file);
		book.set(newBook);

		const openedBookId = selectedBook?.identifier;
		if (openedBookId) {
			localStorage.setItem('openedBook', openedBookId);
			const book_cfi = getBookCfi(openedBookId);
			const locationKey = getLocationKey(openedBookId);
			localStorage.removeItem(locationKey);
			if (book_cfi) {
				localStorage.setItem(locationKey, book_cfi);
			}
		} else {
			console.error('No book selected for upload');
		}

		await goto('/view-book');
	}


</script>

<div class="container">
	<h1 class="title">Book Selection</h1>
	<p class="subtitle">Click a book to see more details</p>
	<!-- Flipflop toggle between Local and Public data sources -->
	<div class="flipflop">
		<button class:active={dataSource === 'local'} on:click={() => setDataSource('local')}>
			Local
		</button>
		<button class:active={dataSource === 'public'} on:click={() => setDataSource('public')}>
			Public
		</button>
	</div>
	<div class="books-grid">
		{#each bookDetails as book (book.identifier)}
			<div
				class="book-card"
				role="button"
				tabindex="0"
				on:click={() => openModal(book)}
				on:keydown={(event) => handleKeyDown(event, book)}
			>
				{#if book.cover}
					<img src={book.cover} alt={book.title} class="cover-image" />
				{:else}
					<div class="no-cover">No Cover Art</div>
				{/if}
				<div class="card-overlay">
					<h2 class="card-title">{book.title}</h2>
				</div>
			</div>
		{/each}
	</div>
</div>

{#if selectedBook}
	<div
		class="modal-overlay"
		role="button"
		tabindex="0"
		on:click|self={closeModal}
		on:keydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') closeModal();
		}}
		transition:fade
	>
		<div class="modal-content" role="dialog" aria-modal="true">
			<button class="close-button" type="button" on:click={closeModal}>×</button>
			<div class="modal-body">
				<h2>{selectedBook.title}</h2>
				<p class="author">By: {selectedBook.author}</p>
				<p class="description">{selectedBook.description}</p>
				<h3>Table of Contents</h3>
				<ul class="toc-list">
					{#each selectedBook.toc as item}
						<li>{item.label}</li>
					{/each}
				</ul>
				<br>
				{#if dataSource==='local'}
				<section class="upload-section">
					<input
						type="file"
						id="uploadedFile"
						accept=".epub"
						on:change={handleChange}
					/>
					<button class="upload-button" on:click={uploadEpub}>Upload EPUB</button>
				</section>
					{:else if selectedBook.downloadUrl}
					<p>{selectedBook.downloadUrl}</p>
					<button on:click={() => downloadAndLoadBook(selectedBook.downloadUrl)}>
						Download &amp; Open EPUB
					</button>
				{/if}

				<br/>
				{#if !selectedBook.cover}
					<h3>Want to add a cover?</h3>
					<Textarea
						placeholder="Enter URL of the cover image"
						bind:value={coverUrls[selectedBook.identifier]}
						rows={1}
					/>
					<Button
						color="primary"
						on:click={() => {
							const url = coverUrls[selectedBook.identifier];
							if (url) {
								addCoverToBookHandler(selectedBook, url);
								selectedBook.cover = url;
							}
						}}
					>
						Add Cover
					</Button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
  @import '../../styles/variables.scss';

  .upload-section {
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1rem;

    input[type="file"] {
      padding: 0.5rem;
      border: 1px solid var(--fg-200);
      border-radius: 4px;
      background-color: var(--bg-200);
      color: var(--fg-200);
      transition: border-color 0.3s ease;
      max-width: 300px;

      &:focus {
        outline: none;
        border-color: var(--primary);
      }
    }

    .upload-button {
      padding: 0.75rem 1.5rem;
      font-size: 1.15rem;
      color: var(--bg-200);
      background-color: var(--accent);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.3s ease, transform 0.2s ease;
      max-width: 200px;
      width: 100%;

      &:hover {
        background-color: var(--accent-hover);
        transform: translateY(-2px);
      }

      &:active {
        transform: translateY(0);
        background-color: var(--primary);
      }
    }
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }

  .title {
    font-size: 2.5rem;
    font-weight: bold;
    color: var(--primary);
    margin-bottom: 1rem;
  }

  .subtitle {
    font-size: 1.25rem;
    color: var(--info);
    margin-bottom: 2rem;
  }

  /* Flipflop Toggle Styles */
  .flipflop {
    display: inline-flex;
    border: 1px solid var(--primary);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 2rem;

    button {
      padding: 0.5rem 1rem;
      border: none;
      background-color: var(--bg-200);
      color: var(--fg-200);
      cursor: pointer;
      transition: background-color 0.3s ease;
      flex: 1;
    }

    button.active {
      background-color: var(--primary);
      color: var(--bg-100);
    }

    button:not(:last-child) {
      border-right: 1px solid var(--primary);
    }
  }

  .books-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1.5rem;
  }

  .book-card {
    position: relative;
    cursor: pointer;
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--bg-100);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    width: 280px;
    height: 420px;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
    }
  }

  .cover-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .no-cover {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-300);
    color: var(--fg-200);
    font-size: 1.2rem;
  }

  .card-overlay {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 1rem;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  }

  .card-title {
    margin: 0;
    font-size: 1.5rem;
    color: var(--fg-100);
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 1rem;
  }

  .modal-content {
    background-color: var(--bg-200);
    color: var(--fg-100);
    border-radius: 8px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    padding: 2rem;
    position: relative;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: transparent;
    border: none;
    font-size: 2rem;
    color: var(--fg-100);
    cursor: pointer;
  }

  .modal-body {
    text-align: left;
  }

  .toc-list {
    list-style-type: disc;
    padding-left: 1.5rem;

    li {
      margin-bottom: 0.5rem;
    }
  }
</style>
