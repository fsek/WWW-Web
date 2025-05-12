"use client";

import React, { useRef, useEffect } from "react";
import JumpingMoose from "src/entity/JumpingMoose.ts";

// biome-ignore lint/complexity/noBannedTypes: <testing>
const SimpleCanvasExample: React.FC<{}> = () => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const canvasCtxRef = React.useRef<CanvasRenderingContext2D | null>(null);

	useEffect(() => {
		// Initialize
		let frame: number;
		if (canvasRef.current) {
			canvasCtxRef.current = canvasRef.current.getContext("2d");
			const ctx = canvasCtxRef.current;
			if (ctx == null) throw new Error("Could not get context");
			const windowWidth = window.innerWidth;
			const scale = window.devicePixelRatio;

			const canvas = canvasRef.current;

			const width = windowWidth;
			const height = width * 0.12; //200 + padding * 2;
			const padding = width * 0.002;
			canvas.width = width * scale;
			canvas.height = height * scale;
			ctx.scale(scale, scale);
			ctx.lineWidth = 1;

			const wave_number = 20.0;
			const speed_scale = 0.004;
			const num_points = 100;
			const num_points_inv = 1.0 / num_points;
			const phasing_rate = 0.2;
			//const moose = new Image();
			//moose.src = "/moose_frames.png";
			const moose = new JumpingMoose("/moose_frames.png");
			const scuffed_moose_x_location = 0.98; // Yep... it's vibe coding time
			const moose_x = scaled_point(scuffed_moose_x_location, 4);
			const moose_ticks_per_frame = 4;
			let tick_count = 0;
			let moose_y_follow = 0.0; // goes negative when the moose jumps
			let moose_y = 0.0;
			let last_moose_y = 0.0;
			let moose_frame = 0;
			let phase = 0;

			function scaled_point(x: number, power: number) {
				return padding + x ** power * (width - 2 * padding);
			}

			const render = () => {
				tick_count += 1;

				if (tick_count % moose_ticks_per_frame === 0) {
					if (moose_frame < moose.num_frames - 1) {
						moose_frame += 1;
					} else {
						moose_frame = 0;
					}
				}
				const sawtooth_morph = ((1 - Math.cos(tick_count * 0.002)) * 0.5) ** 4;

				ctx.clearRect(0, 0, width, height);
				ctx.lineWidth = 2.0;

				ctx.beginPath();
				// Cross
				ctx.moveTo(padding, height * 0.5);
				ctx.lineTo(width, height * 0.5);
				ctx.moveTo(padding, 0);
				ctx.lineTo(padding, height);

				ctx.stroke();

				function wave_function(relative_x: number) {
					return Math.sin(relative_x * wave_number + phase);
					// *(1 -
					//	Math.exp((padding - scaled_point(relative_x, 2)) * wave_number)
				}

				// Wave
				ctx.moveTo(padding, height * 0.5);
				for (let i = 0; i < num_points + 1; i++) {
					ctx.beginPath();
					const relative_x = num_points_inv * i;
					const point = scaled_point(relative_x, 1);
					const wave1 = wave_function(relative_x);
					//ctx.strokeStyle = `rgba(0, 0, 0, ${1})`;
					ctx.lineWidth = 2.0;
					ctx.lineTo(
						point,
						height * 0.5 + wave1 * (height - padding * 2) * 0.5,
					);
					ctx.stroke();
				}

				ctx.strokeStyle = "rgba(0, 0, 0, 1)";

				//ctx.stroke();
				phase -= wave_number * speed_scale;

				const moose_wave = wave_function(scuffed_moose_x_location + 0.001);

				moose_y_follow = Math.min(0, -0.32 + 0.68 * moose_wave);
				moose_y = -(Math.abs(moose_y_follow) ** 0.77);
				// if (moose_y_follow <= moose_y) {
				// 	moose_y = moose_y_follow;
				// } else {
				// 	moose_y = -(Math.abs(moose_y_follow) ** 0.74);
				// }
				if (moose_y === 0) {
					moose.drawSprite(
						ctx,
						moose_frame,
						moose_x,
						height * 0.5 + moose_y * height * 0.36,
					);
				} else if (moose_y < last_moose_y + 0.025) {
					moose.drawSprite(
						ctx,
						4,
						moose_x,
						height * 0.5 + moose_y * height * 0.36,
					);
				} else {
					moose.drawSprite(
						ctx,
						5,
						moose_x,
						height * 0.5 + moose_y * height * 0.36,
					);
				}
				//ctx.beginPath();
				//ctx.arc(moose_x, moose_y, 10, 0, 2 * Math.PI);
				frame = requestAnimationFrame(render);
				last_moose_y = moose_y;
			};

			render();
		}
		return () => cancelAnimationFrame(frame);
	}, []);

	return <canvas className="max-w-screen" ref={canvasRef} />;
};

export default SimpleCanvasExample;
