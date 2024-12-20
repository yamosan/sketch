import type p5 from "p5";

export class FrameRateDisplay {
	private p: p5;
	private pos: p5.Vector;
	private maxSamples: number;
	private frameRates: number[] = [];

	constructor(p: p5, pos: p5.Vector, maxSamples = 60) {
		this.p = p;
		this.pos = pos;
		this.maxSamples = maxSamples;
	}

	update() {
		const currentFrameRate = this.p.frameRate();
		this.frameRates.push(currentFrameRate);

		if (this.frameRates.length > this.maxSamples) {
			this.frameRates.shift();
		}
	}

	display() {
		const avgFrameRate = this.getAverageFrameRate();

		this.p.fill(255);
		this.p.textAlign(this.p.RIGHT, this.p.TOP);
		this.p.textSize(20);
		this.p.noStroke();

		this.p.text(this.p.floor(avgFrameRate), this.pos.x, this.pos.y);
	}

	private getAverageFrameRate(): number {
		const sum = this.frameRates.reduce((acc, val) => acc + val, 0);
		return sum / this.frameRates.length;
	}
}
