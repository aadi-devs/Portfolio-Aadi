import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Environment, Lightformer, ContactShadows, RoundedBox } from "@react-three/drei";
import { createContext, useContext, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";

// Palette matched to the site (cream paper, espresso ink, warm amber accent).
const C = {
  body: "#efe4d2",
  joint: "#cdbfa8",
  dark: "#22170f",
  chair: "#2b1d15",
  accent: "#d9773b",
  eye: "#ffcf8a",
};

// Feel constants
const ENTRY_K = 38,
  ENTRY_C = 5.5; // underdamped spring: slides in, overshoots, settles
const SPIN_DRAG = 2.2,
  SPIN_HOME_K = 1.4;
const PART_K = 70,
  PART_C = 7;

type Kick = { t: number; origin: THREE.Vector3; power: number };
const KickCtx = createContext<{ current: Kick }>({
  current: { t: -1, origin: new THREE.Vector3(), power: 0 },
});

function Block({
  p,
  s,
  color = C.body,
  r = 0.06,
  emissive,
  rot,
}: {
  p: [number, number, number];
  s: [number, number, number];
  color?: string;
  r?: number;
  emissive?: number;
  rot?: [number, number, number];
}) {
  const kick = useContext(KickCtx);
  const ref = useRef<THREE.Mesh>(null);
  const st = useRef({
    off: new THREE.Vector3(),
    vel: new THREE.Vector3(),
    spin: new THREE.Vector3(),
    ang: new THREE.Vector3(),
    seen: -1,
    hover: 0,
  });
  const rest = useMemo(() => new THREE.Vector3(...p), [p]);
  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05),
      m = ref.current,
      s0 = st.current;
    if (!m) return;
    if (kick.current.t !== s0.seen) {
      s0.seen = kick.current.t;
      const wp = m.getWorldPosition(new THREE.Vector3());
      const dir = wp.sub(kick.current.origin);
      const d = Math.max(0.3, dir.length());
      const f = (kick.current.power * 2.2) / d;
      s0.vel
        .addScaledVector(dir.normalize(), f)
        .add(
          new THREE.Vector3(
            (Math.random() - 0.5) * f,
            Math.random() * f * 0.6,
            (Math.random() - 0.5) * f,
          ),
        );
      s0.ang.add(
        new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5,
        ).multiplyScalar(f * 3),
      );
    }
    s0.vel.addScaledVector(s0.off, -PART_K * dt).multiplyScalar(Math.exp(-PART_C * dt));
    s0.off.addScaledVector(s0.vel, dt);
    s0.ang.addScaledVector(s0.spin, -PART_K * dt).multiplyScalar(Math.exp(-PART_C * dt));
    s0.spin.addScaledVector(s0.ang, dt);
    s0.hover += ((m.userData["h"] ? 1 : 0) - s0.hover) * (1 - Math.exp(-14 * dt));
    m.position.copy(rest).add(s0.off);
    m.rotation.set(
      (rot?.[0] ?? 0) + s0.spin.x,
      (rot?.[1] ?? 0) + s0.spin.y,
      (rot?.[2] ?? 0) + s0.spin.z,
    );
    m.scale.setScalar(1 + s0.hover * 0.08);
  });
  return (
    <RoundedBox
      ref={ref}
      args={s}
      radius={Math.min(r, ...s.map((v) => v / 2 - 0.001))}
      smoothness={2}
      castShadow
      receiveShadow
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        e.object.userData["h"] = true;
        document.body.style.cursor = "grab";
      }}
      onPointerOut={(e: ThreeEvent<PointerEvent>) => {
        e.object.userData["h"] = false;
        document.body.style.cursor = "";
      }}
    >
      <meshStandardMaterial
        color={color}
        roughness={0.55}
        metalness={0.05}
        emissive={emissive ? color : "#000"}
        emissiveIntensity={emissive ?? 0}
      />
    </RoundedBox>
  );
}

function Chair() {
  const legs = [0, 1, 2, 3, 4].map((i) => (i / 5) * Math.PI * 2);
  return (
    <group>
      {legs.map((a, i) => (
        <group key={i} rotation={[0, a, 0]}>
          <Block p={[0.42, 0.12, 0]} s={[0.8, 0.09, 0.12]} color={C.chair} />
          <Block p={[0.82, 0.05, 0]} s={[0.12, 0.1, 0.12]} color={C.dark} r={0.05} />
        </group>
      ))}
      <Block p={[0, 0.45, 0]} s={[0.14, 0.62, 0.14]} color={C.joint} />
      <Block p={[0, 0.82, 0]} s={[1.15, 0.18, 1.1]} color={C.chair} r={0.08} />
      <Block p={[0, 0.93, 0.05]} s={[0.95, 0.05, 0.9]} color={C.accent} />
      {/* backrest */}
      <Block p={[0, 1.75, -0.52]} s={[1.05, 1.7, 0.18]} color={C.chair} r={0.1} />
      <Block p={[-0.32, 1.75, -0.42]} s={[0.12, 1.5, 0.04]} color={C.accent} />
      <Block p={[0.32, 1.75, -0.42]} s={[0.12, 1.5, 0.04]} color={C.accent} />
      <Block p={[0, 2.75, -0.5]} s={[0.6, 0.32, 0.2]} color={C.chair} r={0.08} />
      {/* armrests */}
      {[-1, 1].map((sd) => (
        <group key={sd}>
          <Block p={[sd * 0.62, 1.1, -0.05]} s={[0.08, 0.38, 0.08]} color={C.joint} />
          <Block p={[sd * 0.62, 1.32, 0.02]} s={[0.18, 0.08, 0.62]} color={C.chair} />
        </group>
      ))}
    </group>
  );
}

function Robot({ look }: { look: React.RefObject<THREE.Vector2> }) {
  const head = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  useFrame(({ clock }, raw) => {
    const dt = Math.min(raw, 0.05),
      t = clock.elapsedTime,
      k = 1 - Math.exp(-6 * dt);
    const lp = look.current ?? new THREE.Vector2();
    if (head.current) {
      head.current.rotation.y += (lp.x * 0.7 - head.current.rotation.y) * k;
      head.current.rotation.x += (-lp.y * 0.35 - head.current.rotation.x) * k;
      head.current.rotation.z = Math.sin(t * 2.2) * 0.04; // vibing to the music
    }
    if (eyes.current) eyes.current.scale.y = t % 3.6 < 0.12 ? 0.1 : 1;
    if (torso.current) torso.current.position.y = Math.sin(t * 2.2) * 0.015;
    // typing hands
    if (armL.current) armL.current.rotation.x = -0.9 + Math.sin(t * 14) * 0.06;
    if (armR.current) armR.current.rotation.x = -0.9 + Math.sin(t * 14 + 1.7) * 0.06;
  });
  return (
    <group position={[0, 0.95, 0.02]}>
      {/* legs */}
      {[-1, 1].map((sd) => (
        <group key={sd} position={[sd * 0.22, 0.1, 0.05]}>
          <Block p={[0, 0, 0.3]} s={[0.26, 0.24, 0.7]} />
          <Block p={[0, -0.02, 0.66]} s={[0.24, 0.22, 0.16]} color={C.joint} />
          <Block p={[0, -0.4, 0.72]} s={[0.22, 0.62, 0.22]} />
          <Block p={[0, -0.75, 0.8]} s={[0.26, 0.12, 0.38]} color={C.dark} />
        </group>
      ))}
      <group ref={torso}>
        <Block p={[0, 0.3, -0.12]} s={[0.62, 0.22, 0.42]} color={C.joint} />
        <Block p={[0, 0.72, -0.15]} s={[0.78, 0.66, 0.48]} />
        <Block p={[0, 0.78, 0.1]} s={[0.36, 0.22, 0.02]} color={C.dark} />
        <Block p={[-0.08, 0.78, 0.115]} s={[0.06, 0.06, 0.01]} color={C.accent} emissive={1.4} />
        <Block p={[0.06, 0.78, 0.115]} s={[0.1, 0.03, 0.01]} color={C.eye} emissive={1} />
        <Block p={[0, 1.1, -0.15]} s={[0.18, 0.12, 0.18]} color={C.joint} />
        {/* arms reaching forward to a keyboard */}
        {[-1, 1].map((sd) => (
          <group key={sd} ref={sd < 0 ? armL : armR} position={[sd * 0.5, 0.98, -0.15]}>
            <Block p={[0, 0, 0]} s={[0.22, 0.22, 0.22]} color={C.joint} />
            <Block p={[0, -0.28, 0]} s={[0.18, 0.42, 0.2]} />
            <group position={[0, -0.5, 0]} rotation={[-0.7, 0, 0]}>
              <Block p={[0, -0.22, 0]} s={[0.17, 0.42, 0.18]} />
              <Block p={[0, -0.48, 0]} s={[0.2, 0.14, 0.22]} color={C.dark} />
            </group>
          </group>
        ))}
        {/* head */}
        <group ref={head} position={[0, 1.42, -0.12]}>
          <Block p={[0, 0, 0]} s={[0.72, 0.58, 0.6]} r={0.1} />
          <Block p={[0, 0.02, 0.29]} s={[0.58, 0.34, 0.04]} color={C.dark} />
          <group ref={eyes} position={[0, 0.04, 0.315]}>
            <Block p={[-0.13, 0, 0]} s={[0.1, 0.12, 0.02]} color={C.eye} emissive={2.2} r={0.02} />
            <Block p={[0.13, 0, 0]} s={[0.1, 0.12, 0.02]} color={C.eye} emissive={2.2} r={0.02} />
          </group>
          <Block p={[0, 0.37, -0.05]} s={[0.06, 0.16, 0.06]} color={C.joint} />
          <Block p={[0, 0.48, -0.05]} s={[0.11, 0.11, 0.11]} color={C.accent} emissive={0.6} />
          {/* headphones */}
          <Block p={[0, 0.36, 0]} s={[0.86, 0.09, 0.16]} color={C.dark} />
          {[-1, 1].map((sd) => (
            <group key={sd}>
              <Block p={[sd * 0.42, 0.2, 0]} s={[0.08, 0.26, 0.1]} color={C.dark} />
              <Block p={[sd * 0.43, -0.02, 0]} s={[0.14, 0.32, 0.3]} color={C.chair} r={0.06} />
              <Block
                p={[sd * 0.51, -0.02, 0]}
                s={[0.03, 0.18, 0.18]}
                color={C.accent}
                emissive={0.5}
              />
            </group>
          ))}
          {/* mic boom */}
          <Block p={[-0.46, -0.14, 0.2]} s={[0.04, 0.04, 0.34]} color={C.dark} rot={[0, 0.35, 0]} />
          <Block
            p={[-0.32, -0.2, 0.39]}
            s={[0.24, 0.04, 0.04]}
            color={C.dark}
            rot={[0, 0.5, -0.3]}
          />
          <Block p={[-0.17, -0.25, 0.44]} s={[0.1, 0.1, 0.1]} color={C.accent} r={0.05} />
        </group>
      </group>
      {/* keyboard + mouse floating desk-less */}
      <Block p={[0, 0.12, 0.95]} s={[0.9, 0.06, 0.3]} color={C.dark} />
      <Block p={[0, 0.16, 0.95]} s={[0.8, 0.02, 0.22]} color={C.accent} emissive={0.4} />
    </group>
  );
}

function Rig({ visible, children }: { visible: boolean; children: ReactNode }) {
  const g = useRef<THREE.Group>(null);
  const s = useRef({ x: -7, vx: 0, rot: -1.6, vr: 0, spin: 0, spinV: 0, drag: false, lastX: 0 });
  const kick = useContext(KickCtx);
  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05),
      st = s.current;
    const target = visible ? 0 : -7;
    const a = -ENTRY_K * (st.x - target) - ENTRY_C * st.vx;
    st.vx += a * dt;
    st.x += st.vx * dt;
    st.vr += (-ENTRY_K * 0.6 * (st.rot - 0.45) - ENTRY_C * st.vr) * dt;
    st.rot += st.vr * dt;
    if (!st.drag) {
      st.spinV += -SPIN_HOME_K * st.spin * dt;
      st.spinV *= Math.exp(-SPIN_DRAG * dt);
      st.spin += st.spinV * dt;
    }
    if (g.current) {
      g.current.position.x = st.x;
      g.current.rotation.y = st.rot + st.spin;
      g.current.rotation.z = THREE.MathUtils.clamp(-st.vx * 0.04, -0.35, 0.35); // lean from inertia
      g.current.position.y = Math.max(0, -st.vx * 0.03) * 0;
    }
  });
  return (
    <group
      ref={g}
      onPointerDown={(e) => {
        e.stopPropagation();
        const st = s.current;
        st.drag = true;
        st.lastX = e.clientX;
        st.spinV = 0;
        (e.target as Element | null)?.setPointerCapture?.(e.pointerId);
        document.body.style.cursor = "grabbing";
        kick.current = { t: performance.now(), origin: e.point.clone(), power: 0.9 };
      }}
      onPointerMove={(e) => {
        const st = s.current;
        if (!st.drag) return;
        const dx = (e.clientX - st.lastX) * 0.012;
        st.lastX = e.clientX;
        st.spin += dx;
        st.spinV = dx / 0.016;
      }}
      onPointerUp={() => {
        s.current.drag = false;
        document.body.style.cursor = "grab";
      }}
      onPointerLeave={() => {
        s.current.drag = false;
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        kick.current = { t: performance.now() + 1, origin: e.point.clone(), power: 3.5 };
      }}
    >
      {children}
    </group>
  );
}

export default function RobotScene({ visible }: { visible: boolean }) {
  const kick = useRef<Kick>({ t: -1, origin: new THREE.Vector3(), power: 0 });
  const look = useRef(new THREE.Vector2());
  return (
    <KickCtx.Provider value={kick}>
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [3.2, 2.6, 5.2], fov: 38 }}
        onCreated={({ camera }) => camera.lookAt(0, 1.4, 0)}
        onPointerMove={(e) => {
          const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
          look.current.set(
            ((e.clientX - r.left) / r.width) * 2 - 1,
            -(((e.clientY - r.top) / r.height) * 2 - 1),
          );
        }}
        style={{ touchAction: "pan-y" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[4, 7, 5]}
          intensity={2.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-4}
          shadow-camera-right={4}
          shadow-camera-top={4}
          shadow-camera-bottom={-4}
        />
        <pointLight position={[-2, 2, 2]} intensity={6} color={C.accent} distance={6} />
        <Environment resolution={128}>
          <Lightformer
            intensity={2}
            position={[0, 5, 0]}
            scale={[10, 10, 1]}
            rotation-x={Math.PI / 2}
          />
          <Lightformer
            intensity={1.2}
            color="#ffd9b0"
            position={[-5, 1, 2]}
            rotation-y={Math.PI / 2}
            scale={[20, 2, 1]}
          />
          <Lightformer
            intensity={0.8}
            color="#ffffff"
            position={[5, 2, -2]}
            rotation-y={-Math.PI / 2}
            scale={[20, 2, 1]}
          />
        </Environment>
        <Rig visible={visible}>
          <Chair />
          <Robot look={look} />
        </Rig>
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.45}
          scale={8}
          blur={2.4}
          far={3}
          color={C.dark}
        />
      </Canvas>
    </KickCtx.Provider>
  );
}
