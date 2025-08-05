"use client";

import React, { useRef, useEffect } from "react";
import JumpingMoose from "src/entity/JumpingMoose.ts";
import Complex from "src/entity/ComplexNumber.ts";

// biome-ignore lint/complexity/noBannedTypes: <testing>
const WaveAnimation: React.FC<{}> = () => {
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
			const canvas = canvasRef.current;

			const packet_width = 0.04;
			const moose_jump_length = 0.25;
			const moose_jump_cut = 0.8; // Moves the gaussian window function down by this amount (before clipping and normalizing), creating a sharper, more realistic jump
			// Jump length must be increased accordingly (this is the width of the entire window before it's modified)
			const wave_number = 150;
			const phase_velocity_ratio = 0.66;
			const tick_cycle_length = 300;
			const wave_rate = 3; // Integer number of wave packets between each cycle.

			const num_points = 500;
			const num_points_inv = 1.0 / num_points;

			const moose = new JumpingMoose("/moose_frames.png");

			const moose_ticks_per_frame = 4;

			let tick_count = 0;
			let moose_y = 0.0;
			let last_moose_y = 0.0;

			let moose_frame = 0;

			// Handle moose jumping easter egg
			const moose_jump_vel = 0.086;
			const gravity = 0.006;
			let moose_y_vel = 0.0;
			let is_jumping = false;
			let moose_control = false;
			let queue_moose_control = false;
			let frames_since_jump = -1;
			canvas.addEventListener(
				"mousedown",
				() => {
					if (!moose_control && is_jumping) {
						queue_moose_control = true;
					} else {
						moose_control = true;
					}
					frames_since_jump = 0;
				},
				false,
			);

			// canvas.addEventListener(
			// 	"mouseup",
			// 	() => {
			// 		jump_button = false;
			// 	},
			// 	false,
			// );

			const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a;

			// Position, Time, Width, Wavenumber, Phase velocity

			function wave(x: number, t: number, w: number, k: number, a: number) {
				const gaussian = Math.exp(-(((x - t) / w) ** 2));
				if (k === 0) {
					return gaussian;
				}
				const sin = Math.sin(x * k - t * k * a);
				return gaussian * sin;
			}

			function tick_cycle(tick_count: number, delay: number) {
				return (
					1.2 *
						(((tick_count - delay) % tick_cycle_length) / tick_cycle_length) -
					0.1
				);
			}

			const render = () => {
				const scale = window.devicePixelRatio;

				const width = windowWidth;
				const height_padding = 50;
				const height = width * 0.12;
				const padding = width * 0.005;
				const atom_size = 10;
				canvas.width = width;
				canvas.height = (height + 2 * height_padding) * scale;
				//ctx.scale(scale, scale);

				const moose_x_ratio = 0.75;
				const moose_x = scaled_point_2(moose_x_ratio, 1);

				function scaled_point(x: number, power: number) {
					return ()
				}

				function scaled_point_2(x: number, power: number) {
					return (
						padding +
						atom_size +
						x ** power * (width - 2 * (padding + atom_size))
					);
				}

				tick_count += 1;

				if (tick_count % moose_ticks_per_frame === 0) {
					if (moose_frame < moose.num_frames - 1) {
						moose_frame += 1;
					} else {
						moose_frame = 0;
					}
				}
				ctx.clearRect(0, 0, width, height + 2 * height_padding);
				ctx.fillText(
					`devicePixelRatio: ${window.devicePixelRatio}`,
					width * 0.5,
					height * 0.2,
				);
				ctx.lineWidth = 2.0;

				let atom_L_wave = 0;
				let atom_R_wave = 0;
				for (let i = 0; i < wave_rate; i++) {
					atom_L_wave += wave(
						0,
						tick_cycle(tick_count, (i * tick_cycle_length) / wave_rate),
						packet_width,
						wave_number,
						phase_velocity_ratio,
					);
					atom_R_wave += wave(
						1,
						tick_cycle(tick_count, (i * tick_cycle_length) / wave_rate),
						packet_width,
						wave_number,
						phase_velocity_ratio,
					);
				}

				ctx.beginPath();

				ctx.arc(
					padding + atom_size,
					height * 0.5 +
						height_padding +
						atom_L_wave * (height - padding * 2) * 0.5,
					atom_size,
					0,
					2 * Math.PI,
				);
				ctx.stroke();
				ctx.beginPath();
				ctx.arc(
					width - padding - atom_size,
					height * 0.5 +
						height_padding +
						atom_R_wave * (height - padding * 2) * 0.5,
					atom_size,
					0,
					2 * Math.PI,
				);

				ctx.stroke();

				// Wave
				ctx.moveTo(padding + atom_size, height * 0.5 + height_padding);

				for (let i = 0; i < num_points + 1; i++) {
					const relative_x = num_points_inv * i;
					const point = scaled_point(relative_x, 1);
					let wave1 = 0;
					for (let i = 0; i < wave_rate; i++) {
						wave1 += wave(
							relative_x,
							tick_cycle(tick_count, (i * tick_cycle_length) / wave_rate),
							packet_width,
							wave_number,
							phase_velocity_ratio,
						);
					}

					ctx.lineTo(
						point,
						height * 0.5 +
							height_padding +
							wave1 * (height - padding * 2) * 0.5,
					);
					ctx.stroke();

					ctx.lineWidth = 4.0;
					ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
					ctx.beginPath();
					ctx.moveTo(
						point,
						height * 0.5 +
							height_padding +
							wave1 * (height - padding * 2) * 0.5,
					);
					ctx.lineTo(point, height * 0.5 + height_padding);
					ctx.stroke();

					ctx.strokeStyle = "black";
					ctx.beginPath();
					ctx.moveTo(
						point,
						height * 0.5 +
							height_padding +
							wave1 * (height - padding * 2) * 0.5,
					);
					ctx.lineWidth = 2.0;
					ctx.strokeStyle = "rgba(0, 0, 0, 1)";
				}
				let wave_at_moose = 0.0;
				for (let i = 0; i < wave_rate; i++) {
					const moose_wave: number = wave(
						moose_x_ratio,
						tick_cycle(tick_count, (i * tick_cycle_length) / wave_rate),
						moose_jump_length,
						0,
						phase_velocity_ratio,
					);
					wave_at_moose += Math.min(
						0,
						-(moose_wave - moose_jump_cut) / (1 - moose_jump_cut),
					);
				}
				if (!moose_control) {
					moose_y = wave_at_moose;
					if (moose_y < 0.0 && last_moose_y === 0.0) {
						is_jumping = true;
					} else if (moose_y === 0.0) {
						is_jumping = false;
						if (queue_moose_control) {
							moose_control = true;
							queue_moose_control = false;
						}
					}
				} else {
					if (!is_jumping && frames_since_jump > -1 && frames_since_jump < 10) {
						moose_y = 0.0;
						moose_y_vel = -moose_jump_vel;
						is_jumping = true;
						frames_since_jump = -1;
					} else if (is_jumping) {
						if (moose_y + moose_y_vel < 0.01) {
							moose_y += moose_y_vel;
							moose_y_vel += lerp(
								gravity,
								gravity * 0.4,
								1.0 / (1.0 + 220.0 * moose_y_vel * moose_y_vel),
							);
						} else {
							moose_y = 0.0;
							moose_y_vel = 0.0;
							is_jumping = false;
						}
					}
				}
				let shake_x = 0.0;
				let shake_y = 0.0;
				const shake_max = 10.0 * Math.max(moose_y - wave_at_moose, 0.0) ** 2;
				if (shake_max > 0.0) {
					shake_x = shake_max * (Math.random() - 0.5);
					shake_y = shake_max * (Math.random() - 0.5);
				}

				const moose_y_draw =
					height * 0.5 + height_padding + moose_y * height * 0.5;
				if (moose_y === 0) {
					moose.drawSprite(
						ctx,
						moose_frame,
						moose_x + shake_x,
						moose_y_draw + shake_y,
					);
				} else if (moose_y < last_moose_y + 0.025) {
					moose.drawSprite(ctx, 4, moose_x + shake_x, moose_y_draw + shake_y);
				} else {
					moose.drawSprite(ctx, 5, moose_x + shake_x, moose_y_draw + shake_y);
				}

				frame = requestAnimationFrame(render);
				last_moose_y = moose_y;
				if (frames_since_jump > -1) {
					frames_since_jump += 1;
				}
				//jump_button_prev = jump_button;
			};

			render();
		}
		return () => cancelAnimationFrame(frame);
	}, []);

	return <canvas className="w-full" ref={canvasRef} />;
};

export default WaveAnimation;
