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
			canvas.width = windowWidth;
			canvas.height = 200 + padding * 2;

			ctx.lineWidth = 1;

			const wave_number = 0.15;
			const start = 100;
			const packet_speed = 1;
			const phase_velocity_mult = 0.5;
			const packet_interval = 70;
			const packet_scale = 0.1; // lower is wider
			const num_points = 500;
			const num_points_inv = 1.0 / num_points;
			const visible_packets = 3;
			const moose_x = 0.4;

			let wave_phase = 0;
			let packet_phase = 0;

			const moose_run_src = [
				"/images/moose/hilbert_pixel_run_1.png",
				"/images/moose/hilbert_pixel_run_2.png",
				"/images/moose/hilbert_pixel_run_3.png",
				"/images/moose/hilbert_pixel_run_4.png",
			];

			const moose_run: HTMLImageElement[] = [];
			for (let i = 0; i < 4; i++) {
				const img = new Image();
				img.src = moose_run_src[i];
				moose_run.push(img);
			}
			const moose_up = new Image();
			const moose_down = new Image();
			moose_up.src = "/images/moose/hilbert_pixel_jump.png";
			moose_down.src = "/images/moose/hilbert_pixel_jump.png";

			function gaussian(x: number, scale: number, center: number) {
				return Math.exp(-(((center - x) * scale) ** 2));
			}

			function periodic_gaussian(point: number, scale: number) {
				let sum = 0;
				for (let j = 0; j < visible_packets; j++) {
					sum += gaussian(
						point * wave_number,
						scale,
						(j * packet_interval + packet_phase) %
							(visible_packets * packet_interval),
					);
				}
				return sum;
			}

			function scaled_point(x: number, power: number) {
				return (
					start + padding + x ** power * (canvas.width - 2 * (start + padding))
				);
			}

			const scaled_moose_x = scaled_point(moose_x, 1);

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

				ctx.stroke();
				ctx.beginPath();

				// Wave
				ctx.moveTo(start + padding, canvas.height * 0.5);
				for (let i = 0; i < num_points + 1; i++) {
					const relative_x =
						num_points_inv * (i - (wave_phase - Math.floor(wave_phase)));
					const point = scaled_point(relative_x, 1);
					const wave = Math.sin(point * wave_number - wave_phase);

					const packet = periodic_gaussian(point, packet_scale);
					// for (let j = 0; j < visible_packets; j++) {
					// 	packet += gaussian(
					// 		point * wave_number,
					// 		packet_scale,
					// 		(j * packet_interval + packet_phase) %
					// 			(visible_packets * packet_interval),
					// 	);
					// }

					ctx.lineTo(
						point,
						canvas.height * 0.5 +
							packet * wave * (canvas.height - padding * 2) * 0.5,
					);

					ctx.stroke();
				}
				ctx.strokeStyle = "rgba(0, 0, 0, 1)";

				ctx.stroke();

				packet_phase += packet_speed;
				wave_phase += packet_speed * phase_velocity_mult;

				// Moose
				ctx.drawImage(
					moose_up,
					scaled_moose_x - 12,
					canvas.height * 0.5 -
						24 -
						Math.max(
							0,
							periodic_gaussian(scaled_moose_x, packet_scale * 0.5) - 0.25,
						) *
							(canvas.height - padding * 2) *
							0.7,
				);

				requestAnimationFrame(render);
			};

			render();
		}
	}, []);

	return <canvas ref={canvasRef} />;
};

export default SimpleCanvasExample;
