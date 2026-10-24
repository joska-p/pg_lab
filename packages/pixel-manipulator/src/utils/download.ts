export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');

    link.download = filename;
    link.href = url;
    link.click();
}
