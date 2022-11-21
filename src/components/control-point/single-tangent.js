import React, { useRef } from "react";
import PropTypes from "prop-types";
import { throttle } from "../../utils/debounce";

const SingleTangent = ({
    x,
    y,
    direction,
    setTangent,
    tangent,
    boundingRect,
    tangentDistance,
}) => {
    const toScreenSpace = (value) => {
        return value * tangentDistance * (direction ? -1 : 1);
    };
    
    const xPos = toScreenSpace(x);
    const yPos = toScreenSpace(y);

    const onDrag = (event) => {
        const xPosition = (event.clientX - boundingRect.x) / boundingRect.width;
        const yPosition = (event.clientY - boundingRect.y) / boundingRect.height;
        
        console.log(
            'Position of cursor (out of 1)',
            x,
            xPosition,
            'Y Position',
            y,
            yPosition
        );

        // Determine how far the mouse has moved up/down
        const deltaX = Math.abs(x - xPosition);
        const deltaY = Math.abs(y - yPosition);

        console.log(deltaX, deltaY);

        const newX = deltaX / tangentDistance;
        const newY = deltaY / tangentDistance;

        setTangent(tangent, newX, newY);
    };

    const throttledDrag = useRef(throttle(onDrag, 1000)).current;

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
    tangentDistance: PropTypes.number.isRequired,
};

SingleTangent.defaultProps = {
    x: 0,
    y: 0,
    direction: false,
};

export default SingleTangent;
