<script lang="ts">
	import { getStoredBooks, type BookDetails, addCoverToBook, removeBook } from '$lib/storage';
	import { fade, fly } from 'svelte/transition';
	import { Button, Textarea } from 'flowbite-svelte';

	let bookDetails: BookDetails[] = getStoredBooks();
	let selectedBook: BookDetails | null = null;
	let coverUrls: Record<string, string> = {};

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

		addCoverToBook(book.identifier, url);
		bookDetails = getStoredBooks();

	}

	function removeBookHandler(identifier: string) {
		removeBook(identifier);
		bookDetails = getStoredBooks();
		closeModal();
	}
</script>

<div class="container">
	<h1 class="title">Book Selection</h1>
	<p class="subtitle">Click a book to see more details</p>

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
	<div class="modal-overlay" on:click={closeModal} transition:fade>
		<div
			class="modal-content"
			on:click|stopPropagation
			transition:fly={{ y: 20, duration: 300 }}
		>
			<button class="close-button" on:click={closeModal}>×</button>
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

				<Button on:click={() => { if (selectedBook) removeBookHandler(selectedBook.identifier) }}>Delete Book?</Button>
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
  @import '../../styles/variables.scss';

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

  /* Use flex layout so that the cards stay fixed-size and centered */
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

  /* Modal Styles */
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

  .modal-header {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--bg-300);
    padding-bottom: 1rem;
    margin-bottom: 1rem;

    @media (max-width: 500px) {
      flex-direction: column;
      text-align: center;
    }
  }

  .modal-cover {
    width: 150px;
    height: auto;
    object-fit: cover;
    border-radius: 4px;
    margin-right: 1rem;

    @media (max-width: 500px) {
      margin-right: 0;
      margin-bottom: 1rem;
      width: 100%;
    }
  }

  .modal-title {
    flex: 1;

    h2 {
      margin: 0;
      font-size: 1.75rem;
    }

    .author {
      font-style: italic;
      color: var(--fg-200);
      margin-top: 0.5rem;
    }
  }

  .modal-body {
    text-align: left;

    .description {
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    h3 {
      margin-top: 1rem;
      font-size: 1.5rem;
      color: var(--primary);
    }
  }

  .toc-list {
    list-style-type: disc;
    padding-left: 1.5rem;

    li {
      margin-bottom: 0.5rem;
    }
  }
</style>
