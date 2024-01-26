import { QuestStruct } from "./QuestStruct";

export class MainQuestStruct extends QuestStruct {
    constructor() {
        super("The Main Quest");
    }

    undoRequirements() {
        for (const req of this._requirements) {
            req.done = false;
        }
    }
}