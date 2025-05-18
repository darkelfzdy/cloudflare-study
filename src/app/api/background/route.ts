// src/app/api/background/route.ts

import { NextResponse } from 'next/server';
// 引入 R2Bucket 类型
import type { R2Bucket } from '@cloudflare/workers-types';

// 设置为 Edge Runtime
export const runtime = 'edge';

// 硬编码图片文件名列表
const imageFilenames = [
  'bingimg_20250411_UHD.jpg', // <-- 请替换为您的 R2 Bucket 中的实际文件名
  'bingimg_20250514_UHD.jpg',
  'bingimg_20250516_UHD.jpg',
  'bingimg_20250517_UHD.jpg',
  // ... 添加更多图片文件名
];

export async function GET() {
  // 访问 R2 Bucket 绑定
  const bucket = process.env.BACKGROUND_IMAGES as R2Bucket;

  // 检查绑定是否存在
  if (!bucket) {
    console.error("R2 binding 'BACKGROUND_IMAGES' not found in process.env.");
    return NextResponse.json(
      { error: 'R2 Bucket binding not configured.' },
      { status: 500 }
    );
  }

  try {
    // 随机选择一个图片文件名
    const randomFilename = imageFilenames[Math.floor(Math.random() * imageFilenames.length)];

    // 从 R2 Bucket 获取图片对象
    // get() 方法返回 R2ObjectBody，它是一个 ReadableStream
    const object = await bucket.get(randomFilename);

    // 如果图片不存在
    if (!object) {
      console.error(`Image '${randomFilename}' not found in R2 bucket.`);
      return NextResponse.json(
        { error: `Image '${randomFilename}' not found.` },
        { status: 404 }
      );
    }

    // 返回图片数据作为响应
    // object.body 是 ReadableStream
    // object.httpMetadata 包含 Content-Type 等信息，直接返回可以利用 R2 的缓存和正确设置响应头
    return new Response(object.body, {
      headers: {
        ...object.httpMetadata, // 包含 Content-Type 等
        'Cache-Control': 'public, max-age=3600', // 示例缓存控制
      },
    });

  } catch (err: any) {
    console.error("Error fetching image from R2:", err);
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}