<script lang="ts">
	import { i18n, availableLocales, t } from '$lib/i18n/index.svelte';

	const NEW_LANG_URL = 'https://github.com/HENNIROCKS/warcry-card-creator-2026/issues/new';

	function handleChange(e: Event) {
		const val = (e.target as HTMLSelectElement).value;
		if (val === '__new-lang__') {
			(e.target as HTMLSelectElement).value = i18n.code;
			window.open(NEW_LANG_URL, '_blank', 'noopener,noreferrer');
		} else {
			i18n.setLocale(val);
		}
	}
</script>

{#if availableLocales.length > 1}
	<div class="lang-wrap">
		<svg class="lang-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
			<circle cx="8" cy="8" r="6.5"/>
			<path d="M8 1.5C8 1.5 5.5 4 5.5 8s2.5 6.5 2.5 6.5M8 1.5C8 1.5 10.5 4 10.5 8s-2.5 6.5-2.5 6.5"/>
			<line x1="1.5" y1="8" x2="14.5" y2="8"/>
			<line x1="2.5" y1="5" x2="13.5" y2="5"/>
			<line x1="2.5" y1="11" x2="13.5" y2="11"/>
		</svg>
		<select
			class="lang-select"
			value={i18n.code}
			onchange={handleChange}
		>
			{#each availableLocales as loc}
				<option value={loc.code}>{loc.language}</option>
			{/each}
			<option disabled>──────────</option>
			<option value="__new-lang__">{t('ui.add-language')}</option>
		</select>
	</div>
{/if}

<style>
	.lang-wrap {
		position: relative;
		display: inline-flex;
		align-items: center;
	}

	.lang-icon {
		position: absolute;
		left: 10px;
		pointer-events: none;
		color: var(--ui-text-muted);
		transition: color 0.15s;
	}

	.lang-wrap:hover .lang-icon {
		color: var(--ui-text);
	}

	.lang-select {
		appearance: none;
		background: none;
		border: 1px solid var(--ui-border);
		border-radius: 20px;
		padding: 6px 14px 6px 30px;
		cursor: pointer;
		color: var(--ui-text-muted);
		-webkit-text-fill-color: var(--ui-text-muted);
		font-size: 0.8rem;
		line-height: 1;
		transition: color 0.15s, border-color 0.15s;
		outline: none;
	}

	.lang-select:hover {
		color: var(--ui-text);
		-webkit-text-fill-color: var(--ui-text);
		border-color: var(--ui-text-subtle);
	}
</style>
