import i18next from "i18next";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Helmet } from 'react-helmet';
import { useTranslation } from "react-i18next";
import Modal from 'react-modal';
import Select from 'react-select';
import { ShowAlertType, useAlert, useConfirm } from "../components/dialog";
import { Input } from "../components/input";
import SiteInfo from "../components/SiteInfo";
import { Waiting } from "../components/loading";
import { client } from "../main";
import { ClientConfigContext } from "../state/config";
import { ProfileContext } from "../state/profile";
import { headersWithAuth } from "../utils/auth";
import { FRIEND_LINK_CONTACT, siteName } from "../utils/constants";


type FriendItem = {
    name: string;
    id: number;
    uid: number;
    avatar: string;
    createdAt: Date;
    updatedAt: Date;
    desc: string | null;
    url: string;
    accepted: number;
    health: string;
    sort_order?: number;
};

async function publish({ name, avatar, desc, url, showAlert }: { name: string, avatar: string, desc: string, url: string, showAlert: ShowAlertType }) {
    const t = i18next.t
    const { error } = await client.friend.index.post({
        avatar,
        name,
        desc,
        url
    }, {
        headers: headersWithAuth()
    })
    if (error) {
        showAlert(error.value as string)
    } else {
        showAlert(t('create.success'), () => {
            window.location.reload()
        })
    }
}

export function FriendsPage() {
    const { t } = useTranslation()
    const config = useContext(ClientConfigContext)
    let [apply, setApply] = useState<FriendItem>()
    const [name, setName] = useState("")
    const [desc, setDesc] = useState("")
    const [avatar, setAvatar] = useState("")
    const [url, setUrl] = useState("")
    const profile = useContext(ProfileContext);
    const [friendsAvailable, setFriendsAvailable] = useState<FriendItem[]>([])
    const [waitList, setWaitList] = useState<FriendItem[]>([])
    const [refusedList, setRefusedList] = useState<FriendItem[]>([])
    const [friendsUnavailable, setFriendsUnavailable] = useState<FriendItem[]>([])
    const [status, setStatus] = useState<'idle' | 'loading'>('loading')
    const ref = useRef(false)
    const { showAlert, AlertUI } = useAlert()
    useEffect(() => {
        if (ref.current) return
        client.friend.index.get({
            headers: headersWithAuth()
        }).then(({ data }) => {
            if (data) {
                const friends_available = data.friend_list?.filter(({ health, accepted }) => health.length === 0 && accepted === 1) || []
                setFriendsAvailable(friends_available)
                const friends_unavailable = data.friend_list?.filter(({ health, accepted }) => health.length > 0 && accepted === 1) || []
                setFriendsUnavailable(friends_unavailable)
                const waitList = data.friend_list?.filter(({ accepted }) => accepted === 0) || []
                setWaitList(waitList)
                const refuesdList = data.friend_list?.filter(({ accepted }) => accepted === -1) || []
                setRefusedList(refuesdList)
                if (data.apply_list)
                    setApply(data.apply_list)
            }
            setStatus('idle')
        })
        ref.current = true
    }, [])
    function publishButton() {
        publish({ name, desc, avatar, url, showAlert })
    }
    return (<>
        <Helmet>
            <title>{`${t('friends.title')} - ${process.env.NAME}`}</title>
            <meta property="og:site_name" content={siteName} />
            <meta property="og:title" content={t('friends.title')} />
            <meta property="og:image" content={process.env.AVATAR} />
            <meta property="og:type" content="article" />
            <meta property="og:url" content={document.URL} />
        </Helmet>
        <Waiting for={friendsAvailable.length !== 0 || friendsUnavailable.length !== 0 || status === "idle"}>
            <main className="w-full flex flex-col justify-center items-center mb-8 t-primary ani-show">
                <FriendList title={t('friends.title')} show={friendsAvailable.length > 0} friends={friendsAvailable} />
                <FriendList title={t('friends.left')} show={friendsUnavailable.length > 0} friends={friendsUnavailable} />
                <FriendList title={t('friends.review.waiting')} show={waitList.length > 0} friends={waitList} />
                <FriendList title={t('friends.review.rejected')} show={refusedList.length > 0} friends={refusedList} />
                <FriendList title={t('friends.my_apply')} show={profile?.permission !== true && apply !== undefined} friends={apply ? [apply] : []} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 w-full max-w-4xl">
                    <div className="rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <svg className="w-5 h-5 text-docs-accent dark:text-dark-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">申请友链</h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            欢迎技术与生活类博客交换友链
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            评论区留言或请发送邮件至 <a href={`mailto:${FRIEND_LINK_CONTACT.email}`} className="text-docs-accent dark:text-dark-accent hover:underline">{FRIEND_LINK_CONTACT.email}</a>
                        </p>
                        <div className="rounded-lg border-2 border-dashed border-docs-accent/30 dark:border-dark-accent/30 bg-docs-accent/5 dark:bg-dark-accent/10 p-4 text-center">
                            <p className="text-sm text-docs-accent dark:text-dark-accent font-medium mb-1">
                                博客名称、描述、地址、头像等信息
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                任意格式均可,包含基本信息即可
                            </p>
                        </div>
                    </div>
                    <SiteInfo
                        name={process.env.NAME || '网站名称'}
                        url={process.env.URL || window.location.origin}
                        description={process.env.DESCRIPTION || '网站描述'}
                        avatar={process.env.AVATAR || ''}
                    />
                </div>
                
                {profile && (profile.permission || config.get("friend_apply_enable")) &&
                    <div className="wauto t-primary flex text-start text-2xl font-bold mt-8">
                        <div className="md:basis-1/2 bg-w rounded-xl p-4">
                            <p>
                                {profile.permission ? t('friends.create') : t('friends.apply')}
                            </p>
                            <div className="text-sm mt-4 text-neutral-500 font-normal">
                                <Input value={name} setValue={setName} placeholder={t('sitename')} />
                                <Input value={desc} setValue={setDesc} placeholder={t('description')} className="mt-2" />
                                <Input value={avatar} setValue={setAvatar} placeholder={t('avatar.url')} className="mt-2" />
                                <Input value={url} setValue={setUrl} placeholder={t('url')} className="my-2" />
                                <div className='flex flex-row justify-center'>
                                    <button onClick={publishButton} className='basis-1/2 bg-theme text-white py-4 rounded-full shadow-xl shadow-light'>{t('create.title')}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </main>
        </Waiting>
        <AlertUI />
    </>)
}

function FriendList({ title, show, friends }: { title: string, show: boolean, friends: FriendItem[] }) {
    return (<>
        {
            show && <>
                <div className="wauto text-start py-4">
                    <p className="text-sm mt-4 text-neutral-500 font-normal">
                        {title}
                    </p>
                </div>
                <div className="wauto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {friends.map((friend) => (
                        <Friend key={friend.id} friend={friend} />
                    ))}
                </div>
            </>
        }
    </>)
}

function Friend({ friend }: { friend: FriendItem }) {
    const { t } = useTranslation()
    const profile = useContext(ProfileContext)
    const [avatar, setAvatar] = useState(friend.avatar)
    const [name, setName] = useState(friend.name)
    const [desc, setDesc] = useState(friend.desc || "")
    const [url, setUrl] = useState(friend.url)
    const [status, setStatus] = useState(friend.accepted)
    const [sortOrder, setSortOrder] = useState(friend.sort_order || 0)
    const [modalIsOpen, setIsOpen] = useState(false);
    const { showConfirm, ConfirmUI } = useConfirm()
    const { showAlert, AlertUI } = useAlert()

    const deleteFriend = useCallback(() => {
        showConfirm(
            t('delete.title'),
            t('delete.confirm'),
            () => {
                client.friend({ id: friend.id }).delete(friend.id, {
                    headers: headersWithAuth()
                }).then(({ error }) => {
                    if (error) {
                        showAlert(error.value as string)
                    } else {
                        showAlert(t('delete.success'), () => {
                            window.location.reload()
                        })
                    }
                })
            })
    }, [friend.id])

    const updateFriend = useCallback(() => {
        client.friend({ id: friend.id }).put({
            avatar,
            name,
            desc,
            url,
            accepted: status,
            sort_order: sortOrder
        }, {
            headers: headersWithAuth()
        }).then(({ error }) => {
            if (error) {
                showAlert(error.value as string)
            } else {
                showAlert(t('update.success'), () => {
                    window.location.reload()
                })
            }
        })
    }, [avatar, name, desc, url, status, sortOrder])

    const statusOption = [
        { value: -1, label: t('friends.review.rejected') },
        { value: 0, label: t('friends.review.waiting') },
        { value: 1, label: t('friends.review.accepted') }
    ]
    return (
        <>
            <a title={friend.name} href={friend.url} target="_blank" className="bg-button w-full bg-w rounded-xl p-4 flex flex-col justify-center items-center relative">
                <div className="w-16 h-16">
                    <img className={"rounded-full " + (friend.health.length > 0 ? "grayscale" : "")} src={friend.avatar} alt={friend.name} />
                </div>
                <p className="text-base text-center">{friend.name}</p>
                {friend.health.length == 0 && <p className="text-sm text-neutral-500 text-center">{friend.desc}</p>}
                {friend.accepted !== 1 && <p className={`${friend.accepted === 0 ? "t-primary" : "text-theme"}`}>{statusOption[friend.accepted + 1].label}</p>}
                {friend.health.length > 0 && <p className="text-sm text-gray-500 text-center">{errorHumanize(friend.health)}</p>}
                {(profile?.permission || profile?.id === friend.uid) && <>
                    <button onClick={(e) => { e.preventDefault(); setIsOpen(true) }} className="absolute top-0 right-0 m-2 px-2 py-1 bg-secondary t-primary rounded-full bg-button">
                        <i className="ri-settings-line"></i>
                    </button></>}
            </a>

            <Modal
                isOpen={modalIsOpen}
                style={{
                    content: {
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',
                        padding: '0',
                        border: 'none',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: 'white',
                    },
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 1000
                    }
                }
                }
                onRequestClose={() => setIsOpen(false)}
                contentLabel={t('update$sth', { sth: friend.name })}
            >
                <div className="w-[80vw] sm:w-[60vw] md:w-[50vw] lg:w-[40vw] xl:w-[30vw] bg-w rounded-xl p-4 flex flex-col justify-start items-center relative">
                    <div className="w-16 h-16">
                        <img className={"rounded-xl " + (friend.health.length > 0 ? "grayscale" : "")} src={friend.avatar} alt={friend.name} />
                    </div>
                    {profile?.permission &&
                        <div className="flex flex-col w-full items-start mt-4 px-4">
                            <div className="flex flex-row justify-between w-full items-center">
                                <div className="flex flex-col">
                                    <p className="text-lg dark:text-white">
                                        {t('status')}
                                    </p>
                                </div>
                                <div className="flex flex-row items-center justify-center space-x-4">
                                    <Select options={statusOption} required defaultValue={statusOption[friend.accepted + 1]}
                                        onChange={(newValue, _) => {
                                            const value = newValue?.value
                                            if (value !== undefined) {
                                                setStatus(value)
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-row justify-between w-full items-center mt-2">
                                <div className="flex flex-col">
                                    <p className="text-lg dark:text-white">
                                        {t('sort_order')}
                                    </p>
                                </div>
                                <div className="flex flex-row items-center justify-center space-x-4">
                                    <Input
                                        value={sortOrder.toString()} 
                                        setValue={(val) => setSortOrder(parseInt(val) || 0)} 
                                        placeholder={t('sort_order')} 
                                    />
                                </div>
                            </div>
                        </div>
                    }
                    <Input value={name} setValue={setName} placeholder={t('sitename')} className="mt-4" />
                    <Input value={desc} setValue={setDesc} placeholder={t('description')} className="mt-2" />
                    <Input value={avatar} setValue={setAvatar} placeholder={t('avatar.url')} className="mt-2" />
                    <Input value={url} setValue={setUrl} placeholder={t('url')} className="my-2" />
                    <div className='flex flex-row justify-center space-x-2'>
                        <button onClick={deleteFriend} className="bg-secondary text-theme rounded-full bg-button px-4 py-2 mt-2">{t('delete.title')}</button>
                        <button onClick={updateFriend} className="bg-secondary t-primary rounded-full bg-button px-4 py-2 mt-2">{t('save')}</button>
                    </div>
                </div >
            </Modal>
            <ConfirmUI />
            <AlertUI />
        </>
    )
}

function errorHumanize(error: string) {
    if (error === "certificate has expired" || error == "526") {
        return "证书已过期"
    } else if (error.includes("Unable to connect") || error == "521" || error == "522") {
        return "无法访问"
    }
    return error
}
