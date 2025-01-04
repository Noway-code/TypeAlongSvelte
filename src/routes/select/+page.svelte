<script lang="ts">
	import { onDestroy } from 'svelte';
	import { get, writable } from 'svelte/store';
	import {
		rendition,
		fetchPageWords,
		book
	} from '../../stores/typingStore';
	import ePub from 'epubjs';

	let selectedFile: FileList | null = null;
	const uploadedFile = writable<File | null>(null);
	let viewer: HTMLDivElement;

	// React to changes in uploadedFile
	$: uploadedFile.subscribe(async (file) => {
		if (!file) return;

		// Destroy the previous rendition and book if they exist
		get(rendition)?.destroy();
		get(book)?.destroy();

		try {
			// Create new Book instance and store it
			const newBook = ePub(file);
			book.set(newBook);

			// Render it
			const newRendition = newBook.renderTo(viewer, {
				width: '100%',
				height: '100%'
			});

			await newRendition.display();

			// Set a default theme
			newRendition.themes.default({
				body: {
					background: 'white',
					color: 'black',
					padding: '1rem'
				}
			});

			rendition.set(newRendition);

			newRendition.on('relocated', (location) => {
				console.log('Current location:', location);
			});
		} catch (error) {
			console.error('Failed to load EPUB:', error);
		}
	});

	async function uploadEpub() {
		if (!selectedFile) return;
		const formData = new FormData();
		formData.append('file', selectedFile[0]);
		uploadedFile.set(selectedFile[0]);
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
			on:change={(event) => {
				const target = event.target as HTMLInputElement;
				if (target.files) selectedFile = target.files;
			}}
		/>

		<button class="upload-button" on:click={uploadEpub}>Upload EPUB</button>
	</section>

	{#if $uploadedFile}
		<section class="uploaded-file">
			<p>{$uploadedFile.name}</p>
		</section>

		<div class="viewer-controls-wrapper">
			<div class="controls">
				<button class="control-button" on:click={() => $rendition?.prev()}>Previous</button>
				<button class="control-button" on:click={() => $rendition?.next()}>Next</button>
				<button class="control-button" on:click={() => $rendition?.display()}>Go to Start</button>
			</div>
			<div>
				<!-- fetchPageWords no longer needs to be passed the book; it reads from the store -->
				<button class="start-game-button" on:click={fetchPageWords}>Start game from here!</button>
				<a href="../book-type" class="game-link">Game!</a>
			</div>

			<div bind:this={viewer} class="viewer"></div>
		</div>
	{/if}
</main>

<style lang="scss">
  @import url('https://fonts.googleapis.com/css2?family=Lexend+Deca&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap');

  .container {
    display: flex;
    flex-direction: column;
    max-width: 90%;
    width: 100%;
    height: 1200px;
    margin: 1rem auto;
    padding: 2rem;
    background-color: var(--nord-polar-night-accent);
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  header {
    text-align: center;
    margin-bottom: 1.5rem;

    h1 {
      font-family: 'Lexend Deca', sans-serif;
      font-size: 2.5rem;
      color: var(--nord-frost);
    }
  }

  .upload-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;

    label {
      font-size: 1.2rem;
      color: var(--nord-snow-storm-dim);
    }

    input[type="file"] {
      padding: 0.5rem;
      border: 1px solid var(--nord-snow-storm-dim);
      border-radius: 4px;
      background-color: var(--nord-polar-night);
      color: var(--nord-snow-storm);
      transition: border-color 0.3s ease;
      width: 100%;
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
      width: 100%;
      max-width: 200px;

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

  .uploaded-file {
    text-align: center;
    margin-bottom: 1rem;

    p {
      font-size: 1.2rem;
      color: var(--nord-snow-storm-dim);
      word-wrap: break-word; /* Prevent long filenames from overflowing */
    }
  }

  .viewer-controls-wrapper {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow: hidden;
  }

  .controls {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1rem;
    width: 100%;
    max-width: 600px;
    margin: 5px auto 1rem;
  }

  .control-button {
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
    color: var(--nord-snow-storm);
    background-color: var(--nord-polar-night-accent);
    border: 2px solid var(--nord-frost);
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease, transform 0.2s ease;
    flex: 1 1 100px;
    max-width: 150px;

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

  .start-game-button {
    align-self: center;
    padding: 0.75rem 1rem;
    font-size: 1.1rem;
    color: var(--nord-snow-storm);
    background-color: var(--nord-accent);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
    margin-bottom: 1rem;
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
    align-self: center;
    font-size: 1.1rem;
    color: var(--nord-info);
    text-decoration: none;
    margin-bottom: 1.5rem;
    transition: color 0.3s ease;
    width: 100%;
    max-width: 250px;
    text-align: center;

    &:hover,
    &:focus {
      color: var(--nord-info-hover);
      text-decoration: underline;
      outline: none;
    }
  }

  .viewer {
    flex-grow: 1;
    width: 60%;
    background-color: var(--nord-snow-storm);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-top: 0.5rem;
    max-height: 100%;
  }

  /* Responsive Styles */
  @media (max-width: 1024px) {
    .viewer {
      height: auto;
    }
  }

  @media (max-width: 768px) {
    .container {
      padding: 1.5rem;
    }

    .controls {
      flex-direction: column;
      gap: 0.5rem;
      max-width: 100%;
    }

    .control-button {
      width: 100%;
      max-width: none;
    }

    .start-game-button,
    .upload-button {
      width: 100%;
      max-width: none;
    }
  }

  @media (max-width: 480px) {
    .container {
      padding: 1rem;
      height: 100vh;
    }

    header h1 {
      font-size: 2rem;
    }

    .upload-button,
    .control-button,
    .start-game-button {
      font-size: 0.9rem;
      padding: 0.5rem 1rem;
    }

    .game-link {
      font-size: 1rem;
    }

    .viewer {
      height: 300px;
    }
  }
</style>
