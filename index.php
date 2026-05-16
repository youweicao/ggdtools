<?php
session_start();
?>

<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Goose Goose Duck 工具箱</title>
    <link rel="stylesheet" href="css/index.css">
    <script src="js/index.js" defer></script>
</head>


<body>

    <header class="header">
        <div style="display: flex; align-items: center; gap: 15px;">
            <div class="menu-btn" id="menuBtn">☰</div>
            <h2 style="font-size: 1.2rem; color: var(--primary-color);" onclick="window.location.href='?page=dashboard'">Goose Goose Duck 工具箱</h2>
        </div>
        <div class="user-info">
            <?php if (!empty($_SESSION['username'])): ?>
                <span><?php echo htmlspecialchars($_SESSION['username']); ?></span>
                <span>|</span>
                <a href="?page=logout">退出登录</a>
                <div class="avatar"></div>
            <?php else: ?>
                <span class="guest">未登录</span>
                <a href="?page=login" class="login-btn">登录</a>
            <?php endif; ?>
        </div>
    </header>

    <div class="wrapper">
        <div class="overlay" id="overlay"></div>
        
    <aside class="sidebar" id="sidebar">
        <nav>
            <ul>
                <li><a href="?page=dashboard">仪表盘</a></li>
                <li><a href="?page=profile">个人信息</a></li>
                <li><a href="?page=matches">对局信息</a></li>
                <li><a href="?page=match-details">对局复盘</a></li>
                <li><a href="?page=analysis">大数据分析</a></li>
            </ul>
        </nav>
    </aside>

        <main class="content">
            <?php

            $page = $_GET['page'] ?? '';

            switch ($page) {
                case '':
                case 'dashboard':
                    include 'views/dashboard.php';
                    break;
                case 'login':
                    include 'views/login.php';
                    break;
                case 'profile':
                    include 'views/profile.php';
                    break;
                case 'matches':
                    include 'views/matches.php';
                    break;
                case 'match-details':
                    include 'views/match-details.php';
                    break;
                case 'analysis':
                    include 'views/analysis.php';
                    break;
                case 'logout':
                    session_destroy();
                    header("Location: ?page=login");
                    exit;
                default:
                    echo "<h2>页面未找到，<a href='?page=dashboard'>点击回到首页</a></h2>";
            }
            ?>
            <!-- <div class="card">
                <h3>欢迎回来！</h3>
                <p style="margin-top: 15px; color: #666; line-height: 1.6;">
                    这是一个自适应的页面结构。在 PC 端，左侧菜单保持可见；在手机端，点击左上角图标即可滑出菜单。
                </p>
            </div> -->
        </main>
    </div>

</body>
</html>