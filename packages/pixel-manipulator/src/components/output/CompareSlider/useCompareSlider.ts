import { useEffect, useRef, useState } from 'react';

import { renderCompareSlider } from './compareSliderRenderer';

interface UseCompareSliderArgs {
    source: ImageData;
    result: ImageData;
}

const sliderPositionFromClientX = (container: HTMLElement, clientX: number): number => {
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;

    return Math.max(0, Math.min(100, (x / rect.width) * 100));
};

export function useCompareSlider({ source, result }: UseCompareSliderArgs) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [sliderPos, setSliderPos] = useState(50);
    const isDragging = useRef(false);

    const offscreenRef = useRef<
        | {
              source: HTMLCanvasElement;
              result: HTMLCanvasElement;
          }
        | undefined
    >(undefined);
    const prevSourceRef = useRef<ImageData | undefined>(undefined);
    const prevResultRef = useRef<ImageData | undefined>(undefined);

    const width = source.width;
    const height = source.height;

    useEffect(() => {
        const needsRebuild =
            !offscreenRef.current ||
            prevSourceRef.current !== source ||
            prevResultRef.current !== result;

        if (needsRebuild) {
            const s = document.createElement('canvas');
            const sContext = s.getContext('2d');

            if (!sContext) {
                return;
            }

            s.width = source.width;
            s.height = source.height;
            sContext.putImageData(source, 0, 0);

            const r = document.createElement('canvas');
            const rContext = r.getContext('2d');

            if (!rContext) {
                return;
            }

            r.width = result.width;
            r.height = result.height;
            rContext.putImageData(result, 0, 0);

            offscreenRef.current = { source: s, result: r };
            prevSourceRef.current = source;
            prevResultRef.current = result;
        }

        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return;
        }

        if (!offscreenRef.current) {
            return;
        }

        const { source: srcCanvas, result: resCanvas } = offscreenRef.current;

        renderCompareSlider({
            ctx,
            srcCanvas,
            resCanvas,
            sliderPos,
            width,
            height,
        });
    }, [source, result, sliderPos, width, height]);

    const applySliderPosition = (clientX: number) => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        setSliderPos(sliderPositionFromClientX(container, clientX));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        isDragging.current = true;
        applySliderPosition(e.clientX);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        isDragging.current = true;
        applySliderPosition(e.touches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging.current) {
            return;
        }

        applySliderPosition(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
        isDragging.current = false;
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current) {
                return;
            }

            const container = containerRef.current;

            if (!container) {
                return;
            }

            setSliderPos(sliderPositionFromClientX(container, e.clientX));
        };
        const handleMouseUp = () => {
            isDragging.current = false;
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    return {
        containerRef,
        canvasRef,
        width,
        height,
        handleMouseDown,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
    };
}
