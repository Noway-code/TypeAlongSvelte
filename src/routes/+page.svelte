<script lang="ts">
	import '../styles/app.scss';
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
				responsive design,
				and an intuitive layout—perfect for improving your typing speed while enjoying your favorite ebooks.
			</p>
		</div>
		<div class="feature-image">
			<img src="src/public/images/placeholder.WEBP" alt="Typing Game Screenshot" />
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
			<img src="src/public/images/placeholder.WEBP" alt="Theme Customization" />
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
			<img src="src/public/images/placeholder.WEBP" alt="Progress Dashboard" />
		</div>
	</section>
</main>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Lexend+Deca&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap');

    /* Reset and Global Styles */
    *,
    *::before,
    *::after {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    :root {
        --nord-frost: #88C0D0;
        --nord-snow-storm: #ECEFF4;
        --nord-snow-storm-dim: #D8DEE9;
        --nord-polar-night: #2E3440;
        --nord-polar-night-accent: #3B4252;
        --nord-polar-night-dim: #434c5e;
        --nord-polar-night-dim-accent: #4C566A;
        --nord-accent: #81A1C1;
        --nord-accent-hover: #5E81AC;
        --nord-aurora-red: #BF616A;
        --nord-aurora-green: #A3BE8C;
        --nord-aurora-yellow: #EBCB8B;
        --nord-info: #88C0D0;
        --nord-info-hover: #5E81AC;
    }

    /***** Glassmorphism Background *****/
    .glass-bg {
        position: fixed;
        inset: 0;
        z-index: -1;
        overflow: hidden;
        background: radial-gradient(circle, var(--nord-polar-night-accent) 30%, var(--nord-polar-night) 100%);
    }

    .shape {
        position: absolute;
        border-radius: 50%;
        backdrop-filter: blur(30px);
        background-color: var(--nord-polar-night);
        border: 1px solid rgba(47, 90, 115, 0.3);
        box-shadow: 0 4px 30px var(--nord-frost);
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
        color: var(--nord-frost);
        margin-bottom: 0.5rem;
    }

    .subtitle {
        font-size: 1.5rem;
        color: var(--nord-snow-storm-dim);
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
        color: var(--nord-snow-storm);
        background-color: var(--nord-polar-night-accent);
        border: 2px solid var(--nord-frost);
        border-radius: 8px;
        text-decoration: none;
        transition: background-color 0.3s ease, color 0.3s ease, transform 0.2s ease;
    }

    .nav-link:hover,
    .nav-link:focus {
        background-color: var(--nord-frost);
        color: var(--nord-polar-night);
        transform: translateY(-2px);
        outline: none;
    }

    .nav-link:active {
        transform: translateY(0);
        background-color: var(--nord-accent-hover);
    }

    /* Feature Showcase Styles */
    .feature-showcase {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 3rem auto;
        max-width: 60%;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        box-shadow: 0 8px 32px 0 rgba(17, 21, 72, 0.37);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.18);
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
        color: var(--nord-accent);
        margin-bottom: 1rem;
    }

    .feature-description p {
        font-family: 'Roboto Mono', monospace;
        color: var(--nord-snow-storm-dim);
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
        border: 4px solid var(--nord-accent);
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
