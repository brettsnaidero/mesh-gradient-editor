let cpIdCounter = 0;

export const newControlPoint = (i, j, divisionCount) => ({
    x: i / divisionCount,
    y: j / divisionCount,
    r: i / divisionCount,
    g: j / divisionCount,
    b: j / divisionCount,
    id: `control-point-${(cpIdCounter += 1)}`,
    xTangentLength: 1 / divisionCount,
    yTangentLength: 1 / divisionCount,
    uTangents: {
        negDir: {
            x: 1 / divisionCount,
            y: 0,
        },
        posDir: {
            x: 1 / divisionCount,
            y: 0,
        },
    },
    vTangents: {
        negDir: {
            x: 0,
            y: 1 / divisionCount,
        },
        posDir: {
            x: 0,
            y: 1 / divisionCount,
        },
    },
});

export const getInitialControlPoints = (divisionCount) => {
    // Initial control points
    const initialControlPointsMatrix = new Array(divisionCount + 1);
    for (let i = 0; i <= divisionCount; i += 1) {
        initialControlPointsMatrix[i] = [];

        for (let j = 0; j <= divisionCount; j += 1) {
            const cp = newControlPoint(i, j, divisionCount);
            initialControlPointsMatrix[i].push(cp);
        }
    }
    return initialControlPointsMatrix;
};
