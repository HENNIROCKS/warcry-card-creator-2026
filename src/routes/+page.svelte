<script lang="ts">
	import { base } from '$app/paths';
	let w = $state(typeof window !== 'undefined' ? window.innerWidth : 1024);
	let h = $state(typeof window !== 'undefined' ? window.innerHeight : 768);
	$effect(() => {
		const onResize = () => { w = window.innerWidth; h = window.innerHeight; };
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	});
	const isPhone = $derived(w < 640);
	const isPortraitTablet = $derived(!isPhone && w < 1024 && h > w);
</script>

<svelte:head>
	<title>Warcry Card Creator 2026</title>
</svelte:head>

<main class="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center gap-6">
	<h1 class="text-4xl font-bold tracking-wide text-center px-6">Warcry Card Creator 2026</h1>
	<p class="text-zinc-400 text-sm text-center max-w-md px-6">
		An updated version of my original card creator for Warhammer Age of Sigmar: Warcry, now rebuilt with a modern stack for sharper exports and easier customisation.
		This is a fan project made for the community; it is not commercial and has no affiliation with or endorsement from Games Workshop.
	</p>
	{#if isPhone || isPortraitTablet}
		<p class="text-zinc-500 text-xs text-center px-6">Note: the editors require a tablet in landscape orientation or a larger screen. Mobile support may come in a future update.</p>
	{/if}
	<div class="flex gap-4">
		<a href="{base}/fighter" class="px-6 py-3 bg-red-900 hover:bg-red-800 rounded text-white font-semibold transition">
			Fighter Card
		</a>
		<a href="{base}/ability" class="px-6 py-3 bg-red-900 hover:bg-red-800 rounded text-white font-semibold transition">
			Ability Card
		</a>
	</div>
</main>
