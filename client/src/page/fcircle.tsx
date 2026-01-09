import { useEffect, useRef } from "react";
import { Helmet } from 'react-helmet';
import { useTranslation } from "react-i18next";
import { useColorMode } from "../utils/darkModeUtils";
import { siteName } from "../utils/constants";

declare global {
    interface Window {
        UserConfig?: {
            private_api_url: string;
            page_turning_number: number;
            error_img: string;
        };
        initialize_fc_lite?: () => void;
    }
}

export function FCirclePage() {
    const { t } = useTranslation();
    const colorMode = useColorMode();
    const scriptLoaded = useRef(false);

    useEffect(() => {
        // 确保只加载一次脚本
        if (!scriptLoaded.current) {
            // 配置 UserConfig
            window.UserConfig = {
                private_api_url: 'https://fc.mcyzsx.top/',
                page_turning_number: 20,
                error_img: 'https://i.p-i.vip/30/20240815-66bced9226a36.webp',
            };

            // 加载 CSS
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = 'https://fastly.jsdelivr.net/gh/willow-god/Friend-Circle-Lite/main/fclite.min.css';
            document.head.appendChild(cssLink);

            // 加载 JS
            const script = document.createElement('script');
            script.src = 'https://fastly.jsdelivr.net/gh/willow-god/Friend-Circle-Lite/main/fclite.min.js';
            script.onload = () => {
                // 初始化 Friend Circle Lite
                if (window.initialize_fc_lite) {
                    window.initialize_fc_lite();
                }
            };
            document.body.appendChild(script);

            scriptLoaded.current = true;
        }
    }, []);

    // 监听颜色模式变化，更新 Friend Circle Lite 的主题
    useEffect(() => {
        const updateFCTheme = () => {
            const rootElement = document.getElementById('friend-circle-lite-root');
            if (rootElement) {
                rootElement.setAttribute('data-theme', colorMode);
            }
        };

        // 初始设置
        updateFCTheme();

        // 监听颜色模式变化
        const handleColorChange = () => {
            updateFCTheme();
        };

        window.addEventListener('colorSchemeChange', handleColorChange);

        return () => {
            window.removeEventListener('colorSchemeChange', handleColorChange);
        };
    }, [colorMode]);

    return (
        <>
            <Helmet>
                <title>{`${t('fcircle.title', { defaultValue: '友链朋友圈' })} - ${process.env.NAME}`}</title>
                <meta property="og:site_name" content={siteName} />
                <meta property="og:title" content={t('fcircle.title', { defaultValue: '友链朋友圈' })} />
                <meta property="og:image" content={process.env.AVATAR} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={document.URL} />
            </Helmet>
            <main className="w-full flex flex-col justify-center items-center mb-8 t-primary ani-show">
                <div className="w-full max-w-4xl p-4">
                    <h1 className="text-3xl font-bold text-center mb-8 text-slate-900 dark:text-white">
                        {t('fcircle.title', { defaultValue: '友链朋友圈' })}
                    </h1>
                    <div id="friend-circle-lite-root" data-theme={colorMode}></div>
                </div>
            </main>
        </>
    );
}
