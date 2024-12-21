import type p5 from "p5";
import type { Ball } from "./ball";
import { Surface } from "./surface";

export class MetaballSurface {
	private p: p5;
	private balls: Ball[];
	private surface: Surface;

	constructor(p: p5, balls: Ball[], resolution: number) {
		this.p = p;
		this.balls = balls;
		this.surface = new Surface(p, p.width, p.height, resolution, 0.5);
	}

	get resolution() {
		return this.surface.resolution;
	}

	setResolution(resolution: number) {
		this.surface.setResolution(resolution);
	}

	update() {
		for (const ball of this.balls) {
			ball.update();

			// それぞれのボール間の引力を計算
			for (const other of this.balls) {
				if (ball !== other) {
					ball.attract(other);
				}
			}
		}

		this.surface.update((point, x, y) => {
			let sum = 0;
			for (const b of this.balls) {
				const dist = this.p.dist(point.pos.x, point.pos.y, b.pos.x, b.pos.y);

				sum += (0.5 * b.rad) / dist;
			}
			return sum;
		});
	}

	draw() {
		// this.surface.drawContour(true);
		this.surface.drawInside(true);
		// this.surface.drawPointValues();

		for (const b of this.balls) {
			// b.display();
		}
	}
}
