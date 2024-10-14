// 全局状态管理
const globalState = {
    popupCooldown: 200, // 200ms 冷却时间
    lastPopupCloseTime: 0,
    isPopupCooldown: function() {
        return Date.now() - this.lastPopupCloseTime < this.popupCooldown;
    },
    setLastPopupCloseTime: function() {
        this.lastPopupCloseTime = Date.now();
    }
};

export default globalState;