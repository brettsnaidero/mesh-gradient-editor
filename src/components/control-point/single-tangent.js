import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { throttle } from "../../utils/debounce";

const tangentDistance = 100;

const SingleTangent = ({
    x,
    y,
    direction,
    setTangent,
    tangent,
    boundingRect,
}) => {
    const toScreenSpace = (value) => {
        return value * tangentDistance * (direction ? -1 : 1);
    };

    const onDrag = (event) => {
        const xPosition =
            event.clientX - boundingRect.x - x * boundingRect.width;
        const yPosition =
            event.clientY - boundingRect.y - y * boundingRect.height;

        const newX = (xPosition / tangentDistance) * (direction ? -1 : 1);
        const newY = (yPosition / tangentDistance) * (direction ? -1 : 1);

        setTangent(tangent, newX, newY);
    };

    const throttledDrag = useCallback(throttle(onDrag, 50), []);

    const xPos = toScreenSpace(x);
    const yPos = toScreenSpace(y);

    return (
        <button
            type="button"
            draggable="true"
            onDrag={throttledDrag}
            className="tangent"
            style={{
                transform: `translate(${xPos}px, ${yPos}px)`,
            }}
        >
            {tangent}
        </button>
    );
};

SingleTangent.propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    direction: PropTypes.bool,
    setTangent: PropTypes.func.isRequired,
    tangent: PropTypes.oneOf(["posDir", "negDir"]).isRequired,
    boundingRect: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
    }).isRequired,
};

SingleTangent.defaultProps = {
    x: 0,
    y: 0,
    direction: false,
};

export default SingleTangent;
