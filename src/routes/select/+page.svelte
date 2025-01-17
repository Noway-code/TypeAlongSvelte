<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { get, writable } from 'svelte/store';
	import { type Page } from '$lib/types';
	import {
		rendition,
		typingWords,
		currentLocationCFI
	} from '../../stores/typingStore';
	import {
		book,
		storeCurrentLocation,
		fetchVisibleWords
	} from '$lib/epubtools';
	import ePub, { type Book, type Rendition } from 'epubjs';

	const uploadedFile = writable<File | null>(null);
	let selectedFile: FileList | null = null;
	let viewer: HTMLDivElement;

	let newRendition: Rendition | null = null;
	let newBook: Book | null = null;
	let showToc = false;
	let tocItems: Array<{ label: string; href: string }> = [];
	let spinnerVisible = false;

	async function weirdLocation() {
		let location = newRendition?.currentLocation();

		let pageText = '';
		try {
			// 1. Get the start and end CFIs of the currently displayed page
			const startCfi = location.start.cfi;
			const endCfi = location.end.cfi;
			if (!startCfi || !endCfi) return;

			// 2. Fetch the DOM Range for start & end
			const startRange = await newBook.getRange(startCfi);
			const endRange = await newBook.getRange(endCfi);

			// 3. Create a new (combined) Range from the two smaller ranges
			const doc = startRange.commonAncestorContainer.ownerDocument;
			const combinedRange = doc.createRange();

			combinedRange.setStart(startRange.startContainer, startRange.startOffset);
			combinedRange.setEnd(endRange.endContainer, endRange.endOffset);

			// 4. Convert that range to text
			pageText = combinedRange.toString();
			console.log('Text on current page:', pageText);
		} catch (error) {
			console.error('Error getting page text:', error);
		}

		let c = pageText.trim().split(/\s+/).filter((word) => word.length > 0);
		console.log('Words on current page:', c);
		return c;
	}

	function handleChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			selectedFile = target.files;
		}
	}

	async function greedyGetWords() {
		let pages: Page[] = [];
		const sectionIndex = newRendition?.currentLocation()?.start?.index;
		if (sectionIndex == null || newBook == null) return;

		const lastSection = newBook.spine.last().index ?? 0;
		let currentIndex = sectionIndex;
		spinnerVisible = true;
		await new Promise(r => setTimeout(r, 250));
		do {
			const newWords = await weirdLocation();
			const page = {
				page: currentIndex,
				section: currentIndex,
				words: newWords
			};
			pages.push(page);

			if (currentIndex === lastSection) {
				break;
			}

			await newRendition?.next();

			currentIndex = newRendition?.currentLocation()?.start?.index ?? -1;
		} while (currentIndex === sectionIndex);
		spinnerVisible = false;

		console.log('Pages:', pages);
		return pages;
	}

	async function fetchChapterWords() {
		const newWords = await greedyGetWords();
		if (!newWords) return;
		typingWords.set(newWords);
		await storeCurrentLocation();
	}

	$: uploadedFile.subscribe(async (file) => {
		if (!file) return;
		spinnerVisible = true;
		get(rendition)?.destroy();
		get(book)?.destroy();

		try {
			newBook = ePub(file);
			book.set(newBook);

			newRendition = newBook.renderTo(viewer, {
				width: '100%',
				height: '100%',
				spread: 'none',
				minSpreadWidth: 999999,
				flow: 'paginated',
				allowScriptedContent: true
			});

			await newRendition.display();
			spinnerVisible = false;

			newRendition.themes.register('largeText', {
				body: {
					'font-size': '1.2rem',
					'line-height': '1.6',
					'background': 'white',
					'color': 'black',
					'padding': '1rem'
				}
			});
			newRendition.themes.select('largeText');

			rendition.set(newRendition);

			const nav = await newBook.loaded.navigation;
			tocItems = nav.toc || [];

			newRendition.on('relocated', (location) => {
			});
		} catch (error) {
			spinnerVisible = false;
		}
	});

	let handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'ArrowRight') {
			$rendition?.next();
		} else if (event.key === 'ArrowLeft') {
			$rendition?.prev();
		} else if (event.key === 'Escape') {
			showToc = false;
		} else if (event.key === 't') {
			toggleToc();
		}
	};

	onMount(async () => {
		document.addEventListener('keydown', handleKeydown);

		const existingBook = get(book);
		if (existingBook) {
			spinnerVisible = true;
			try {
				newBook = existingBook;
				newRendition = newBook.renderTo(viewer, {
					width: '100%',
					height: '100%',
					spread: 'none',
					minSpreadWidth: 999999,
					flow: 'paginated',
					allowScriptedContent: true
				});
				newRendition.hooks.render.register((context) => {
					context.iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');
				});

				let locationCFI = get(currentLocationCFI);
				if (locationCFI) {
					await newRendition.display(locationCFI);
				} else {
					await newRendition.display();
				}
				spinnerVisible = false;

				newRendition.themes.register('largeText', {
					body: {
						'font-size': '1.2rem',
						'line-height': '1.6',
						'background': 'white',
						'color': 'black',
						'padding': '1rem'
					}
				});
				newRendition.themes.select('largeText');

				rendition.set(newRendition);

				const nav = await newBook.loaded.navigation;
				tocItems = nav.toc || [];

				newRendition.on('relocated', (location) => {
				});
			} catch (error) {
				spinnerVisible = false;
			}
		}
	});

	onDestroy(() => {
		document.removeEventListener('keydown', handleKeydown);
	});

	async function uploadEpub() {
		if (!selectedFile) return;
		uploadedFile.set(selectedFile[0]);
	}

	function goToSection(href: string) {
		get(rendition)?.display(href);
	}

	function toggleToc() {
		showToc = !showToc;
	}
</script>

<main class="container">
	<header>
		<h1>Upload Your Book and Preview It</h1>
	</header>

	<section class="upload-section">
		<input
			type="file"
			id="uploadedFile"
			accept=".epub"
			on:change={handleChange}
		/>
		<button class="upload-button" on:click={uploadEpub}>Upload EPUB</button>
	</section>

	{#if $book}
		<div class="viewer-controls-wrapper">
			<div class="controls">
				<button class="control-button" on:click={() => $rendition?.prev()}>Previous</button>
				<button class="control-button" on:click={() => $rendition?.next()}>Next</button>
				<button class="control-button" on:click={() => $rendition?.display()}>Go to Start</button>
			</div>
			{#if spinnerVisible}
				<div class="spinner">
					<div class="double-bounce1"></div>
					<div class="double-bounce2"></div>
				</div>
			{/if}

			<div bind:this={viewer} class={`viewer ${spinnerVisible ? 'invisible' : ''}`}>
				<div class="toc-drawer" class:open={showToc}>
					<div class="toc-header">
						<h2>Table of Contents</h2>
						<button class="toc-close-button" on:click={toggleToc}>×</button>
					</div>
					<div class="toc-items">
						{#each tocItems as item}
							<div class="toc-item" on:click={() => goToSection(item.href)}>
								{item.label}
							</div>
						{/each}
					</div>
				</div>
				<button class="toc-tab-button" class:open={showToc} on:click={toggleToc}>
					ToC
				</button>
			</div>
			<div class="game-buttons">
				<button class="start-game-button" on:click={fetchChapterWords}>
					Fetch chapter
				</button>
				<a class="game-link" href="../book-type" on:click={fetchChapterWords}>
					<button class="start-game-button">
						Start Game
					</button>
				</a>
			</div>
		</div>
	{/if}
</main>

<style lang="scss">
  @import url('https://fonts.googleapis.com/css2?family=Lexend+Deca&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap');

  html, body, #app, main {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    overflow-x: hidden;
  }

  body {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    font-family: 'Roboto Mono', monospace;
    background-color: #2E3440; /* var(--nord-polar-night) */
    color: #ECEFF4; /* var(--nord-snow-storm) */
  }

  :root {
    --nord-frost: #88C0D0;
    --nord-snow-storm: #ECEFF4;
    --nord-snow-storm-dim: #D8DEE9;
    --nord-polar-night: #2E3440;
    --nord-polar-night-accent: #3B4252;
    --nord-accent: #81A1C1;
    --nord-accent-hover: #5E81AC;
    --nord-aurora-red: #BF616A;
    --nord-aurora-green: #A3BE8C;
    --nord-aurora-yellow: #EBCB8B;
    --nord-info: #88C0D0;
    --nord-info-hover: #5E81AC;
  }

  .container {
    display: flex;
    flex-direction: column;
    flex: 1;
    max-width: 2200px;
    width: 90%;
    margin-top: 1rem;
    padding: 2rem;
    border-radius: 20px;
    background-color: var(--nord-polar-night-accent);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    position: relative; /* so the ToC drawer can overlap */
  }

  .toc-drawer {
    position: absolute;
    top: 0;
    width: 350px;
    height: 100%;
    background-color: #4C566A;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 10;
    display: flex;
    flex-direction: column;
  }

  .toc-drawer.open {
    transform: translateX(0);
  }

  .toc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background-color: #3B4252;
    color: #D8DEE9;
  }

  .toc-close-button {
    background: transparent;
    border: none;
    font-size: 4rem;
    color: #D8DEE9;
    cursor: pointer;
    margin: 3px;
    line-height: 1;
  }

  .toc-items {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
  }

  .toc-item {
    padding: 0.75rem;
    color: #ECEFF4;
    cursor: pointer;

    &:hover {
      background-color: #434C5E;
    }
  }

  .toc-tab-button {
    position: absolute;
    top: 1rem;
    left: 0;
    transform: translateX(25%);
    background-color: var(--nord-accent);
    border: none;
    color: var(--nord-snow-storm);
    cursor: pointer;
    border-radius: 50%;
    width: 2.5rem;
    height: 2.5rem;
    font-weight: bold;
    z-index: 11;
    transition: background-color 0.3s ease, transform 0.3s ease, opacity .2s ease-in-out;

    &:hover {
      background-color: var(--nord-accent-hover);
    }
  }

  .toc-tab-button.open {
    opacity: 0;
    pointer-events: none;
  }

  header {
    text-align: center;
    margin-bottom: 2rem;

    h1 {
      font-family: 'Lexend Deca', sans-serif;
      font-size: 2rem;
      color: var(--nord-frost);
    }
  }

  .upload-section {
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1rem;

    input[type="file"] {
      padding: 0.5rem;
      border: 1px solid var(--nord-snow-storm-dim);
      border-radius: 4px;
      background-color: var(--nord-polar-night-accent);
      color: var(--nord-snow-storm-dim);
      transition: border-color 0.3s ease;
      max-width: 300px;

      &:focus {
        outline: none;
        border-color: var(--nord-frost);
      }
    }

    .upload-button {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      color: var(--nord-snow-storm);
      background-color: var(--nord-accent);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.3s ease, transform 0.2s ease;
      max-width: 200px;
      width: 100%;

      &:hover {
        background-color: var(--nord-accent-hover);
        transform: translateY(-2px);
      }

      &:active {
        transform: translateY(0);
        background-color: var(--nord-frost);
      }
    }
  }

  .spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 40px;
    height: 40px;
    margin: -20px 0 0 -20px; /* Center the spinner */
    z-index: 100;
  }

  .double-bounce1,
  .double-bounce2 {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: var(--nord-frost);
    opacity: 0.6;
    position: absolute;
    top: 0;
    left: 0;
    animation: bounce 2s infinite ease-in-out;
  }

  .double-bounce2 {
    animation-delay: -1s;
  }

  @keyframes bounce {
    0%, 100% {
      transform: scale(0.0);
    }
    50% {
      transform: scale(1.0);
    }
  }

  .invisible {
    opacity: 0;
    pointer-events: none;
    visibility: hidden;
  }

  .uploaded-file {
    text-align: center;
    margin-bottom: 1rem;

    p {
      font-size: 1.1rem;
      color: var(--nord-snow-storm-dim);
      word-wrap: break-word;
    }
  }

  .viewer-controls-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    flex: 1;
  }

  .controls {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
    margin: 0 auto;
    max-width: 800px;
  }

  .control-button {
    padding: 0.6rem 1.2rem;
    font-size: 1.5rem;
    color: var(--nord-snow-storm);
    background-color: var(--nord-polar-night-accent);
    border: 2px solid var(--nord-frost);
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease, transform 0.2s ease;
    max-width: 400px;

    &:hover,
    &:focus {
      background-color: var(--nord-frost);
      color: var(--nord-polar-night);
      transform: translateY(-2px);
      outline: none;
    }

    &:active {
      transform: translateY(0);
      background-color: var(--nord-accent-hover);
    }
  }

  .game-buttons {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .start-game-button {
    padding: 0.75rem 1rem;
    font-size: 1rem;
    color: var(--nord-snow-storm);
    background-color: var(--nord-accent);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
    width: 100%;
    max-width: 250px;

    &:hover {
      background-color: var(--nord-accent-hover);
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(0);
      background-color: var(--nord-frost);
    }
  }

  .game-link {
    display: inline-block;
    font-size: 1rem;
    color: var(--nord-snow-storm);
    text-decoration: none;
    transition: color 0.3s ease;
    text-align: center;

    &:hover,
    &:focus {
      color: var(--nord-info-hover);
      text-decoration: underline;
      outline: none;
    }
  }

  .viewer {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 1 / 1.3;
    max-width: none;
    max-height: 80vh;
    background-color: var(--bg-200);
    overflow: hidden;
    position: relative;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }


  .invisible {
    opacity: 0;
    pointer-events: none;
    visibility: hidden;
  }


  @media (max-width: 768px) {
    .container {
      padding: 1rem;
    }

    .controls {
      flex-direction: column;
      gap: 0.5rem;
    }

    .control-button {
      max-width: none;
      width: 100%;
    }

    .start-game-button,
    .upload-button {
      max-width: none;
    }

    .toc-drawer {
      width: 200px;
    }
  }

  @media (max-width: 480px) {
    header h1 {
      font-size: 1.5rem;
    }

    .control-button,
    .start-game-button,
    .upload-button {
      font-size: 0.9rem;
      padding: 0.5rem 1rem;
    }

    .toc-drawer {
      width: 170px;
    }

    .toc-close-button {
      font-size: 1.3rem;
    }
  }
</style>