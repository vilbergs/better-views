import { BasesEntry, BasesView, QueryController } from "obsidian";
import { mount } from "svelte";
import Board from "./components/Board.svelte";

export const BoardViewType = "board-view";

export class BoardView extends BasesView {
	readonly type = BoardViewType;
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

		// Retrieve the user configured order set in the Properties menu.
		const order = this.config.getOrder();

		// Clear entries created by previous iterations. Remember, you should
		// instead attempt element reuse when possible.
		this.containerEl.empty();

		const data = this.data.groupedData;

		mount(Board, {
			target: this.containerEl,
			props: {
				data,
				onCardClick: (entry: BasesEntry) => {
					app.workspace.openLinkText(entry.file.path, "", false, {});
				},
			},
		});
	}
}
