import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import * as THREE from 'three'

const vert = /* glsl */ `
uniform float uTime; uniform vec2 uMouse; uniform float uPx;
attribute float aSeed;
varying float vA; varying float vG;
void main(){
  vec3 p = position;
  p.x += sin(uTime*.2 + aSeed*30.)*.18;
  p.y += cos(uTime*.17 + aSeed*20.)*.18;
  p.z += sin(uTime*.1 + aSeed*9.)*.35;
  vec2 d = p.xy - uMouse;
  float f = exp(-dot(d,d)*.45);
  p.xy += normalize(d + vec2(1e-4)) * f * 1.2;
  p.z += f * 1.4;
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (1.6 + aSeed*2.6 + f*4.) * uPx * 13. / -mv.z;
  vA = .3 + .7*aSeed; vG = f;
}`
const frag = /* glsl */ `
varying float vA; varying float vG;
void main(){
  float r = length(gl_PointCoord - .5);
  if (r > .5) discard;
  float a = smoothstep(.5, .0, r);
  vec3 teal = vec3(.96,.94,.9);
  vec3 gold = vec3(1.,.35,.12);
  gl_FragColor = vec4(mix(teal, gold, clamp(vG*1.4,0.,1.)) * (.6 + vG), a * vA);
}`

function mulberry(a: number) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function Field({ count, scrollRef, shapes }: { count: number; scrollRef: React.RefObject<number>; shapes: boolean }) {
  const { viewport, gl, camera } = useThree()
  const group = useRef<THREE.Group>(null)
  const mat = useRef<THREE.ShaderMaterial>(null)
  const mouse = useRef(new THREE.Vector2(99, 99))
  const thread = useRef<THREE.Mesh>(null)
  const progress = useRef(0)

  const { geo, pts } = useMemo(() => {
    const rnd = mulberry(7)
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rnd() - 0.5) * 30
      pos[i * 3 + 1] = (rnd() - 0.5) * 17
      pos[i * 3 + 2] = -7 + rnd() * 9
      seed[i] = rnd()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return { geo: g, pts: pos }
  }, [count])

  const tube = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      [[-9, -2.2, 0], [-6, 1.6, 1], [-3, -1.2, -1], [0, 1.1, 1.2], [2.5, -1.9, 0], [5, 0.8, 1], [8, -0.6, 0], [10, 2.4, 0.5]].map(
        (p) => new THREE.Vector3(...p),
      ),
    )
    return new THREE.TubeGeometry(curve, 320, 0.02, 6, false)
  }, [])

  // icon shapes (shapes only, no brand logos), each tied to a few points by thin lines
  const links = useMemo(() => {
    if (!shapes) return null
    const hw = viewport.width / 2
    const anchors = [[hw * 0.45, 3.1], [hw * 0.86, 2.5], [hw * 0.55, -3.2], [hw * 0.88, -2.4]]
    const verts: number[] = []
    for (const [ax, ay] of anchors) {
      const near: [number, number][] = []
      for (let i = 0; i < count; i++) {
        const dx = pts[i * 3] - ax, dy = pts[i * 3 + 1] - ay
        near.push([dx * dx + dy * dy, i])
      }
      near.sort((a, b) => a[0] - b[0])
      for (const [, i] of near.slice(0, 6)) verts.push(ax, ay, 0, pts[i * 3], pts[i * 3 + 1], pts[i * 3 + 2])
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    return { geo: g, anchors }
  }, [shapes, viewport.width, count, pts])

  const edges = useMemo(
    () => ({
      box: new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
      page: new THREE.EdgesGeometry(new THREE.PlaneGeometry(0.9, 1.2)),
      grid: new THREE.EdgesGeometry(new THREE.BoxGeometry(1.2, 0.9, 0.02, 3, 3, 1)),
      ring: new THREE.EdgesGeometry(new THREE.TorusGeometry(0.55, 0.14, 8, 18)),
    }),
    [],
  )

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    if (mat.current) {
      mat.current.uniforms.uTime.value = t
      const p = state.pointer
      const target = new THREE.Vector2((p.x * viewport.width) / 2, (p.y * viewport.height) / 2)
      if (Math.abs(p.x) > 1.5) target.set(99, 99)
      mouse.current.lerp(target, 1 - Math.pow(0.001, dt))
      mat.current.uniforms.uMouse.value.copy(mouse.current)
    }
    const s = scrollRef.current ?? 0
    if (group.current) {
      group.current.position.y = s * 5
      group.current.rotation.z = s * 0.15
    }
    camera.position.z = 8 - s * 2
    progress.current = Math.min(1, progress.current + dt / 3.2)
    const e = 1 - Math.pow(1 - progress.current, 3)
    if (thread.current) thread.current.geometry.setDrawRange(0, Math.floor((e * 320) / 1) * 6 * 6)
  })

  return (
    <group ref={group}>
      <points geometry={geo} frustumCulled={false}>
        <shaderMaterial
          ref={mat}
          vertexShader={vert}
          fragmentShader={frag}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={{ uTime: { value: 0 }, uMouse: { value: new THREE.Vector2(99, 99) }, uPx: { value: gl.getPixelRatio() } }}
        />
      </points>
      <mesh ref={thread} geometry={tube}>
        <meshBasicMaterial color="#FF5A1F" toneMapped={false} />
      </mesh>
      {links && (
        <>
          <lineSegments geometry={links.geo}>
            <lineBasicMaterial color="#FF5A1F" transparent opacity={0.18} />
          </lineSegments>
          {links.anchors.map(([x, y], i) => (
            <Float key={i} speed={1.2} rotationIntensity={0.6} floatIntensity={0.6}>
              <lineSegments position={[x, y, 0]} scale={0.7} geometry={[edges.box, edges.page, edges.grid, edges.ring][i]}>
                <lineBasicMaterial color={i % 2 ? '#FF5A1F' : '#FF5A1F'} toneMapped={false} />
              </lineSegments>
            </Float>
          ))}
        </>
      )}
    </group>
  )
}

export default function PointField({
  eventSource,
  scrollRef,
  active,
  small,
}: {
  eventSource: React.RefObject<HTMLElement | null>
  scrollRef: React.RefObject<number>
  active: boolean
  small: boolean
}) {
  return (
    <Canvas
      className="hero-canvas"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 8], fov: 50 }}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      eventSource={eventSource as React.RefObject<HTMLElement>}
      eventPrefix="client"
    >
      <Field count={small ? 2600 : 9000} scrollRef={scrollRef} shapes={!small} />
      {!small && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.9} luminanceThreshold={0.15} luminanceSmoothing={0.4} mipmapBlur />
        </EffectComposer>
      )}
    </Canvas>
  )
}
