<script lang="ts">
	import '../styles/app.scss';
	import { onMount } from 'svelte';
	import Sidebar from '../components/Sidebar.svelte';
	import ColorSettings from '../components/ColorSettings.svelte';

	let scrolled = false;
	let sidebarOpen = false;

	onMount(() => {
		function handleScroll() {
			scrolled = window.scrollY > 0;
		}

		window.addEventListener('scroll', handleScroll);
		handleScroll();

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<svelte:head>
	<title>TypeAlong</title>
</svelte:head>

<div class="layout">
	<Sidebar bind:open={sidebarOpen} links={[
		{ href: '/', text: 'Home' },
		{ href: '/random-type', text: 'Random-Type' },
		{ href: '/view-book', text: 'Select' },
		{ href: '/selection', text: 'Selection' }
	]} />

	<div class="content" style="margin-left: {sidebarOpen ? '300px' : '60px'}">
		<nav
			class="nav-bar"
			class:blurred={scrolled}
			style="left: {sidebarOpen ? 'calc(300px + 2rem)' : 'calc(60px + 2rem)'}; width: calc(100% - {sidebarOpen ? '300px' : '60px'} - 4rem);"
		>
			<h1 class="logo">🔥 TypeAlong</h1>
			<div class="nav-items">
				<a class="nav-item" href="/">Home</a>
				<a class="nav-item" href="/random-type">Random-Type</a>
				<a class="nav-item" href="/view-book">View</a>
				<a class="nav-item" href="/selection">Selection</a>
			</div>
		</nav>

		<main>
			<slot />
		</main>

		<footer class="footer">
			<a href="https://www.nowaycode.com/projects/second-post" title="noway-code" target="_blank" rel="noopener noreferrer">
				Blog Post
			</a>
			<a href="https://www.github.com/noway-code/TypeAlongSvelte" title="noway-code" target="_blank" rel="noopener noreferrer">
				Source Code
			</a>
			<a href="https://www.flaticon.com/free-icons/rune" title="rune icons" target="_blank" rel="noopener noreferrer">
				Rune icons created by Aranagraphics - Flaticon
			</a>
		</footer>
	</div>
</div>

<style lang="scss">
  * {
    box-sizing: border-box;
  }

  .layout {
    display: flex;
    height: 100vh;
  }

  .content {
    flex: 1;
    transition: margin-left 0.8s ease;
    display: flex;
    flex-direction: column;
  }

  .nav-bar {
    display: flex;
    align-items: center;
    background-color: var(--bg-300);
    padding: 1rem 2rem;
    backdrop-filter: blur(20px);
    position: fixed;
    top: 2rem;
    left: 2rem;
    right: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    transition: width 0.3s ease, left 0.3s ease, background 0.8s ease;
  }

  nav.blurred {
    background: rgba(59, 66, 82, 0);
    backdrop-filter: blur(10px);
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

  .footer {
    text-align: left;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    color: var(--fg-100);
    margin-top: 20px;
    background: transparent;
  }

  .footer a {
    color: var(--fg-100);
    text-decoration: underline;
    opacity: 50%;
    transition: opacity 0.2s ease;
    &:hover {
      opacity: 100%;
    }
  }
</style>
