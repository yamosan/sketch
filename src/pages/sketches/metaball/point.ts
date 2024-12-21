import type p5 from "p5";

export class Point {
	private p: p5;
	pos: p5.Vector;
	value: number;
	threshold: number;

	constructor(p: p5, pos: p5.Vector, value: number, threshold: number) {
		this.p = p;
		this.pos = pos;
		this.value = value;
		this.threshold = threshold;
	}

	setValue(value: number) {
		this.value = value;
	}

	draw(binary = false) {
		this.p.strokeWeight(4);

		let color: p5.Color;
		if (binary) {
			color = this.value > this.threshold ? this.p.color(255) : this.p.color(0);
		} else {
			color = this.p.color(this.p.map(this.value, 0, 1, 0, 255));
		}

		this.p.stroke(color);
		this.p.point(this.pos.x, this.pos.y);
	}

	drawValue() {
		this.p.noStroke();
		this.p.fill(180);
		if (this.value > this.threshold) {
			this.p.fill(255, 255, 0);
		}
		this.p.textAlign(this.p.CENTER, this.p.CENTER);
		this.p.textSize(16);
		this.p.text(this.value.toFixed(4), this.pos.x, this.pos.y);
	}
}
