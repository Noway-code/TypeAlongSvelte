<script lang="ts">
	import { onMount } from 'svelte';

	// Define an object with your color variables and their default values.
	let colors = {
		primary: localStorage.getItem('primary') || '#007acc',
		'fg-100': localStorage.getItem('fg-100') || '#ffffff',
		'fg-200': localStorage.getItem('fg-200') || '#dcdcdc',
		'bg-100': localStorage.getItem('bg-100') || '#1e1e1e',
		'bg-200': localStorage.getItem('bg-200') || '#252526',
		'bg-300': localStorage.getItem('bg-300') || '#2d2d30',
		accent: localStorage.getItem('accent') || '#007acc',
		'accent-hover': localStorage.getItem('accent-hover') || '#005f99',
		error: localStorage.getItem('error') || '#f44747',
		success: localStorage.getItem('success') || '#4ec9b0',
		warning: localStorage.getItem('warning') || '#ff8800',
		info: localStorage.getItem('info') || '#569cd6',
		'info-hover': localStorage.getItem('info-hover') || '#4078c0'
	};

	// Predefined themes with full palettes.
	const themeOptions = {
		"classic-dark": {
			primary: "#007acc",
			"fg-100": "#ffffff",
			"fg-200": "#dcdcdc",
			"bg-100": "#1e1e1e",
			"bg-200": "#252526",
			"bg-300": "#2d2d30",
			accent: "#007acc",
			"accent-hover": "#005f99",
			error: "#f44747",
			success: "#4ec9b0",
			warning: "#ff8800",
			info: "#569cd6",
			"info-hover": "#4078c0"
		},
		gruvbox: {
			primary: "#83a598",
			"fg-100": "#ebdbb2",
			"fg-200": "#928374",
			"bg-100": "#282828",
			"bg-200": "#3c3836",
			"bg-300": "#504945",
			accent: "#fe8019",
			"accent-hover": "#d65d0e",
			error: "#fb4934",
			success: "#b8bb26",
			warning: "#fabd2f",
			info: "#83a598",
			"info-hover": "#689d90"
		},
		nord: {
			primary: "#88C0D0",
			"fg-100": "#ECEFF4",
			"fg-200": "#D8DEE9",
			"bg-100": "#2E3440",
			"bg-200": "#3B4252",
			"bg-300": "#434C5E",
			accent: "#81A1C1",
			"accent-hover": "#5E81AC",
			error: "#BF616A",
			success: "#A3BE8C",
			warning: "#EBCB8B",
			info: "#88C0D0",
			"info-hover": "#5E81AC"
		},
		dracula: {
			primary: "#bd93f9",
			"fg-100": "#f8f8f2",
			"fg-200": "#6272a4",
			"bg-100": "#282a36",
			"bg-200": "#44475a",
			"bg-300": "#3a3c47",
			accent: "#ff79c6",
			"accent-hover": "#ff92d0",
			error: "#ff5555",
			success: "#50fa7b",
			warning: "#f1fa8c",
			info: "#8be9fd",
			"info-hover": "#70e0e0"
		},
		onedark: {
			primary: "#61afef",
			"fg-100": "#abb2bf",
			"fg-200": "#5c6370",
			"bg-100": "#282c34",
			"bg-200": "#3e4451",
			"bg-300": "#21252b",
			accent: "#c678dd",
			"accent-hover": "#a36ac7",
			error: "#e06c75",
			success: "#98c379",
			warning: "#e5c07b",
			info: "#56b6c2",
			"info-hover": "#4fb1b1"
		},
		"catpuccin mocha": {
			primary: "#89dceb",
			"fg-100": "#cad3f5",
			"fg-200": "#b8c0e0",
			"bg-100": "#1e1e2e",
			"bg-200": "#313244",
			"bg-300": "#45475a",
			accent: "#f5c2e7",
			"accent-hover": "#eeb0da",
			error: "#f38ba8",
			success: "#a6e3a1",
			warning: "#f9e2af",
			info: "#89dceb",
			"info-hover": "#74c0e0"
		},
		"solarized-dark": {
			primary: "#268bd2",
			"fg-100": "#839496",
			"fg-200": "#657b83",
			"bg-100": "#002b36",
			"bg-200": "#073642",
			"bg-300": "#586e75",
			accent: "#2aa198",
			"accent-hover": "#268986",
			error: "#dc322f",
			success: "#859900",
			warning: "#b58900",
			info: "#268bd2",
			"info-hover": "#1e6fbd"
		},
		"solarized-light": {
			primary: "#268bd2",
			"fg-100": "#657b83",
			"fg-200": "#586e75",
			"bg-100": "#fdf6e3",
			"bg-200": "#eee8d5",
			"bg-300": "#d3c6aa",
			accent: "#2aa198",
			"accent-hover": "#279f8e",
			error: "#dc322f",
			success: "#859900",
			warning: "#b58900",
			info: "#268bd2",
			"info-hover": "#1e6fbd"
		},
		monokai: {
			primary: "#66d9ef",
			"fg-100": "#f8f8f2",
			"fg-200": "#75715e",
			"bg-100": "#272822",
			"bg-200": "#3e3d32",
			"bg-300": "#49483e",
			accent: "#fd971f",
			"accent-hover": "#f8941d",
			error: "#f92672",
			success: "#a6e22e",
			warning: "#fd971f",
			info: "#66d9ef",
			"info-hover": "#5dc3e4"
		}
	};

	// Set default theme to classic-dark.
	let selectedTheme = "classic-dark";

	// Function to update a CSS variable and persist the change.
	function updateColor(variable: string, value: string) {
		document.documentElement.style.setProperty(`--${variable}`, value);
		localStorage.setItem(variable, value);
		colors = { ...colors, [variable]: value };
	}

	// Apply an entire theme by updating all variables.
	function applyTheme(themeName: string) {
		const theme = themeOptions[themeName];
		if (!theme) return;
		Object.entries(theme).forEach(([variable, value]) => {
			updateColor(variable, value);
		});
	}

	// When the dropdown changes, apply the selected theme.
	function handleThemeChange(e) {
		selectedTheme = e.target.value;
		localStorage.setItem("selectedTheme", selectedTheme);
		applyTheme(selectedTheme);
	}

	// On mount, check if there are stored colors.
	onMount(() => {
		// If localStorage has stored colors (using primary as a check), use them;
		// otherwise, apply the default theme.
		if (!localStorage.getItem("primary")) {
			applyTheme(selectedTheme);
		} else {
			Object.entries(colors).forEach(([variable, value]) => {
				document.documentElement.style.setProperty(`--${variable}`, value);
			});
			// Optionally, load a stored theme selection if available.
			const storedTheme = localStorage.getItem("selectedTheme");
			if (storedTheme) {
				selectedTheme = storedTheme;
			}
		}
	});
</script>

<div class="color-settings">
	<div class="theme-selector">
		<label for="theme-select">Select Theme:</label>
		<select id="theme-select" on:change={handleThemeChange} bind:value={selectedTheme}>
			{#each Object.keys(themeOptions) as themeName}
				<option value={themeName}>{themeName}</option>
			{/each}
		</select>
	</div>
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
    .theme-selector {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    .theme-selector label {
        width: auto;
    }
    select {
        padding: 0.5rem;
        border-radius: 4px;
        border: 1px solid var(--accent);
        background: var(--bg-100);
        color: var(--fg-100);
    }
</style>
