import GUI from "lil-gui";
import type p5 from "p5";
import { Surface } from "./surface";

const settings = {
	resolution: 60,
	noiseScale: 0.05,
	noiseSpeed: 0.005,
	threshold: 0.5,

	interpolate: true,
	showGrid: false,
	showPoint: "color" as "hidden" | "binary" | "color",
	showPointValues: false,
};

export function sketch(p: p5) {
	let center: p5.Vector;

	let framerateManager: FrameRateManager;
	let surface: Surface;

	p.setup = () => {
		p.createCanvas(p.windowWidth, p.windowHeight);
		p.background(0);
		center = p.createVector(p.width / 2, p.height / 2);

		surface = new Surface(p, p.width, p.height, 120);
		framerateManager = new FrameRateManager(p);

		setupGui();
	};

	p.draw = () => {
		framerateManager.update();

		p.background(255);

		surface.update((point, x, y) => {
			const value = p.noise(
				x * settings.noiseScale,
				y * settings.noiseScale,
				p.frameCount * settings.noiseSpeed,
			);
			return value;
		});

		surface.drawInside(settings.interpolate);
		surface.drawContour(settings.interpolate);
		if (settings.showGrid) {
			surface.drawGridLine();
		}
		switch (settings.showPoint) {
			case "binary":
				surface.drawPoints(true);
				break;
			case "color":
				surface.drawPoints(false);
				break;
		}
		if (settings.showPointValues) {
			surface.drawPointValues();
		}
	};

	function setupGui() {
		const gui = new GUI();
		// frame rates
		gui
			.add(framerateManager, "averageFrameRate")
			.name("FPS")
			.listen()
			.disable();

		gui.add(settings, "resolution", 4, 120, 1).onChange((value: number) => {
			surface.setResolution(value);
		});

		gui
			.add(settings, "noiseScale", 0.001, 0.1, 0.001)
			.onChange((value: number) => {
				settings.noiseScale = value;
			});

		gui
			.add(settings, "noiseSpeed", 0.0001, 0.01, 0.0001)
			.onChange((value: number) => {
				settings.noiseSpeed = value;
			});

		gui.add(settings, "threshold", 0, 1, 0.01).onChange((value: number) => {
			surface.setThreshold(value);
		});

		gui.add(settings, "interpolate").onChange((value: boolean) => {
			settings.interpolate = value;
		});

		gui
			.add(settings, "showPoint", ["hidden", "binary", "color"])
			.onChange((value: "hidden" | "binary" | "color") => {
				settings.showPoint = value;
			});

		gui.add(settings, "showPointValues").onChange((value: boolean) => {
			settings.showPointValues = value;
		});

		gui.add(settings, "showGrid").onChange((value: boolean) => {
			settings.showGrid = value;
		});
	}
}

class FrameRateManager {
	private p: p5;
	private maxSamples: number;
	private frameRates: number[] = [];
	averageFrameRate: number;

	constructor(p: p5, maxSamples = 60) {
		this.p = p;
		this.maxSamples = maxSamples;
		this.averageFrameRate = 0;
	}

	update() {
		const currentFrameRate = this.p.frameRate();
		this.frameRates.push(currentFrameRate);

		if (this.frameRates.length > this.maxSamples) {
			this.frameRates.shift();
		}

		this.averageFrameRate = this.getAverageFrameRate();
	}

	private getAverageFrameRate(): number {
		const sum = this.frameRates.reduce((acc, val) => acc + val, 0);
		const fps = sum / this.frameRates.length;

		return Math.floor(fps);
	}
}
