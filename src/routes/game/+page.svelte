<script>
	/* eslint-disable @typescript-eslint/no-unused-vars */
	let words = 'The quick brown fox jumps over the lazy dog'.split(' ');

	let typedLetter = '';
	let wordIndex = 0;
	let characterIndex = 0;

	let wordsEL;
	let letterEl;
	let inputEl;

	function handleKeyDown(event) {

	}

	function updateGameState() {

	}
</script>

<div class="game">
	<input bind:this={inputEl}
				 bind:value={typedLetter}
				 on:input={updateGameState()}
				 on:keydown={handleKeyDown()}>

	<div bind:this={wordsEL} class="words">
		{#each words as word}
			<span class="word">
				{#each word as letter}
					<span class="letter">{letter}</span>
					{/each}
			</span>
		{/each}
	</div>

	<div class="word">Hello</div>
	<div class="word active">World</div>
	<div class="word typed">Hello</div>
	<div class="letter ">World</div>


	<div class="word">
		<span class="letter incorrect">H</span>
		<span class="letter correct">e</span>
	</div>

	<div class="word active">
		<span class="letter incorrect">H</span>
		<span class="letter correct">e</span>
	</div>

	<div class="word typed">
		<span class="letter incorrect">H</span>
		<span class="letter correct">e</span>
	</div>

</div>