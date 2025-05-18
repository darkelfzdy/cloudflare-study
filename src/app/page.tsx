// src/app/page.tsx

'use client'; // 这是 App Router 中使用客户端 Hooks (useState, useEffect) 所必需的

import { useEffect, useState } from 'react';

interface Quote {
  text: string;
  author?: string | null;
}

export default function HomePage() { // 将组件名称改为 HomePage 以避免与文件名混淆
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false); // 重命名加载状态以区分
  const [error, setError] = useState<string | null>(null);

  // 添加背景图片相关的状态
  const [bgImageUrl, setBgImageUrl] = useState<string>('');
  const [loadingBg, setLoadingBg] = useState<boolean>(true); // 背景图片加载状态

  // Function to fetch the quote (assuming you still need this)
  const fetchQuote = async () => {
    setLoadingQuote(true); // 使用重命名的加载状态
    setError(null); // 清除错误状态
    try {
      const res = await fetch('/api/quote'); // 调用现有的 /api/quote API Route

      if (!res.ok) {
         // 尝试解析错误响应体
         let errorMessage = 'Failed to fetch quote';
         try {
             const errorData = await res.json();
             errorMessage = errorData.error || errorMessage;
         } catch (parseError) {
             // 如果无法解析 JSON，使用状态文本
             errorMessage = `${res.status} ${res.statusText}`;
         }
         throw new Error(errorMessage);
      }

      const data: Quote = await res.json();
      setQuote(data);
    } catch (err: any) {
      console.error('Error fetching quote:', err); // 打印错误到控制台
      setError(err.message || 'Failed to load quote.');
      setQuote(null); // 获取失败时清空引言
    } finally {
      setLoadingQuote(false); // 使用重命名的加载状态
    }
  };

  // Function to fetch a random background image
  const fetchRandomBackground = async () => {
    setLoadingBg(true); // 设置背景加载状态
    // 不清除主错误状态，背景加载错误不影响引言显示
    try {
      // 调用新的 /api/background API Route
      const res = await fetch('/api/background');

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch background: ${res.status} ${res.statusText} - ${errorText}`);
      }

      // 获取图片数据作为 Blob
      const imageBlob = await res.blob();
      // 创建一个本地 URL 来显示 Blob
      const imageUrl = URL.createObjectURL(imageBlob);

      // 清理旧的 Blob URL，防止内存泄漏
      if (bgImageUrl) {
        URL.revokeObjectURL(bgImageUrl);
      }

      setBgImageUrl(imageUrl);

    } catch (err: any) {
      console.error('Error fetching background:', err); // 打印错误到控制台
      // 背景加载失败时，可以设置一个默认背景色或不设置背景
      // setError('Failed to load background image.'); // 可以选择是否显示背景加载错误给用户
      setBgImageUrl(''); // Clear background on error
    } finally {
      setLoadingBg(false); // 完成背景加载
    }
  };

  // Fetch initial background and quote on component mount
  useEffect(() => {
    fetchQuote(); // 首次加载引言
    fetchRandomBackground(); // 首次加载背景

    // Cleanup function to revoke the last created object URL when the component unmounts
    return () => {
      if (bgImageUrl) {
        URL.revokeObjectURL(bgImageUrl);
      }
    };
    // bgImageUrl 被添加到依赖数组，以便在 bgImageUrl 变化时清理旧的 URL
    // fetchQuote 和 fetchRandomBackground 函数是稳定的，不需要添加到依赖数组
  }, [bgImageUrl]);

  return (
    // 外层容器，应用背景图片样式和全屏布局
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4 relative" // 添加 relative 和 p-4
      style={{
        backgroundImage: bgImageUrl ? `url(${bgImageUrl})` : 'none', // 应用背景图片
        backgroundColor: bgImageUrl ? 'transparent' : (/* 默认背景色 */ 'white'), // 没有图片时的默认背景
        backgroundSize: 'cover', // 覆盖整个容器
        backgroundPosition: 'center', // 居中背景图片
        transition: 'background-image 0.5s ease-in-out', // 平滑过渡效果
      }}
    >
      {/* 半透明遮罩层，提高文本可读性 */}
      {/* 使用绝对定位覆盖整个父容器 */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* 内容层，位于遮罩层之上，保持居中和最大宽度 */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-10 rounded-lg shadow-lg bg-white/80 dark:bg-gray-800/80 max-w-xl w-full">
        {loadingQuote ? ( // 使用重命名的加载状态
          <div className="text-lg text-gray-500 dark:text-gray-400 mb-4">加载中…</div>
        ) : error ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : quote ? (
          <>
            <div className="text-2xl sm:text-3xl font-semibold text-center text-gray-900 dark:text-white mb-4">
              "{quote.text}"
            </div>
            {quote.author && (
              <div className="text-lg text-center text-gray-600 dark:text-gray-300 mt-2">
                —— {quote.author}
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* 按钮容器 */}
      <div className="fixed bottom-8 right-8 z-20 flex flex-col items-end space-y-4"> {/* 使用 flexbox 布局按钮，添加间距 */}
         {/* 背景切换按钮 */}
         <button
            onClick={fetchRandomBackground}
            disabled={loadingBg} // 切换背景时禁用按钮
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Switch Background"
         >
           {loadingBg ? '切换中...' : '切换背景'}
         </button>

         {/* 下一句名言按钮 */}
         <button
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed" // 修改颜色以区分
            onClick={fetchQuote}
            disabled={loadingQuote} // 获取名言时禁用按钮
            aria-label="Next Quote"
         >
           {loadingQuote ? '加载中...' : '下一句'}
         </button>
      </div>
    </div>
  );
}