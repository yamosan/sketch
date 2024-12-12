import type p5 from "p5";

/**
 * 頂点間を線で結ぶことで多角形を描画する
 */
export class RegularPolygon {
	private edges: p5.Vector[];

	constructor(
		private p: p5,
		readonly x: number,
		readonly y: number,
		readonly r: number,
		readonly div: number,
	) {
		this.edges = this.calculatePolygonVertices();
	}

	draw() {
		this.p.beginShape();
		for (const edge of this.edges) {
			this.p.vertex(edge.x, edge.y);
		}
		this.p.endShape(this.p.CLOSE);
	}

	drawCircumcircle() {
		this.p.stroke(50);
		this.p.strokeWeight(1);
		this.p.ellipse(this.x, this.y, this.r, this.r);
	}

	drawIncircle() {
		const incircleRadius = this.calculateIncircleRadius(this.div);
		this.p.stroke(50);
		this.p.strokeWeight(1);
		this.p.ellipse(this.x, this.y, incircleRadius, incircleRadius);
	}

	private calculatePolygonVertices(): p5.Vector[] {
		const vertices: p5.Vector[] = [];
		for (let i = 0; i < this.div; i++) {
			const angle = this.p.map(i, 0, this.div, 0, this.p.TWO_PI);
			const x = this.x + (this.r * this.p.sin(angle)) / 2;
			const y = this.y - (this.r * this.p.cos(angle)) / 2;
			vertices.push(this.p.createVector(x, y));
		}
		return vertices;
	}

	private calculateIncircleRadius(n: number): number {
		const incircleRadius = this.r * Math.cos(this.p.PI / n);
		return incircleRadius;
	}
}
