import type p5 from "p5";

export function sketch(p: p5) {
	const walkers: Walker[] = [];
	const numWalkers = 2000;

	p.setup = () => {
		p.createCanvas(p.windowWidth, p.windowHeight);
	};

	p.draw = () => {
		p.background(0);
		for (const walker of walkers) {
			if (walker.isDead()) {
				continue;
			}

			walker.move();
			walker.display();
		}
	};

	p.windowResized = () => {
		p.resizeCanvas(p.windowWidth, p.windowHeight);
	};

	p.mouseClicked = () => {
		const center = p.createVector(p.mouseX, p.mouseY);
		for (let i = 0; i < numWalkers; i++) {
			const walker = new Walker(p, center);
			walkers.push(walker);
		}
	};
}

class Walker {
	private p: p5;
	private startPosition: p5.Vector;
	private position: p5.Vector;
	private angle: number;
	private noiseOffset: number;
	private progress: number;

	constructor(p: p5, center: p5.Vector) {
		this.p = p;
		this.startPosition = center;
		this.position = this.startPosition.copy();
		this.angle = this.p.random(this.p.TWO_PI);
		this.noiseOffset = this.p.random(1000);
		this.progress = 0;
	}

	move() {
		this.angle += this.p.map(
			this.p.noise(this.noiseOffset),
			0,
			1,
			-this.p.QUARTER_PI / 4,
			this.p.QUARTER_PI / 4,
		);
		this.noiseOffset += 0.03; // ノイズの進行度を調整

		const step = 1.4;
		this.position = this.position.add(
			this.p.createVector(
				this.p.cos(this.angle) * step,
				this.p.sin(this.angle) * step,
			),
		);

		this.progress += 0.01;
		this.progress = this.p.constrain(this.progress, 0, 1);
	}

	display() {
		const alpha = this.p.map(this.progress, 0, 1, 255, 0);
		this.p.stroke(255, alpha);
		this.p.point(this.position);
	}

	isDead() {
		return this.progress >= 1;
	}
}
