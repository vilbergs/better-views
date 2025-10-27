<script lang="ts">
	import { BasesEntryGroup, type BasesEntry } from "obsidian";

	interface Props {
		data: BasesEntryGroup[];
		onCardClick?: (entry: BasesEntry, event: MouseEvent) => void;
	}

	let { data, onCardClick }: Props = $props();

	function formatWikiLinks(text: string): string {
		// Remove .md extension first
		text = text.replace(/\.md$/, "");

		// Replace [[link]] with just the link text (without brackets)
		// Also handle [[link|display text]] format
		return text.replace(
			/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
			(match, link, displayText) => {
				return displayText || link;
			},
		);
	}

	function handleCardClick(entry: BasesEntry, event: MouseEvent) {
		onCardClick?.(entry, event);
	}
</script>

<div class="kanban-board">
	{#each data as group}
		<div class="kanban-column">
			<div class="kanban-column-header">
				<h3 class="kanban-column-title">
					{formatWikiLinks(group.key?.toString() || "Ungrouped")}
				</h3>
				<span class="kanban-column-count">{group.entries.length}</span>
			</div>
			<div class="kanban-cards">
				{#each group.entries as entry}
					<div
						class="kanban-card"
						onclick={(e) => handleCardClick(entry, e)}
						role="button"
						tabindex="0"
						onkeydown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								handleCardClick(
									entry,
									e as unknown as MouseEvent,
								);
							}
						}}
					>
						<div class="kanban-card-title">
							{entry.file.name.replace(".md", "")}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>

<style>
	.kanban-board {
		display: flex;
		gap: 1rem;
		padding: 1rem;
		overflow-x: auto;
		height: 100%;
		align-items: flex-start;
	}

	.kanban-column {
		min-width: 280px;
		max-width: 320px;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		background-color: var(--background-secondary);
		border-radius: 8px;
		overflow: hidden;
	}

	.kanban-column-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		background-color: var(--background-secondary-alt);
		border-bottom: 1px solid var(--background-modifier-border);
	}

	.kanban-column-title {
		margin: 0;
		font-size: var(--font-smaller);
		font-weight: 600;
		color: var(--text-normal);
	}

	.kanban-column-count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.5rem;
		height: 1.5rem;
		padding: 0 0.5rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-muted);
		background-color: var(--background-primary);
		border-radius: 12px;
	}

	.kanban-cards {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.75rem;
		overflow-y: auto;
		flex: 1;
	}

	.kanban-card {
		background-color: var(--background-primary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 6px;
		padding: 0.75rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.kanban-card:hover {
		border-color: var(--interactive-accent);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		transform: translateY(-1px);
	}

	.kanban-card:focus {
		outline: 2px solid var(--interactive-accent);
		outline-offset: 2px;
	}

	.kanban-card:active {
		transform: translateY(0);
	}

	.kanban-card-title {
		font-size: var(--font-small);
		font-weight: 500;
		color: var(--text-normal);
		word-wrap: break-word;
	}

	/* Scrollbar styling */
	.kanban-board::-webkit-scrollbar,
	.kanban-cards::-webkit-scrollbar {
		width: 8px;
		height: 8px;
	}

	.kanban-board::-webkit-scrollbar-track,
	.kanban-cards::-webkit-scrollbar-track {
		background: var(--background-secondary);
	}

	.kanban-board::-webkit-scrollbar-thumb,
	.kanban-cards::-webkit-scrollbar-thumb {
		background: var(--background-modifier-border);
		border-radius: 4px;
	}

	.kanban-board::-webkit-scrollbar-thumb:hover,
	.kanban-cards::-webkit-scrollbar-thumb:hover {
		background: var(--text-muted);
	}
</style>
