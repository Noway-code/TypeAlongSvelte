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
        inset: 0; /* top:0; left:0; right:0; bottom:0; */
        z-index: -1;
        overflow: hidden;
        background: linear-gradient(115deg, var(--nord-polar-night) 0%, #2f3e4c 100%);
    }

    .shape {
        position: absolute;
        border-radius: 50%;
        backdrop-filter: blur(30px);
        /* fallback for browsers that don’t support backdrop-filter */
        background-color: var(--nord-polar-night);
        border: 1px solid rgba(47, 90, 115, 0.3);
        box-shadow: 0 4px 30px var(--nord-frost);
    }

    .shape1 {
        width: 300px;
        height: 300px;
        top: 10%;
        left: -100px;
				filter : blur(29px);
    }

    .shape2 {
        width: 400px;
        height: 400px;
        bottom: -150px;
        right: -100px;
				filter: blur(7px);
    }

    .shape3 {
        width: 200px;
        height: 200px;
        top: 40%;
        left: 70%;
				filter: blur(4px);
    }

    /***** Main Container & Navigation *****/
    .container {
        text-align: center;
        padding: 2rem;
    }

    header {
        margin-bottom: 3rem;

        h1 {
            font-family: 'Lexend Deca', sans-serif;
            font-size: 3rem;
            color: var(--nord-frost);
            margin-bottom: 0.5rem;
        }

        .subtitle {
            font-size: 1.5rem;
            color: var(--nord-snow-storm-dim);
        }
    }

    .navigation {
        display: flex;
        justify-content: center;
        gap: 2rem;

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

            &:hover,
            &:focus {
                background-color: var(--nord-frost);
                color: var(--nord-polar-night);
                transform: translateY(-2px);
                outline: none;
            }

            &:active {
                transform: translateY(0);
                background-color: var(--nord-accent-hover);
            }
        }
    }
</style>
