const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("toggle-btn");
const content = document.getElementById("content");

// 判斷是否為小螢幕
function isSmallScreen() {
    return window.innerWidth <= 768;
}

// 根據 localStorage 記錄套用 sidebar 先前狀態
function applySavedState() {
    if (isSmallScreen()) { // 小螢幕模式
        const smallState = localStorage.getItem("sidebarSmallState");
        if (smallState === "open") {
            sidebar.classList.add("open");
        } else {
            sidebar.classList.remove("open");
        }
        sidebar.classList.remove("collapsed");
    } else { // 大螢幕模式
        const largeState = localStorage.getItem("sidebarLargeState");
        if (largeState === "collapsed") {
            sidebar.classList.add("collapsed");
        } else {
            sidebar.classList.remove("collapsed");
        }
        sidebar.classList.remove("open");
    }

    // 套用完狀態後，再顯示元素，避免閃動
    sidebar.style.visibility = "visible";
    content.style.visibility = "visible";
    toggleBtn.style.visibility = "visible";
}

// 漢堡按鈕點擊
toggleBtn.addEventListener("click", () => {
    if (isSmallScreen()) {
        // 小螢幕：切換 open
        sidebar.classList.toggle("open");
        const isOpen = sidebar.classList.contains("open");
        localStorage.setItem("sidebarSmallState", isOpen ? "open" : "closed"); // 保存狀態
    } else {
        // 大螢幕：切換 collapsed
        sidebar.classList.toggle("collapsed");
        const isCollapsed = sidebar.classList.contains("collapsed");
        localStorage.setItem("sidebarLargeState", isCollapsed ? "collapsed" : "expanded"); // 保存狀態
    }
});

// 初始先隱藏 sidebar
sidebar.style.visibility = "hidden";
content.style.visibility = "hidden";
toggleBtn.style.visibility = "hidden";

// 瀏覽器 resize 時，重新套用保存的狀態
window.addEventListener("resize", () => {
    applySavedState();
});

// 初次載入
applySavedState();
