<script lang="ts">
	import { base } from '$app/paths';
</script>

<main class="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center gap-6">
	<h1 class="text-4xl font-bold tracking-wide">Warcry Card Creator</h1>
	<div class="flex gap-4">
		<a href="{base}/fighter" class="px-6 py-3 bg-red-900 hover:bg-red-800 rounded text-white font-semibold transition">
			Fighter Card
		</a>
		<a href="{base}/ability" class="px-6 py-3 bg-red-900 hover:bg-red-800 rounded text-white font-semibold transition">
			Ability Card
		</a>
	</div>
</main>
