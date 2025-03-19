<script>
	export let error = {}; // fallback error object
	export let status;
</script>

<svelte:head>
	<title>{status ? status : "Error"} - Something went wrong</title>
</svelte:head>

<div class="error-page">
	<div class="error-content">
		<h1>Oops, something went wrong</h1>
		<p>We’re sorry, but an unexpected error occurred.</p>
		<p>
			There’s a known bug causing issues on refresh, but rest assured your data is safe.
		</p>
	</div>
</div>

<style lang="scss">
  .error-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    background-color: var(--bg-100);
  }

  .error-content {
    padding: 2rem;
    background-color: var(--bg-200);
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: var(--primary);
  }

  p {
    font-size: 1rem;
    margin-bottom: 0.5rem;
    color: var(--fg-100);
  }
</style>
