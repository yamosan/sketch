import type p5 from "p5";
import { ArcShape } from "./arc-shape";

export class Star {
	private arcShape: ArcShape;
	constructor(
		private p: p5,
		readonly center: p5.Vector,
		readonly div: number,
		readonly innerR: number,
		readonly outerR: number,
	) {
		const vs = this.calculateVertices();
		this.arcShape = new ArcShape(p, ...vs);
	}

	draw(drawAux = false) {
		if (drawAux) {
			this.drawIncircle();
			this.drawCircumcircle();
		}
		this.arcShape.draw(drawAux);
	}

	drawCircumcircle() {
		this.p.stroke(50);
		this.p.strokeWeight(1);
		this.p.ellipse(
			this.center.x,
			this.center.y,
			this.innerR * 2,
			this.innerR * 2,
		);
	}

	drawIncircle() {
		this.p.stroke(50);
		this.p.strokeWeight(1);
		this.p.ellipse(
			this.center.x,
			this.center.y,
			this.outerR * 2,
			this.outerR * 2,
		);
	}

	setRound(round: number) {
		this.arcShape.setRound(round);
	}

	private calculateVertices(): p5.Vector[] {
		const vertices: p5.Vector[] = [];
		const angleStep = this.p.TWO_PI / (this.div * 2);
		for (let i = 0; i < this.div * 2; i++) {
			const angle = angleStep * i;
			const radius = i % 2 === 0 ? this.outerR : this.innerR;
			const x = this.center.x + this.p.cos(angle) * radius;
			const y = this.center.y + this.p.sin(angle) * radius;

			const vertex = this.p.createVector(x, y);
			vertices.push(vertex);
		}
		return vertices;
	}
}
