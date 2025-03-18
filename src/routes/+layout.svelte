<script lang="ts">
	import '../styles/app.scss';
	import { onMount } from 'svelte';
	import Sidebar from '../components/Sidebar.svelte';
	import ColorSettings from '../components/ColorSettings.svelte';

	let scrolled = false;
	let sidebarOpen = false;
	let isSmallScreen = false;

	onMount(() => {
		function handleScroll() {
			scrolled = window.scrollY > 0;
		}

		window.addEventListener('scroll', handleScroll);
		handleScroll();

		// Set initial screen size and update on resize
		isSmallScreen = window.innerWidth < 768;
		const handleResize = () => {
			isSmallScreen = window.innerWidth < 768;
		};
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleResize);
		};
	});

	// Compute styles based on screen size and sidebar state
	$: contentMargin = isSmallScreen ? '2rem' : (sidebarOpen ? '300px' : '60px');
	$: navBarLeft = isSmallScreen ? '4rem' : (sidebarOpen ? 'calc(300px + 1rem)' : 'calc(60px + 1rem)');
	$: navBarWidth = isSmallScreen ? 'calc(100% - 4.5rem)' : `calc(100% - ${(sidebarOpen ? 300 : 60)}px - 2rem)`;
	$: navBarItemSize = isSmallScreen ? '0.9rem' : '1.1rem';
</script>

<svelte:head>
	<title>TypeAlong</title>
</svelte:head>

<div class="layout">
	<Sidebar bind:open={sidebarOpen} links={[
		{ href: '/', text: 'Home' },
		{ href: '/random-type', text: 'Random-Type' },
		{ href: '/view-book', text: 'View' },
		{ href: '/selection', text: 'Selection' }
	]} />

	<div class="content" style="margin-left: {contentMargin}">
		<nav
			class="nav-bar"
			class:blurred={scrolled}
			style="left: {navBarLeft}; width: {navBarWidth};"
		>
			<h1 class="logo">🖮 TypeAlong</h1>
			<div class="nav-items" style="font-size: {navBarItemSize}">
				<a class="nav-item" href="/">Home</a>
				<a class="nav-item" href="/random-type">Random-Type</a>
				<a class="nav-item" href="/view-book">View</a>
				<a class="nav-item" href="/selection">Selection</a>
			</div>
		</nav>

		<main>
			<slot />
		</main>
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
    padding: 1rem;
    backdrop-filter: blur(20px);
    position: fixed;
    top: 1rem;
    left: 1rem;
    right: 1rem;
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
    gap: 1rem;
  }

  .nav-item {
    text-decoration: none;
    color: var(--fg-200);
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

  @media (max-width: 768px) {
    .nav-items {
      gap: 0.5rem;
      flex-wrap: wrap;
    }
  }
</style>
