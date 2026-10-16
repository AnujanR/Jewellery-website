"use client";
import {
    BandId,
    CLUSTER_COLUMNS,
    CustomDesign,
    SettingId,
    ShapeId,
    clusterColumnAngle,
    coverageOptions,
    isClusterStoneColumn,
    metalOptions,
    stoneOptions,
} from "@/data/jewellery-custom-data";
import { ContactShadows, Environment, Lightformer, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ReactNode, RefObject, Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import styles from "./jewellery-custom.module.scss";

/** Scene units: 1 = 8.5mm, roughly the inner radius of a letter size L ring. */
const MM = 1 / 8.5;
const BACKGROUND = "#f3f0ec";

interface ShapeSpec {
    profile: [number, number][];
    segments: number;
    phiStart: number;
    scale: [number, number];
    prongs: { angle: number; radius: number }[];
}

const brilliant: [number, number][] = [[0, -0.86], [1, -0.03], [1, 0.03], [0.56, 0.33], [0, 0.33]];
const sixProngs = Array.from({ length: 6 }, (_, i) => ({ angle: Math.PI / 6 + (i * Math.PI) / 3, radius: 1 }));
const cornerProngs = (radius: number) =>
    Array.from({ length: 4 }, (_, i) => ({ angle: Math.PI / 4 + (i * Math.PI) / 2, radius }));

const SHAPES: Record<ShapeId, ShapeSpec> = {
    round: { profile: brilliant, segments: 16, phiStart: 0, scale: [1, 1], prongs: sixProngs },
    oval: { profile: brilliant, segments: 16, phiStart: 0, scale: [0.85, 1.25], prongs: sixProngs },
    princess: {
        profile: [[0, -0.72], [1, -0.03], [1, 0.03], [0.78, 0.2], [0, 0.2]],
        segments: 4,
        phiStart: Math.PI / 4,
        scale: [0.78, 0.78],
        prongs: cornerProngs(1),
    },
    "emerald-cut": {
        profile: [[0, -0.55], [0.55, -0.42], [1, -0.03], [1, 0.03], [0.85, 0.13], [0.72, 0.2], [0, 0.2]],
        segments: 8,
        phiStart: Math.PI / 8,
        scale: [0.82, 1.15],
        prongs: cornerProngs(0.93),
    },
};

const gemGeometries = new Map<ShapeId, THREE.LatheGeometry>();
const getGemGeometry = (shape: ShapeId) => {
    let geometry = gemGeometries.get(shape);
    if (!geometry) {
        const spec = SHAPES[shape];
        geometry = new THREE.LatheGeometry(
            spec.profile.map(([x, y]) => new THREE.Vector2(x, y)),
            spec.segments,
            spec.phiStart
        );
        gemGeometries.set(shape, geometry);
    }
    return geometry;
};

const gemRadiusForCarat = (carat: number) => ((6.5 * Math.cbrt(carat)) / 2) * MM;

/* ---------- Materials ---------- */

const useMaterials = (design: CustomDesign) => {
    const metalColor = metalOptions.find((m) => m.id === design.metal)!.color;
    const stoneColor = stoneOptions.find((s) => s.id === design.stone)!.color;
    const isDiamond = design.stone === "diamond";

    const metal = useMemo(
        () => new THREE.MeshStandardMaterial({ color: metalColor, metalness: 1, roughness: 0.16, envMapIntensity: 1.3 }),
        [metalColor]
    );
    const stone = useMemo(
        () =>
            new THREE.MeshPhysicalMaterial({
                color: stoneColor,
                attenuationColor: new THREE.Color(stoneColor),
                attenuationDistance: isDiamond ? Infinity : 0.2,
                transmission: 1,
                thickness: 0.6,
                ior: isDiamond ? 2.42 : 1.77,
                dispersion: isDiamond ? 6 : 1,
                roughness: 0,
                specularIntensity: 1,
                envMapIntensity: 2.5,
                flatShading: true,
            }),
        [stoneColor, isDiamond]
    );
    const melee = useMemo(
        () =>
            new THREE.MeshPhysicalMaterial({
                color: "#ffffff",
                transmission: 1,
                thickness: 0.3,
                ior: 2.42,
                roughness: 0,
                envMapIntensity: 2.5,
                flatShading: true,
            }),
        []
    );

    /** Tiny pavé stones read better as bright, opaque facets than as transmissive glass. */
    const pave = useMemo(
        () =>
            new THREE.MeshPhysicalMaterial({
                color: isDiamond ? "#c9d1da" : stoneColor,
                roughness: 0,
                metalness: 0.15,
                clearcoat: 1,
                clearcoatRoughness: 0,
                specularIntensity: 1,
                ior: isDiamond ? 2.42 : 1.77,
                envMapIntensity: 4.5,
                flatShading: true,
            }),
        [stoneColor, isDiamond]
    );

    const paveDiamond = useMemo(() => {
        const material = pave.clone();
        material.color.set("#c9d1da");
        return material;
    }, [pave]);

    /** Opaque stones with large tables pick up the dark studio; a faint glow keeps their colour saturated. */
    const glowStone = useMemo(() => {
        const material = pave.clone();
        material.emissive.set(isDiamond ? "#8a96a3" : stoneColor);
        material.emissiveIntensity = 0.3;
        return material;
    }, [pave, stoneColor, isDiamond]);

    useEffect(() => () => metal.dispose(), [metal]);
    useEffect(() => () => glowStone.dispose(), [glowStone]);
    useEffect(() => () => stone.dispose(), [stone]);
    useEffect(() => () => melee.dispose(), [melee]);
    useEffect(() => () => pave.dispose(), [pave]);
    useEffect(() => () => paveDiamond.dispose(), [paveDiamond]);

    return { metal, stone, melee, pave, paveDiamond, glowStone };
};

type Materials = ReturnType<typeof useMaterials>;

/* ---------- Building blocks ---------- */

const Y_AXIS = new THREE.Vector3(0, 1, 0);

const Rod = ({ from, to, radius, material }: { from: THREE.Vector3; to: THREE.Vector3; radius: number; material: THREE.Material }) => {
    const direction = new THREE.Vector3().subVectors(to, from);
    const length = direction.length();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(Y_AXIS, direction.normalize());
    const position = from.clone().add(to).multiplyScalar(0.5);
    return (
        <mesh position={position} quaternion={quaternion} material={material}>
            <cylinderGeometry args={[radius, radius * 1.2, length, 12]} />
        </mesh>
    );
};

const Gem = ({ shape, radius, material }: { shape: ShapeId; radius: number; material: THREE.Material }) => {
    const [sx, sz] = SHAPES[shape].scale;
    return <mesh geometry={getGemGeometry(shape)} material={material} scale={[sx * radius, radius, sz * radius]} />;
};

interface HeadProps {
    shape: ShapeId;
    setting: SettingId;
    radius: number;
    depth: number;
    materials: Materials;
}

/** A set stone in local space: girdle at y = 0, table facing +Y, supports reaching down to y = -depth. */
const Head = ({ shape, setting, radius: g, depth, materials }: HeadProps) => {
    const spec = SHAPES[shape];
    const [sx, sz] = spec.scale;
    const smooth = shape === "round" || shape === "oval";

    const bezelGeometry = useMemo(() => {
        const profile = [[0.92, -0.42], [1.12, -0.42], [1.12, 0.1], [0.98, 0.1], [0.92, -0.42]].map(
            ([x, y]) => new THREE.Vector2(x, y)
        );
        return new THREE.LatheGeometry(profile, smooth ? 64 : spec.segments, smooth ? 0 : spec.phiStart);
    }, [smooth, spec]);
    useEffect(() => () => bezelGeometry.dispose(), [bezelGeometry]);

    const halo = useMemo(() => {
        if (setting !== "halo") return [];
        const count = 18;
        return Array.from({ length: count }, (_, i) => {
            const angle = (i / count) * Math.PI * 2;
            return new THREE.Vector3(Math.sin(angle) * 1.32 * sx * g, -0.06 * g, Math.cos(angle) * 1.32 * sz * g);
        });
    }, [setting, sx, sz, g]);

    return (
        <group>
            <Gem shape={shape} radius={g} material={materials.stone} />

            {setting === "bezel" ? (
                <>
                    <mesh geometry={bezelGeometry} material={materials.metal} scale={[sx * g, g, sz * g]} />
                    <mesh material={materials.metal} position={[0, -0.42 * g - (depth - 0.42 * g) / 2, 0]} scale={[sx, 1, sz]}>
                        <cylinderGeometry args={[0.85 * g, 0.4 * g, Math.max(0.01, depth - 0.42 * g), 32, 1, true]} />
                    </mesh>
                </>
            ) : (
                <>
                    {spec.prongs.map(({ angle, radius }) => {
                        const top = new THREE.Vector3(
                            Math.sin(angle) * radius * 1.03 * sx * g,
                            0.16 * g,
                            Math.cos(angle) * radius * 1.03 * sz * g
                        );
                        const bottom = new THREE.Vector3(Math.sin(angle) * 0.42 * sx * g, -depth, Math.cos(angle) * 0.42 * sz * g);
                        return (
                            <group key={angle}>
                                <Rod from={bottom} to={top} radius={Math.max(0.018, 0.065 * g)} material={materials.metal} />
                                <mesh position={top} material={materials.metal}>
                                    <sphereGeometry args={[Math.max(0.022, 0.08 * g), 16, 12]} />
                                </mesh>
                            </group>
                        );
                    })}
                    <mesh material={materials.metal} position={[0, -0.45 * g, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[sx, sz, 1]}>
                        <torusGeometry args={[0.62 * g, Math.max(0.014, 0.05 * g), 10, 48]} />
                    </mesh>
                </>
            )}

            {halo.length > 0 && (
                <>
                    {halo.map((position, i) => (
                        <group key={i} position={position}>
                            <Gem shape="round" radius={0.17 * g} material={materials.melee} />
                        </group>
                    ))}
                    <mesh material={materials.metal} position={[0, -0.2 * g, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[sx, sz, 1]}>
                        <torusGeometry args={[1.32 * g, 0.12 * g, 12, 64]} />
                    </mesh>
                </>
            )}
        </group>
    );
};

/* ---------- Ring ---------- */

class TwistCurve extends THREE.Curve<THREE.Vector3> {
    constructor(private radius: number, private amplitude: number, private turns: number, private phase: number) {
        super();
    }
    getPoint(t: number, target = new THREE.Vector3()) {
        const angle = t * Math.PI * 2;
        const wave = this.turns * angle + this.phase;
        const r = this.radius + this.amplitude * Math.cos(wave);
        return target.set(Math.sin(angle) * r, Math.cos(angle) * r, this.amplitude * 1.3 * Math.sin(wave));
    }
}

const bandProfile = (inner: number, thickness: number, width: number, exponent: number, steps = 48) =>
    Array.from({ length: steps + 1 }, (_, i) => {
        const phi = (i / steps) * Math.PI * 2;
        const c = Math.cos(phi);
        const s = Math.sin(phi);
        return new THREE.Vector2(
            inner + thickness / 2 + (thickness / 2) * Math.sign(c) * Math.abs(c) ** exponent,
            (width / 2) * Math.sign(s) * Math.abs(s) ** exponent
        );
    });

const Band = ({ band, inner, thickness, width, material }: { band: BandId; inner: number; thickness: number; width: number; material: THREE.Material }) => {
    const geometries = useMemo(() => {
        if (band === "twist") {
            return [0, Math.PI].map(
                (phase) => new THREE.TubeGeometry(new TwistCurve(inner + thickness / 2, width * 0.2, 12, phase), 480, width * 0.26, 12, true)
            );
        }
        const lathe = new THREE.LatheGeometry(bandProfile(inner, thickness, width, band === "flat" ? 0.3 : 1), 160);
        lathe.rotateX(Math.PI / 2);
        return [lathe];
    }, [band, inner, thickness, width]);
    useEffect(() => () => geometries.forEach((g) => g.dispose()), [geometries]);

    return (
        <>
            {geometries.map((geometry, i) => (
                <mesh key={i} geometry={geometry} material={material} />
            ))}
        </>
    );
};

const Ring = ({ design, materials }: { design: CustomDesign; materials: Materials }) => {
    const inner = 1;
    const thickness = 1.7 * MM;
    const width = design.bandWidth * MM;
    const outer = inner + thickness;
    const g = gemRadiusForCarat(design.carat);
    const lift = 0.62 * g + 0.04;

    const pave = useMemo(() => {
        if (design.band !== "pave") return [];
        const r = width * 0.26;
        const step = (2.3 * r) / outer;
        const angles: number[] = [];
        for (let a = 0.38; a < 1.5; a += step) angles.push(a, -a);
        return angles.map((angle) => {
            const dir = new THREE.Vector3(Math.sin(angle), Math.cos(angle), 0);
            return {
                position: dir.clone().multiplyScalar(outer - r * 0.15),
                quaternion: new THREE.Quaternion().setFromUnitVectors(Y_AXIS, dir),
                r,
            };
        });
    }, [design.band, width, outer]);

    return (
        <group>
            <Band band={design.band} inner={inner} thickness={thickness} width={width} material={materials.metal} />
            {pave.map(({ position, quaternion, r }, i) => (
                <group key={i} position={position} quaternion={quaternion}>
                    <Gem shape="round" radius={r} material={materials.melee} />
                </group>
            ))}
            <group position={[0, outer + lift, 0]}>
                <Head shape={design.shape} setting={design.setting} radius={g} depth={lift + 0.02} materials={materials} />
            </group>
        </group>
    );
};

/* ---------- Cluster band ---------- */

const Instances = ({ geometry, material, matrices }: { geometry: THREE.BufferGeometry; material: THREE.Material; matrices: THREE.Matrix4[] }) => {
    const ref = useRef<THREE.InstancedMesh>(null);
    useLayoutEffect(() => {
        const mesh = ref.current;
        if (!mesh) return;
        matrices.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
        mesh.instanceMatrix.needsUpdate = true;
    }, [matrices, geometry]);
    if (matrices.length === 0) return null;
    return (
        <instancedMesh
            key={matrices.length}
            ref={ref}
            args={[geometry, undefined, matrices.length]}
            material={material}
            frustumCulled={false}
        />
    );
};

/** Places an object on the band: local X along the circumference, Y pointing outwards, Z along the finger. */
const onBand = (angle: number, z: number, radius: number, scale: [number, number, number]) => {
    const radial = new THREE.Vector3(Math.sin(angle), Math.cos(angle), 0);
    const tangent = new THREE.Vector3(Math.cos(angle), -Math.sin(angle), 0);
    const matrix = new THREE.Matrix4().makeBasis(tangent, radial, new THREE.Vector3(0, 0, 1));
    matrix.scale(new THREE.Vector3(...scale));
    matrix.setPosition(radial.multiplyScalar(radius).add(new THREE.Vector3(0, 0, z)));
    return matrix;
};

const ClusterRing = ({ design, materials }: { design: CustomDesign; materials: Materials }) => {
    const layout = useMemo(() => {
        const inner = 1;
        const height = 1.5 * MM;
        const surface = inner + height;
        const step = (Math.PI * 2) / CLUSTER_COLUMNS;
        const cellX = (step * surface) / 2 / 0.92;
        const border = 1.2 * MM;
        const stoneX = cellX - border;
        const gem = stoneX / SHAPES.oval.scale[0];
        const stoneZ = gem * SHAPES.oval.scale[1];
        const cellZ = stoneZ + border;
        const rowZ = cellZ * 0.9;
        const paveR = 0.25 * MM;
        const paveRings = [0.4, 0.88].map((offset) => [stoneX + offset * MM, stoneZ + offset * MM] as const);

        const cells = Array.from({ length: CLUSTER_COLUMNS }, (_, column) =>
            [-rowZ, rowZ].map((z) => ({
                angle: clusterColumnAngle(column),
                z,
                set: isClusterStoneColumn(column, design.coverage),
            }))
        ).flat();
        const setCells = cells.filter((c) => c.set);

        const rims = setCells.map((c) => onBand(c.angle, c.z, inner + height * 0.9, [cellX / 1.12, height / 0.6, cellZ / 1.12]));
        const links = cells
            .filter((c) => !c.set)
            .map((c) => onBand(c.angle, c.z, inner + height / 2, [cellX / 1.2, height / 0.4, cellZ / 1.2]));
        const plates = setCells.map((c) => onBand(c.angle, c.z, inner + height * 0.45, [cellX * 0.96, height * 0.9, cellZ * 0.96]));
        const ovals = setCells.map((c) =>
            onBand(c.angle, c.z, surface + 0.1 * MM, [gem * SHAPES.oval.scale[0], gem, gem * SHAPES.oval.scale[1]])
        );

        const arcDistance = (a: number, b: number) => {
            let d = a - b;
            if (d > Math.PI) d -= Math.PI * 2;
            if (d < -Math.PI) d += Math.PI * 2;
            return d * surface;
        };
        const [outerX, outerZ] = paveRings[paveRings.length - 1];
        const pave: THREE.Matrix4[] = [];
        setCells.forEach((cell, index) => {
            paveRings.forEach(([paveX, paveZ]) => {
                const count = Math.floor((Math.PI * 2 * Math.sqrt((paveX ** 2 + paveZ ** 2) / 2)) / (paveR * 2.25));
                for (let i = 0; i < count; i++) {
                    const t = (i / count) * Math.PI * 2;
                    const u = Math.sin(t) * paveX;
                    const z = cell.z + Math.cos(t) * paveZ;
                    const angle = cell.angle + u / surface;
                    const overlapsEarlierCell = setCells.some(
                        (other, otherIndex) =>
                            otherIndex < index &&
                            (arcDistance(angle, other.angle) / outerX) ** 2 + ((z - other.z) / outerZ) ** 2 < 1
                    );
                    if (!overlapsEarlierCell) pave.push(onBand(angle, z, surface - 0.03 * MM, [paveR, paveR, paveR]));
                }
            });
        });

        const coverage = coverageOptions.find((c) => c.id === design.coverage)!.degrees;
        const span = Math.min(Math.PI * 2, ((coverage + 8) * Math.PI) / 180);
        const shank = new THREE.LatheGeometry(
            bandProfile(inner, height * 0.55, (rowZ + cellZ) * 1.6, 1),
            128,
            Math.PI - span / 2,
            span
        );
        shank.rotateX(Math.PI / 2);

        return { rims, links, plates, ovals, pave, shank };
    }, [design.coverage]);

    const geometries = useMemo(() => {
        const link = new THREE.TorusGeometry(1, 0.2, 10, 40);
        link.rotateX(Math.PI / 2);
        const rim = new THREE.TorusGeometry(1, 0.12, 8, 48);
        rim.rotateX(Math.PI / 2);
        return { link, rim, plate: new THREE.CylinderGeometry(1, 1, 1, 40) };
    }, []);
    useEffect(() => () => Object.values(geometries).forEach((g) => g.dispose()), [geometries]);
    useEffect(() => () => layout.shank.dispose(), [layout]);

    return (
        <group>
            <mesh geometry={layout.shank} material={materials.metal} />
            <Instances geometry={geometries.link} material={materials.metal} matrices={layout.links} />
            <Instances geometry={geometries.rim} material={materials.metal} matrices={layout.rims} />
            <Instances geometry={geometries.plate} material={materials.metal} matrices={layout.plates} />
            <Instances geometry={getGemGeometry("oval")} material={materials.glowStone} matrices={layout.ovals} />
            <Instances geometry={getGemGeometry("round")} material={materials.paveDiamond} matrices={layout.pave} />
        </group>
    );
};

/* ---------- Deco cocktail ring ---------- */

/** Modelled in mm. The face lies over the finger: u runs across the finger, v along it, gently domed both ways. */
const DECO_TOP = 10.6;
const decoHeight = (u: number, v: number) => DECO_TOP - 0.03 * u * u - 0.006 * v * v;
const decoNormal = (u: number, v: number) => new THREE.Vector3(0.06 * u, 1, 0.012 * v).normalize();
const decoPoint = (u: number, v: number, lift = 0) =>
    new THREE.Vector3(u, decoHeight(u, v), v).addScaledVector(decoNormal(u, v), lift);
const decoMatrix = (u: number, v: number, lift: number, scale: number | [number, number, number]) => {
    const s = typeof scale === "number" ? new THREE.Vector3(scale, scale, scale) : new THREE.Vector3(...scale);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(Y_AXIS, decoNormal(u, v));
    return new THREE.Matrix4().compose(decoPoint(u, v, lift), quaternion, s);
};

class DecoBarCurve extends THREE.Curve<THREE.Vector3> {
    constructor(private a: THREE.Vector2, private b: THREE.Vector2, private lift = 0) {
        super();
    }
    getPoint(t: number, target = new THREE.Vector3()) {
        const p = decoPoint(THREE.MathUtils.lerp(this.a.x, this.b.x, t), THREE.MathUtils.lerp(this.a.y, this.b.y, t), this.lift);
        return target.copy(p);
    }
}

class SplitShankCurve extends THREE.Curve<THREE.Vector3> {
    constructor(private radius: number, private side: 1 | -1, private gap: number) {
        super();
    }
    getPoint(t: number, target = new THREE.Vector3()) {
        const angle = this.gap + t * (Math.PI * 2 - this.gap * 2);
        const fromTop = Math.min(angle, Math.PI * 2 - angle);
        const spread = 1 - THREE.MathUtils.smoothstep(fromTop, 0.4, 1.7);
        return target.set(Math.sin(angle) * this.radius, Math.cos(angle) * this.radius, this.side * (0.75 + 2.8 * spread));
    }
}

const mirrorQuadrants = (segments: [number, number, number, number][]) =>
    segments.flatMap(([u1, v1, u2, v2]) =>
        [[1, 1], [-1, 1], [1, -1], [-1, -1]].map(([su, sv]) => [u1 * su, v1 * sv, u2 * su, v2 * sv] as [number, number, number, number])
    );

const DECO_OUTLINE: [number, number][] = [[2.6, 8.5], [7, 3], [7, -3], [2.6, -8.5], [-2.6, -8.5], [-7, -3], [-7, 3], [-2.6, 8.5]];
const DECO_ACCENT_ROWS: [number, number[]][] = [[10.1, [-2.3, 0, 2.3]], [12.2, [-1.15, 1.15]], [14.2, [0]]];

const DecoRing = ({ materials }: { materials: Materials }) => {
    const parts = useMemo(() => {
        const segments: [number, number, number, number][] = [
            ...DECO_OUTLINE.map(([u, v], i) => {
                const [nu, nv] = DECO_OUTLINE[(i + 1) % DECO_OUTLINE.length];
                return [u, v, nu, nv] as [number, number, number, number];
            }),
            [2, 4.5, -2, 4.5], [-2, 4.5, -2, -4.5], [-2, -4.5, 2, -4.5], [2, -4.5, 2, 4.5],
            [0, -2.6, 0, 2.6],
            [0, 4.5, 0, 8.5], [0, -4.5, 0, -8.5],
            ...mirrorQuadrants([[2, 4.5, 4.14, 6.58], [2, 4.5, 5.68, 4.65], [2, 1.5, 7, 1.5]]),
        ];

        const bars = segments.map(
            ([u1, v1, u2, v2]) => new THREE.TubeGeometry(new DecoBarCurve(new THREE.Vector2(u1, v1), new THREE.Vector2(u2, v2)), 16, 0.6, 8, false)
        );

        const joints = new Map<string, THREE.Matrix4>();
        const pave: THREE.Matrix4[] = [];
        segments.forEach(([u1, v1, u2, v2]) => {
            [[u1, v1], [u2, v2]].forEach(([u, v]) => joints.set(`${u},${v}`, decoMatrix(u, v, 0, 0.66)));
            const count = Math.max(1, Math.floor(Math.hypot(u2 - u1, v2 - v1) / 1.12));
            for (let i = 0; i < count; i++) {
                const t = (i + 0.5) / count;
                pave.push(decoMatrix(THREE.MathUtils.lerp(u1, u2, t), THREE.MathUtils.lerp(v1, v2, t), 0.45, 0.6));
            }
        });

        const flowerPlates: THREE.Matrix4[] = [];
        [-8.6, 8.6].forEach((u) => {
            flowerPlates.push(decoMatrix(u, 0, -0.2, [1.45, 0.5, 1.45]));
            for (let i = 0; i < 5; i++) {
                const a = (i / 5) * Math.PI * 2;
                pave.push(decoMatrix(u + Math.sin(a) * 0.82, Math.cos(a) * 0.82, 0.3, 0.5));
            }
            joints.set(`flower${u}`, decoMatrix(u, 0, 0.25, 0.32));
        });

        const accents: THREE.Matrix4[] = [];
        const cups: THREE.Matrix4[] = [];
        const prongs: THREE.Matrix4[] = [];
        [1, -1].forEach((side) =>
            DECO_ACCENT_ROWS.forEach(([v, us]) =>
                us.forEach((u) => {
                    const sv = v * side;
                    accents.push(decoMatrix(u, sv, 1.0, 1.0));
                    cups.push(decoMatrix(u, sv, 0.42, 1));
                    for (let k = 0; k < 4; k++) {
                        const a = Math.PI / 4 + (k * Math.PI) / 2;
                        prongs.push(decoMatrix(u + Math.sin(a) * 0.98, sv + Math.cos(a) * 0.98, 1.12, 0.2));
                    }
                })
            )
        );

        const gallery = DECO_OUTLINE.map(([u, v], i) => {
            const [nu, nv] = DECO_OUTLINE[(i + 1) % DECO_OUTLINE.length];
            return new THREE.TubeGeometry(new DecoBarCurve(new THREE.Vector2(u * 0.8, v * 0.8), new THREE.Vector2(nu * 0.8, nv * 0.8), -1.7), 12, 0.45, 8, false);
        });
        const posts = DECO_OUTLINE.map(
            ([u, v]) => new THREE.TubeGeometry(new THREE.LineCurve3(decoPoint(u, v), decoPoint(u * 0.8, v * 0.8, -1.7)), 2, 0.4, 8, false)
        );

        const shank = ([1, -1] as const).map((side) => new THREE.TubeGeometry(new SplitShankCurve(9.4, side, 0.33), 160, 0.9, 12, false));

        return {
            meshes: [...bars, ...gallery, ...posts, ...shank],
            joints: [...joints.values()],
            pave,
            flowerPlates,
            accents,
            cups,
            prongs,
        };
    }, []);
    useEffect(() => () => parts.meshes.forEach((g) => g.dispose()), [parts]);

    const shared = useMemo(() => {
        const cup = new THREE.CylinderGeometry(1.15, 0.55, 1.1, 28, 1);
        return { sphere: new THREE.SphereGeometry(1, 16, 12), cup, disc: new THREE.CylinderGeometry(1, 1, 1, 28) };
    }, []);
    useEffect(() => () => Object.values(shared).forEach((g) => g.dispose()), [shared]);

    return (
        <group rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -DECO_TOP * MM]} scale={MM}>
            {parts.meshes.map((geometry, i) => (
                <mesh key={i} geometry={geometry} material={materials.metal} />
            ))}
            <Instances geometry={shared.sphere} material={materials.metal} matrices={parts.joints} />
            <Instances geometry={shared.disc} material={materials.metal} matrices={parts.flowerPlates} />
            <Instances geometry={shared.cup} material={materials.metal} matrices={parts.cups} />
            <Instances geometry={shared.sphere} material={materials.metal} matrices={parts.prongs} />
            <Instances geometry={getGemGeometry("round")} material={materials.paveDiamond} matrices={parts.pave} />
            <Instances geometry={getGemGeometry("round")} material={materials.stone} matrices={parts.accents} />
        </group>
    );
};

/* ---------- Blossom ring ---------- */

/** One petal in mm: base at the origin, widening outwards along +y to a softly notched tip. */
const petalShape = () => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(1, 0.3, 3, 2.6, 2.9, 5);
    shape.bezierCurveTo(2.8, 7, 1.2, 7.8, 0, 7.4);
    shape.bezierCurveTo(-1.2, 7.8, -2.8, 7, -2.9, 5);
    shape.bezierCurveTo(-3, 2.6, -1, 0.3, 0, 0);
    return shape;
};

const distanceToPolygon = (p: THREE.Vector2, polygon: THREE.Vector2[]) => {
    let min = Infinity;
    const segment = new THREE.Line3();
    const closest = new THREE.Vector3();
    polygon.forEach((a, i) => {
        const b = polygon[(i + 1) % polygon.length];
        segment.set(new THREE.Vector3(a.x, a.y, 0), new THREE.Vector3(b.x, b.y, 0));
        segment.closestPointToPoint(new THREE.Vector3(p.x, p.y, 0), true, closest);
        min = Math.min(min, closest.distanceTo(new THREE.Vector3(p.x, p.y, 0)));
    });
    return min;
};

const insidePolygon = (p: THREE.Vector2, polygon: THREE.Vector2[]) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const a = polygon[i];
        const b = polygon[j];
        if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
    }
    return inside;
};

const BLOSSOM_PETALS = 5;
const BLOSSOM_BASE = 11.2;
const PETAL_TOP = 0.95;

const BlossomRing = ({ materials }: { materials: Materials }) => {
    const parts = useMemo(() => {
        const shape = petalShape();
        const plate = new THREE.ExtrudeGeometry(shape, {
            depth: 0.7,
            bevelEnabled: true,
            bevelThickness: 0.25,
            bevelSize: 0.25,
            bevelSegments: 3,
            curveSegments: 24,
        });
        plate.rotateX(-Math.PI / 2);

        const outline = shape.getSpacedPoints(160).slice(0, -1);
        const rim = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(outline.map((p) => new THREE.Vector3(p.x, PETAL_TOP, -p.y)), true),
            200,
            0.32,
            8,
            true
        );

        const pitch = 1.62;
        const seats: THREE.Vector2[] = [];
        for (let row = 0; row * pitch * 0.866 < 8; row++) {
            const y = 2.2 + row * pitch * 0.866;
            for (let k = -3; k <= 3; k++) {
                const p = new THREE.Vector2((k + (row % 2) * 0.5) * pitch, y);
                if (insidePolygon(p, outline) && distanceToPolygon(p, outline) >= 1.05) seats.push(p);
            }
        }

        const petals: THREE.Matrix4[] = [];
        const stones: THREE.Matrix4[] = [];
        for (let i = 0; i < BLOSSOM_PETALS; i++) {
            const frame = new THREE.Matrix4()
                .makeRotationY((i / BLOSSOM_PETALS) * Math.PI * 2)
                .multiply(new THREE.Matrix4().makeTranslation(0, BLOSSOM_BASE, -1.6))
                .multiply(new THREE.Matrix4().makeRotationX(0.32));
            petals.push(frame);
            seats.forEach((p) =>
                stones.push(
                    frame
                        .clone()
                        .multiply(new THREE.Matrix4().makeTranslation(p.x, PETAL_TOP + 0.15, -p.y))
                        .multiply(new THREE.Matrix4().makeScale(0.74, 0.74, 0.74))
                )
            );
        }

        const centre: THREE.Matrix4[] = [
            new THREE.Matrix4().compose(new THREE.Vector3(0, BLOSSOM_BASE + 2.6, 0), new THREE.Quaternion(), new THREE.Vector3(1.3, 1.3, 1.3)),
        ];
        const beads: THREE.Matrix4[] = [];
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            const dir = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
            const tilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(dir.z, 0, -dir.x), 0.4);
            centre.push(
                new THREE.Matrix4().compose(dir.clone().multiplyScalar(2.45).setY(BLOSSOM_BASE + 2.1), tilt, new THREE.Vector3(1.15, 1.15, 1.15))
            );
            const b = a + Math.PI / 6;
            beads.push(
                new THREE.Matrix4().makeTranslation(Math.sin(b) * 1.6, BLOSSOM_BASE + 2.75, Math.cos(b) * 1.6).scale(new THREE.Vector3(0.28, 0.28, 0.28)),
                new THREE.Matrix4().makeTranslation(Math.sin(b) * 3.3, BLOSSOM_BASE + 2.0, Math.cos(b) * 3.3).scale(new THREE.Vector3(0.32, 0.32, 0.32))
            );
        }

        return { plate, rim, petals, stones, centre, beads };
    }, []);
    useEffect(() => () => [parts.plate, parts.rim].forEach((g) => g.dispose()), [parts]);

    const shared = useMemo(
        () => ({
            sphere: new THREE.SphereGeometry(1, 14, 10),
            shank: new THREE.TorusGeometry(9.4, 0.9, 20, 160),
            cup: new THREE.CylinderGeometry(3.6, 2.2, 2.8, 36),
            gallery: new THREE.CylinderGeometry(2.2, 2.6, 2.2, 28),
        }),
        []
    );
    useEffect(() => () => Object.values(shared).forEach((g) => g.dispose()), [shared]);

    return (
        <group scale={MM} position={[0, -0.4, 0]}>
            <mesh geometry={shared.shank} material={materials.metal} />
            <mesh geometry={shared.gallery} material={materials.metal} position={[0, BLOSSOM_BASE - 1.2, 0]} />
            <mesh geometry={shared.cup} material={materials.metal} position={[0, BLOSSOM_BASE + 0.65, 0]} />
            <Instances geometry={parts.plate} material={materials.metal} matrices={parts.petals} />
            <Instances geometry={parts.rim} material={materials.metal} matrices={parts.petals} />
            <Instances geometry={getGemGeometry("round")} material={materials.stone} matrices={parts.stones} />
            <Instances geometry={getGemGeometry("round")} material={materials.paveDiamond} matrices={parts.centre} />
            <Instances geometry={shared.sphere} material={materials.metal} matrices={parts.beads} />
        </group>
    );
};

/* ---------- Pendant & earrings ---------- */

const headExtent = (design: CustomDesign, g: number) =>
    SHAPES[design.shape].scale[1] * g * (design.setting === "halo" ? 1.5 : 1.12);

const Pendant = ({ design, materials }: { design: CustomDesign; materials: Materials }) => {
    const g = gemRadiusForCarat(design.carat) * 1.15;
    const top = headExtent(design, g);
    const bailRadius = 0.11;
    const chainY = top + bailRadius * 2.2;

    const chain = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-2.4, chainY + 2.6, -0.5),
            new THREE.Vector3(-1, chainY + 0.9, -0.2),
            new THREE.Vector3(0, chainY, 0),
            new THREE.Vector3(1, chainY + 0.9, -0.2),
            new THREE.Vector3(2.4, chainY + 2.6, -0.5),
        ]);
        return new THREE.TubeGeometry(curve, 200, 0.016, 8, false);
    }, [chainY]);
    useEffect(() => () => chain.dispose(), [chain]);

    return (
        <group position={[0, -0.25, 0]}>
            <group rotation={[Math.PI / 2, 0, 0]}>
                <Head shape={design.shape} setting={design.setting} radius={g} depth={0.3 * g} materials={materials} />
            </group>
            <Rod from={new THREE.Vector3(0, top - 0.04, -0.05)} to={new THREE.Vector3(0, top + 0.04, -0.05)} radius={0.03} material={materials.metal} />
            <mesh material={materials.metal} position={[0, top + bailRadius, -0.05]} rotation={[0, Math.PI / 2, 0]}>
                <torusGeometry args={[bailRadius, 0.028, 12, 32]} />
            </mesh>
            <mesh geometry={chain} material={materials.metal} />
        </group>
    );
};

const Earrings = ({ design, materials }: { design: CustomDesign; materials: Materials }) => {
    const g = gemRadiusForCarat(design.carat) * 0.75;
    const offset = SHAPES[design.shape].scale[0] * g * (design.setting === "halo" ? 1.6 : 1.2) + 0.25;

    return (
        <group position={[0, 0, 0.2]}>
            {[-offset, offset].map((x) => (
                <group key={x} position={[x, 0, 0]}>
                    <group rotation={[Math.PI / 2, 0, 0]}>
                        <Head shape={design.shape} setting={design.setting} radius={g} depth={0.3 * g} materials={materials} />
                    </group>
                    <Rod from={new THREE.Vector3(0, 0, -0.2 * g)} to={new THREE.Vector3(0, 0, -0.8)} radius={0.03} material={materials.metal} />
                    <mesh material={materials.metal} position={[0, 0, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.13, 0.13, 0.05, 32]} />
                    </mesh>
                </group>
            ))}
        </group>
    );
};

/* ---------- Halo tag pendant (modelled in mm) ---------- */

const roundedSquare = (half: number, radius: number) => {
    const r = Math.max(0.05, Math.min(radius, half));
    const shape = new THREE.Shape();
    shape.moveTo(-half + r, -half);
    shape.lineTo(half - r, -half);
    shape.absarc(half - r, -half + r, r, -Math.PI / 2, 0, false);
    shape.lineTo(half, half - r);
    shape.absarc(half - r, half - r, r, 0, Math.PI / 2, false);
    shape.lineTo(-half + r, half);
    shape.absarc(-half + r, half - r, r, Math.PI / 2, Math.PI, false);
    shape.lineTo(-half, -half + r);
    shape.absarc(-half + r, -half + r, r, Math.PI, Math.PI * 1.5, false);
    return shape;
};

const outlineCurve = (half: number, radius: number, z: number) =>
    new THREE.CatmullRomCurve3(
        roundedSquare(half, radius).getSpacedPoints(240).slice(0, -1).map((p) => new THREE.Vector3(p.x, p.y, z)),
        true
    );

/** A pillowed plate: low at the edges, rising to a soft dome in the middle. */
const pillowGeometry = (half: number, base: number, rise: number) => {
    const geometry = new THREE.PlaneGeometry(half * 2, half * 2, 72, 72);
    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
        const u = Math.min(1, Math.abs(position.getX(i)) / half);
        const v = Math.min(1, Math.abs(position.getY(i)) / half);
        position.setZ(i, base + rise * (1 - u ** 4) * (1 - v ** 4));
    }
    geometry.computeVertexNormals();
    return geometry;
};

/** Side profile of the bail: a teardrop loop, extruded across its width and tapered towards the bottom. */
const bailGeometry = (height: number, radius: number, thickness: number, width: number) => {
    const teardrop = (r: number, bottom: number, centre: number) => {
        const path = new THREE.Path();
        path.moveTo(0, bottom);
        path.quadraticCurveTo(r * 1.05, bottom + (centre - bottom) * 0.35, r, centre);
        path.absarc(0, centre, r, 0, Math.PI, false);
        path.quadraticCurveTo(-r * 1.05, bottom + (centre - bottom) * 0.35, 0, bottom);
        return path;
    };
    const centre = height - radius;
    const outer = new THREE.Shape(teardrop(radius, 0, centre).getPoints(48));
    outer.holes.push(new THREE.Path(teardrop(radius - thickness, thickness * 1.7, centre).getPoints(48)));

    const geometry = new THREE.ExtrudeGeometry(outer, {
        depth: width,
        bevelEnabled: true,
        bevelThickness: 0.18,
        bevelSize: 0.15,
        bevelSegments: 3,
        curveSegments: 24,
    });
    geometry.translate(0, 0, -width / 2);
    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
        const t = THREE.MathUtils.clamp(position.getY(i) / height, 0, 1);
        position.setZ(i, position.getZ(i) * THREE.MathUtils.lerp(0.42, 1, t));
    }
    geometry.rotateY(Math.PI / 2);
    geometry.computeVertexNormals();
    return geometry;
};

const TAG_FONT = "/assets/fonts/CormorantGaramond-Italic.ttf";

const TagPendant = ({ design, materials }: { design: CustomDesign; materials: Materials }) => {
    const size = design.tagSize;
    const half = size / 2;
    const corner = size * 0.13;
    const thickness = 1.8;
    const front = thickness / 2;
    const scale = Math.sqrt(size / 15);

    const stoneD = 1.15 * scale;
    const channel = 0.45 + stoneD / 2 + 0.15;
    const plateHalf = half - (channel + stoneD / 2 + 0.45);

    const ringRadius = 1.9 * scale;
    const ringTube = 0.42 * scale;
    const ringY = half + ringRadius - ringTube * 0.6;

    const bailHeight = 9.5 * scale;
    const bailRadius = 1.75 * scale;
    const bailThickness = 0.75 * scale;
    const bailY = ringY + ringRadius - 1.25 * scale;
    const chainY = bailY + bailHeight - bailRadius + (bailRadius - bailThickness) * 0.55;

    const parts = useMemo(() => {
        const bevel = 0.35;
        const frameShape = roundedSquare(half - bevel, corner - bevel);
        frameShape.holes.push(roundedSquare(plateHalf, corner * 0.55));
        const frame = new THREE.ExtrudeGeometry(frameShape, {
            depth: thickness - bevel * 2,
            bevelEnabled: true,
            bevelThickness: bevel,
            bevelSize: bevel,
            bevelSegments: 4,
            curveSegments: 20,
        });
        frame.translate(0, 0, -(thickness - bevel * 2) / 2);

        const back = new THREE.ShapeGeometry(roundedSquare(plateHalf + 0.05, corner * 0.55), 20);
        back.rotateY(Math.PI);
        back.translate(0, 0, -front + 0.05);

        const pillow = pillowGeometry(plateHalf + 0.15, front - 0.5, 0.95);
        const outerLip = new THREE.TubeGeometry(outlineCurve(half - 0.3, corner - 0.3, front), 240, 0.24, 8, true);
        const innerLip = new THREE.TubeGeometry(
            outlineCurve(half - channel - stoneD / 2 - 0.22, corner - channel, front),
            240,
            0.2,
            8,
            true
        );

        const path = roundedSquare(half - channel, Math.max(0.4, corner - channel));
        const count = Math.floor(path.getLength() / (stoneD * 1.12));
        const points = path.getSpacedPoints(count).slice(0, -1);
        const stones = points.map((p) => new THREE.Vector3(p.x, p.y, front + 0.2));
        const beads = points.map((p, i) => {
            const next = points[(i + 1) % points.length];
            return new THREE.Vector3((p.x + next.x) / 2, (p.y + next.y) / 2, front + 0.22);
        });

        const chain = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3([
                new THREE.Vector3(-24, chainY + 26, -4),
                new THREE.Vector3(-9, chainY + 8, -1.5),
                new THREE.Vector3(0, chainY, 0),
                new THREE.Vector3(9, chainY + 8, -1.5),
                new THREE.Vector3(24, chainY + 26, -4),
            ]),
            200,
            0.32,
            8,
            false
        );

        return { frame, back, pillow, outerLip, innerLip, stones, beads, chain, bail: bailGeometry(bailHeight, bailRadius, bailThickness, 3.3 * scale) };
    }, [half, corner, thickness, front, plateHalf, channel, stoneD, chainY, bailHeight, bailRadius, bailThickness, scale]);

    useEffect(
        () => () => {
            [parts.frame, parts.back, parts.pillow, parts.outerLip, parts.innerLip, parts.chain, parts.bail].forEach((g) => g.dispose());
        },
        [parts]
    );

    const engravedMaterial = useMemo(() => {
        const material = (materials.metal as THREE.MeshStandardMaterial).clone();
        material.color.multiplyScalar(0.5);
        material.roughness = 0.55;
        return material;
    }, [materials.metal]);
    useEffect(() => () => engravedMaterial.dispose(), [engravedMaterial]);

    const top = bailY + bailHeight;
    const middle = (top - half) / 2;

    return (
        <group scale={MM} position={[0, -middle * MM, 0]}>
            <mesh geometry={parts.frame} material={materials.metal} />
            <mesh geometry={parts.back} material={materials.metal} />
            <mesh geometry={parts.pillow} material={materials.metal} />
            <mesh geometry={parts.outerLip} material={materials.metal} />
            <mesh geometry={parts.innerLip} material={materials.metal} />

            {parts.stones.map((position, i) => (
                <group key={i} position={position} rotation={[Math.PI / 2, 0, 0]}>
                    <Gem shape="round" radius={stoneD / 2} material={materials.pave} />
                </group>
            ))}
            {parts.beads.map((position, i) => (
                <mesh key={i} position={position} material={materials.metal}>
                    <sphereGeometry args={[0.17 * scale, 10, 8]} />
                </mesh>
            ))}

            {design.engraving && (
                <Suspense fallback={null}>
                    <Text
                        font={TAG_FONT}
                        position={[0, 0, front + 0.47]}
                        fontSize={plateHalf * 0.38}
                        maxWidth={plateHalf * 1.7}
                        lineHeight={1}
                        textAlign="center"
                        anchorX="center"
                        anchorY="middle"
                        material={engravedMaterial}
                    >
                        {design.engraving}
                    </Text>
                </Suspense>
            )}

            <mesh material={materials.metal} position={[0, ringY, 0]}>
                <torusGeometry args={[ringRadius, ringTube, 16, 48]} />
            </mesh>
            <mesh geometry={parts.bail} material={materials.metal} position={[0, bailY, 0]} />
            <mesh geometry={parts.chain} material={materials.metal} />
        </group>
    );
};

/* ---------- Trishula + damaru pendant (flat engraved plate, matching reference) ---------- */

const PLATE = 1.9; // overall plate thickness (mm)
const ENGRAVE = 0.45; // raised engraving depth on the front face

const extrudeFlat = (shape: THREE.Shape, depth: number, bevel = 0.28) => {
    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: true,
        bevelThickness: bevel,
        bevelSize: bevel * 0.85,
        bevelSegments: 3,
        curveSegments: 40,
    });
    geometry.translate(0, 0, -depth / 2);
    geometry.computeVertexNormals();
    return geometry;
};

/** Thin raised engraving extrusion (sits on the front of the plate). */
const extrudeEngrave = (shape: THREE.Shape, depth = ENGRAVE, bevel = 0.08) => {
    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: true,
        bevelThickness: bevel,
        bevelSize: bevel * 0.7,
        bevelSegments: 2,
        curveSegments: 28,
    });
    geometry.translate(0, 0, -depth / 2);
    geometry.computeVertexNormals();
    return geometry;
};

/** Central shaft above the damaru (spike + ribs only). */
const shaftPlateShape = () => {
    const s = new THREE.Shape();
    s.moveTo(0, 23.0);
    s.quadraticCurveTo(0.45, 22.2, 0.7, 20.6);
    s.lineTo(1.15, 17.8);
    s.lineTo(1.25, 13.5);
    s.lineTo(1.4, 9.0);
    s.lineTo(1.35, 6.9);
    s.lineTo(-1.35, 6.9);
    s.lineTo(-1.4, 9.0);
    s.lineTo(-1.25, 13.5);
    s.lineTo(-1.15, 17.8);
    s.quadraticCurveTo(-0.7, 20.6, -0.45, 22.2);
    s.lineTo(0, 23.0);
    return s;
};

/**
 * Flat hourglass damaru – matches the photo:
 * straight horizontal end bands, tapered waist, lattice sits on the face.
 */
const damaruPlateShape = () => {
    const s = new THREE.Shape();
    // Top-left corner of top band → across top → right → waist → bottom → back
    s.moveTo(-6.9, 6.55);
    s.lineTo(6.9, 6.55);
    s.lineTo(6.9, 5.85);
    s.quadraticCurveTo(4.2, 5.55, 2.0, 4.55);
    s.quadraticCurveTo(0.85, 3.95, 0.7, 3.55);
    s.quadraticCurveTo(0.85, 3.15, 2.0, 2.55);
    s.quadraticCurveTo(4.2, 1.55, 6.9, 1.25);
    s.lineTo(6.9, 0.55);
    s.lineTo(-6.9, 0.55);
    s.lineTo(-6.9, 1.25);
    s.quadraticCurveTo(-4.2, 1.55, -2.0, 2.55);
    s.quadraticCurveTo(-0.85, 3.15, -0.7, 3.55);
    s.quadraticCurveTo(-0.85, 3.95, -2.0, 4.55);
    s.quadraticCurveTo(-4.2, 5.55, -6.9, 5.85);
    s.lineTo(-6.9, 6.55);
    return s;
};

/** Short twisted lower-shaft plate under the damaru. */
const twistPlateShape = () => {
    const s = new THREE.Shape();
    s.moveTo(-1.25, 0.55);
    s.lineTo(1.25, 0.55);
    s.lineTo(1.35, -2.7);
    s.lineTo(-1.35, -2.7);
    s.lineTo(-1.25, 0.55);
    return s;
};

/** Smooth spear tip under the twist (flat silhouette). */
const tipPlateShape = () => {
    const s = new THREE.Shape();
    s.moveTo(-1.55, -2.55);
    s.lineTo(1.55, -2.55);
    s.quadraticCurveTo(1.65, -3.4, 1.2, -5.2);
    s.quadraticCurveTo(0.7, -7.4, 0, -9.6);
    s.quadraticCurveTo(-0.7, -7.4, -1.2, -5.2);
    s.quadraticCurveTo(-1.65, -3.4, -1.55, -2.55);
    return s;
};

/**
 * Deep U outer prong (right) – matches the reference silhouette:
 * thick at the belly of the curve, sweeping far out, then rising to a tip.
 */
const sideProngPlateShape = () => {
    const s = new THREE.Shape();
    // Hub attachment
    s.moveTo(1.55, 8.55);
    // Outer edge: plunge out into a deep U belly, then climb to the tip
    s.bezierCurveTo(5.5, 7.4, 10.2, 8.6, 13.0, 12.2);
    s.bezierCurveTo(14.6, 15.2, 14.2, 18.8, 12.4, 21.0);
    s.bezierCurveTo(11.4, 22.2, 10.0, 22.8, 8.8, 23.0);
    // Inner edge: deep open arch back toward the hub
    s.bezierCurveTo(8.2, 21.4, 8.0, 19.0, 8.6, 16.2);
    s.bezierCurveTo(9.2, 13.2, 7.8, 10.8, 4.8, 9.4);
    s.bezierCurveTo(3.2, 8.7, 2.2, 8.55, 1.55, 8.55);
    return s;
};

/** Flame tip that sits on each side prong (curves slightly outward). */
const sideProngFlameTipShape = () => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.quadraticCurveTo(0.95, 0.55, 1.15, 2.2);
    s.quadraticCurveTo(1.05, 3.5, 0.55, 4.5);
    s.quadraticCurveTo(0.2, 5.0, 0, 5.25);
    s.quadraticCurveTo(-0.15, 4.6, -0.35, 3.2);
    s.quadraticCurveTo(-0.45, 1.6, -0.25, 0.35);
    s.quadraticCurveTo(-0.1, 0.05, 0, 0);
    return s;
};

/** Three-point collar under each flame tip. */
const sideProngCollarShape = () => {
    const s = new THREE.Shape();
    s.moveTo(-1.15, 0);
    s.quadraticCurveTo(-0.85, 0.55, -0.55, 0.85);
    s.quadraticCurveTo(-0.2, 0.45, 0, 0.95);
    s.quadraticCurveTo(0.2, 0.45, 0.55, 0.85);
    s.quadraticCurveTo(0.85, 0.55, 1.15, 0);
    s.quadraticCurveTo(0.55, -0.25, 0, -0.15);
    s.quadraticCurveTo(-0.55, -0.25, -1.15, 0);
    return s;
};

/** Concentric arc engraving near the hub (follows the U curve). */
const concentricArcShape = (rInner: number, rOuter: number, a0: number, a1: number) => {
    const s = new THREE.Shape();
    const steps = 18;
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const a = a0 + (a1 - a0) * t;
        const x = Math.cos(a) * rOuter;
        const y = Math.sin(a) * rOuter;
        if (i === 0) s.moveTo(x, y);
        else s.lineTo(x, y);
    }
    for (let i = steps; i >= 0; i--) {
        const t = i / steps;
        const a = a0 + (a1 - a0) * t;
        s.lineTo(Math.cos(a) * rInner, Math.sin(a) * rInner);
    }
    s.closePath();
    return s;
};

/** Diagonal support bar from prong base to damaru rim. */
const supportBarShape = () => {
    const s = new THREE.Shape();
    s.moveTo(2.8, 8.1);
    s.lineTo(7.0, 6.4);
    s.lineTo(7.5, 5.5);
    s.lineTo(3.4, 7.2);
    s.lineTo(2.8, 8.1);
    return s;
};

/** Flat spiral engraving (Archimedean spiral ribbon). */
const spiralEngraveShape = (turns = 2.2, rMax = 1.35, ribbon = 0.28) => {
    const outer: THREE.Vector2[] = [];
    const inner: THREE.Vector2[] = [];
    const steps = Math.floor(turns * 28);
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const ang = t * turns * Math.PI * 2;
        const r = 0.2 + (rMax - 0.2) * t;
        outer.push(new THREE.Vector2(Math.cos(ang) * r, Math.sin(ang) * r));
        const ri = Math.max(0.05, r - ribbon);
        inner.push(new THREE.Vector2(Math.cos(ang) * ri, Math.sin(ang) * ri));
    }
    const shape = new THREE.Shape();
    shape.moveTo(outer[0].x, outer[0].y);
    for (let i = 1; i < outer.length; i++) shape.lineTo(outer[i].x, outer[i].y);
    for (let i = inner.length - 1; i >= 0; i--) shape.lineTo(inner[i].x, inner[i].y);
    shape.closePath();
    return shape;
};

/** S-curve scroll engraving for the side prongs. */
const scrollEngraveShape = () => {
    const s = new THREE.Shape();
    // Thick S-band following the prong
    s.moveTo(0, 0);
    s.quadraticCurveTo(0.85, 0.35, 1.1, 1.1);
    s.quadraticCurveTo(0.95, 1.85, 0.25, 2.15);
    s.quadraticCurveTo(-0.45, 1.9, -0.55, 1.2);
    s.quadraticCurveTo(-0.35, 0.55, 0.15, 0.35);
    s.quadraticCurveTo(0.55, 0.55, 0.65, 1.0);
    s.quadraticCurveTo(0.55, 1.35, 0.2, 1.45);
    s.quadraticCurveTo(-0.05, 1.25, 0.05, 0.95);
    s.quadraticCurveTo(0.2, 0.7, 0.05, 0.45);
    s.quadraticCurveTo(-0.15, 0.25, 0, 0);
    return s;
};

/** Fleur-de-lis engraved under the central tip. */
const fleurShape = () => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.quadraticCurveTo(0.95, 0.35, 1.15, 1.15);
    s.quadraticCurveTo(0.45, 1.55, 0, 1.75);
    s.quadraticCurveTo(-0.45, 1.55, -1.15, 1.15);
    s.quadraticCurveTo(-0.95, 0.35, 0, 0);
    return s;
};

/** Leaf tip accent near each side-prong point. */
const leafEngraveShape = () => {
    const s = new THREE.Shape();
    s.moveTo(0, -0.7);
    s.quadraticCurveTo(0.55, -0.1, 0.45, 0.65);
    s.quadraticCurveTo(0.12, 1.05, 0, 1.2);
    s.quadraticCurveTo(-0.12, 1.05, -0.45, 0.65);
    s.quadraticCurveTo(-0.55, -0.1, 0, -0.7);
    return s;
};

/** Diamond cell for damaru lattice engraving. */
const diamondCellShape = () => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.48);
    s.lineTo(0.4, 0);
    s.lineTo(0, -0.48);
    s.lineTo(-0.4, 0);
    s.closePath();
    return s;
};

/**
 * Half-height of the damaru face at x (for lattice clipping).
 * Matches damaruPlateShape waist ~3.55 and ends at y 0.55–6.55.
 */
const damaruHalfHeightAt = (x: number) => {
    const ax = Math.min(1, Math.abs(x) / 6.9);
    // near waist: ~0.9 half-height; at ends: ~3.0
    return 0.9 + 2.1 * ax * ax;
};

/** Point-in-damaru test for denser lattice. */
const insideDamaru = (x: number, y: number) => {
    const cy = 3.55;
    if (y > 6.45 || y < 0.65) return false;
    const half = damaruHalfHeightAt(x);
    // At the end bands, allow full height; near waist tighten
    return Math.abs(y - cy) <= half * 0.98 && Math.abs(x) <= 6.7;
};

const TrishulaPendant = ({ materials }: { materials: Materials }) => {
    const engraved = useMemo(() => {
        const material = (materials.metal as THREE.MeshStandardMaterial).clone();
        material.roughness = 0.38;
        material.metalness = 0.96;
        material.envMapIntensity = 1.05;
        return material;
    }, [materials.metal]);
    useEffect(() => () => engraved.dispose(), [engraved]);

    const parts = useMemo(() => {
        const plate = extrudeFlat(shaftPlateShape(), PLATE, 0.18);
        const damaru = extrudeFlat(damaruPlateShape(), PLATE + 0.06, 0.16);
        const prong = extrudeFlat(sideProngPlateShape(), PLATE, 0.18);
        const prongLeft = prong.clone();
        prongLeft.applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, 1));
        prongLeft.computeVertexNormals();
        const support = extrudeFlat(supportBarShape(), PLATE, 0.14);
        const supportLeft = support.clone();
        supportLeft.applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, 1));
        supportLeft.computeVertexNormals();

        const fleur = extrudeEngrave(fleurShape(), ENGRAVE, 0.1);
        const leaf = extrudeEngrave(leafEngraveShape(), ENGRAVE, 0.08);
        const scroll = extrudeEngrave(scrollEngraveShape(), ENGRAVE * 0.95, 0.07);
        const hubSpiral = extrudeEngrave(spiralEngraveShape(2.4, 1.55, 0.34), ENGRAVE, 0.08);
        const smallSpiral = extrudeEngrave(spiralEngraveShape(2.0, 1.05, 0.26), ENGRAVE * 0.9, 0.06);
        const diamond = extrudeEngrave(diamondCellShape(), ENGRAVE * 0.85, 0.05);
        const flameTip = extrudeFlat(sideProngFlameTipShape(), PLATE, 0.14);
        const flameTipLeft = flameTip.clone();
        flameTipLeft.applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, 1));
        flameTipLeft.computeVertexNormals();
        const collar = extrudeFlat(sideProngCollarShape(), PLATE + 0.05, 0.12);
        const collarLeft = collar.clone();
        collarLeft.applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, 1));
        collarLeft.computeVertexNormals();
        // Concentric arcs that echo the deep U near the hub.
        const arcA = extrudeEngrave(concentricArcShape(2.4, 2.75, -0.15, 1.35), ENGRAVE * 0.8, 0.05);
        const arcB = extrudeEngrave(concentricArcShape(3.15, 3.5, -0.05, 1.25), ENGRAVE * 0.75, 0.05);

        // Raised rib bars on the central spike (flat grooves between them).
        const rib = new THREE.BoxGeometry(2.35, 0.42, ENGRAVE);

        // Scroll engraving placements along the deep U curve of each side prong.
        const scrollMatrices: THREE.Matrix4[] = [];
        const prongPath = (sign: 1 | -1) =>
            new THREE.CatmullRomCurve3([
                new THREE.Vector3(sign * 3.0, 9.2, PLATE / 2 + ENGRAVE * 0.35),
                new THREE.Vector3(sign * 6.4, 10.0, PLATE / 2 + ENGRAVE * 0.35),
                new THREE.Vector3(sign * 10.0, 12.6, PLATE / 2 + ENGRAVE * 0.35),
                new THREE.Vector3(sign * 12.0, 15.8, PLATE / 2 + ENGRAVE * 0.35),
                new THREE.Vector3(sign * 11.6, 18.8, PLATE / 2 + ENGRAVE * 0.35),
                new THREE.Vector3(sign * 10.0, 21.2, PLATE / 2 + ENGRAVE * 0.35),
            ]);
        ([1, -1] as const).forEach((sign) => {
            const curve = prongPath(sign);
            for (let i = 0; i < 8; i++) {
                const t = (i + 0.2) / 8;
                const point = curve.getPoint(t);
                const tangent = curve.getTangent(t).normalize();
                const quaternion = new THREE.Quaternion().setFromUnitVectors(Y_AXIS, tangent);
                const roll = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), sign * (i % 2 === 0 ? 0.4 : -0.5));
                quaternion.multiply(roll);
                const matrix = new THREE.Matrix4();
                const sc = 1.05 + (i % 3) * 0.1;
                matrix.compose(point, quaternion, new THREE.Vector3(sc * sign, sc, 1));
                scrollMatrices.push(matrix);
                // Counter-swirl for denser filigree like the photo
                if (i % 2 === 0) {
                    const matrix2 = new THREE.Matrix4();
                    matrix2.compose(
                        point.clone().add(new THREE.Vector3(sign * -0.45, 0.35, 0)),
                        quaternion.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI)),
                        new THREE.Vector3(0.78 * sign, 0.78, 1)
                    );
                    scrollMatrices.push(matrix2);
                }
            }
        });

        // Diamond lattice across the flat damaru face.
        const latticeMatrices: THREE.Matrix4[] = [];
        for (let ix = -9; ix <= 9; ix++) {
            for (let iy = -5; iy <= 5; iy++) {
                const x = ix * 0.68;
                const y = 3.55 + iy * 0.68 + (ix % 2 === 0 ? 0 : 0.34);
                if (!insideDamaru(x, y)) continue;
                const matrix = new THREE.Matrix4();
                matrix.compose(
                    new THREE.Vector3(x, y, PLATE / 2 + ENGRAVE * 0.3),
                    new THREE.Quaternion(),
                    new THREE.Vector3(0.9, 0.9, 1)
                );
                latticeMatrices.push(matrix);
            }
        }

        const twistPlate = extrudeFlat(twistPlateShape(), PLATE, 0.12);
        const tipPlate = extrudeFlat(tipPlateShape(), PLATE, 0.14);
        // Helical rope engraving on the twist section.
        const twistBar = new THREE.BoxGeometry(2.55, 0.36, ENGRAVE);
        const twistMatrices: THREE.Matrix4[] = [];
        for (let i = 0; i < 8; i++) {
            const y = 0.35 - i * 0.42;
            const matrix = new THREE.Matrix4();
            matrix.compose(
                new THREE.Vector3(0, y, PLATE / 2 + ENGRAVE * 0.35),
                new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0.7)),
                new THREE.Vector3(1, 1, 1)
            );
            twistMatrices.push(matrix);
        }
        // Flared collar where twist meets the spear tip.
        const tipCollar = new THREE.TorusGeometry(1.45, 0.28, 10, 24);

        const bail = bailGeometry(6.8, 1.85, 0.65, 2.8);
        const chain = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3([
                new THREE.Vector3(-24, 38, -3),
                new THREE.Vector3(-9, 31, -1),
                new THREE.Vector3(0, 29.4, 0),
                new THREE.Vector3(9, 31, -1),
                new THREE.Vector3(24, 38, -3),
            ]),
            160,
            0.5,
            8,
            false
        );

        return {
            plate,
            damaru,
            prong,
            prongLeft,
            support,
            supportLeft,
            fleur,
            leaf,
            scroll,
            scrollMatrices,
            hubSpiral,
            smallSpiral,
            diamond,
            latticeMatrices,
            rib,
            twistPlate,
            tipPlate,
            tipCollar,
            twistBar,
            twistMatrices,
            flameTip,
            flameTipLeft,
            collar,
            collarLeft,
            arcA,
            arcB,
            bail,
            chain,
        };
    }, []);

    useEffect(
        () => () => {
            (
                [
                    parts.plate,
                    parts.damaru,
                    parts.prong,
                    parts.prongLeft,
                    parts.support,
                    parts.supportLeft,
                    parts.fleur,
                    parts.leaf,
                    parts.scroll,
                    parts.hubSpiral,
                    parts.smallSpiral,
                    parts.diamond,
                    parts.rib,
                    parts.twistPlate,
                    parts.tipPlate,
                    parts.tipCollar,
                    parts.twistBar,
                    parts.flameTip,
                    parts.flameTipLeft,
                    parts.collar,
                    parts.collarLeft,
                    parts.arcA,
                    parts.arcB,
                    parts.bail,
                    parts.chain,
                ] as THREE.BufferGeometry[]
            ).forEach((g) => g.dispose());
        },
        [parts]
    );

    const frontZ = PLATE / 2 + ENGRAVE * 0.35;

    return (
        <group scale={MM} position={[0, 0.15, 0]}>
            {/* Flat base plate + overlapping sections for a continuous silhouette */}
            <mesh geometry={parts.plate} material={materials.metal} />
            <mesh geometry={parts.damaru} material={materials.metal} />
            <mesh geometry={parts.prong} material={materials.metal} />
            <mesh geometry={parts.prongLeft} material={materials.metal} />
            <mesh geometry={parts.support} material={materials.metal} />
            <mesh geometry={parts.supportLeft} material={materials.metal} />

            {/* Flame tips + collars on the deep U prongs */}
            <mesh geometry={parts.collar} material={materials.metal} position={[9.2, 21.8, 0]} rotation={[0, 0, -0.4]} />
            <mesh geometry={parts.collarLeft} material={materials.metal} position={[-9.2, 21.8, 0]} rotation={[0, 0, 0.4]} />
            <mesh geometry={parts.flameTip} material={materials.metal} position={[9.6, 22.6, 0]} rotation={[0, 0, -0.55]} />
            <mesh geometry={parts.flameTipLeft} material={materials.metal} position={[-9.6, 22.6, 0]} rotation={[0, 0, 0.55]} />

            {/* Hub disc (flat, in the plate plane) */}
            <mesh material={materials.metal} position={[0, 9.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[2.55, 2.55, PLATE + 0.08, 28]} />
            </mesh>

            {/* Central spike ribs – engraved bands */}
            {[14.0, 14.85, 15.7, 16.55, 17.4, 18.25].map((y) => (
                <mesh key={y} geometry={parts.rib} material={engraved} position={[0, y, frontZ]} />
            ))}

            {/* Fleur-de-lis under the tip */}
            <mesh geometry={parts.fleur} material={engraved} position={[0, 19.6, frontZ]} />

            {/* Hub spiral engravings (eye motifs at the U junction) */}
            <mesh geometry={parts.hubSpiral} material={engraved} position={[-1.7, 9.6, frontZ]} />
            <mesh geometry={parts.hubSpiral} material={engraved} position={[1.7, 9.6, frontZ]} scale={[-1, 1, 1]} />
            <mesh geometry={parts.smallSpiral} material={engraved} position={[0, 8.25, frontZ]} />

            {/* Concentric arcs following the deep U near the hub */}
            <mesh geometry={parts.arcA} material={engraved} position={[1.2, 9.0, frontZ]} />
            <mesh geometry={parts.arcB} material={engraved} position={[1.2, 9.0, frontZ]} />
            <mesh geometry={parts.arcA} material={engraved} position={[-1.2, 9.0, frontZ]} scale={[-1, 1, 1]} />
            <mesh geometry={parts.arcB} material={engraved} position={[-1.2, 9.0, frontZ]} scale={[-1, 1, 1]} />

            {/* Side-prong scroll engravings following the deep curves */}
            <Instances geometry={parts.scroll} material={engraved} matrices={parts.scrollMatrices} />

            {/* Leaf accents near side tips */}
            <mesh geometry={parts.leaf} material={engraved} position={[9.4, 21.4, frontZ]} rotation={[0, 0, -0.6]} />
            <mesh geometry={parts.leaf} material={engraved} position={[-9.4, 21.4, frontZ]} rotation={[0, 0, 0.6]} />

            {/* Damaru diamond lattice engraving */}
            <Instances geometry={parts.diamond} material={engraved} matrices={parts.latticeMatrices} />

            {/* Twisted lower shaft + collar + spear tip */}
            <mesh geometry={parts.twistPlate} material={materials.metal} />
            <Instances geometry={parts.twistBar} material={engraved} matrices={parts.twistMatrices} />
            <mesh geometry={parts.tipCollar} material={materials.metal} position={[0, -2.6, 0]} rotation={[Math.PI / 2, 0, 0]} />
            <mesh geometry={parts.tipPlate} material={materials.metal} />

            {/* Jump ring + teardrop bail + chain */}
            <mesh material={materials.metal} position={[0, 23.7, 0]}>
                <torusGeometry args={[1.05, 0.28, 12, 28]} />
            </mesh>
            <mesh geometry={parts.bail} material={materials.metal} position={[0, 24.5, 0]} />
            <mesh geometry={parts.chain} material={materials.metal} />
        </group>
    );
};

/* ---------- Ruby bypass bangle ---------- */

/** Flat rectangular profile for ExtrudeGeometry paths (X = radial, Y = vertical). */
const rectProfile = (radial: number, vertical: number) => {
    const s = new THREE.Shape();
    const hw = radial / 2;
    const hh = vertical / 2;
    const r = Math.min(hw, hh) * 0.22;
    s.moveTo(-hw + r, -hh);
    s.lineTo(hw - r, -hh);
    s.quadraticCurveTo(hw, -hh, hw, -hh + r);
    s.lineTo(hw, hh - r);
    s.quadraticCurveTo(hw, hh, hw - r, hh);
    s.lineTo(-hw + r, hh);
    s.quadraticCurveTo(-hw, hh, -hw, hh - r);
    s.lineTo(-hw, -hh + r);
    s.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
    return s;
};

/** Arc on a circle in the XZ plane (Y up). θ = 0 at +X, increasing toward +Z. */
const circleArc = (radius: number, a0: number, a1: number, steps: number, y = 0) => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const a = a0 + (a1 - a0) * t;
        points.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
    }
    return points;
};

const extrudeAlong = (shape: THREE.Shape, points: THREE.Vector3[], steps = 48) => {
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.ExtrudeGeometry(shape, {
        steps,
        bevelEnabled: false,
        extrudePath: curve,
        curveSegments: 4,
    });
    geometry.computeVertexNormals();
    return geometry;
};

const BypassBangle = ({ materials }: { materials: Materials }) => {
    const parts = useMemo(() => {
        // Wrist-sized open cuff; bypass opening faces +Z.
        // Rails are extruded on planar (y=0) paths then shifted in Y so Frenet
        // frames stay upright and the dual-rail gap stays clearly open.
        const R = 30;
        const bandRadial = 1.7;
        const bandVert = 1.35;
        const railRadial = 1.5;
        const railVert = 1.05;
        // Centre-to-centre ≈ 2× rail height → open space roughly one rail thick.
        const gap = 4.6;
        const front = Math.PI / 2;
        const open = 0.48;
        const leftRoot = front + open;
        const rightRoot = front - open;
        const span = 1.35;

        const bandShape = rectProfile(bandRadial, bandVert);
        const railShape = rectProfile(railRadial, railVert);

        const band = extrudeAlong(bandShape, circleArc(R, leftRoot, rightRoot + Math.PI * 2, 120), 120);

        const l0 = leftRoot + 0.12;
        const l1 = leftRoot - span;
        const leftBase = -0.65;
        const leftUpperY = leftBase + gap / 2;
        const leftLowerY = leftBase - gap / 2;

        // Planar extrusions — vertical separation applied via mesh position.
        const leftUpper = extrudeAlong(railShape, circleArc(R, l0, l1, 56), 56);
        const leftLower = extrudeAlong(railShape, circleArc(R, l0, l1, 56), 56);

        const R2 = R + 1.1;
        const r0 = rightRoot - 0.12;
        const r1 = rightRoot + span;
        const rightBase = 0.95;
        const rightUpperY = rightBase + gap / 2;
        const rightLowerY = rightBase - gap / 2;
        const rightUpper = extrudeAlong(railShape, circleArc(R2, r0, r1, 56), 56);
        const rightLower = extrudeAlong(railShape, circleArc(R2, r0, r1, 56), 56);

        const tip = new THREE.SphereGeometry(railVert * 0.62, 16, 12);
        const tipMatrices: THREE.Matrix4[] = [];
        const placeTip = (radius: number, a: number, y: number) => {
            const m = new THREE.Matrix4();
            m.compose(
                new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius),
                new THREE.Quaternion(),
                new THREE.Vector3(1.25, 0.9, 1.25)
            );
            tipMatrices.push(m);
        };
        placeTip(R, l1, leftUpperY);
        placeTip(R, l1, leftLowerY);
        placeTip(R2, r1, rightUpperY);
        placeTip(R2, r1, rightLowerY);

        const paveMatrices: THREE.Matrix4[] = [];
        const placePave = (radius: number, a0: number, a1: number, y: number, count: number) => {
            for (let i = 0; i < count; i++) {
                const t = (i + 0.4) / count;
                if (t < 0.06 || t > 0.9) continue;
                const a = a0 + (a1 - a0) * t;
                const outward = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
                const pos = new THREE.Vector3(
                    Math.cos(a) * (radius + 0.05),
                    y + railVert * 0.55,
                    Math.sin(a) * (radius + 0.05)
                );
                const quat = new THREE.Quaternion().setFromUnitVectors(
                    Y_AXIS,
                    new THREE.Vector3(outward.x * 0.2, 1, outward.z * 0.2).normalize()
                );
                const m = new THREE.Matrix4();
                m.compose(pos, quat, new THREE.Vector3(0.52, 0.52, 0.52));
                paveMatrices.push(m);
            }
        };
        placePave(R, l0, l1, leftUpperY, 22);
        placePave(R, l0, l1, leftLowerY, 22);
        placePave(R2, r0, r1, rightUpperY, 22);
        placePave(R2, r0, r1, rightLowerY, 22);

        // Bezel accents sit in the open gap — staggered, hugging alternate rails.
        const bezelCup = new THREE.LatheGeometry(
            [
                [0, -0.2],
                [1.7, -0.2],
                [1.9, 0.05],
                [1.75, 0.38],
                [1.4, 0.38],
                [1.25, 0.08],
                [0, 0.08],
            ].map(([x, y]) => new THREE.Vector2(x, y)),
            32
        );
        const inset = gap / 2 - railVert * 0.55; // sit just inside the gap
        type Spot = { a: number; radius: number; y: number };
        const bezels: Spot[] = [
            { a: l0 + (l1 - l0) * 0.3, radius: R + 0.3, y: leftUpperY - inset },
            { a: l0 + (l1 - l0) * 0.65, radius: R + 0.3, y: leftLowerY + inset },
            { a: r0 + (r1 - r0) * 0.3, radius: R2 + 0.3, y: rightUpperY - inset },
            { a: r0 + (r1 - r0) * 0.65, radius: R2 + 0.3, y: rightLowerY + inset },
        ];
        const bezelMatrices: THREE.Matrix4[] = [];
        const bezelGemMatrices: THREE.Matrix4[] = [];
        bezels.forEach(({ a, radius, y }) => {
            const outward = new THREE.Vector3(Math.cos(a), 0.45, Math.sin(a)).normalize();
            const pos = new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius);
            const quat = new THREE.Quaternion().setFromUnitVectors(Y_AXIS, outward);
            const m = new THREE.Matrix4();
            m.compose(pos, quat, new THREE.Vector3(1, 1, 1));
            bezelMatrices.push(m);
            const gm = new THREE.Matrix4();
            gm.compose(pos.clone().add(outward.clone().multiplyScalar(0.25)), quat, new THREE.Vector3(1.45, 1.45, 1.45));
            bezelGemMatrices.push(gm);
        });

        return {
            band,
            leftUpper,
            leftLower,
            rightUpper,
            rightLower,
            leftUpperY,
            leftLowerY,
            rightUpperY,
            rightLowerY,
            tip,
            tipMatrices,
            paveMatrices,
            bezelCup,
            bezelMatrices,
            bezelGemMatrices,
        };
    }, []);

    useEffect(
        () => () => {
            (
                [
                    parts.band,
                    parts.leftUpper,
                    parts.leftLower,
                    parts.rightUpper,
                    parts.rightLower,
                    parts.tip,
                    parts.bezelCup,
                ] as THREE.BufferGeometry[]
            ).forEach((g) => g.dispose());
        },
        [parts]
    );

    return (
        <group scale={MM} rotation={[0.35, 0.55, 0.08]}>
            <mesh geometry={parts.band} material={materials.metal} />
            <mesh geometry={parts.leftUpper} material={materials.metal} position={[0, parts.leftUpperY, 0]} />
            <mesh geometry={parts.leftLower} material={materials.metal} position={[0, parts.leftLowerY, 0]} />
            <mesh geometry={parts.rightUpper} material={materials.metal} position={[0, parts.rightUpperY, 0]} />
            <mesh geometry={parts.rightLower} material={materials.metal} position={[0, parts.rightLowerY, 0]} />
            <Instances geometry={parts.tip} material={materials.metal} matrices={parts.tipMatrices} />
            <Instances geometry={getGemGeometry("round")} material={materials.stone} matrices={parts.paveMatrices} />
            <Instances geometry={parts.bezelCup} material={materials.metal} matrices={parts.bezelMatrices} />
            <Instances geometry={getGemGeometry("round")} material={materials.stone} matrices={parts.bezelGemMatrices} />
        </group>
    );
};

/* ---------- Flora bypass ring ---------- */

/** Arc on a circle in the XY plane (finger along Z). θ = 0 at +X, increasing toward +Y. */
const ringArc = (radius: number, a0: number, a1: number, steps: number, z = 0) => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const a = a0 + (a1 - a0) * t;
        points.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, z));
    }
    return points;
};

/** Openwork teardrop petal – tip at +Y, hollow centre. */
const floraPetalShape = () => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.35);
    s.bezierCurveTo(1.65, 0.55, 2.05, 2.4, 0, 5.1);
    s.bezierCurveTo(-2.05, 2.4, -1.65, 0.55, 0, 0.35);
    const hole = new THREE.Path();
    hole.moveTo(0, 1.15);
    hole.bezierCurveTo(0.85, 1.35, 0.95, 2.35, 0, 3.7);
    hole.bezierCurveTo(-0.95, 2.35, -0.85, 1.35, 0, 1.15);
    s.holes.push(hole);
    return s;
};

const FloraBypassRing = ({ materials }: { materials: Materials }) => {
    const emerald = useMemo(
        () =>
            new THREE.MeshPhysicalMaterial({
                color: "#1d9a5a",
                attenuationColor: new THREE.Color("#1d9a5a"),
                attenuationDistance: 0.2,
                transmission: 1,
                thickness: 0.55,
                ior: 1.57,
                roughness: 0,
                specularIntensity: 1,
                envMapIntensity: 2.5,
                flatShading: true,
            }),
        []
    );
    useEffect(() => () => emerald.dispose(), [emerald]);

    const parts = useMemo(() => {
        const R = 9.6;
        const railRadial = 1.15;
        const railDepth = 0.95; // band thickness along finger (Z in Frenet Y)
        // Clear air gap between the two parallel rails (centre-to-centre along Z).
        const gap = 2.85;
        const top = Math.PI / 2;

        const railShape = rectProfile(railRadial, railDepth);
        const bandShape = rectProfile(railRadial * 1.15, railDepth * 1.15);

        // Back shank – single band under the finger.
        const backA0 = Math.PI + 0.2;
        const backA1 = Math.PI * 2 - 0.2;
        const back = extrudeAlong(bandShape, ringArc(R, backA0, backA1, 64), 64);

        // Upper rail (left → past top) and lower rail (right → just short of top).
        // Extruded planar (z=0) then shifted so the gap stays open and upright.
        const upperA0 = Math.PI - 0.15;
        const upperA1 = top + 0.55;
        const lowerA0 = 0.15;
        const lowerA1 = top - 0.35;
        const upper = extrudeAlong(railShape, ringArc(R, upperA0, upperA1, 72), 72);
        const lower = extrudeAlong(railShape, ringArc(R, lowerA0, lowerA1, 72), 72);
        const upperZ = gap / 2;
        const lowerZ = -gap / 2;

        // Short flared joins from back band into each rail.
        const joinShape = rectProfile(railRadial * 1.05, railDepth * 1.05);
        const joinL = extrudeAlong(joinShape, ringArc(R, backA0, upperA0, 16), 16);
        const joinR = extrudeAlong(joinShape, ringArc(R, backA1, lowerA0 + Math.PI * 2, 16), 16);

        // Diamond pavé along the outer face of each rail.
        const paveMatrices: THREE.Matrix4[] = [];
        const placePave = (a0: number, a1: number, z: number, count: number) => {
            for (let i = 0; i < count; i++) {
                const t = (i + 0.5) / count;
                if (t < 0.04 || t > 0.96) continue;
                const a = a0 + (a1 - a0) * t;
                const outward = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
                const pos = outward.clone().multiplyScalar(R + railRadial * 0.42).setZ(z);
                const quat = new THREE.Quaternion().setFromUnitVectors(Y_AXIS, outward);
                const m = new THREE.Matrix4();
                m.compose(pos, quat, new THREE.Vector3(0.42, 0.42, 0.42));
                paveMatrices.push(m);
            }
        };
        placePave(upperA0, upperA1, upperZ, 28);
        placePave(lowerA0, lowerA1, lowerZ, 26);

        // Openwork gold petals for the large flower.
        const petal = new THREE.ExtrudeGeometry(floraPetalShape(), {
            depth: 0.45,
            bevelEnabled: true,
            bevelThickness: 0.12,
            bevelSize: 0.12,
            bevelSegments: 2,
            curveSegments: 20,
        });
        petal.translate(0, 0, -0.22);

        // Flower heads sit just outside the rail ends, facing outward.
        const largePos = new THREE.Vector3(Math.cos(lowerA1) * (R + 0.35), Math.sin(lowerA1) * (R + 0.35), lowerZ + 0.15);
        const smallPos = new THREE.Vector3(Math.cos(upperA1) * (R + 0.25), Math.sin(upperA1) * (R + 0.25), upperZ - 0.1);

        // Basis facing outward from the ring (XY), with "up" along world Z for petal spread.
        const faceBasis = (origin: THREE.Vector3) => {
            const forward = new THREE.Vector3(origin.x, origin.y, 0).normalize();
            const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 0, 1)).normalize();
            const up = new THREE.Vector3().crossVectors(right, forward).normalize();
            return { forward, right, up };
        };

        const petalMatrices: THREE.Matrix4[] = [];
        const petalCount = 5;
        const largeBasis = faceBasis(largePos);
        for (let i = 0; i < petalCount; i++) {
            const a = (i / petalCount) * Math.PI * 2 + Math.PI / 5;
            // Petal tip radiates in the face plane; plate faces outward.
            const tipDir = largeBasis.right
                .clone()
                .multiplyScalar(Math.cos(a))
                .add(largeBasis.up.clone().multiplyScalar(Math.sin(a)))
                .normalize();
            const m = new THREE.Matrix4()
                .makeTranslation(largePos.x, largePos.y, largePos.z)
                .multiply(
                    new THREE.Matrix4().makeBasis(
                        new THREE.Vector3().crossVectors(tipDir, largeBasis.forward).normalize(),
                        tipDir,
                        largeBasis.forward.clone()
                    )
                )
                .multiply(new THREE.Matrix4().makeRotationX(0.4))
                .multiply(new THREE.Matrix4().makeScale(0.82, 0.82, 0.82));
            petalMatrices.push(m);
        }

        // Shared flower cluster: emerald centre + six accent stones.
        const placeCluster = (origin: THREE.Vector3, scale: number, accentOut: THREE.Matrix4[], centreOut: THREE.Matrix4[]) => {
            const { forward, right, up } = faceBasis(origin);
            const quat = new THREE.Quaternion().setFromUnitVectors(Y_AXIS, forward);
            centreOut.push(
                new THREE.Matrix4().compose(
                    origin.clone().add(forward.clone().multiplyScalar(0.7 * scale)),
                    quat,
                    new THREE.Vector3(scale * 1.05, scale * 1.05, scale * 1.05)
                )
            );
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2;
                const radial = right
                    .clone()
                    .multiplyScalar(Math.cos(a) * 1.65 * scale)
                    .add(up.clone().multiplyScalar(Math.sin(a) * 1.65 * scale));
                const pos = origin.clone().add(forward.clone().multiplyScalar(0.55 * scale)).add(radial);
                const tilt = new THREE.Quaternion().setFromUnitVectors(
                    Y_AXIS,
                    forward.clone().add(radial.clone().normalize().multiplyScalar(0.4)).normalize()
                );
                accentOut.push(
                    new THREE.Matrix4().compose(pos, tilt, new THREE.Vector3(0.78 * scale, 0.78 * scale, 0.78 * scale))
                );
            }
        };

        const accentMatrices: THREE.Matrix4[] = [];
        const centreMatrices: THREE.Matrix4[] = [];
        placeCluster(largePos.clone().add(largeBasis.forward.clone().multiplyScalar(0.9)), 1.2, accentMatrices, centreMatrices);
        placeCluster(smallPos.clone().add(faceBasis(smallPos).forward.clone().multiplyScalar(0.45)), 0.92, accentMatrices, centreMatrices);

        const smallCup = new THREE.CylinderGeometry(1.9, 1.6, 0.5, 24);
        const smallCupMatrix = new THREE.Matrix4().compose(
            smallPos.clone().add(faceBasis(smallPos).forward.clone().multiplyScalar(0.1)),
            new THREE.Quaternion().setFromUnitVectors(Y_AXIS, faceBasis(smallPos).forward),
            new THREE.Vector3(1, 1, 1)
        );

        const largeCup = new THREE.CylinderGeometry(2.2, 1.8, 0.65, 28);
        const largeCupMatrix = new THREE.Matrix4().compose(
            largePos.clone().add(largeBasis.forward.clone().multiplyScalar(0.25)),
            new THREE.Quaternion().setFromUnitVectors(Y_AXIS, largeBasis.forward),
            new THREE.Vector3(1, 1, 1)
        );

        return {
            back,
            upper,
            lower,
            joinL,
            joinR,
            upperZ,
            lowerZ,
            petal,
            petalMatrices,
            paveMatrices,
            accentMatrices,
            centreMatrices,
            smallCup,
            smallCupMatrix,
            largeCup,
            largeCupMatrix,
        };
    }, []);

    useEffect(
        () => () => {
            (
                [
                    parts.back,
                    parts.upper,
                    parts.lower,
                    parts.joinL,
                    parts.joinR,
                    parts.petal,
                    parts.smallCup,
                    parts.largeCup,
                ] as THREE.BufferGeometry[]
            ).forEach((g) => g.dispose());
        },
        [parts]
    );

    return (
        <group scale={MM} rotation={[0.35, -0.2, 0]} position={[0, -0.35, 0]}>
            <mesh geometry={parts.back} material={materials.metal} />
            <mesh geometry={parts.joinL} material={materials.metal} position={[0, 0, parts.upperZ * 0.45]} />
            <mesh geometry={parts.joinR} material={materials.metal} position={[0, 0, parts.lowerZ * 0.45]} />
            <mesh geometry={parts.upper} material={materials.metal} position={[0, 0, parts.upperZ]} />
            <mesh geometry={parts.lower} material={materials.metal} position={[0, 0, parts.lowerZ]} />
            <Instances geometry={getGemGeometry("round")} material={materials.paveDiamond} matrices={parts.paveMatrices} />
            <Instances geometry={parts.petal} material={materials.metal} matrices={parts.petalMatrices} />
            <Instances geometry={parts.largeCup} material={materials.metal} matrices={[parts.largeCupMatrix]} />
            <Instances geometry={parts.smallCup} material={materials.metal} matrices={[parts.smallCupMatrix]} />
            <Instances geometry={getGemGeometry("round")} material={materials.stone} matrices={parts.accentMatrices} />
            <Instances geometry={getGemGeometry("round")} material={emerald} matrices={parts.centreMatrices} />
        </group>
    );
};

/* ---------- Lattice openwork bangle ---------- */

/** Closed teardrop outline in XY – tip at +Y, rounded base at -Y. */
const teardropPoints = (halfW: number, halfH: number, steps = 48) => {
    const pts: THREE.Vector3[] = [];
    // Tip → right shoulder → base arc → left shoulder → tip.
    pts.push(new THREE.Vector3(0, halfH, 0));
    pts.push(new THREE.Vector3(halfW * 0.35, halfH * 0.55, 0));
    pts.push(new THREE.Vector3(halfW * 0.95, halfH * 0.05, 0));
    for (let i = 1; i < steps / 2; i++) {
        const t = i / (steps / 2);
        const a = t * Math.PI; // 0 → π across the bottom
        pts.push(new THREE.Vector3(Math.cos(a) * halfW, -halfH * 0.15 - Math.sin(a) * halfH * 0.85, 0));
    }
    pts.push(new THREE.Vector3(-halfW * 0.95, halfH * 0.05, 0));
    pts.push(new THREE.Vector3(-halfW * 0.35, halfH * 0.55, 0));
    pts.push(new THREE.Vector3(0, halfH, 0));
    return pts;
};

const LatticeBangle = ({ materials }: { materials: Materials }) => {
    const parts = useMemo(() => {
        const R = 30;
        const height = 18.5; // rail centre-to-centre
        const railTube = 0.72;
        const wire = 0.32;
        const motifCount = 16;
        const hingeGap = 0.4; // radians left open for the clasp
        const halfH = height * 0.44; // tip/base sit just inside the rails
        const halfW = 3.9;

        // Top & bottom rails – open arcs so the hinge sits in the gap at +X.
        const railArc = (y: number) => {
            const pts: THREE.Vector3[] = [];
            const a0 = hingeGap / 2;
            const a1 = Math.PI * 2 - hingeGap / 2;
            const steps = 96;
            for (let i = 0; i <= steps; i++) {
                const a = a0 + (a1 - a0) * (i / steps);
                pts.push(new THREE.Vector3(Math.cos(a) * R, y, Math.sin(a) * R));
            }
            return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), steps, railTube, 8, false);
        };
        const topRail = railArc(height / 2);
        const bottomRail = railArc(-height / 2);

        // Shared motif wire frames.
        const outerPath = new THREE.CatmullRomCurve3(teardropPoints(halfW, halfH, 40), true);
        const outerFrame = new THREE.TubeGeometry(outerPath, 64, wire, 5, true);

        // Alternating inner detail: full inner teardrop OR crescent U.
        const innerPath = new THREE.CatmullRomCurve3(teardropPoints(halfW * 0.58, halfH * 0.55, 36), true);
        const innerFrame = new THREE.TubeGeometry(innerPath, 56, wire * 0.85, 5, true);

        // Crescent U – same parametric as the pave so stones sit on the wire.
        const crescentCw = halfW * 0.68;
        const crescentCy = -halfH * 0.08;
        const crescentCh = halfH * 0.5;
        const crescentPoint = (t: number) => {
            // t in [0,1] from left tip → bottom → right tip
            const a = Math.PI + t * Math.PI;
            return new THREE.Vector3(Math.cos(a) * crescentCw, crescentCy + Math.sin(a) * crescentCh, 0);
        };
        const crescentPts = Array.from({ length: 25 }, (_, i) => crescentPoint(i / 24));
        const crescent = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(crescentPts), 28, wire * 0.9, 5, false);

        // Short stem for the floating centre stone (motif B).
        const stem = new THREE.CylinderGeometry(wire * 0.55, wire * 0.55, halfH * 0.35, 6);

        // Place motifs around the bangle (skip the hinge gap).
        const outerMatrices: THREE.Matrix4[] = [];
        const innerMatrices: THREE.Matrix4[] = [];
        const crescentMatrices: THREE.Matrix4[] = [];
        const stemMatrices: THREE.Matrix4[] = [];
        const stoneMatrices: THREE.Matrix4[] = [];

        /** Seat a stone on a local motif point: table faces mostly outward, sits on the wire face. */
        const seatStone = (
            local: THREE.Vector3,
            frame: THREE.Matrix4,
            faceDir: THREE.Vector3,
            size: number,
            lift: number
        ) => {
            const p = local.clone();
            p.z += lift;
            p.applyMatrix4(frame);
            const quat = new THREE.Quaternion().setFromUnitVectors(Y_AXIS, faceDir);
            stoneMatrices.push(new THREE.Matrix4().compose(p, quat, new THREE.Vector3(size, size, size)));
        };

        const span = Math.PI * 2 - hingeGap;
        for (let i = 0; i < motifCount; i++) {
            const a = hingeGap / 2 + ((i + 0.5) / motifCount) * span;
            const outward = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
            const pos = outward.clone().multiplyScalar(R);
            const frameQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), outward);
            // Slight upward bias so tables catch light from the studio camera.
            const faceDir = outward.clone().add(new THREE.Vector3(0, 0.4, 0)).normalize();
            const frame = new THREE.Matrix4().compose(pos, frameQuat, new THREE.Vector3(1, 1, 1));
            outerMatrices.push(frame);

            // Apex + base stones seated on the outer frame centreline (clear of the rails).
            seatStone(new THREE.Vector3(0, halfH * 0.92, 0), frame, faceDir, 0.55, wire * 0.9);
            seatStone(new THREE.Vector3(0, -halfH * 0.9, 0), frame, faceDir, 0.48, wire * 0.9);

            const isCrescent = i % 2 === 1;
            if (isCrescent) {
                crescentMatrices.push(frame.clone());
                // Seven evenly spaced pavé stones along the crescent wire centreline.
                for (let k = 0; k < 7; k++) {
                    const t = (k + 0.5) / 7;
                    seatStone(crescentPoint(t), frame, faceDir, 0.36, wire * 0.9);
                }
                // Floating centre stone on a stem rising from the crescent bottom.
                const stemY = crescentCy - crescentCh + halfH * 0.2;
                stemMatrices.push(
                    new THREE.Matrix4()
                        .compose(pos, frameQuat, new THREE.Vector3(1, 1, 1))
                        .multiply(new THREE.Matrix4().makeTranslation(0, stemY, 0))
                );
                seatStone(new THREE.Vector3(0, stemY + halfH * 0.22, 0), frame, faceDir, 0.5, wire * 0.55);
            } else {
                innerMatrices.push(frame.clone());
                // Accent on the inner tip, centred on the inner wire.
                seatStone(new THREE.Vector3(0, halfH * 0.52, 0), frame, faceDir, 0.46, wire * 0.85);
            }
        }

        // Hinge pin at the gap (+X).
        const hingePin = new THREE.CylinderGeometry(0.45, 0.45, height + 2.4, 12);
        const hingeCap = new THREE.CylinderGeometry(1.15, 1.15, 0.35, 20);
        const hingeX = R;
        const hingeMatrices = [
            new THREE.Matrix4().makeTranslation(hingeX, 0, 0),
        ];
        const hingeCapMatrices = [
            new THREE.Matrix4().makeTranslation(hingeX, height / 2 + 1.1, 0),
            new THREE.Matrix4().makeTranslation(hingeX, -height / 2 - 1.1, 0),
        ];

        // Short rail stubs on either side of the hinge.
        const stub = (y: number, a0: number, a1: number) => {
            const pts = [
                new THREE.Vector3(Math.cos(a0) * R, y, Math.sin(a0) * R),
                new THREE.Vector3(Math.cos((a0 + a1) / 2) * (R + 0.15), y, Math.sin((a0 + a1) / 2) * (R + 0.15)),
                new THREE.Vector3(Math.cos(a1) * R, y, Math.sin(a1) * R),
            ];
            return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 8, railTube, 6, false);
        };
        const stubTopA = stub(height / 2, -hingeGap / 2, -0.02);
        const stubTopB = stub(height / 2, 0.02, hingeGap / 2);
        const stubBotA = stub(-height / 2, -hingeGap / 2, -0.02);
        const stubBotB = stub(-height / 2, 0.02, hingeGap / 2);

        return {
            topRail,
            bottomRail,
            outerFrame,
            innerFrame,
            crescent,
            stem,
            outerMatrices,
            innerMatrices,
            crescentMatrices,
            stemMatrices,
            stoneMatrices,
            hingePin,
            hingeCap,
            hingeMatrices,
            hingeCapMatrices,
            stubTopA,
            stubTopB,
            stubBotA,
            stubBotB,
        };
    }, []);

    useEffect(
        () => () => {
            (
                [
                    parts.topRail,
                    parts.bottomRail,
                    parts.outerFrame,
                    parts.innerFrame,
                    parts.crescent,
                    parts.stem,
                    parts.hingePin,
                    parts.hingeCap,
                    parts.stubTopA,
                    parts.stubTopB,
                    parts.stubBotA,
                    parts.stubBotB,
                ] as THREE.BufferGeometry[]
            ).forEach((g) => g.dispose());
        },
        [parts]
    );

    return (
        <group scale={MM} rotation={[0.35, -0.4, 0.05]}>
            <mesh geometry={parts.topRail} material={materials.metal} />
            <mesh geometry={parts.bottomRail} material={materials.metal} />
            <mesh geometry={parts.stubTopA} material={materials.metal} />
            <mesh geometry={parts.stubTopB} material={materials.metal} />
            <mesh geometry={parts.stubBotA} material={materials.metal} />
            <mesh geometry={parts.stubBotB} material={materials.metal} />
            <Instances geometry={parts.outerFrame} material={materials.metal} matrices={parts.outerMatrices} />
            <Instances geometry={parts.innerFrame} material={materials.metal} matrices={parts.innerMatrices} />
            <Instances geometry={parts.crescent} material={materials.metal} matrices={parts.crescentMatrices} />
            <Instances geometry={parts.stem} material={materials.metal} matrices={parts.stemMatrices} />
            <Instances geometry={parts.hingePin} material={materials.metal} matrices={parts.hingeMatrices} />
            <Instances geometry={parts.hingeCap} material={materials.metal} matrices={parts.hingeCapMatrices} />
            <Instances geometry={getGemGeometry("round")} material={materials.paveDiamond} matrices={parts.stoneMatrices} />
        </group>
    );
};

/* ---------- Scene ---------- */

const CAMERA: Record<CustomDesign["piece"], { position: [number, number, number]; target: [number, number, number] }> = {
    ring: { position: [3.3, 2.5, 5], target: [0, 0.3, 0] },
    cluster: { position: [2.6, 1.9, 4.4], target: [0, 0.1, 0] },
    deco: { position: [2.6, 1.5, 6.6], target: [0, 0, -0.35] },
    blossom: { position: [1.2, 5.0, 3.8], target: [0, 0.25, 0] },
    pendant: { position: [0.8, 0.7, 4.2], target: [0, 0.25, 0] },
    earrings: { position: [0.7, 0.5, 3], target: [0, 0, 0] },
    tag: { position: [0.7, 0.45, 6.2], target: [0, 0, 0] },
    trishula: { position: [0.7, 0.5, 14.2], target: [0, 0.35, 0] },
    bypass: { position: [4.2, 5.5, 9.5], target: [0, 0.2, 0.3] },
    flora: { position: [0.4, 2.8, 6.2], target: [0, 0.7, 0] },
    lattice: { position: [7.2, 2.8, 6.5], target: [0, 0, 0] },
};

const CameraRig = ({ piece }: { piece: CustomDesign["piece"] }) => {
    const camera = useThree((state) => state.camera);
    const controls = useThree((state) => state.controls) as unknown as { target: THREE.Vector3; update: () => void } | null;

    useEffect(() => {
        const { position, target } = CAMERA[piece];
        camera.position.set(...position);
        controls?.target.set(...target);
        controls?.update();
    }, [piece, camera, controls]);

    return null;
};

const startDistance = (piece: CustomDesign["piece"]) =>
    new THREE.Vector3(...CAMERA[piece].position).distanceTo(new THREE.Vector3(...CAMERA[piece].target));
const MIN_ZOOM = 0.45;
const MAX_ZOOM = 1.6;

interface ZoomRequest {
    distance: number | null;
    reset: boolean;
}

type OrbitLike = { target: THREE.Vector3; update: () => void; getDistance: () => number };

/** Eases the camera towards a requested distance, or back to the piece's starting view. */
const ZoomDriver = ({ piece, requestRef }: { piece: CustomDesign["piece"]; requestRef: RefObject<ZoomRequest> }) => {
    const camera = useThree((state) => state.camera);
    const controls = useThree((state) => state.controls) as unknown as OrbitLike | null;

    useFrame((_, delta) => {
        const job = requestRef.current;
        if (!controls || (!job.reset && job.distance === null)) return;
        const ease = 1 - Math.exp(-delta * 12);

        if (job.reset) {
            const { position, target } = CAMERA[piece];
            const goal = new THREE.Vector3(...position);
            camera.position.lerp(goal, ease);
            controls.target.lerp(new THREE.Vector3(...target), ease);
            if (camera.position.distanceTo(goal) < 0.002) requestRef.current = { distance: null, reset: false };
        } else if (job.distance !== null) {
            const offset = camera.position.clone().sub(controls.target);
            const next = THREE.MathUtils.lerp(offset.length(), job.distance, ease);
            camera.position.copy(controls.target).add(offset.setLength(next));
            if (Math.abs(next - job.distance) < 0.002) requestRef.current = { distance: null, reset: false };
        }
        controls.update();
    });

    return null;
};

const ZoomIcon = ({ kind }: { kind: "in" | "out" | "reset" }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
        {kind === "reset" ? (
            <>
                <path d="M2.8 8a5.2 5.2 0 1 0 1.6-3.75" strokeLinecap="round" />
                <path d="M2.6 2.2v2.6h2.6" strokeLinecap="round" strokeLinejoin="round" />
            </>
        ) : (
            <>
                <path d="M3 8h10" strokeLinecap="round" />
                {kind === "in" && <path d="M8 3v10" strokeLinecap="round" />}
            </>
        )}
    </svg>
);

/** Pendants and earrings look best from the front, so they sway instead of spinning a full turn. */
const Sway = ({ children }: { children: ReactNode }) => {
    const ref = useRef<THREE.Group>(null);
    useFrame(({ clock }) => {
        if (ref.current) ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.6) * 0.45;
    });
    return <group ref={ref}>{children}</group>;
};

const Studio = () => (
    <Environment resolution={256} frames={1}>
        <color attach="background" args={["#d9d1c7"]} />
        <Lightformer form="rect" intensity={4} position={[0, 6, 2]} rotation-x={Math.PI / 2} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={2.5} position={[-6, 1, 1]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={2.5} position={[6, 1, 1]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} />
        <Lightformer form="ring" color="#fff1dc" intensity={6} position={[3, 4, 6]} scale={3} onUpdate={(self) => self.lookAt(0, 0, 0)} />
        <Lightformer form="circle" intensity={1.5} position={[0, -5, 0]} rotation-x={-Math.PI / 2} scale={4} />
    </Environment>
);

interface JewelleryViewerProps {
    design: CustomDesign;
    onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

const JewelleryViewer = ({ design, onCanvasReady }: JewelleryViewerProps) => {
    const materials = useMaterials(design);
    const { position } = CAMERA[design.piece];
    const isBand =
        design.piece === "ring" ||
        design.piece === "cluster" ||
        design.piece === "bypass" ||
        design.piece === "flora" ||
        design.piece === "lattice";
    const base = startDistance(design.piece);
    const controlsRef = useRef<OrbitLike | null>(null);
    const zoomRequest = useRef<ZoomRequest>({ distance: null, reset: false });

    const zoomBy = (factor: number) => {
        const controls = controlsRef.current;
        if (!controls) return;
        const from = zoomRequest.current.distance ?? controls.getDistance();
        zoomRequest.current = { distance: THREE.MathUtils.clamp(from * factor, base * MIN_ZOOM, base * MAX_ZOOM), reset: false };
    };

    return (
        <>
            <Canvas
                dpr={[1, 2]}
                camera={{ position, fov: 32, near: 0.1, far: 100 }}
                gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }}
                onCreated={({ gl }) => onCanvasReady?.(gl.domElement)}
            >
                <color attach="background" args={[BACKGROUND]} />
                <ambientLight intensity={0.4} />
                <directionalLight position={[3, 5, 4]} intensity={1.2} />
                <Studio />

                {design.piece === "ring" && <Ring design={design} materials={materials} />}
                {design.piece === "cluster" && <ClusterRing design={design} materials={materials} />}
                {design.piece === "bypass" && <BypassBangle materials={materials} />}
                {design.piece === "flora" && <FloraBypassRing materials={materials} />}
                {design.piece === "lattice" && <LatticeBangle materials={materials} />}
                {!isBand && (
                    <Sway>
                        {design.piece === "deco" && <DecoRing materials={materials} />}
                        {design.piece === "blossom" && <BlossomRing materials={materials} />}
                        {design.piece === "pendant" && <Pendant design={design} materials={materials} />}
                        {design.piece === "earrings" && <Earrings design={design} materials={materials} />}
                        {design.piece === "tag" && <TagPendant design={design} materials={materials} />}
                        {design.piece === "trishula" && <TrishulaPendant materials={materials} />}
                    </Sway>
                )}

                {isBand && (
                    <ContactShadows
                        position={[0, design.piece === "bypass" || design.piece === "lattice" ? -2.4 : -1.25, 0]}
                        opacity={0.3}
                        scale={design.piece === "bypass" || design.piece === "lattice" ? 10 : 6}
                        blur={2.6}
                        far={3}
                        color="#5a4a3a"
                    />
                )}

                <OrbitControls
                    key={design.piece}
                    ref={(controls) => {
                        controlsRef.current = controls as unknown as OrbitLike | null;
                    }}
                    makeDefault
                    enablePan={false}
                    enableZoom
                    zoomSpeed={0.9}
                    minDistance={base * MIN_ZOOM}
                    maxDistance={base * MAX_ZOOM}
                    autoRotate={isBand}
                    autoRotateSpeed={1.1}
                    minPolarAngle={0.35}
                    maxPolarAngle={Math.PI / 1.7}
                    onStart={(event) => {
                        zoomRequest.current = { distance: null, reset: false };
                        const controls = event?.target as { autoRotate?: boolean } | undefined;
                        if (controls) controls.autoRotate = false;
                    }}
                />
                <CameraRig piece={design.piece} />
                <ZoomDriver piece={design.piece} requestRef={zoomRequest} />
            </Canvas>
            <div className={styles.zoomControls}>
                <button type="button" aria-label="Zoom in" onClick={() => zoomBy(0.75)}>
                    <ZoomIcon kind="in" />
                </button>
                <button type="button" aria-label="Zoom out" onClick={() => zoomBy(1 / 0.75)}>
                    <ZoomIcon kind="out" />
                </button>
                <button
                    type="button"
                    aria-label="Reset view"
                    onClick={() => {
                        zoomRequest.current = { distance: null, reset: true };
                    }}
                >
                    <ZoomIcon kind="reset" />
                </button>
            </div>
        </>
    );
};

export default JewelleryViewer;
