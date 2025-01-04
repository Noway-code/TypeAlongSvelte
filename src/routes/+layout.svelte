<script lang="ts">
	import '../styles/app.scss';
</script>

<svelte:head>
	<title>TypeAlong</title>
</svelte:head>

<div class="layout">
	<nav class="nav-bar">
		<h1 class="logo">🔥 TypeAlong</h1>
		<div class="nav-items">
			<a class="nav-item" href="/">Home</a>
			<a class="nav-item" href="/random-type">Random-Type</a>
			<a class="nav-item" href="/select">Select</a>
		</div>
	</nav>

	<main>
		<slot />
	</main>
</div>

<style lang="scss">
  * {
    box-sizing: border-box;
  }

  .layout {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .nav-bar {
    display: flex;
    align-items: center;
    background-color: var(--bg-200);
    padding: 1rem 2rem;

    position: fixed;
    top: 2rem;
    left: 2rem;
    right: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }

  .logo {
    font-family: 'Lexend Deca', sans-serif;
    font-size: 1.8rem;
    color: var(--fg-100);
    letter-spacing: 2px;
    margin-right: auto;
  }

  .nav-items {
    display: flex;
    gap: 1.5rem;
  }

  .nav-item {
    text-decoration: none;
    color: var(--fg-200);
    font-size: 1.2rem;
    transition: color 0.3s ease;

    &:hover {
      color: var(--accent);
    }
  }

  main {
    flex: 1;
    margin-top: 4rem;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
