<script lang="ts">
	import { BasesEntryGroup, type BasesEntry } from "obsidian";

	interface Props {
		data: BasesEntryGroup[];
		onEntryClick?: (entry: BasesEntry, event: MouseEvent) => void;
		isDone?: (entry: BasesEntry) => boolean;
		onEntryCheck?: (
			entry: BasesEntry,
			checked: boolean,
			event: MouseEvent,
		) => void;
		onNewTask?: (group: BasesEntryGroup, event: MouseEvent) => void;
	}

	let { data, onEntryClick, isDone, onEntryCheck, onNewTask }: Props =
		$props();

	function handleTaskClick(entry: BasesEntry, event: MouseEvent) {
		// Don't trigger click if clicking on the checkbox wrapper or checkbox
		const target = event.target as HTMLElement;
		if (
			target.tagName === "INPUT" ||
			target.tagName === "LABEL" ||
			target.classList.contains("task-checkbox-custom") ||
			target.closest("label")
		) {
			return;
		}
		onEntryClick?.(entry, event);
	}

	function handleCheckboxChange(
		entry: BasesEntry,
		event: Event & { currentTarget: HTMLInputElement },
	) {
		event.stopPropagation();
		const checked = event.currentTarget.checked;
		onEntryCheck?.(entry, checked, event as unknown as MouseEvent);
	}

	function isTaskComplete(entry: BasesEntry): boolean {
		// Use the provided isDone function if available, otherwise default to false
		return isDone ? isDone(entry) : false;
	}

	function getCheckboxId(
		entry: BasesEntry,
		groupIndex: number,
		entryIndex: number,
	): string {
		return `task-checkbox-${groupIndex}-${entryIndex}`;
	}

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

	function getGroupTitle(group: BasesEntryGroup): string {
		if (!group.key) return "Ungrouped";

		// Convert the Value to string and format wiki-links
		const keyString = group.key.toString();

		// Handle null or empty values
		if (!keyString || keyString === "null" || keyString === "undefined") {
			return "Ungrouped";
		}

		return formatWikiLinks(keyString);
	}

	function shouldShowGroupHeader(
		group: BasesEntryGroup,
		groupIndex: number,
	): boolean {
		// Hide header if there's only one group and no grouping is set
		if (data.length === 1 && !group.key) {
			return false;
		}
		return true;
	}

	function handleNewTask(group: BasesEntryGroup, event: MouseEvent) {
		event.stopPropagation();
		onNewTask?.(group, event);
	}
</script>

<div class="task-list">
	{#each data as group, groupIndex}
		<div class="task-group">
			{#if shouldShowGroupHeader(group, groupIndex)}
				<div class="task-group-header">
					<h3 class="task-group-title">{getGroupTitle(group)}</h3>
					<span class="task-group-count">{group.entries.length}</span>
				</div>
			{/if}
			<div class="task-group-items">
				{#each group.entries as entry, entryIndex}
					<div
						class="task-item"
						class:task-completed={isTaskComplete(entry)}
						onclick={(e) => handleTaskClick(entry, e)}
						role="button"
						tabindex="0"
						onkeydown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								handleTaskClick(
									entry,
									e as unknown as MouseEvent,
								);
							}
						}}
					>
						<div class="task-checkbox-wrapper">
							<input
								type="checkbox"
								class="task-checkbox"
								id={getCheckboxId(
									entry,
									groupIndex,
									entryIndex,
								)}
								checked={isTaskComplete(entry)}
								onchange={(e) => handleCheckboxChange(entry, e)}
							/>
							<label
								class="task-checkbox-custom"
								for={getCheckboxId(
									entry,
									groupIndex,
									entryIndex,
								)}
							></label>
						</div>
						<div class="task-content">
							<div class="task-title">
								{formatWikiLinks(entry.file.name)}
							</div>
						</div>
					</div>
				{/each}
				<button
					class="new-task-button"
					onclick={(e) => handleNewTask(group, e)}
					type="button"
				>
					<span class="new-task-icon">+</span>
					<span class="new-task-text">New task</span>
				</button>
			</div>
		</div>
	{/each}
</div>

<style>
	.task-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		max-width: 800px;
		margin: 0 auto;
	}

	.task-group {
		background-color: var(--background-secondary);
		border-radius: 8px;
		overflow: hidden;
		border: 1px solid var(--background-modifier-border);
	}

	.task-group-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		background-color: var(--background-secondary-alt);
		border-bottom: 1px solid var(--background-modifier-border);
	}

	.task-group-title {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-normal);
	}

	.task-group-count {
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

	.task-group-items {
		display: flex;
		flex-direction: column;
	}

	.task-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background-color: var(--background-primary);
		border-bottom: 1px solid var(--background-modifier-border);
		cursor: pointer;
		transition: background-color 0.15s ease;
	}

	.task-item:last-child {
		border-bottom: none;
	}

	.task-item:hover {
		background-color: var(--background-secondary);
	}

	.task-item:focus {
		outline: 2px solid var(--interactive-accent);
		outline-offset: -2px;
		z-index: 1;
	}

	.task-item.task-completed {
		opacity: 0.6;
	}

	.task-item.task-completed .task-title {
		text-decoration: line-through;
		color: var(--checklist-done-color);
	}

	.task-checkbox-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.task-checkbox {
		position: absolute;
		opacity: 0;
		width: 1.25rem;
		height: 1.25rem;
		cursor: pointer;
		z-index: 1;
	}

	.task-checkbox-custom {
		display: inline-block;
		width: var(--checkbox-size);
		height: var(--checkbox-size);
		border: 1px solid var(--checkbox-border-color);
		border-radius: var(--checkbox-radius);

		transition: all 0.2s ease;
		position: relative;
		cursor: pointer;
	}

	.task-checkbox:hover ~ .task-checkbox-custom,
	.task-checkbox-custom:hover {
		background-color: var(--checkbox-color-hover);
		border-color: var(--interactive-accent);
	}

	.task-checkbox:checked ~ .task-checkbox-custom {
		background-color: var(--checkbox-color);
		border-color: var(--interactive-accent);
	}

	.task-checkbox:checked ~ .task-checkbox-custom::after {
		content: "";
		position: absolute;
		left: 50%;
		top: 50%;
		width: 0.375rem;
		height: 0.625rem;
		border: solid var(--text-on-accent);
		border-width: 0 2px 2px 0;
		transform: translate(-50%, -60%) rotate(45deg);
	}

	.task-checkbox:focus ~ .task-checkbox-custom {
		outline: 2px solid var(--interactive-accent);
		outline-offset: 2px;
	}

	.task-content {
		flex: 1;
		min-width: 0;
	}

	.task-title {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text-normal);
		word-wrap: break-word;
		line-height: 1.4;
	}

	.new-task-button {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		background-color: transparent;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		transition: all 0.15s ease;
		font-size: 0.9rem;
		width: 100%;
		text-align: left;
		min-height: 3rem;
	}

	.new-task-button:hover {
		background-color: var(--background-secondary);
		color: var(--text-normal);
	}

	.new-task-button:focus {
		outline: 2px solid var(--interactive-accent);
		outline-offset: -2px;
	}

	.new-task-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		border: 2px solid var(--text-muted);
		border-radius: 4px;
		font-weight: 600;
		font-size: 0.875rem;
		line-height: 1;
		flex-shrink: 0;
		transition: all 0.15s ease;
	}

	.new-task-button:hover .new-task-icon {
		border-color: var(--interactive-accent);
		color: var(--interactive-accent);
	}

	.new-task-text {
		font-style: italic;
	}
</style>
