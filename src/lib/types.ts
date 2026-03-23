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
export type DeploymentColor = 'red' | 'blue';
export type DeploymentCapType = 'arrow' | 'tick' | 'none';
export type DeploymentDirection = 'up' | 'down' | 'left' | 'right';

// Inside: TL TC TR ML CC MR BL BC BR
// Outside: top-left top-center top-right right-center bottom-right bottom-center bottom-left left-center
export type DeploymentPosition =
	| 'TL' | 'TC' | 'TR'
	| 'ML' | 'CC' | 'MR'
	| 'BL' | 'BC' | 'BR'
	| 'OUT-TL' | 'OUT-TC' | 'OUT-TR'
	| 'OUT-RC'
	| 'OUT-BR' | 'OUT-BC' | 'OUT-BL'
	| 'OUT-LC';

export interface DeploymentMeasurement {
	direction: DeploymentDirection;
	label: string;        // e.g. '8"'
	startCap: DeploymentCapType;
	endCap: DeploymentCapType;
}

export interface DeploymentPoint {
	position: DeploymentPosition;
	icon: DeploymentIconType;
	color: DeploymentColor;
	rnd: string;          // e.g. 'RND2'
	measurements: DeploymentMeasurement[];
}

export interface DeploymentCardData {
	name: string;
	points: DeploymentPoint[];
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
	regularPointsValue?: string; // points cost increases table (independent of card type)
	elitePointsValue?: string;   // points cost increases table (independent of card type)
}
