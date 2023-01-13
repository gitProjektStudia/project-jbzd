import { onValue, query, ref } from "firebase/database"
import { useRouter } from "next/router"
import { useContext, useEffect, useState } from "react"
import { List, Nav } from "rsuite"
import { database } from "../../firebase/clientApp"
import { ProfileContext } from "../../pages/user/[user]"
import SideView from "../mainView/sideView"

const BasicData = ({profilePosts, profileComments}) => {
    const { profileData } = useContext(ProfileContext)
    if (profileData === undefined) return null
    return <div className="mt-[35px] flex">
        {profileData?.profile_picture && <img src={profileData?.profile_picture} width="150" height="150"></img>}
        <div className="ml-5">
            <p className="font-bold text-4xl text-red-500">Użytkownik: {profileData?.username ? profileData?.username : profileData?.email}</p>
            <p className="text-lg">Ilość komentarzy: {profileComments.length}</p>
            <p className="text-lg">Ilość postów: {profilePosts.length}</p>
            <p className="text-lg">Ilość ulubionych: {profileData?.favorites ? profileData?.favorites?.length : 0}</p>
        </div>

    </div>
}

const ProfileMainView = () => {
    const { profileData, profileID } = useContext(ProfileContext)
    const [activeKey, setActiveKey] = useState('posts')
    const [profilePosts, setProfilePosts] = useState([])
    const [profileComments, setProfileComments] = useState([])
    const router = useRouter()

    useEffect(() => {
        if (profileID) {
            const postsQuery = query(ref(database, 'posts'));
            onValue(postsQuery, (snapshot) => {
                const data = snapshot?.val();
                if (data) {
                    const entries = Object.entries(data)
                    setProfilePosts(entries.filter((item) => item[1].userId === profileID))
                    const comments = []
                    entries.forEach((item) => {
                        if (item[1]?.comments) {
                            const prop = item[1]?.comments.filter((comm) => comm.userId === profileID)
                            if (prop?.length)
                                comments.push(...prop)
                        }
                    })
                    setProfileComments(comments)
                }
            })
        }
    }, [profileID])

    return <div className='mx-[20%] flex flex-row mb-[100px] mt-[35px]'>
        <div className='flex flex-col gap-10 w-[700px]'>
            <BasicData {...{profilePosts, profileComments}}/>
            <Nav justified activeKey={activeKey} appearance="tabs" onSelect={(value) => {
                setActiveKey(value)
            }}>
                <Nav.Item eventKey="posts">Posty</Nav.Item>
                <Nav.Item eventKey="comments">Komentarze</Nav.Item>
            </Nav>

            {activeKey === 'posts' && profilePosts.length === 0 && (
                <div>
                    <p className="text-center">Brak dodanych postów</p>
                </div>
            )}
            {activeKey === 'posts' && profilePosts.length > 0 && (
                <List hover>
                    <div className="flex flex-row justify-between my-2 mx-[60px]">
                        <p className="m-0 text-red-500 text-lg"> Tytuł: </p>
                        <p className="m-0 text-red-500 text-lg"> Kategoria:</p>
                        <p className="m-0 text-red-500 text-lg"> Polubień:</p>
                    </div>

                    {profilePosts.map((post, index) => (
                        <List.Item key={index} className="cursor-pointer" onClick={() => {
                            router.push('/post/' + post[0])
                        }}>
                            <div className="flex flex-row justify-between my-2 mx-[60px]">
                                <p className="m-0">{post[1].title}</p>
                                <p className="m-0">{post[1].category}</p>
                                <p className="m-0">{post[1].likes}</p>
                            </div>
                        </List.Item>
                    ))}
                </List>
            )}

            {activeKey === 'comments' && profileComments.length === 0 && (
                <div>
                    <p className="text-center">Brak dodanych komentarzy</p>
                </div>
            )}
            {activeKey === 'comments' && profileComments.length > 0 && (
                <List>
                    <p className="text-lg text-center mb-2 text-red-500"> Komentarze: </p>
                    {profileComments.map((comment, index) => {
                        const rawTime = new Date(comment.timeStamp).toISOString().replace('T', ' ')
                        const properTime = rawTime.substring(0, rawTime.length - 8)
                        return (
                            <List.Item key={index}>
                                <div className="flex flex-row justify-between my-2 mx-[60px]">
                                    <p className="m-0">Dodano: {properTime}</p>
                                    <p className="m-0 text-lg">{comment.likes}</p>
                                </div>
                                <div className="flex flex-row my-2 mx-[60px]">
                                    <p className="m-0 my-1 text-red-500 break-words w-full">{comment.comment}</p>
                                </div>

                            </List.Item>
                        )
                    })}
                </List>
            )}
        </div>
        <div className='ml-[150px] bg-[#313131] w-[350px]'>
            <SideView profile />
        </div>
    </div >
}


export default ProfileMainView