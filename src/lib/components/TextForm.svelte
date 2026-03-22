<script lang="ts">
	import type { TextCardData } from '$lib/types';
	import { fighterRunemarks } from '$lib/runemarks/index';
	import { t, i18n } from '$lib/i18n/index.svelte';
	import FactionSelect from './FactionSelect.svelte';

	let { data }: { data: TextCardData } = $props();

	let rmKeys = $state(['', '']);
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
		<label class="field-label" for="card-name">{t('ui.form-card')} <span class="normal-case font-normal text-zinc-500">{t('ui.form-line-break-hint')}</span></label>
		<input
			id="card-name"
			class="field-input"
			type="text"
			placeholder={t('card.card-name-placeholder')}
			bind:value={data.name}
		/>
		<label class="field-label mt-2" for="card-label">{t('ui.form-type')} <span class="normal-case font-normal text-zinc-500">({t('ui.form-select')})</span> {#if selectValue === '__custom__'}<span class="normal-case font-normal text-zinc-500">{customText.length}/30</span>{/if}</label>
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
	</section>

	<!-- Card Elements -->
	<section>
		<p class="field-label mb-2">{t('ui.form-card-elements')}</p>
		<div class="flex flex-col gap-3">
			<label class="flex cursor-pointer items-center gap-3">
				<input type="checkbox" bind:checked={data.showRunemarks} class="h-4 w-4 rounded accent-red-800" />
				<span class="text-zinc-200">{t('ui.form-show-runemarks')}</span>
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
		</div>
	</section>

	<!-- Runemarks -->
	<section>
		<p class="field-label mb-2">{t('ui.form-runemarks')}</p>
		<FactionSelect {data} />
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
			</div>
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
		</div>
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

	.markup-btn:hover {
		border-color: #7f1d1d;
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
