export const runtime = 'edge';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 代理请求到 Pages Function
    const res = await fetch('https://cloudflare-study-a1e.pages.dev/functions/api/quote', {
      // 若本地开发可用相对路径
      // const res = await fetch('http://localhost:8788/functions/api/quote', {
      headers: {
        // 可根据需要传递 headers
      },
      // 生产环境下建议加上 cache: 'no-store'
      cache: 'no-store',
    });

    if (!res.ok) {
      const data = await res.json();
      return NextResponse.json({ error: data.error || '获取名言失败' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || '网络错误' }, { status: 500 });
  }
}