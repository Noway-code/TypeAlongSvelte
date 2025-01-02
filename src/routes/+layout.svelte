<script lang="ts">
	import '../styles/app.scss';
</script>

<svelte:head>
	<title>TypeAlong</title>
</svelte:head>

<div class="layout">
	<nav class="items">
		<h1 class="item">🔥 TypeAlong</h1>
		<a class="item" href="/">Home</a>
		<a class="item" href="/random-type">Random-Type</a>
		<a class="item" href="/select">Select</a>
	</nav>


	<main>
		<slot />
	</main>
</div>

<style lang="scss">
  h1 {
    font-family: 'Lexend Deca', sans-serif;
    font-size: 1.8rem;
    color: var(--fg-200);
    letter-spacing: 2px;
  }

  .layout {
    height: 100%;
    display: grid;
    grid-template-rows: auto 1fr;
    align-items: center;
    padding: 2rem;
  }

  .item {
    padding-right: 1.5rem
  }

  nav {
    /* Flex container for horizontal alignment */
    display: flex;
    align-items: center;

    /* Background color for the nav bar */
    background-color: var(--nord-polar-night-accent);
    padding: 1rem 2rem;
    border-radius: 8px;

    /* Ensure the nav bar spans the full width of the layout container */
    width: 100%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  nav a {
    text-decoration: none;
    color: var(--fg-200);
    font-size: 1.2rem;
  }


</style>
