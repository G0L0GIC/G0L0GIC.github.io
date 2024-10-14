import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';
import * as THREE from 'three';
import { InteractiveSpheres } from './spheres.js';
import { moveCameraToPreset } from './cameraspre.js';
import { setupCameraLimits } from './cameraslimits.js';
import { Inventory } from './inventory.js';
import { InteractiveCuboids } from './interactiveCuboids.js';

window.isPopupOpen = false;
window.lastPopupCloseTime = 0;



const urlParams = new URLSearchParams(window.location.search);
const mode = parseInt(urlParams.get('mode')) || 0;

const threeScene = new THREE.Scene();

// 创建环境光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
threeScene.add(ambientLight);



const viewer = new GaussianSplats3D.Viewer({
    'threeScene': threeScene,
    'cameraUp': [0, 0, 1],
    'initialCameraPosition': [5.37461, 3.84084, -0.05763],
    'initialCameraLookAt': [5.03644, 3.85032, -0.33802],
    'sphericalHarmonicsDegree': 2
});


function createDialogueSystem() {
  const dialogueBox = document.createElement('div');
  dialogueBox.style.position = 'fixed';
  dialogueBox.style.bottom = '20px';
  dialogueBox.style.left = '50%';
  dialogueBox.style.transform = 'translateX(-50%)';
  dialogueBox.style.width = '80%';
  dialogueBox.style.padding = '20px';
  dialogueBox.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  dialogueBox.style.color = 'white';
  dialogueBox.style.borderRadius = '10px';
  dialogueBox.style.fontFamily = 'Arial, sans-serif';
  dialogueBox.style.fontSize = '18px';
  dialogueBox.style.zIndex = '1002';
  dialogueBox.style.display = 'none';
  document.body.appendChild(dialogueBox);

  const nameTag = document.createElement('div');
  nameTag.style.fontWeight = 'bold';
  nameTag.style.marginBottom = '10px';
  dialogueBox.appendChild(nameTag);

  const textContent = document.createElement('div');
  dialogueBox.appendChild(textContent);

  const optionsContainer = document.createElement('div');
  optionsContainer.style.marginTop = '15px';
  dialogueBox.appendChild(optionsContainer);

  return {
      show: function(speaker, text, options, onComplete) {
          nameTag.textContent = speaker;
          textContent.textContent = text;
          optionsContainer.innerHTML = '';

          if (options && options.length > 0) {
              options.forEach((option, index) => {
                  const button = document.createElement('button');
                  button.textContent = option.text;
                  button.style.marginRight = '10px';
                  button.style.padding = '5px 10px';
                  button.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  button.style.border = 'none';
                  button.style.borderRadius = '5px';
                  button.style.color = 'white';
                  button.style.cursor = 'pointer';
                  button.onclick = () => {
                      dialogueBox.style.display = 'none';
                      if (option.callback) option.callback();
                  };
                  optionsContainer.appendChild(button);
              });
          } else {
              const handleClick = () => {
                  dialogueBox.removeEventListener('click', handleClick);
                  dialogueBox.style.display = 'none';
                  if (onComplete) onComplete();
              };
              dialogueBox.addEventListener('click', handleClick);
          }

          dialogueBox.style.display = 'block';
      }
  };
}


let path = 'classroom.splat';
viewer.addSplatScene(path, {
  'progressiveLoad': false
})
.then(() => {
  viewer.start();

      // // 初始化背包系统
  const inventory = new Inventory(threeScene, viewer.camera);

  // 初始化交互式球体，包括预设摄像机的球体，传入inventory
  const interactiveSpheres = new InteractiveSpheres(threeScene, viewer.camera, viewer.controls, moveCameraToPreset, inventory);

  // 设置摄像机限制
  setupCameraLimits(viewer.camera, viewer.controls);

  // 初始化交互式长方体，传入背包系统
  const interactiveCuboids = new InteractiveCuboids(threeScene, viewer.camera, inventory);

    // 创建对话系统
    const dialogue = createDialogueSystem();

  // 显示对话序列
  dialogue.show("我", "头好痛~~我这是在哪？我睡了多久", null, () => {
    dialogue.show("神秘声音", "陷入时空裂缝的人类，可怜的蚁虫，去墙那边看看吧", [
      { 
        text: "看看就看看", 
        callback: () => {
          moveCameraToPreset(3, viewer.camera, viewer.controls);
        }
      }, 
      { 
        text: "再睡会吧", 
        callback: () => {
          // 触发"不行就撤"按钮的点击事件
          window.location.href = 'index.html';
        }
      }
    ]);
  });
});
 
// 修改 closePopup 函数
window.closePopup = function(popupId) {
  document.getElementById(popupId).style.display = 'none';
  window.isPopupOpen = false;
  window.lastPopupCloseTime = Date.now();
}
