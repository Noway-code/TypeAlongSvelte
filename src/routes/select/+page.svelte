<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { get, writable } from 'svelte/store';
	import { rendition, fetchPageWords, book } from '../../stores/typingStore';
	import ePub from 'epubjs';

	let selectedFile: FileList | null = null;
	const uploadedFile = writable<File | null>(null);
	let text = '';
	let page = 1;
	let viewer: HTMLDivElement;

	let showToc = false;
	let tocItems: Array<{ label: string; href: string }> = [];

	document.addEventListener('keydown', (event) => {
		if (event.key === 'ArrowRight') {
			$rendition?.next();
		} else if (event.key === 'ArrowLeft') {
			$rendition?.prev();
		} else if (event.key === 'Escape') {
			showToc = false;
		} else if (event.key === 't') {
			toggleToc();
		}

	});
	// React to changes in uploadedFile
	$: uploadedFile.subscribe(async (file) => {
		if (!file) return;

		get(rendition)?.destroy();
		get(book)?.destroy();

		try {
			const newBook = ePub(file);
			book.set(newBook);

			const newRendition = newBook.renderTo(viewer, {
				width: '100%',
				height: '100%',
				spread: 'none',
				minSpreadWidth: 999999,
				flow: 'paginated'
			});

			await newRendition.display();

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

			// Load navigation to get the table of contents
			const nav = await newBook.loaded.navigation;
			tocItems = nav.toc || [];

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
			on:change={(event) => {
				const target = event.target as HTMLInputElement;
				if (target.files) selectedFile = target.files;
			}}
		/>
		<button class="upload-button" on:click={uploadEpub}>Upload EPUB</button>
	</section>

	{#if $uploadedFile}
		<div class="viewer-controls-wrapper">
			<div class="controls">
				<button class="control-button" on:click={() => $rendition?.prev()}>Previous</button>
				<button class="control-button" on:click={() => $rendition?.next()}>Next</button>
				<button class="control-button" on:click={() => $rendition?.display()}>Go to Start</button>
			</div>


			<div bind:this={viewer} class="viewer">

				<!-- TOC Drawer -->
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

				<!-- TOC Tab Button -->
				<button class="toc-tab-button" class:open={showToc} on:click={toggleToc}>ToC</button>
			</div>

			<div class="game-buttons">
				<button class="start-game-button" on:click={fetchPageWords}>
					Fetch Text
				</button>
				<a class="game-link" href="../book-type">
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
    flex: 1;
    width: 100%;
    background-color: var(--bg-200);
    overflow: hidden;
    position: relative;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-width: 1300px;
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
