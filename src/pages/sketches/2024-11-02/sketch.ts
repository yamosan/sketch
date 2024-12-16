import type p5 from "p5";

type WaveFactory = (...args: ConstructorParameters<typeof Wave>) => Wave;

export function sketch(p: p5) {
	const waves: Wave[] = [];

	p.setup = () => {
		p.createCanvas(p.windowWidth, p.windowHeight);
		p.background(0);
	};

	p.draw = () => {
		p.background("rgba(0, 0, 0, 0.08)");
		for (const wave of waves) {
			wave.move();
			wave.display();
		}
	};

	p.windowResized = () => {
		p.resizeCanvas(p.windowWidth, p.windowHeight);
	};

	p.touchStarted = () => {
		const waveTypes = [TriangleWave, SinWave, SquareWave, SawtoothWave];
		for (let i = 0; i < waveTypes.length; i++) {
			const waveType = waveTypes[i];
			const x = 10;
			const y = (p.height / waveTypes.length) * (i + 0.5);
			const wave = new waveType(p, p.createVector(x, y), 50, 25, 0);
			waves.push(wave);
		}
	};

	// p.touchStarted = () => {
	// 	const waveTypes = [TriangleWave, SinWave, SquareWave];
	// 	const waveType = p.random(waveTypes);
	// 	const factory: WaveFactory = (...args) => {
	// 		return new waveType(...args);
	// 	};
	// 	waves.push(...createWaves(p.createVector(p.mouseX, p.mouseY), factory));
	// };

	// function createWaves(center: p5.Vector, waveFactory: WaveFactory): Wave[] {
	// 	const angleDiv = 12;
	// 	const waves: Wave[] = [];
	// 	for (let i = 0; i < angleDiv; i++) {
	// 		const amplitude = 50;
	// 		const period = 25;
	// 		const rotate = (p.TWO_PI / angleDiv) * i;
	// 		const startPos = p.createVector(
	// 			center.x + p.cos(rotate) * 80,
	// 			center.y + p.sin(rotate) * 80,
	// 		);

	// 		const wave = waveFactory(p, startPos, amplitude, period, rotate);
	// 		waves.push(wave);
	// 	}
	// 	return waves;
	// }
}

abstract class Wave {
	protected p: p5;
	protected startPosition: p5.Vector;
	protected beforePosition: p5.Vector;
	protected position: p5.Vector;
	protected amplitude: number;
	protected period: number;
	protected angle: number;
	protected progress: number;

	constructor(
		p: p5,
		startPosition: p5.Vector,
		amplitude: number,
		period: number,
		rotate: number,
	) {
		this.p = p;
		this.startPosition = startPosition;
		this.amplitude = amplitude;
		this.period = period;
		this.angle = rotate;

		this.beforePosition = this.startPosition.copy();
		this.position = this.startPosition.copy();
		this.progress = 0;
	}

	move() {
		this.beforePosition = this.position.copy();
		this.progress += 1;

		const x = this.progress * 5;
		const y = this.wave(this.progress, this.amplitude, this.period, 0, 0);

		const offset = this.p.createVector(x, y).rotate(this.angle);
		this.position = this.startPosition.copy().add(offset);
	}

	display() {
		this.p.stroke(255);
		this.p.strokeWeight(4);
		this.p.line(
			this.beforePosition.x,
			this.beforePosition.y,
			this.position.x,
			this.position.y,
		);
	}

	abstract wave(
		t: number,
		amplitude: number,
		period: number,
		phase: number,
		verticalShift: number,
	): number;
}

class TriangleWave extends Wave {
	wave(
		t: number,
		amplitude: number,
		period: number,
		phase: number,
		verticalShift: number,
	) {
		const initPhase = phase + period / 4; // t=0のときにy=0になるように初期位相を設定
		const normalizedT = ((t + initPhase) % period) / period;
		const mappedT = this.p.map(normalizedT, 0, 1, -1, 1);
		const triangleValue = 2 * this.p.abs(mappedT) - 1;
		return amplitude * triangleValue + verticalShift;
	}
}

class SinWave extends Wave {
	wave(
		t: number,
		amplitude: number,
		period: number,
		phase: number,
		verticalShift: number,
	) {
		return (
			amplitude * this.p.sin((this.p.TWO_PI * (t + phase)) / period) +
			verticalShift
		);
	}
}

class SquareWave extends Wave {
	wave(
		t: number,
		amplitude: number,
		period: number,
		phase: number,
		verticalShift: number,
	) {
		const normalizedT = ((t + phase) % period) / period;
		const squareValue = normalizedT < 0.5 ? 1 : -1;
		return amplitude * squareValue + verticalShift;
	}
}

class SawtoothWave extends Wave {
	wave(
		t: number,
		amplitude: number,
		period: number,
		phase: number,
		verticalShift: number,
	) {
		const normalizedT = ((t + phase) % period) / period; // 正規化した時間
		const sawtoothValue = 2 * normalizedT - 1; // -1から1の範囲でのこぎり波を生成
		return amplitude * sawtoothValue + verticalShift;
	}
}
