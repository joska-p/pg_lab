interface RenderCompareSliderArgs {
    ctx: CanvasRenderingContext2D;
    srcCanvas: HTMLCanvasElement;
    resCanvas: HTMLCanvasElement;
    sliderPos: number;
    width: number;
    height: number;
}

export function renderCompareSlider({
    ctx,
    srcCanvas,
    resCanvas,
    sliderPos,
    width,
    height,
}: RenderCompareSliderArgs) {
    const sliderX = (sliderPos / 100) * width;

    ctx.canvas.width = width;
    ctx.canvas.height = height;

    ctx.drawImage(resCanvas, 0, 0);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, sliderX, height);
    ctx.clip();
    ctx.drawImage(srcCanvas, 0, 0);
    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(sliderX, 0);
    ctx.lineTo(sliderX, height);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(sliderX, height / 2, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#1d2021';
    ctx.lineWidth = 2;
    ctx.stroke();
}
