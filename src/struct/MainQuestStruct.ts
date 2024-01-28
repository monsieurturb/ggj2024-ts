import { QuestStruct } from "./QuestStruct";

export class MainQuestStruct extends QuestStruct {
    public subtitle: string;

    constructor() {
        super("The Audience listens...");

        this.subtitle = "Send your best jokes!";
    }

    undoRequirements() {
        for (const req of this._requirements)
            req.done = false;
    }
}