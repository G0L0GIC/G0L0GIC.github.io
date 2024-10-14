
   import * as THREE from 'three';

   export function setupCameraLimits(camera, controls) {
   // 添加摄像机位置限制
        const minX = -0.4, maxX = 6;
        const minY = -1, maxY =7.5;
        const minZ = -0.9, maxZ = 1.9;
   
       // 保存原始的 update 方法
       const originalUpdate = controls.update;
   
       // 重写 update 方法
       controls.update = function() {
           // 调用原始的 update 方法
           originalUpdate.call(this);
   
           // 限制摄像机位置
           camera.position.x = THREE.MathUtils.clamp(camera.position.x, minX, maxX);
           camera.position.y = THREE.MathUtils.clamp(camera.position.y, minY, maxY);
           camera.position.z = THREE.MathUtils.clamp(camera.position.z, minZ, maxZ);
       };
   }