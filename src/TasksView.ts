import { BasesEntry, BasesView, Notice, type QueryController } from "obsidian";
import Tasks from "./components/Tasks.svelte";
import { mount } from "svelte";

export const TasksViewType = "tasks-view";

export class TasksView extends BasesView {
	readonly type = TasksViewType;
	private containerEl: HTMLElement;

	constructor(controller: QueryController, parentEl: HTMLElement) {
		super(controller);
		this.containerEl = parentEl.createDiv("bases-example-view-container");
	}

	// onDataUpdated is called by Obsidian whenever there is a configuration
	// or data change in the vault which may affect your view. For now,
	// simply draw "Hello World" to screen.
	public onDataUpdated(): void {
		// this.containerEl.empty();
		// this.containerEl.createDiv({ text: "Hello World" });

		const { app } = this;

		// // Retrieve the user configured order set in the Properties menu.
		// const order = this.config.getOrder();

		// Clear entries created by previous iterations. Remember, you should
		// instead attempt element reuse when possible.
		this.containerEl.empty();

		const data = this.data.groupedData;

		mount(Tasks, {
			target: this.containerEl,
			props: {
				data,
				onEntryClick: (entry: BasesEntry) => {
					app.workspace.openLinkText(entry.file.path, "", false, {});
				},
				isDone: (entry: BasesEntry) => {
					// Check if the "Done" property exists and is true
					try {
						const doneValue = entry.getValue("note.Done");
						// Check if the value is truthy (handles boolean true and checkbox)
						return doneValue?.toString() === "true";
					} catch (e) {
						// If property doesn't exist or can't be evaluated, return false
						return false;
					}
				},
				onEntryCheck: async (entry, checked, event) => {
					event.stopPropagation();

					// Update the "Done" property in the file's frontmatter
					try {
						await app.fileManager.processFrontMatter(
							entry.file,
							(frontmatter) => {
								frontmatter["Done"] = checked;
							}
						);
					} catch (e) {
						console.error("Failed to update Done property:", e);
						new Notice("Failed to update task status");
					}
				},
				onNewTask: async (group, event) => {
					event.stopPropagation();

					try {
						// Ensure Tasks folder exists
						const tasksFolder = "Tasks";
						if (!(await app.vault.adapter.exists(tasksFolder))) {
							await app.vault.createFolder(tasksFolder);
						}

						// Generate unique task file name
						const timestamp = new Date()
							.toISOString()
							.replace(/[:.]/g, "-");
						const taskFileName = `${tasksFolder}/New Task ${timestamp}.md`;

						// Check if current active file is in Projects folder
						let projectProperty = "";
						const activeFile = app.workspace.getActiveFile();
						if (
							activeFile &&
							activeFile.path.startsWith("Projects/")
						) {
							// Get the file name without extension for the wiki link
							const projectName = activeFile.basename;
							projectProperty = `Project: "[[${projectName}]]"\n`;
						}

						// Create file content with frontmatter
						const content = `---
${projectProperty}Done: false
---

# New Task

`;

						// Create the new task file
						const newFile = await app.vault.create(
							taskFileName,
							content
						);

						// // Open the new file
						// await app.workspace.openLinkText(
						// 	newFile.path,
						// 	"",
						// 	false,
						// 	{}
						// );

						new Notice("New task created!");
					} catch (e) {
						console.error("Failed to create new task:", e);
						new Notice("Failed to create new task");
					}
				},
			},
		});
	}
}
