<script lang="ts">
	import type { AbilityCardData } from '$lib/types';
	import { fighterRunemarks } from '$lib/runemarks/index';
	import { t } from '$lib/i18n/index.svelte';
	import FactionSelect from './FactionSelect.svelte';

	let { data }: { data: AbilityCardData } = $props();

	let rmKeys = $state(['', '']);
	let bodyTextEl: HTMLTextAreaElement;

	const presetLabels = ['ability', 'reaction', 'heroic-trait', 'battle-trait', 'lesser-artefact', 'greater-artefact'];
	let selectValue = $state(presetLabels.includes(data.cardLabel) ? data.cardLabel : '__custom__');
	let customText = $state(presetLabels.includes(data.cardLabel) ? '' : data.cardLabel);

	$effect(() => {
		data.cardLabel = selectValue === '__custom__' ? customText : selectValue;
	});

	function wrapSelection(el: HTMLTextAreaElement, marker: string) {
		const start = el.selectionStart;
		const end = el.selectionEnd;
		const selected = data.bodyText.slice(start, end);
		data.bodyText = data.bodyText.slice(0, start) + marker + selected + marker + data.bodyText.slice(end);
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

	<!-- Card Type -->
	<section>
		<label class="field-label" for="card-label">{t('ui.form-type')} <span class="normal-case font-normal text-zinc-500">({t('ui.form-select')})</span> {#if selectValue === '__custom__'}<span class="normal-case font-normal text-zinc-500">{customText.length}/30</span>{/if}</label>
		<select id="card-label" class="field-input" bind:value={selectValue}>
			<option value="ability">{t('card.label-ability')}</option>
			<option value="reaction">{t('card.label-reaction')}</option>
			<option value="heroic-trait">{t('card.label-heroic-trait')}</option>
			<option value="battle-trait">{t('card.label-battle-trait')}</option>
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

	<!-- Card Name -->
	<section>
		<label class="field-label" for="ability-name">{t('ui.form-card')} <span class="normal-case font-normal text-zinc-500">{t('ui.form-line-break-hint')}</span></label>
		<input
			id="ability-name"
			class="field-input"
			type="text"
			placeholder={t('card.card-name-placeholder')}
			bind:value={data.name}
		/>
	</section>

	<!-- Show Runemarks -->
	<section>
		<label class="flex cursor-pointer items-center gap-3">
			<input type="checkbox" bind:checked={data.showRunemarks} class="h-4 w-4 rounded accent-red-800" />
			<span class="text-zinc-200">{t('ui.form-show-runemarks')}</span>
		</label>
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
						{#each Object.keys(fighterRunemarks) as name}
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
	</section>

	<!-- Activation -->
	<section>
		<label class="field-label" for="activation">{t('ui.form-activation')}</label>
		<select id="activation" class="field-input" bind:value={data.activationType}>
			<option value={null}>—</option>
			<option value="double">{t('card.activation-double')}</option>
			<option value="triple">{t('card.activation-triple')}</option>
			<option value="quad">{t('card.activation-quad')}</option>
		</select>
	</section>


	<!-- Flavor Text -->
	<section>
		<label class="field-label" for="flavor-text">{t('ui.form-flavor-text')} <span class="normal-case font-normal text-zinc-500">({t('ui.form-italic-optional')})</span></label>
		<textarea
			id="flavor-text"
			class="field-input resize-none"
			rows="3"
			bind:value={data.flavorText}
		></textarea>
	</section>

	<!-- Body Text -->
	<section>
		<label class="field-label" for="body-text">{t('ui.form-text')}</label>
		<div class="markup-toolbar">
			<button type="button" class="markup-btn" title={t('ui.form-bold')} onclick={() => wrapSelection(bodyTextEl, '**')}>B</button>
			<button type="button" class="markup-btn italic" title={t('ui.form-italic')} onclick={() => wrapSelection(bodyTextEl, '*')}>I</button>
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
		font-size: 0.875rem;
		outline: none;
		transition: border-color 0.15s;
	}

	.field-input:focus {
		border-color: #7f1d1d;
	}

	@media (max-width: 1023px) {
		.field-input {
			font-size: 1rem;
		}

		.markup-btn {
			font-size: 1rem;
			padding: 12px 20px;
		}
	}
</style>
