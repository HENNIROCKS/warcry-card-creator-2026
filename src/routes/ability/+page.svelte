<script lang="ts">
	import { base } from '$app/paths';
	let w = $state(typeof window !== 'undefined' ? window.innerWidth : 1024);
	let h = $state(typeof window !== 'undefined' ? window.innerHeight : 768);
	$effect(() => {
		const onResize = () => { w = window.innerWidth; h = window.innerHeight; };
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	});
	const isRestricted = $derived(w < 640 || (w < 1024 && h > w));
</script>

{#if isRestricted}
<div class="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center gap-4 p-8 text-center">
	<p class="text-zinc-300">This tool requires a tablet in landscape orientation or a larger screen. Mobile support may come in a future update.</p>
	<a href="{base}/" class="text-zinc-500 hover:text-white text-sm transition">← Back</a>
</div>
{:else}
<main class="min-h-screen bg-zinc-900 text-white p-8">
	<a href="{base}/" class="text-zinc-400 hover:text-white text-sm mb-6 inline-block">← Back</a>
	<h1 class="text-2xl font-bold mb-4">Ability Card</h1>
	<p class="text-zinc-400">Editor coming soon.</p>
</main>
{/if}
