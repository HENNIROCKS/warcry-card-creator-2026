<script lang="ts">
	import type { DeploymentCardData, DeploymentColor, DeploymentPosition, ZonePreset } from '$lib/types';
	import daggerRaw from '$lib/runemarks/svg/deployment-dagger.svg?raw';
	import hammerRaw from '$lib/runemarks/svg/deployment-hammer.svg?raw';
	import shieldRaw from '$lib/runemarks/svg/deployment-shield.svg?raw';

	let {
		data,
		printerFriendly = false,
		showRunemarks = true,
		showPositionDots = false,
		measurementStartPos = undefined,
		onPositionClick = undefined,
		onMeasurementClick = undefined,
	}: {
		data: DeploymentCardData;
		printerFriendly?: boolean;
		showRunemarks?: boolean;
		showPositionDots?: boolean;
		measurementStartPos?: DeploymentPosition;
		onPositionClick?: (pos: DeploymentPosition, clientX: number, clientY: number) => void;
		onMeasurementClick?: (mi: number, clientX: number, clientY: number) => void;
	} = $props();

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
		...Array.from({length: 5}, (_, r) =>
			Array.from({length: 5}, (_, c) => `R${r+1}C${c+1}` as DeploymentPosition)
		).flat(),
		'OUT-T1', 'OUT-T2', 'OUT-T3', 'OUT-T4', 'OUT-T5',
		'OUT-B1', 'OUT-B2', 'OUT-B3', 'OUT-B4', 'OUT-B5',
		'OUT-L1', 'OUT-L2', 'OUT-L3', 'OUT-L4', 'OUT-L5',
		'OUT-R1', 'OUT-R2', 'OUT-R3', 'OUT-R4', 'OUT-R5',
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

	// Outer snap rail — corners of the zone just outside the battlefield.
	// Outside edge positions (OUT-T/B/L/R 1–5) are distributed evenly between
	// these corners, so all 7 points per side (corners + 5 edge dots) are
	// equally spaced, giving an even visual distribution.
	const CNR_L = 63;
	const CNR_R = 852;
	const CNR_T = 34;
	const CNR_B = 540;

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

	const ARROW_LEN = 14;
	const DOT_R     = 5;
	const LABEL_OFF = 12;

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
		const inside = pos.match(/^R(\d)C(\d)$/);
		if (inside) return [
			CNR_L + Number(inside[2]) * (CNR_R - CNR_L) / 6,
			CNR_T + Number(inside[1]) * (CNR_B - CNR_T) / 6,
		];
		const outT = pos.match(/^OUT-T(\d)$/);
		if (outT) return [CNR_L + Number(outT[1]) * (CNR_R - CNR_L) / 6, CNR_T];
		const outB = pos.match(/^OUT-B(\d)$/);
		if (outB) return [CNR_L + Number(outB[1]) * (CNR_R - CNR_L) / 6, CNR_B];
		const outL = pos.match(/^OUT-L(\d)$/);
		if (outL) return [CNR_L, CNR_T + Number(outL[1]) * (CNR_B - CNR_T) / 6];
		const outR = pos.match(/^OUT-R(\d)$/);
		if (outR) return [CNR_R, CNR_T + Number(outR[1]) * (CNR_B - CNR_T) / 6];
		if (pos === 'OUT-CNR-TR') return [CNR_R, CNR_T];
		if (pos === 'OUT-CNR-BL') return [CNR_L, CNR_B];
		if (pos === 'OUT-CNR-BR') return [CNR_R, CNR_B];
		return [CNR_L, CNR_T]; // OUT-CNR-TL
	}

	// Returns the angle (radians) the tail should point toward, or null for no tail.
	// Corner positions use the exact angle to the nearest battlefield corner.
	function getTailAngle(pos: DeploymentPosition): number | null {
		const DOWN  =  Math.PI / 2;
		const UP    = -Math.PI / 2;
		const RIGHT =  0;
		const LEFT  =  Math.PI;
		if (/^R[12]C/.test(pos) || /^OUT-T/.test(pos)) return DOWN;
		if (/^R[45]C/.test(pos) || /^OUT-B/.test(pos)) return UP;
		if (/^OUT-L/.test(pos)) return RIGHT;
		if (/^OUT-R/.test(pos)) return LEFT;
		const [cx, cy] = getCoords(pos);
		if (pos === 'OUT-CNR-TL') return Math.atan2(BF_T - cy, BF_L - cx);
		if (pos === 'OUT-CNR-TR') return Math.atan2(BF_T - cy, BF_R - cx);
		if (pos === 'OUT-CNR-BL') return Math.atan2(BF_B - cy, BF_L - cx);
		if (pos === 'OUT-CNR-BR') return Math.atan2(BF_B - cy, BF_R - cx);
		return null;
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

		<!-- Measurement lines — rendered below bubbles and dots -->
		{#each (data.measurements ?? []) as m, mi}
			{@const [sx, sy] = getCoords(m.startPos)}
			{@const [ex0, ey0] = getCoords(m.endPos)}
			{@const rawDx = ex0 - sx}
			{@const rawDy = ey0 - sy}
			{@const len = Math.hypot(rawDx, rawDy)}
			{@const dx = len > 0 ? rawDx / len : 1}
			{@const dy = len > 0 ? rawDy / len : 0}
			{@const mx = (sx + ex0) / 2}
			{@const my = (sy + ey0) / 2}
			{@const lx1 = m.startCap === 'arrow' ? sx + dx * ARROW_LEN : m.startCap === 'dot' ? sx + dx * DOT_R : sx}
			{@const ly1 = m.startCap === 'arrow' ? sy + dy * ARROW_LEN : m.startCap === 'dot' ? sy + dy * DOT_R : sy}
			{@const lx2 = m.endCap   === 'arrow' ? ex0 - dx * ARROW_LEN : m.endCap   === 'dot' ? ex0 - dx * DOT_R : ex0}
			{@const ly2 = m.endCap   === 'arrow' ? ey0 - dy * ARROW_LEN : m.endCap   === 'dot' ? ey0 - dy * DOT_R : ey0}
			{@const endAngle   = Math.atan2(dy,  dx)  * 180 / Math.PI}
			{@const startAngle = Math.atan2(-dy, -dx) * 180 / Math.PI}

			<!-- Start cap -->
			{#if m.startCap === 'dot'}
				<circle cx={sx} cy={sy} r={DOT_R} fill="#222"/>
			{:else if m.startCap === 'arrow'}
				<polygon points="-{ARROW_LEN},-5 0,0 -{ARROW_LEN},5" fill="#222"
					transform="translate({sx},{sy}) rotate({startAngle})"/>
			{/if}

			<line
				x1={lx1} y1={ly1} x2={lx2} y2={ly2}
				stroke="#222" stroke-width="5"
				marker-end={capMarker(m.endCap)}
				marker-start={capMarker(m.startCap)}
			/>

			<!-- End cap -->
			{#if m.endCap === 'dot'}
				<circle cx={ex0} cy={ey0} r={DOT_R} fill="#222"/>
			{:else if m.endCap === 'arrow'}
				<polygon points="-{ARROW_LEN},-5 0,0 -{ARROW_LEN},5" fill="#222"
					transform="translate({ex0},{ey0}) rotate({endAngle})"/>
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

			<!-- Full-line tap target -->
			{#if onMeasurementClick}
				<line
					x1={sx} y1={sy} x2={ex0} y2={ey0}
					stroke="transparent" stroke-width="24"
					style="cursor: pointer;"
					onclick={(e) => { e.stopPropagation(); onMeasurementClick(mi, e.clientX, e.clientY); }}
				/>
			{/if}
		{/each}

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

				<!-- Icon: runemark SVG or fallback letter -->
				{#if showRunemarks}
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
				{:else}
					<text
						x={BPAD + ICON_SZ / 2}
						y={BH / 2 + 8}
						text-anchor="middle"
						font-family="'Germania One', serif"
						font-size="24"
						fill="white"
					>{point.icon.charAt(0).toUpperCase()}</text>
				{/if}

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

		<!-- Position dots overlay — rendered on top of measurement lines and bubbles -->
		{#if showPositionDots}
			{#each ALL_POSITIONS as pos}
				{@const [px, py] = getCoords(pos)}
				{@const occupiedBy = occupancy.get(pos)}
				{@const isStart = pos === measurementStartPos}
				<g
					class="pos-group"
					class:pos-group--interactive={!!onPositionClick}
					onclick={(e) => onPositionClick?.(pos, e.clientX, e.clientY)}
				>
					<!-- Large tap target -->
					<circle cx={px} cy={py} r="22" fill="transparent"/>
					<!-- Measurement start highlight ring -->
					{#if isStart}
						<circle cx={px} cy={py} r="11" fill="none" stroke="#c0272d" stroke-width="3"/>
					{/if}
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




</style>
