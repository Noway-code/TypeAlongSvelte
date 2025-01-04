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
  </nav>>


	<main>
		<slot />
	</main>
</div>

<style lang="scss">
  .layout {
    height: 100vh; /* Full viewport height */
    display: flex;
    flex-direction: column;
  }

  .nav-bar {
    display: flex;
    align-items: center;
    background-color: var(--bg-200); /* Adjusted to use Polar Night accent */
    padding: 1rem 2rem;
    border-radius: 8px;
    width: 100%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: fixed; /* Fix the nav bar at the top */
    top: 0;
    left: 0;
    z-index: 1000; /* Ensure it stays above other elements */
  }

  .logo {
    font-family: 'Lexend Deca', sans-serif;
    font-size: 1.8rem;
    color: var(--fg-100);
    letter-spacing: 2px;
    margin-right: auto; /* Push nav items to the right */
  }

  .nav-items {
    display: flex;
    gap: 1.5rem;
  }

  .nav-item {
    text-decoration: none;
    color: var(--fg-200); /* Slightly dimmer for contrast */
    font-size: 1.2rem;
    transition: color 0.3s ease;

    &:hover {
      color: var(--accent-hover); /* Nord Frost hover color */
    }
  }

  main {
    flex: 1; /* Take up remaining space */
    margin-top: 70px; /* Adjust based on nav bar height */
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>