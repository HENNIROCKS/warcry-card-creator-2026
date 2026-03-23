<script lang="ts">
	import type { DeploymentCardData, DeploymentColor, DeploymentPosition } from '$lib/types';
	import daggerRaw from '$lib/runemarks/svg/deployment-dagger.svg?raw';
	import hammerRaw from '$lib/runemarks/svg/deployment-hammer.svg?raw';
	import shieldRaw from '$lib/runemarks/svg/deployment-shield.svg?raw';

	let { data, printerFriendly = false }: { data: DeploymentCardData; printerFriendly?: boolean } = $props();

	// Strip outer <svg> wrapper, comments, title; set all fills to white
	function innerContent(raw: string): string {
		return raw
			.replace(/<!--[\s\S]*?-->/g, '')
			.replace(/<\?xml[^>]*\?>/g, '')
			.replace(/<svg[^>]*>/g, '')
			.replace(/<\/svg>/g, '')
			.replace(/<title>[^<]*<\/title>/g, '')
			.replace(/fill="[^"]*"/g, 'fill="white"')
			.trim();
	}

	const daggerInner = innerContent(daggerRaw);
	const hammerInner = innerContent(hammerRaw);
	const shieldInner = innerContent(shieldRaw);

	// Battlefield rectangle (inside the 915×574 card)
	const BF_L = 100;
	const BF_T = 60;
	const BF_R = 815;
	const BF_B = 514;
	const BF_W = BF_R - BF_L;
	const BF_H = BF_B - BF_T;
	const BF_CX = BF_L + BF_W / 2;
	const BF_CY = BF_T  + BF_H / 2;

	const ICON_R = 22;

	const COLORS: Record<DeploymentColor, string> = {
		red: '#c0272d',
		blue: '#1a3a6e',
	};

	function getCoords(pos: DeploymentPosition): [number, number] {
		const qx = BF_W / 4;
		const qy = BF_H / 4;
		switch (pos) {
			case 'TL': return [BF_L + qx,           BF_T + qy          ];
			case 'TC': return [BF_CX,                BF_T + qy          ];
			case 'TR': return [BF_R - qx,            BF_T + qy          ];
			case 'ML': return [BF_L + qx,            BF_CY              ];
			case 'CC': return [BF_CX,                BF_CY              ];
			case 'MR': return [BF_R - qx,            BF_CY              ];
			case 'BL': return [BF_L + qx,            BF_B - qy          ];
			case 'BC': return [BF_CX,                BF_B - qy          ];
			case 'BR': return [BF_R - qx,            BF_B - qy          ];
			case 'OUT-TL': return [BF_L + qx,        BF_T / 2           ];
			case 'OUT-TC': return [BF_CX,            BF_T / 2           ];
			case 'OUT-TR': return [BF_R - qx,        BF_T / 2           ];
			case 'OUT-LC': return [BF_L / 2,         BF_CY              ];
			case 'OUT-RC': return [(BF_R + 915) / 2, BF_CY              ];
			case 'OUT-BL': return [BF_L + qx,        (BF_B + 574) / 2   ];
			case 'OUT-BC': return [BF_CX,            (BF_B + 574) / 2   ];
			case 'OUT-BR': return [BF_R - qx,        (BF_B + 574) / 2   ];
		}
	}

	// RND label offset from icon centre
	function getRndOffset(pos: DeploymentPosition): [number, number] {
		if (['OUT-TL','OUT-TC','OUT-TR','TL','TC','TR'].includes(pos)) return [0, -(ICON_R + 13)];
		if (['OUT-BL','OUT-BC','OUT-BR','BL','BC','BR'].includes(pos)) return [0,  ICON_R + 13 ];
		if (['OUT-LC','ML'].includes(pos)) return [-(ICON_R + 36), 0];
		if (['OUT-RC','MR'].includes(pos)) return [ ICON_R + 36,  0];
		return [0, ICON_R + 13];
	}
</script>

<div class="card" class:is-printer-friendly={printerFriendly}>
	<svg width="915" height="574" viewBox="0 0 915 574" xmlns="http://www.w3.org/2000/svg">

		<defs>
			<!-- Dagger: downward triangle ▽ + deployment-dagger icon -->
			<symbol id="dep-dagger" viewBox="0 0 44 44" overflow="visible">
				<polygon points="22,42 3,8 41,8" fill="currentColor"/>
				<svg x="11" y="12" width="22" height="22" viewBox="0 0 32 32" fill="white">
					{@html daggerInner}
				</svg>
			</symbol>

			<!-- Hammer: diamond ◇ + deployment-hammer icon -->
			<symbol id="dep-hammer" viewBox="0 0 44 44" overflow="visible">
				<polygon points="22,2 42,22 22,42 2,22" fill="currentColor"/>
				<svg x="8" y="8" width="28" height="28" viewBox="0 0 32 32" fill="white">
					{@html hammerInner}
				</svg>
			</symbol>

			<!-- Shield: circle ⊙ + deployment-shield icon -->
			<symbol id="dep-shield" viewBox="0 0 44 44" overflow="visible">
				<circle cx="22" cy="22" r="21" fill="currentColor"/>
				<svg x="3" y="3" width="38" height="38" viewBox="0 0 1024 1024" fill="white">
					{@html shieldInner}
				</svg>
			</symbol>
		</defs>

		<!-- Battlefield rectangle -->
		<rect x={BF_L} y={BF_T} width={BF_W} height={BF_H} fill="#d9b8a8"/>

		<!-- Dashed centre lines -->
		<line x1={BF_CX} y1={BF_T} x2={BF_CX} y2={BF_B} stroke="#333" stroke-width="2" stroke-dasharray="8 6"/>
		<line x1={BF_L} y1={BF_CY} x2={BF_R} y2={BF_CY} stroke="#333" stroke-width="2" stroke-dasharray="8 6"/>

		<!-- Card name -->
		{#if data.name}
			<text
				x={BF_CX} y={BF_CY + 6}
				text-anchor="middle"
				font-family="'Germania One', serif"
				font-size="22"
				fill="#333"
				opacity="0.45"
			>{data.name}</text>
		{/if}

		<!-- Deployment points -->
		{#each data.points as point}
			{@const [cx, cy] = getCoords(point.position)}
			{@const [rdx, rdy] = getRndOffset(point.position)}
			{@const color = COLORS[point.color]}

			<use
				href={`#dep-${point.icon}`}
				x={cx - ICON_R} y={cy - ICON_R}
				width={ICON_R * 2} height={ICON_R * 2}
				style="color: {color}"
			/>

			{#if point.rnd}
				<text
					x={cx + rdx}
					y={cy + rdy + (rdy === 0 ? 5 : 0)}
					text-anchor={rdx < 0 ? 'end' : rdx > 0 ? 'start' : 'middle'}
					font-family="'Germania One', serif"
					font-size="18"
					font-weight="bold"
					fill={printerFriendly ? '#000' : color}
				>{point.rnd}</text>
			{/if}
		{/each}

	</svg>
</div>

<style>
	.card {
		width: 915px;
		height: 574px;
		position: relative;
		display: inline-block;
		line-height: 0;
		background-image: url('/background.jpg');
		background-size: cover;
		background-position: center;
	}
</style>
