export class Random {
	private static instance: Random;

	private rnd: Phaser.Math.RandomDataGenerator;

	constructor() {
		this.rnd = new Phaser.Math.RandomDataGenerator();
	}

	public static getInstance(): Random {
		if (!Random.instance)
			Random.instance = new Random();

		return Random.instance;
	}

	public setSeed(seed: string) {
		this.rnd.init([seed]);
	}

	public sign() {
		return this.rnd.sign();
	}

	public frac() {
		return this.rnd.frac();
	}

	public floatInRange(min: number, max: number) {
		return this.rnd.realInRange(min, max);
	}

	public integerInRange(min: number, max: number) {
		return this.rnd.integerInRange(min, max);
	}

	public rotation() {
		return this.rnd.rotation();
	}

	public uuid() {
		return this.rnd.uuid();
	}

	public pick<T>(a: Array<T>): T {
		return this.rnd.pick(a);
	}

	public shuffle<T>(a: Array<T>) {
		return this.rnd.shuffle(a);
	}
}