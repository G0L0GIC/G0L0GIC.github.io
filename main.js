import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';
import * as THREE from 'three';
import { InteractiveSpheres } from './spheres.js';
import { moveCameraToPreset } from './cameraspre.js';
import { setupCameraLimits } from './cameraslimits.js';
import { Inventory } from './inventory.js';
import { InteractiveCuboids } from './interactiveCuboids.js';
import globalState from './globalState.js';
import { initAudio, playBackgroundMusic } from './audioManager.js';


const urlParams = new URLSearchParams(window.location.search);
const mode = parseInt(urlParams.get('mode')) || 0;

const threeScene = new THREE.Scene();

// 创建环境光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
threeScene.add(ambientLight);



const viewer = new GaussianSplats3D.Viewer({
    'threeScene': threeScene,
    'cameraUp': [0, 0, 1],
    'initialCameraPosition': [	5.40701, 3.82357, -0.06224],
    'initialCameraLookAt': [	5.04454, 3.84948, -0.34836],
    'sphericalHarmonicsDegree': 2
});

initAudio();

// 在用户交互后开始播放背景音乐
document.addEventListener('click', () => {
  playBackgroundMusic();
}, { once: true });


function createDialogueSystem() {
  const dialogueBox = document.createElement('div');
  dialogueBox.style.position = 'fixed';
  dialogueBox.style.bottom = '30px';
  dialogueBox.style.left = '50%';
  dialogueBox.style.transform = 'translateX(-50%)';
  dialogueBox.style.width = '80%';
  dialogueBox.style.maxWidth = '600px';
  dialogueBox.style.padding = '20px';
  dialogueBox.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  dialogueBox.style.color = 'white';
  dialogueBox.style.borderRadius = '15px';
  dialogueBox.style.fontFamily = '"Segoe UI", Arial, sans-serif';
  dialogueBox.style.fontSize = '18px';
  dialogueBox.style.zIndex = '1002';
  dialogueBox.style.display = 'none';
  dialogueBox.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
  dialogueBox.style.border = '1px solid rgba(255, 255, 255, 0.1)';
  document.body.appendChild(dialogueBox);

  const nameTag = document.createElement('div');
  nameTag.style.fontWeight = 'bold';
  nameTag.style.marginBottom = '10px';
  nameTag.style.fontSize = '22px';
  nameTag.style.color = '#C0D1B7'; //发言颜色
  dialogueBox.appendChild(nameTag);

  const textContent = document.createElement('div');
  textContent.style.lineHeight = '1.6';
  textContent.style.marginBottom = '15px';
  dialogueBox.appendChild(textContent);

  const optionsContainer = document.createElement('div');
  optionsContainer.style.marginTop = '20px';
  optionsContainer.style.display = 'flex';
  optionsContainer.style.justifyContent = 'flex-end';
  dialogueBox.appendChild(optionsContainer);

  return {
    show: function(speaker, text, options, onComplete) {
      nameTag.textContent = speaker;
      textContent.textContent = '';
      optionsContainer.innerHTML = '';

      // 添加打字机效果
      let i = 0;
      const typeWriter = () => {
        if (i < text.length) {
          textContent.textContent += text.charAt(i);
          i++;
          setTimeout(typeWriter, 30);
        }
      };
      typeWriter();

      if (options && options.length > 0) {
        options.forEach((option, index) => {
          const button = document.createElement('button');
          button.textContent = option.text;
          button.style.marginLeft = '10px';
          button.style.padding = '8px 15px';
          button.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          button.style.border = 'none';
          button.style.borderRadius = '5px';
          button.style.color = 'white';
          button.style.cursor = 'pointer';
          button.style.transition = 'background-color 0.3s';
          button.onmouseover = () => {
            button.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
          };
          button.onmouseout = () => {
            button.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          };
          button.onclick = () => {
            dialogueBox.style.display = 'none';
            if (option.callback) option.callback();
          };
          optionsContainer.appendChild(button);
        });
      } else {
        const continueButton = document.createElement('button');
        continueButton.textContent = '继续';
        continueButton.style.marginLeft = '10px';
        continueButton.style.padding = '8px 15px';
        continueButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        continueButton.style.border = 'none';
        continueButton.style.borderRadius = '5px';
        continueButton.style.color = 'white';
        continueButton.style.cursor = 'pointer';
        continueButton.style.transition = 'background-color 0.3s';
        continueButton.onmouseover = () => {
          continueButton.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        };
        continueButton.onmouseout = () => {
          continueButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        };
        continueButton.onclick = () => {
          dialogueBox.style.display = 'none';
          if (onComplete) onComplete();
        };
        optionsContainer.appendChild(continueButton);
      }

      dialogueBox.style.display = 'block';
      dialogueBox.style.opacity = '0';
      dialogueBox.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => {
        dialogueBox.style.transition = 'all 0.3s ease-out';
        dialogueBox.style.opacity = '1';
        dialogueBox.style.transform = 'translateX(-50%) translateY(0)';
      }, 0);
    }
  };
}


let path = 'classroom.splat';
viewer.addSplatScene(path, {
  'progressiveLoad': false
})
.then(() => {
  viewer.start();

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
            window.location.href = '../index.html';
          }
        }
    ]);
  });

  // // 初始化背包系统
  const inventory = new Inventory(threeScene, viewer.camera, dialogue);

  // 初始化交互式球体，包括预设摄像机的球体，传入inventory
  const interactiveSpheres = new InteractiveSpheres(threeScene, viewer.camera, viewer.controls, moveCameraToPreset, inventory);

  // 设置摄像机限制
  setupCameraLimits(viewer.camera, viewer.controls);

  // 初始化交互式长方体，传入背包系统
  const interactiveCuboids = new InteractiveCuboids(threeScene, viewer.camera, inventory);




});
 
// 修改 closePopup 函数
window.closePopup = function(popupId) {
  document.getElementById(popupId).style.display = 'none';
  window.isPopupOpen = false;
  window.lastPopupCloseTime = Date.now();
}
