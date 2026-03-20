<script lang="ts">
	import { hierarchy } from '$lib/runemarks/index';
	import type { AllianceEntry, FactionEntry } from '$lib/runemarks/hierarchy';
	import type { FighterCardData } from '$lib/types';
	import { t } from '$lib/i18n/index.svelte';

	let { data }: { data: FighterCardData } = $props();

	let search = $state('');

	function tAlliance(id: string) { return t(`alliances.${id}`); }
	function tFaction(id: string)  { return t(`factions.${id}`); }
	function tSubfaction(id: string) { return t(`subfactions.${id}`); }

	function computeFiltered(q: string): AllianceEntry[] {
		const lc = q.trim().toLowerCase();
		if (!lc) return hierarchy;
		return hierarchy
			.map(alliance => {
				const allianceMatch = tAlliance(alliance.id).toLowerCase().includes(lc);
				const factions = alliance.factions
					.map(faction => {
						const factionMatch = tFaction(faction.id).toLowerCase().includes(lc);
						const subfactions = (allianceMatch || factionMatch)
							? faction.subfactions
							: faction.subfactions.filter(sf => tSubfaction(sf.id).toLowerCase().includes(lc));
						if (allianceMatch || factionMatch || subfactions.length > 0) {
							return { ...faction, subfactions } as FactionEntry;
						}
						return null;
					})
					.filter((f): f is FactionEntry => f !== null);
				return factions.length > 0 ? { ...alliance, factions } as AllianceEntry : null;
			})
			.filter((a): a is AllianceEntry => a !== null);
	}

	const filtered = $derived(computeFiltered(search));

	function select(allianceId: string, factionId: string, subfactionId = '') {
		data.grandAlliance = allianceId;
		data.faction = factionId;
		data.bladeborn = subfactionId;
	}

	function clear() {
		data.grandAlliance = '';
		data.faction = '';
		data.bladeborn = '';
		search = '';
	}

	const selectionLabel = $derived(
		data.bladeborn
			? `${tFaction(data.faction)} › ${tSubfaction(data.bladeborn)}`
			: data.faction
				? `${tAlliance(data.grandAlliance)} › ${tFaction(data.faction)}`
				: data.grandAlliance
					? tAlliance(data.grandAlliance)
					: ''
	);
</script>

<div class="faction-select">
	{#if selectionLabel}
		<div class="selection-badge">
			<span class="selection-text">{selectionLabel}</span>
			<button class="clear-btn" onclick={clear} aria-label="Clear selection">×</button>
		</div>
	{/if}

	<input
		class="search-input"
		type="text"
		placeholder={t('ui.filter-factions')}
		bind:value={search}
	/>

	<div class="list">
		{#each filtered as alliance}
			<button
				class="alliance-header"
				class:selected={data.grandAlliance === alliance.id && !data.faction}
				onclick={() => select(alliance.id, '')}
			>{tAlliance(alliance.id)}</button>
			{#each alliance.factions as faction}
				<button
					class="faction-row"
					class:selected={data.faction === faction.id && data.grandAlliance === alliance.id && !data.bladeborn}
					onclick={() => select(alliance.id, faction.id)}
				>
					{tFaction(faction.id)}
				</button>
				{#each faction.subfactions as sf}
					<button
						class="subfaction-row"
						class:selected={data.bladeborn === sf.id && data.faction === faction.id}
						onclick={() => select(alliance.id, faction.id, sf.id)}
					>
						{tSubfaction(sf.id)}
					</button>
				{/each}
			{/each}
		{/each}

		{#if filtered.length === 0}
			<p class="empty">{t('ui.no-matches', { query: search })}</p>
		{/if}
	</div>
</div>

<style>
	.faction-select {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.selection-badge {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		background: var(--ui-sel-bg);
		border: 1px solid var(--ui-sel-border);
		border-radius: 6px;
		padding: 4px 6px 4px 10px;
	}

	.selection-text {
		font-size: 0.78rem;
		color: var(--ui-sel-text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.clear-btn {
		flex-shrink: 0;
		background: none;
		border: none;
		color: var(--ui-sel-text);
		font-size: 1.1rem;
		line-height: 1;
		padding: 0 2px;
		cursor: pointer;
		opacity: 0.6;
		transition: opacity 0.1s;
	}

	.clear-btn:hover {
		opacity: 1;
	}

	.search-input {
		width: 100%;
		box-sizing: border-box;
		background: var(--ui-surface);
		border: 1px solid var(--ui-border);
		border-radius: 6px;
		padding: 6px 10px;
		color: var(--ui-text);
		font-size: 0.875rem;
		outline: none;
		transition: border-color 0.15s;
	}

	.search-input:focus {
		border-color: #7f1d1d;
	}

	.list {
		max-height: 260px;
		overflow-y: auto;
		background: var(--ui-surface);
		border: 1px solid var(--ui-border);
		border-radius: 6px;
		scrollbar-width: thin;
		scrollbar-color: var(--ui-border) transparent;
	}

	.alliance-header {
		display: block;
		width: 100%;
		text-align: left;
		border: none;
		cursor: pointer;
		padding: 5px 10px 3px;
		font-size: 0.6rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ui-text-subtle);
		background: var(--ui-header-bg);
		position: sticky;
		top: 0;
		z-index: 1;
		transition: color 0.1s;
	}

	.alliance-header:hover {
		color: var(--ui-text-muted);
	}

	.alliance-header.selected {
		color: var(--ui-sel-text);
		background: var(--ui-header-bg);
	}

	.faction-row,
	.subfaction-row {
		display: block;
		width: 100%;
		text-align: left;
		border: none;
		background: transparent;
		cursor: pointer;
		color: var(--ui-text-dim);
		transition: background 0.1s, color 0.1s;
	}

	.faction-row {
		padding: 5px 10px 5px 14px;
		font-size: 0.8rem;
	}

	.subfaction-row {
		padding: 4px 10px 4px 26px;
		font-size: 0.75rem;
		color: var(--ui-text-muted);
	}

	.faction-row:hover,
	.subfaction-row:hover {
		background: var(--ui-surface-2);
		color: var(--ui-text);
	}

	.faction-row.selected,
	.subfaction-row.selected {
		background: var(--ui-sel-row);
		color: var(--ui-sel-text);
	}

	.empty {
		padding: 12px 14px;
		font-size: 0.8rem;
		color: var(--ui-text-subtle);
		font-style: italic;
	}
</style>
