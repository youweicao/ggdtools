<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <title>登录页面</title>
    <style>
        body {
            font-family: Arial;
            background: #f5f5f5;
        }

        .login-box {
            width: 320px;
            margin: 100px auto;
            padding: 20px;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        input {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
        }

        button {
            width: 100%;
            padding: 10px;
            background: #007bff;
            color: white;
            border: none;
            cursor: pointer;
        }

        button:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>

<div class="login-box">
    <h2>用户登录</h2>

    <form action="/api/login.php" method="POST">
        <input type="email" id="email" placeholder="邮箱" required>
        <input type="password" id="password" placeholder="密码" required>
        <button type="button" onclick="login()">登录</button>

        <pre id="result"></pre>
    </form>
</div>

<script>
    function login() {
        fetch('/api/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            })
        })
        .then(res => res.json())
        .then(res => {
            window.location.href = '/'; // 登录成功后跳转到主页
        })
    }
</script>
</body>
</html>