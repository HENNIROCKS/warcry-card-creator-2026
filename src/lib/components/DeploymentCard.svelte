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
	const BH        = 48;  // bubble height
	const BPAD      = 8;   // horizontal padding inside bubble
	const ICON_SZ   = 32;  // icon size inside bubble
	const GAP       = 6;   // gap between icon and RND text
	const CHAR_W    = 9;   // approximate char width for Germania One at 17px
	const BW_ICON   = BPAD + ICON_SZ + BPAD; // bubble width, icon only (48)
	const BRAD      = 8;   // corner radius
	const TAIL_LEN  = 10;  // tail triangle length
	const TAIL_W    = 12;  // tail triangle base width

	// Bubble width fitted to the actual RND text length.
	function bubbleWidth(rnd: string): number {
		return rnd ? BPAD + ICON_SZ + GAP + Math.ceil(rnd.length * CHAR_W) + BPAD : BW_ICON;
	}

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

	// Returns the angle (radians) the tail should point toward, or null for no tail.
	// Corner positions use the exact angle to the nearest battlefield corner.
	function getTailAngle(pos: DeploymentPosition): number | null {
		const DOWN  =  Math.PI / 2;
		const UP    = -Math.PI / 2;
		const RIGHT =  0;
		const LEFT  =  Math.PI;
		switch (pos) {
			case 'TL': case 'TC': case 'TR':
			case 'OUT-TL': case 'OUT-TC': case 'OUT-TR':           return DOWN;
			case 'BL': case 'BC': case 'BR':
			case 'OUT-BL': case 'OUT-BC': case 'OUT-BR':           return UP;
			case 'ML': case 'OUT-LT': case 'OUT-LC': case 'OUT-LB': return RIGHT;
			case 'MR': case 'OUT-RT': case 'OUT-RC': case 'OUT-RB': return LEFT;
			case 'OUT-CNR-TL': { const [cx,cy] = getCoords(pos); return Math.atan2(BF_T - cy, BF_L - cx); }
			case 'OUT-CNR-TR': { const [cx,cy] = getCoords(pos); return Math.atan2(BF_T - cy, BF_R - cx); }
			case 'OUT-CNR-BL': { const [cx,cy] = getCoords(pos); return Math.atan2(BF_B - cy, BF_L - cx); }
			case 'OUT-CNR-BR': { const [cx,cy] = getCoords(pos); return Math.atan2(BF_B - cy, BF_R - cx); }
			default: return null;
		}
	}

	// Computes tail polygon points in bubble-local coordinates for any angle.
	// When the exit point lands in the rounded-corner zone the tail base is split
	// across the two adjacent straight edges (one point on each), keeping the
	// base flush with the visible rounded rect. The tip always points in the
	// correct direction.
	function makeTailPoints(BW: number, BH: number, angle: number): string {
		const halfW = BW / 2;
		const halfH = BH / 2;
		const cos   = Math.cos(angle);
		const sin   = Math.sin(angle);

		// Exit point relative to bubble centre
		let ex: number, ey: number;
		if (Math.abs(cos) * halfH >= Math.abs(sin) * halfW) {
			ex = cos > 0 ? halfW : -halfW;
			ey = Math.abs(cos) > 1e-10 ? (sin / cos) * ex : 0;
		} else {
			ey = sin > 0 ? halfH : -halfH;
			ex = Math.abs(sin) > 1e-10 ? (cos / sin) * ey : 0;
		}

		const fmt = (n: number) => n.toFixed(1);

		// If exit point falls in the rounded-corner zone, anchor the base on the
		// two straight edges that meet at that corner instead.
		if (Math.abs(ex) > halfW - BRAD && Math.abs(ey) > halfH - BRAD) {
			// Bounding-box corner in local coords
			const lcx = ex + halfW;  // 0 or BW
			const lcy = ey + halfH;  // 0 or BH

			// One base point on the horizontal edge, one on the vertical edge
			const b1x = lcx - Math.sign(cos) * TAIL_W;
			const b2y = lcy - Math.sign(sin) * TAIL_W;

			// Tip: extend from bounding-box corner in the tail direction
			const tx = lcx + cos * TAIL_LEN;
			const ty = lcy + sin * TAIL_LEN;

			return `${fmt(b1x)},${fmt(lcy)} ${fmt(lcx)},${fmt(b2y)} ${fmt(tx)},${fmt(ty)}`;
		}

		// Regular case: base centred on the exit edge, perpendicular offset.
		const lx = ex + halfW;
		const ly = ey + halfH;
		const tx = lx + cos * TAIL_LEN;
		const ty = ly + sin * TAIL_LEN;
		const px = -sin * (TAIL_W / 2);
		const py =  cos * (TAIL_W / 2);

		return `${fmt(lx+px)},${fmt(ly+py)} ${fmt(lx-px)},${fmt(ly-py)} ${fmt(tx)},${fmt(ty)}`;
	}
</script>

<div class="card" class:is-printer-friendly={printerFriendly}>
	<svg width="915" height="574" viewBox="0 0 915 574" xmlns="http://www.w3.org/2000/svg">

		<!-- Battlefield rectangle -->
		<rect x={BF_L} y={BF_T} width={BF_W} height={BF_H} fill="#d9b8a8"/>

		<!-- Dashed centre lines — four arms radiating from centre so dashes originate at the cross -->
		<line x1={BF_CX} y1={BF_CY} x2={BF_CX} y2={BF_T} stroke="#333" stroke-width="2" stroke-dasharray="8 6"/>
		<line x1={BF_CX} y1={BF_CY} x2={BF_CX} y2={BF_B} stroke="#333" stroke-width="2" stroke-dasharray="8 6"/>
		<line x1={BF_CX} y1={BF_CY} x2={BF_L} y2={BF_CY} stroke="#333" stroke-width="2" stroke-dasharray="8 6"/>
		<line x1={BF_CX} y1={BF_CY} x2={BF_R} y2={BF_CY} stroke="#333" stroke-width="2" stroke-dasharray="8 6"/>

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
		{#each data.players as player}
		{#each player.points as point}
			{@const [cx, cy] = getCoords(point.position)}
			{@const color = printerFriendly ? '#333' : COLORS[player.color]}
			{@const tailAngle = getTailAngle(point.position)}
			{@const hasRnd = !!point.rnd}
			{@const BW = bubbleWidth(point.rnd)}

			<g transform="translate({cx - BW / 2}, {cy - BH / 2})">

				<!-- Tail triangle -->
				{#if tailAngle !== null}
					<polygon points={makeTailPoints(BW, BH, tailAngle)} fill={color}/>
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
