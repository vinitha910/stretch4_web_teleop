import React, {
    ReactNode,
    memo,
    useCallback,
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import "operator/css/DirectionalPad.css";
import RotateMagicPadArrowOverlay from "./RotateMagicPadArrowOverlay";
import { buttonFunctionProvider } from "operator/tsx/index";
import { ButtonPadButton } from "../function_providers/ButtonFunctionProvider";

interface DirectionalPadProps {
    mapButtons: (direction: string, index: number) => ReactNode;
    isBaseDrive: boolean;
    isCameraVeilVisible: boolean;
}

const DIRECTIONS = [
    "north",
    "south",
    "west",
    "east",
    "rotate-left",
    "rotate-right",
] as const;

const DirectionalPad: React.FC<DirectionalPadProps> = ({
    mapButtons,
    isBaseDrive,
    isCameraVeilVisible,
}) => {
    // only re‐map when mapButtons fn changes
    const buttons = useMemo(() => DIRECTIONS.map(mapButtons), [mapButtons]);

    // slice out once, only when `buttons` changes
    const cardinal = useMemo(() => buttons.slice(0, 4), [buttons]);
    const rotate = useMemo(() => buttons.slice(4), [buttons]);

    // Reference to the rotate magic pad
    const refRotateMagicPad = useRef<HTMLDivElement>(null);
    const [arrowRad, arrowRadSet] = useState<number | null>(null);
    const arrowMarkerId = useId().replace(/:/g, "");

    // Keep ButtonFunctionProvider's arrow-animation callback in sync with our
    // arrowRad state setter for the lifetime of this component.
    useEffect(() => {
        buttonFunctionProvider.setArrowRadCallback(arrowRadSet);
        return () => {
            buttonFunctionProvider.setArrowRadCallback(undefined);
        };
    }, [arrowRadSet]);

    // Computes radians based on click
    // inside the RotateMagicPad. Range: -π to π. Example:
    //  - 12 o' clock → 0 rad
    //  - 3 o' clock → π/2 rad
    //  - 6 o' clock → ±π rad
    //  - 9 o' clock → -π/2 rad
    const handleRotateMagicPadPointerDown = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            const el = refRotateMagicPad.current;
            if (!el) return;
            const r = el.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const radius = r.width / 2;
            const dx = e.clientX - cx;
            const dy = e.clientY - cy;
            if (dx * dx + dy * dy > radius * radius) return;
            const rad = Math.atan2(dx, -dy); // range: (-π, π]
            console.log(
                `RotateMagicPad click: ${rad.toFixed(4)} rad`,
            );
            arrowRadSet(rad);

            const functs = buttonFunctionProvider.provideFunctions(
                ButtonPadButton.BaseRotate,
                rad,
            );
            functs.onClick();
        },
        [],
    );

    // const arrowLineEnd = useMemo(() => {
    //     if (arrowRad === null) return null;
    //     // When this is in handleRotateMagicPadPointerDown the arrow doesn't
    //     // display -- not sure why

    //     // Normalize to [0, 2π) for display purposes.
    //     const displayRad = arrowRad < 0 ? arrowRad + 2 * Math.PI : arrowRad;
    //     // Slightly inset from the viewBox edge so the arrowhead stays inside the circle.
    //     const r = 48;
    //     return {
    //         x: 50 + r * Math.sin(displayRad),
    //         y: 50 - r * Math.cos(displayRad),
    //     };
    // }, [arrowRad]);


    useLayoutEffect(() => {
        if (!isBaseDrive || !refRotateMagicPad.current) return;
        const el = refRotateMagicPad.current;
        const logCenter = () => {
            const r = el.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            console.log("RotateMagicPad absolute center coords: ", { x: cx, y: cy });
        };
        logCenter();
        const ro = new ResizeObserver(logCenter);
        ro.observe(el);
        window.addEventListener("resize", logCenter);
        return () => {
            ro.disconnect();
            window.removeEventListener("resize", logCenter);
        };
    }, [isBaseDrive, isCameraVeilVisible]);
    
    if (isCameraVeilVisible) return null;
    else
        return (
            <div
                className={`base-movement-controls ${isCameraVeilVisible ? "display-none" : "display-block"}`}
            >
                <svg className="mask">
                    <clipPath id="clip-path" clipPathUnits="objectBoundingBox">
                        <path d="M1,1 H0 V0.5 C0.276,0.5,0.5,0.276,0.5,0 H1 V1" />
                    </clipPath>
                </svg>

                <div className="dbutton-pad">
                    {cardinal.map((btn, i) => (
                        <React.Fragment key={i}>{btn}</React.Fragment>
                    ))}
                </div>
                {isBaseDrive
                    ? (
                        <div
                            ref={refRotateMagicPad}
                            className={`rotate-magic-pad${arrowRad !== null ? " has-arrow" : ""}`}
                            onPointerDown={handleRotateMagicPadPointerDown}
                        >
                            {arrowRad !== null && (
                                <RotateMagicPadArrowOverlay
                                    rad={arrowRad}
                                    markerId={arrowMarkerId}
                                />
                            )}
                        </div>
                    )
                    : (
                        <div className="rbutton-pad">
                            {rotate.map((btn, i) => (
                                <React.Fragment key={i}>{btn}</React.Fragment>
                            ))}
                            <div className="line" />
                        </div>
                    )
                }
            </div >
        );
};

export default memo(DirectionalPad);
