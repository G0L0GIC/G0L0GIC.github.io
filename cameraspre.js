import * as THREE from 'three';
import { presetSpheresData } from './spheres.js';

export function moveCameraToPreset(index, camera, controls) {
    const preset = presetSpheresData[index];
    if (!preset) return;

    const cameraPosition = new THREE.Vector3(...preset.cameraPosition);
    const cameraLookAt = new THREE.Vector3(...preset.cameraLookAt);
    const cameraUp = new THREE.Vector3(...preset.cameraUp);
    
    const duration = 1500; // 增加到1.5秒，使动画更平滑
    const startPosition = camera.position.clone();
    const startLookAt = controls.target.clone();
    const startUp = camera.up.clone();


    const animate = (time) => {
        const t = Math.min(1, (time - startTime) / duration);
        const easeT = easeInOutCubic(t);

        camera.position.lerpVectors(startPosition, cameraPosition, easeT);
        controls.target.lerpVectors(startLookAt, cameraLookAt, easeT);
        camera.up.lerpVectors(startUp, cameraUp, easeT);
        controls.update();

        if (t < 1) {
            requestAnimationFrame(animate);
        }
    };

    const startTime = performance.now();
    requestAnimationFrame(animate);
}

// 缓动函数：easeInOutCubic
function easeInOutCubic(t) {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}