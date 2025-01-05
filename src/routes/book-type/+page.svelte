<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { blur } from 'svelte/transition';
	import { tweened } from 'svelte/motion';
	import { get } from 'svelte/store';

	import {
		typingWords,
		book,
		rendition,
		fetchPageWords,
		currentLocationCFI
	} from '../../stores/typingStore';

	import type { Book, Rendition } from 'epubjs';
	import '../../styles/type.scss';

	/*
	 Game-specific Types
	*/
	type Game = 'waiting for input' | 'in progress' | 'game over';
	type Word = string;

	/*
	 Subscribe to typingWords
	*/
	export let words: Word[] = [];
	const unsubscribe = typingWords.subscribe((value) => {
		words = value;
	});

	/*
	 Constants
	*/
	const INITIAL_SECONDS = 100;
	const WORD_LENGTH = 5;

	/*
	 Game state
	*/
	let game: Game = 'waiting for input';
	let seconds = INITIAL_SECONDS;
	let typedLetter = '';

	let wordIndex = 0;
	let letterIndex = 0;
	let correctLetters = 0;
	let toggleReset = false;
	let totalLetters = 0;
	let typedLetters = 0;

	let wordsPerMinute = tweened(0, { delay: 300, duration: 1000 });
	let accuracy = tweened(0, { delay: 1300, duration: 1000 });

	let wordsEl: HTMLDivElement;
	let letterEl: HTMLSpanElement;
	let inputEl: HTMLInputElement;
	let caretEl: HTMLDivElement;
	let newRendition: Rendition | null;
	let currentBook: Book | null;
	/*
	 The HTML container for the EPUB viewer
	*/
	let viewer: HTMLDivElement;

	async function greedyGetWords() {
		type Page = {
			page: number;
			section: number;
			words: Word[];
		};

		let pages: Page[] = [];

		const sectionIndex = newRendition?.currentLocation()?.start?.index;
		if (sectionIndex == null || currentBook == null) return;

		const lastSection = currentBook.spine.last().index ?? 0;

		let currentIndex = sectionIndex;

		do {
			const newWords = await fetchPageWords();
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

		console.log(pages);
	}

	async function fetchNextPage() {
		await newRendition?.next();
		const newWords = await fetchPageWords();
	}

	async function displayBook() {
		// Destroy any existing rendition
		get(rendition)?.destroy();

		currentBook = get(book);
		if (!currentBook) {
			console.log('No Book in store. Please upload or set the book before coming here.');
			return;
		}

		try {
			 newRendition =currentBook.renderTo(viewer, {
				width: '100%',
				height: '100%',
				spread: 'none',
				minSpreadWidth: 999999,
				flow: 'paginated'
			});

			await newRendition.display($currentLocationCFI);

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

			newRendition.on('relocated', (location) => {
				console.log('Current location:', location);
			});
		} catch (error) {
			console.error('Failed to load EPUB in book-type page:', error);
		}
	}

	/*
	  onMount: set up the Book/Rendition if it’s in the store
	*/
	onMount(() => {
		displayBook();
		focusInput();
	});

	/*
	  onDestroy: unsubscribe from store & clean up
	*/
	onDestroy(() => {
		unsubscribe();
	});

	/*
	 Handle keydown logic
	*/
	function handleKeydown(event: KeyboardEvent) {
		const atEndOfWord = letterIndex >= words[wordIndex]?.length;

		if (atEndOfWord) {
			if (event.code !== 'Space' && event.code !== 'Backspace') {
				event.preventDefault();
				return;
			}
		}

		if (event.code === 'Space') {
			event.preventDefault();
			if (game === 'in progress') {
				nextWord();
			}
		}

		if (event.code === 'Backspace') {
			event.preventDefault();
			if (game !== 'in progress') {
				return;
			}
			handleBackspace();
		}

		if (game === 'waiting for input') {
			startGame();
		}

		focusInput();
	}

	function handleBackspace() {
		// If at the very beginning, do nothing
		if (wordIndex === 0 && letterIndex === 0) {
			return;
		}

		let prevWordIndex = wordIndex;
		let prevLetterIndex = letterIndex;

		if (letterIndex > 0) {
			prevLetterIndex -= 1;
		} else if (wordIndex > 0) {
			prevWordIndex -= 1;
			prevLetterIndex = words[prevWordIndex].length - 1;
		}

		wordIndex = prevWordIndex;
		letterIndex = prevLetterIndex;

		setLetter();

		if (letterEl) {
			const previousState = letterEl.dataset.letter;

			// If the previous state was correct, decrement correctLetters
			if (previousState === 'correct') {
				correctLetters = Math.max(correctLetters - 1, 0);
			}

			// Reset the data-letter attribute
			letterEl.dataset.letter = '';

			// Temporarily go backwards
			letterEl = letterEl.previousElementSibling as HTMLSpanElement;
			if (!letterEl && wordIndex > 0) {
				letterEl = wordsEl.children[wordIndex - 1].lastElementChild as HTMLSpanElement;
			} else if (!letterEl && wordIndex === 0) {
				letterEl = wordsEl.children[wordIndex].firstElementChild as HTMLSpanElement;
			}
		}

		moveCaret();

		// Move forward again so the next typed letter overwrites the “empty” space
		letterEl = letterEl.nextElementSibling as HTMLSpanElement;

		typedLetters -= 1;
	}

	function startGame() {
		setGameState('in progress');
		setGameTimer();
		totalLetters = getTotalLetters(words);
	}

	function setGameState(state: Game) {
		game = state;
	}

	function setGameTimer() {
		function gameTimer() {
			if (game === 'waiting for input' ) {
				clearInterval(interval);
			}

			focusInput();
		}

		const interval = setInterval(gameTimer, 1000);
	}

	function updateGameState() {
		setLetter();
		checkLetter();
		nextLetter();
		updateLine();
		resetLetter();
		moveCaret();
		debug();

				focusInput();
	}

	function setLetter() {
		if (
			wordIndex >= 0 &&
			wordIndex < wordsEl.children.length &&
			letterIndex >= 0 &&
			letterIndex < words[wordIndex]?.length
		) {
			const currentWord = wordsEl.children[wordIndex] as HTMLElement;
			letterEl = currentWord.children[letterIndex] as HTMLSpanElement;
		} else {
			letterEl = null;
		}
	}

	function checkLetter() {
		const currentLetter = words[wordIndex]?.[letterIndex];
		if (!letterEl) return;

		if (typedLetter === currentLetter) {
			letterEl.dataset.letter = 'correct';
			increaseScore();
		} else {
			letterEl.dataset.letter = 'incorrect';
		}
	}

	function increaseScore() {
		correctLetters += 1;
	}

	function nextLetter() {
		letterIndex += 1;
		typedLetters += 1;
	}

	function nextWord() {
		if (letterIndex !== 0) {
			const wordRemaining = words[wordIndex].length - letterIndex;
			typedLetters += wordRemaining;
			wordIndex += 1;
			letterIndex = 0;
			moveCaret();
		}
		if (wordIndex >= words.length) {
			fetchNextPage();
		}
	}

	function updateLine() {
		const wordEl = wordsEl.children[wordIndex];
		const wordsY = wordsEl.getBoundingClientRect().y;
		const wordY = wordEl.getBoundingClientRect().y;

		if (wordY > wordsY) {
			wordEl.scrollIntoView({ block: 'center' });
		}
	}

	function resetLetter() {
		typedLetter = '';
	}

	function moveCaret() {
		// Slight offset to position the caret visually
		const offset = 4;
		if (!letterEl) return;
		caretEl.style.top = `${letterEl.offsetTop + offset}px`;
		caretEl.style.left = `${letterEl.offsetLeft + letterEl.offsetWidth}px`;
	}

	function getWordsPerMinute() {
		const wordsTyped = correctLetters / WORD_LENGTH;
		return Math.floor(wordsTyped * (60 / (INITIAL_SECONDS - seconds || 1)));
	}

	function getResults() {
		$wordsPerMinute = getWordsPerMinute();
		$accuracy = getAccuracy();
	}

	function getAccuracy() {
		const total = getTotalLetters(words);
		return Math.floor((correctLetters / total) * 100);
	}

	function getTotalLetters(arr: Word[]) {
		return arr.reduce((count, w) => count + w.length, 0);
	}

	function resetGame() {
		toggleReset = !toggleReset;

		setGameState('waiting for input');
		// When resetting, you might want to re-fetch or re-scrape words from the current page:
		// await fetchPageWords()  // optionally fetch fresh text from the ebook page

		seconds = INITIAL_SECONDS;
		typedLetter = '';
		wordIndex = 0;
		letterIndex = 0;
		correctLetters = 0;
		totalLetters = getTotalLetters(words);
		typedLetters = 0;
		$wordsPerMinute = 0;
		$accuracy = 0;
		focusInput();
	}

	function focusInput() {
		if (inputEl) {
			inputEl.focus();
		}
	}

	function debug() {
		console.log({
			letterIndex,
			wordIndex,
			letterEl,
			letter: letterEl?.innerText,
			wordLength: words[wordIndex]?.length
		});
	}
</script>

<!-- PAGE CONTENT -->
<div class="page-content">
	<!-- Back Button -->
	<div class="back-container">
		<a aria-label="Go back to selection page" class="back" href="/select">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 17"
				width="24"
				height="24"
				stroke-width="3"
				stroke="currentColor"
				fill="none"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M15 19l-7-7 7-7"
				/>
			</svg>
			Back
		</a>
	</div>

	<button on:click={greedyGetWords}>Get Words</button>

	<!-- Game Content -->
	<div class="game-container">
		{#if game !== 'game over'}
			<div class="game" data-game={game}>
				<input
					bind:this={inputEl}
					bind:value={typedLetter}
					on:input={updateGameState}
					on:keydown={handleKeydown}
					class="input"
					type="text"
				/>

				<div class="time">{seconds}</div>

				<!-- This key block helps re-render the words on reset -->
				{#key toggleReset}
					<div in:blur|local bind:this={wordsEl} class="words">
						{#each words as word}
							<span class="word">
								{#each word as letter}
									<span class="letter">{letter}</span>
								{/each}
							</span>
						{/each}

						<div bind:this={caretEl} class="caret"></div>
					</div>
				{/key}

				<div class="reset">
					<button on:click={resetGame} aria-label="reset">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							width="24"
							height="24"
							stroke-width="1.5"
							stroke="currentColor"
							fill="none"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"
							/>
						</svg>
					</button>
				</div>
			</div>
		{/if}

		{#if game === 'game over'}
			<div in:blur class="results">
				<div class="numbers">
					<div>
						<p class="title">wpm</p>
						<p class="score">{Math.trunc($wordsPerMinute)}</p>
					</div>
					<div>
						<p class="title">accuracy</p>
						<p class="score">{Math.trunc($accuracy)}%</p>
					</div>
				</div>
				<button on:click={resetGame} class="play">play again</button>
			</div>
		{/if}
	</div>

	<!-- EPUB Viewer -->
	<!-- This is where the Book will render -->
	<div bind:this={viewer} class="viewer"></div>
</div>

<!-- SCSS styling -->
<style lang="scss">
  .letter {
    opacity: 0.4;
    transition: all 0.3s ease;

    &:global([data-letter='correct']) {
      opacity: 0.8;
    }

    &:global([data-letter='incorrect']) {
      color: var(--error);
      opacity: 1;
    }
  }

  .viewer {
    flex: 1;
    width: 100%;
    background-color: var(--bg-200);
    overflow: hidden;
    position: relative;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-width: 1300px;
		opacity: 25%;
  }
</style>
