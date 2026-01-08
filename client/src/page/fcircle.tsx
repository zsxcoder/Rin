import { useContext, useEffect, useRef, useState } from "react";
import { Helmet } from 'react-helmet';
import { useTranslation } from "react-i18next";
import { Waiting } from "../components/loading";
import { ClientConfigContext } from "../state/config";
import { siteName } from "../utils/constants";


type FcircleItem = {
    name: string;
    id: number;
    avatar: string;
    desc: string;
    url: string;
    color?: string;
};

type FcircleData = {
    code: number;
    data: {
        list: FcircleItem[];
    };
};

export function FcirclePage() {
    const { t } = useTranslation()
    const config = useContext(ClientConfigContext)
    const [fcircleList, setFcircleList] = useState<FcircleItem[]>([])
    const [status, setStatus] = useState<'idle' | 'loading'>('loading')
    const ref = useRef(false)

    useEffect(() => {
        if (ref.current) return
        fetchFcircleData()
        ref.current = true
    }, [])

    async function fetchFcircleData() {
        try {
            const privateApiUrl = config.get<string>('private_api_url') || 'https://fc.mcyzsx.top/'
            const response = await fetch(privateApiUrl)
            const data: FcircleData = await response.json()
            
            if (data.code === 200 && data.data?.list) {
                setFcircleList(data.data.list)
            }
        } catch (error) {
            console.error('Failed to fetch fcircle data:', error)
        } finally {
            setStatus('idle')
        }
    }

    return (<>
        <Helmet>
            <title>{`${t('fcircle.title')} - ${process.env.NAME}`}</title>
            <meta property="og:site_name" content={siteName} />
            <meta property="og:title" content={t('fcircle.title')} />
            <meta property="og:image" content={process.env.AVATAR} />
            <meta property="og:type" content="article" />
            <meta property="og:url" content={document.URL} />
        </Helmet>
        <Waiting for={fcircleList.length !== 0 || status === "idle"}>
            <main className="w-full flex flex-col justify-center items-center mb-8 t-primary ani-show">
                <div className="wauto text-start py-4">
                    <p className="text-sm mt-4 text-neutral-500 font-normal">
                        {t('fcircle.title')}
                    </p>
                </div>
                <div className="wauto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {fcircleList.map((item) => (
                        <FcircleItem key={item.id} item={item} />
                    ))}
                </div>
                {fcircleList.length === 0 && status === 'idle' && (
                    <div className="w-full text-center py-8">
                        <p className="text-sm text-neutral-500 font-normal">
                            {t('fcircle.empty')}
                        </p>
                    </div>
                )}
            </main>
        </Waiting>
    </>)
}

function FcircleItem({ item }: { item: FcircleItem }) {
    return (
        <a 
            title={item.name} 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-button w-full bg-w rounded-xl p-4 flex flex-col justify-center items-center relative group"
        >
            <div className="w-16 h-16 mb-3">
                <img 
                    className="rounded-full object-cover transition-transform duration-300 group-hover:scale-110" 
                    src={item.avatar} 
                    alt={item.name} 
                />
            </div>
            <p className="text-base font-medium text-center mb-1">{item.name}</p>
            {item.desc && (
                <p className="text-xs text-neutral-500 text-center line-clamp-2">{item.desc}</p>
            )}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-6 h-6 rounded-full bg-theme/20 flex items-center justify-center">
                    <i className="ri-external-link-line text-theme text-xs"></i>
                </div>
            </div>
        </a>
    )
}