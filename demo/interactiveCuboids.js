import * as THREE from 'three';

export class InteractiveCuboids {
    constructor(scene, camera, inventory) {
        this.scene = scene;
        this.camera = camera;
        this.inventory = inventory;
        this.cuboids = [];
        this.collectibleCuboids = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.popupElement = null;
        this.isPopupOpen = false;

        this.createCuboids();
        this.createCollectibleCuboids();
        this.setupMouseClickHandler();
    }

    createCuboids() {
        const cuboidData = [
            { position: [3.36821, -0.73349, -0.25008], size: [0.2, 0.17, 0.1], color: 0x00ff00, popupContent: "这是一摞书" },
            { position: [-0.40647, 6.32012, 0.32759], size: [0.1, 0.1, 0.17], color: 0x0000ff, popupContent: "这是一个黑板擦" },
            { position: [0.96195, 4.90784, -0.29436], size: [0.3, 0.3, 0.25], color: 0xff0000, popupContent: "这是一台电脑" },
            { position: [6.60907, 3.78306, 0.36370], size: [0.6, 1.2, 1.0], color: 0xff0000, popupContent: "再多看一眼就要爆炸" },
            { position: [6.61672, 2.22771, 0.37330], size: [0.6, 1.2, 1.0], color: 0xff0000, popupContent: "再靠近一点就要融化" },
            { position: [6.61253, 0.76913, 0.37655], size: [0.6, 1.2, 1.0], color: 0xff0000, popupContent: "Man,what can i say" },
            { position: [0.26010, 8.32017, -0.09837], size: [1.2, 0.1, 2.0], color: 0xff0000, popupContent: "门把手非常坚硬，拧不动..." },
            { position: [5.75930, 7.94055, -0.15382], size: [1.2, 0.2, 2.0], color: 0xff0000, popupContent: "芝士猞猁" },
            { position: [-0.16736, 0.65541, -0.03592], size: [0.45, 0.45, 1.6], color: 0xff0000, popupContent: "老师姓猫...猫老师。" }
            
        ];

        cuboidData.forEach(data => {
            const cuboid = this.createCuboid(data);
            this.cuboids.push(cuboid);
            this.scene.add(cuboid);
        });
    }

    createCollectibleCuboids() {
        const collectibleData = [
            { 
                position: [-0.50479, 6.68548, 0.10222], 
                size: [0.05, 0.3, 0.4], 
                color: 0xffff00, 
                item: "黑板上画着的小猫",
                description: "一些物理学公式...看来猫猫想教会我什么。那就看看整个教室还有哪里有猫。",
                index: 1  // 添加索引
            },
            { 
                position: [2.56846, 8.62764, -0.11970], 
                size: [0.1, 0.1, 0.1], 
                color: 0xffff00, 
                item: "提示栏下的小猫",
                description: "打开你的日记本看看。",
                index: 2  // 添加索引
            },
            { 
                position: [6.43424, 5.50968, 0.16329], 
                size: [0.1, 0.5, 0.4], 
                color: 0xffff00, 
                item: "白板上画着的小猫",
                description: "聪明的头脑，有趣的吐槽。多看书是有用的，吐槽起来很厉害。",
                index: 3  // 添加索引
            },
            // 可以添加更多物品...
        ];
    
        collectibleData.forEach(data => {
            const cuboid = this.createCuboid(data);
            cuboid.userData = {
                ...cuboid.userData,
                isCollectible: true,
                index: data.index,
                item: data.item,
                description: data.description
            };
            this.collectibleCuboids.push(cuboid);
            this.scene.add(cuboid);
        });
    }

    createCuboid(data) {
        const geometry = new THREE.BoxGeometry(...data.size);
        const material = new THREE.MeshBasicMaterial({
            color: data.color,
            transparent: true,
            opacity: 0.5,
            depthTest: false,
            depthWrite: false
        });
        const cuboid = new THREE.Mesh(geometry, material);
        cuboid.position.set(...data.position);
        cuboid.userData = { 
            popupContent: data.popupContent || data.item,
            clicked: false,
            originalColor: data.color,
            item: data.item,
            description: data.description
        };
        cuboid.renderOrder = 1;
        return cuboid;
    }
    setupMouseClickHandler() {
        window.addEventListener('click',  this.onMouseClick.bind(this));
    }
    onMouseClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const allCuboids = [...this.cuboids, ...this.collectibleCuboids];
        const intersects = this.raycaster.intersectObjects(allCuboids);

        if (intersects.length > 0) {
            const clickedCuboid = intersects[0].object;
            if (clickedCuboid.userData.isCollectible) {
                this.collectItem(clickedCuboid);
            } else if (!clickedCuboid.userData.clicked) {
                this.showPopup(clickedCuboid.userData.popupContent);
                clickedCuboid.userData.clicked = true;
            } else {
                this.showPopup("您已经探索过啦！");
            }
        }
    }
    
    collectItem(cuboid) {
        const item = cuboid.userData.item;
        const description = cuboid.userData.description;
        const index = cuboid.userData.index;  // 确保这里获取了正确的索引
        
        this.inventory.addItem(item, description, index);
        this.scene.remove(cuboid);
        const cuboidIndex = this.collectibleCuboids.indexOf(cuboid);
        if (cuboidIndex > -1) {
            this.collectibleCuboids.splice(cuboidIndex, 1);
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
