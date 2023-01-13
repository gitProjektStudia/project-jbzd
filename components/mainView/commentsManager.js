import SendIcon from '@rsuite/icons/Send';
import PlusIcon from '@rsuite/icons/Plus';
import MinusIcon from '@rsuite/icons/Minus';
import { useContext, useEffect, useState } from 'react';
import { IconButton, Input } from 'rsuite';
import { SingleContext } from '../../pages/post/[post]';
import { AuthContext } from '../../pages';
import { updatePostData } from './mainViewManager';
import { database } from '../../firebase/clientApp';
import { equalTo, onValue, query, ref } from 'firebase/database';
import Link from 'next/link';


function getAuthorsData(set) {
    const authorsQuery = query(ref(database, 'users'));
    onValue(authorsQuery, (snapshot) => {
        const data = snapshot.val();
        if (data)
            set(Object.entries(data))
    })
}

const CommentsManager = ({ post, rawPosts, single, clickedPost }) => {
    const { user, userData, ...rest } = useContext(single ? SingleContext : AuthContext)
    const [newComment, setNewComment] = useState(undefined)
    const [comments, setComments] = useState([])
    const [authors, setAuthors] = useState([])

    if (authors.length === 0)
        getAuthorsData(setAuthors)

    useEffect(() => {
        if (post.comments) {
            setComments(post.comments.sort((a, b) => b.timeStamp - a.timeStamp))
        }
    }, [post?.comments, rawPosts])




    if (rest?.postID !== clickedPost[0]) return null

    return <div className="flex flex-col gap-5 ml-[45px] mt-10">
        <div>
            <div className="bg-[#313131] flex flex-row p-5 gap-3">
                <Input placeholder='Komentarz' value={newComment || ''} onChange={(value) => { setNewComment(value) }} />
                <IconButton icon={<SendIcon />} appearance="primary" disabled={user === undefined} active color="red" onClick={() => {
                    if (user) {
                        const newCommentObj = {
                            comment: newComment,
                            timeStamp: Date.now(),
                            userId: user.uid,
                            likes: 0
                        }
                        const commentsProp = post?.comments !== undefined ? [...post?.comments, newCommentObj] : [newCommentObj]
                        updatePostData(rest?.postID, { ...post, comments: commentsProp })
                        setNewComment(undefined)
                    }

                }} />
            </div>
        </div>

        <div className="bg-[#1f1f1f] p-3 flex flex-row justify-between">
            <p>🗨 {post?.comments ? post?.comments?.length : 0} komentarzy </p>
        </div>
        <div className="bg-[#1f1f1f]">
            {comments.map((item, index) => {
                const rawTime = new Date(item.timeStamp).toISOString().replace('T', ' ')
                const properTime = rawTime.substring(0, rawTime.length - 8)
                const authorDataProp = authors.filter((ath) => ath[0] === item.userId)
                const authorData = authorDataProp?.length ? authorDataProp[0][1] : {}
                const AuthorID = authorDataProp?.length ? authorDataProp[0][0] : ""
                const checkLikers = item?.likers ? item?.likers.some((id) => id === user?.uid) : false
                const checkDisLikers = item?.dislikers ? item?.dislikers.some((id) => id === user?.uid) : false
                return (
                    <div className="bg-[#1f1f1f] p-3" key={index}>
                        <div className='flex flex-row'>
                            <img src={authorData?.profile_picture} width="40px" height="40px" className='w-[40px] h-[40px] mr-5'></img>
                            <div className='flex flex-row justify-between w-full'>
                                <div className='flex flex-row gap-2'>
                                    <Link href={"/user/" + AuthorID} className='m-0'>{authorData?.username ? authorData?.username :  authorData?.email ? authorData?.email : "Autor"}</Link>
                                    <p className='m-0'>{properTime}</p>
                                </div>
                                <div className='flex flex-row items-center h-5 gap-2'>
                                    <IconButton icon={<PlusIcon />} appearance="primary" color="red" active={checkLikers} onClick={() => {
                                        if (user && !checkLikers) {
                                            const commentProp = post.comments.filter((comm) => comm.timeStamp !== item.timeStamp)
                                            const clickedComm = post.comments.filter((comm) => comm.timeStamp === item.timeStamp)
                                            const itemLikers = item?.likers ? [...item?.likers, user.uid] : [user.uid]
                                            const itemDisLikers = item?.dislikers ? [...item?.dislikers].filter((id) => id !== user.uid) : []
                                            updatePostData(rest?.postID, { ...post, comments: [...commentProp, { ...clickedComm[0], likes: clickedComm[0].likes + 1, likers: itemLikers, dislikers: itemDisLikers }] })

                                        }
                                    }} />
                                    <p className='m-0'>{item.likes}</p>
                                    <IconButton icon={<MinusIcon />} appearance="primary" color="red" active={checkDisLikers} onClick={() => {
                                        if (user && !checkDisLikers) {
                                            const commentProp = post.comments.filter((comm) => comm.timeStamp !== item.timeStamp)
                                            const clickedComm = post.comments.filter((comm) => comm.timeStamp === item.timeStamp)
                                            const itemDisLikers = item?.dislikers ? [...item?.dislikers, user.uid] : [user.uid]
                                            const itemLikers = item?.likers ? [...item?.likers].filter((id) => id !== user.uid) : []
                                            updatePostData(rest?.postID, { ...post, comments: [...commentProp, { ...clickedComm[0], likes: clickedComm[0].likes - 1, dislikers: itemDisLikers, likers: itemLikers }] })
                                        }
                                    }} />
                                </div>
                            </div>
                        </div>

                        <p className='m-0 ml-[60px] mt-[-15px] break-words'>{item.comment}</p>
                    </div>
                )
            })}
        </div>



    </div>
}

export default CommentsManager