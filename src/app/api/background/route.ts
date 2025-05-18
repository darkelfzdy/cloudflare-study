// src/app/api/background/route.ts

import { NextResponse } from 'next/server';
// 引入 R2Bucket 类型
import type { R2Bucket } from '@cloudflare/workers-types';
// 引入标准的 ReadableStream 类型
// 尽管 lib 中已包含，但显式导入或使用 unknown 断言更清晰
// import type { ReadableStream } from 'stream/web'; // 如果需要显式导入

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
    // get() 方法返回 R2ObjectBody，它有一个 body 属性，类型是 ReadableStream
    const object = await bucket.get(randomFilename);

    // 如果图片不存在
    if (!object) {
      console.error(`Image '${randomFilename}' not found in R2 bucket.`);
      return NextResponse.json(
        { error: `Image '${randomFilename}' not found.` },
        { status: 404 }
      );
    }

    // --- 修改这里：手动构建 Headers 对象 ---
    const headers = new Headers();

    // 复制 R2HTTPMetadata 中相关的字符串头
    if (object.httpMetadata) {
        if (object.httpMetadata.contentType) {
            headers.set('Content-Type', object.httpMetadata.contentType);
        }
        if (object.httpMetadata.contentLanguage) {
            headers.set('Content-Language', object.httpMetadata.contentLanguage);
        }
        if (object.httpMetadata.contentDisposition) {
            headers.set('Content-Disposition', object.httpMetadata.contentDisposition);
        }
        if (object.httpMetadata.contentEncoding) {
            headers.set('Content-Encoding', object.httpMetadata.contentEncoding);
        }
        // R2 的 cacheControl 是一个字符串，可以直接使用
        if (object.httpMetadata.cacheControl) {
            headers.set('Cache-Control', object.httpMetadata.cacheControl);
        }
        // 注意：不直接使用 object.httpMetadata.cacheExpiry，因为它是一个 Date 对象
        // 如果需要 Expires 头，需要将其格式化为 HTTP 日期字符串
    }

    // 覆盖或添加我们期望的 Cache-Control 头，确保其存在
    // 如果 R2 metadata 中没有 cacheControl，或者我们想强制使用特定值
    if (!headers.has('Cache-Control')) {
         headers.set('Cache-Control', 'public, max-age=3600'); // 默认值
    }

    // 返回图片数据作为响应
    // object.body 是 @cloudflare/workers-types 定义的 ReadableStream
    // new Response() 期望标准的 ReadableStream (BodyInit)
    // 我们仍然需要 as unknown as ReadableStream 断言来解决不同源 ReadableStream 类型的冲突
    return new Response(object.body as unknown as ReadableStream, {
      headers: headers, // 将手动构建的 Headers 对象传递进去
    });

  } catch (err: any) {
    console.error("Error fetching image from R2:", err);
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}