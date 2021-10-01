import React, { useState } from "react";
import PropTypes from "prop-types";
import SingleTangent from "./single-tangent";

const Tangents = ({
    tangents,
    setTangentsPosition,
    negDir,
    posDir,
    boundingRect,
}) => {
    const [bound] = useState(true);

    const setTangent = (tangent, x, y) => {
        setTangentsPosition(tangents, tangent, x, y, bound);
    };

    return (
        <>
            {/* Negative */}
            <SingleTangent
                type="button"
                x={negDir.x}
                y={negDir.y}
                tangent="negDir"
                setTangent={setTangent}
                boundingRect={boundingRect}
                direction={false}
            />
            {/* Positive */}
            <SingleTangent
                type="button"
                x={posDir.x}
                y={posDir.y}
                tangent="posDir"
                setTangent={setTangent}
                boundingRect={boundingRect}
                direction
            />
        </>
    );
};

Tangents.propTypes = {
    tangents: PropTypes.string.isRequired,
    setTangentsPosition: PropTypes.func.isRequired,
    negDir: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
    }).isRequired,
    posDir: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
    }).isRequired,
    boundingRect: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
    }).isRequired,
};

export default Tangents;
