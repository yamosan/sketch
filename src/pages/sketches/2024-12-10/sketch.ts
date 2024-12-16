import type p5 from "p5";
import { ArcShape } from "./arc-shape";
import { RegularPolygon } from "./regular-polygon";
import { Star } from "./star";

interface Shape {
	draw(aux: boolean): void;
	setRound(round: number): void;
}

export function sketch(p: p5) {
	let center: p5.Vector;
	const shapes: Shape[] = [];

	let slider: p5.Element;

	p.setup = () => {
		p.createCanvas(p.windowWidth, p.windowHeight);
		p.background(0);
		center = p.createVector(p.width / 2, p.height / 2);

		/** 正多角形 */
		for (let i = 0; i <= 2; i++) {
			// x方向に左から等間隔に配置. ただし中心に対して線対称になるように
			const shape = new RegularPolygon(
				p,
				center.x + (i - 1) * 400,
				center.y,
				320,
				3 + i,
			);
			shapes.push(shape);
		}

		/** not 正多角形 */
		// const shape = new ArcShape(
		// 	p,
		// 	p.createVector(center.x - 200, center.y - 200),
		// 	p.createVector(center.x, center.y - 50), //
		// 	p.createVector(center.x + 200, center.y - 200),
		// 	p.createVector(center.x + 200, center.y + 200),
		// 	p.createVector(center.x, center.y + 50), //
		// 	p.createVector(center.x - 200, center.y + 200),
		// );
		// shapes.push(shape);

		/** 星 */
		// const numPoints = 5;
		// const outerRadius = 200;
		// const innerRadius = 100;
		// const star = new Star(p, center, numPoints, innerRadius, outerRadius);
		// shapes.push(star);

		slider = p.createSlider(0, 200, 0);
		slider.position(30, 30);
		slider.size(100);
	};

	p.draw = () => {
		p.background(0);
		p.noFill();
		p.stroke(255);

		const r = Number(slider.value());

		for (const shape of shapes) {
			shape.setRound(r);
			shape.draw(true);
		}

		p.fill(255);
		// p.ellipse(center.x, center.y, 10, 10);
	};
}
