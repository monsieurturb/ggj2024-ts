import { QuestStruct } from "./QuestStruct";

export class MainQuestStruct extends QuestStruct {
    constructor() {
        super("The Audience listens...");
    }

    undoRequirements() {
        for (const req of this._requirements)
            req.done = false;
    }
}