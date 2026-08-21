// ── Grand Alliances ──────────────────────────────────────────────────────────

// ── Monsters ─────────────────────────────────────────────────────────────────

// ── Chaos factions ───────────────────────────────────────────────────────────

// ── Chaos subfactions / bladeborn ────────────────────────────────────────────

// ── Death factions ───────────────────────────────────────────────────────────

// ── Death subfactions / bladeborn ─────────────────────────────────────────────

// ── Destruction factions ─────────────────────────────────────────────────────

// ── Destruction subfactions / bladeborn ──────────────────────────────────────

// ── Cities of Sigmar subfactions ──────────────────────────────────────────────

// ── Order factions ────────────────────────────────────────────────────────────

// ── Order subfactions / bladeborn ─────────────────────────────────────────────

// ── Types ────────────────────────────────────────────────────────────────────

export interface SubfactionEntry {
	id: string;
	label: string;
	file: string | null; // null = no runemark available yet
}

export interface FactionEntry {
	id: string;
	label: string;
	file: string | null;
	subfactions: SubfactionEntry[];
}

export interface AllianceEntry {
	id: string;
	label: string;
	file: string;
	factions: FactionEntry[];
}

// Placeholder rendered when an entry is selected but has no SVG yet.
export const PLACEHOLDER_SVG =
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">` +
	`<path d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11` +
	`L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41` +
	`L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z"/>` +
	`</svg>`;

// ── Hierarchy (all levels sorted A → Z) ──────────────────────────────────────

export const hierarchy: AllianceEntry[] = [
	{
		id: 'agents-of-chaos',
		label: 'Agents of Chaos',
		file: 'grand-alliances-chaos',
		factions: [
			{
				id: 'beasts-of-chaos',
				label: 'Beasts of Chaos', file: 'factions-chaos-beasts-of-chaos',
				subfactions: [
					{ id: 'grashraks-despoilers', label: "Grashrak's Despoilers", file: 'factions-chaos-bladeborn-grashraks-despoilers' },
				],
			},
			{
				id: 'blades-of-khorne-bloodbound',
				label: 'Blades of Khorne: Bloodbound', file: 'factions-chaos-khorne-bloodbound',
				subfactions: [
					{ id: 'garreks-reavers',    label: "Garrek's Reavers",    file: 'factions-chaos-bladeborn-garreks-reavers' },
					{ id: 'gorechosen-of-dromm', label: 'Gorechosen of Dromm', file: 'factions-chaos-bladeborn-gorechhosen-of-dromm' },
					{ id: 'kamandoras-blades',  label: "Kamandora's Blades",  file: 'factions-chaos-bladeborn-kamandoras-blades' },
					{ id: 'magores-fiends',     label: "Magore's Fiends",     file: 'factions-chaos-bladeborn-magores-fiends' },
				],
			},
			{ id: 'blades-of-khorne-claws-of-karanak', label: 'Blades of Khorne: Claws of Karanak', file: 'factions-chaos-claws-of-karanak',  subfactions: [] },
			{ id: 'blades-of-khorne-daemons',          label: 'Blades of Khorne: Daemons',          file: 'factions-chaos-khorne-daemons',   subfactions: [] },
			{
				id: 'disciples-of-tzeentch-arcanites',
				label: 'Disciples of Tzeentch: Arcanites', file: 'factions-chaos-tzeentch-arcanites',
				subfactions: [
					{ id: 'eyes-of-the-nine', label: 'Eyes of the Nine', file: 'factions-chaos-bladeborn-eyes-of-the-nine' },
				],
			},
			{
				id: 'disciples-of-tzeentch-daemons',
				label: 'Disciples of Tzeentch: Daemons', file: 'factions-chaos-tzeentch-daemons',
				subfactions: [
					{ id: 'ephilims-pandaemonium', label: "Ephilim's Pandaemonium", file: 'factions-chaos-bladeborn-ephilims-pandaemonium' },
				],
			},
			{ id: 'disciples-of-tzeentch-jade-obelisk', label: 'Disciples of Tzeentch: Jade Obelisk', file: 'factions-chaos-jade-obelisk',    subfactions: [] },
			{
				id: 'hedonites-of-slaanesh-daemons',
				label: 'Hedonites of Slaanesh: Daemons', file: 'factions-chaos-slaanesh-daemons',
				subfactions: [
					{ id: 'thricefold-discord', label: 'Thricefold Discord', file: 'factions-chaos-bladeborn-thricefold-discord' },
				],
			},
			{
				id: 'hedonites-of-slaanesh-sybarites',
				label: 'Hedonites of Slaanesh: Sybarites', file: 'factions-chaos-slaanesh-sybarites',
				subfactions: [
					{ id: 'the-dread-pageant', label: 'The Dread Pageant', file: 'factions-chaos-bladeborn-the-dread-pageant' },
				],
			},
			{
				id: 'helsmiths-of-hashut',
				label: 'Helsmiths of Hashut', file: 'factions-chaos-helsmiths-of-hashut',
				subfactions: [
					{ id: 'blood-of-the-bull', label: 'Blood of the Bull', file: 'factions-chaos-bladeborn-blood-of-the-bull' },
				],
			},
			{
				id: 'maggotkin-of-nurgle-daemons',
				label: 'Maggotkin of Nurgle: Daemons', file: 'factions-chaos-nurgle-daemons',
				subfactions: [
					{ id: 'grandfathers-gardeners', label: "Grandfather's Gardeners", file: 'factions-chaos-bladeborn-grandfathers-gardeners' },
				],
			},
			{
				id: 'maggotkin-of-nurgle-rotbringers',
				label: 'Maggotkin of Nurgle: Rotbringers', file: 'factions-chaos-nurgle-rotbringers',
				subfactions: [
					{ id: 'the-wurmspat', label: 'The Wurmspat', file: 'factions-chaos-bladeborn-the-wurmspat' },
				],
			},
			{ id: 'maggotkin-of-nurgle-rotmire-creed',    label: 'Maggotkin of Nurgle: Rotmire Creed', file: 'factions-chaos-rotmire-creed',    subfactions: [] },
			{ id: 'monsters-of-chaos-chaotic-beasts',     label: 'Monsters of Chaos (Chaotic Beasts)',  file: 'monsters-chaotic-beasts',   subfactions: [] },
			{
				id: 'skaven',
				label: 'Skaven', file: 'factions-chaos-skaven',
				subfactions: [
					{ id: 'skabbiks-plaguepack',    label: "Skabbik's Plaguepack",    file: 'factions-chaos-bladeborn-skabbiks-plaguepack' },
					{ id: 'skittershanks-clawpack', label: "Skittershank's Clawpack", file: 'factions-chaos-bladeborn-skittershanks-clawpack' },
					{ id: 'spiteclaws-swarm',       label: "Spiteclaw's Swarm",       file: 'factions-chaos-bladeborn-spiteclaws-swarm' },
					{ id: 'zikkits-tunnelpack',     label: "Zikkit's Tunnelpack",     file: 'factions-chaos-bladeborn-zikkits-tunnelpack' },
				],
			},
			{
				id: 'slaves-to-darkness',
				label: 'Slaves to Darkness', file: 'factions-chaos-slaves-to-darkness',
				subfactions: [
					{ id: 'gnarlspirit-pack',  label: 'Gnarlspirit Pack',  file: 'factions-chaos-bladeborn-gnarlspirit-pack' },
					{ id: 'godsworn-hunt',     label: 'Godsworn Hunt',     file: 'factions-chaos-bladeborn-godsworn-hunt' },
					{ id: 'khagras-ravagers',  label: "Khagra's Ravagers", file: 'factions-chaos-bladeborn-khagras-ravagers' },
				],
			},
			{ id: 'slaves-to-darkness-chaos-legionnaires',  label: 'Slaves to Darkness: Chaos Legionnaires',  file: 'factions-chaos-chaos-legionnaires', subfactions: [] },
			{ id: 'slaves-to-darkness-corvus-cabal',        label: 'Slaves to Darkness: Corvus Cabal',        file: 'factions-chaos-corvus-cabal',       subfactions: [] },
			{ id: 'slaves-to-darkness-cypher-lords',        label: 'Slaves to Darkness: Cypher Lords',        file: 'factions-chaos-cypher-lords',       subfactions: [] },
			{
				id: 'slaves-to-darkness-darkoath',
				label: 'Slaves to Darkness: Darkoath', file: 'factions-chaos-darkoath',
				subfactions: [
					{ id: 'brands-oathbound', label: "Brand's Oathbound", file: 'factions-chaos-darkoath' },
				],
			},
			{ id: 'slaves-to-darkness-darkoath-savagers',   label: 'Slaves to Darkness: Darkoath Savagers',   file: 'factions-chaos-darkoath-savagers',  subfactions: [] },
			{ id: 'slaves-to-darkness-everchosen',          label: 'Slaves to Darkness: Everchosen',          file: 'factions-chaos-everchosen',         subfactions: [] },
			{ id: 'slaves-to-darkness-iron-golem',          label: 'Slaves to Darkness: Iron Golem',          file: 'factions-chaos-iron-golems',         subfactions: [] },
			{ id: 'slaves-to-darkness-scions-of-the-flame', label: 'Slaves to Darkness: Scions of the Flame', file: 'factions-chaos-scions-of-the-flame',   subfactions: [] },
			{ id: 'slaves-to-darkness-spire-tyrants',       label: 'Slaves to Darkness: Spire Tyrants',       file: 'factions-chaos-spire-tyrants',       subfactions: [] },
			{ id: 'slaves-to-darkness-splintered-fang',     label: 'Slaves to Darkness: Splintered Fang',     file: 'factions-chaos-splintered-fang',     subfactions: [] },
			{ id: 'slaves-to-darkness-tarantulos-brood',    label: 'Slaves to Darkness: Tarantulos Brood',    file: 'factions-chaos-tarantulos-brood',    subfactions: [] },
			{ id: 'slaves-to-darkness-the-horns-of-hashut', label: 'Slaves to Darkness: The Horns of Hashut', file: 'factions-chaos-horns-of-hashut',      subfactions: [] },
			{ id: 'slaves-to-darkness-the-unmade',          label: 'Slaves to Darkness: The Unmade',          file: 'factions-chaos-the-unmade',          subfactions: [] },
			{ id: 'slaves-to-darkness-untamed-beasts',      label: 'Slaves to Darkness: Untamed Beasts',      file: 'factions-chaos-untamed-beasts',      subfactions: [] },
		],
	},

	{
		id: 'bringers-of-death',
		label: 'Bringers of Death',
		file: 'grand-alliances-death',
		factions: [
			{
				id: 'flesh-eater-courts',
				label: 'Flesh-eater Courts', file: 'factions-death-flesh-eater-courts',
				subfactions: [
					{ id: 'skinnerkin',    label: 'Skinnerkin',    file: 'factions-death-bladeborn-skinnerkin' },
					{ id: 'the-grymwatch', label: 'The Grymwatch', file: 'factions-death-bladeborn-the-grymwatch' },
				],
			},
			{ id: 'flesh-eater-courts-royal-beastflayers',    label: 'Flesh-eater Courts: Royal Beastflayers',    file: 'factions-death-royal-beastflayers', subfactions: [] },
			{ id: 'legions-of-nagash',                        label: 'Legions of Nagash',                        file: 'factions-death-legions-of-nagash',   subfactions: [] },
			{ id: 'monsters-of-death',                        label: 'Monsters of Death',                        file: 'monsters-of-death',   subfactions: [] },
			{
				id: 'nighthaunt',
				label: 'Nighthaunt', file: 'factions-death-nighthaunt',
				subfactions: [
					{ id: 'headmans-curse',            label: "The Headman's Curse",       file: 'factions-death-bladeborn-headmans-curse' },
					{ id: 'thorns-of-the-briar-queen', label: 'Thorns of the Briar Queen', file: 'factions-death-bladeborn-thorns-of-the-briar-queen' },
				],
			},
			{ id: 'nighthaunt-pyregheists',                   label: 'Nighthaunt: Pyregheists',                  file: 'factions-death-pyregheists',       subfactions: [] },
			{
				id: 'ossiarch-bonereapers',
				label: 'Ossiarch Bonereapers', file: 'factions-death-ossiarch-bonereapers',
				subfactions: [
					{ id: 'kainans-reapers', label: "Kainan's Reapers", file: 'factions-death-bladeborn-kainans-reapers' },
					{ id: 'thanateks-tithe', label: "Thanatek's Tithe",  file: 'factions-death-bladeborn-thanateks-tithe' },
				],
			},
			{ id: 'ossiarch-bonereapers-teratic-cohort',      label: 'Ossiarch Bonereapers: Teratic Cohort',     file: 'factions-death-teratic-cohort',     subfactions: [] },
			{
				id: 'soulblight-gravelords',
				label: 'Soulblight Gravelords', file: 'factions-death-soulblight-gravelords',
				subfactions: [
					{ id: 'sons-of-velmorn',         label: 'Sons of Velmorn',               file: 'factions-death-bladeborn-sons-of-velmorn' },
					{ id: 'blades-of-the-hollow-king', label: 'The Blades of the Hollow King', file: 'factions-death-bladeborn-blades-of-the-hollow-king' },
					{ id: 'the-crimson-court',       label: 'The Crimson Court',             file: 'factions-death-bladeborn-the-crimson-court' },
					{ id: 'the-exiled-dead',         label: 'The Exiled Dead',               file: 'factions-death-bladeborn-the-exiled-dead' },
					{ id: 'the-sepulchral-guard',    label: 'The Sepulchral Guard',          file: 'factions-death-bladeborn-sepulchral-guard' },
					{ id: 'zondaras-gravebreakers',  label: "Zondara's Gravebreakers",       file: 'factions-death-bladeborn-zondaras-gravebreakers' },
				],
			},
			{ id: 'soulblight-gravelords-askurgan-trueblades', label: 'Soulblight Gravelords: Askurgan Trueblades', file: 'factions-death-askurgan-trueblades', subfactions: [] },
		],
	},

	{
		id: 'harbingers-of-destruction',
		label: 'Harbingers of Destruction',
		file: 'grand-alliances-destruction',
		factions: [
			{
				id: 'bonesplitterz',
				label: 'Bonesplitterz', file: 'factions-destruction-bonesplitterz',
				subfactions: [
					{ id: 'hedkrakkas-madmob', label: "Hedkrakka's Madmob", file: 'factions-destruction-bladeborn-hedkrakkas-madmob' },
				],
			},
			{
				id: 'gloomspite-gitz',
				label: 'Gloomspite Gitz', file: 'factions-destruction-gloomspite-gitz',
				subfactions: [
					{ id: 'borgits-beastgrabbaz', label: "Borgit's Beastgrabbaz", file: 'factions-destruction-bladeborn-borgits-beastgrabbaz' },
					{ id: 'grinkraks-looncourt',  label: "Grinkrak's Looncourt",  file: 'factions-destruction-bladeborn-grinkraks-looncourt' },
					{ id: 'mollogs-mob',          label: "Mollog's Mob",          file: 'factions-destruction-bladeborn-mollogs-mob' },
					{ id: 'rippas-snarlfangs',    label: "Rippa's Snarlfangs",    file: 'factions-destruction-bladeborn-rippas-snarlfangs' },
					{ id: 'zarbags-gitz',         label: "Zarbag's Gitz",         file: 'factions-destruction-bladeborn-zarbags-gitz' },
				],
			},
			{ id: 'gloomspite-gitz-gobbapalooza', label: 'Gloomspite Gitz: Gobbapalooza', file: 'factions-destruction-gloomspite-gitz', subfactions: [] },
			{
				id: 'ironjawz',
				label: 'Ironjawz', file: 'factions-destruction-ironjawz',
				subfactions: [
					{ id: 'ironskulls-boyz', label: "Ironskull's Boyz", file: 'factions-destruction-bladeborn-ironskulls-boyz' },
					{ id: 'morgoks-krushas', label: "Morgok's Krushas", file: 'factions-destruction-bladeborn-morgoks-krushas' },
				],
			},
			{
				id: 'kruleboyz',
				label: 'Kruleboyz', file: 'factions-destruction-kruleboyz',
				subfactions: [
					{ id: 'da-kunnin-krew',    label: "Da Kunnin' Krew",    file: 'factions-destruction-bladeborn-da-kunnin-krew' },
					{ id: 'daggoks-stab-ladz', label: "Daggok's Stab-ladz", file: 'factions-destruction-bladeborn-daggoks-stab-ladz' },
				],
			},
			{ id: 'kruleboyz-monsta-killaz',      label: 'Kruleboyz: Monsta-killaz',      file: 'factions-destruction-monsta-killaz',  subfactions: [] },
			{ id: 'monsters-of-destruction',      label: 'Monsters of Destruction',       file: 'monsters-of-destruction',  subfactions: [] },
			{
				id: 'ogor-mawtribes',
				label: 'Ogor Mawtribes', file: 'factions-destruction-ogor-mawtribes',
				subfactions: [
					{ id: 'blackpowders-buccaneers', label: "Blackpowder's Buccaneers", file: 'factions-destruction-bladeborn-blackpowders-buccaneers' },
					{ id: 'hrothgorns-mantrappers',  label: "Hrothgorn's Mantrappers",  file: 'factions-destruction-bladeborn-hrothgorns-mantrappers' },
				],
			},
			{ id: 'ogor-mawtribes-gorger-mawpack', label: 'Ogor Mawtribes: Gorger Mawpack', file: 'factions-destruction-gorger-mawpack', subfactions: [] },
		],
	},

	{
		id: 'sentinels-of-order',
		label: 'Sentinels of Order',
		file: 'grand-alliances-order',
		factions: [
			{
				id: 'cities-of-sigmar',
				label: 'Cities of Sigmar', file: 'factions-order-cities-of-sigmar',
				subfactions: [
					{ id: 'brethren-of-the-bolt', label: 'Brethren of the Bolt', file: 'factions-order-bladeborn-brethren-of-the-bolt' },
				],
			},
			{ id: 'cities-of-sigmar-alternative',        label: 'Cities of Sigmar (Alternative)',        file: 'factions-order-cities-of-sigmar-alternative',    subfactions: [] },
			{ id: 'cities-of-sigmar-anvilgard',          label: 'Cities of Sigmar: Anvilgard',          file: 'factions-order-cities-of-sigmar-anvilgard',         subfactions: [] },
			{ id: 'cities-of-sigmar-castelite-hosts',    label: 'Cities of Sigmar: Castelite Hosts',    file: 'factions-order-cities-of-sigmar-castelite-hosts',    subfactions: [] },
			{ id: 'cities-of-sigmar-darkling-covens',    label: 'Cities of Sigmar: Darkling Covens',    file: 'factions-order-cities-of-sigmar-darkling-covens',    subfactions: [] },
			{ id: 'cities-of-sigmar-dispossessed',       label: 'Cities of Sigmar: Dispossessed',       file: 'factions-order-cities-of-sigmar-dispossessed',      subfactions: [] },
			{ id: 'cities-of-sigmar-greywater-fastness', label: 'Cities of Sigmar: Greywater Fastness', file: 'factions-order-cities-of-sigmar-greywater-fastness', subfactions: [] },
			{ id: 'cities-of-sigmar-hallowheart',        label: 'Cities of Sigmar: Hallowheart',        file: 'factions-order-cities-of-sigmar-hallowheart',       subfactions: [] },
			{ id: 'cities-of-sigmar-hammerhal',          label: 'Cities of Sigmar: Hammerhal',          file: 'factions-order-cities-of-sigmar-hammerhal',         subfactions: [] },
			{
				id: 'cities-of-sigmar-order-of-azyr',
				label: 'Cities of Sigmar: Order of Azyr', file: 'factions-order-order-of-azyr',
				subfactions: [
					{ id: 'hexbanes-hunters', label: "Hexbane's Hunters", file: 'factions-order-bladeborn-hexbanes-hunters' },
				],
			},
			{ id: 'cities-of-sigmar-tempests-eye',       label: "Cities of Sigmar: Tempest's Eye",      file: 'factions-order-cities-of-sigmar-tempests-eye',       subfactions: [] },
			{ id: 'cities-of-sigmar-the-living-city',    label: 'Cities of Sigmar: The Living City',    file: 'factions-order-cities-of-sigmar-the-living-city',     subfactions: [] },
			{ id: 'cities-of-sigmar-the-phoenicium',     label: 'Cities of Sigmar: The Phoenicium',     file: 'factions-order-cities-of-sigmar-the-phoenicium',    subfactions: [] },
			{ id: 'cities-of-sigmar-wildercorps-hunters', label: 'Cities of Sigmar: Wildercorps Hunters', file: 'factions-order-wildercorps-hunters',  subfactions: [] },
			{
				id: 'daughters-of-khaine',
				label: 'Daughters of Khaine', file: 'factions-order-daughters-of-khaine',
				subfactions: [
					{ id: 'gryselles-arenai',       label: "Gryselle's Arenai",       file: 'factions-order-bladeborn-gryselles-arenai' },
					{ id: 'morgwaeths-blade-coven', label: "Morgwaeth's Blade-coven", file: 'factions-order-bladeborn-morgwaeths-bladecoven' },
					{ id: 'knives-of-the-crone',    label: 'The Knives of the Crone', file: 'factions-order-bladeborn-knives-of-the-crone' },
					{ id: 'the-shadeborn',          label: 'The Shadeborn',           file: 'factions-order-bladeborn-the-shadeborn' },
				],
			},
			{ id: 'daughters-of-khaine-khainite-shadowstalkers', label: 'Daughters of Khaine: Khainite Shadowstalkers', file: 'factions-order-khainite-shadowstalkers', subfactions: [] },
			{
				id: 'fyreslayers',
				label: 'Fyreslayers', file: 'factions-order-fyreslayers',
				subfactions: [
					{ id: 'the-chosen-axes', label: 'The Chosen Axes', file: 'factions-order-bladeborn-the-chosen-axes' },
				],
			},
			{ id: 'fyreslayers-vulkyn-flameseekers',     label: 'Fyreslayers: Vulkyn Flameseekers',     file: 'factions-order-vulkyn-flameseekers',   subfactions: [] },
			{ id: 'grombrindal',                         label: 'Grombrindal',                          file: 'factions-order-bladeborn-grombrindal',         subfactions: [] },
			{
				id: 'idoneth-deepkin',
				label: 'Idoneth Deepkin', file: 'factions-order-idoneth-deepkin',
				subfactions: [
					{ id: 'cyrenis-razors',     label: "Cyreni's Razors",     file: 'factions-order-bladeborn-cyrenis-razors' },
					{ id: 'elathains-soulraid', label: "Elathain's Soulraid", file: 'factions-order-bladeborn-elathains-soulraid' },
				],
			},
			{
				id: 'kharadron-overlords',
				label: 'Kharadron Overlords', file: 'factions-order-kharadron-overlords',
				subfactions: [
					{ id: 'thundriks-profiteers', label: "Thundrik's Profiteers", file: 'factions-order-bladeborn-thundriks-profiteers' },
				],
			},
			{
				id: 'lumineth-realm-lords',
				label: 'Lumineth Realm-lords', file: 'factions-order-lumineth-realmlords',
				subfactions: [
					{ id: 'myaris-purifiers',      label: "Myari's Purifiers", file: 'factions-order-bladeborn-myaris-purifiers' },
					{ id: 'thyrielles-zephyrites', label: "Thyrielle's Zephyrites", file: 'factions-order-bladeborn-thyrielles-zephyrites' },					
				],
			},
			{ id: 'lumineth-realm-lords-ydrilan-riverblades', label: 'Lumineth Realm-lords: Ydrilan Riverblades', file: 'factions-order-ydrilan-riverblades', subfactions: [] },
			{ id: 'monsters-of-order',                   label: 'Monsters of Order',                    file: 'monsters-of-order',      subfactions: [] },
			{
				id: 'seraphon',
				label: 'Seraphon', file: 'factions-order-seraphon',
				subfactions: [
					{ id: 'jaws-of-itzl',           label: 'Jaws of Itzl',           file: 'factions-order-bladeborn-jaws-of-itzl' },
					{ id: 'the-starblood-stalkers', label: 'The Starblood Stalkers', file: 'factions-order-bladeborn-the-starblood-stalkers' },
				],
			},
			{ id: 'seraphon-hunters-of-huanchi',         label: 'Seraphon: Hunters of Huanchi',         file: 'factions-order-hunters-of-huanchi',     subfactions: [] },
			{ id: 'stormcast-eternals-questor-soulsworn',  label: 'Stormcast Eternals: Questor Soulsworn',  file: 'factions-order-stormcast-eternals-questor-soulsworn', subfactions: [] },
			{ id: 'stormcast-eternals-ruination-chamber',  label: 'Stormcast Eternals: Ruination Chamber',  file: 'factions-order-stormcast-eternals-ruination', subfactions: [] },
			{
				id: 'stormcast-eternals-sacrosanct-chamber',
				label: 'Stormcast Eternals: Sacrosanct Chamber', file: 'factions-order-stormcast-eternals-sacrosanct-chamber',
				subfactions: [
					{ id: 'stormsires-cursebreakers', label: "Stormsire's Cursebreakers",  file: 'factions-order-bladeborn-stormsires-cursebreakers' },
				],
			},
			{ id: 'stormcast-eternals-the-blacktalons',  label: 'Stormcast Eternals: The Blacktalons',  file: 'factions-order-the-blacktalons',       subfactions: [] },
			{
				id: 'stormcast-eternals-thunderstrike-chamber',
				label: 'Stormcast Eternals: Thunderstrike Chamber', file: 'factions-order-stormcast-eternals-thunderstrike-eternals',
				subfactions: [
					{ id: 'domitans-stormcoven',   label: "Domitan's Stormcoven",   file: 'factions-order-bladeborn-domitans-stormcoven' },
					{ id: 'gladitorium-fighters',  label: 'Gladitorium Fighters',   file: 'factions-order-bladeborn-gladitorium-fighters' },
					{ id: 'xandires-truthseekers', label: "Xandire's Truthseekers", file: 'factions-order-bladeborn-xandires-truthseekers' },
				],
			},
			{
				id: 'stormcast-eternals-vanguard-auxiliary-chamber',
				label: 'Stormcast Eternals: Vanguard Auxiliary Chamber', file: 'factions-order-stormcast-eternals-vanguard-chamber',
				subfactions: [
					{ id: 'the-emberwatch',  label: 'The Emberwatch',  file: 'factions-order-bladeborn-the-emberwatch' },
					{ id: 'the-farstriders', label: 'The Farstriders', file: 'factions-order-bladeborn-the-farstriders' },
				],
			},
			{
				id: 'stormcast-eternals-warrior-chamber',
				label: 'Stormcast Eternals: Warrior Chamber', file: 'factions-order-stormcast-eternals-warrior-chamber',
				subfactions: [
					{ id: 'steelhearts-champions', label: "Steelheart's Champions", file: 'factions-order-bladeborn-steelhearts-champions' },
				],
			},
			{
				id: 'sylvaneth',
				label: 'Sylvaneth', file: 'factions-order-sylvaneth',
				subfactions: [
					{ id: 'heralds-of-kurnoth',  label: 'Heralds of Kurnoth',  file: 'factions-order-bladeborn-heralds-of-kurnoth' },
					{ id: 'skaeths-wild-hunt',   label: "Skaeth's Wild Hunt",  file: 'factions-order-bladeborn-skaeths-wild-hunt' },
					{ id: 'yltharis-guardians',  label: "Ylthari's Guardians", file: 'factions-order-bladeborn-yltharis-guardians' },
				],
			},
			{ id: 'sylvaneth-twistweald',                label: 'Sylvaneth: Twistweald',                file: 'factions-order-twistweald',            subfactions: [] },
		],
	},
];

// ── Lookup helpers (keyed on id) ──────────────────────────────────────────────

export function getAllianceFile(allianceId: string): string | null {
	return hierarchy.find(a => a.id === allianceId)?.file ?? null;
}

export function getFactionFile(allianceId: string, factionId: string): string | null {
	return hierarchy.find(a => a.id === allianceId)
		?.factions.find(f => f.id === factionId)?.file ?? null;
}

export function getSubfactionFile(allianceId: string, factionId: string, subfactionId: string): string | null {
	return hierarchy.find(a => a.id === allianceId)
		?.factions.find(f => f.id === factionId)
		?.subfactions.find(s => s.id === subfactionId)?.file ?? null;
}

export function getFactions(allianceId: string): FactionEntry[] {
	return hierarchy.find(a => a.id === allianceId)?.factions ?? [];
}

export function getSubfactions(allianceId: string, factionId: string): SubfactionEntry[] {
	return hierarchy.find(a => a.id === allianceId)
		?.factions.find(f => f.id === factionId)?.subfactions ?? [];
}

// Flat lookups for free-hierarchy mode (no alliance/faction context required)
export function findFactionFile(factionId: string): string | null {
	for (const alliance of hierarchy) {
		const faction = alliance.factions.find(f => f.id === factionId);
		if (faction) return faction.file;
	}
	return null;
}

export function findSubfactionFile(subfactionId: string): string | null {
	for (const alliance of hierarchy) {
		for (const faction of alliance.factions) {
			const sub = faction.subfactions.find(s => s.id === subfactionId);
			if (sub) return sub.file;
		}
	}
	return null;
}
