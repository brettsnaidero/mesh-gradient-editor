import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import Tangents from "./tangents";
import { throttle } from "../../utils/debounce";

const ControlPoint = ({
    id,
    x,
    y,
    uTangents,
    vTangents,
    r,
    g,
    b,
    a,
    xTangentLength,
    yTangentLength,
    setControlPoint,
    setSelectedPoint,
    selected,
    boundingRect,
}) => {
    const [startPosition, setStartPosition] = useState({
        x,
        y,
    });

    const selectPoint = () => {
        setSelectedPoint(id);
    };

    const onDragStart = () => {
        setStartPosition({ x, y });
    };

    const onDragEnd = () => {
        setStartPosition({ x: null, y: null });

        if (selected) {
            setSelectedPoint(null);
        }
    };

    const onDrag = (event) => {
        if (!event.clientX && !event.clientY) {
            return;
        }

        let xPosition = (event.clientX - boundingRect.x) / boundingRect.width;
        let yPosition = (event.clientY - boundingRect.y) / boundingRect.height;

        const deltaX = Math.abs(startPosition.x - xPosition);
        const deltaY = Math.abs(startPosition.y - yPosition);

        if (event.shiftKey) {
            xPosition = deltaX > deltaY ? xPosition : startPosition.x;
            yPosition = deltaX > deltaY ? startPosition.y : yPosition;
        }

        if (deltaX + deltaY > 0.03 || event.ctrlKey) {
            setControlPoint(id, { x: xPosition, y: yPosition });
        } else {
            setControlPoint(id, { x: startPosition.x, y: startPosition.y });
        }
    };

    const throttledDrag = useCallback(throttle(onDrag, 50), []);

    const setTangentsPosition = (
        tangents,
        tangent,
        tangentX,
        tangentY,
        bound
    ) => {
        const tangentsSet = tangents === "uTangents" ? uTangents : vTangents;
        const antiTangentName = tangent === "negDir" ? "posDir" : "negDir";

        setControlPoint(id, {
            [tangents]: {
                [antiTangentName]: bound
                    ? {
                        x: tangentX,
                        y: tangentY,
                    }
                    : {
                        ...tangentsSet[antiTangentName],
                    },
                [tangent]: {
                    x: tangentX,
                    y: tangentY,
                },
            },
        });
    };

    return (
        <div
            className="control-point"
            style={{
                top: `${100 * y}%`,
                left: `${100 * x}%`,
            }}
            id={id}
        >
            <button
                className="control-point__button"
                onClick={selectPoint}
                onDrag={throttledDrag}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                draggable="true"
                type="button"
                style={{
                    backgroundColor: `rgba(${r * 255},${g * 255},${b *
                        255},${a})`,
                }}
            >
                .
            </button>
            {/* Tangents */}
            <Tangents
                id={id}
                tangents="uTangents"
                setTangentsPosition={setTangentsPosition}
                x={xTangentLength}
                y={0}
                negDir={uTangents.negDir}
                posDir={uTangents.posDir}
                boundingRect={boundingRect}
            />
            <Tangents
                id={id}
                tangents="vTangents"
                setTangentsPosition={setTangentsPosition}
                x={0}
                y={yTangentLength}
                negDir={vTangents.negDir}
                posDir={vTangents.posDir}
                boundingRect={boundingRect}
            />
        </div>
    );
};

export const tangentsPropTypes = PropTypes.shape({
    negDir: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
    }),
    posDir: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
    }),
});

ControlPoint.propTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    uTangents: tangentsPropTypes.isRequired,
    vTangents: tangentsPropTypes.isRequired,
    r: PropTypes.number.isRequired,
    g: PropTypes.number.isRequired,
    b: PropTypes.number.isRequired,
    a: PropTypes.number,
    id: PropTypes.string.isRequired,
    xTangentLength: PropTypes.number,
    yTangentLength: PropTypes.number,
    selected: PropTypes.bool,
    boundingRect: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
    }).isRequired,
    setSelectedPoint: PropTypes.func.isRequired,
    setControlPoint: PropTypes.func.isRequired,
};

ControlPoint.defaultProps = {
    a: 1,
    xTangentLength: 0,
    yTangentLength: 0,
    selected: false,
};

export default ControlPoint;
