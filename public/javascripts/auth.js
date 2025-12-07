//註冊
const signupBtn = document.getElementById("signup-btn");
if (signupBtn) {
    signupBtn.addEventListener("click", async () => {
        const username = document.getElementById("signup-username").value;
        const password = document.getElementById("signup-password").value;
        const msg = document.getElementById("signup-message");

        const res = await fetch("/auth/signup", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (data.success) {
            msg.style.color = "green";
            msg.textContent = "Sign-up successful! Redirecting to login...";
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1200);
        } else {
            msg.style.color = "red";
            msg.textContent = data.message;
        }
    });
}

//登入
const loginBtn = document.getElementById("login-btn");
if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;
        const msg = document.getElementById("login-message");

        const res = await fetch("/auth/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (data.success) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.username);
            msg.style.color = "green";
            msg.textContent = "Login successful! Redirecting to the homepage...";
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1200);
        } else {
            msg.style.color = "red";
            msg.textContent = data.message;
        }
    });
}
