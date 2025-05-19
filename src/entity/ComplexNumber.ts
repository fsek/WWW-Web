class Complex {
	constructor(
		public re: number,
		public im: number,
	) {}

	abs(): number {
		return Math.sqrt(this.re ** 2 + this.im ** 2);
	}

	add(other: Complex): Complex {
		return new Complex(this.re + other.re, this.im + other.im);
	}

	multiply(other: Complex): Complex {
		return new Complex(
			this.re * other.re - this.im * other.im,
			this.re * other.im + this.im * other.re,
		);
	}

	divide(other: Complex): Complex {
		return new Complex(
			(this.re * other.re + this.im * other.im) / other.abs(),
			(this.im * other.re - this.re * other.im) / other.abs(),
		);
	}

	real(): number {
		return this.re;
	}

	imag(): number {
		return this.im;
	}

	exp(): Complex {
		const mult = Math.exp(this.re);
		return new Complex(mult * Math.cos(this.im), mult * Math.sin(this.im));
	}

	sqrt(): Complex {
		return new Complex(
			Math.sqrt((this.abs() + this.re) * 0.5),
			Math.sign(this.im) * Math.sqrt((this.abs() - this.re) * 0.5),
		);
	}

	toString(): string {
		return `${this.re} + ${this.im}i`;
	}
}

export default Complex;
