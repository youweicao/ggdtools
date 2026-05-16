# 🦢 GGD Tools - Goose Goose Duck Match Analyzer

## 📌 项目简介

GGD Tools 是一个用于《鹅鸭杀（Goose Goose Duck）》对局数据分析与管理的 Web 工具系统。
系统采用 PHP MVC 架构，实现对局记录查询、账号信息查看、对局详情分析等功能，并支持多语言本地化展示。

主要目标：

* 对局数据可视化与结构化分析
* 玩家账号与历史记录查询
* 支持中文 / 英文界面
* 轻量级部署（Apache / Nginx + PHP）

---

## 🏗️ 技术栈

* **后端**：PHP（MVC结构）
* **前端**：HTML + CSS + JavaScript
* **数据格式**：JSON（本地化 + API响应）
* **架构模式**：MVC（Model / View / Controller）
* **部署环境**：Linux + Apache/Nginx + PHP-FPM

---

## 📁 项目结构

```
.
├── api/                  # 后端 API 接口
│   ├── getAccount.php     # 获取用户信息
│   ├── getMatchDetails.php # 获取对局详情
│   ├── getMatches.php     # 获取对局列表
│   └── login.php          # 登录接口
│
├── assets/               # 静态资源
│   ├── cn.json           # 中文语言包
│   └── en.json           # 英文语言包（注意文件名修正）
│
├── controllers/         # 控制器层（业务逻辑）
├── models/              # 数据模型层
│
├── views/               # 页面视图
│   ├── analysis.php     # 数据分析页
│   ├── login.php        # 登录页
│   ├── match-details.php # 对局详情页
│   ├── matches.php      # 对局列表页
│   └── profile.php      # 用户信息页
│
├── css/
│   └── index.css        # 全局样式
│
├── js/
│   └── index.js         # 前端逻辑
│
└── index.php            # 入口文件（路由分发）
```

---

## 🚀 功能说明

### 1️⃣ 用户系统

* 邮箱登录
* Session 状态保持
* Token 存储（Firebase / 自定义认证）

### 2️⃣ 对局列表

* 获取历史对局列表
* 支持分页 / 过滤
* 展示基础统计信息

### 3️⃣ 对局详情分析

* 玩家角色分布（鹅 / 鸭 / 中立）
* 回合时间线
* 行为记录分析

### 4️⃣ 用户信息页

* 玩家基础信息
* 历史战绩统计

### 5️⃣ 多语言支持

通过 `assets/cn.json` 和 `assets/en.json` 控制：

示例：

```json
{
  "ROLES": {
    "GOOSE": "鹅",
    "DUCK": "鸭"
  },
  "GAME_MODES": {
    "CLASSIC": "经典模式"
  }
}
```

---

## 🔐 登录机制说明

* 前端提交邮箱 + 密码
* `/api/login.php` 调用认证服务（如 Firebase）
* 成功后返回 `idToken`
* PHP 使用 `$_SESSION["token"]` 保存登录态

---

## ⚙️ 运行环境

### 依赖要求

* PHP >= 7.4
* Apache / Nginx
* 开启 session 支持
* JSON 扩展

### 推荐配置（Linux）

```bash
sudo apt install apache2 php php-cli php-json php-curl
```

---

## 🧪 快速启动

```bash
cd /var/www/ggdtools
sudo systemctl restart apache2
```

访问：

```
http://localhost/index.php
```

---

## 🧭 路由说明（MVC风格）

| 页面   | 地址                            |
| ---- | ----------------------------- |
| 登录页  | `/?page=login`                |
| 对局列表 | `/?page=matches`              |
| 对局详情 | `/?page=match-details&id=xxx` |
| 用户信息 | `/?page=profile`              |
| 数据分析 | `/?page=analysis`             |

---

## 📊 API 接口说明

### 获取对局列表

```
GET /api/getMatches.php
```

### 获取对局详情

```
GET /api/getMatchDetails.php?id=xxx
```

### 获取用户信息

```
GET /api/getAccount.php
```

### 登录

```
POST /api/login.php
Content-Type: application/json
```

---

## 🌍 本地化机制

系统通过 `assets/cn.json` / `assets/en.json` 实现 UI 文本替换：

前端逻辑：

```js
const lang = "cn"; 
fetch(`/assets/${lang}.json`)
```

---

## 🔧 开发说明

### MVC建议规范

* `models/`：只处理数据请求（API / DB）
* `controllers/`：业务逻辑处理
* `views/`：纯展示，不写业务逻辑
* `api/`：外部接口层

---

## ⚠️ 已知问题

* `assets/en,json` 文件名错误（应为 `en.json`）
* session 在部分环境需配置 `session.save_path`
* API 未统一错误码标准

---

## 📌 后续优化方向

* [ ] 引入统一 Router
* [ ] API 返回标准化（code / message / data）
* [ ] 前端改为 SPA（可选 Vue/React）
* [ ] 增加缓存层（Redis）
* [ ] 对局分析算法优化
* [ ] 权限系统（管理员 / 普通用户）

---

## 📄 License

MIT License

---

如果你需要，我可以再帮你升级一版👇
✅ “论文级系统设计说明书版 README”
✅ “带架构图 + 时序图版本”
✅ “可以直接放 GitHub 首页的高级 Markdown UI 版本”
