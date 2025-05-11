# 这个项目通过创建各种分支，来学习Cloudflare的用法

我想建一个简单的Cloudflare pages+pages fun+D1的网站，其中Cloudflare pages前端用next.js开发，使用typescript（可能需要用到@cloudflare/next-on-pages），前端内容尽量简单。
先完成本地化测试，在实际部署的时候先将项目推送到github上，然后再通过Cloudflare网页端部署Cloudflare pages。Cloudflare D1数据库也通过网页端进行创建。
现在我们先讨论好需求 ，并最终形成一个提交给AI编程的prompt，不要直接开始编码。
另外需要注意我不太懂编程和相关配置，基本完全要依靠AI来完成。



**项目名称：** 每日一句 (Quote of the Day) - 基于 Cloudflare Pages, Next.js, Pages Functions 和 D1

**项目目标：**
创建一个简单的网页应用，用户每次访问或点击按钮时，会显示一条不同的名言。

**技术栈：**
*   前端：Next.js (使用 App Router, TypeScript)
*   后端：Cloudflare Pages Functions (TypeScript)
*   数据库：Cloudflare D1
*   部署：Cloudflare Pages (通过 GitHub 集成)
*   适配器：`@cloudflare/next-on-pages`

**详细需求：**

**1. 前端页面 (Next.js - `app/page.tsx`):**
    *   布局与样式：
        *   页面整体内容垂直居中、水平居中。
        *   不显示任何固定的页面标题。
        *   名言 (Quote Text)：显著、居中显示。
        *   作者 (Author)：在名言下方居中显示。如果当前名言没有作者，则不显示作者区域。
        *   “Next” 按钮：按钮文本为 "Next"，固定在页面的右下角。点击后更新名言。
    *   交互逻辑：客户端组件处理状态和事件，调用后端 API。

**2. 后端 API (Cloudflare Pages Function - `functions/api/quote.ts` 或类似路径):**
    *   API 端点：`/api/quote` (GET 请求)
    *   功能：连接 D1，随机查询 `quotes` 表，返回 JSON (`{ "text": "...", "author": "..." }`)。处理错误或无数据情况。
    *   环境绑定：能正确访问通过 `wrangler.toml` 中 `binding = "DB"` 定义的 D1 数据库。

**3. Cloudflare D1 数据库:**
    *   表结构 (`quotes` 表): `id` (PK, AUTOINCREMENT), `text` (TEXT NOT NULL), `author` (TEXT)。
    *   初始数据 (SQL INSERT 语句，用于 `schema.sql`):
        ```sql
        CREATE TABLE IF NOT EXISTS quotes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            author TEXT
        );
        INSERT INTO quotes (text, author) VALUES
        ('The only way to do great work is to love what you do.', 'Steve Jobs'),
        ('Strive not to be a success, but rather to be of value.', 'Albert Einstein'),
        ('The mind is everything. What you think you become.', 'Buddha'),
        ('路漫漫其修远兮，吾将上下而求索。', '屈原'),
        ('温故而知新，可以为师矣。', '孔子');
        ```
    *   AI 将生成一个 `schema.sql` 文件包含以上内容。

**4. 项目结构与配置：**
    *   标准的 Next.js (App Router) 项目结构。
    *   `package.json` 包含 `next`, `react`, `@cloudflare/next-on-pages`, `wrangler` 等依赖。
    *   `wrangler.toml` 文件配置：
        ```toml
        name = "quote-of-the-day" # AI 可以建议或让用户后续修改
        compatibility_date = "YYYY-MM-DD" # AI 会填入一个近期的日期

        [[d1_databases]]
        binding = "DB" # 在 Pages Function 代码中引用的绑定名称
        # 以下两个字段的生产值将在 Cloudflare Pages 控制台进行安全设置，此处为占位符
        database_name = "PRODUCTION_DB_NAME_PLACEHOLDER"
        database_id = "PRODUCTION_DB_ID_PLACEHOLDER"
        # preview_database_id 用于本地开发时的 wrangler dev
        # AI 会建议一个名称，例如 "quote_preview_db"
        preview_database_id = "quote_preview_db"
        ```
        *AI 需要强调，`PRODUCTION_DB_NAME_PLACEHOLDER` 和 `PRODUCTION_DB_ID_PLACEHOLDER` 是占位符，用户**不应**在 `wrangler.toml` 中手动修改它们为生产值。生产环境的绑定在 Cloudflare UI 中完成。*
    *   提供 `tsconfig.json` 的基本配置。

**5. 开发与部署步骤说明 (给用户的提示):**
    *   **本地开发:**
        1.  安装依赖: `npm install`
        2.  创建 `schema.sql` 文件（AI 会生成此文件）。
        3.  创建本地 D1 预览数据库 (使用 `wrangler.toml` 中的 `preview_database_id`): `npx wrangler d1 create quote_preview_db --local` (如果 `preview_database_id` 不同，则替换)
        4.  将 schema 应用到本地预览数据库: `npx wrangler d1 execute quote_preview_db --local --file=./schema.sql`
        5.  启动 Next.js 开发服务器 (用于 `@cloudflare/next-on-pages` 构建和预览): `npm run dev` (AI 需确保 `package.json` 中的 `dev` 脚本配置为类似 `npx wrangler pages dev .vercel/output/static --d1=DB` 或 `@cloudflare/next-on-pages` 推荐的本地开发命令)。
    *   **部署到 Cloudflare Pages:**
        1.  将项目代码推送到 GitHub 仓库。
        2.  在 Cloudflare 控制台：
            *   创建一个新的 **生产用 D1 数据库** (例如，可以命名为 `prod-quotes-db`)。
            *   在该生产 D1 数据库的控制台中，执行 `schema.sql` 里的 SQL 语句来建表和插入初始名言。
            *   创建一个新的 Cloudflare Pages 项目，连接到 GitHub 仓库。
            *   在 Pages 项目的 "Settings" -> "Build & deployments" 中配置构建命令 (例如 `npm run build`，其中 `build` 脚本应为 `npx @cloudflare/next-on-pages`) 和输出目录 (通常是 `.vercel/output/static` 或由 `@cloudflare/next-on-pages` 指定的)。
            *   在 Pages 项目的 "Settings" -> "Functions" -> "D1 database bindings" 中，点击 "Add binding"。
                *   **Binding name:** `DB` (与 `wrangler.toml` 和代码中使用的名称一致)。
                *   **D1 database:** 选择您刚刚创建的那个 **生产用 D1 数据库**。
            *   触发部署。

**给用户的额外建议 (由 AI 在生成代码后一并提供):**
*   如何初始化 Git 仓库并将代码推送到 GitHub。
*   再次强调 `wrangler.toml` 中的 `PRODUCTION_DB_NAME_PLACEHOLDER` 和 `PRODUCTION_DB_ID_PLACEHOLDER` 是占位符，实际生产绑定在 Cloudflare Pages UI 中完成。
*   本地开发时，`wrangler d1 execute <preview_db_name> --local --file=./schema.sql` 命令可以重复执行以重置本地数据。