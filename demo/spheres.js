import * as THREE from 'three';


export const presetSpheresData = [
   
    { 
        position: [5.74181, 0.67967, 1.54196],
        color: 0xff00ff ,
        cameraPosition: [5.97439, 0.23169, 1.13111], 
        cameraLookAt: [5.73551, 0.33568, 1.07369],
        cameraUp:[0,0,1],
    },

    { position: [-0.91758, -0.32492, 1.72823], 
        color: 0xff00ff ,
        cameraPosition: [-0.60267, -0.36765, 1.63727], 
        cameraLookAt: [0.53551, 0.33568, 1.07369],
        cameraUp:[0,0,1],
    },
    { position: [-0.36753, 7.97139, 1.74179], 
        color: 0xff00ff, 
        cameraPosition: [-0.46551, 8.03568, 1.37369], 
        cameraLookAt: [0.53551, 7.03568, 1.07369], 
        cameraUp:[	0, 0, 1],
        
    },
    { position: [2.57174, 7.5, 0.38187], 
        color: 0xff00ff, 
        cameraPosition: [2.57174, 7.5, 0.38187], 
        cameraLookAt: [2.62850, 8.63988, 0.31696], 
        cameraUp:[	0, 0, 1],
        
    },
    { position: [-0.8, 3, 1.8], 
        color: 0xff00ff, 
        cameraPosition: [-0.89309, 3.11845, 1.52719], 
        cameraLookAt: [0, 3, 1.2], 
        cameraUp:[	0, 0, 1],
        
    }
];


export class InteractiveSpheres {
    constructor(scene, camera, controls, moveCameraToPreset, inventory) {
        this.scene = scene;
        this.camera = camera;
        this.controls = controls;
        this.moveCameraToPreset = moveCameraToPreset;
        this.inventory = inventory;
        this.spheres = [];
        this.presetSpheres = [];
        this.collectibleSpheres = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.popupElement = null;
        this.isPopupOpen = false;

        this.createSpheres();
        this.createPresetSpheres();
        this.createCollectibleSpheres();
        this.setupMouseClickHandler();
    }

    createSpheres() {
        const sphereGeometry = new THREE.SphereGeometry(0.1, 32, 32);
        const spheresData = [
            //{ color: 0xff0000, position: [2, 1, 1], popupContent: "恭喜！你点击了红色球体！" },没用到，可添加

        ];

        spheresData.forEach(data => {
            const sphereMaterial = new THREE.MeshBasicMaterial({
                color: data.color,
                transparent: true,
                opacity: 0.5,
                depthTest: false,
                depthWrite: false
            });
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(...data.position);
            sphere.userData = {
                popupContent: data.popupContent,
                clicked: false
            };
            sphere.renderOrder = 1; // 确保球体在splat模型之上渲染
            this.spheres.push(sphere);
            this.scene.add(sphere);
        });
    }

    createPresetSpheres() {
        const sphereGeometry = new THREE.SphereGeometry(0.1, 32, 32);
        presetSpheresData.forEach((data, index) => {
            const sphereMaterial = new THREE.MeshBasicMaterial({
                color: data.color,
                transparent: true,
                opacity: 0.5, // 降低不透明度以增加透明度
                depthTest: false,
                depthWrite: false
            });
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(...data.position);
            sphere.userData = { index: index };
            sphere.renderOrder = 1; // 确保球体在splat模型之上渲染
            this.presetSpheres.push(sphere);
            this.scene.add(sphere);
        });
    }

    createCollectibleSpheres() {
        const collectibleSpheres = [
            { position: [0.37241, 1.39569, -0.11733], color: 0xffff00, item: "显示小猫的电脑", description: "寻猫之旅？那再找找哪里有猫吧。", index: 4 },
            { position: [3.40181, -0.56848, -0.30827], color: 0xc0c0c0, item: "背靠书的小娃娃", description: "这个娃娃背靠知识睡得很舒服呢。这些书都是谁的？旁边有个人。", index: 5 },
            { position: [3.71766, 1.65740, 0.06463], color: 0xcd7f32, item: "猫猫发卡", description: "这竟然也是收集的猫猫之一！喜欢猫猫发卡的男生真是不多见。", index: 6 }
         ];
    
        const sphereGeometry = new THREE.SphereGeometry(0.1, 32, 32);
        collectibleSpheres.forEach((data) => {
            const sphereMaterial = new THREE.MeshBasicMaterial({
                color: data.color,
                transparent: true,
                opacity: 0.5,
                depthTest: false,
                depthWrite: false
            });
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(...data.position);
            sphere.userData = { 
                item: data.item, 
                description: data.description,
                isCollectible: true,
                index: data.index  // 添加索引
            };
            sphere.renderOrder = 1;
            this.collectibleSpheres.push(sphere);
            this.scene.add(sphere);
        });
    }

    setupMouseClickHandler() {
        window.addEventListener('click', this.onMouseClick.bind(this));
    }

    onMouseClick(event) {

        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    
        this.raycaster.setFromCamera(this.mouse, this.camera);
    
        const allSpheres = [...this.spheres, ...this.presetSpheres, ...this.collectibleSpheres];
        const intersects = this.raycaster.intersectObjects(allSpheres);
    
        if (intersects.length > 0) {
            const clickedSphere = intersects[0].object;
            if (clickedSphere.userData.isCollectible) {

                this.collectItem(clickedSphere);
            } else if (clickedSphere.userData.index !== undefined) {

                this.moveCameraToPreset(clickedSphere.userData.index, this.camera, this.controls);
            } else if (!clickedSphere.userData.clicked){
                this.showPopup(clickedSphere.userData.popupContent);
                clickedSphere.userData.clicked = true;  
            }else{
                this.showPopup("您已经探索过啦！");  
            }
            

        }
    }

    collectItem(sphere) {
        const item = sphere.userData.item;
        const description = sphere.userData.description;
        const index = sphere.userData.index;

        this.inventory.addItem(item, description, index);
        this.scene.remove(sphere);
        const sphereIndex = this.collectibleSpheres.indexOf(sphere);
        if (sphereIndex > -1) {
            this.collectibleSpheres.splice(sphereIndex, 1);
        }
        this.inventory.showCollectPopup(item,index);
        this.inventory.updateInventoryDisplay();
    }
    showPopup(content) {
        if (this.isPopupOpen) return; // 如果已有弹窗打开，则不再打开新弹窗
        this.isPopupOpen = true;
    
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        overlay.style.zIndex = '1002';
    
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.left = '50%';
        popup.style.top = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
        popup.style.backdropFilter = 'blur(10px)';
        popup.style.padding = '30px';
        popup.style.borderRadius = '10px';
        popup.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        popup.style.border = '1px solid rgba(255, 255, 255, 0.3)';
        popup.style.zIndex = '1003';
        popup.style.textAlign = 'center';
        popup.style.color = '#333';
        popup.style.fontFamily = 'Segoe UI, Arial, sans-serif';
        popup.style.transition = 'all 0.3s ease-in-out';
        popup.style.width = '300px';
    
        popup.innerHTML = `
            <h2 style="margin: 0 0 20px; font-size: 24px; color: #1e3a8a;">信息</h2>
            <p id="popupContent" style="font-size: 18px; line-height: 1.5; margin-bottom: 20px;">${content}</p>
            <div id="closeButton" style="position: absolute; top: 10px; right: 10px; width: 30px; height: 30px; border-radius: 50%; background-color: rgba(59, 130, 246, 0.8); color: white; display: flex; justify-content: center; align-items: center; cursor: pointer; opacity: 0; transition: opacity 0.3s ease;">
                <span style="position: relative; display: inline-block; width: 20px; height: 20px;">
                    <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg); width: 16px; height: 2px; background-color: white;"></span>
                    <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); width: 16px; height: 2px; background-color: white;"></span>
                </span>
                <span id="closeHint" style="position: absolute; top: 100%; right: 0; background-color: rgba(59, 130, 246, 0.8); color: white; padding: 5px 10px; border-radius: 5px; font-size: 14px; white-space: nowrap; opacity: 0; transition: opacity 0.3s ease;">点击关闭</span>
            </div>
        `;
    
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
    
        const closeButton = popup.querySelector('#closeButton');
        const closeHint = popup.querySelector('#closeHint');
    
        // 鼠标悬浮在弹窗上时显示关闭按钮
        popup.onmouseover = () => {
            closeButton.style.opacity = '1';
        };
        popup.onmouseout = () => {
            closeButton.style.opacity = '0';
            closeHint.style.opacity = '0';
        };
    
        // 鼠标悬浮在关闭按钮上时显示提示
        closeButton.onmouseover = () => {
            closeHint.style.opacity = '1';
        };
        closeButton.onmouseout = () => {
            closeHint.style.opacity = '0';
        };
    
        // 点击关闭弹窗
        const closePopup = () => {
            document.body.removeChild(overlay);
            this.isPopupOpen = false;
        };
    
        closeButton.onclick = closePopup;
    
        // 添加动画效果
        setTimeout(() => {
            popup.style.opacity = '0';
            popup.style.transform = 'translate(-50%, -50%) scale(0.95)';
            popup.offsetHeight; // 触发重绘
            popup.style.opacity = '1';
            popup.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 0);
    }
 }