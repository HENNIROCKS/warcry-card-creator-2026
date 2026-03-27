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

// Inside 7×9 grid: R{row}C{col}, rows 1–7 top→bottom, cols 1–9 left→right
// R4C5 = exact battlefield centre (crosshair); R4 row and C5 col lie on the dashed centre lines
// Outside edges: OUT-T{1–9}, OUT-B{1–9} (9, matching cols), OUT-L{1–7}, OUT-R{1–7} (7, matching rows)
// Outside corners: OUT-CNR-TL/TR/BL/BR
export type DeploymentPosition =
	| 'R1C1' | 'R1C2' | 'R1C3' | 'R1C4' | 'R1C5' | 'R1C6' | 'R1C7' | 'R1C8' | 'R1C9'
	| 'R2C1' | 'R2C2' | 'R2C3' | 'R2C4' | 'R2C5' | 'R2C6' | 'R2C7' | 'R2C8' | 'R2C9'
	| 'R3C1' | 'R3C2' | 'R3C3' | 'R3C4' | 'R3C5' | 'R3C6' | 'R3C7' | 'R3C8' | 'R3C9'
	| 'R4C1' | 'R4C2' | 'R4C3' | 'R4C4' | 'R4C5' | 'R4C6' | 'R4C7' | 'R4C8' | 'R4C9'
	| 'R5C1' | 'R5C2' | 'R5C3' | 'R5C4' | 'R5C5' | 'R5C6' | 'R5C7' | 'R5C8' | 'R5C9'
	| 'R6C1' | 'R6C2' | 'R6C3' | 'R6C4' | 'R6C5' | 'R6C6' | 'R6C7' | 'R6C8' | 'R6C9'
	| 'R7C1' | 'R7C2' | 'R7C3' | 'R7C4' | 'R7C5' | 'R7C6' | 'R7C7' | 'R7C8' | 'R7C9'
	| 'OUT-T1' | 'OUT-T2' | 'OUT-T3' | 'OUT-T4' | 'OUT-T5' | 'OUT-T6' | 'OUT-T7' | 'OUT-T8' | 'OUT-T9'
	| 'OUT-B1' | 'OUT-B2' | 'OUT-B3' | 'OUT-B4' | 'OUT-B5' | 'OUT-B6' | 'OUT-B7' | 'OUT-B8' | 'OUT-B9'
	| 'OUT-L1' | 'OUT-L2' | 'OUT-L3' | 'OUT-L4' | 'OUT-L5' | 'OUT-L6' | 'OUT-L7'
	| 'OUT-R1' | 'OUT-R2' | 'OUT-R3' | 'OUT-R4' | 'OUT-R5' | 'OUT-R6' | 'OUT-R7'
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

export interface DeploymentObjective {
	position: DeploymentPosition;
	label: string;
}

export interface DeploymentCardData {
	name: string;
	players: DeploymentPlayer[];
	measurements: DeploymentMeasurement[];
	objectives?: DeploymentObjective[];
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
	layoutVariant?: 'standard' | 'banderole';
	regularPointsValue?: string; // points cost increases table (independent of card type)
	elitePointsValue?: string;   // points cost increases table (independent of card type)
}
