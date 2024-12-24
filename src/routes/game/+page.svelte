<script>
	import Letter from './Letter.svelte';
	let words = "The quick brown fox jumps over the lazy dog".split(' ');

	let typedLetter = ''
	let wordIndex = 0;
	let characterIndex = 0;

	let wordsEL
	let letterEl
	let inputEl

	function startGame() {
		isPlaying = true;
	}

	function letters(word) {
		return word.split('');
	}
</script>

<button onclick={startGame}>Start!</button>
{#if isPlaying}
	<button class:active={isPlaying} onclick={() => isPlaying = !isPlaying}>Hi!</button>
{/if}

{#each words as word}
	<div class=wordClass>{#each letters(word) as letter}<Letter text={letter}></Letter>{/each}</div>
{/each}

<style>
    * {
        color: #eea5a5
    }

    .active {
        color: red
    }
</style>