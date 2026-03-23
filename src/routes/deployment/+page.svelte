<svelte:head>
	<title>Deployment Card — Warcry Card Creator</title>
</svelte:head>

<script lang="ts">
	import { base } from '$app/paths';
	import { t } from '$lib/i18n/index.svelte';
</script>

<main class="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center gap-4">
	<h1 class="text-3xl font-bold tracking-wide">{t('ui.deployment-card')}</h1>
	<p class="text-zinc-400">Coming soon.</p>
	<a href="{base}/" class="text-sm text-zinc-500 hover:text-zinc-300 transition">← Back</a>
</main>
