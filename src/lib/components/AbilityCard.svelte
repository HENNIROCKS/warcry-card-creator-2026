<script lang="ts">
	import type { AbilityCardData } from '$lib/types';
	import { getAllianceSvg, getFactionSvg, getSubfactionSvg, PLACEHOLDER_SVG } from '$lib/runemarks/index';
	import maskSvgRaw from '$lib/image-mask.svg?raw';
	import runemarkShapeRaw from '$lib/runemark-shape.svg?raw';

	const maskUrl = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(maskSvgRaw)}")`;
	const runemarkMaskUrl = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(runemarkShapeRaw)}")`;

	let { data, printerFriendly = false }: { data: AbilityCardData; printerFriendly?: boolean } = $props();

	function parseMarkup(text: string): string {
		return text
			.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
			.replace(/\*(.+?)\*/g, '<em>$1</em>');
	}

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

		{#if printerFriendly}
			<svg class="torn-edge-overlay" viewBox="-0.17 -0.23 1055.53 872.02" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
				<g transform="matrix(9.24671 0 0 13.6712 -.002 0)">
					<path vector-effect="non-scaling-stroke" fill="none" stroke="black" stroke-width="1.5" fill-rule="nonzero" d="M113.72 61.34c-.27.424-1.22.216-1.496.51-.07.076-.216 1.73-.59.69-.266.73-3.614.576-4.44.74.96.776-.63.296-1.02.16.204-.094.416-.196.62-.29-.614-.476-1.126-.18-1.82-.104-.9.094-1.76-.104-2.62-.03-.806.076-1.386.314-2.19.27-1.046-.06-2.24-.21-3.23-.524-1.484-.466-2.906-.594-4.484-.55-.834.024-1.406.44-2.186.59-1.06.21-2.34.076-3.406-.05-.844-.1-1.626-.344-2.47-.216-.746.116-1.04.51-1.924.19-.25-.09-.61-.46-.82-.5-.334-.064-1.156.174-1.504.234-.86.146-1.614.384-2.5.4-.916.016-1.734-.304-2.58-.336-.75-.03-1.556.31-2.33.314-1.99.01-3.924-.04-5.924.02-1.484.046-3.594-.33-4.994.046-.454.12-.446.35-.924.344-.07 0 .04-.284-.186-.35-.41-.12-.93-.04-1.344-.046-1.906-.016-3.924.234-5.774-.29-.796-.226-1.476-.67-2.354-.6-.24.02-.494.01-.72.1-.296.116-.19.476-.31.54-1.414.756-3.97.204-5.56.344-.97.086-1.966.32-2.94.326-.744 0-1.534-.44-2.14-.376-.506.054-.86.43-1.47.436-.7.006-1.076-.3-1.696-.436-.71-.156-1.64-.094-2.35.064-.914.204-1.88 1-2.86.744-.376-.1-.476-.34-.79-.47-.61-.256-1.016-.216-1.7-.256-.83-.046-1.54-.03-2.364.02-.906.054-1.36-.344-2.144-.396-.734-.046-.246.16-.77.274-.606.134-1.214.116-1.856.12-1.22.006-2.434-.02-3.656-.054-1.106-.03-2.23.33-3.324.16-.984-.156-1.38-.604-2.48-.61-1.044-.006-1.366.296-2.22.884-.044-.28-.096-.56-.14-.84-.81.74-1.456-.06-2.416.024-.7.06-1.08.634-1.924.424-.37-.09-1.214-.896-1.73-.77-.614.146-.61.906-1.216.646-.416-.716-.54-.406-1.26-.116-.256-.564-.854-1.204-.26-1.59-.786-.42-.536-3.196-.53-4.05.006-.69.19-1.354.166-2.05-.016-.366-.03-.77-.146-1.12-.13-.4.06-.966-.39-.314-.104-.41.01-.73.074-1.134.154.18.304.36.46.534-.03-1.196.01-2.436-.11-3.6-.13-1.25-.19-2.39.12-3.64.46-1.854.386-3.314-.01-5.14-.276-1.26.256-2.554.256-3.796 0-.594-.31-1.11-.26-1.7.056-.604.34-1.024.336-1.64-.01-1.01-.376-1.964-.33-2.99.02-.454.21-.864.244-1.29.046-.52-.214-1.12-.22-1.656-.04-2.376-.066-4.766-.026-7.144.01-.64-.256-1.226-.27-1.766 0-.1.244-.76.27-.914.114-.734 0-1.574 0-2.32 0-1.21.294-2.164.54-3.33.21-.99-.28-1.28-.53-2.064-.37-1.17.016-2.77-.11-4.01-.136-1.32.09-2.47.09-3.75a.8.8 0 0 1-.156.14c.27-.426 1.22-.214 1.496-.51.07-.074.216-1.73.59-.69.266-.73 3.616-.574 4.44-.74-.96-.776.63-.294 1.02-.16-.206.094-.416.194-.62.29.616.476 1.126.18 1.82.104.9-.094 1.76.104 2.62.03.804-.074 1.384-.316 2.19-.27 1.044.06 2.24.21 3.23.526 1.484.464 2.906.594 4.484.55.836-.024 1.406-.44 2.184-.59 1.06-.21 2.34-.074 3.406.05.844.1 1.626.344 2.47.216.746-.114 1.04-.51 1.926-.19.25.09.61.46.82.5.336.064 1.156-.176 1.506-.236.86-.146 1.616-.386 2.5-.4.914-.016 1.734.306 2.58.336.75.03 1.554-.31 2.33-.314 1.99-.01 3.924.04 5.924-.02 1.484-.046 3.594.33 4.994-.046.454-.12.446-.35.924-.344.07 0-.04.286.186.35.41.12.93.04 1.344.046 1.906.016 3.924-.234 5.774.29.796.226 1.476.67 2.354.6.24-.02.494-.01.72-.1.296-.114.19-.476.31-.54 1.416-.756 3.97-.204 5.56-.344.97-.084 1.966-.32 2.94-.326.746 0 1.534.44 2.14.376.504-.056.86-.43 1.47-.434.7-.006 1.076.3 1.694.434.71.156 1.64.094 2.35-.064.916-.204 1.88-1 2.86-.744.376.1.474.34.79.47.61.256 1.016.214 1.7.256.83.046 1.54.03 2.364-.02.906-.056 1.36.344 2.144.396.734.044.246-.16.77-.276.606-.136 1.216-.114 1.856-.12 1.22-.006 2.436.02 3.656.056 1.106.03 2.23-.33 3.326-.16.984.156 1.38.604 2.48.61 1.046.004 1.364-.294 2.22-.886l.14.84c.81-.74 1.454.06 2.416-.024.7-.06 1.08-.636 1.924-.426.37.09 1.216.896 1.73.77.614-.146.61-.906 1.216-.646.416.716.54.406 1.26.114.254.564.856 1.206.26 1.59.784.42.534 3.194.53 4.05-.004.69-.19 1.356-.166 2.05.016.366.03.77.144 1.12.13.4-.06.964.39.314.106.41-.01.73-.076 1.134-.156-.18-.306-.36-.46-.536.03 1.196-.01 2.436.11 3.6.13 1.26.19 2.37-.12 3.64-.24.976-.376 1.73-.356 2.726.02 1.06.284 1.96.364 2.98.094 1.25-.416 2.55-.246 3.766.084.61.31.89.174 1.524-.12.574-.26.676-.26 1.28.01 1.18.504 2.3.314 3.504-.16 1.016 0 1.896-.04 2.946-.046 1.19.05 2.35.056 3.546.004 1.216-.216 2.674.004 3.87.03.174.18.44.18.594.004.19-.1.436-.1.57 0 1.19-.06 2.436-.09 3.634-.03 1.116-.87 2.62-.584 3.674.08.29.33.47.416.696.19.494.166.954.166 1.494.02 2.14.056 4.57.174 6.564z"/>
				</g>
			</svg>
		{/if}
	</div>

	<!-- PARCHMENT -->
	<div class="parchment">
		<h1 class="ability-name">{#each (data.name || 'CARD NAME').split('|') as part, i}{#if i > 0}<br>{/if}{part}{/each}</h1>
		{#if data.flavorText}
			<p class="flavor-text">{data.flavorText}</p>
		{/if}
		{#if data.bodyText}
			<p class="body-text">{@html parseMarkup(data.bodyText)}</p>
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
		overflow: hidden;
		display: flex;
		flex-direction: column;
		background: url('/background.jpg') center center / cover no-repeat;
		border: 0;
		outline: none;
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
		padding: 7px 13px;
		color: #FAF6F3;
		font-family: 'Alegreya', serif;
		font-weight: 400;
		font-size: 15px;

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
		bottom: 60px;
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

	.body-text :global(strong),
	.body-text :global(em) {
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

	.is-printer-friendly .image-section {
		overflow: hidden;
	}

	.torn-edge-overlay {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
</style>
