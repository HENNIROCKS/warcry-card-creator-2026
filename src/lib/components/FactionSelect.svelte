<script lang="ts">
	import { hierarchy } from '$lib/runemarks/index';
	import type { AllianceEntry, FactionEntry } from '$lib/runemarks/hierarchy';
	import type { FighterCardData } from '$lib/types';

	let { data }: { data: FighterCardData } = $props();

	let search = $state('');

	function computeFiltered(q: string): AllianceEntry[] {
		const lc = q.trim().toLowerCase();
		if (!lc) return hierarchy;
		return hierarchy
			.map(alliance => {
				const allianceMatch = alliance.label.toLowerCase().includes(lc);
				const factions = alliance.factions
					.map(faction => {
						const factionMatch = faction.label.toLowerCase().includes(lc);
						const subfactions = (allianceMatch || factionMatch)
							? faction.subfactions
							: faction.subfactions.filter(sf => sf.label.toLowerCase().includes(lc));
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

	function select(alliance: string, faction: string, subfaction = '') {
		data.grandAlliance = alliance;
		data.faction = faction;
		data.bladeborn = subfaction;
	}

	function clear() {
		data.grandAlliance = '';
		data.faction = '';
		data.bladeborn = '';
		search = '';
	}

	const selectionLabel = $derived(
		data.bladeborn
			? `${data.faction} › ${data.bladeborn}`
			: data.faction
				? `${data.grandAlliance} › ${data.faction}`
				: data.grandAlliance
					? data.grandAlliance
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
		placeholder="Filter factions…"
		bind:value={search}
	/>

	<div class="list">
		{#each filtered as alliance}
			<button
				class="alliance-header"
				class:selected={data.grandAlliance === alliance.label && !data.faction}
				onclick={() => select(alliance.label, '')}
			>{alliance.label}</button>
			{#each alliance.factions as faction}
				<button
					class="faction-row"
					class:selected={data.faction === faction.label && data.grandAlliance === alliance.label && !data.bladeborn}
					onclick={() => select(alliance.label, faction.label)}
				>
					{faction.label}
				</button>
				{#each faction.subfactions as sf}
					<button
						class="subfaction-row"
						class:selected={data.bladeborn === sf.label && data.faction === faction.label}
						onclick={() => select(alliance.label, faction.label, sf.label)}
					>
						{sf.label}
					</button>
				{/each}
			{/each}
		{/each}

		{#if filtered.length === 0}
			<p class="empty">No matches for "{search}"</p>
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
		background: rgba(127, 29, 29, 0.2);
		border: 1px solid rgba(127, 29, 29, 0.4);
		border-radius: 6px;
		padding: 4px 6px 4px 10px;
	}

	.selection-text {
		font-size: 0.78rem;
		color: #fca5a5;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.clear-btn {
		flex-shrink: 0;
		background: none;
		border: none;
		color: #fca5a5;
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
		background: #27272a;
		border: 1px solid #3f3f46;
		border-radius: 6px;
		padding: 6px 10px;
		color: #e4e4e7;
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
		background: #27272a;
		border: 1px solid #3f3f46;
		border-radius: 6px;
		scrollbar-width: thin;
		scrollbar-color: #3f3f46 transparent;
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
		color: #71717a;
		background: #1c1c1e;
		position: sticky;
		top: 0;
		z-index: 1;
		transition: color 0.1s;
	}

	.alliance-header:hover {
		color: #a1a1aa;
	}

	.alliance-header.selected {
		color: #fca5a5;
		background: #1c1c1e;
	}

	.faction-row,
	.subfaction-row {
		display: block;
		width: 100%;
		text-align: left;
		border: none;
		background: transparent;
		cursor: pointer;
		color: #d4d4d8;
		transition: background 0.1s, color 0.1s;
	}

	.faction-row {
		padding: 5px 10px 5px 14px;
		font-size: 0.8rem;
	}

	.subfaction-row {
		padding: 4px 10px 4px 26px;
		font-size: 0.75rem;
		color: #a1a1aa;
	}

	.faction-row:hover,
	.subfaction-row:hover {
		background: #3f3f46;
		color: #ffffff;
	}

	.faction-row.selected,
	.subfaction-row.selected {
		background: rgba(127, 29, 29, 0.25);
		color: #fca5a5;
	}

	.empty {
		padding: 12px 14px;
		font-size: 0.8rem;
		color: #71717a;
		font-style: italic;
	}
</style>
