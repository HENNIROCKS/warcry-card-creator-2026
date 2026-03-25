<script lang="ts">
	import type { DeploymentCardData, DeploymentColor, DeploymentDirection, DeploymentPosition, ZonePreset } from '$lib/types';
	import daggerRaw from '$lib/runemarks/svg/deployment-dagger.svg?raw';
	import hammerRaw from '$lib/runemarks/svg/deployment-hammer.svg?raw';
	import shieldRaw from '$lib/runemarks/svg/deployment-shield.svg?raw';

	let {
		data,
		printerFriendly = false,
		snapGridActive = false,
		showPositionDots = false,
		measurementAnchor = undefined,
		onSnapPointClick = undefined,
		onPositionClick = undefined,
		onMeasurementClick = undefined,
		onDirectionSelect = undefined,
	}: {
		data: DeploymentCardData;
		printerFriendly?: boolean;
		snapGridActive?: boolean;
		showPositionDots?: boolean;
		measurementAnchor?: { col: number; row: number };
		onSnapPointClick?: (col: number, row: number) => void;
		onPositionClick?: (pos: DeploymentPosition, clientX: number, clientY: number) => void;
		onMeasurementClick?: (mi: number, clientX: number, clientY: number) => void;
		onDirectionSelect?: (dir: DeploymentDirection) => void;
	} = $props();

	// Direction arrows rendered after anchor is placed
	const DIR_ARROWS: { dir: DeploymentDirection; angle: number; dx: number; dy: number }[] = [
		{ dir: 'right',      angle: 0,    dx: 48,  dy: 0   },
		{ dir: 'up-right',   angle: -45,  dx: 34,  dy: -34 },
		{ dir: 'up',         angle: -90,  dx: 0,   dy: -48 },
		{ dir: 'up-left',    angle: -135, dx: -34, dy: -34 },
		{ dir: 'left',       angle: 180,  dx: -48, dy: 0   },
		{ dir: 'down-left',  angle: 135,  dx: -34, dy: 34  },
		{ dir: 'down',       angle: 90,   dx: 0,   dy: 48  },
		{ dir: 'down-right', angle: 45,   dx: 34,  dy: 34  },
	];

	// Map of position → player colour for occupied positions
	const occupancy = $derived.by(() => {
		const map = new Map<DeploymentPosition, DeploymentColor>();
		for (const player of data.players) {
			for (const point of player.points) {
				map.set(point.position, player.color);
			}
		}
		return map;
	});

	const ALL_POSITIONS: DeploymentPosition[] = [
		'TL', 'TC', 'TR', 'ML', 'CC', 'MR', 'BL', 'BC', 'BR',
		'OUT-TL', 'OUT-TC', 'OUT-TR',
		'OUT-LT', 'OUT-LC', 'OUT-LB',
		'OUT-RT', 'OUT-RC', 'OUT-RB',
		'OUT-BL', 'OUT-BC', 'OUT-BR',
		'OUT-CNR-TL', 'OUT-CNR-TR', 'OUT-CNR-BL', 'OUT-CNR-BR',
	];

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
		hammer: '0 0 300 300',
		shield: '0 0 300 300',
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

	const PLAYER_BADGES = ['①', '②', '③', '④'];

	// Snap grid: 4×4 = 25 points (cols 0–4, rows 0–4)
	const SNAP_COLS = 4;
	const SNAP_ROWS = 4;
	const snapCols = Array.from({ length: SNAP_COLS + 1 }, (_, i) => i);
	const snapRows = Array.from({ length: SNAP_ROWS + 1 }, (_, i) => i);
	function snapX(col: number): number { return BF_L + col * (BF_W / SNAP_COLS); }
	function snapY(row: number): number { return BF_T + row * (BF_H / SNAP_ROWS); }

	// Direction unit vector (diagonals are normalised to length 1)
	const D = 1 / Math.sqrt(2);
	function dirVec(dir: string): [number, number] {
		if (dir === 'up')         return [ 0, -1];
		if (dir === 'down')       return [ 0,  1];
		if (dir === 'left')       return [-1,  0];
		if (dir === 'up-right')   return [ D, -D];
		if (dir === 'up-left')    return [-D, -D];
		if (dir === 'down-right') return [ D,  D];
		if (dir === 'down-left')  return [-D,  D];
		return [1, 0];
	}

	// Zone preset → SVG rect bounds
	function zoneRect(preset: ZonePreset): { x: number; y: number; w: number; h: number } {
		const hW = BF_W / 2, hH = BF_H / 2;
		switch (preset) {
			case 'top-half':    return { x: BF_L,  y: BF_T,  w: BF_W, h: hH };
			case 'bottom-half': return { x: BF_L,  y: BF_CY, w: BF_W, h: hH };
			case 'left-half':   return { x: BF_L,  y: BF_T,  w: hW,   h: BF_H };
			case 'right-half':  return { x: BF_CX, y: BF_T,  w: hW,   h: BF_H };
			case 'tl-quarter':  return { x: BF_L,  y: BF_T,  w: hW,   h: hH };
			case 'tr-quarter':  return { x: BF_CX, y: BF_T,  w: hW,   h: hH };
			case 'bl-quarter':  return { x: BF_L,  y: BF_CY, w: hW,   h: hH };
			case 'br-quarter':  return { x: BF_CX, y: BF_CY, w: hW,   h: hH };
		}
	}

	const ZONE_OPACITY = 0.38;
	const PF_ZONE_OPACITIES = [0.08, 0.18, 0.28, 0.38];

	const ARROW_LEN       = 14;
	const DOT_R           = 5;
	const LABEL_OFF       = 12;
	const MEAS_INSET = 20;  // px to pull each measurement endpoint away from the anchor/terminus

	// Return marker URL for a cap type (arrow and dot are rendered separately)
	function capMarker(cap: string): string | undefined {
		if (cap === 'tick') return 'url(#dep-tick)';
		return undefined;
	}

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
	<svg width="915" height="574" viewBox="0 0 915 574" xmlns="http://www.w3.org/2000/svg" style="display:block;border:none;outline:none;" overflow="hidden">

		<defs>
			<!-- Tick — perpendicular stroke -->
			<marker id="dep-tick" viewBox="0 0 2 14" refX="1" refY="7" markerWidth="5" markerHeight="14" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
				<path d="M1,0 L1,14" stroke="#222" stroke-width="2.5" fill="none"/>
			</marker>
		</defs>

		<!-- Printer-friendly: fill entire SVG with white -->
		{#if printerFriendly}
			<rect x="0" y="0" width="915" height="574" fill="white"/>
		{/if}

		<!-- Battlefield rectangle -->
		<rect x={BF_L} y={BF_T} width={BF_W} height={BF_H} fill={printerFriendly ? 'white' : '#d9b8a8'} stroke={printerFriendly ? '#000' : 'none'} stroke-width="1"/>

		<!-- Deployment zone fills (behind dashed lines) -->
		{#each data.players as player, pi}
			{#each (player.zones ?? []) as zone}
				{@const r = zoneRect(zone.preset)}
				<rect
					x={r.x} y={r.y} width={r.w} height={r.h}
					fill={printerFriendly ? '#000' : COLORS[player.color]}
					fill-opacity={printerFriendly ? (PF_ZONE_OPACITIES[pi] ?? 0.08) : ZONE_OPACITY}
					stroke={printerFriendly ? '#000' : 'none'}
					stroke-width={printerFriendly ? '1' : '0'}
					stroke-dasharray={printerFriendly ? '4 3' : ''}
				/>
			{/each}
		{/each}

		<!-- Dashed centre lines — four arms radiating from centre so dashes originate at the cross -->
		<line x1={BF_CX} y1={BF_CY} x2={BF_CX} y2={BF_T} stroke={printerFriendly ? '#000' : '#333'} stroke-width="2" stroke-dasharray="8 6"/>
		<line x1={BF_CX} y1={BF_CY} x2={BF_CX} y2={BF_B} stroke={printerFriendly ? '#000' : '#333'} stroke-width="2" stroke-dasharray="8 6"/>
		<line x1={BF_CX} y1={BF_CY} x2={BF_L} y2={BF_CY} stroke={printerFriendly ? '#000' : '#333'} stroke-width="2" stroke-dasharray="8 6"/>
		<line x1={BF_CX} y1={BF_CY} x2={BF_R} y2={BF_CY} stroke={printerFriendly ? '#000' : '#333'} stroke-width="2" stroke-dasharray="8 6"/>

		<!-- Deployment point speech bubbles -->
		{#each data.players as player, pi}
		{#each player.points as point}
			{@const [cx, cy] = getCoords(point.position)}
			{@const color = printerFriendly ? '#000' : COLORS[player.color]}
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

				<!-- Player badge (printer-friendly only) -->
				{#if printerFriendly}
					<text
						x={BW / 2}
						y={-5}
						text-anchor="middle"
						font-family="'Germania One', serif"
						font-size="12"
						fill="#000"
						stroke="white"
						stroke-width="4"
						paint-order="stroke"
					>{PLAYER_BADGES[pi]}</text>
				{/if}

			</g>
		{/each}
		{/each}

		<!-- Measurement lines -->
		{#each (data.measurements ?? []) as m, mi}
			{@const ax0 = snapX(m.anchorCol)}
			{@const ay0 = snapY(m.anchorRow)}
			{@const [dx, dy] = dirVec(m.direction)}
			{@const ax = ax0 + dx * MEAS_INSET}
			{@const ay = ay0 + dy * MEAS_INSET}
			{@const ex = ax0 + dx * (m.length - MEAS_INSET)}
			{@const ey = ay0 + dy * (m.length - MEAS_INSET)}
			{@const mx = ax0 + dx * m.length / 2}
			{@const my = ay0 + dy * m.length / 2}
			{@const lx1 = m.startCap === 'arrow' ? ax + dx * ARROW_LEN : m.startCap === 'dot' ? ax + dx * DOT_R : ax}
			{@const ly1 = m.startCap === 'arrow' ? ay + dy * ARROW_LEN : m.startCap === 'dot' ? ay + dy * DOT_R : ay}
			{@const lx2 = m.endCap   === 'arrow' ? ex - dx * ARROW_LEN : m.endCap   === 'dot' ? ex - dx * DOT_R : ex}
			{@const ly2 = m.endCap   === 'arrow' ? ey - dy * ARROW_LEN : m.endCap   === 'dot' ? ey - dy * DOT_R : ey}
			{@const endAngle   = Math.atan2(dy,  dx)  * 180 / Math.PI}
			{@const startAngle = Math.atan2(-dy, -dx) * 180 / Math.PI}

			<!-- Start cap -->
			{#if m.startCap === 'dot'}
				<circle cx={ax} cy={ay} r={DOT_R} fill="#222"/>
			{:else if m.startCap === 'arrow'}
				<polygon points="-{ARROW_LEN},-5 0,0 -{ARROW_LEN},5" fill="#222"
					transform="translate({ax},{ay}) rotate({startAngle})"/>
			{/if}

			<line
				x1={lx1} y1={ly1} x2={lx2} y2={ly2}
				stroke="#222" stroke-width="5"
				marker-end={capMarker(m.endCap)}
				marker-start={capMarker(m.startCap)}
			/>

			<!-- End cap -->
			{#if m.endCap === 'dot'}
				<circle cx={ex} cy={ey} r={DOT_R} fill="#222"/>
			{:else if m.endCap === 'arrow'}
				<polygon points="-{ARROW_LEN},-5 0,0 -{ARROW_LEN},5" fill="#222"
					transform="translate({ex},{ey}) rotate({endAngle})"/>
			{/if}

			{#if m.label}
				<text
					x={mx - dy * LABEL_OFF}
					y={my + dx * LABEL_OFF + 5}
					font-family="'Germania One', serif"
					font-size="16"
					fill="#222"
					text-anchor="middle"
				>{m.label}</text>
			{/if}

			<!-- Midpoint tap handle -->
			{#if onMeasurementClick}
				<circle
					cx={mx} cy={my} r="12"
					class="meas-handle"
					onclick={(e) => { e.stopPropagation(); onMeasurementClick(mi, e.clientX, e.clientY); }}
				/>
			{/if}
		{/each}

		<!-- Position dots overlay — shown in edit mode; never exported -->
		{#if showPositionDots}
			{#each ALL_POSITIONS as pos}
				{@const [px, py] = getCoords(pos)}
				{@const occupiedBy = occupancy.get(pos)}
				<g
					class="pos-group"
					class:pos-group--interactive={!!onPositionClick}
					onclick={(e) => onPositionClick?.(pos, e.clientX, e.clientY)}
				>
					<!-- Large tap target -->
					<circle cx={px} cy={py} r="22" fill="transparent"/>
					<!-- Visual dot -->
					<circle
						cx={px} cy={py} r="7"
						class="pos-dot"
						class:pos-dot--occupied={!!occupiedBy}
						style={occupiedBy ? `fill: ${COLORS[occupiedBy]}; stroke: white;` : ''}
					/>
				</g>
			{/each}
		{/if}

		<!-- Snap grid overlay — shown only when placing a measurement; never exported -->
		{#if snapGridActive}
			{#each snapCols as col}
				{#each snapRows as row}
					<circle
						cx={snapX(col)} cy={snapY(row)} r="9"
						class="snap-pt"
						onclick={() => onSnapPointClick?.(col, row)}
					/>
				{/each}
			{/each}
		{/if}

		<!-- Direction picker — shown after anchor is placed; never exported -->
		{#if measurementAnchor}
			{@const ax = snapX(measurementAnchor.col)}
			{@const ay = snapY(measurementAnchor.row)}

			<!-- Anchor indicator -->
			<circle cx={ax} cy={ay} r="7" fill="#c0272d" stroke="white" stroke-width="2"/>

			<!-- Direction buttons -->
			{#each DIR_ARROWS as { dir, angle, dx, dy }}
				<g
					class="dir-btn"
					transform="translate({ax + dx},{ay + dy})"
					onclick={() => onDirectionSelect?.(dir)}
				>
					<circle r="14" class="dir-btn-bg"/>
					<polygon
						points="-6,-4 6,0 -6,4"
						transform="rotate({angle})"
						class="dir-btn-arrow"
					/>
				</g>
			{/each}
		{/if}

	</svg>
	{#if data.name}
		<div class="card-name">{data.name}</div>
	{/if}
</div>

<style>
	.card {
		width: 915px;
		height: 574px;
		position: relative;
		display: block;
		line-height: 0;
		background: url('/background.jpg') center center / cover no-repeat;
		border: 0;
		outline: none;
		overflow: hidden;
	}

	.card.is-printer-friendly {
		background: white;
	}

	.card-name {
		position: absolute;
		bottom: 20px;
		left: 20px;
		right: 0;
		text-align: left;
		font-family: 'Alegreya', serif;
		font-size: 13px;
		color: #000;
		opacity: 0.5;
		border: 0;
		outline: none;
		background: transparent;
	}

	.card.is-printer-friendly .card-name {
		opacity: 1;
	}

	.pos-dot {
		fill: rgba(255, 255, 255, 0.6);
		stroke: rgba(0, 0, 0, 0.5);
		stroke-width: 1.5;
		pointer-events: none;
	}

	.pos-group {
		pointer-events: none;
	}

	.pos-group--interactive {
		pointer-events: all;
		cursor: pointer;
	}

	.pos-group--interactive:hover .pos-dot {
		opacity: 0.7;
	}

	.meas-handle {
		fill: rgba(255, 255, 255, 0.7);
		stroke: rgba(0, 0, 0, 0.4);
		stroke-width: 1.5;
		cursor: pointer;
	}

	.meas-handle:hover {
		fill: #c0272d;
		stroke: white;
	}

	.dir-btn {
		cursor: pointer;
	}

	.dir-btn-bg {
		fill: rgba(255, 255, 255, 0.85);
		stroke: rgba(0, 0, 0, 0.3);
		stroke-width: 1.5;
		transition: fill 0.1s;
	}

	.dir-btn:hover .dir-btn-bg {
		fill: #c0272d;
	}

	.dir-btn-arrow {
		fill: #222;
	}

	.dir-btn:hover .dir-btn-arrow {
		fill: white;
	}

	.snap-pt {
		fill: rgba(255, 255, 255, 0.75);
		stroke: #000;
		stroke-width: 1.5;
		cursor: pointer;
	}

	.snap-pt:hover {
		fill: rgba(192, 39, 45, 0.85);
	}
</style>
