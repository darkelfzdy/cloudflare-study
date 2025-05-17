import { NextRequest, NextResponse } from 'next/server';
// 推荐安装 @cloudflare/workers-types 以获取官方类型定义
// npm install -D @cloudflare/workers-types
import type { D1Database } from '@cloudflare/workers-types';

export const runtime = 'edge';

interface Quote {
  text: string;
  author?: string | null;
}

// 移除 context 参数，通过 process.env 访问绑定
export async function GET(request: NextRequest) { // 也可以使用标准的 Request 类型

  // 通过 process.env 访问 D1 绑定
  // 使用类型断言确保 TypeScript 知道 process.env.DB 是 D1Database 类型
  const db = process.env.DB as D1Database;

  // 检查绑定是否存在（虽然类型错误通常先发生，但这是一个好的实践）
  if (!db) {
     return NextResponse.json({ error: 'D1 binding not found. Ensure DB is bound in Cloudflare Pages settings.' }, { status: 500 });
  }

  try {
    const { results } = await db.prepare(
      'SELECT text, author FROM quotes ORDER BY RANDOM() LIMIT 1;'
    ).all();

    if (!results || results.length === 0) {
      // 使用 NextResponse.json 更方便处理 JSON 响应
      return NextResponse.json(
        { error: 'No quote found.' },
        { status: 404 }
      );
    }

    const row = results[0] as Quote; // 根据查询结果结构断言类型
    const result: Quote = {
      text: row.text,
      author: row.author ?? undefined,
    };

    return NextResponse.json(result, {
       headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error("Database query failed:", err); // 打印详细错误到日志
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// 如果你安装了 @cloudflare/workers-types，就不需要自己定义 D1Database 接口了
// interface D1Database { ... }