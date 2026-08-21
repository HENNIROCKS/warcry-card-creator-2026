// Runemark SVGs are pure single-colour path art rendered at up to 600 device px
// (card back at 280px x EXPORT_SCALE). preset-default alone saves ~0.3% because
// the files are already structurally minimal — the payload is path-coordinate
// precision, so floatPrecision is the lever that matters. At 1, coordinates
// round to 0.1 units on a 300-unit viewBox, below one device pixel.
export default {
	multipass: true,
	floatPrecision: 1,
	plugins: ['preset-default']
};
