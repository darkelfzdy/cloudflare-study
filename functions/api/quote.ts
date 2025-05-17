export const config = {
  runtime: 'edge',
};

interface Quote {
  text: string;
  author?: string | null;
}

export default async function handler(request: Request, env: { DB: D1Database }) {
  try {
    // 查询 D1 数据库
    const { results } = await env.DB.prepare(
      'SELECT text, author FROM quotes ORDER BY RANDOM() LIMIT 1;'
    ).all();

    if (!results || results.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No quote found.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const row = results[0];
    const result: Quote = {
      text: row.text,
      author: row.author ?? undefined,
    };
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Cloudflare D1 类型声明（可选，辅助类型推断）
interface D1Database {
  prepare: (query: string) => {
    all: (binds?: unknown[]) => Promise<{ results: any[] }>;
  };
}