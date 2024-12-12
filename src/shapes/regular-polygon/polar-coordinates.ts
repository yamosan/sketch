import type p5 from "p5";

/**
 * 極座標上の点の軌跡で多角形を描画する
 */
export class RegularPolygon {
	private p: p5;
	private center: p5.Vector;
	private r: number;
	private div: number;
	private samples: number;

	constructor(p: p5, center: p5.Vector, r: number, div: number) {
		this.p = p;
		this.center = center;
		this.r = r;
		this.div = div;
		this.samples = 1000;
	}

	drawPoint(): void {
		this.p.strokeWeight(1);
		this.p.beginShape();
		for (let i = 0; i <= this.samples; i++) {
			const t = this.p.map(i, 0, this.samples, 0, this.p.TWO_PI);
			const po = this.calcPos(t);

			this.p.point(po.x, po.y);
		}
		this.p.endShape(this.p.CLOSE);
	}

	drawLine(): void {
		this.p.beginShape();
		for (let i = 0; i <= this.samples; i++) {
			const t = this.p.map(i, 0, this.samples, 0, this.p.TWO_PI);
			const po = this.calcPos(t);

			this.p.vertex(po.x, po.y);
		}
		this.p.endShape(this.p.CLOSE);
	}

	private calcPos(t: number): p5.Vector {
		const x = this.pc(this.div, t) * this.r + this.center.x;
		const y = this.ps(this.div, t) * this.r + this.center.y;
		return this.p.createVector(x, y);
	}

	// REF: https://slpr.sakura.ne.jp/qp/polygon-spirograph/
	private s1(x: number) {
		return x - this.p.floor(x);
	}
	private a(n: number) {
		return this.p.TWO_PI / n;
	}
	private cnp(n: number, t: number) {
		return this.p.cos(this.a(n) * this.s1(t / this.a(n)) - 0.5 * this.a(n));
	}
	private pc(n: number, t: number) {
		return (this.p.cos(t) * this.p.cos(0.5 * this.a(n))) / this.cnp(n, t);
	}
	private ps(n: number, t: number) {
		return (this.p.sin(t) * this.p.cos(0.5 * this.a(n))) / this.cnp(n, t);
	}
}
