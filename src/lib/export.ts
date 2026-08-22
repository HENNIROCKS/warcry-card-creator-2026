/**
 * A rejected `navigator.share()` is how the platform reports a dismissed share
 * sheet, so an abort is a cancel rather than an export failure. Matched on the
 * error's name: cross-realm rejections and polyfills do not always produce a
 * real `DOMException`, and a missed match would show a failure the user caused
 * on purpose.
 */
export function isShareAbort(err: unknown): boolean {
	return (err as { name?: string } | null | undefined)?.name === 'AbortError';
}
