import Link from 'next/link'
import { Button, IconButton } from 'rsuite'
import RandomIcon from '@rsuite/icons/Random';
import PlusIcon from '@rsuite/icons/Plus';
import StarIcon from '@rsuite/icons/legacy/Star';
import SideView from './sideView';
import { onValue, orderByChild, query, ref, set } from 'firebase/database';
import { database } from '../../firebase/clientApp';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../pages';
import { SingleContext } from '../../pages/post/[post]';
import CommentsManager from './commentsManager';



export function goToRandomPost(router) {
    const postsQuery = query(ref(database, 'posts'));
    onValue(postsQuery, (snapshot) => {
        const data = snapshot?.val();

        if (data) {
            const items = Object.entries(data).filter((item) => item[0] !== router.query.post)
            const randomItem = items[Math.floor(Math.random() * Math.random() * items.length)]
            router.push("/post/" + randomItem[0])
        }
    })
}

export function updatePostData(postId, postObj) {
    const db = database
    set(ref(db, 'posts/' + postId), postObj);
}

export function updateUserData(userId, userObj) {
    const db = database
    set(ref(db, 'users/' + userId), userObj);
}

function getAuthorData(userId, setData) {
    const db = database
    const dataTemp = ref(db, 'users/' + userId);
    onValue(dataTemp, (snapshot) => {
        const data = snapshot.val();
        setData(data)
    })
}



const SinglePost = ({ post, rawPosts, single }) => {
    const [authorData, setAuthorData] = useState(undefined)
    const rawTime = new Date(post.timeStamp).toISOString().replace('T', ' ')
    const properTime = rawTime.substring(0, rawTime.length - 8)
    const router = useRouter()
    const clickedPost = rawPosts.filter((item) => item[1].timeStamp === post.timeStamp)[0]
    const { user, userData, ...rest } = useContext(single ? SingleContext : AuthContext)
    const [checkFavorite, setCheckFavorite] = useState(false)
    const [checkLiked, setCheckLiked] = useState(false)

    if (authorData == undefined)
        getAuthorData(post.userId, setAuthorData)

    useEffect(() => {
        if (user) {
            if (userData?.favorites) {
                setCheckFavorite(userData.favorites.some((item) => item === clickedPost[0]))
            }

            if (post?.likers) {
                setCheckLiked(post.likers.some((item) => item === user.uid))
            }
        }
    }, [clickedPost, userData, user])



    return <div>
        <div className='flex flex-row ml-[-50px]'>

            <img src={authorData?.profile_picture} width="50" height="50" className='w-[50px] h-[50px] mr-5'></img>

            <div className='flex flex-col items-center w-full mr-[42px]'>

                <div className='flex flex-row items-center w-full bg-[#1f1f1f] h-[50px]'>
                    <div className='flex flex-row justify-between items-baseline w-full mx-[30px]'>
                        <p className='font-bold text-xl'>{post.title}</p>
                        <p>🗨 {post?.comments ? post?.comments?.length : 0}</p>
                    </div>
                </div>
                <div className='bg-[#1f1f1f] w-full h-[25px] mt-2 flex'>
                    <div className='flex flex-row gap-5 items-center text-xs text-red-500 font-thin mx-[30px]'>
                        <Link href={"/user/" + post.userId}>{authorData?.username ? authorData.username : authorData?.email ? authorData?.email : "Autor"}</Link>
                        <p className='m-0'>{properTime}</p>
                        <p className='m-0'>{post.category}</p>
                    </div>
                </div>

                <img src={post.image_url} className="cursor-pointer" width="700" height="auto" id="post" onClick={() => {
                    router.push('/post/' + clickedPost[0])
                }}></img>

            </div>

            <div className='ml-[-15px] flex flex-col gap-2 self-end justify-items-center '>
                <IconButton icon={<StarIcon />} appearance="primary" color="yellow" active={checkFavorite} onClick={() => {
                    if (user && !checkFavorite) {
                        const favoritesProp = userData.favorites !== undefined ? [...userData?.favorites, clickedPost[0]] : [clickedPost[0]]
                        const uniq = [...new Set(favoritesProp)];
                        updateUserData(user.uid, { ...userData, favorites: uniq })
                    }
                }} />
                <p className='ml-[-5px] text-center'>+{post.likes}</p>
                <IconButton icon={<PlusIcon />} appearance="primary" color="green" active={checkLiked} onClick={() => {
                    if (user && !checkLiked) {
                        const likersProp = clickedPost[1].likers !== undefined ? [...clickedPost[1].likers, user.uid] : [user.uid]
                        updatePostData(clickedPost[0], { ...clickedPost[1], likes: clickedPost[1].likes + 1, likers: likersProp })
                    }

                }} />
            </div>

        </div>

        <div className="flex flex-col justify-center">
            {single && (
                <div className='ml-[20px] mt-10 w-full flex flex-row gap-10 justify-center'>
                    <Link href={'/'} passHref>
                        <Button appearance="primary" color="red" active className='w-3/5'>Przejdź na strone główną</Button>
                    </Link>

                    <IconButton icon={<RandomIcon />} appearance="primary" color="red" className='w-1/5' active onClick={() => {
                        goToRandomPost(router)
                    }}/>
                </div>
            )}

            {single && clickedPost && (
                <CommentsManager {...{ post, rawPosts, single, clickedPost }} />
            )}
        </div>
    </div>

}

const MainViewManager = ({ single }) => {
    const [propData, setPropData] = useState({})
    const [posts, setPosts] = useState([])
    const [rawPosts, setRawPosts] = useState([])
    const [refetch, setRefetch] = useState(false)
    const { nav, fav, setFav, userData, ...rest } = useContext(single ? SingleContext : AuthContext)

    useEffect(() => {
        const postsQuery = query(ref(database, single ? 'posts/' + rest?.postID : 'posts'), orderByChild('timeStamp'));
        onValue(postsQuery, (snapshot) => {
            const data = snapshot?.val();

            if (data) {
                setPosts(Object.values(single ? { [rest?.postID]: data } : data).sort((a, b) => b.timeStamp - a.timeStamp))
                setRawPosts(Object.entries(single ? { [rest?.postID]: data } : data).sort((a, b) => b.timeStamp - a.timeStamp))
                setPropData({
                    posts: Object.values(single ? { [rest?.postID]: data } : data).sort((a, b) => b.timeStamp - a.timeStamp),
                    rawPosts: Object.entries(single ? { [rest?.postID]: data } : data).sort((a, b) => b.timeStamp - a.timeStamp)
                })
            }
        })
    }, [refetch, rest?.postID])


    useEffect(() => {
        if (nav && propData?.rawPosts?.length > 0) {
            if (fav) {
                setFav(false)
                setRefetch(!refetch)
            }

            if (nav === 'Strona główna') {
                setRefetch(!refetch)
            } else {
                setPosts(propData.posts.filter((item) => item.category == nav))
                setRawPosts(propData.rawPosts.filter((item) => item[1].category == nav))
            }
        }
    }, [nav])

    useEffect(() => {
        if (fav && propData?.rawPosts?.length > 0) {
            const favoritesProp = userData?.favorites ? userData.favorites : []
            const propTempRaw = propData.rawPosts.filter((item) => favoritesProp.includes(item[0]))
            const propTempData = propTempRaw.map((item) => item[1])
            setRawPosts(propTempRaw)
            setPosts(propTempData)
        }

        if (fav == false) {
            setRefetch(!refetch)
        }

    }, [fav])


    return <div className='mx-[20%] flex flex-row mb-[100px]'>
        <div>
            <p className='ml-[6%] my-[35px]'>{fav ? 'Ulubione' : nav ? nav : 'Strona główna'}</p>
            <div className='flex flex-col gap-10 w-[700px]'>
                {posts.length === 0 && (
                    <p className=' text-center bg-[#181818] py-[30vh]'>Brak postów :(</p>
                )}
                {posts.map((post, index) => (
                    <SinglePost post={post} key={index} rawPosts={rawPosts} single={single} />
                ))}
            </div>
        </div>

        <div className='ml-[150px] bg-[#313131] w-[350px]'>
            <SideView single={single} />
        </div>


    </div>
}

export default MainViewManager