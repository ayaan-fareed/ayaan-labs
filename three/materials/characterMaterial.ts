import * as THREE from "three";

export const HOLO_COLOR = new THREE.Color("#4fd6ff");

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uHoloColor;
  uniform vec3 uLightDir;
  uniform vec3 uAmbient;
  uniform float uHoloEdge;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 l = normalize(uLightDir);
    float diff = max(dot(n, l), 0.0);
    float wrap = max(dot(n, l) * 0.5 + 0.5, 0.0);
    vec3 h = normalize(l + vViewDir);
    float spec = pow(max(dot(n, h), 0.0), 28.0) * 0.18;
    vec3 lit = uColor * (uAmbient + wrap * 0.55 + diff * 0.25) + spec;

    float fresnel = pow(1.0 - max(dot(n, vViewDir), 0.0), 2.2);
    float scan = 0.5 + 0.5 * sin(vWorldPos.y * 38.0 - uTime * 2.6);
    float fine = 0.5 + 0.5 * sin(vWorldPos.y * 160.0 + uTime * 6.0);
    vec3 holo = uHoloColor * (0.28 + fresnel * 1.35 + scan * 0.22 + fine * 0.08);

    float below = 1.0 - smoothstep(uHoloEdge - 0.06, uHoloEdge + 0.06, vWorldPos.y);
    float band = 1.0 - smoothstep(0.0, 0.09, abs(vWorldPos.y - uHoloEdge));
    holo += band * 1.4;

    vec3 color = mix(lit, holo, below);
    float alpha = mix(1.0, 0.42 + fresnel * 0.5 + band * 0.6, below);
    gl_FragColor = vec4(color, alpha);
  }
`;

export type CharacterUniforms = {
  uColor: { value: THREE.Color };
  uHoloColor: { value: THREE.Color };
  uLightDir: { value: THREE.Vector3 };
  uAmbient: { value: THREE.Vector3 };
  uHoloEdge: { value: number };
  uTime: { value: number };
};

export function createCharacterMaterial(color: string) {
  const uniforms: CharacterUniforms = {
    uColor: { value: new THREE.Color(color) },
    uHoloColor: { value: HOLO_COLOR.clone() },
    uLightDir: { value: new THREE.Vector3(0.6, 1, 0.8).normalize() },
    uAmbient: { value: new THREE.Vector3(0.36, 0.36, 0.4) },
    uHoloEdge: { value: -10 },
    uTime: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
  });
  return material as THREE.ShaderMaterial & { uniforms: CharacterUniforms };
}
