import EventEmitter = Phaser.Events.EventEmitter;
export const EventManager = new EventEmitter()

export enum Events {
	END_TURN = 'END_TURN',
	REQUIREMENT_PROGRESS = 'REQUIREMENT_PROGRESS',
	REQUIREMENT_COMPLETED = 'REQUIREMENT_COMPLETED',
	QUEST_COMPLETED = 'QUEST_COMPLETED',
	QUEST_FAILED = 'QUEST_FAILED',
}
