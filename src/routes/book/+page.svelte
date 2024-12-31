<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { writable } from 'svelte/store';
  import ePub, { Book, Rendition } from 'epubjs';

  // Store to hold the uploaded files
  const uploadedFiles = writable<File[]>([]);

  // References to the Book and Rendition instances
  let book: Book;
  let rendition: Rendition;

  // Reference to the container where the EPUB will be rendered
  let viewer: HTMLDivElement;

  // Watch for changes in uploadedFiles
  $: if ($uploadedFiles.length > 0) {
    // Only handle the first uploaded file
    const file = $uploadedFiles[0];

    // Clean up previous instances if any
    if (rendition) {
      rendition.destroy();
    }
    if (book) {
      book.destroy();
    }

    try {
      // Initialize the book directly with the File object
      book = ePub(file);

      // Initialize the rendition
      rendition = book.renderTo(viewer, {
        width: '100%',
        height: '600px',
        spread: 'always' // You can adjust spread as needed
      });

      // Display the book
      rendition.display();

      // Optional: Handle location changes, themes, etc.
      rendition.on('relocated', (location) => {
        console.log('Current location:', location);
      });
    } catch (error) {
      console.error('Failed to load EPUB:', error);
      // Optionally, display an error message to the user
    }
  }

  // Clean up on component destroy
  onDestroy(() => {
    if (rendition) {
      rendition.destroy();
    }
    if (book) {
      book.destroy();
    }
  });
</script>

<style>
  /* Container to center content and provide margins */
  .container {
    max-width: 1200px; /* Maximum width of the content area */
    margin: 0 auto; /* Center the container horizontally */
    padding: 20px; /* Add padding inside the container */
    box-sizing: border-box;
  }

  /* EPUB viewer styling */
  .viewer {
    border: 1px solid #ccc;
    margin-top: 20px;
    width: 100%; /* Make the viewer take full width of the container */
    max-width: 800px; /* Set a fixed maximum width */
    height: 600px; /* Set a fixed height */
    background: #ffffff;
    box-sizing: border-box;
    margin-left: auto; /* Center the viewer horizontally */
    margin-right: auto;
  }

  /* Controls styling */
  .controls {
    margin-top: 10px;
    display: flex;
    justify-content: center; /* Center the buttons horizontally */
    gap: 10px; /* Space between buttons */
  }

  .controls button {
    padding: 10px 20px; /* Button padding */
    font-size: 16px; /* Button font size */
    cursor: pointer; /* Pointer cursor on hover */
    border: none;
    background-color: #007BFF;
    color: white;
    border-radius: 4px;
    transition: background-color 0.3s ease;
  }

  .controls button:hover {
    background-color: #0056b3;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .viewer {
      height: 400px; /* Reduce height for tablets */
      max-width: 90%; /* Adjust max-width for smaller screens */
    }

    .controls button {
      padding: 8px 16px;
      font-size: 14px;
    }
  }

  @media (max-width: 480px) {
    .container {
      padding: 10px; /* Reduce padding for mobile devices */
    }

    .viewer {
      height: 300px; /* Further reduce height for small screens */
      max-width: 100%; /* Allow full width on very small screens */
    }

    .controls button {
      padding: 6px 12px;
      font-size: 12px;
    }
  }
</style>


<div class="container">
  <h1>Upload Your Book and Preview It</h1>

  <label for="uploadedFiles">Upload a book:</label>
  <input
    type="file"
    id="uploadedFiles"
    name="uploadedFiles"
    accept=".epub"
    on:change={(event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files) {
        uploadedFiles.set(Array.from(target.files));
      }
    }}
  />

  {#if $uploadedFiles.length > 0}
    <h2>Uploaded Files:</h2>
    <ul>
      {#each $uploadedFiles as file}
        <li>{file.name}</li>
      {/each}
    </ul>
  {/if}

  {#if $uploadedFiles.length > 0}
    <div class="controls">
      <button on:click={() => rendition.prev()}>Previous</button>
      <button on:click={() => rendition.next()}>Next</button>
      <button on:click={() => rendition.display()}>Go to Start</button>
    </div>

    <div bind:this={viewer} class="viewer"></div>
  {/if}
</div>
