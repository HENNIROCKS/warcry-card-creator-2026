<svelte:head>
	<title>Warcry Card Creator 2026</title>
</svelte:head>

<script lang="ts">
	import { base } from '$app/paths';
	import LangSwitch from '$lib/components/LangSwitch.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { t, i18n } from '$lib/i18n/index.svelte';

	const formattedDate = $derived(
		new Date(__BUILD_DATE__ + 'T00:00:00').toLocaleDateString(i18n.code, { dateStyle: 'long' })
	);
</script>

<style>
	.gh-pill {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		border: 1px solid var(--ui-border);
		border-radius: 20px;
		padding: 6px 14px 6px 10px;
		color: var(--ui-text-muted);
		font-size: 0.8rem;
		line-height: 1;
		text-decoration: none;
		transition: color 0.15s, border-color 0.15s;
	}

	.gh-pill:hover {
		color: var(--ui-text);
		border-color: var(--ui-text-subtle);
	}
</style>

<main class="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center gap-6 py-10">
	<h1 class="text-4xl font-bold tracking-wide text-center px-6">Warcry Card Creator 2026</h1>
	<div class="flex flex-col items-stretch gap-3 w-full max-w-xs px-6 my-4">
		<a href="{base}/fighter" class="px-8 py-4 bg-red-900 hover:bg-red-800 rounded text-white font-semibold text-lg text-center transition">
			{t('ui.fighter-card')}
		</a>
		<a href="{base}/text" class="px-8 py-4 bg-red-900 hover:bg-red-800 rounded text-white font-semibold text-lg text-center transition">
			{t('ui.text-card')}
		</a>
		<a href="{base}/deployment" class="px-8 py-4 bg-red-900 hover:bg-red-800 rounded text-white font-semibold text-lg text-center transition">
			{t('ui.deployment-card')}
		</a>
		<a href="{base}/card-back" class="px-8 py-4 bg-zinc-700 hover:bg-zinc-600 rounded text-zinc-300 hover:text-white font-semibold text-lg text-center transition">
			{t('ui.card-back')}
		</a>
	</div>
	<p class="text-zinc-500 text-sm text-center max-w-sm px-6">
		{t('ui.tagline')}
		{t('ui.disclaimer')}
	</p>
	<div class="flex flex-wrap justify-center items-center gap-x-3 gap-y-2">
		<LangSwitch />
		<ThemeToggle />
		<span class="basis-full sm:hidden h-0"></span>
		<a href="https://github.com/HENNIROCKS/warcry-card-creator-2026" target="_blank" rel="noopener noreferrer" class="gh-pill">
			<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/></svg>
			GitHub
		</a>
	</div>
	<p class="text-zinc-500 text-xs">{t('ui.last-updated')}: {formattedDate}</p>
</main>
