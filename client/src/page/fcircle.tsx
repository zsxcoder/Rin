import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

// 添加 UserConfig 类型定义
declare global {
    interface Window {
        UserConfig?: {
            private_api_url: string;
            page_turning_number: number;
            error_img: string;
        };
    }
}

export function FcirclePage() {
    const { t } = useTranslation();

    useEffect(() => {
        // 确保 UserConfig 只被定义一次
        if (typeof window.UserConfig === 'undefined') {
            window.UserConfig = {
                // 填写你的fc Lite地址
                private_api_url: 'https://fc.mcyzsx.top/',
                // 点击加载更多时，一次最多加载几篇文章，默认20
                page_turning_number: 20,
                // 头像加载失败时，默认头像地址
                error_img: 'https://i.p-i.vip/30/20240815-66bced9226a36.webp',
            };
        }

        // 动态加载 CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fastly.jsdelivr.net/gh/willow-god/Friend-Circle-Lite/main/fclite.min.css';
        document.head.appendChild(link);

        // 添加样式覆盖
        const style = document.createElement('style');
        style.textContent = `
            /* 白天模式字体为黑色 */
            #friend-circle-lite-root,
            #friend-circle-lite-root * {
                color: black !important;
            }
            
            /* 深色模式字体为白色 */
            @media (prefers-color-scheme: dark) {
                #friend-circle-lite-root,
                #friend-circle-lite-root * {
                    color: white !important;
                }
                #friend-circle-lite-root .fcl-card {
                    background-color: #1f2937 !important;
                    border-color: #374151 !important;
                }
                #friend-circle-lite-root .fcl-card-header {
                    border-bottom-color: #374151 !important;
                }
                #friend-circle-lite-root .fcl-card-footer {
                    border-top-color: #374151 !important;
                }
                #friend-circle-lite-root .fcl-comment {
                    background-color: #374151 !important;
                    border-color: #4b5563 !important;
                }
                #friend-circle-lite-root .fcl-btn {
                    background-color: #374151 !important;
                    border-color: #4b5563 !important;
                    color: white !important;
                }
                #friend-circle-lite-root .fcl-btn:hover {
                    background-color: #4b5563 !important;
                }
                #friend-circle-lite-root .fcl-input {
                    background-color: #374151 !important;
                    border-color: #4b5563 !important;
                    color: white !important;
                }
                #friend-circle-lite-root .fcl-input::placeholder {
                    color: #9ca3af !important;
                }
                #friend-circle-lite-root .fcl-loading {
                    background-color: rgba(31, 41, 55, 0.8) !important;
                }
                #friend-circle-lite-root .fcl-loading::after {
                    border-color: white transparent white transparent !important;
                }
            }
        `;
        document.head.appendChild(style);

        // 动态加载 JavaScript
        const script = document.createElement('script');
        script.src = 'https://fastly.jsdelivr.net/gh/willow-god/Friend-Circle-Lite/main/fclite.min.js';
        document.body.appendChild(script);

        // 清理函数
        return () => {
            document.head.removeChild(link);
            document.head.removeChild(style);
            document.body.removeChild(script);
        };
    }, []);

    return (
        <>
            <Helmet>
                <title>{`${t('fcircle.title')} - ${process.env.NAME}`}</title>
                <meta property="og:site_name" content={process.env.NAME} />
                <meta property="og:title" content={t('fcircle.title')} />
                <meta property="og:image" content={process.env.AVATAR} />
            </Helmet>
            <div className="w-full flex flex-row justify-center ani-show">
                <div className="flex flex-col w-full max-w-4xl rounded-2xl bg-w m-2 p-6 items-center justify-center">
                    <h1 className="text-xl font-bold t-primary mb-4">{t('fcircle.title')}</h1>
                    <div id="friend-circle-lite-root"></div>
                </div>
            </div>
        </>
    );
}