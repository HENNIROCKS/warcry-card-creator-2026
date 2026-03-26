export interface Runemark {
	id: string;
	label: string;
	svg: string; // raw SVG string
}

export interface Weapon {
	name: string;
	range: string;    // e.g. "1" or "3-7"
	attacks: string;
	strength: string;
	damage: string;   // e.g. "2/3"
}

export interface DamageBracket {
	damageRange: string; // e.g. "0-10"
	move: string;
	damage: string;      // e.g. "4/8"
}

export interface FighterCardData {
	name: string;
	subtitle: string;
	modelImage: string | null; // data URL from file upload
	imageOffsetX: number; // 0–100, object-position x
	imageOffsetY: number; // 0–100, object-position y
	imageZoom: number;    // 1–3, scale factor
	imageCaption: string;
	grandAlliance: string;  // left top circle
	faction: string;        // left middle circle
	bladeborn: string;      // left bottom circle
	rightRunemarks: Runemark[]; // up to 3, top-right column
	baseSize: string;           // e.g. "ø 32"
	points: string;
	move: string;
	toughness: string;
	wounds: string;
	weapons: [Weapon, Weapon];
	isNamedCharacter: boolean;
	isMonster: boolean;
	showRunemarks: boolean;
	showSubtitle: boolean;
	showCaption: boolean;
	damageBrackets: DamageBracket[]; // typically 5 rows
}

export interface CardBackData {
	title: string;
	backgroundImage: string | null;
	imageOffsetX: number;
	imageOffsetY: number;
	imageZoom: number;
	runemark: string;
	textColor: 'white' | 'black' | 'red';
	showFlippedName: boolean;
}

export type DeploymentIconType = 'dagger' | 'shield' | 'hammer';
export type DeploymentColor = 'red' | 'blue' | 'green' | 'yellow';
export type DeploymentCapType = 'arrow' | 'tick' | 'dot' | 'none';
export type ZonePreset =
	| 'top-half' | 'bottom-half'
	| 'left-half' | 'right-half'
	| 'tl-quarter' | 'tr-quarter' | 'bl-quarter' | 'br-quarter';

// Inside 5×5 grid: R{row}C{col}, rows 1–5 top→bottom, cols 1–5 left→right
// R3C3 = exact battlefield centre (crosshair); R3 row and C3 col lie on the dashed centre lines
// Outside edges: OUT-T{1–5}, OUT-B{1–5}, OUT-L{1–5}, OUT-R{1–5}
// Outside corners: OUT-CNR-TL/TR/BL/BR
export type DeploymentPosition =
	| 'R1C1' | 'R1C2' | 'R1C3' | 'R1C4' | 'R1C5'
	| 'R2C1' | 'R2C2' | 'R2C3' | 'R2C4' | 'R2C5'
	| 'R3C1' | 'R3C2' | 'R3C3' | 'R3C4' | 'R3C5'
	| 'R4C1' | 'R4C2' | 'R4C3' | 'R4C4' | 'R4C5'
	| 'R5C1' | 'R5C2' | 'R5C3' | 'R5C4' | 'R5C5'
	| 'OUT-T1' | 'OUT-T2' | 'OUT-T3' | 'OUT-T4' | 'OUT-T5'
	| 'OUT-B1' | 'OUT-B2' | 'OUT-B3' | 'OUT-B4' | 'OUT-B5'
	| 'OUT-L1' | 'OUT-L2' | 'OUT-L3' | 'OUT-L4' | 'OUT-L5'
	| 'OUT-R1' | 'OUT-R2' | 'OUT-R3' | 'OUT-R4' | 'OUT-R5'
	| 'OUT-CNR-TL' | 'OUT-CNR-TR' | 'OUT-CNR-BL' | 'OUT-CNR-BR';

export interface DeploymentZone {
	preset: ZonePreset;
}

export interface DeploymentMeasurement {
	startPos: DeploymentPosition;
	endPos: DeploymentPosition;
	label: string;       // e.g. '8"'
	startCap: DeploymentCapType;
	endCap: DeploymentCapType;
}

export interface DeploymentPoint {
	position: DeploymentPosition;
	icon: DeploymentIconType;
	rnd: string;         // e.g. 'RND2'
}

export interface DeploymentPlayer {
	color: DeploymentColor;
	zones: DeploymentZone[];
	points: DeploymentPoint[];
}

export interface DeploymentCardData {
	name: string;
	players: DeploymentPlayer[];
	measurements: DeploymentMeasurement[];
}

export type ActivationType = 'double' | 'triple' | 'quad' | null;

export interface TextCardData {
	name: string;
	cardLabel: string;          // preset slug or custom string — see presetLabels in TextForm.svelte
	activationType: ActivationType;
	grandAlliance: string;
	faction: string;
	bladeborn: string;
	fighterRunemarks: Runemark[];
	showRunemarks: boolean;
	showActivation: boolean;
	showFlavorText: boolean;
	showPrerequisite: boolean;
	showPointsTable: boolean;
	flavorText: string;         // italic block; render order: flavor → points table → prerequisite → body
	prerequisiteText: string;   // framed box, shown after points table if non-empty
	bodyText: string;
	showCaption: boolean;
	imageCaption: string;
	regularPointsValue?: string; // points cost increases table (independent of card type)
	elitePointsValue?: string;   // points cost increases table (independent of card type)
}
