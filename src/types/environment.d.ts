// src/types/environment.d.ts

// 引入 Cloudflare Workers Types 中定义的 D1Database 类型
import type { D1Database } from '@cloudflare/workers-types';

// 使用 declare global 声明全局命名空间
declare global {
  // 增强 NodeJS 命名空间
  namespace NodeJS {
    // 增强 ProcessEnv 接口
    interface ProcessEnv {
      // 声明 DB 属性，并指定其类型为 D1Database
      DB: D1Database;

      // R2 Bucket 绑定 - 添加这一行
      BACKGROUND_IMAGES: R2Bucket;

      // 如果你还有其他绑定（例如 KV、R2），也在这里声明
      // MY_KV_BINDING?: KVNamespace;
      // MY_R2_BINDING?: R2Bucket;
    }
  }
}