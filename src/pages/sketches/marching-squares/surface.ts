import type p5 from "p5";
import { Point } from "./point";

type Line = [start: p5.Vector, end: p5.Vector];

export class Surface {
	private p: p5;
	private width: number;
	private height: number;
	private longerSide: number;
	/** 長辺に対する分割数 */
	private resolution: number;
	private threshold: number;
	private points: Point[][];
	private cellSize: number;
	private nCellsX: number;
	private nCellsY: number;
	private cells: Cell[];

	constructor(
		p: p5,
		width: number,
		height: number,
		resolution: number,
		threshold = 0.5,
	) {
		this.p = p;
		this.width = width;
		this.height = height;
		this.resolution = resolution;
		this.threshold = threshold;

		this.longerSide = Math.max(this.width, this.height);
		this.cellSize = this.longerSide / this.resolution;
		this.nCellsX = Math.floor(this.width / this.cellSize) + 1;
		this.nCellsY = Math.floor(this.height / this.cellSize) + 1;
		this.points = this.initPoints();
		this.cells = new Array(this.nCellsX * this.nCellsY);
	}

	setResolution(value: number) {
		this.resolution = value;
		this.cellSize = this.longerSide / this.resolution;
		this.nCellsX = Math.floor(this.width / this.cellSize) + 1;
		this.nCellsY = Math.floor(this.height / this.cellSize) + 1;
		this.points = this.initPoints();
		this.cells = new Array(this.nCellsX * this.nCellsY);
	}

	setThreshold(value: number) {
		this.threshold = value;
		this.points = this.initPoints();
		this.cells = new Array(this.nCellsX * this.nCellsY);
	}

	update(updater: (point: Point, x: number, y: number) => number) {
		this.updatePoints(updater);
		this.updateCells();
	}

	drawPoints(binary = false) {
		for (const row of this.points) {
			for (const point of row) {
				point.draw(binary);
			}
		}
	}

	drawPointValues() {
		for (const row of this.points) {
			for (const point of row) {
				point.drawValue();
			}
		}
	}

	drawCellKeys() {
		for (const cell of this.cells) {
			const key = cell.key;
			const x = (cell.tl.pos.x + cell.br.pos.x) / 2;
			const y = (cell.tl.pos.y + cell.br.pos.y) / 2;
			this.p.fill(200);
			this.p.noStroke();
			this.p.textAlign(this.p.CENTER, this.p.CENTER);
			this.p.textSize(16);
			this.p.text(key.toString(), x, y);
		}
	}

	drawGridLine() {
		this.p.stroke(200);
		this.p.strokeWeight(1);

		for (let i = 0; i < this.nCellsX; i++) {
			this.p.line(i * this.cellSize, 0, i * this.cellSize, this.p.height);
		}
		for (let j = 0; j < this.nCellsY; j++) {
			this.p.line(0, j * this.cellSize, this.p.width, j * this.cellSize);
		}
	}

	drawContour(interpolate = false) {
		for (const cell of this.cells) {
			const lines = interpolate
				? cell.getInterpolatedLineCoords()
				: cell.getRegularLineCoords();

			const color = this.p.color(0, 200, 0);
			this.p.stroke(color);
			this.p.strokeWeight(4);
			for (const line of lines) {
				this.p.line(line[0].x, line[0].y, line[1].x, line[1].y);
			}
		}
	}

	drawInside(interpolate = false) {
		for (const cell of this.cells) {
			const vertices = interpolate
				? cell.getInterpolatedVertexCoords()
				: cell.getRegularVertexCoords();

			const color = this.p.color(0);
			this.p.beginShape();
			this.p.stroke(color);
			this.p.strokeWeight(1);
			this.p.fill(color);
			for (const v of vertices) {
				this.p.vertex(v.x, v.y);
			}
			this.p.endShape(this.p.CLOSE);
		}
	}

	private initPoints(): Point[][] {
		const points: Point[][] = [];

		for (let i = 0; i < this.nCellsX + 1; i++) {
			const row: Point[] = [];
			for (let j = 0; j < this.nCellsY + 1; j++) {
				const pos = this.p.createVector(i * this.cellSize, j * this.cellSize);
				const point = new Point(this.p, pos, 0, this.threshold);
				row.push(point);
			}
			points.push(row);
		}

		return points;
	}

	private updatePoints(
		updater: (point: Point, x: number, y: number) => number,
	) {
		for (let i = 0; i < this.points.length; i++) {
			for (let j = 0; j < this.points[i].length; j++) {
				const value = updater(this.points[i][j], i, j);
				this.points[i][j].setValue(value);
			}
		}
	}

	private updateCells() {
		for (let i = 0; i < this.points.length - 1; i++) {
			for (let j = 0; j < this.points[i].length - 1; j++) {
				const cell = new Cell(
					this.p,
					this.points[i][j],
					this.points[i + 1][j],
					this.points[i + 1][j + 1],
					this.points[i][j + 1],
				);
				this.cells[i * this.nCellsY + j] = cell;
			}
		}
	}
}

class Cell {
	private p: p5;
	readonly topLeft: Point;
	readonly topRight: Point;
	readonly bottomRight: Point;
	readonly bottomLeft: Point;

	constructor(
		p: p5,
		topLeft: Point,
		topRight: Point,
		bottomRight: Point,
		bottomLeft: Point,
	) {
		this.p = p;
		this.topLeft = topLeft;
		this.topRight = topRight;
		this.bottomRight = bottomRight;
		this.bottomLeft = bottomLeft;
	}

	get tl(): Point {
		return this.topLeft;
	}
	get tr(): Point {
		return this.topRight;
	}
	get br(): Point {
		return this.bottomRight;
	}
	get bl(): Point {
		return this.bottomLeft;
	}

	get values(): [
		topLeft: number,
		topRight: number,
		bottomRight: number,
		bottomLeft: number,
	] {
		return [
			this.topLeft.value,
			this.topRight.value,
			this.bottomRight.value,
			this.bottomLeft.value,
		];
	}

	getRegularLineCoords(): Line[] {
		const interpolator = () => {
			return 0.5;
		};
		return this.getInterpolatedLines(interpolator);
	}

	getInterpolatedLineCoords(): Line[] {
		const interpolator = (valueA: number, valueB: number): number => {
			return (this.topLeft.threshold - valueA) / (valueB - valueA);
		};
		return this.getInterpolatedLines(interpolator);
	}

	getRegularVertexCoords(): p5.Vector[] {
		const interpolator = () => {
			return 0.5;
		};
		return this.getInterpolatedAreaVertices(interpolator);
	}

	getInterpolatedVertexCoords(): p5.Vector[] {
		const interpolator = (valueA: number, valueB: number): number => {
			return (this.topLeft.threshold - valueA) / (valueB - valueA);
		};
		return this.getInterpolatedAreaVertices(interpolator);
	}

	get key(): number {
		let binary = "";
		for (const v of this.values) {
			binary += v > this.topLeft.threshold ? "1" : "0";
		}
		return Number.parseInt(binary, 2);
	}

	private getInterpolatedLines(
		interpolator: (value1: number, value2: number) => number,
	): Line[] {
		return this.getInterpolatedLineRatios(interpolator).map((v) => {
			const x1 = this.p.lerp(this.tl.pos.x, this.tr.pos.x, v[0].x);
			const y1 = this.p.lerp(this.tl.pos.y, this.bl.pos.y, v[0].y);
			const x2 = this.p.lerp(this.tl.pos.x, this.tr.pos.x, v[1].x);
			const y2 = this.p.lerp(this.tl.pos.y, this.bl.pos.y, v[1].y);
			return [this.p.createVector(x1, y1), this.p.createVector(x2, y2)];
		});
	}

	private getInterpolatedAreaVertices(
		interpolator: (value1: number, value2: number) => number,
	): p5.Vector[] {
		return this.getInterpolatedAreaVertexRatios(interpolator).map((v) => {
			return this.p.createVector(
				this.p.lerp(this.tl.pos.x, this.tr.pos.x, v.x),
				this.p.lerp(this.tl.pos.y, this.bl.pos.y, v.y),
			);
		});
	}

	/** マーチングスクエア法によって補完された領域の頂点を返す */
	private getInterpolatedAreaVertexRatios(
		interpolator: (value1: number, value2: number) => number,
	): p5.Vector[] {
		const key = this.key;
		const values = this.values;

		switch (key) {
			case 0:
				return [];
			case 1:
				return [
					this.p.createVector(interpolator(values[3], values[2]), 1),
					this.p.createVector(0, 1),
					this.p.createVector(0, interpolator(values[0], values[3])),
				];
			case 2:
				return [
					this.p.createVector(1, interpolator(values[1], values[2])),
					this.p.createVector(1, 1),
					this.p.createVector(interpolator(values[3], values[2]), 1),
				];
			case 3:
				return [
					this.p.createVector(1, interpolator(values[1], values[2])),
					this.p.createVector(1, 1),
					this.p.createVector(0, 1),
					this.p.createVector(0, interpolator(values[0], values[3])),
				];
			case 4:
				return [
					this.p.createVector(interpolator(values[0], values[1]), 0),
					this.p.createVector(1, 0),
					this.p.createVector(1, interpolator(values[1], values[2])),
				];
			case 5:
				return [
					this.p.createVector(interpolator(values[0], values[1]), 0),
					this.p.createVector(1, 0),
					this.p.createVector(1, interpolator(values[1], values[2])),
					this.p.createVector(interpolator(values[3], values[2]), 1),
					this.p.createVector(0, 1),
					this.p.createVector(0, interpolator(values[0], values[3])),
				];
			case 6:
				return [
					this.p.createVector(interpolator(values[0], values[1]), 0),
					this.p.createVector(1, 0),
					this.p.createVector(1, 1),
					this.p.createVector(interpolator(values[3], values[2]), 1),
				];
			case 7:
				return [
					this.p.createVector(interpolator(values[0], values[1]), 0),
					this.p.createVector(1, 0),
					this.p.createVector(1, 1),
					this.p.createVector(0, 1),
					this.p.createVector(0, interpolator(values[0], values[3])),
				];
			case 8:
				return [
					this.p.createVector(0, 0),
					this.p.createVector(interpolator(values[0], values[1]), 0),
					this.p.createVector(0, interpolator(values[0], values[3])),
				];
			case 9:
				return [
					this.p.createVector(0, 0),
					this.p.createVector(interpolator(values[0], values[1]), 0),
					this.p.createVector(interpolator(values[3], values[2]), 1),
					this.p.createVector(0, 1),
				];
			case 10:
				return [
					this.p.createVector(0, 0),
					this.p.createVector(interpolator(values[0], values[1]), 0),
					this.p.createVector(1, interpolator(values[1], values[2])),
					this.p.createVector(1, 1),
					this.p.createVector(interpolator(values[3], values[2]), 1),
					this.p.createVector(0, interpolator(values[0], values[3])),
				];
			case 11:
				return [
					this.p.createVector(0, 0),
					this.p.createVector(interpolator(values[0], values[1]), 0),
					this.p.createVector(1, interpolator(values[1], values[2])),
					this.p.createVector(1, 1),
					this.p.createVector(0, 1),
				];
			case 12:
				return [
					this.p.createVector(0, 0),
					this.p.createVector(1, 0),
					this.p.createVector(1, interpolator(values[1], values[2])),
					this.p.createVector(0, interpolator(values[0], values[3])),
				];
			case 13:
				return [
					this.p.createVector(0, 0),
					this.p.createVector(1, 0),
					this.p.createVector(1, interpolator(values[1], values[2])),
					this.p.createVector(interpolator(values[3], values[2]), 1),
					this.p.createVector(0, 1),
				];
			case 14:
				return [
					this.p.createVector(0, 0),
					this.p.createVector(1, 0),
					this.p.createVector(1, 1),
					this.p.createVector(interpolator(values[3], values[2]), 1),
					this.p.createVector(0, interpolator(values[0], values[3])),
				];
			case 15:
				return [
					this.p.createVector(0, 0),
					this.p.createVector(1, 0),
					this.p.createVector(1, 1),
					this.p.createVector(0, 1),
				];
			default:
				return [];
		}
	}

	/** マーチングスクエア法によって補完された線の頂点を返す */
	private getInterpolatedLineRatios(
		interpolator: (value1: number, value2: number) => number,
	): [start: p5.Vector, end: p5.Vector][] {
		const key = this.key;
		const values = this.values;

		switch (key) {
			case 0:
			case 15:
				return [];
			case 1:
			case 14:
				return [
					[
						this.p.createVector(0, interpolator(values[0], values[3])),
						this.p.createVector(interpolator(values[3], values[2]), 1),
					],
				];
			case 2:
			case 13:
				return [
					[
						this.p.createVector(interpolator(values[3], values[2]), 1),
						this.p.createVector(1, interpolator(values[1], values[2])),
					],
				];
			case 3:
			case 12:
				return [
					[
						this.p.createVector(0, interpolator(values[0], values[3])),
						this.p.createVector(1, interpolator(values[1], values[2])),
					],
				];
			case 4:
			case 11:
				return [
					[
						this.p.createVector(interpolator(values[0], values[1]), 0),
						this.p.createVector(1, interpolator(values[1], values[2])),
					],
				];
			case 5:
				return [
					[
						this.p.createVector(0, interpolator(values[0], values[3])),
						this.p.createVector(interpolator(values[0], values[1]), 0),
					],
					[
						this.p.createVector(interpolator(values[3], values[2]), 1),
						this.p.createVector(1, interpolator(values[1], values[2])),
					],
				];
			case 6:
			case 9:
				return [
					[
						this.p.createVector(interpolator(values[0], values[1]), 0),
						this.p.createVector(interpolator(values[3], values[2]), 1),
					],
				];
			case 7:
			case 8:
				return [
					[
						this.p.createVector(0, interpolator(values[0], values[3])),
						this.p.createVector(interpolator(values[0], values[1]), 0),
					],
				];
			case 10:
				return [
					[
						this.p.createVector(0, interpolator(values[0], values[3])),
						this.p.createVector(interpolator(values[3], values[2]), 1),
					],
					[
						this.p.createVector(interpolator(values[0], values[1]), 0),
						this.p.createVector(1, interpolator(values[1], values[2])),
					],
				];
			default:
				return [];
		}
	}
}
