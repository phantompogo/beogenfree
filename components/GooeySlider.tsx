import React, { useRef, useLayoutEffect, FC } from 'react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';

gsap.registerPlugin(Draggable);

interface GooeySliderProps {
    min?: number;
    max?: number;
    value: number;
    onChange: (value: number) => void;
    style?: React.CSSProperties;
}

const uniqueId = `gooey-filter-${Math.random().toString(36).substr(2, 9)}`;

export const GooeySlider: FC<GooeySliderProps> = ({ min = 0, max = 360, value, onChange, style }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const draggableRef = useRef<Draggable | null>(null);
    const timelineRef = useRef<gsap.core.Timeline | null>(null);
    const dragBarWidthRef = useRef<number>(300); // Default value, will be updated

    useLayoutEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;

        const dragger = svg.querySelector<SVGCircleElement>('#dragger');
        const display = svg.querySelector<SVGCircleElement>('#display');
        const downText = svg.querySelector<SVGTextElement>('.downText');
        const upText = svg.querySelector<SVGTextElement>('.upText');
        const dragBar = svg.querySelector<SVGPathElement>('#dragBar');


        if (!dragger || !display || !downText || !upText || !dragBar) return;
        
        // Use SVG's coordinate system for width, which is more reliable than getBoundingClientRect
        const svgPoint1 = svg.createSVGPoint();
        const svgPoint2 = svg.createSVGPoint();
        svgPoint1.x = dragBar.getBBox().x;
        svgPoint2.x = dragBar.getBBox().x + dragBar.getBBox().width;
        dragBarWidthRef.current = svgPoint2.x - svgPoint1.x;
        const maxDrag = dragBarWidthRef.current;


        gsap.set(svg, { visibility: 'visible' });
        gsap.set(upText, { alpha: 0, transformOrigin: '50% 50%' });

        const tl = gsap.timeline({ paused: true });
        tl.addLabel("blobUp")
          .to(display, { duration: 1, attr: { cy: '-=40', r: 30 }, ease: "elastic.out(0.4, 0.1)" })
          .to(dragger, { duration: 1, attr: { r: 8 } }, '-=1')
          .set(dragger, { strokeWidth: 4 }, '-=1')
          .to(downText, { duration: 1, alpha: 0, transformOrigin: '50% 50%' }, '-=1')
          .to(upText, { duration: 1, alpha: 1, transformOrigin: '50% 50%' }, '-=1')
          .addPause()
          .addLabel("blobDown")
          .to(display, { duration: 1, attr: { cy: 299.5, r: 16 }, ease: "expo.out" })
          .to(dragger, { duration: 1, attr: { r: 15 } }, '-=1')
          .set(dragger, { strokeWidth: 0 }, '-=1')
          .to(downText, { duration: 1, alpha: 1, ease: "power4.out" }, '-=1')
          .to(upText, { duration: 0.2, alpha: 0, attr: { y: '+=45' }, ease: "power4.out" }, '-=1');
        
        timelineRef.current = tl;

        function dragUpdate(this: Draggable) {
            const dragVal = Math.round(((this.x / maxDrag) * (max - min)) + min);
            const clampedVal = Math.max(min, Math.min(max, dragVal));
            
            if (downText) downText.textContent = String(clampedVal);
            if (upText) upText.textContent = String(clampedVal);
            onChange(clampedVal);

            gsap.to(display, {
                duration: 1.3,
                x: this.x,
                ease: "elastic.out(1, 0.4)"
            });

            gsap.to([upText, downText], {
                duration: 1,
                attr: { x: this.x + 146 },
                ease: "elastic.out(1, 0.4)",
            });
        }
        
        const [draggableInstance] = Draggable.create(dragger, {
            type: 'x',
            cursor: 'pointer',
            throwProps: true,
            bounds: { minX: 0, maxX: maxDrag },
            onPress: () => tl.play('blobUp'),
            onRelease: () => tl.play('blobDown'),
            onDrag: dragUpdate,
            onThrowUpdate: dragUpdate
        });
        
        draggableRef.current = draggableInstance;

        return () => {
            draggableInstance.kill();
            tl.kill();
        };

    }, [min, max, onChange]);

    useLayoutEffect(() => {
        const maxDrag = dragBarWidthRef.current;
        const xPos = ((value - min) / (max - min)) * maxDrag;
        const clampedX = Math.max(0, Math.min(maxDrag, xPos));

        const dragger = svgRef.current?.querySelector('#dragger');
        const display = svgRef.current?.querySelector('#display');
        const downText = svgRef.current?.querySelector('.downText');
        const upText = svgRef.current?.querySelector('.upText');

        if (dragger && display && downText && upText) {
             gsap.set(dragger, { x: clampedX });
             gsap.set(display, { x: clampedX });
             gsap.set([upText, downText], { attr: { x: clampedX + 146 } });
             downText.textContent = String(value);
             upText.textContent = String(value);

             if (draggableRef.current) {
                 draggableRef.current.update();
             }
        }
    }, [value, min, max]);

    return (
        <div className="gooey-slider-container" style={style}>
            <svg ref={svgRef} version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="130 190 340 160">
                <defs>
                    <filter id={uniqueId} colorInterpolationFilters="sRGB">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 21 -7" result="cm" />
                    </filter>
                </defs>
                <g id="dragGroup">
                    <path id="dragBar" fill="currentColor" d="M447,299.5c0,1.4-1.1,2.5-2.5,2.5h-296c-1.4,0-2.5-1.1-2.5-2.5l0,0c0-1.4,1.1-2.5,2.5-2.5 h296C445.9,297,447,298.1,447,299.5L447,299.5z" />
                    <g id="displayGroup">
                        <g id="gooGroup" filter={`url(#${uniqueId})`}>
                            <circle id="display" fill="currentColor" cx="146" cy="299.5" r="16" />
                            <circle id="dragger" fill="currentColor" stroke="var(--slider-stroke-color, #03A9F4)" strokeWidth="0" cx="146" cy="299.5" r="15" />
                        </g>
                        <text className="downText" x="146" y="304">0</text>
                        <text className="upText" x="145" y="266">0</text>
                    </g>
                </g>
            </svg>
        </div>
    );
};