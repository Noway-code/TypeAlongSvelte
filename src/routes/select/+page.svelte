<script lang="ts">
	import { onDestroy } from 'svelte';
	import { writable } from 'svelte/store';
	import ePub, { Book, Rendition } from 'epubjs';

	// Store to hold the uploaded file
	let selectedFile;
	const uploadedFile = writable<File | null>(null);

	// References to the Book and Rendition instances
	let book: Book | null = null;
	let rendition: Rendition | null = null;

	// Reference to the container where the EPUB will be rendered
	let viewer: HTMLDivElement;

	// React to changes in uploadedFile
	$: if (uploadedFile) {
		uploadedFile.subscribe(async (file) => {
			if (!file) return;

			// Clean up previous instances
			rendition?.destroy();
			book?.destroy();

			try {
				// Initialize the book directly with the File object
				book = ePub(file);

				// Initialize the rendition
				rendition = book.renderTo(viewer, {
					width: '100%',
					height: '900px',
					spread: 'always'
				});

				// Display the book
				await rendition.display();

				// Handle location changes
				rendition.on('relocated', (location) => {
					console.log('Current location:', location);
				});
			} catch (error) {
				console.error('Failed to load EPUB:', error);
			}
		});
	}

	// Clean up on component destroy
	onDestroy(() => {
		rendition?.destroy();
		book?.destroy();
	});

	// Start random-type from here
	function startGame() {
		console.log('Game started!');
	}

	async function uploadEpub() {
		if (!selectedFile) return;

		// Create FormData and append the selected file
		const formData = new FormData();
		formData.append('file', selectedFile[0]); // Use the first file in the FileList

		try {
			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});

			const data = await response.json();
			if (response.ok) {
				console.log('EPUB uploaded successfully:', data);
			} else {
				console.error('Error:', data.detail || data.message);
			}
		} catch (error) {
			console.error('Upload failed:', error);
		}
	}


</script>


<div class="container">
	<h1>Upload Your Book and Preview It</h1>

	<label for="uploadedFile">Upload a book:</label>
	<input
		type="file"
		id="uploadedFile"
		accept=".epub"
		on:change={(event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      selectedFile = target.files;
    }
  }}
	/>

	<button on:click={() => uploadEpub()}>Upload EPUB</button>

	{#if $uploadedFile}
		<h2>Uploaded File:</h2>
		<p>{$uploadedFile.name}</p>

		<div class="controls">
			<button on:click={() => rendition?.prev()}>Previous</button>
			<button on:click={() => rendition?.next()}>Next</button>
			<button on:click={() => rendition?.display()}>Go to Start</button>
		</div>

		<button id="start" on:click={() => {startGame()}}>Start game from here!</button>

		<div bind:this={viewer} class="viewer"></div>


	{/if}
</div>

<style>
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        box-sizing: border-box;
    }

    .viewer {
        border: 1px solid #ccc;
        margin-top: 20px;
        width: 100%;
        max-width: 800px;
        height: 1000px;
        background: #ffffff;
        box-sizing: border-box;
        margin-left: auto;
        margin-right: auto;
    }

    .controls {
        margin-top: 10px;
        display: flex;
        justify-content: center;
        gap: 10px;
    }

    .controls button {
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
        border: none;
        background-color: #007bff;
        color: white;
        border-radius: 4px;
        transition: background-color 0.3s ease;
    }

    .controls button:hover {
        background-color: #0056b3;
    }


    @media (max-width: 768px) {
        .viewer {
            height: 400px;
            max-width: 90%;
        }

        .controls button {
            padding: 8px 16px;
            font-size: 14px;
        }
    }

    @media (max-width: 480px) {
        .container {
            padding: 10px;
        }

        .viewer {
            height: 300px;
            max-width: 100%;
        }

        .controls button {
            padding: 6px 12px;
            font-size: 12px;
        }
    }
</style>
