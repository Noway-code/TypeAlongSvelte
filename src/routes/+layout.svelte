<script lang="ts">
	import '../styles/app.scss';
</script>

<svelte:head>
	<title>TypeAlong</title>
</svelte:head>

<div class="layout">
	<nav>
		<h1>🔥 TypeAlong</h1>
		<a href="/">Home</a>
		<a href="/game">Game</a>
		<a href="/book">Book</a>
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

  nav {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  nav a {
    text-decoration: none;
    color: var(--fg-200);
		font-size: 1.2rem;

  }
</style>
