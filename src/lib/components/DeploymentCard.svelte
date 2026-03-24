<script lang="ts">
	import type { DeploymentCardData, DeploymentColor, DeploymentPosition } from '$lib/types';
	import daggerRaw from '$lib/runemarks/svg/deployment-dagger.svg?raw';
	import hammerRaw from '$lib/runemarks/svg/deployment-hammer.svg?raw';
	import shieldRaw from '$lib/runemarks/svg/deployment-shield.svg?raw';

	let { data, printerFriendly = false }: { data: DeploymentCardData; printerFriendly?: boolean } = $props();

	// Strip outer <svg> wrapper and force all fills to white
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

	// Icon viewBoxes differ between assets
	const iconViewBox: Record<string, string> = {
		dagger: '0 0 32 32',
		hammer: '0 0 32 32',
		shield: '0 0 1024 1024',
	};

	// Battlefield rectangle (inside the 915×574 card)
	const BF_L = 100;
	const BF_T = 60;
	const BF_R = 815;
	const BF_B = 514;
	const BF_W = BF_R - BF_L;
	const BF_H = BF_B - BF_T;
	const BF_CX = BF_L + BF_W / 2;
	const BF_CY = BF_T  + BF_H / 2;

	// Bubble geometry
	const BH       = 48;  // bubble height
	const BPAD     = 8;   // horizontal padding inside bubble
	const ICON_SZ  = 32;  // icon size inside bubble
	const GAP      = 6;   // gap between icon and RND text
	const BW_ICON  = BPAD + ICON_SZ + BPAD;            // bubble width, icon only  (48)
	const BW_FULL  = BPAD + ICON_SZ + GAP + 52 + BPAD; // bubble width, icon + RND (106)
	const BRAD     = 8;   // corner radius
	const TAIL_LEN = 10;  // tail triangle length
	const TAIL_W   = 12;  // tail triangle base width

	const COLORS: Record<DeploymentColor, string> = {
		red:    '#c0272d',
		blue:   '#2563eb',
		green:  '#16a34a',
		yellow: '#ca8a04',
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
			case 'OUT-TL': return [BF_L + qx, 34 ];
			case 'OUT-TC': return [BF_CX,     34 ];
			case 'OUT-TR': return [BF_R - qx, 34 ];
			case 'OUT-LT': return [63, BF_T + qy  ];
			case 'OUT-LC': return [63, BF_CY      ];
			case 'OUT-LB': return [63, BF_B - qy  ];
			case 'OUT-RT': return [852, BF_T + qy  ];
			case 'OUT-RC': return [852, BF_CY      ];
			case 'OUT-RB': return [852, BF_B - qy  ];
			case 'OUT-BL': return [BF_L + qx, 540];
			case 'OUT-BC': return [BF_CX,     540];
			case 'OUT-BR': return [BF_R - qx, 540];
			case 'OUT-CNR-TL': return [63,  34 ];
			case 'OUT-CNR-TR': return [852, 34 ];
			case 'OUT-CNR-BL': return [63,  540];
			case 'OUT-CNR-BR': return [852, 540];
		}
	}

	type TailDir = 'up' | 'down' | 'left' | 'right' | 'down-right' | 'down-left' | 'up-right' | 'up-left' | null;

	// Tail points toward the battlefield from each position
	function getTailDir(pos: DeploymentPosition): TailDir {
		switch (pos) {
			case 'TL': case 'TC': case 'TR':
			case 'OUT-TL': case 'OUT-TC': case 'OUT-TR':  return 'down';
			case 'BL': case 'BC': case 'BR':
			case 'OUT-BL': case 'OUT-BC': case 'OUT-BR':  return 'up';
			case 'ML': case 'OUT-LT': case 'OUT-LC': case 'OUT-LB': return 'right';
			case 'MR': case 'OUT-RT': case 'OUT-RC': case 'OUT-RB': return 'left';
			case 'OUT-CNR-TL': return 'down-right';
			case 'OUT-CNR-TR': return 'down-left';
			case 'OUT-CNR-BL': return 'up-right';
			case 'OUT-CNR-BR': return 'up-left';
			default:           return null;
		}
	}
</script>

<div class="card" class:is-printer-friendly={printerFriendly}>
	<svg width="915" height="574" viewBox="0 0 915 574" xmlns="http://www.w3.org/2000/svg">

		<!-- Battlefield rectangle -->
		<rect x={BF_L} y={BF_T} width={BF_W} height={BF_H} fill="#d9b8a8"/>

		<!-- Dashed centre lines -->
		<line x1={BF_CX} y1={BF_T} x2={BF_CX} y2={BF_B} stroke="#333" stroke-width="2" stroke-dasharray="8 6"/>
		<line x1={BF_L} y1={BF_CY} x2={BF_R} y2={BF_CY} stroke="#333" stroke-width="2" stroke-dasharray="8 6"/>

		<!-- Card name (faint watermark at centre) -->
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

		<!-- Deployment point speech bubbles -->
		{#each data.points as point}
			{@const [cx, cy] = getCoords(point.position)}
			{@const color = printerFriendly ? '#333' : COLORS[point.color]}
			{@const tailDir = getTailDir(point.position)}
			{@const hasRnd = !!point.rnd}
			{@const BW = hasRnd ? BW_FULL : BW_ICON}
			{@const D = 7}

			<g transform="translate({cx - BW / 2}, {cy - BH / 2})">

				<!-- Tail triangle -->
				{#if tailDir === 'down'}
					<polygon points="{BW/2 - TAIL_W/2},{BH} {BW/2 + TAIL_W/2},{BH} {BW/2},{BH + TAIL_LEN}" fill={color}/>
				{:else if tailDir === 'up'}
					<polygon points="{BW/2 - TAIL_W/2},0 {BW/2 + TAIL_W/2},0 {BW/2},{-TAIL_LEN}" fill={color}/>
				{:else if tailDir === 'right'}
					<polygon points="{BW},{BH/2 - TAIL_W/2} {BW},{BH/2 + TAIL_W/2} {BW + TAIL_LEN},{BH/2}" fill={color}/>
				{:else if tailDir === 'left'}
					<polygon points="0,{BH/2 - TAIL_W/2} 0,{BH/2 + TAIL_W/2} {-TAIL_LEN},{BH/2}" fill={color}/>
				{:else if tailDir === 'down-right'}
					<polygon points="{BW - TAIL_W},{BH} {BW},{BH - TAIL_W} {BW + D},{BH + D}" fill={color}/>
				{:else if tailDir === 'down-left'}
					<polygon points="{TAIL_W},{BH} 0,{BH - TAIL_W} {-D},{BH + D}" fill={color}/>
				{:else if tailDir === 'up-right'}
					<polygon points="{BW - TAIL_W},0 {BW},{TAIL_W} {BW + D},{-D}" fill={color}/>
				{:else if tailDir === 'up-left'}
					<polygon points="{TAIL_W},0 0,{TAIL_W} {-D},{-D}" fill={color}/>
				{/if}

				<!-- Bubble background -->
				<rect x="0" y="0" width={BW} height={BH} rx={BRAD} fill={color}/>

				<!-- Icon (white inner content only, no outer shape) -->
				<svg
					x={BPAD} y={(BH - ICON_SZ) / 2}
					width={ICON_SZ} height={ICON_SZ}
					viewBox={iconViewBox[point.icon]}
					fill="white"
					overflow="visible"
				>
					{#if point.icon === 'dagger'}
						{@html daggerInner}
					{:else if point.icon === 'hammer'}
						{@html hammerInner}
					{:else}
						{@html shieldInner}
					{/if}
				</svg>

				<!-- RND label -->
				{#if hasRnd}
					<text
						x={BPAD + ICON_SZ + GAP}
						y={BH / 2 + 6}
						font-family="'Germania One', serif"
						font-size="17"
						fill="white"
					>{point.rnd}</text>
				{/if}

			</g>
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
