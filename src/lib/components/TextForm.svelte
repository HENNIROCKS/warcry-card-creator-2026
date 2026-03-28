<script lang="ts">
	import type { TextCardData } from '$lib/types';
	import {
		fighterRunemarks, weaponRunemarks, characteristicRunemarks, hierarchy,
		cardDecksRunemarks, deploymentRunemarks, miscRunemarks,
		treasureRunemarks, twistsRunemarks,
	} from '$lib/runemarks/index';
	import { t, i18n } from '$lib/i18n/index.svelte';
	import FactionSelect from './FactionSelect.svelte';

	let { data, rmKeys = $bindable(['', '']) }: { data: TextCardData; rmKeys: string[] } = $props();
	let bodyTextEl: HTMLTextAreaElement;
	let prerequisiteTextEl: HTMLTextAreaElement;

	const runemarkKeys = $derived(
		Object.keys(fighterRunemarks)
			.sort((a, b) => t(`runemarks.${a}`).localeCompare(t(`runemarks.${b}`), i18n.code))
	);

	const presetLabels = ['ability', 'reaction', 'heroic-trait', 'battle-trait', 'lesser-artefact', 'greater-artefact', 'divine-blessing'];
	let selectValue = $state(presetLabels.includes(data.cardLabel) ? data.cardLabel : '__custom__');
	let customText = $state(presetLabels.includes(data.cardLabel) ? '' : data.cardLabel);

	$effect(() => {
		data.cardLabel = selectValue === '__custom__' ? customText : selectValue;
	});

	let rmPickerFor = $state<'bodyText' | 'prerequisiteText' | null>(null);
	let rmPickerSearch = $state('');
	let rmPickerSearchEl: HTMLInputElement;

	function slugify(k: string): string {
		return k.toLowerCase().replace(/\s+/g, '-');
	}

	type InlineOpt = { slug: string; label: string; group: string };

	const allInlineOpts = $derived((() => {
		const loc = i18n.code;
		const opts: InlineOpt[] = [];
		Object.keys(fighterRunemarks)
			.map(k => ({ slug: slugify(k), label: t('runemarks.' + k), group: t('ui.form-runemarks') }))
			.sort((a, b) => a.label.localeCompare(b.label, loc))
			.forEach(o => opts.push(o));
		Object.keys(weaponRunemarks)
			.map(k => ({ slug: slugify(k), label: t('weapons.' + k), group: t('ui.weapons-group') }))
			.sort((a, b) => a.label.localeCompare(b.label, loc))
			.forEach(o => opts.push(o));
		Object.keys(characteristicRunemarks)
			.map(k => ({ slug: k, label: t('card.col-' + k).replace(/\|/g, ' '), group: t('ui.form-characteristics') }))
			.forEach(o => opts.push(o));
		Object.keys(cardDecksRunemarks)
			.map(k => ({ slug: k, label: t('card-decks.' + k), group: t('ui.card-decks-group') }))
			.sort((a, b) => a.label.localeCompare(b.label, loc))
			.forEach(o => opts.push(o));
		Object.keys(deploymentRunemarks)
			.map(k => ({ slug: k, label: t('deployment.' + k), group: t('ui.deployment-group') }))
			.sort((a, b) => a.label.localeCompare(b.label, loc))
			.forEach(o => opts.push(o));
		Object.keys(miscRunemarks)
			.map(k => ({ slug: k, label: t('misc.' + k), group: t('ui.misc-group') }))
			.sort((a, b) => a.label.localeCompare(b.label, loc))
			.forEach(o => opts.push(o));
		Object.keys(treasureRunemarks)
			.map(k => ({ slug: k, label: t('treasure.' + k), group: t('ui.treasure-group') }))
			.sort((a, b) => a.label.localeCompare(b.label, loc))
			.forEach(o => opts.push(o));
		Object.keys(twistsRunemarks)
			.map(k => ({ slug: k, label: t('twists.' + k), group: t('ui.twists-group') }))
			.sort((a, b) => a.label.localeCompare(b.label, loc))
			.forEach(o => opts.push(o));
		for (const alliance of hierarchy) {
			const groupLabel = t('alliances.' + alliance.id);
			if (alliance.svg) opts.push({ slug: alliance.id, label: groupLabel, group: groupLabel });
			for (const faction of alliance.factions) {
				if (faction.svg) opts.push({ slug: faction.id, label: t('factions.' + faction.id), group: groupLabel });
				for (const sub of faction.subfactions) {
					if (sub.svg) opts.push({ slug: sub.id, label: t('subfactions.' + sub.id), group: groupLabel });
				}
			}
		}
		return opts;
	})());

	const filteredInlineGroups = $derived((() => {
		const lc = rmPickerSearch.trim().toLowerCase();
		const filtered = lc
			? allInlineOpts.filter(o => o.label.toLowerCase().includes(lc) || o.group.toLowerCase().includes(lc))
			: allInlineOpts;
		const groups: { label: string; items: InlineOpt[] }[] = [];
		for (const opt of filtered) {
			let g = groups.find(g => g.label === opt.group);
			if (!g) { g = { label: opt.group, items: [] }; groups.push(g); }
			g.items.push(opt);
		}
		return groups;
	})());

	$effect(() => {
		if (rmPickerFor) requestAnimationFrame(() => rmPickerSearchEl?.focus());
	});

	function insertRunemark(slug: string, field: 'bodyText' | 'prerequisiteText') {
		const el = field === 'bodyText' ? bodyTextEl : prerequisiteTextEl;
		const start = el.selectionStart;
		const end = el.selectionEnd;
		const insert = `[${slug}]`;
		data[field] = data[field].slice(0, start) + insert + data[field].slice(end);
		requestAnimationFrame(() => {
			el.focus();
			el.setSelectionRange(start + insert.length, start + insert.length);
		});
		rmPickerFor = null;
		rmPickerSearch = '';
	}

	function wrapSelection(el: HTMLTextAreaElement, marker: string, field: 'bodyText' | 'prerequisiteText') {
		const start = el.selectionStart;
		const end = el.selectionEnd;
		const selected = data[field].slice(start, end);
		data[field] = data[field].slice(0, start) + marker + selected + marker + data[field].slice(end);
		requestAnimationFrame(() => {
			el.focus();
			el.setSelectionRange(start + marker.length, end + marker.length);
		});
	}

	$effect(() => {
		data.fighterRunemarks = rmKeys
			.filter(k => k !== '')
			.sort((a, b) => (a === 'Hero' || a === 'Monster' ? -1 : 0) - (b === 'Hero' || b === 'Monster' ? -1 : 0))
			.map(k => ({ id: k, label: t('runemarks.' + k), svg: fighterRunemarks[k] }));
	});
</script>

<div class="space-y-10 text-sm">

	<!-- Card Name + Type -->
	<section>
		<label class="field-label" for="card-label">{t('ui.form-type')} <span class="normal-case font-normal text-zinc-500">({t('ui.form-select')})</span> {#if selectValue === '__custom__'}<span class="normal-case font-normal text-zinc-500">{customText.length}/30</span>{/if}</label>
		<select id="card-label" class="field-input" bind:value={selectValue}>
			<option value="ability">{t('card.label-ability')}</option>
			<option value="reaction">{t('card.label-reaction')}</option>
			<option value="heroic-trait">{t('card.label-heroic-trait')}</option>
			<option value="battle-trait">{t('card.label-battle-trait')}</option>
			<option value="divine-blessing">{t('card.label-divine-blessing')}</option>
			<option value="lesser-artefact">{t('card.label-lesser-artefact')}</option>
			<option value="greater-artefact">{t('card.label-greater-artefact')}</option>
			<option value="__custom__">{t('ui.form-custom')}</option>
		</select>
		{#if selectValue === '__custom__'}
			<input
				class="field-input mt-2"
				type="text"
				placeholder={t('ui.form-custom-label')}
				maxlength="30"
				bind:value={customText}
			/>
		{/if}
		<label class="field-label mt-2" for="card-name">{t('ui.form-card')} <span class="normal-case font-normal text-zinc-500">{t('ui.form-line-break-hint')}</span></label>
		<input
			id="card-name"
			class="field-input"
			type="text"
			placeholder={t('card.card-name-placeholder')}
			bind:value={data.name}
		/>
		{#if data.showCaption}
			<label class="field-label mt-2" for="image-caption">{t('ui.form-caption')}</label>
			<input id="image-caption" class="field-input" type="text" placeholder={t('ui.form-placeholder-caption-text')} bind:value={data.imageCaption} />
		{/if}
	</section>

	<!-- Card Elements / Card Design -->
	<section>
		<div class="two-col">
			<div>
				<p class="field-label mb-2">{t('ui.form-card-elements')}</p>
				<div class="flex flex-col gap-3">
					<label class="flex cursor-pointer items-center gap-3">
						<input type="checkbox" bind:checked={data.showRunemarks} class="h-4 w-4 rounded accent-red-800" />
						<span class="text-zinc-200">{t('ui.form-show-runemarks')}</span>
					</label>
					<label class="flex cursor-pointer items-center gap-3">
						<input type="checkbox" checked={data.freeHierarchy} class="h-4 w-4 rounded accent-red-800"
							onchange={(e) => {
								data.freeHierarchy = (e.target as HTMLInputElement).checked;
								if (!data.freeHierarchy) { data.grandAlliance = ''; data.faction = ''; data.bladeborn = ''; }
							}} />
						<span class="text-zinc-200">{t('ui.form-free-hierarchy')}</span>
					</label>
					<label class="flex cursor-pointer items-center gap-3">
						<input type="checkbox" bind:checked={data.showActivation} class="h-4 w-4 rounded accent-red-800" />
						<span class="text-zinc-200">{t('ui.form-show-activation')}</span>
					</label>
					<label class="flex cursor-pointer items-center gap-3">
						<input type="checkbox" bind:checked={data.showFlavorText} class="h-4 w-4 rounded accent-red-800" />
						<span class="text-zinc-200">{t('ui.form-show-flavor-text')}</span>
					</label>
					<label class="flex cursor-pointer items-center gap-3">
						<input type="checkbox" bind:checked={data.showPointsTable} class="h-4 w-4 rounded accent-red-800" />
						<span class="text-zinc-200">{t('ui.form-show-points-table')}</span>
					</label>
					<label class="flex cursor-pointer items-center gap-3">
						<input type="checkbox" bind:checked={data.showPrerequisite} class="h-4 w-4 rounded accent-red-800" />
						<span class="text-zinc-200">{t('ui.form-show-prerequisite')}</span>
					</label>
					<label class="flex cursor-pointer items-center gap-3">
						<input type="checkbox" bind:checked={data.showCaption} class="h-4 w-4 rounded accent-red-800" />
						<span class="text-zinc-200">{t('ui.form-show-caption')}</span>
					</label>
				</div>
			</div>
			<div>
				<p class="field-label mb-2">{t('ui.form-card-design')}</p>
				<div class="flex flex-col gap-3">
					<label class="flex cursor-pointer items-center gap-3">
						<input type="checkbox" class="h-4 w-4 rounded accent-red-800"
							checked={data.layoutVariant === 'banderole'}
							onchange={(e) => { data.layoutVariant = (e.target as HTMLInputElement).checked ? 'banderole' : 'standard'; }}
						/>
						<span class="text-zinc-200">{t('ui.form-layout-banderole')}</span>
					</label>
				</div>
			</div>
		</div>
	</section>

	<!-- Runemarks -->
	<section>
		<p class="field-label mb-2">{t('ui.form-runemarks')}</p>
		{#if data.freeHierarchy}
			<div class="flex flex-col gap-2">
				<div>
					<p class="sublabel mb-1">{t('ui.form-grand-alliance')}</p>
					<select class="field-input" bind:value={data.grandAlliance}>
						<option value="">—</option>
						{#each [...hierarchy].sort((a, b) => t(`alliances.${a.id}`).localeCompare(t(`alliances.${b.id}`), i18n.code)) as alliance}
							<option value={alliance.id}>{t(`alliances.${alliance.id}`)}</option>
						{/each}
					</select>
				</div>
				<div>
					<p class="sublabel mb-1">{t('ui.form-faction')}</p>
					<select class="field-input" bind:value={data.faction}>
						<option value="">—</option>
						{#each hierarchy.flatMap(a => a.factions).sort((a, b) => t(`factions.${a.id}`).localeCompare(t(`factions.${b.id}`), i18n.code)) as faction}
							<option value={faction.id}>{t(`factions.${faction.id}`)}</option>
						{/each}
					</select>
				</div>
				<div>
					<p class="sublabel mb-1">{t('ui.form-subfaction')}</p>
					<select class="field-input" bind:value={data.bladeborn}>
						<option value="">—</option>
						{#each hierarchy.flatMap(a => a.factions.flatMap(f => f.subfactions)).sort((a, b) => t(`subfactions.${a.id}`).localeCompare(t(`subfactions.${b.id}`), i18n.code)) as sub}
							<option value={sub.id}>{t(`subfactions.${sub.id}`)}</option>
						{/each}
					</select>
				</div>
			</div>
		{:else}
			<FactionSelect {data} />
		{/if}
		<div class="mt-3">
			<p class="sublabel mb-1">{t('ui.form-fighter-runemarks')}</p>
			<div class="flex flex-col gap-2">
				{#each [0, 1] as i}
					<select class="field-input" bind:value={rmKeys[i]}>
						<option value="">—</option>
						{#each runemarkKeys as name}
							<option value={name} disabled={
								(rmKeys[i] !== name && rmKeys.some((k, j) => j !== i && k === name)) ||
								(name === 'Monster' && rmKeys.some(k => k === 'Hero')) ||
								(name === 'Hero' && rmKeys.some(k => k === 'Monster'))
							}>{t('runemarks.' + name)}</option>
						{/each}
					</select>
				{/each}
			</div>
		</div>
		{#if data.showActivation}
			<div class="mt-3">
				<label class="sublabel" for="activation">{t('ui.form-activation')}</label>
				<select id="activation" class="field-input" bind:value={data.activationType}>
					<option value={null}>—</option>
					<option value="double">{t('card.activation-double')}</option>
					<option value="triple">{t('card.activation-triple').replaceAll('|', '')}</option>
					<option value="quad">{t('card.activation-quad').replaceAll('|', '')}</option>
				</select>
			</div>
		{/if}
	</section>

	<!-- Text -->
	{#if data.showFlavorText}
		<section>
			<label class="field-label" for="flavor-text">{t('ui.form-flavor-text')} <span class="normal-case font-normal text-zinc-500">({t('ui.form-italic')})</span></label>
			<textarea
				id="flavor-text"
				class="field-input resize-none"
				rows="3"
				bind:value={data.flavorText}
			></textarea>
		</section>
	{/if}

	{#if data.showPointsTable}
		<section>
			<p class="field-label mb-2">{t('ui.form-points-cost-increases')}</p>
			<div class="points-row">
				<div class="points-field">
					<label class="sublabel" for="regular-points">{t('ui.form-regular-points')}</label>
					<input id="regular-points" class="field-input" type="text" placeholder="15" bind:value={data.regularPointsValue} />
				</div>
				<div class="points-field">
					<label class="sublabel" for="elite-points">{t('ui.form-elite-points')}</label>
					<input id="elite-points" class="field-input" type="text" placeholder="20" bind:value={data.elitePointsValue} />
				</div>
			</div>
		</section>
	{/if}

	{#if data.showPrerequisite}
		<section>
			<label class="field-label" for="prerequisite-text">{t('ui.form-prerequisite')} <span class="normal-case font-normal text-zinc-500">({t('ui.form-framed')})</span></label>
			<div class="markup-toolbar">
				<button type="button" class="markup-btn" title={t('ui.form-bold')} onclick={() => wrapSelection(prerequisiteTextEl, '**', 'prerequisiteText')}>B</button>
				<button type="button" class="markup-btn italic" title={t('ui.form-italic')} onclick={() => wrapSelection(prerequisiteTextEl, '*', 'prerequisiteText')}>I</button>
				<button type="button" class="markup-btn" class:active={data.smallBodyText} title={t('ui.form-small-text')} onclick={() => data.smallBodyText = !data.smallBodyText}>A↓</button>
				<button type="button" class="markup-btn" title={t('ui.form-insert-runemark')} onclick={() => { rmPickerFor = rmPickerFor === 'prerequisiteText' ? null : 'prerequisiteText'; rmPickerSearch = ''; }}>[⊕]</button>
			</div>
			{#if rmPickerFor === 'prerequisiteText'}
				<div class="rm-picker">
					<input class="rm-picker-search" type="text" placeholder={t('ui.form-filter-runemarks')} bind:value={rmPickerSearch} bind:this={rmPickerSearchEl} />
					<div class="rm-picker-list">
						{#each filteredInlineGroups as group}
							<div class="rm-picker-group">{group.label}</div>
							{#each group.items as opt}
								<button type="button" class="rm-picker-item" onclick={() => insertRunemark(opt.slug, 'prerequisiteText')}>
									<span class="rm-picker-slug">[{opt.slug}]</span>{opt.label}
								</button>
							{/each}
						{/each}
						{#if filteredInlineGroups.length === 0}
							<p class="rm-picker-empty">{t('ui.no-matches', { query: rmPickerSearch })}</p>
						{/if}
					</div>
				</div>
			{/if}
			<textarea
				id="prerequisite-text"
				class="field-input resize-none"
				rows="3"
				bind:value={data.prerequisiteText}
				bind:this={prerequisiteTextEl}
			></textarea>
		</section>
	{/if}

	<section>
		<label class="field-label" for="body-text">{t('ui.form-text')}</label>
		<div class="markup-toolbar">
			<button type="button" class="markup-btn" title={t('ui.form-bold')} onclick={() => wrapSelection(bodyTextEl, '**', 'bodyText')}>B</button>
			<button type="button" class="markup-btn italic" title={t('ui.form-italic')} onclick={() => wrapSelection(bodyTextEl, '*', 'bodyText')}>I</button>
			<button type="button" class="markup-btn" class:active={data.smallBodyText} title={t('ui.form-small-text')} onclick={() => data.smallBodyText = !data.smallBodyText}>A↓</button>
			<button type="button" class="markup-btn" title={t('ui.form-insert-runemark')} onclick={() => { rmPickerFor = rmPickerFor === 'bodyText' ? null : 'bodyText'; rmPickerSearch = ''; }}>[⊕]</button>
		</div>
		{#if rmPickerFor === 'bodyText'}
			<div class="rm-picker">
				<input class="rm-picker-search" type="text" placeholder={t('ui.form-filter-runemarks')} bind:value={rmPickerSearch} bind:this={rmPickerSearchEl} />
				<div class="rm-picker-list">
					{#each filteredInlineGroups as group}
						<div class="rm-picker-group">{group.label}</div>
						{#each group.items as opt}
							<button type="button" class="rm-picker-item" onclick={() => insertRunemark(opt.slug, 'bodyText')}>
								<span class="rm-picker-slug">[{opt.slug}]</span>{opt.label}
							</button>
						{/each}
					{/each}
					{#if filteredInlineGroups.length === 0}
						<p class="rm-picker-empty">{t('ui.no-matches', { query: rmPickerSearch })}</p>
					{/if}
				</div>
			</div>
		{/if}
		<textarea
			id="body-text"
			class="field-input resize-none"
			rows="8"
			bind:value={data.bodyText}
			bind:this={bodyTextEl}
		></textarea>
	</section>

</div>

<style>
	.two-col {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}

	@media (max-width: 1023px) {
		.two-col {
			grid-template-columns: 1fr;
			row-gap: 28px;
		}
	}

	.field-label {
		display: block;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ui-field-label);
		margin-bottom: 0.375rem;
	}

	.sublabel {
		display: block;
		font-size: 0.65rem;
		color: var(--ui-field-label);
		margin-bottom: 2px;
	}

	.points-row {
		display: flex;
		gap: 12px;
	}

	.points-field {
		flex: 1;
	}

	.markup-toolbar {
		display: flex;
		gap: 4px;
		margin-bottom: 4px;
	}

	.markup-btn {
		font-size: 0.8rem;
		font-weight: 700;
		line-height: 1;
		padding: 3px 8px;
		border-radius: 4px;
		border: 1px solid var(--ui-border);
		background: var(--ui-surface);
		color: var(--ui-text);
		cursor: pointer;
	}

	.markup-btn.italic {
		font-style: italic;
	}

	.markup-btn.active {
		background: #7f1d1d;
		border-color: #7f1d1d;
		color: #fff;
	}

	.markup-btn:hover {
		border-color: #7f1d1d;
	}

	.rm-picker {
		margin-bottom: 4px;
		border: 1px solid var(--ui-border);
		border-radius: 6px;
		overflow: hidden;
		background: var(--ui-surface);
	}

	.rm-picker-search {
		width: 100%;
		box-sizing: border-box;
		padding: 6px 10px;
		border: 0;
		border-bottom: 1px solid var(--ui-border);
		background: var(--ui-surface);
		color: var(--ui-text);
		font-size: 0.875rem;
		outline: none;
	}

	.rm-picker-list {
		max-height: 180px;
		overflow-y: auto;
	}

	.rm-picker-group {
		padding: 4px 10px 2px;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--ui-text-dim);
		background: var(--ui-surface-2);
	}

	.rm-picker-item {
		display: block;
		width: 100%;
		text-align: left;
		padding: 5px 10px;
		font-size: 0.8rem;
		color: var(--ui-text);
		background: transparent;
		border: 0;
		cursor: pointer;
	}

	.rm-picker-item:hover {
		background: var(--ui-surface-2);
	}

	.rm-picker-slug {
		font-family: monospace;
		font-size: 0.75rem;
		color: var(--ui-text-dim);
		margin-right: 4px;
	}

	.rm-picker-empty {
		padding: 8px 10px;
		font-size: 0.8rem;
		color: var(--ui-text-dim);
	}

	.field-input {
		width: 100%;
		box-sizing: border-box;
		appearance: none;
		background: var(--ui-surface);
		border: 1px solid var(--ui-border);
		border-radius: 6px;
		padding: 6px 10px;
		color: var(--ui-text);
		font-size: 1rem;
		outline: none;
		transition: border-color 0.15s;
	}

	.field-input:focus {
		border-color: #7f1d1d;
	}

	@media (max-width: 1023px) {
		.markup-btn {
			font-size: 1rem;
			padding: 12px 20px;
		}
	}
</style>
