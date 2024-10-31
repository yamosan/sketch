import type p5 from "p5";

export function sketch(p: p5) {
	let firework: Firework;

	p.setup = () => {
		p.createCanvas(p.windowWidth, p.windowHeight);
		p.background(0);
	};

	p.draw = () => {
		p.background("rgba(0, 0, 0, 0.05)");

		firework?.move();
		firework?.display();
	};

	p.windowResized = () => {
		p.resizeCanvas(p.windowWidth, p.windowHeight);
	};

	p.mouseClicked = () => {
		firework = new Firework(p, p.createVector(p.mouseX, p.mouseY));
	};
}

class Firework {
	private p: p5;
	private startPosition: p5.Vector;
	private angleDiv: number;
	private step: number;
	private walkers: Walker[];
	private progress: number;
	private dispersionTime: number;
	private dispersionCount: number;

	constructor(p: p5, center: p5.Vector) {
		this.p = p;
		this.startPosition = center;

		this.dispersionCount = 4;
		this.dispersionTime = 40;
		this.angleDiv = 8;
		this.step = 4;

		this.walkers = this.dispersion(this.startPosition);
		this.progress = 0;
	}

	move() {
		this.progress++;
		for (const walker of this.walkers) {
			walker.move();
		}

		if (
			this.progress % this.dispersionTime === 0 &&
			this.progress <= this.dispersionTime * this.dispersionCount
		) {
			const dispersionWalkers = this.walkers.flatMap((walker) =>
				this.dispersion(walker.position),
			);
			this.walkers = dispersionWalkers;
		}
	}

	display() {
		for (const walker of this.walkers) {
			walker.display();
		}
	}

	private dispersion(startPosition: p5.Vector) {
		const walkers: Walker[] = [];
		for (const i of range(this.angleDiv)) {
			const angle = (this.p.TWO_PI / this.angleDiv) * i;
			const walker = new Walker(this.p, startPosition, angle, this.step);
			walkers.push(walker);
		}
		return walkers;
	}
}

class Walker {
	private p: p5;
	private startPosition: p5.Vector;
	public position: p5.Vector;
	private angle: number;
	private step: number;

	constructor(p: p5, center: p5.Vector, angle: number, step: number) {
		this.p = p;
		this.startPosition = center;
		this.position = this.startPosition.copy();
		this.angle = angle;
		this.step = step;
	}

	move() {
		this.position = this.position.add(
			this.p.createVector(
				this.p.cos(this.angle) * this.step,
				this.p.sin(this.angle) * this.step,
			),
		);
	}

	display() {
		this.p.stroke(255);
		this.p.strokeWeight(4);
		this.p.point(this.position);
	}
}

function range(num: number) {
	return [...Array(num).keys()];
}
