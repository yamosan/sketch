import type p5 from "p5";
import { Ball } from "./ball";
import { MetaballSurface } from "./metaball-surface";

export function sketch(p: p5) {
	let frameRateDisplay: FrameRateDisplay;
	const ballNum = 18;
	const balls: Ball[] = [];
	let surface: MetaballSurface;
	let center: p5.Vector;
	let longerSide: number;

	p.setup = () => {
		p.createCanvas(p.windowWidth, p.windowHeight);
		p.background(0);
		center = p.createVector(p.width / 2, p.height / 2);
		longerSide = p.width > p.height ? p.width : p.height;

		frameRateDisplay = new FrameRateDisplay(
			p,
			p.createVector(p.width - 10, 20),
		);

		for (let i = 0; i < ballNum; i++) {
			const pos = p.createVector(p.random(p.width), p.random(p.height));

			const rad = p.random(longerSide / 100, longerSide / 72);
			balls.push(new Ball(p, pos, rad));
		}
		surface = new MetaballSurface(p, [...balls], 180);
	};

	p.touchStarted = () => {
		for (const ball of balls) {
			const direction = p.createVector(
				ball.pos.x - p.mouseX,
				ball.pos.y - p.mouseY,
			);
			direction.setMag(longerSide / 8); // 力の強さを調整
			ball.applyForce(direction);
		}
	};

	p.draw = () => {
		p.background(255);

		surface.update();
		surface.draw();

		frameRateDisplay.update();
		// frameRateDisplay.display();

		// p.text(surface.resolution, 50, 20);
		// fpsが30になるように調整
		const targetFps = 50; // 目標とするフレームレート
		const adjustmentRate = 0.02;
		const minResolution = 40;
		if (frameRateDisplay.fps !== targetFps) {
			const currentResolution = surface.resolution;

			// 必要以上に解像度を優先しないようにする
			if (currentResolution < minResolution) {
				return;
			}

			// 調整の速度
			const fpsDifference = frameRateDisplay.fps - targetFps;
			// 解像度を調整するための計算
			const adjustment = 1 + (adjustmentRate * fpsDifference) / targetFps;

			if (
				(adjustment > 0 && adjustment < 0.2) ||
				(adjustment < 0 && adjustment > -0.2)
			) {
				return;
			}
			const newResolution = Math.round(currentResolution * adjustment);
			if (newResolution < minResolution) {
				return;
			}
			surface.setResolution(newResolution);
		}
	};
}

class FrameRateDisplay {
	private p: p5;
	private pos: p5.Vector;
	private maxSamples: number;
	private frameRates: number[] = [];

	constructor(p: p5, pos: p5.Vector, maxSamples = 60) {
		this.p = p;
		this.pos = pos;
		this.maxSamples = maxSamples;
	}

	get fps() {
		return this.getAverageFrameRate();
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

		this.p.fill(180);
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
