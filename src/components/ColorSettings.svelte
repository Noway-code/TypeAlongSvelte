<script lang="ts">
	import { onMount } from 'svelte';

	// Define an object with your color variables and their default values.
	let colors = {
		primary: localStorage.getItem('primary') || '#83a598',
		'fg-100': localStorage.getItem('fg-100') || '#ebdbb2',
		'fg-200': localStorage.getItem('fg-200') || '#928374',
		'bg-100': localStorage.getItem('bg-100') || '#282828',
		'bg-200': localStorage.getItem('bg-200') || '#3c3836',
		'bg-300': localStorage.getItem('bg-300') || '#504945',
		accent: localStorage.getItem('accent') || '#fe8019',
		'accent-hover': localStorage.getItem('accent-hover') || '#d65d0e',
		error: localStorage.getItem('error') || '#fb4934',
		success: localStorage.getItem('success') || '#b8bb26',
		warning: localStorage.getItem('warning') || '#fabd2f',
		info: localStorage.getItem('info') || '#83a598',
		'info-hover': localStorage.getItem('info-hover') || '#689d90'
	};

	// Function to update a CSS variable and persist the change.
	function updateColor(variable: string, value: string) {
		document.documentElement.style.setProperty(`--${variable}`, value);
		localStorage.setItem(variable, value);
		colors = { ...colors, [variable]: value };
	}

	// On mount, ensure the stored colors are applied.
	onMount(() => {
		Object.entries(colors).forEach(([variable, value]) => {
			document.documentElement.style.setProperty(`--${variable}`, value);
		});
	});
</script>

<div class="color-settings">
	<h2>Customize Colors</h2>
	{#each Object.entries(colors) as [key, value]}
		<div class="color-control">
			<label for={key}>{key}</label>
			<input
				type="color"
				id={key}
				bind:value={colors[key]}
				on:change={(e) => updateColor(key, e.target.value)}
			/>
			<span>{colors[key]}</span>
		</div>
	{/each}
</div>

<style>
    .color-settings {
        padding: 1rem;
        background: var(--bg-200);
        color: var(--fg-100);
        border: 1px solid var(--accent);
        border-radius: 8px;
        max-width: 400px;
        margin: 1rem auto;
    }
    .color-control {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 0.5rem;
    }
    label {
        width: 100px;
        text-transform: capitalize;
    }
    input[type="color"] {
        border: none;
        background: none;
        width: 40px;
        height: 40px;
    }
</style>
