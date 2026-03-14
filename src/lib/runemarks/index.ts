// Alliance / faction / subfaction data — see hierarchy.ts
export { hierarchy, PLACEHOLDER_SVG, getAllianceSvg, getFactionSvg, getSubfactionSvg, getFactions, getSubfactions } from './hierarchy';

// ── Weapon runemarks ─────────────────────────────────────────────────────────
import axe          from './svg/weapons-axe.svg?raw';
import bident       from './svg/weapons-bident.svg?raw';
import blast        from './svg/weapons-blast.svg?raw';
import claws        from './svg/weapons-claws.svg?raw';
import club         from './svg/weapons-club.svg?raw';
import dagger       from './svg/weapons-dagger.svg?raw';
import fangs        from './svg/weapons-fangs.svg?raw';
import hammer       from './svg/weapons-hammer.svg?raw';
import hook         from './svg/weapons-hook.svg?raw';
import mace         from './svg/weapons-mace.svg?raw';
import rangedWeapon from './svg/weapons-ranged-weapon.svg?raw';
import reachWeapon  from './svg/weapons-reach-weapon.svg?raw';
import scythe       from './svg/weapons-scythe.svg?raw';
import spear        from './svg/weapons-spear.svg?raw';
import sword        from './svg/weapons-sword.svg?raw';
import pistol       from './svg/weapons-pistol.svg?raw';
import unarmed      from './svg/weapons-unarmed.svg?raw';

export const weaponRunemarks: Record<string, string> = {
	Axe:            axe,
	Bident:         bident,
	Blast:          blast,
	Claws:          claws,
	Club:           club,
	Dagger:         dagger,
	Fangs:          fangs,
	Hammer:         hammer,
	Hook:           hook,
	Mace:           mace,
	'Pistol':        pistol,
	'Ranged Weapon': rangedWeapon,
	'Reach Weapon':  reachWeapon,
	Scythe:         scythe,
	Spear:          spear,
	Sword:          sword,
	Unarmed:        unarmed,
};

// ── Fighter runemarks ─────────────────────────────────────────────────────────
import fighterAgile       from './svg/fighters-agile.svg?raw';
import fighterAlly        from './svg/fighters-ally.svg?raw';
import fighterBeast       from './svg/fighters-beast.svg?raw';
import fighterBerserker   from './svg/fighters-berserker.svg?raw';
import fighterBladeborn   from './svg/fighters-bladeborn.svg?raw';
import fighterBrute       from './svg/fighters-brute.svg?raw';
import fighterBulwark     from './svg/fighters-bulwark.svg?raw';
import fighterChampion    from './svg/fighters-champion.svg?raw';
import fighterDestroyer   from './svg/fighters-destroyer.svg?raw';
import fighterElite       from './svg/fighters-elite.svg?raw';
import fighterFerocious   from './svg/fighters-ferocious.svg?raw';
import fighterFly         from './svg/fighters-fly.svg?raw';
import fighterFrenzied    from './svg/fighters-frenzied.svg?raw';
import fighterHero        from './svg/fighters-hero.svg?raw';
import fighterIconBearer  from './svg/fighters-icon-bearer.svg?raw';
import fighterMinion      from './svg/fighters-minion.svg?raw';
import fighterMonster     from './svg/fighters-monster.svg?raw';
import fighterMount       from './svg/fighters-mount.svg?raw';
import fighterMystic      from './svg/fighters-mystic.svg?raw';
import fighterPriest      from './svg/fighters-priest.svg?raw';
import fighterScout       from './svg/fighters-scout.svg?raw';
import fighterSentience   from './svg/fighters-sentience.svg?raw';
import fighterTerrifying  from './svg/fighters-terrifying.svg?raw';
import fighterThrall      from './svg/fighters-thrall.svg?raw';
import fighterTrapper     from './svg/fighters-trapper.svg?raw';
import fighterWarrior     from './svg/fighters-warrior.svg?raw';

export const fighterRunemarks: Record<string, string> = {
	'Agile':        fighterAgile,
	'Ally':         fighterAlly,
	'Beast':        fighterBeast,
	'Berserker':    fighterBerserker,
	'Bladeborn':    fighterBladeborn,
	'Brute':        fighterBrute,
	'Bulwark':      fighterBulwark,
	'Champion':     fighterChampion,
	'Destroyer':    fighterDestroyer,
	'Elite':        fighterElite,
	'Ferocious':    fighterFerocious,
	'Fly':          fighterFly,
	'Frenzied':     fighterFrenzied,
	'Hero':         fighterHero,
	'Icon Bearer':  fighterIconBearer,
	'Minion':       fighterMinion,
	'Monster':      fighterMonster,
	'Mount':        fighterMount,
	'Mystic':       fighterMystic,
	'Priest':       fighterPriest,
	'Scout':        fighterScout,
	'Sentience':    fighterSentience,
	'Terrifying':   fighterTerrifying,
	'Thrall':       fighterThrall,
	'Trapper':      fighterTrapper,
	'Warrior':      fighterWarrior,
};

// ── Characteristic runemarks ──────────────────────────────────────────────────
import move      from './svg/characteristics-move.svg?raw';
import toughness from './svg/characteristics-toughness.svg?raw';
import wounds    from './svg/characteristics-wounds.svg?raw';
import range     from './svg/characteristics-range.svg?raw';
import attacks   from './svg/characteristics-attacks.svg?raw';
import strength  from './svg/characteristics-strength.svg?raw';
import damage    from './svg/characteristics-damage.svg?raw';

export const characteristicRunemarks = {
	move,
	toughness,
	wounds,
	range,
	attacks,
	strength,
	damage,
};
