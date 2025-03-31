class JumpingMoose {
	frameWidth = 48;
	frameHeight = 48;

	sprite: HTMLImageElement = new Image();
	num_frames = 4;

	constructor(sprite_url: string) {
		this.sprite.src = sprite_url;
	}

	drawSprite(
		ctx: CanvasRenderingContext2D,
		frameIndex: number,
		x: number,
		y: number,
	): void {
		//ctx.save();
		//ctx.beginPath();

		ctx.drawImage(
			this.sprite,
			frameIndex * this.frameWidth,
			0, // Start of slice
			this.frameWidth,
			this.frameHeight, // Size of slice (source)
			x - this.frameWidth * 0.5,
			y - this.frameHeight, // Destination position
			this.frameWidth,
			this.frameHeight,
		); // Size of source (destination)
		//ctx.restore();
	}
}

export default JumpingMoose;
