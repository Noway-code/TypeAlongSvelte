<script lang="ts">
	import ColorSettings from './ColorSettings.svelte';

	export let open: boolean = true;
	export let links: { href: string; text: string }[] = [
		{ href: '/', text: 'Home' },
		{ href: '/random-type', text: 'Random-Type' },
		{ href: '/view-book', text: 'Select' },
		{ href: '/selection', text: 'Selection' }
	];

	function toggleSidebar() {
		open = !open;
	}
</script>

<aside class="sidebar {open ? 'open' : 'collapsed'}">
	<button class="toggle-btn" on:click={toggleSidebar}>
		{#if open}
			<!-- Collapse Icon -->
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<polyline points="15 18 9 12 15 6" />
			</svg>
		{:else}
			<!-- Expand Icon -->
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<polyline points="9 18 15 12 9 6" />
			</svg>
		{/if}
	</button>
	<nav>
		<ul>
			{#each links as link}
				<li>
					<a href={link.href}>
						{#if open}
							{link.text}
						{/if}
					</a>
				</li>
			{/each}
		</ul>
		<div class="color-settings-wrapper {open ? 'visible' : 'hidden'}">
			<ColorSettings />
		</div>
		<footer class="footer {open ? 'visible' : 'hidden'}">
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
	</nav>
</aside>

<style lang="scss">
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    background: #1f1f1f;
    color: #fff;
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease;
    overflow: hidden;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
    &.open {
      width: 300px;
    }
    &.collapsed {
      width: 60px;
    }
  }
  .toggle-btn {
    background: none;
    border: none;
    color: #fff;
    padding: 1rem;
    cursor: pointer;
    align-self: flex-end;
    transition: transform 0.3s ease;
    svg {
      display: block;
    }
    &:hover {
      transform: scale(1.1);
    }
  }
  nav {
    display: flex;
    flex-direction: column;
    flex: 1;
    margin-top: 2rem;
    ul {
      list-style: none;
      padding: 0;
      li {
        margin: 1rem 0;
        a {
          display: block;
          padding: 0.75rem 1.5rem;
          color: #fff;
          text-decoration: none;
          transition: background 0.3s ease;
          &:hover {
            background: rgba(255, 255, 255, 0.1);
          }
        }
      }
    }
  }
  .color-settings-wrapper {
    transition: opacity 0.1s ease, transform 0.3s ease;
  }
  .color-settings-wrapper.hidden {
    opacity: 0;
    transform: translateX(-100%);
    pointer-events: none;
  }
  .color-settings-wrapper.visible {
    opacity: 1;
    transform: translateX(0);
  }
  .footer {
    margin-top: auto;
    text-align: left;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    color: var(--fg-100);
    background: transparent;
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  .footer.hidden {
    opacity: 0;
    transform: translateX(-100%);
    pointer-events: none;
  }
  .footer.visible {
    opacity: 1;
    transform: translateX(0);
  }
  .footer a {
    color: var(--fg-100);
    text-decoration: underline;
    opacity: 50%;
    transition: opacity 0.2s ease;
  }
  .footer a:hover {
    opacity: 100%;
  }
  .sidebar.collapsed nav ul li a {
    pointer-events: none;
  }

</style>
