/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useState } from "react";
import PropTypes from "prop-types";
import { RgbColorPicker } from "react-colorful";
import ControlPoint from "./control-point/control-point";

const Editor = ({ boundingRect, setControlPoints, controlPointsMatrix }) => {
    const [selectedPoint, setSelectedPoint] = useState();

    const setControlPoint = (id, updatedValues) => {
        setControlPoints((prevControlPointsMatrix) =>
            prevControlPointsMatrix.map((controlPointsColumn) =>
                controlPointsColumn.map((controlPoint) => {
                    if (controlPoint.id !== id) {
                        return controlPoint;
                    }

                    return {
                        ...controlPoint,
                        ...updatedValues,
                    };
                })
            )
        );
    };

    const setColour = ({ r, g, b }) => {
        setControlPoint(selectedPoint, {
            r: r / 255,
            g: g / 255,
            b: b / 255,
        });
    };

    const selectedPointInfo = controlPointsMatrix.find((controlPointsColumn) =>
        controlPointsColumn.find(
            (controlPoint) => controlPoint.id === selectedPoint
        )
    );

    return (
        <>
            {selectedPoint && (
                <div className="sidebar">
                    {selectedPoint}
                    {/* Colour picker */}
                    <RgbColorPicker
                        r={selectedPointInfo.r}
                        g={selectedPointInfo.g}
                        b={selectedPointInfo.b}
                        onChange={setColour}
                    />
                </div>
            )}
            <div className="control-points">
                {controlPointsMatrix.map((controlPointsColumn) =>
                    controlPointsColumn.map((controlPoint) => (
                        <ControlPoint
                            key={controlPoint.id}
                            {...controlPoint}
                            setControlPoint={setControlPoint}
                            setSelectedPoint={setSelectedPoint}
                            selected={controlPoint.id === selectedPoint}
                            boundingRect={boundingRect}
                            controlPointsMatrix={controlPointsMatrix}
                        />
                    ))
                )}
            </div>
        </>
    );
};

Editor.propTypes = {
    boundingRect: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
    }).isRequired,
    setControlPoints: PropTypes.func.isRequired,
    controlPointsMatrix: PropTypes.arrayOf(
        PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string,
                r: PropTypes.number,
                b: PropTypes.number,
                g: PropTypes.number,
                uTangents: PropTypes.shape({
                    negDir: PropTypes.shape({
                        x: PropTypes.number,
                        y: PropTypes.number,
                    }),
                    posDir: PropTypes.shape({
                        x: PropTypes.number,
                        y: PropTypes.number,
                    }),
                }),
                vTangents: PropTypes.shape({
                    negDir: PropTypes.shape({
                        x: PropTypes.number,
                        y: PropTypes.number,
                    }),
                    posDir: PropTypes.shape({
                        x: PropTypes.number,
                        y: PropTypes.number,
                    }),
                }),
                x: PropTypes.number,
                xTangentLength: PropTypes.number,
                y: PropTypes.number,
                yTangentLength: PropTypes.number,
            })
        )
    ).isRequired,
};

export default Editor;
