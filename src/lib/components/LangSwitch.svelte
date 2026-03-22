<script lang="ts">
	import { i18n, availableLocales, t } from '$lib/i18n/index.svelte';

	const NEW_LANG_URL = 'https://github.com/HENNIROCKS/warcry-card-creator-2026/issues/new?template=new_language.md';

	let details: HTMLDetailsElement;

	const currentLabel = $derived(availableLocales.find(l => l.code === i18n.code)?.language ?? i18n.code);

	function selectLocale(code: string) {
		i18n.setLocale(code);
		details.open = false;
	}

	$effect(() => {
		function onClickOutside(e: MouseEvent) {
			if (details && !details.contains(e.target as Node)) {
				details.open = false;
			}
		}
		document.addEventListener('click', onClickOutside);
		return () => document.removeEventListener('click', onClickOutside);
	});
</script>

{#if availableLocales.length > 1}
	<details bind:this={details} class="lang-details">
		<summary class="lang-pill">
			<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
				<circle cx="8" cy="8" r="6.5"/>
				<path d="M8 1.5C8 1.5 5.5 4 5.5 8s2.5 6.5 2.5 6.5M8 1.5C8 1.5 10.5 4 10.5 8s-2.5 6.5-2.5 6.5"/>
				<line x1="1.5" y1="8" x2="14.5" y2="8"/>
				<line x1="2.5" y1="5" x2="13.5" y2="5"/>
				<line x1="2.5" y1="11" x2="13.5" y2="11"/>
			</svg>
			{currentLabel}
		</summary>
		<div class="lang-menu">
			{#each availableLocales as loc}
				<button
					class="lang-option"
					class:active={loc.code === i18n.code}
					onclick={() => selectLocale(loc.code)}
				>{loc.language}</button>
			{/each}
			<hr class="lang-divider" />
			<a href={NEW_LANG_URL} target="_blank" rel="noopener noreferrer" class="lang-option">{t('ui.add-language')}</a>
		</div>
	</details>
{/if}

<style>
	.lang-details {
		position: relative;
	}

	.lang-details summary {
		list-style: none;
	}

	.lang-details summary::-webkit-details-marker {
		display: none;
	}

	.lang-pill {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		border: 1px solid var(--ui-border);
		border-radius: 20px;
		padding: 6px 14px 6px 10px;
		cursor: pointer;
		color: var(--ui-text-muted);
		font-size: 0.8rem;
		line-height: 1;
		transition: color 0.15s, border-color 0.15s;
		user-select: none;
	}

	.lang-pill:hover {
		color: var(--ui-text);
		border-color: var(--ui-text-subtle);
	}

	.lang-menu {
		position: absolute;
		top: calc(100% + 6px);
		left: 0;
		min-width: 100%;
		background: var(--ui-surface, #1e1e1e);
		border: 1px solid var(--ui-border);
		border-radius: 10px;
		padding: 4px;
		display: flex;
		flex-direction: column;
		z-index: 50;
	}

	.lang-option {
		display: block;
		width: 100%;
		padding: 6px 10px;
		border: none;
		background: none;
		border-radius: 6px;
		color: var(--ui-text-muted);
		font-size: 0.8rem;
		line-height: 1.4;
		text-align: left;
		text-decoration: none;
		cursor: pointer;
		transition: background 0.1s, color 0.1s;
		white-space: nowrap;
	}

	.lang-option:hover {
		background: var(--ui-hover, rgba(255,255,255,0.08));
		color: var(--ui-text);
	}

	.lang-option.active {
		color: var(--ui-text);
		font-weight: 600;
	}

	.lang-divider {
		border: none;
		border-top: 1px solid var(--ui-border);
		margin: 4px 0;
	}
</style>
