import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import Editor from "./components/editor";
import { getPatches, fillBufferAttributeByPatches } from "./utils/gradient";
import { getInitialControlPoints } from "./utils/other";
import debounce from "./utils/debounce";

const initialDivisionCount = 3;

const App = () => {
    const gradientMesh = useRef();
    const scene = useRef();
    const renderer = useRef();
    const camera = useRef();
    const camera2 = useRef();

    const [divisionCount, setDivisionCount] = useState(initialDivisionCount);
    const [controlPointsMatrix, setControlPoints] = useState(() => {
        const initialPoints = getInitialControlPoints(initialDivisionCount);
        return initialPoints;
    });
    const [boundingRect, setBoundingRect] = useState();

    const patchDivCount = 20;
    const patchVertexCount = (patchDivCount + 1) * (patchDivCount + 1);
    const patchFaceCount = patchDivCount * patchDivCount * 2;

    // Set up scene
    const canvasRef = useCallback((canvas) => {
        scene.current = new THREE.Scene();
        camera.current = new THREE.OrthographicCamera(0, 1, 0, 1, 1, 1000);
        camera2.current = new THREE.PerspectiveCamera(50, 1, 1, 1000);

        camera2.current.position.z = 3;
        camera2.current.position.x = 0.5;
        camera2.current.position.y = 0.5;
        camera2.current.lookAt(0.5, 0.5, 0);
        scene.current.add(camera2.current);

        renderer.current = new THREE.WebGLRenderer({
            canvas,
        });

        renderer.current.setSize(canvas.clientWidth, canvas.clientHeight);

        const ambientLight = new THREE.AmbientLight(0xffffff);
        scene.current.add(ambientLight);

        camera.current.position.z = 10;

        // Set up gradient
        const allPatches = getPatches(controlPointsMatrix);

        const gradientMeshGeometry = new THREE.BufferGeometry();

        const vertexCount = allPatches.length * patchFaceCount * 3;

        const vertexArray = new Array(vertexCount * 3);
        const colorArray = new Array(vertexCount * 3);

        const vertices = new Float32Array(vertexArray);
        const colors = new Float32Array(colorArray);

        const positionBufferAttribute = new THREE.BufferAttribute(
            new Float32Array(vertices),
            3
        );
        const colourBufferAttribute = new THREE.BufferAttribute(
            new Float32Array(colors),
            3
        );

        // Initialise Hermite Surface
        fillBufferAttributeByPatches(
            allPatches,
            positionBufferAttribute,
            colourBufferAttribute,
            // Extra bits
            patchDivCount,
            patchVertexCount,
            patchFaceCount
        );

        positionBufferAttribute.setUsage(THREE.DynamicDrawUsage); // setDynamic
        gradientMeshGeometry.setAttribute("position", positionBufferAttribute);

        colourBufferAttribute.setUsage(THREE.DynamicDrawUsage); // setDynamic
        gradientMeshGeometry.setAttribute("color", colourBufferAttribute);

        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            vertexColors: THREE.VertexColors,
            side: THREE.DoubleSide,
        });

        gradientMesh.current = new THREE.Mesh(gradientMeshGeometry, material);

        THREE.StaticNoiseShader = {
            uniforms: {
                tDiffuse: { type: "t", value: null },
                time: { type: "f", value: 0.0 },
                amount: { type: "f", value: 0.5 },
                size: { type: "f", value: 4.0 },
            },

            vertexShader: [
                "varying vec2 vUv;",

                "void main() {",

                "vUv = uv;",
                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

                "}",
            ].join("\n"),

            fragmentShader: [
                "uniform sampler2D tDiffuse;",
                "uniform float time;",
                "uniform float amount;",
                "uniform float size;",

                "varying vec2 vUv;",

                "float rand(vec2 co) {",
                "return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",
                "}",

                "void main() {",
                "vec2 p = vUv;",
                "vec4 color = texture2D(tDiffuse, p);",
                "float xs = floor(gl_FragCoord.x / size);",
                "float ys = floor(gl_FragCoord.y / size);",
                "vec4 snow = vec4(rand(vec2(xs * time,ys * time))*amount);",
                "gl_FragColor = color + snow;", // additive
                "}",
            ].join("\n"),
        };

        scene.current.add(gradientMesh.current);

        // Show
        renderer.current.render(scene.current, camera.current);

        // Bounding
        const setBounding = () => {
            const newBoundingRect = canvas.getBoundingClientRect();
            setBoundingRect(newBoundingRect);
        };

        setBounding();

        window.addEventListener("resize", debounce(setBounding, 500));

        return () => {
            window.removeEventListener("resize", debounce(setBounding, 500));
        };
    }, []);

    // Update render when points change
    useEffect(() => {
        if (controlPointsMatrix) {
            // Calculate hermite surface
            const allPatches = getPatches(controlPointsMatrix);

            fillBufferAttributeByPatches(
                allPatches,
                gradientMesh.current.geometry.attributes.position,
                gradientMesh.current.geometry.attributes.color,
                // Extra bits
                patchDivCount,
                patchVertexCount,
                patchFaceCount
            );
            gradientMesh.current.geometry.attributes.position.needsUpdate = true;
            gradientMesh.current.geometry.attributes.color.needsUpdate = true;

            renderer.current.render(scene.current, camera.current);
        }
    }, [controlPointsMatrix]);

    return (
        <main className="page">
            <div className="editor" style={{ width: "500px", height: "500px" }}>
                <canvas ref={canvasRef} width={500} height={500} />
                {controlPointsMatrix && boundingRect && (
                    <Editor
                        boundingRect={boundingRect}
                        divisionCount={divisionCount}
                        setDivisionCount={setDivisionCount}
                        controlPointsMatrix={controlPointsMatrix}
                        setControlPoints={setControlPoints}
                    />
                )}
            </div>
        </main>
    );
};

export default App;
