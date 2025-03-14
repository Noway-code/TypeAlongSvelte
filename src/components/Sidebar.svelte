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
		{#if open}
			<ColorSettings />
		{/if}
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
          .icon {
            font-size: 1.2rem;
          }
        }
      }
    }
  }
</style>
