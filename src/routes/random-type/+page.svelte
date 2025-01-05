<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { blur } from 'svelte/transition';
	import { tweened } from 'svelte/motion';
	import '../../styles/type.scss';
	import { typingWords } from '../../stores/typingStore';

	type Game = 'waiting for input' | 'in progress' | 'game over';
	type Word = string;

	const INITIAL_SECONDS = 100;
	const WORD_LENGTH = 5;

	let game: Game = 'waiting for input';
	let seconds = INITIAL_SECONDS;
	let typedLetter = '';

	let words: Word[] = [];
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

	let titleBook = '';
	let avatar: FileList | null = null;

	const unsubscribe = typingWords.subscribe(value => {
		words = value;
	});

	function handleKeydown(event: KeyboardEvent) {
		const atEndOfWord = letterIndex >= words[wordIndex].length;

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
			letterEl = letterEl.nextElementSibling as HTMLSpanElement;
			typedLetters -= 1;
		}

		if (game === 'waiting for input') {
			startGame();
		}

		focusInput();
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
			if (seconds > 0) {
				seconds -= 1;
			}

			if (game === 'waiting for input' || seconds === 0) {
				clearInterval(interval);
			}

			if (seconds === 0) {
				gameOver();
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

		if (typedLetters === totalLetters) {
			gameOver();
		}

		focusInput();
	}

	function gameOver() {
		setGameState('game over');
		getResults();
	}

	function setLetter() {
		if (
			wordIndex >= 0 &&
			wordIndex < wordsEl.children.length &&
			letterIndex >= 0 &&
			letterIndex < words[wordIndex].length
		) {
			const currentWord = wordsEl.children[wordIndex] as HTMLElement;
			letterEl = currentWord.children[letterIndex] as HTMLSpanElement;
		} else {
			letterEl = null;
		}
	}

	function checkLetter() {
		const currentLetter = words[wordIndex][letterIndex];
		if (!letterEl) return;
		if (typedLetter === currentLetter) {
			letterEl.dataset.letter = 'correct';
			increaseScore();
		}
		if (typedLetter !== currentLetter) {
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
		const isNotFirstLetter = letterIndex !== 0;
		if (isNotFirstLetter) {
			let wordRemaining = words[wordIndex].length - letterIndex;
			typedLetters += wordRemaining;
			wordIndex += 1;
			letterIndex = 0;
			moveCaret();
		}
	}

	function updateLine() {
		const wordEl = wordsEl.children[wordIndex] as HTMLElement;
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
		if (letterEl) {
			caretEl.style.top = `${letterEl.offsetTop + offset}px`;
			caretEl.style.left = `${letterEl.offsetLeft + letterEl.offsetWidth}px`;
		}
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
		const totalLetters = getTotalLetters(words);
		return Math.floor((correctLetters / totalLetters) * 100);
	}

	function getTotalLetters(words: Word[]) {
		return words.reduce((count, word) => count + word.length, 0);
	}

	function resetGame() {
		toggleReset = !toggleReset;
		setGameState('waiting for input');
		getWords(25);
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

	async function getWords(limit: number) {
		try {
			const response = await fetch(`/api/random/${limit}`);
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
			const data = await response.json();
			words = data.words;
		} catch (error) {
			console.error('Error fetching words:', error);
		}
		return words;
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
			wordLength: words[wordIndex]?.length - 1
		});
	}

	onMount(() => {
		getWords(25);
		focusInput();
	});

	onDestroy(() => {
		unsubscribe();
	});
</script>

<div class="page-content">
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
</div>

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
