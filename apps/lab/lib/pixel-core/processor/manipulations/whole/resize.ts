import { defineManip } from '../../manipulation-factories';
import { PixelData } from '../../pixel-data';

type ResizeOptions =
    | { width: number; height?: never; maximumPixels?: never; fit?: never }
    | { height: number; width?: never; maximumPixels?: never; fit?: never }
    | {
          width: number;
          height: number;
          fit?: 'fill' | 'cover' | 'contain';
          maximumPixels?: never;
      }
    | { maximumPixels: number; width?: never; height?: never; fit?: never };

function bilinearResize({
    source,
    targetWidth,
    targetHeight,
}: {
    source: PixelData;
    targetWidth: number;
    targetHeight: number;
}) {
    const { width: sourceWidth, height: sourceHeight, data: sourceData } = source;

    if (targetWidth === sourceWidth && targetHeight === sourceHeight) {
        return source;
    }

    const destination = new PixelData(targetWidth, targetHeight);
    const { data: destinationData } = destination;
    const xRatio = sourceWidth / targetWidth;
    const yRatio = sourceHeight / targetHeight;

    for (let y = 0; y < targetHeight; y++) {
        for (let x = 0; x < targetWidth; x++) {
            const sourceX = x * xRatio;
            const sourceY = y * yRatio;
            const x0 = Math.floor(sourceX);
            const y0 = Math.floor(sourceY);
            const x1 = Math.min(x0 + 1, sourceWidth - 1);
            const y1 = Math.min(y0 + 1, sourceHeight - 1);
            const xFraction = sourceX - x0;
            const yFraction = sourceY - y0;

            const i00 = (y0 * sourceWidth + x0) * 4;
            const i10 = (y0 * sourceWidth + x1) * 4;
            const i01 = (y1 * sourceWidth + x0) * 4;
            const i11 = (y1 * sourceWidth + x1) * 4;
            const destinationIndex = (y * targetWidth + x) * 4;

            for (let channel = 0; channel < 4; channel++) {
                const p00 = sourceData[i00 + channel] ?? 0;
                const p10 = sourceData[i10 + channel] ?? 0;
                const p01 = sourceData[i01 + channel] ?? 0;
                const p11 = sourceData[i11 + channel] ?? 0;

                const top = p00 * (1 - xFraction) + p10 * xFraction;
                const bottom = p01 * (1 - xFraction) + p11 * xFraction;

                destinationData[destinationIndex + channel] = Math.round(
                    top * (1 - yFraction) + bottom * yFraction,
                );
            }
        }
    }

    return destination;
}

function computeTargetDimensions({
    sourceWidth,
    sourceHeight,
    options,
}: {
    sourceWidth: number;
    sourceHeight: number;
    options: ResizeOptions;
}) {
    let targetWidth: number;
    let targetHeight: number;

    if ('maximumPixels' in options && options.maximumPixels) {
        const totalPixels = sourceWidth * sourceHeight;

        if (totalPixels <= options.maximumPixels) {
            return null;
        }

        const scale = Math.sqrt(options.maximumPixels / totalPixels);

        targetWidth = Math.max(1, Math.round(sourceWidth * scale));
        targetHeight = Math.max(1, Math.round(sourceHeight * scale));
    } else if ('width' in options && options.width && 'height' in options && options.height) {
        const fit = options.fit ?? 'fill';

        if (fit === 'fill') {
            targetWidth = options.width;
            targetHeight = options.height;
        } else {
            const scale =
                fit === 'contain'
                    ? Math.min(options.width / sourceWidth, options.height / sourceHeight)
                    : Math.max(options.width / sourceWidth, options.height / sourceHeight);

            targetWidth = Math.round(sourceWidth * scale);
            targetHeight = Math.round(sourceHeight * scale);
        }
    } else if ('width' in options && options.width) {
        targetWidth = options.width;
        targetHeight = Math.max(1, Math.round(sourceHeight * (options.width / sourceWidth)));
    } else if ('height' in options && options.height) {
        targetHeight = options.height;
        targetWidth = Math.max(1, Math.round(sourceWidth * (options.height / sourceHeight)));
    } else {
        return null;
    }

    return targetWidth === sourceWidth && targetHeight === sourceHeight
        ? null
        : { width: targetWidth, height: targetHeight };
}

export const resize = defineManip<ResizeOptions>({
    access: 'global',
    id: 'resize',
    execute: ({ imageData, options }) => {
        const dimensions = computeTargetDimensions({
            sourceWidth: imageData.width,
            sourceHeight: imageData.height,
            options,
        });

        if (!dimensions) {
            return imageData;
        }

        return bilinearResize({
            source: imageData,
            targetWidth: dimensions.width,
            targetHeight: dimensions.height,
        });
    },
    ui: {
        name: 'Resize',
        description: 'Resizes the image to the specified dimensions.',
        longDescription:
            'Resizes the image using bilinear interpolation. Supports absolute width/height, proportional scaling by specifying only one dimension, and fit modes (fill, cover, contain). Can also limit total pixel count via maximumPixels.',
        defaultArgs: {},
        argDefinitions: [
            { key: 'width', label: 'Width', min: 1, max: 4096, step: 1 },
            { key: 'height', label: 'Height', min: 1, max: 4096, step: 1 },
        ],
    },
});
