import EventEmitter = Phaser.Events.EventEmitter;
export const EventManager = new EventEmitter()

export enum Events {
	END_TURN = 'END_TURN',
	REQUIREMENT_FILLED = 'REQUIREMENT_FILLED',
	QUEST_COMPLETED = 'QUEST_COMPLETED',
	QUEST_FAILED = 'QUEST_FAILED',
}
