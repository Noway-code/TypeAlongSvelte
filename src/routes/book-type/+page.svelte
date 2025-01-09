<script lang="ts">
	import { blur } from 'svelte/transition';
	import '../../styles/type.scss';
	import { typingWords } from '../../stores/typingStore';
	import { onMount } from 'svelte';
	import { Spring } from 'svelte/motion';
	import { type Word, type Game } from '$lib/types';

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
	const accStack: number[] = [];
	const windowSize = 100;
	let startTime = 0;
	let accuracy = new Spring(0, {
		stiffness: 0.1,
		damping: 1.6
	});
	let wpm = new Spring(0, {
		stiffness: 0.1,
		damping: 1.6
	});
	let total = 0;
	let pageWordCount: number[] = [];
	let pageNumber = 0;
	let pageWordIndex = 0;

	/* New variables for WPM sliding window */
	const wordTimestamps: number[] = [];
	const WPM_WINDOW_MS = 60000;

	$: typingWords.subscribe(value => {
		words =	value.flatMap((page) => page.words);
		pageWordCount = value.map((page) => page.words.length);
	});

	let wordsEl: HTMLDivElement;
	let letterEl: HTMLSpanElement | null;
	let inputEl: HTMLInputElement;
	let caretEl: HTMLDivElement;
	let simulateGame = false;

	async function simulateGamePlay() {
		simulateGame = !simulateGame;
		if (!simulateGame) {
			return;
		}

		if (game === 'waiting for input') {
			startGame();
		}

		// Simulate typing each word
		for (let w = 0; w < words.length; w++) {
			const word = words[w];

			for (let li = 0; li < word.length; li++) {
				typedLetter = word[li];
				updateGameState();
				await new Promise(r => setTimeout(r, 100));
			}

			// Simulate pressing the space bar at the end of the word
			const spaceEvent = new KeyboardEvent('keydown', { code: 'Space' });
			handleKeydown(spaceEvent);

			await new Promise(r => setTimeout(r, 100));
		}
	}


	function accuracyWindow() {
		if (accStack.length > windowSize) {
			accStack.shift();
		}
		if (typedLetter === words[wordIndex]?.[letterIndex]) {
			accStack.push(1);
		} else {
			accStack.push(0);
		}
		total = accStack.reduce((acc, curr) => acc + curr, 0);
		accuracy.set(parseFloat((total / accStack.length * 100).toFixed(1)));
	}

	function wpmWindow() {
		const now = Date.now();
		const elapsed = now - startTime;

		// Guard against zero or negative elapsed time
		if (elapsed <= 0) {
			wpm.set(0);
			return;
		}

		while (wordTimestamps.length && now - wordTimestamps[0] > WPM_WINDOW_MS) {
			wordTimestamps.shift();
		}
		const count = wordTimestamps.length;
		if (elapsed < WPM_WINDOW_MS) {
			// Calculate WPM based on elapsed time if less than 60 seconds have passed
			wpm.set(count / (elapsed / 60000));
		} else {
			// Use the sliding window for WPM calculation after 60 seconds
			wpm.set(count);
		}
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
			pageWordIndex -= 1;
		}

		wordIndex = prevWordIndex;
		letterIndex = prevLetterIndex;

		setLetter();

		if (letterEl) {
			const previousState = letterEl.dataset.letter;
			if (previousState === 'correct') {
				correctLetters = Math.max(correctLetters - 1, 0);
			}
			letterEl.dataset.letter = '';
			letterEl = letterEl.previousElementSibling as HTMLSpanElement;
			if (!letterEl && wordIndex > 0) {
				letterEl = wordsEl.children[wordIndex - 1].lastElementChild as HTMLSpanElement;
			} else if (!letterEl && wordIndex === 0) {
				letterEl = wordsEl.children[wordIndex].firstElementChild as HTMLSpanElement;
			}
		}

		moveCaret();
		letterEl = letterEl?.nextElementSibling as HTMLSpanElement;
		typedLetters -= 1;
	}

	function startGame() {
		setGameState('in progress');
		startTime = Date.now();  // Record the start time
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
			wpmWindow();
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
		wpmWindow();
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
			wordTimestamps.push(Date.now());
			pageWordIndex += 1;
			pageUpdate();
		}
	}

	function pageUpdate() {
		if (pageWordIndex === pageWordCount[pageNumber]) {
			pageNumber += 1;
			pageWordIndex = 0;
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
		seconds = INITIAL_SECONDS;
		typedLetter = '';
		wordIndex = 0;
		letterIndex = 0;
		correctLetters = 0;
		typedLetters = 0;
		wordTimestamps.length = 0; // Clear WPM sliding window data
		startTime = 0;             // Reset start time
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

		<div class="stats">
			<div class="stat">
				<span>Accuracy</span>
				<span>{accuracy.current.toFixed(1)}%</span>
			</div>
			<div class="stat">
				<span>WPM</span>
				<span>{wpm.current.toFixed(1)}</span>
			</div>
			<div class="stat">
				<span>Page</span>
				<span>{pageNumber}</span>
			</div>
		</div>
		<button on:click={simulateGamePlay}>Simulate</button>
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
