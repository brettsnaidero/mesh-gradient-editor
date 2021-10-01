export const transpose = (matrix) => {
    const w = matrix.length || 0;
    const h = matrix[0] instanceof Array ? matrix[0].length : 0;
    if (h === 0 || w === 0) {
        return [];
    }
    const t = [];

    for (let i = 0; i < h; i += 1) {
        t[i] = [];
        for (let j = 0; j < w; j += 1) {
            t[i][j] = matrix[j][i];
        }
    }
    return t;
};

export const multiply = (a, b) => {
    const aNumRows = a.length;
    const aNumCols = a[0].length;
    // const bNumRows = b.length;
    const bNumCols = b[0].length;

    const m = new Array(aNumRows); // initialize array of rows
    for (let r = 0; r < aNumRows; r += 1) {
        m[r] = new Array(bNumCols); // initialize the current row
        for (let c = 0; c < bNumCols; c += 1) {
            m[r][c] = 0; // initialize the current cell
            for (let i = 0; i < aNumCols; i += 1) {
                m[r][c] += a[r][i] * b[i][c];
            }
        }
    }
    return m;
};

const HM = [
    [2, -2, 1, 1],
    [-3, 3, -2, -1],
    [0, 0, 1, 0],
    [1, 0, 0, 0],
];

const HM_T = transpose(HM);

export const getPatchAttribute = (matrix, i, j, attributeName, tangentName) => {
    if (tangentName) {
        return [
            [
                matrix[i][j][attributeName],
                matrix[i + 1][j][attributeName],
                matrix[i][j][tangentName].negDir.x,
                matrix[i + 1][j][tangentName].posDir.x,
            ],
            [
                matrix[i][j + 1][attributeName],
                matrix[i + 1][j + 1][attributeName],
                matrix[i][j + 1][tangentName].negDir.x,
                matrix[i + 1][j + 1][tangentName].posDir.x,
            ],
            [
                matrix[i][j][tangentName].negDir.y,
                matrix[i + 1][j][tangentName].negDir.y,
                0,
                0,
            ],
            [
                matrix[i][j + 1][tangentName].posDir.y,
                matrix[i + 1][j + 1][tangentName].posDir.y,
                0,
                0,
            ],
        ];
    }

    return [
        [matrix[i][j][attributeName], matrix[i + 1][j][attributeName], 0, 0],
        [
            matrix[i][j + 1][attributeName],
            matrix[i + 1][j + 1][attributeName],
            0,
            0,
        ],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ];
};

export const getPatch = (controlPoints, i, j) => ({
    x: getPatchAttribute(controlPoints, i, j, "x", "uTangents"),
    y: getPatchAttribute(controlPoints, i, j, "y", "vTangents"),
    r: getPatchAttribute(controlPoints, i, j, "r"),
    g: getPatchAttribute(controlPoints, i, j, "g"),
    b: getPatchAttribute(controlPoints, i, j, "b"),
});

export const getPatches = (controlPoints) => {
    const patches = [];
    const columnLength = controlPoints.length - 1;

    for (let i = 0; i < columnLength; i += 1) {
        const rowLength = controlPoints[i].length - 1;

        for (let j = 0; j < rowLength; j += 1) {
            const patch = getPatch(controlPoints, i, j);
            patches.push(patch);
        }
    }

    return patches;
};

export const getPatchPoint = (hermitePatch, u, v) => {
    const Uvec = [[u ** 3], [u ** 2], [u], [1]];
    const Vvec = [[v ** 3], [v ** 2], [v], [1]];
    const vec = multiply(
        multiply(multiply(multiply(transpose(Uvec), HM), hermitePatch), HM_T),
        Vvec
    );
    return vec[0][0];
};

export const setBufferAttributeFromArray = (
    attr,
    attrIndex,
    array,
    vertexIndex
) => {
    // attr is a Three BufferAttribute
    // https://threejs.org/docs/#api/en/core/BufferAttribute.setXYZ
    attr.setXYZ(
        attrIndex,
        array[vertexIndex],
        array[vertexIndex + 1],
        array[vertexIndex + 2]
    );
};

export const fillBufferAttributeByPatches = (
    patches,
    positionAttr,
    colourAttr,
    // Extra bits
    patchDivCount,
    patchVertexCount,
    patchFaceCount
) => {
    const surfaceElements = new Array(patchVertexCount * 3);
    const vertexColors = new Array(patchVertexCount * 3);

    patches.forEach((patch, patchIndex) => {
        for (let i = 0; i <= patchDivCount; i += 1) {
            for (let j = 0; j <= patchDivCount; j += 1) {
                const x = getPatchPoint(
                    patch.x,
                    i / patchDivCount,
                    j / patchDivCount
                );
                const y = getPatchPoint(
                    patch.y,
                    i / patchDivCount,
                    j / patchDivCount
                );
                const r = getPatchPoint(
                    patch.r,
                    i / patchDivCount,
                    j / patchDivCount
                );
                const g = getPatchPoint(
                    patch.g,
                    i / patchDivCount,
                    j / patchDivCount
                );
                const b = getPatchPoint(
                    patch.b,
                    i / patchDivCount,
                    j / patchDivCount
                );
                const z = (r + g + b) / 6;
                const baseIndex = (i * (patchDivCount + 1) + j) * 3;
                //
                surfaceElements[baseIndex] = x;
                surfaceElements[baseIndex + 1] = y;
                surfaceElements[baseIndex + 2] = z;
                vertexColors[baseIndex] = r;
                vertexColors[baseIndex + 1] = g;
                vertexColors[baseIndex + 2] = b;
            }
        }
        for (let i = 0; i < patchDivCount; i += 1) {
            for (let j = 0; j < patchDivCount; j += 1) {
                const baseIndex =
                    (patchIndex * (patchFaceCount / 2) +
                        i * patchDivCount +
                        j) *
                    6;
                /*
        v1----v3
        |   / |
        | /   |
        v2---v4
        */
                const v1Index = (i * (patchDivCount + 1) + j) * 3;
                setBufferAttributeFromArray(
                    positionAttr,
                    baseIndex,
                    surfaceElements,
                    v1Index
                );
                setBufferAttributeFromArray(
                    colourAttr,
                    baseIndex,
                    vertexColors,
                    v1Index
                );

                const v2Index = ((i + 1) * (patchDivCount + 1) + j) * 3;
                setBufferAttributeFromArray(
                    positionAttr,
                    baseIndex + 1,
                    surfaceElements,
                    v2Index
                );
                setBufferAttributeFromArray(
                    colourAttr,
                    baseIndex + 1,
                    vertexColors,
                    v2Index
                );

                setBufferAttributeFromArray(
                    positionAttr,
                    baseIndex + 3,
                    surfaceElements,
                    v2Index
                );
                setBufferAttributeFromArray(
                    colourAttr,
                    baseIndex + 3,
                    vertexColors,
                    v2Index
                );

                const v3Index = (i * (patchDivCount + 1) + (j + 1)) * 3;
                setBufferAttributeFromArray(
                    positionAttr,
                    baseIndex + 2,
                    surfaceElements,
                    v3Index
                );
                setBufferAttributeFromArray(
                    colourAttr,
                    baseIndex + 2,
                    vertexColors,
                    v3Index
                );

                setBufferAttributeFromArray(
                    positionAttr,
                    baseIndex + 4,
                    surfaceElements,
                    v3Index
                );
                setBufferAttributeFromArray(
                    colourAttr,
                    baseIndex + 4,
                    vertexColors,
                    v3Index
                );

                const v4Index = ((i + 1) * (patchDivCount + 1) + (j + 1)) * 3;
                setBufferAttributeFromArray(
                    positionAttr,
                    baseIndex + 5,
                    surfaceElements,
                    v4Index
                );
                setBufferAttributeFromArray(
                    colourAttr,
                    baseIndex + 5,
                    vertexColors,
                    v4Index
                );
            }
        }
    });
};
