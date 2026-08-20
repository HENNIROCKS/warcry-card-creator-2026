<script lang="ts">
	import { PLACEHOLDER_SVG } from '$lib/runemarks/index';
	import { runemarkSvg } from '$lib/runemarks/loader.svelte';

	// `fallback` renders the placeholder cross when an entry is selected but has
	// no runemark of its own. A file that is merely still loading renders
	// nothing, so the badge does not flicker through the placeholder first.
	let { file, fallback = false }: { file: string | null | undefined; fallback?: boolean } = $props();

	const svg = $derived(runemarkSvg(file));
</script>

{#if svg}{@html svg}{:else if fallback && !file}{@html PLACEHOLDER_SVG}{/if}
