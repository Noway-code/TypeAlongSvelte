<script lang="ts">
	import '../styles/app.scss';
	import { onMount } from 'svelte';
	import ColorSettings from '../components/ColorSettings.svelte';
	let mounted = false;
	onMount(() => {
		mounted = true;
	});
</script>

<!-- Glassmorphism Background Wrapper -->
<div class="glass-bg">
	<!-- A few background shapes -->
	<div class="shape shape1"></div>
	<div class="shape shape2"></div>
	<div class="shape shape3"></div>
</div>

<main class="container">
	<header>
		<h1>Welcome to TypeAlong!</h1>
		<p class="subtitle">A typing game for your epubs!</p>
	</header>

	<nav class="navigation">
		<a href="/select" class="nav-link">Select Book</a>
		<a href="/random-type" class="nav-link">Random Typing</a>
	</nav>

	<!-- Feature Showcase Rows -->
	<section class="feature-showcase">
		<div class="feature-description">
			<h2>Seamless Typing Experience</h2>
			<p>
				Experience a typing game that is both engaging and beautiful. Our interface features fluid animations,
				responsive design, and an intuitive layout—perfect for improving your typing speed while enjoying your favorite ebooks.
			</p>
		</div>
		<div class="feature-image">
			<img src="src/public/images/practice-type.png" alt="Typing Game Screenshot" />
		</div>
	</section>

	<section class="feature-showcase">
		<div class="feature-description">
			<h2>Customizable Themes</h2>
			<p>
				Personalize your typing environment. Choose from various themes and backgrounds to create a unique and
				motivating workspace that suits your style.
			</p>
		</div>
		<div class="feature-image">
			<img src="src/public/images/themes.png" alt="Theme Customization" />
		</div>
	</section>

	<section class="feature-showcase">
		<div class="feature-description">
			<h2>Progress Tracking</h2>
			<p>
				Keep track of your typing speed and accuracy with detailed statistics. Our progress dashboard helps you set
				goals and monitor improvements over time.
			</p>
		</div>
		<div class="feature-image">
			<img src="src/public/images/book-toc.png" alt="Progress Dashboard" />
		</div>
	</section>

	{#if mounted}
		<ColorSettings />
	{/if}

</main>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Lexend+Deca&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap');
    @import '../styles/variables.scss';

    /* Reset and Global Styles */
    *,
    *::before,
    *::after {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    /***** Glassmorphism Background *****/
    .glass-bg {
        position: fixed;
        inset: 0;
        z-index: -1;
        overflow: hidden;
        background: radial-gradient(circle, var(--bg-200) 30%, var(--bg-100) 100%);
    }

    .shape {
        position: absolute;
        border-radius: 50%;
        backdrop-filter: blur(30px);
        background-color: var(--bg-100);
        box-shadow: 0 4px 30px var(--primary);
    }

    .shape1 {
        width: 300px;
        height: 300px;
        top: 10%;
        left: -100px;
        filter: blur(29px);
    }

    .shape2 {
        width: 800px;
        height: 800px;
        bottom: 50px;
        right: 20%;
        filter: blur(7px);
    }

    .shape3 {
        width: 200px;
        height: 200px;
        top: 40%;
        right: -100px;
        filter: blur(4px);
    }

    /***** Main Container & Navigation *****/
    .container {
        text-align: center;
        padding: 2rem;
    }

    header {
        margin-bottom: 3rem;
    }

    header h1 {
        font-family: 'Lexend Deca', sans-serif;
        font-size: 3rem;
        color: var(--primary);
        margin-bottom: 0.5rem;
    }

    .subtitle {
        font-size: 1.5rem;
        color: var(--fg-200);
    }

    .navigation {
        display: flex;
        justify-content: center;
        gap: 2rem;
        margin-bottom: 3rem;
    }

    .nav-link {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        font-size: 1.25rem;
        color: var(--fg-100);
        background-color: var(--bg-200);
        border: 2px solid var(--primary);
        border-radius: 8px;
        text-decoration: none;
        transition: background-color 0.3s ease, color 0.3s ease, transform 0.2s ease;
    }

    .nav-link:hover,
    .nav-link:focus {
        background-color: var(--primary);
        color: var(--bg-100);
        transform: translateY(-2px);
        outline: none;
    }

    .nav-link:active {
        transform: translateY(0);
        background-color: var(--error);
    }

    /* Feature Showcase Styles */
    .feature-showcase {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 3rem auto;
        max-width: 60%;
        padding: 1rem;
        background: color-mix(in srgb, var(--bg-300) 75%, transparent);
        border-radius: 12px;
        box-shadow: 0 8px 32px 0 rgba(17, 21, 72, 0.37);
        backdrop-filter: blur(10px);
        border: 1px solid var(--fg-200);
    }

    .feature-showcase:nth-of-type(even) {
        flex-direction: row-reverse;
    }

    .feature-description {
        flex: 1;
        padding: 1rem;
        text-align: left;
    }

    .feature-description h2 {
        font-family: 'Lexend Deca', sans-serif;
        font-size: 2rem;
        color: var(--primary);
        margin-bottom: 1rem;
    }

    .feature-description p {
        font-family: 'Roboto Mono', monospace;
				font-size: 1.25rem;
				color: var(--fg-200);
        line-height: 1.5;
    }

    .feature-image {
        flex: 1;
        display: flex;
        justify-content: center;
        padding: 1rem;
    }

    .feature-image img {
        max-width: 100%;
        height: auto;
        border-radius: 16px;
        border: 4px solid var(--accent-hover);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    }

    @media (max-width: 768px) {
        .feature-showcase {
            flex-direction: column;
            text-align: center;
        }

        .feature-description {
            padding: 1rem 0;
            margin-bottom: 1rem;
        }

        /* Remove alternating behavior on small screens */
        .feature-showcase:nth-of-type(even) {
            flex-direction: column;
        }
    }
</style>
