import React, { memo } from "react";
import rotateMagicPadArrowSprite from "operator/icons/RotateMagicPadArrow.svg";

export interface RotateMagicPadArrowOverlayProps {
    rad: number;
    /** Stable unique prefix for SVG defs (e.g. from React useId). */
    markerId: string;
}

const RotateMagicPadArrowOverlay: React.FC<RotateMagicPadArrowOverlayProps> = ({
    rad,
    markerId,
}) => {
    // Normalize to [0, 2π) for display purposes.
    const displayRad = rad < 0 ? rad + 2 * Math.PI : rad;
    // Slightly inset from the viewBox edge so the arrowhead stays inside the circle.
    const displayRadius = 48;
    const lineEnd = {
        x: 50 + displayRadius * Math.sin(displayRad),
        y: 50 - displayRadius * Math.cos(displayRad),
    };
    // console.log(lineEnd)
    return (
    <svg
        className="rotate-magic-pad-arrow"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
    >
        <defs>
            <marker
                id={`${markerId}-head`}
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
                markerUnits="userSpaceOnUse"
            >
                <use
                    href={`${rotateMagicPadArrowSprite}#RotateMagicPadArrowHeadPolygon`}
                    width="8"
                    height="8"
                />
            </marker>
        </defs>
        <line
            x1="50"
            y1="50"
            x2={lineEnd.x}
            y2={lineEnd.y}
            className="rotate-magic-pad-arrow-line"
            markerEnd={`url(#${markerId}-head)`}
        />
    </svg>
    );
};

export default memo(RotateMagicPadArrowOverlay);