import EventEmitter = Phaser.Events.EventEmitter;
export const EventManager = new EventEmitter()

export enum Events {
	// Custom events
	END_TURN = 'end_turn',
}
