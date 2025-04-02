"use client";

import React, { useRef, useEffect } from "react";

// biome-ignore lint/complexity/noBannedTypes: <testing>
const SimpleCanvasExample: React.FC<{}> = () => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const canvasCtxRef = React.useRef<CanvasRenderingContext2D | null>(null);

	useEffect(() => {
		// Initialize
		if (canvasRef.current) {
			canvasCtxRef.current = canvasRef.current.getContext("2d");
			const ctx = canvasCtxRef.current;
			if (ctx == null) throw new Error("Could not get context");
			const windowWidth = window.innerWidth;
			//const windowHeight = window.innerHeight;

			const canvas = canvasRef.current;
			const padding = 20;
			canvas.width = windowWidth * window.devicePixelRatio;
			canvas.height = (200 + padding * 2) * window.devicePixelRatio;
			console.log(window.devicePixelRatio);
			ctx.lineWidth = 1;

			const wave_number = 0.015;
			const start = 100;
			const speed_scale = 1.5;
			const num_points = 100;
			const num_points_inv = 1.0 / num_points;
			const phasing_rate = -0.2;

			let phase = 0;

			// Roof
			const render = () => {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.beginPath();
				// Circle
				ctx.lineTo(canvas.width, canvas.height * 0.5);
				ctx.stroke();
				ctx.beginPath();
				ctx.arc(
					start + padding,
					canvas.height / 2,
					canvas.height * 0.5 - padding,
					0,
					2 * Math.PI,
				);

				// Cross
				ctx.moveTo(0, canvas.height * 0.5);
				ctx.lineTo(canvas.width, canvas.height * 0.5);
				ctx.moveTo(start + padding, 0);
				ctx.lineTo(start + padding, canvas.height);

				function scaled_point(x: number, power: number) {
					return (
						start +
						padding +
						x ** power * (canvas.width - 2 * (start + padding))
					);
				}
				ctx.stroke();
				ctx.beginPath();

				// Wave
				ctx.moveTo(start + padding, canvas.height * 0.5);
				for (let i = 0; i < num_points + 1; i++) {
					const relative_x =
						num_points_inv *
						(i - (phase * phasing_rate - Math.floor(phase * phasing_rate)));
					const point = scaled_point(relative_x, 4);
					const wave1 =
						Math.sin(scaled_point(relative_x, 2) * wave_number + phase) *
						(1 -
							Math.exp(
								(start + padding - scaled_point(relative_x, 2)) * wave_number,
							));

					ctx.lineTo(
						point,
						canvas.height * 0.5 + wave1 * (canvas.height - padding * 2) * 0.5,
					);
					ctx.stroke();
					if (relative_x > 0.1) {
						ctx.setLineDash([relative_x ** 4 * 10, relative_x ** 4 * 10]);
						ctx.lineDashOffset = -Math.abs(
							wave1 * relative_x ** 4 * (canvas.height - padding * 2) * 0.25,
						);
					}
					ctx.strokeStyle = `rgba(0, 0, 0, ${1 - relative_x ** 4})`;

					//ctx.strokeStyle = "red";
					ctx.beginPath();
					ctx.moveTo(
						point,
						canvas.height * 0.5 + wave1 * (canvas.height - padding * 2) * 0.5,
					);
					ctx.lineTo(point, canvas.height * 0.5);
					ctx.stroke();
					ctx.setLineDash([]);
					//ctx.strokeStyle = "black";
					ctx.beginPath();
					ctx.moveTo(
						point,
						canvas.height * 0.5 + wave1 * (canvas.height - padding * 2) * 0.5,
					);
				}
				ctx.strokeStyle = "rgba(0, 0, 0, 1)";

				ctx.stroke();
				phase -= wave_number * speed_scale;
				requestAnimationFrame(render);
			};

			render();
		}
	}, []);

	return <canvas className="max-w-screen" ref={canvasRef} />;
};

export default SimpleCanvasExample;
