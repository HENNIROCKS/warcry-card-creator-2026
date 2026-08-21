// The seven characteristic runemarks head every fighter card's stat tables, so
// they are bundled rather than fetched — they would otherwise pop in on first
// paint and drop out of the prerendered markup.
import attacks   from './svg/characteristics-attacks.svg?raw';
import damage    from './svg/characteristics-damage.svg?raw';
import move      from './svg/characteristics-move.svg?raw';
import range     from './svg/characteristics-range.svg?raw';
import strength  from './svg/characteristics-strength.svg?raw';
import toughness from './svg/characteristics-toughness.svg?raw';
import wounds    from './svg/characteristics-wounds.svg?raw';

// Runemark SVGs are loaded per file instead of bundled together: the pickers
// render labels only, so a card needs a handful of the 233 icons at a time.
// Vite keeps each file a separate lazy chunk here.
const modules = import.meta.glob('./svg/*.svg', { query: '?raw', import: 'default' }) as
	Record<string, () => Promise<string>>;

const cache = $state<Record<string, string>>({
	'characteristics-attacks':   attacks,
	'characteristics-damage':    damage,
	'characteristics-move':      move,
	'characteristics-range':     range,
	'characteristics-strength':  strength,
	'characteristics-toughness': toughness,
	'characteristics-wounds':    wounds,
});
const inFlight = new Map<string, Promise<void>>();

function load(file: string): Promise<void> {
	const existing = inFlight.get(file);
	if (existing) return existing;

	const loader = modules[`./svg/${file}.svg`];
	if (!loader) {
		// Unknown key — cache empty so the caller stops re-requesting it.
		cache[file] = '';
		return Promise.resolve();
	}

	const promise = loader()
		.then(svg => { cache[file] = svg; })
		.catch(() => {
			// A chunk that never arrives — a tab left open across a redeploy asks
			// for a hashed file the server no longer has — caches empty like an
			// unknown key. The badge stays blank and export still runs.
			cache[file] = '';
		})
		.finally(() => { inFlight.delete(file); });
	inFlight.set(file, promise);
	return promise;
}

/**
 * SVG source for a runemark file (basename without extension), or undefined
 * while it loads. Reading it inside an effect or template starts the load and
 * re-renders once the source arrives.
 */
export function runemarkSvg(file: string | null | undefined): string | undefined {
	if (!file) return undefined;
	const hit = cache[file];
	if (hit !== undefined) return hit || undefined;
	load(file);
	return undefined;
}

/** Resolves once every runemark requested so far has loaded. */
export async function settled(): Promise<void> {
	// Entries drain as they settle, so the map empties unless the awaited batch
	// queued further loads — those are picked up by the next pass.
	while (inFlight.size) {
		await Promise.all([...inFlight.values()]);
	}
}

/** Loads the given runemark files and resolves when all are available. */
export async function preload(files: (string | null | undefined)[]): Promise<void> {
	await Promise.all(files.filter((f): f is string => !!f).map(load));
}
