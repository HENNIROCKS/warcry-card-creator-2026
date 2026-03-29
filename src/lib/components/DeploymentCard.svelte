<script lang="ts">
	import type { DeploymentCardData, DeploymentColor, DeploymentObjective, DeploymentPosition, DeploymentZone } from '$lib/types';
	import daggerRaw      from '$lib/runemarks/svg/deployment-dagger.svg?raw';
	import hammerRaw      from '$lib/runemarks/svg/deployment-hammer.svg?raw';
	import matchedPlayRaw from '$lib/runemarks/svg/card-decks-symmetrical.svg?raw';
	import orientationRaw from '$lib/runemarks/svg/twists-orientation.svg?raw';
	import shieldRaw      from '$lib/runemarks/svg/deployment-shield.svg?raw';

	let {
		data,
		printerFriendly = false,
		showRunemarks = true,
		showOrientation = true,
		showMatchedPlay = true,
		showPositionDots = false,
		measurementStartPos = undefined,
		zoneStartPos = undefined,
		onPositionClick = undefined,
		onMeasurementClick = undefined,
		onZoneClick = undefined,
	}: {
		data: DeploymentCardData;
		printerFriendly?: boolean;
		showRunemarks?: boolean;
		showOrientation?: boolean;
		showMatchedPlay?: boolean;
		showPositionDots?: boolean;
		measurementStartPos?: DeploymentPosition;
		zoneStartPos?: DeploymentPosition;
		onPositionClick?: (pos: DeploymentPosition, clientX: number, clientY: number) => void;
		onMeasurementClick?: (mi: number, clientX: number, clientY: number) => void;
		onZoneClick?: (pi: number, zi: number, clientX: number, clientY: number) => void;
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

	// Set of positions occupied by objectives
	const objectivePositions = $derived(
		new Set((data.objectives ?? []).map((o: DeploymentObjective) => o.position))
	);

	const ALL_POSITIONS: DeploymentPosition[] = [
		...Array.from({length: 7}, (_, r) =>
			Array.from({length: 9}, (_, c) => `R${r+1}C${c+1}` as DeploymentPosition)
		).flat(),
		'OUT-T1', 'OUT-T2', 'OUT-T3', 'OUT-T4', 'OUT-T5', 'OUT-T6', 'OUT-T7', 'OUT-T8', 'OUT-T9',
		'OUT-B1', 'OUT-B2', 'OUT-B3', 'OUT-B4', 'OUT-B5', 'OUT-B6', 'OUT-B7', 'OUT-B8', 'OUT-B9',
		'OUT-L1', 'OUT-L2', 'OUT-L3', 'OUT-L4', 'OUT-L5', 'OUT-L6', 'OUT-L7',
		'OUT-R1', 'OUT-R2', 'OUT-R3', 'OUT-R4', 'OUT-R5', 'OUT-R6', 'OUT-R7',
		'OUT-CNR-TL', 'OUT-CNR-TR', 'OUT-CNR-BL', 'OUT-CNR-BR',
	];

	// Strip outer <svg> wrapper and remove all fill attributes so paths
	// inherit the fill set on the outer <svg> element at render time.
	function innerContent(raw: string): string {
		return raw
			.replace(/<!--[\s\S]*?-->/g, '')
			.replace(/<\?xml[^>]*\?>/g, '')
			.replace(/<svg[^>]*>/g, '')
			.replace(/<\/svg>/g, '')
			.replace(/<title>[^<]*<\/title>/g, '')
			.replace(/\s*fill="[^"]*"/g, '')
			.trim();
	}

	const daggerInner     = innerContent(daggerRaw);
	const hammerInner     = innerContent(hammerRaw);
	const matchedPlayInner = innerContent(matchedPlayRaw);
	const orientationInner = innerContent(orientationRaw);
	const shieldInner     = innerContent(shieldRaw);

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
	// Outside top/bottom have 9 edge dots (matching 9 inside columns); left/right
	// have 7 edge dots (matching 7 inside rows). Corners bridge the gaps evenly.
	const CNR_L = 73;
	const CNR_R = 842;
	const CNR_T = 34;
	const CNR_B = 540;

	// Shape geometry
	const OBJECTIVE_R    = 16;  // objective circle radius
	const SHAPE_R        = 26;  // RND label anchor — uniform vertical position across all shapes
	const CIRCLE_R       = 22;  // circle radius — smaller than diamond for optical balance
	const ICON_SZ_DAGGER = 29;  // dagger icon
	const ICON_SZ_HAMMER = 28;  // hammer icon
	const ICON_SZ_SHIELD = 32;  // shield icon
	const RND_OFF        = 8;   // gap between shape top and RND label baseline

	const PLAYER_BADGES = ['①', '②', '③', '④'];

	// Zone → SVG rect bounds, derived from two grid positions
	function zoneRect(zone: DeploymentZone): { x: number; y: number; w: number; h: number } {
		const [x1, y1] = getCoords(zone.startPos);
		const [x2, y2] = getCoords(zone.endPos);
		return {
			x: Math.min(x1, x2),
			y: Math.min(y1, y2),
			w: Math.abs(x2 - x1),
			h: Math.abs(y2 - y1),
		};
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

	// Equilateral triangle, point-down, spanning cy - CIRCLE_R to cy + CIRCLE_R.
	// Same top and bottom extent as circle and diamond.
	// Height H = 2 * CIRCLE_R → half base-width = H / √3 = 2 * CIRCLE_R / √3
	const TRI_HW = 2 * CIRCLE_R / Math.sqrt(3);
	const triPoints = (cx: number, cy: number) =>
		`${cx - TRI_HW},${cy - CIRCLE_R} ${cx + TRI_HW},${cy - CIRCLE_R} ${cx},${cy + CIRCLE_R}`;

	const COLORS: Record<DeploymentColor, string> = {
		red:    '#c0272d',
		blue:   '#2563eb',
		green:  '#16a34a',
		yellow: '#f59e0b',
	};

	function getCoords(pos: DeploymentPosition): [number, number] {
		// Inside 7×9 grid — outermost positions land exactly on BF boundary.
		// C1=BF_L, C9=BF_R (step = BF_W/8); R1=BF_T, R7=BF_B (step = BF_H/6).
		const inside = pos.match(/^R(\d)C(\d)$/);
		if (inside) return [
			BF_L + (Number(inside[2]) - 1) * BF_W / 8,
			BF_T + (Number(inside[1]) - 1) * BF_H / 6,
		];
		// Outside T/B — same x as inside columns, sitting at the CNR rail y
		const outT = pos.match(/^OUT-T(\d)$/);
		if (outT) return [BF_L + (Number(outT[1]) - 1) * BF_W / 8, CNR_T];
		const outB = pos.match(/^OUT-B(\d)$/);
		if (outB) return [BF_L + (Number(outB[1]) - 1) * BF_W / 8, CNR_B];
		// Outside L/R — same y as inside rows, sitting at the CNR rail x
		const outL = pos.match(/^OUT-L(\d)$/);
		if (outL) return [CNR_L, BF_T + (Number(outL[1]) - 1) * BF_H / 6];
		const outR = pos.match(/^OUT-R(\d)$/);
		if (outR) return [CNR_R, BF_T + (Number(outR[1]) - 1) * BF_H / 6];
		if (pos === 'OUT-CNR-TR') return [CNR_R, CNR_T];
		if (pos === 'OUT-CNR-BL') return [CNR_L, CNR_B];
		if (pos === 'OUT-CNR-BR') return [CNR_R, CNR_B];
		return [CNR_L, CNR_T]; // OUT-CNR-TL
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

		<!-- Orientation runemark — top-left corner, 20px inset matching caption spacing -->
		{#if showOrientation}
			{@const rmFill = printerFriendly ? '#000' : '#5a0a14'}
			{#if showRunemarks}
				<svg x="20" y="20" width="32" height="32" viewBox="0 0 300 300" fill={rmFill} overflow="visible">
					{@html orientationInner}
				</svg>
			{:else}
				<text x="36" y="36" text-anchor="middle" dominant-baseline="central" font-family="'Germania One', serif" font-size="22" fill={rmFill}>↑</text>
			{/if}
		{/if}

		<!-- Matched Play runemark — top-right corner, 20px inset matching caption spacing -->
		{#if showMatchedPlay}
			{@const rmFill = printerFriendly ? '#000' : '#5a0a14'}
			{#if showRunemarks}
				<svg x="863" y="20" width="32" height="32" viewBox="0 0 300 300" fill={rmFill} overflow="visible">
					{@html matchedPlayInner}
				</svg>
			{:else}
				<text x="879" y="36" text-anchor="middle" dominant-baseline="central" font-family="'Germania One', serif" font-size="14" fill={rmFill}>MP</text>
			{/if}
		{/if}

		<!-- Deployment zone fills (behind dashed lines) -->
		{#each data.players as player, pi}
			{#each (player.zones ?? []) as zone, zi}
				{#if !zone.mask}
					{@const r = zoneRect(zone)}
					<rect
						x={r.x} y={r.y} width={r.w} height={r.h}
						fill={printerFriendly ? '#000' : COLORS[player.color]}
						fill-opacity={printerFriendly ? (PF_ZONE_OPACITIES[pi] ?? 0.08) : ZONE_OPACITY}
						stroke={printerFriendly ? '#000' : 'none'}
						stroke-width={printerFriendly ? '1' : '0'}
						stroke-dasharray={printerFriendly ? '4 3' : ''}
						style={onZoneClick ? 'cursor: pointer;' : ''}
						onclick={onZoneClick ? (e) => { e.stopPropagation(); onZoneClick(pi, zi, e.clientX, e.clientY); } : undefined}
					/>
				{/if}
			{/each}
		{/each}

		<!-- Mask zone circles — painted on top of regular fills, before dashed lines -->
		{#each data.players as player, pi}
			{#each (player.zones ?? []) as zone, zi}
				{#if zone.mask}
					{@const [cx, cy] = getCoords(zone.startPos)}
					{@const r = zone.radius ?? 89}
					<circle
						cx={cx} cy={cy} r={r}
						fill={printerFriendly ? 'white' : '#d9b8a8'}
						stroke={printerFriendly ? '#000' : 'none'}
						stroke-width={printerFriendly ? '1' : '0'}
						stroke-dasharray={printerFriendly ? '4 3' : ''}
						style={onZoneClick ? 'cursor: pointer;' : ''}
						onclick={onZoneClick ? (e) => { e.stopPropagation(); onZoneClick(pi, zi, e.clientX, e.clientY); } : undefined}
					/>
				{/if}
			{/each}
		{/each}

		<!-- Dashed centre lines — four arms radiating from centre so dashes originate at the cross -->
		<line x1={BF_CX} y1={BF_CY} x2={BF_CX} y2={BF_T} stroke={printerFriendly ? '#000' : '#333'} stroke-width="2" stroke-dasharray="8 6"/>
		<line x1={BF_CX} y1={BF_CY} x2={BF_CX} y2={BF_B} stroke={printerFriendly ? '#000' : '#333'} stroke-width="2" stroke-dasharray="8 6"/>
		<line x1={BF_CX} y1={BF_CY} x2={BF_L} y2={BF_CY} stroke={printerFriendly ? '#000' : '#333'} stroke-width="2" stroke-dasharray="8 6"/>
		<line x1={BF_CX} y1={BF_CY} x2={BF_R} y2={BF_CY} stroke={printerFriendly ? '#000' : '#333'} stroke-width="2" stroke-dasharray="8 6"/>

		<!-- Measurement lines — rendered below deployment shapes -->
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

		<!-- Objective markers — rendered below deployment point shapes -->
	{#each (data.objectives ?? []) as obj}
		{@const [cx, cy] = getCoords(obj.position)}
		<circle cx={cx} cy={cy} r={OBJECTIVE_R} fill="#000"/>
	{/each}

	<!-- Deployment point shapes -->
		{#each data.players as player, pi}
			{#each player.points as point}
				{@const [cx, cy] = getCoords(point.position)}
				{@const fillColor   = printerFriendly ? 'white' : COLORS[player.color]}
				{@const strokeColor = printerFriendly ? '#000' : 'none'}
				{@const iconColor   = printerFriendly || player.color === 'yellow' ? '#000' : 'white'}

	
				<!-- Shape -->
				{#if point.icon === 'shield'}
					<circle cx={cx} cy={cy} r={CIRCLE_R} fill={fillColor} stroke={strokeColor} stroke-width="1.5"/>
				{:else if point.icon === 'hammer'}
					<polygon
						points="{cx},{cy - CIRCLE_R} {cx + CIRCLE_R},{cy} {cx},{cy + CIRCLE_R} {cx - CIRCLE_R},{cy}"
						fill={fillColor} stroke={strokeColor} stroke-width="1.5"
					/>
				{:else}
					<!-- dagger = triangle, point down -->
					<polygon points={triPoints(cx, cy)} fill={fillColor} stroke={strokeColor} stroke-width="1.5"/>
				{/if}

				<!-- Icon centered inside shape -->
				{#if showRunemarks}
					{@const sz = point.icon === 'shield' ? ICON_SZ_SHIELD : point.icon === 'dagger' ? ICON_SZ_DAGGER : ICON_SZ_HAMMER}
					{@const iconCy = point.icon === 'dagger' ? cy - CIRCLE_R / 3 + 2 : cy}
					<svg
						x={cx - sz / 2} y={iconCy - sz / 2}
						width={sz} height={sz}
						viewBox={iconViewBox[point.icon]}
						fill={iconColor}
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
						x={cx}
						y={point.icon === 'dagger' ? cy - CIRCLE_R / 6 : cy}
						text-anchor="middle"
						dominant-baseline="central"
						font-family="'Germania One', serif"
						font-size="24"
						fill={iconColor}
					>{point.icon.charAt(0).toUpperCase()}</text>
				{/if}

			{/each}
		{/each}

		<!-- Position dots overlay — rendered on top of measurement lines and shapes -->
		{#if showPositionDots}
			{#each ALL_POSITIONS as pos}
				{@const [px, py] = getCoords(pos)}
				{@const occupiedBy = occupancy.get(pos)}
				{@const isObjective = objectivePositions.has(pos)}
				{@const isStart = pos === measurementStartPos || pos === zoneStartPos}
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
						class:pos-dot--objective={isObjective}
						style={occupiedBy ? `fill: ${COLORS[occupiedBy]}; stroke: white;` : ''}
					/>
				</g>
			{/each}
		{/if}

	<!-- Player badges — printer-friendly, rendered last to sit above all shapes and lines -->
	{#if printerFriendly}
		{#each data.players as player, pi}
			{#each player.points as point}
				{@const [cx, cy] = getCoords(point.position)}
				<circle cx={cx - CIRCLE_R - 10} cy={cy} r="9" fill="white"/>
				<text
					x={cx - CIRCLE_R - 4}
					y={cy}
					text-anchor="end"
					dominant-baseline="central"
					font-family="'Germania One', serif"
					font-size="14"
					fill="#000"
				>{PLAYER_BADGES[pi]}</text>
			{/each}
		{/each}
	{/if}

	</svg>

	<!-- RND labels — HTML divs so background is a clean rectangle -->
	{#each data.players as player}
		{#each player.points as point}
			{#if point.rnd}
				{@const [cx, cy] = getCoords(point.position)}
				<div class="rnd-label" class:rnd-label--pf={printerFriendly} style="left:{cx}px; top:{cy - SHAPE_R - RND_OFF - 4}px">{point.rnd}</div>
			{/if}
		{/each}
	{/each}

	<!-- Objective labels — HTML divs so background sizes to text width -->
	{#each (data.objectives ?? []) as obj}
		{#if obj.label}
			{@const [cx, cy] = getCoords(obj.position)}
			<div class="objective-label" class:objective-label--pf={printerFriendly} style="left:{cx}px; top:{cy + OBJECTIVE_R + 4}px">{obj.label}</div>
		{/if}
	{/each}

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

	.rnd-label {
		position: absolute;
		transform: translate(-50%, -50%);
		background: #faf6f3;
		border: none;
		outline: none;
		box-shadow: none;
		border-radius: 4px;
		padding: 2px 6px;
		font-family: 'Germania One', serif;
		font-size: 14px;
		color: #000;
		white-space: nowrap;
		line-height: 1.2;
		pointer-events: none;
	}

	.rnd-label--pf {
		background: white;
	}

	.objective-label {
		position: absolute;
		transform: translate(-50%, 0);
		background: #000;
		border: none;
		outline: none;
		box-shadow: none;
		border-radius: 4px;
		padding: 2px 6px;
		font-family: 'Germania One', serif;
		font-size: 13px;
		color: #faf6f3;
		white-space: nowrap;
		line-height: 1.2;
		pointer-events: none;
	}

	.pos-dot--objective {
		fill: #000;
		stroke: #faf6f3;
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
