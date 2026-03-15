<script lang="ts">
	import type { FighterCardData } from '$lib/types';
	import { weaponRunemarks, characteristicRunemarks, getAllianceSvg, getFactionSvg, getSubfactionSvg, PLACEHOLDER_SVG } from '$lib/runemarks/index';
	import maskSvgRaw from '$lib/image-mask.svg?raw';
	import runemarkShapeRaw from '$lib/runemark-shape.svg?raw';

	const maskUrl = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(maskSvgRaw)}")`;
	const runemarkMaskUrl = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(runemarkShapeRaw)}")`;

	let { data, printerFriendly = false }: { data: FighterCardData; printerFriendly?: boolean } = $props();

	function fittext(node: HTMLElement, _value?: unknown) {
		function fit() {
			node.style.fontSize = '';
			const max = node.clientWidth;
			let size = parseFloat(getComputedStyle(node).fontSize);
			while (node.scrollWidth > max && size > 8) {
				size -= 0.5;
				node.style.fontSize = `${size}px`;
			}
		}
		fit();
		const ro = new ResizeObserver(fit);
		ro.observe(node);
		return { update: () => requestAnimationFrame(fit), destroy: () => ro.disconnect() };
	}
</script>

<div class="card" class:is-monster={data.isMonster} class:is-printer-friendly={printerFriendly}>
	<!-- IMAGE SECTION -->
	<div class="image-section">
		<div class="image-inner" style="mask-image: {maskUrl}; -webkit-mask-image: {maskUrl};">
			{#if data.modelImage}
				<img class="model-img" src={data.modelImage} alt="Fighter" style="object-position: {data.imageOffsetX}% {data.imageOffsetY}%; transform: scale({data.imageZoom}); transform-origin: {data.imageOffsetX}% {data.imageOffsetY}%" />
			{:else}
				<div class="model-placeholder">
					<span>Upload model image</span>
				</div>
			{/if}
		</div>

	<div class="image-bottom">
		{#if !data.showRunemarks}
			<div class="pills-row">
				{#if data.grandAlliance}<div class="runemark-pill">{data.grandAlliance}</div>{/if}
				{#if data.faction}<div class="runemark-pill">{data.faction}</div>{/if}
				{#if data.bladeborn}<div class="runemark-pill">{data.bladeborn}</div>{/if}
				{#if data.rightRunemarks.length > 0}
					<div class="pills-break"></div>
					{#each data.rightRunemarks as rm}
						<div class="runemark-pill">{rm.label}</div>
					{/each}
				{/if}
			</div>
		{/if}
	</div>
	</div>

	<!-- RUNEMARKS (card-level so they never get clipped) -->
	{#if data.showRunemarks}
		<div class="runemarks runemarks-left">
			{#if data.grandAlliance}
				<div class="runemark-border" style="mask-image: {runemarkMaskUrl}; -webkit-mask-image: {runemarkMaskUrl}; mask-size: 100% 100%; -webkit-mask-size: 100% 100%; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat;"><div class="runemark-badge" style="mask-image: {runemarkMaskUrl}; -webkit-mask-image: {runemarkMaskUrl}; mask-size: 100% 100%; -webkit-mask-size: 100% 100%; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat;">{@html getAllianceSvg(data.grandAlliance) ?? PLACEHOLDER_SVG}</div></div>
			{/if}
			{#if data.grandAlliance && data.faction}
				<div class="runemark-border" style="mask-image: {runemarkMaskUrl}; -webkit-mask-image: {runemarkMaskUrl}; mask-size: 100% 100%; -webkit-mask-size: 100% 100%; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat;"><div class="runemark-badge" style="mask-image: {runemarkMaskUrl}; -webkit-mask-image: {runemarkMaskUrl}; mask-size: 100% 100%; -webkit-mask-size: 100% 100%; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat;">{@html getFactionSvg(data.grandAlliance, data.faction) ?? PLACEHOLDER_SVG}</div></div>
			{/if}
			{#if data.grandAlliance && data.faction && data.bladeborn}
				<div class="runemark-border" style="mask-image: {runemarkMaskUrl}; -webkit-mask-image: {runemarkMaskUrl}; mask-size: 100% 100%; -webkit-mask-size: 100% 100%; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat;"><div class="runemark-badge" style="mask-image: {runemarkMaskUrl}; -webkit-mask-image: {runemarkMaskUrl}; mask-size: 100% 100%; -webkit-mask-size: 100% 100%; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat;">{@html getSubfactionSvg(data.grandAlliance, data.faction, data.bladeborn) ?? PLACEHOLDER_SVG}</div></div>
			{/if}
		</div>

		<div class="runemarks runemarks-right">
			{#each data.rightRunemarks as rm}
				<div class="runemark-border" style="mask-image: {runemarkMaskUrl}; -webkit-mask-image: {runemarkMaskUrl}; mask-size: 100% 100%; -webkit-mask-size: 100% 100%; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat;"><div class="runemark-badge" style="mask-image: {runemarkMaskUrl}; -webkit-mask-image: {runemarkMaskUrl}; mask-size: 100% 100%; -webkit-mask-size: 100% 100%; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat;">{@html rm.svg}</div></div>
			{/each}
		</div>
	{/if}

	<!-- PARCHMENT SECTION -->
	<div class="parchment">
		<h1 class="fighter-name">
			{#if data.isNamedCharacter}<span class="chevron">«</span>{/if}
			{data.name || 'FIGHTER NAME'}
			{#if data.isNamedCharacter}<span class="chevron">»</span>{/if}
		</h1>
		{#if data.subtitle}
			<p class="fighter-subtitle">{data.subtitle}</p>
		{/if}

		<!-- Characteristics box -->
		<div class="stats-box">
			<div class="stats-header">
				<div class="stat-col label-col"><span>BASE</span><span>SIZE</span></div>
				<div class="stat-col label-col"><span>POINTS</span><span>VALUE</span></div>
				<div class="stat-col label-col">{#if data.showRunemarks}<span class="header-runemark">{@html characteristicRunemarks.move}</span>{:else}<span class="header-text">MOVE</span>{/if}</div>
				<div class="stat-col label-col">{#if data.showRunemarks}<span class="header-runemark">{@html characteristicRunemarks.toughness}</span>{:else}<span class="header-text">TOUGHNESS</span>{/if}</div>
				<div class="stat-col label-col">{#if data.showRunemarks}<span class="header-runemark">{@html characteristicRunemarks.wounds}</span>{:else}<span class="header-text">WOUNDS</span>{/if}</div>
			</div>
			<div class="stats-values">
				<div class="stat-val" class:stat-val-narrow={data.baseSize.includes('×')} use:fittext={data.baseSize}>{data.baseSize}</div>
				<div class="stat-val" use:fittext={data.points}>{data.points}</div>
				<div class="stat-val" use:fittext={data.move}>{data.isMonster ? '*' : data.move}</div>
				<div class="stat-val" use:fittext={data.toughness}>{data.toughness}</div>
				<div class="stat-val" use:fittext={data.wounds}>{data.wounds}</div>
			</div>
		</div>

		<!-- Weapons box -->
		<div class="weapons-box">
			<div class="weapons-header">
				<div class="wcol label-col"></div>
				<div class="wcol label-col">{#if data.showRunemarks}<span class="header-runemark">{@html characteristicRunemarks.range}</span>{:else}<span class="header-text">RANGE</span>{/if}</div>
				<div class="wcol label-col">{#if data.showRunemarks}<span class="header-runemark">{@html characteristicRunemarks.attacks}</span>{:else}<span class="header-text">ATTACKS</span>{/if}</div>
				<div class="wcol label-col">{#if data.showRunemarks}<span class="header-runemark">{@html characteristicRunemarks.strength}</span>{:else}<span class="header-text">STRENGTH</span>{/if}</div>
				<div class="wcol label-col">{#if data.showRunemarks}<span class="header-runemark">{@html characteristicRunemarks.damage}</span>{:else}<span class="header-text">DAMAGE</span>{/if}</div>
			</div>
			{#each data.weapons as weapon}
				<div class="weapon-row">
					<div class="wcol">
						<div class="weapon-art-placeholder">
							{#if data.showRunemarks && weapon.name}
								<span class="weapon-runemark">{@html weaponRunemarks[weapon.name]}</span>
							{:else}
								<span class="weapon-name" use:fittext={weapon.name}>{weapon.name || '—'}</span>
							{/if}
						</div>
					</div>
					<div class="wcol weapon-val" class:is-empty={!weapon.range} use:fittext={weapon.range}>{weapon.range || "—"}</div>
					<div class="wcol weapon-val" class:is-empty={!weapon.attacks} use:fittext={weapon.attacks}>{weapon.attacks || "—"}</div>
					<div class="wcol weapon-val" class:is-empty={!weapon.strength} use:fittext={weapon.strength}>{weapon.strength || "—"}</div>
					<div class="wcol weapon-val" class:is-empty={!weapon.damage && !data.isMonster} use:fittext={weapon.damage}>{data.isMonster ? '*/*' : (weapon.damage || "—")}</div>
				</div>
			{/each}
		</div>

		<!-- Monster damage brackets -->
		{#if data.isMonster}
			<div class="damage-box">
				<div class="damage-row">
					<div class="dcol dcol-wide">* DAMAGE POINTS ALLOCATED</div>
					<div class="dcol dcol-stat">MOVE</div>
					<div class="dcol dcol-stat">DAMAGE</div>
				</div>
				{#each data.damageBrackets.slice(0, 5) as bracket, i}
					<div class="damage-row" class:damage-row-alt={i % 2 === 0}>
						<div class="dcol dcol-wide">{bracket.damageRange}</div>
						<div class="dcol dcol-stat">{bracket.move}</div>
						<div class="dcol dcol-stat">{bracket.damage}</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
	{#if data.imageCaption}
		<div class="image-caption">{data.imageCaption}</div>
	{/if}
</div>

<style>
	/* 2× scale: 1mm = 7.559px (2 × 96/25.4) */

	/* dom-to-image-more fix: Tailwind preflight sets border-style:solid on *,
	   but drops border-width:0 during serialization → every element gets a
	   UA-default border in the SVG foreignObject context. Reset explicitly. */
	.card * {
		border-width: 0;
		border-style: solid;
		outline: none;
		background: transparent;
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
		flex: 1 1 0;
		min-height: 120px;
		margin: 5px 5px 0;
		position: relative;
		border: 0;
		outline: none;
		background: transparent;
	}

	.image-inner {
		position: absolute;
		inset: 0;
		background: #2a1810;
		mask-size: 100% 100%;
		mask-repeat: no-repeat;
		-webkit-mask-size: 100% 100%;
		-webkit-mask-repeat: no-repeat;
		border: 0;
		outline: none;
	}

	.model-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		border: 0;
		outline: none;
		background: transparent;
	}

	.model-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #5a4030;
		font-family: system-ui, sans-serif;
		font-size: 28px;
	}

	.pills-break {
		width: 100%;
		height: 0;
		border: 0;
		outline: none;
		background: transparent;
	}

	.image-bottom {
		position: absolute;
		bottom: 24px;
		left: 0;
		right: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		border: 0;
		outline: none;
		background: transparent;
	}

	.pills-row {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 6px;
		border: 0;
		outline: none;
		background: transparent;
	}

	.image-caption {
		position: absolute;
		bottom: 20px;
		left: 0;
		right: 0;
		text-align: center;
		font-family: 'Alegreya', serif;
		font-size: 13px;
		color: #000;
		opacity: 0.5;
		border: 0;
		outline: none;
		background: transparent;
	}

	.is-printer-friendly .image-caption {
		opacity: 1;
	}

	.runemarks {
		position: absolute;
		top: 38px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		border: 0;
		outline: none;
		background: transparent;
	}

	.runemarks-left { left: 38px; }
	.runemarks-right { right: 38px; }

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

	/* ── PARCHMENT SECTION ─────────────────────── */

	.parchment {
		flex: 0 0 auto;
		padding: 29px 38px 38px;
		display: flex;
		flex-direction: column;
		gap: 29px;
		border: 0;
		outline: none;
		background: transparent;
	}

	.chevron {
		display: inline;
		border: 0;
		outline: none;
		background: transparent;
	}

	.fighter-name {
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

	.fighter-subtitle {
		display: block;
		width: 100%;
		font-family: 'Germania One', serif;
		font-size: 18px;
		line-height: 1.3;
		color: #000;
		text-align: center;
		margin: -12px 0 0;
		white-space: normal;
		overflow-wrap: break-word;
		border: 0;
		outline: none;
		background: transparent;
	}


	/* ── SHARED BOX STYLE ──────────────────────── */

	.stats-box,
	.weapons-box {
		width: 100%;
		flex-shrink: 0;
		border-radius: 7.5px;
		border: 1px solid #5a0a14;
	}

	.damage-box {
		width: 100%;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		box-shadow: inset 0 1px 0 0 #000, inset 0 -1px 0 0 #000;
		border: 0;
		outline: none;
		background: transparent;
	}

	/* ── CHARACTERISTICS BOX ───────────────────── */

	.stats-header,
	.stats-values {
		display: flex;
		height: 55px;
	}

	.stats-values {
		border-radius: 0 0 6.5px 6.5px;
		background: transparent;
	}

	.stats-header {
		background: #5a0a14;
		border-radius: 6.5px 6.5px 0 0;
		border: 0;
		outline: none;
	}

	.stat-col {
		flex: 0 0 100px;
		width: 100px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 0;
		outline: none;
		background: transparent;
	}


	.label-col {
		flex-direction: column;
		line-height: 1.15;
		font-family: 'Germania One', serif;
		font-size: 18px;
		font-weight: 400;
		font-style: normal;

		text-align: center;
		background: url('/background.jpg') center center / cover no-repeat;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		border: 0;
		outline: none;
	}

	.label-col span {
		border: 0;
		outline: none;
		background: transparent;
	}

	.stat-val {
		flex: 0 0 100px;
		width: 100px;
		font-family: 'Germania One', serif;
		font-size: 34px;
		font-weight: 400;
		color: #000;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		white-space: nowrap;
		padding: 0 10px;
		border: 0;
		outline: none;
		background: transparent;
	}
	.stat-val-narrow {
		font-size: 22px;
	}


	/* ── WEAPONS BOX ───────────────────────────── */

	.weapons-header {
		background: #5a0a14;
		border-radius: 6.5px 6.5px 0 0;
		display: flex;
		height: 55px;
		border: 0;
		outline: none;
	}

	.wcol {
		flex: 0 0 100px;
		width: 100px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 0;
		outline: none;
		background: transparent;
	}


	.weapon-row {
		display: flex;
		align-items: center;
		height: 55px;
		border: 0;
		outline: none;
		background: transparent;
	}

	.weapon-row:nth-child(odd) {
		background: rgba(90, 10, 20, 0.04);
	}

	.weapon-row:last-child {
		border-radius: 0 0 6.5px 6.5px;
	}

	.weapon-art-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4px;
		border: 0;
		outline: none;
		background: transparent;
	}

	.header-text {
		color: #FAF6F3;
		font-family: 'Germania One', serif;
		font-weight: 400;
		font-size: 18px;

		border: 0;
		outline: none;
		background: transparent;
	}

	.header-runemark {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 28px;
		border: 0;
		outline: none;
		background: transparent;
	}

	.header-runemark :global(svg) {
		height: 28px;
		width: 28px;
		fill: #FAF6F3;
		border: 0;
		outline: none;
		background: transparent;
	}

	.weapon-runemark {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 44px;
		border: 0;
		outline: none;
		background: transparent;
	}

	.weapon-runemark :global(svg) {
		height: 44px;
		width: auto;
		fill: #000;
		border: 0;
		outline: none;
		background: transparent;
	}

	.weapon-name {
		font-family: 'Germania One', serif;
		font-size: 18px;
		font-weight: 400;
		font-style: normal;
		color: #000;
		text-align: center;
		text-transform: uppercase;

		line-height: 1.2;
		border: 0;
		outline: none;
		background: transparent;
	}

	.weapon-val {
		font-family: 'Germania One', serif;
		font-size: 34px;
		font-weight: 400;
		color: #000;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		white-space: nowrap;
		padding: 0 10px;
		border: 0;
		outline: none;
		background: transparent;
	}

	.weapon-val.is-empty {
		font-size: 16px;

	}


	/* ── DAMAGE BRACKETS ───────────────────────── */

	.damage-row {
		display: flex;
		height: 23px;
		border: 0;
		outline: none;
		background: transparent;
	}

	.damage-row-alt {
		background: rgba(90, 10, 20, 0.04);
	}

	.damage-row:not(:first-child) {
		box-shadow: inset 0 1px 0 0 #000;
	}

	.dcol {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		border: 0;
		outline: none;
		background: transparent;
	}

	.dcol-wide {
		flex: 1;
		font-family: 'Alegreya', serif;
		font-size: 15px;
		font-weight: 400;
		color: #000;
		padding: 0 8px;
		border: 0;
		outline: none;
		background: transparent;
	}

	.dcol-stat {
		flex: 0 0 100px;
		font-family: 'Alegreya', serif;
		font-size: 15px;
		font-weight: 400;
		color: #000;
		border: 0;
		outline: none;
		background: transparent;
	}

	/* ── PRINTER-FRIENDLY OVERRIDES ────────────── */

	.is-printer-friendly {
		background: #fff;
	}

	.is-printer-friendly .image-inner {
		background: #e8e8e8;
	}

	.is-printer-friendly .stats-box,
	.is-printer-friendly .weapons-box {
		border-color: #000;
	}

	.is-printer-friendly .stats-header,
	.is-printer-friendly .weapons-header {
		background: transparent;
	}

	.is-printer-friendly .label-col {
		background: none;
		-webkit-background-clip: unset;
		background-clip: unset;
		color: #000;
	}

	.is-printer-friendly .header-text {
		color: #000;
	}

	.is-printer-friendly .header-runemark :global(svg) {
		fill: #000;
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

	.is-printer-friendly .weapon-row:nth-child(odd) {
		background: transparent;
	}

	.is-printer-friendly .damage-row-alt {
		background: transparent;
	}
</style>
