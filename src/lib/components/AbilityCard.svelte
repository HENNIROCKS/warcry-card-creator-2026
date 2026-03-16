<script lang="ts">
	import type { AbilityCardData } from '$lib/types';
	import { getAllianceSvg, getFactionSvg, getSubfactionSvg, PLACEHOLDER_SVG } from '$lib/runemarks/index';
	import maskSvgRaw from '$lib/image-mask.svg?raw';
	import runemarkShapeRaw from '$lib/runemark-shape.svg?raw';

	const maskUrl = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(maskSvgRaw)}")`;
	const runemarkMaskUrl = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(runemarkShapeRaw)}")`;

	let { data, printerFriendly = false }: { data: AbilityCardData; printerFriendly?: boolean } = $props();

	const activationLabels: Record<string, string> = {
		double: 'DOUBLE',
		triple: 'TRIPLE',
		quad: 'QUAD',
	};
</script>

<div class="card" class:is-printer-friendly={printerFriendly}>

	<!-- IMAGE SECTION -->
	<div class="image-section">
		<div class="image-inner" style="mask-image: {maskUrl}; -webkit-mask-image: {maskUrl}; mask-size: 100% 100%; -webkit-mask-size: 100% 100%; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat;"></div>

		{#if data.showRunemarks && (data.grandAlliance || data.faction || data.bladeborn || data.fighterRunemarks.length > 0 || data.activationType)}
			<div class="runemarks-row">
				{#if data.grandAlliance}
					<div class="runemark-border" style="mask-image: {runemarkMaskUrl}; -webkit-mask-image: {runemarkMaskUrl}; mask-size: 100% 100%; -webkit-mask-size: 100% 100%; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat;">
						<div class="runemark-badge" style="mask-image: {runemarkMaskUrl}; -webkit-mask-image: {runemarkMaskUrl}; mask-size: 100% 100%; -webkit-mask-size: 100% 100%; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat;">
							{@html getAllianceSvg(data.grandAlliance) ?? PLACEHOLDER_SVG}
						</div>
					</div>
				{/if}
				{#if data.grandAlliance && data.faction}
					<div class="runemark-border" style="mask-image: {runemarkMaskUrl}; -webkit-mask-image: {runemarkMaskUrl}; mask-size: 100% 100%; -webkit-mask-size: 100% 100%; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat;">
						<div class="runemark-badge" style="mask-image: {runemarkMaskUrl}; -webkit-mask-image: {runemarkMaskUrl}; mask-size: 100% 100%; -webkit-mask-size: 100% 100%; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat;">
							{@html getFactionSvg(data.grandAlliance, data.faction) ?? PLACEHOLDER_SVG}
						</div>
					</div>
				{/if}
				{#if data.grandAlliance && data.faction && data.bladeborn}
					<div class="runemark-border" style="mask-image: {runemarkMaskUrl}; -webkit-mask-image: {runemarkMaskUrl}; mask-size: 100% 100%; -webkit-mask-size: 100% 100%; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat;">
						<div class="runemark-badge" style="mask-image: {runemarkMaskUrl}; -webkit-mask-image: {runemarkMaskUrl}; mask-size: 100% 100%; -webkit-mask-size: 100% 100%; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat;">
							{@html getSubfactionSvg(data.grandAlliance, data.faction, data.bladeborn) ?? PLACEHOLDER_SVG}
						</div>
					</div>
				{/if}
				{#each data.fighterRunemarks as rm}
					<div class="runemark-border" style="mask-image: {runemarkMaskUrl}; -webkit-mask-image: {runemarkMaskUrl}; mask-size: 100% 100%; -webkit-mask-size: 100% 100%; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat;">
						<div class="runemark-badge" style="mask-image: {runemarkMaskUrl}; -webkit-mask-image: {runemarkMaskUrl}; mask-size: 100% 100%; -webkit-mask-size: 100% 100%; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat;">
							{@html rm.svg}
						</div>
					</div>
				{/each}
				{#if data.activationType}
					<div class="runemark-border" style="mask-image: {runemarkMaskUrl}; -webkit-mask-image: {runemarkMaskUrl}; mask-size: 100% 100%; -webkit-mask-size: 100% 100%; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat;">
						<div class="runemark-badge" style="mask-image: {runemarkMaskUrl}; -webkit-mask-image: {runemarkMaskUrl}; mask-size: 100% 100%; -webkit-mask-size: 100% 100%; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat;">
							<span class="activation-text">{activationLabels[data.activationType]}</span>
						</div>
					</div>
				{/if}
			</div>
		{/if}

		{#if !data.showRunemarks}
			<div class="pills-row">
				{#if data.grandAlliance}<div class="runemark-pill">{data.grandAlliance}</div>{/if}
				{#if data.faction}<div class="runemark-pill">{data.faction}</div>{/if}
				{#if data.bladeborn}<div class="runemark-pill">{data.bladeborn}</div>{/if}
				{#each data.fighterRunemarks as rm}
					<div class="runemark-pill">{rm.label}</div>
				{/each}
				{#if data.activationType}
					<div class="runemark-pill">{activationLabels[data.activationType]}</div>
				{/if}
			</div>
		{/if}

		<div class="card-type-area">
			{#if data.cardLabel}
				<div class="card-label-text">{data.cardLabel}</div>
			{/if}
		</div>
	</div>

	<!-- PARCHMENT -->
	<div class="parchment">
		<h1 class="ability-name">{data.name || 'ABILITY NAME'}</h1>
		{#if data.flavorText}
			<p class="flavor-text">{data.flavorText}</p>
		{/if}
		{#if data.bodyText}
			<p class="body-text">{data.bodyText}</p>
		{/if}
	</div>

</div>

<style>
	/* ── CARD BASE ──────────────────────────────── */

	*, *::before, *::after {
		border: 0;
		outline: none;
		box-sizing: border-box;
	}

	.card {
		width: 574px;
		height: 915px;
		position: relative;
		display: flex;
		flex-direction: column;
		background: url('/background.jpg') center center / cover no-repeat;
		border: 0;
		outline: none;
		overflow: hidden;
	}

	/* ── IMAGE SECTION ─────────────────────────── */

	.image-section {
		flex: 0 0 280px;
		margin: 5px 5px 0;
		position: relative;
		border: 0;
		outline: none;
		background: transparent;
	}

	.image-inner {
		position: absolute;
		inset: 0;
		background: #5a0a14;
		mask-size: 100% 100%;
		mask-repeat: no-repeat;
		-webkit-mask-size: 100% 100%;
		-webkit-mask-repeat: no-repeat;
		border: 0;
		outline: none;
	}

	.pills-row {
		position: absolute;
		top: 20px;
		left: 0;
		right: 0;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 6px;
		border: 0;
		outline: none;
		background: transparent;
	}

	.runemark-pill {
		background: #5a0a14;
		border: 1px solid #FAF6F3;
		border-radius: 20px;
		padding: 5px 10px;
		color: #FAF6F3;
		font-family: 'Germania One', serif;
		font-weight: 400;
		font-size: 13px;

		text-transform: uppercase;
		text-align: center;
		line-height: 1.3;
		outline: none;
	}

	.runemarks-row {
		position: absolute;
		top: 20px;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		gap: 12px;
		border: 0;
		outline: none;
		background: transparent;
	}

	.runemark-border {
		width: 78px;
		height: 78px;
		background: #FAF6F3;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 0;
		outline: none;
	}

	.runemark-badge {
		width: 76px;
		height: 76px;
		background: #5a0a14;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 0;
		outline: none;
	}

	.runemark-badge :global(svg),
	.runemark-badge :global(svg *) {
		fill: #FAF6F3;
	}

	.runemark-badge :global(svg) {
		width: 56px;
		height: 56px;
		border: 0;
		outline: none;
		background: transparent;
	}

	.card-type-area {
		position: absolute;
		bottom: 80px;
		left: 0;
		right: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		border: 0;
		outline: none;
		background: transparent;
	}

	.activation-text {
		font-family: 'Germania One', serif;
		font-size: 24px;
		font-weight: 400;
		color: #FAF6F3;

		text-transform: uppercase;
		text-align: center;
		line-height: 1.2;
		border: 0;
		outline: none;
		background: transparent;
	}

	.card-label-text {
		font-family: 'Germania One', serif;
		font-size: 28px;
		font-weight: 400;
		color: #FAF6F3;

		text-transform: uppercase;
		white-space: nowrap;
		border: 0;
		outline: none;
		background: transparent;
	}

	/* ── PARCHMENT ──────────────────────────────── */

	.parchment {
		flex: 1 1 0;
		padding: 29px 38px 38px;
		display: flex;
		flex-direction: column;
		gap: 20px;
		border: 0;
		outline: none;
		background: transparent;
	}

	.ability-name {
		font-family: 'Germania One', serif;
		font-weight: 600;
		font-size: 42px;
		text-transform: uppercase;
		color: #000;

		line-height: 1.1;
		margin: 0;
		text-align: center;
		border: 0;
		outline: none;
		background: transparent;
	}

	.flavor-text {
		font-family: 'Alegreya', serif;
		font-size: 18px;
		font-style: italic;
		color: #3a2a1a;
		line-height: 1.5;
		margin: 0;
		text-align: left;
		border: 0;
		outline: none;
		background: transparent;
	}

	.body-text {
		font-family: 'Alegreya', serif;
		font-size: 20px;
		color: #000;
		line-height: 1.55;
		margin: 0;
		text-align: left;
		white-space: pre-wrap;
		border: 0;
		outline: none;
		background: transparent;
	}

	/* ── PRINTER-FRIENDLY ───────────────────────── */

	.is-printer-friendly {
		background: #fff;
	}

	.is-printer-friendly .image-inner {
		background: #fff;
		mask: none !important;
		-webkit-mask: none !important;
		border: 0;
	}

	.is-printer-friendly .runemark-border {
		background: #000;
	}

	.is-printer-friendly .runemark-badge {
		background: #fff;
	}

	.is-printer-friendly .runemark-badge :global(svg),
	.is-printer-friendly .runemark-badge :global(svg *) {
		fill: #000 !important;
	}

	.is-printer-friendly .runemark-pill {
		background: #fff;
		border-color: #000;
		color: #000;
	}

	.is-printer-friendly .activation-text {
		color: #000;
	}

	.is-printer-friendly .card-label-text {
		color: #000;
	}

	.is-printer-friendly .ability-name,
	.is-printer-friendly .flavor-text,
	.is-printer-friendly .body-text {
		color: #000;
	}
</style>
