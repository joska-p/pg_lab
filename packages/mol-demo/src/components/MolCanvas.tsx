import { useEffect, useRef } from "react";
import { AmbientLight, DirectionalLight, Group, PerspectiveCamera } from "@repo/glaze3d/core";
import { OrbitControls } from "@repo/glaze3d/controls";
import { Renderer } from "@repo/glaze3d/renderer";
import { buildMolMesh } from "../lib/buildMolMesh";
import type { ViewerRef } from "../lib/pattern/viewer";
import { useMoleculeCurrent } from "../stores/moleculeStore";

// 3D viewer (UC A2/A3/A4): owns the glaze3d scene — camera, lights,
// molecule group, renderer, controls, RAF loop. The molecule itself comes
// from moleculeStore; pattern integration (S9) reads the camera separately
// through viewerRef (glaze3d itself never knows about the pattern).
export function MolCanvas({ viewerRef }: { viewerRef?: ViewerRef }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const molGroupRef = useRef<Group | null>(null);
  const molecule = useMoleculeCurrent();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;

    const scene = new Group();
    const camera = new PerspectiveCamera(40, 1, 0.01, 200);
    camera.position.set(4, 3, 11);
    scene.add(camera);

    const molGroup = new Group();
    molGroupRef.current = molGroup;
    scene.add(molGroup);

    scene.add(new AmbientLight(0xffffff, 0.5));
    const keyLight = new DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 8, -6);
    camera.add(keyLight);
    const fillLight = new DirectionalLight(0x88aaff, 0.4);
    fillLight.position.set(-4, -2, -4);
    camera.add(fillLight);
    const rimLight = new DirectionalLight(0x44ccff, 0.25);
    rimLight.position.set(0, -5, 5);
    camera.add(rimLight);

    const renderer = new Renderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor([0, 0, 0], 0);

    const controls = new OrbitControls(camera, canvas, {
      enablePan: false,
      enableZoom: false,
      autoRotate: true,
      autoRotateSpeed: 0.75,
      enableDamping: true,
      dampingFactor: 0.07,
    });
    if (viewerRef) viewerRef.current = { camera, controls };

    const resizeMol = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resizeMol();
    window.addEventListener("resize", resizeMol);

    let rafId = 0;
    let disposed = false;
    const loop = () => {
      if (disposed) return;
      rafId = requestAnimationFrame(loop);
      try {
        controls.update();
        renderer.render(scene, camera);
      } catch {
        // WebGL context may be temporarily lost; keep the loop alive.
      }
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resizeMol);
      controls.dispose();
      molGroupRef.current = null;
      if (viewerRef) viewerRef.current = null;
    };
  }, [viewerRef]);

  useEffect(() => {
    const molGroup = molGroupRef.current;
    if (molecule !== null && molGroup !== null) {
      buildMolMesh(molGroup, molecule);
    }
  }, [molecule]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />;
}
