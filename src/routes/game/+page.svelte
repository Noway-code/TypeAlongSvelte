<script>
	/* eslint-disable @typescript-eslint/no-unused-vars */
	let words = "The quick brown fox jumps over the lazy dog".split(' ');

	let typedLetter = ''
	let wordIndex = 0;
	let characterIndex = 0;

	let wordsEL
	let letterEl
	let inputEl

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
</div>

<style>
	input {
			color: black;
	}
</style>