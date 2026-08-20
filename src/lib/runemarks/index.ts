// Alliance / faction / subfaction data — see hierarchy.ts
export { hierarchy, PLACEHOLDER_SVG, getAllianceFile, getFactionFile, getSubfactionFile, getFactions, getSubfactions, findFactionFile, findSubfactionFile } from './hierarchy';

// ── Weapon runemarks ─────────────────────────────────────────────────────────

export const weaponRunemarks: Record<string, string> = {
	Axe:            'weapons-axe',
	Bident:         'weapons-bident',
	Blast:          'weapons-blast',
	Claws:          'weapons-claws',
	Club:           'weapons-club',
	Dagger:         'weapons-dagger',
	Fangs:          'weapons-fangs',
	Hammer:         'weapons-hammer',
	Hook:           'weapons-hook',
	Mace:           'weapons-mace',
	Pistol:         'weapons-pistol',
	'Ranged Weapon': 'weapons-ranged-weapon',
	'Reach Weapon':  'weapons-reach-weapon',
	Scythe:         'weapons-scythe',
	Spear:          'weapons-spear',
	Sword:          'weapons-sword',
	Unarmed:        'weapons-unarmed',
};

// ── Fighter runemarks ─────────────────────────────────────────────────────────

export const fighterRunemarks: Record<string, string> = {
	Agile:          'fighters-agile',
	Ally:           'fighters-ally',
	Beast:          'fighters-beast',
	Berserker:      'fighters-berserker',
	Bladeborn:      'fighters-bladeborn',
	Brute:          'fighters-brute',
	Bulwark:        'fighters-bulwark',
	Champion:       'fighters-champion',
	Destroyer:      'fighters-destroyer',
	Elite:          'fighters-elite',
	Ferocious:      'fighters-ferocious',
	Fly:            'fighters-fly',
	Frenzied:       'fighters-frenzied',
	Hero:           'fighters-hero',
	'Icon Bearer':  'fighters-icon-bearer',
	Minion:         'fighters-minion',
	Monster:        'fighters-monster',
	Mount:          'fighters-mount',
	Mystic:         'fighters-mystic',
	Priest:         'fighters-priest',
	Scout:          'fighters-scout',
	Sentience:      'fighters-sentience',
	Terrifying:     'fighters-terrifying',
	Thrall:         'fighters-thrall',
	Trapper:        'fighters-trapper',
	Warrior:        'fighters-warrior',
};

// ── Card deck runemarks ───────────────────────────────────────────────────────

export const cardDecksRunemarks: Record<string, string> = {
	deployment:            'card-decks-deployment',
	'scales-of-talaxis':   'card-decks-scales-of-talaxis',
	symmetrical:           'card-decks-symmetrical',
	terrain:               'card-decks-terrain',
	twist:                 'card-decks-twist',
	victory:               'card-decks-victory',
};

// ── Deployment runemarks ──────────────────────────────────────────────────────

export const deploymentRunemarks: Record<string, string> = {
	dagger: 'deployment-dagger',
	hammer: 'deployment-hammer',
	shield: 'deployment-shield',
};

// ── Misc runemarks ────────────────────────────────────────────────────────────

export const miscRunemarks: Record<string, string> = {
	active: 'misc-active',
	circle: 'misc-circle',
	wait:   'misc-wait',
	warcry: 'misc-warcry',
	whu:    'misc-whu',
};

// ── Treasure runemarks ────────────────────────────────────────────────────────

export const treasureRunemarks: Record<string, string> = {
	creature:   'treasure-creature',
	orrery:     'treasure-orrery',
	potions:    'treasure-potions',
	realmstone: 'treasure-realmstone',
	skull:      'treasure-skull',
	supplies:   'treasure-supplies',
	totem:      'treasure-totem',
	weapons:    'treasure-weapons',
};

// ── Twist runemarks ───────────────────────────────────────────────────────────

export const twistsRunemarks: Record<string, string> = {
	climate:              'twists-climate',
	environment:          'twists-environment',
	fate:                 'twists-fate',
	'magical-phenomenon': 'twists-magical-phenomenom',
	orientation:          'twists-orientation',
	psychology:           'twists-psychology',
	'wild-creatures':     'twists-wild-creatures',
};

// ── Characteristic runemarks ──────────────────────────────────────────────────

export const characteristicRunemarks: Record<string, string> = {
	move: 'characteristics-move',
	toughness: 'characteristics-toughness',
	wounds: 'characteristics-wounds',
	range: 'characteristics-range',
	attacks: 'characteristics-attacks',
	strength: 'characteristics-strength',
	damage: 'characteristics-damage',
};
