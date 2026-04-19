# Goose Goose Duck game reply tools | 鹅鸭杀（国际服）复盘工具

## React 后台管理系统

当前仓库已经补充一套前后端分离的后台管理系统：

- 前端：React + Vite + React Router
- 后端：Express + MySQL + JWT
- 布局：桌面端与移动端响应式适配
- 登录：从 `127.0.0.1:3306` 的 `ggdtools.user` 表读取用户数据
- 路由：支持 `/user/:id`、`/game/:id`、`/details/:id`

## 目录结构

```text
.
├── client   # React 管理后台
├── server   # Express API 与 MySQL 登录鉴权
└── package.json
```

## 启动方式

1. 安装依赖

```bash
npm install
```

2. 配置后端环境变量

```bash
cp server/.env.example server/.env
```

按你的本地 MySQL 实际账号修改这些字段：

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=ggdtools
```

当前库里 `ggdtools.user` 的字段默认为 `id`、`name`、`password`，所以默认配置已经对齐；如果你后面改了表结构，再同步修改：

```env
AUTH_TABLE=user
AUTH_ID_FIELD=id
AUTH_USERNAME_FIELD=name
AUTH_PASSWORD_FIELD=password
AUTH_DISPLAY_FIELD=name
AUTH_PASSWORD_HASHED=false
```

3. 启动前后端

```bash
npm run dev
```

默认地址：

- 前端：http://localhost:5173
- 后端：http://localhost:3000

## 已实现能力

- 登录页
- 登录后页面访问控制
- JWT 持久化登录态
- 动态参数路由页面
- 受保护的接口访问
- 移动端抽屉式侧边导航

## 示例路由

- `/dashboard`
- `/user/1`
- `/game/1`
- `/details/1`
