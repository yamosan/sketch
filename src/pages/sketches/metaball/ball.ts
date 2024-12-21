import p5 from "p5";

export class Ball {
	private p: p5;
	pos: p5.Vector;
	velocity: p5.Vector;
	acceleration: p5.Vector;
	rad: number;
	mass: number;

	constructor(p: p5, pos: p5.Vector, m: number) {
		this.p = p;
		this.pos = pos;
		this.velocity = p.createVector(0, 0);
		this.acceleration = p.createVector(0, 0);
		this.rad = m;
		this.mass = m; // 質量
	}

	applyForce(force: p5.Vector) {
		const f = force.copy().div(this.mass);
		this.acceleration.add(f);
	}

	attract(other: Ball) {
		const force = p5.Vector.sub(this.pos, other.pos);
		const distanceSq = this.p.constrain(force.magSq(), 100, 1000); // 距離²を制限して安定性を確保

		// 距離²の最小値を設定して過度な引力を防ぐ
		const minDist = 100; // 最小距離
		const constrainedDistanceSq = this.p.constrain(
			distanceSq,
			minDist * minDist,
			1000,
		);

		// const G = 0.8; // 重力定数のようなもの
		const G = 6;
		const strength = (G * (this.mass * other.mass)) / constrainedDistanceSq;
		force.setMag(strength);
		other.applyForce(force);
	}

	update() {
		this.velocity.add(this.acceleration);
		this.pos.add(this.velocity);
		this.acceleration.mult(0);

		// 摩擦を追加して急激な動きを抑制
		const friction = this.velocity.copy().mult(-0.008); // 摩擦係数を調整
		this.velocity.add(friction);

		this.edges();
	}

	edges() {
		if (this.pos.x > this.p.width || this.pos.x < 0) {
			this.velocity.x *= -1;
			this.pos.x = this.p.constrain(this.pos.x, 0, this.p.width);
		}
		if (this.pos.y > this.p.height || this.pos.y < 0) {
			this.velocity.y *= -1;
			this.pos.y = this.p.constrain(this.pos.y, 0, this.p.height);
		}
	}

	display() {
		this.p.fill(127);
		this.p.stroke(0);
		this.p.ellipse(this.pos.x, this.pos.y, this.rad * 2);
	}
}
