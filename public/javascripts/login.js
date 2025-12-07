document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("login-btn");
    if (!loginBtn) return;

    //判斷token是否過期
    function isTokenExpired(token) {
        if (!token) return true;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return Date.now() >= payload.exp * 1000;
        } catch (e) {
            return true;
        }
    }

    function updateButton() {
        const token = localStorage.getItem("token");
        const username = localStorage.getItem("username");

        // 移除舊的 greeting
        let oldGreeting = document.getElementById("greeting");
        if (oldGreeting) oldGreeting.remove();

        if (token && !isTokenExpired(token)) {
            // 建立 greeting span
            const greeting = document.createElement("span");
            greeting.id = "greeting";
            greeting.textContent = `Hi, ${username || "User"}! |`;
            greeting.style.marginRight = "10px";

            // 插入到按鈕前面
            loginBtn.parentNode.insertBefore(greeting, loginBtn);

            loginBtn.textContent = "Logout";
            loginBtn.onclick = () => {
                localStorage.removeItem("token");
                localStorage.removeItem("username");
                location.reload();
            };
        } else {
            // token 過期或不存在
            localStorage.removeItem("token");
            localStorage.removeItem("username");

            loginBtn.textContent = "Login";
            loginBtn.onclick = () => {
                window.location.href = "/login.html";
            };
        }
    }

    updateButton();
});
