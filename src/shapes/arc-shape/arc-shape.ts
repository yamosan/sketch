import type p5 from "p5";

// https://github.com/processing/p5.js/issues/2529
// TODO: rを小さくしたときにバグる

/**
 * 角丸の多角形
 */
export class ArcShape {
	private p: p5;
	private round: number;
	private points: p5.Vector[];

	constructor(p: p5, ...points: p5.Vector[]) {
		this.p = p;
		this.round = 80;
		this.points = points;
	}

	setRound(round: number) {
		this.round = round;
	}

	draw(drawAux = false) {
		const cps = this.calcCornerPoints();
		for (let i = 0; i < cps.length; i++) {
			const prev = cps[(i - 1 + cps.length) % cps.length];
			const cur = cps[i];
			const next = cps[(i + 1) % cps.length];

			if (drawAux) {
				this.drawAux(
					cur.edges.prev,
					cur.edges.current,
					cur.edges.next,
					cur.bisector,
					cur.cornerJoint.distance,
					cur.cornerJoint.height,
					this.round,
				);
			}

			this.drawJoiningLine(
				prev.edges.current,
				cur.edges.current,
				prev.cornerJoint.distance,
				cur.cornerJoint.distance,
				cur.nodes.currentToPrev.mag,
			);
			this.drawJoiningLine(
				next.edges.current,
				cur.edges.current,
				next.cornerJoint.distance,
				cur.cornerJoint.distance,
				cur.nodes.currentToNext.mag,
			);
			this.drawArc(
				cur.edges.current,
				cur.bisector,
				cur.cornerJoint.height,
				this.round,
				cur.nodes.currentToPrev.norm,
				cur.nodes.currentToNext.norm,
				cur.clockwise,
			);
		}
	}

	private calcCornerPoints(): {
		edges: { prev: p5.Vector; current: p5.Vector; next: p5.Vector };
		nodes: {
			currentToPrev: { norm: p5.Vector; mag: number };
			currentToNext: { norm: p5.Vector; mag: number };
		};
		bisector: p5.Vector;
		cornerJoint: { distance: number; height: number };
		clockwise: boolean;
	}[] {
		const cornerPoints = [];
		for (let i = 0; i < this.points.length; i++) {
			const edges = {
				prev: this.points[(i - 1 + this.points.length) % this.points.length],
				current: this.points[i],
				next: this.points[(i + 1) % this.points.length],
			};

			const nodes = {
				currentToPrev: {
					norm: edges.prev.copy().sub(edges.current).normalize(),
					mag: edges.prev.copy().dist(edges.current),
				},
				currentToNext: {
					norm: edges.next.copy().sub(edges.current).normalize(),
					mag: edges.next.copy().dist(edges.current),
				},
			};

			const bisector = nodes.currentToPrev.norm
				.copy()
				.add(nodes.currentToNext.norm)
				.normalize();

			const [joinDistance, height] = this.calculateCornerJoint(
				nodes.currentToPrev.norm,
				bisector.normalize(),
				this.round,
				nodes.currentToPrev.mag,
				nodes.currentToNext.mag,
			);

			const cornerJoint = {
				distance: joinDistance,
				height,
			};

			const clockwise = this.isClockwise(
				nodes.currentToPrev.norm,
				nodes.currentToNext.norm,
			);

			cornerPoints.push({
				edges,
				nodes,
				bisector,
				cornerJoint,
				clockwise,
			});
		}
		return cornerPoints;
	}

	private calculateCornerJoint(
		d1: p5.Vector,
		dh: p5.Vector,
		r: number,
		d1l: number,
		d2l: number,
	): [joinDistance: number, height: number] {
		const dot = d1.copy().dot(dh);
		const s = this.p.sqrt(1 - dot * dot);
		let a = r * this.p.sqrt(1 / (s * s) - 1);
		let rr = r;

		const dm = this.p.min(d1l, d2l);
		if (a > dm) {
			rr *= dm / a;
			a = dm;
		}
		const h = rr / s;

		return [a, h];
	}

	private isClockwise(d1: p5.Vector, d2: p5.Vector): boolean {
		return d1.x * d2.y - d1.y * d2.x >= 0;
	}

	private drawJoiningLine(
		fp: p5.Vector,
		tp: p5.Vector,
		fa: number,
		ta: number,
		dl: number,
	) {
		this.p.noFill();
		this.p.stroke(255);
		this.p.strokeWeight(4);

		const fper = (dl - fa) / dl;
		const tper = (dl - ta) / dl;

		this.p.line(
			fp.x + (tp.x - fp.x) * (1 - fper),
			fp.y + (tp.y - fp.y) * (1 - fper),
			fp.x + (tp.x - fp.x) * tper,
			fp.y + (tp.y - fp.y) * tper,
		);
	}

	private drawArc(
		p1: p5.Vector,
		dh: p5.Vector,
		h: number,
		r: number,
		d1: p5.Vector,
		d2: p5.Vector,
		cw: boolean,
	) {
		this.p.noFill();
		this.p.stroke(255);
		this.p.strokeWeight(4);

		this.p.arc(
			p1.x + dh.x * h,
			p1.y + dh.y * h,
			2 * r,
			2 * r,
			cw ? this.p.atan2(d2.x, -d2.y) : this.p.atan2(d1.x, -d1.y),
			cw ? this.p.atan2(-d1.x, d1.y) : this.p.atan2(-d2.x, d2.y),
			this.p.OPEN,
		);
	}

	private drawAux(
		p0: p5.Vector,
		p1: p5.Vector,
		p2: p5.Vector,
		dh: p5.Vector,
		a: number,
		h: number,
		r: number,
	) {
		this.p.stroke(50);
		this.p.strokeWeight(1);

		this.p.beginShape();
		this.p.vertex(p0.x, p0.y);
		this.p.vertex(p1.x, p1.y);
		this.p.vertex(p2.x, p2.y);
		this.p.endShape();

		this.p.ellipse(p1.x + dh.x * h, p1.y + dh.y * h, 2 * r, 2 * r);

		this.p.ellipse(p1.x, p1.y, 2 * a, 2 * a);
	}
}
