# 每日一句（Quote of the Day）

基于 **Next.js (App Router)**、**Cloudflare Pages**、**Cloudflare D1** 的名言展示应用。支持本地开发、D1 数据库操作与一键部署到 Cloudflare Pages。

---

## 目录

- [功能简介](#功能简介)
- [本地开发与 D1 数据库操作指南](#本地开发与-d1-数据库操作指南)
  - [1. 环境准备](#1-环境准备)
  - [2. 安装依赖](#2-安装依赖)
  - [3. 本地 D1 数据库初始化与操作](#3-本地-d1-数据库初始化与操作)
  - [4. 本地开发与调试](#4-本地开发与调试)
  - [5. 本地端到端预览（Cloudflare Pages 模拟环境）](#5-本地端到端预览-cloudflare-pages-模拟环境)
  - [6. 常见问题与排查](#6-常见问题与排查)
- [Cloudflare Pages 部署指南](#cloudflare-pages-部署指南)
  - [1. 生产 D1 数据库创建与初始化](#1-生产-d1-数据库创建与初始化)
  - [2. Cloudflare Pages 项目创建与配置](#2-cloudflare-pages-项目创建与配置)
  - [3. 生产 D1 绑定（重点）](#3-生产-d1-绑定重点)
  - [4. 部署与验证](#4-部署与验证)
- [附录：常用命令速查](#附录常用命令速查)
- [参考文档](#参考文档)

---

## 功能简介

- 随机展示一条名言，支持中英文。
- 支持 Cloudflare D1 数据库存储与查询。
- “Next” 按钮可刷新获取新名言。
- 前端使用 Next.js + Tailwind CSS，后端 API 由 Next.js API Route 适配为 Cloudflare Pages Functions。

---

## 本地开发与 D1 数据库操作指南

### 1. 环境准备

- Node.js 18+（建议 LTS 版本）
- npm 9+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)（无需全局安装，已通过 devDependencies 管理）

### 2. 安装依赖

```bash
npm install
```

### 3. 本地 D1 数据库初始化与操作

#### 3.1 创建本地 D1 预览数据库

```bash
npm run db:create:local  # 如遇参数报错，仅保留基本命令即可，兼容所有 wrangler 版本
```
- 成功后 `.wrangler/state/d1/` 目录下会生成 `quote_preview_db` 文件。

#### 3.2 应用数据库 schema（建表与初始数据）

```bash
npm run db:schema:apply:local
```
- 该命令会将 [`schema.sql`](schema.sql) 中的表结构和初始数据写入本地 D1 数据库。

#### 3.3 查询/调试本地 D1 数据库

```bash
npm run db:query:local -- "SELECT * FROM quotes;"
```
- 可用于任意 SQL 查询，双引号内为 SQL 语句。

#### 3.4 重置本地数据库

如需重置数据，重复执行 `npm run db:schema:apply:local` 即可。

### 4. 本地开发与调试

#### 4.1 启动 Next.js 本地开发服务器

```bash
npm run dev
```
- 仅用于前端和 API 路由结构开发，**不支持 D1 真实绑定**，API 会返回模拟数据。

#### 4.2 端到端本地预览（Cloudflare Pages 环境模拟，含 D1 绑定）

```bash
npm run preview
```
- 实际执行：
  1. `npm run pages:build`（用 @cloudflare/next-on-pages 构建产物）
  2. `wrangler pages dev .vercel/output/static --d1=DB`
- 该模式下，API Route 可真实访问本地 D1 数据库，**强烈建议在此模式下做端到端测试**。
- 访问提示的本地地址（如 http://localhost:8788 ）。

### 5. 本地开发流程建议

1. 修改前端/后端代码后，优先用 `npm run dev` 快速开发。
2. 需要联调 D1 数据库时，停止 dev，执行 `npm run preview` 进行完整端到端测试。

### 6. 常见问题与排查

- **wrangler pages dev 启动失败**（如 MiniflareCoreError）：  
  - 升级 wrangler：`npm install wrangler@latest --save-dev`
  - 检查 Node.js 版本，建议使用官方 LTS。
  - 检查是否有 nvm、nvs 等 Node 版本管理工具冲突。
  - 参考 [wrangler issues](https://github.com/cloudflare/wrangler2/issues)。

- **API 无法访问 D1**：  
  - 请确保通过 `npm run preview` 启动，且本地数据库已初始化。

---

## Cloudflare Pages 部署指南

### 1. 生产 D1 数据库创建与初始化

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2. 进入 "Workers & Pages" → "D1" → "Create database"。
3. 命名（如 `prod-quotes-db`），选择区域，创建。
4. 在数据库控制台执行 [`schema.sql`](schema.sql) 内容，完成建表与初始数据插入。

### 2. Cloudflare Pages 项目创建与配置

1. 推送代码到 GitHub（或其他支持的 Git 平台）。
2. Cloudflare Pages → "Create application" → "Connect to Git"。
3. 配置：
   - **Build command:** `npm run build`
   - **Build output directory:** `.vercel/output/static`
   - **Root directory:** （如 package.json 在根目录可留空）

### 3. 生产 D1 绑定（重点）

- **切勿在 wrangler.toml 中填写生产数据库真实名称和 ID！**
- 部署后，进入 Pages 项目 → Settings → Functions → D1 database bindings：
  - **Binding name:** `DB`
  - **D1 database:** 选择刚创建的生产数据库
- 保存后，重新部署。

### 4. 部署与验证

1. 触发部署（如推送新 commit）。
2. 部署完成后访问生产地址，测试功能。
3. 如需重置生产数据，可在 D1 控制台重新执行 schema.sql。

---

## 附录：常用命令速查

| 操作                | 命令                                                         |
|---------------------|--------------------------------------------------------------|
| 安装依赖            | `npm install`                                                |
| 本地 D1 创建        | `npm run db:create:local  # 如遇参数报错，仅保留基本命令即可，兼容所有 wrangler 版本`                                    |
| 本地 D1 应用 schema | `npm run db:schema:apply:local`                              |
| 本地 D1 查询        | `npm run db:query:local -- "SELECT * FROM quotes;"`          |
| 本地开发            | `npm run dev`                                                |
| 本地端到端预览      | `npm run preview`                                            |
| 构建产物            | `npm run build`                                              |
| 代码检查            | `npm run lint`                                               |

---

## 参考文档

- [Cloudflare D1 官方文档](https://developers.cloudflare.com/d1/)
- [Cloudflare Pages + Next.js 指南](https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/)
- [@cloudflare/next-on-pages](https://www.npmjs.com/package/@cloudflare/next-on-pages)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Next.js 官方文档](https://nextjs.org/docs)

---

如有问题，欢迎查阅上述文档或在 issues 区反馈。
