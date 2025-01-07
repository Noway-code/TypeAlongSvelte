<script lang="ts"> import { blur } from 'svelte/transition';
	import '../../styles/type.scss';
	import { typingWords } from '../../stores/typingStore';
	import { onMount } from 'svelte';
import { Spring } from 'svelte/motion';
	/*
	 Game-specific Types
	*/
	type Game = 'waiting for input' | 'in progress' | 'game over';
	type Word = string;

	/*
	 Subscribe to typingWords
	*/
	export let words: Word[] = [];

	/*
	 Constants
	*/
	const INITIAL_SECONDS = 100;

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
	let typedLetters = 0;
	const stack: number[] = [];
	const windowSize = 100;
	let accuracy = new Spring(0, {
		stiffness: 0.1,
		damping: 1.6,
	});
	let total = 0;

	$: typingWords.subscribe(value => {
		words = value;
	});

	let wordsEl: HTMLDivElement;
	let letterEl: HTMLSpanElement | null;
	let inputEl: HTMLInputElement;
	let caretEl: HTMLDivElement;

	// Accuracy: my idea is a queue where we push up to 250 letters then becomes kind of a sliding window of push and pop

	function accuracyWindow() {
		if (stack.length > windowSize) {
			stack.shift();
		}
		if (typedLetter === words[wordIndex]?.[letterIndex]) {
			stack.push(1);
		} else {
			stack.push(0);
		}
		total = stack.reduce((acc, curr) => acc + curr, 0);
		accuracy.set(parseFloat((total / stack.length * 100).toFixed(1)));

	}


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
		letterEl = letterEl?.nextElementSibling as HTMLSpanElement;

		typedLetters -= 1;
	}

	function startGame() {
		setGameState('in progress');
		setGameTimer();
	}

	function setGameState(state: Game) {
		game = state;
	}

	function setGameTimer() {
		function gameTimer() {
			if (game === 'waiting for input') {
				clearInterval(interval);
			}

			focusInput();
		}

		const interval = setInterval(gameTimer, 1000);
	}

	function updateGameState() {
		if (!wordsEl) {
			console.warn('wordsEl is not available yet.');
			return;
		}
		setLetter();
		accuracyWindow();
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
			wordsEl &&
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
		const offset = 4;
		if (!letterEl || !caretEl) return;
		caretEl.style.top = `${letterEl.offsetTop + offset}px`;
		caretEl.style.left = `${letterEl.offsetLeft + letterEl.offsetWidth}px`;
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
		typedLetters = 0;
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

	onMount(() => {
		focusInput();
		accuracy.set(100);
	});
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
		<div class="accuracy">Accuracy: {accuracy.current.toFixed(1)}</div>

	</div>

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

	</div>

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

</style>
