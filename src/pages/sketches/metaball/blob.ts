import type p5 from "p5";

export class Blob {
	private p: p5;
	readonly pos: p5.Vector;
	readonly rad: number;
	vel: p5.Vector;

	constructor(
		p: p5,
		pos: p5.Vector,
		rad: number,
		vel: p5.Vector = p.createVector(0, 0),
	) {
		this.p = p;
		this.pos = pos;
		this.rad = rad;
		this.vel = vel;
	}

	update() {
		this.pos.add(this.vel);
		if (this.pos.x > this.p.width || this.pos.x < 0) {
			this.vel.x *= -1;
		}
		if (this.pos.y > this.p.height || this.pos.y < 0) {
			this.vel.y *= -1;
		}
	}

	draw() {
		this.p.noFill();
		this.p.strokeWeight(2);
		this.p.stroke(100);
		this.p.ellipse(this.pos.x, this.pos.y, this.rad * 2);
	}
}
