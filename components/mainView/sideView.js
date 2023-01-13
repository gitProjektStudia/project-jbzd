
import { useContext, useEffect, useState } from 'react';
import { Button, Input, InputGroup, Message, Modal, useToaster } from 'rsuite'
import EyeIcon from '@rsuite/icons/legacy/Eye';
import EyeSlashIcon from '@rsuite/icons/legacy/EyeSlash';
import { auth, database } from '../../firebase/clientApp'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { AuthContext } from '../../pages';
import { useRouter } from 'next/router'
import { limitToFirst, limitToLast, onValue, orderByChild, query, ref, set } from "firebase/database";
import { SingleContext } from '../../pages/post/[post]';
import { ProfileContext } from '../../pages/user/[user]';


export function writeUserData(userId, name, email, imageUrl) {
    const db = database
    set(ref(db, 'users/' + userId), {
        username: name,
        email: email,
        profile_picture: imageUrl
    });
}

function createUser(email, password, toaster, setUser) {

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            setUser(userCredential.user)
            writeUserData(userCredential.user.uid, '', userCredential.user.email, 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png')
            toaster.push(<Message showIcon type={"success"}>
                Zarejestrowano
            </Message>);
        })
        .catch((error) => {
            toaster.push(<Message showIcon type={"error"}>
                Błąd! {error.message}
            </Message>);
        });
}

function loginUser(email, password, toaster, setUser) {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            setUser(userCredential.user)
            toaster.push(<Message showIcon type={"success"}>
                Zalogowano
            </Message>);

        })
        .catch((error) => {
            toaster.push(<Message showIcon type={"error"}>
                Błąd! {error.message}
            </Message>);
        });
}

const LoginComponent = ({single, profile}) => {
    const [visible, setVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(false);
    const toaster = useToaster()
    const { setUser } = useContext(single ? SingleContext : profile ? ProfileContext : AuthContext)

    return <div className='m-3 flex flex-col '>
        <div>
            <label className='ml-2'>Email:</label>
            <Input
                className='mb-3'
                onChange={(value) => {
                    setEmail(value)
                }} />

            <label className='ml-2'>Hasło:</label>
            <InputGroup inside >
                <Input type={visible ? 'text' : 'password'}
                    onChange={(value) => {
                        setPassword(value)
                    }} />
                <InputGroup.Button onClick={() => {
                    setVisible(!visible)
                }}>
                    {visible ? <EyeIcon /> : <EyeSlashIcon />}
                </InputGroup.Button>
            </InputGroup>
        </div>


        <div className='flex flex-row justify-center gap-5 mt-3'>
            <Button appearance="primary" color="red" onClick={() => loginUser(email, password, toaster, setUser)}>Zaloguj</Button>
            <Button appearance="primary" color="blue" onClick={() => createUser(email, password, toaster, setUser)}>Zarejestruj</Button>
        </div>

    </div>
}


const ProfileComponent = ({ user, single, profile }) => {
    const toaster = useToaster()
    const { setUser, userData } = useContext(single ? SingleContext : profile ? ProfileContext : AuthContext)
    const [visible, setVisible] = useState(false)
    const [nick, setNick] = useState(userData?.username)
    const [url, setUrl] = useState(userData?.profile_picture)
    const router = useRouter()

    return <div className='flex flex-col text-center bg-[#252525] mx-5 p-5'>
        <div className='flex flex-row items-center gap-8'>
            {userData?.profile_picture && <img src={userData?.profile_picture} width="100" height="100"></img>}

            <div className="">
                <p className='font-bold text-red-500'>Zalogowano jako</p>
                <p>{userData?.username ? userData?.username : user?.email}</p>
            </div>

        </div>

        <div className=' mt-5 flex flex-row gap-3 justify-around'>
            <Button appearance="primary" color="blue" onClick={() => {
                router.push("/user/" + user.uid)
            }}>Profil</Button>
            <Button appearance="primary" color="violet" onClick={() => {
                setVisible(true)
            }}>Ustawienia</Button>
            <Button appearance="primary" color="red" onClick={() => {
                signOut(auth).then(() => {
                    setUser(undefined)
                    localStorage.removeItem('userLocal')
                    toaster.push(<Message showIcon type={"info"}>
                        Wylogowano
                    </Message>)
                }).catch((error) => {
                    toaster.push(<Message showIcon type={"error"}>
                        Błąd! {error.message}
                    </Message>);
                })
            }}>Wyloguj</Button>
        </div>

        <Modal open={visible} onClose={() => {
            setVisible(false)
        }}>
            <Modal.Header>
                <Modal.Title>Ustawienia</Modal.Title>
            </Modal.Header>
            <Modal.Body className='flex flex-row gap-5'>
                <div className='w-[250px]'>
                    <label className='ml-2'>Nick:</label>
                    <Input
                        value={nick}
                        className='mb-3'
                        onChange={(value) => {
                            setNick(value)
                        }} />
                </div>
                <div className='w-[250px]'>
                    <label className='ml-2'>Profilowe:</label>
                    <Input
                        placeholder='url (100x100)'
                        className='mb-3'
                        value={url}
                        onChange={(value) => {
                            setUrl(value)
                        }} />
                </div>

            </Modal.Body>
            <Modal.Footer>
                <Button appearance="primary" onClick={() => {
                    writeUserData(user.uid, nick, user.email, url)
                    setVisible(false)
                    toaster.push(<Message showIcon type={"success"}>
                        Zaktualizowano
                    </Message>);
                }}>
                    Ok
                </Button>
                <Button onClick={() => {
                    setVisible(false)
                }} appearance="subtle">
                    Anuluj
                </Button>
            </Modal.Footer>
        </Modal>

    </div>
}

const SideView = ({single , profile}) => {
    const { user, userData } = useContext(single ? SingleContext : profile ? ProfileContext : AuthContext)
    const [topPosts, setTopPosts] = useState([])
    const [rawPosts, setRawPosts] = useState({})
    const router = useRouter()
    useEffect(() => {
        const postsQuery = query(ref(database, 'posts'), orderByChild('likes'), limitToLast(5));
        onValue(postsQuery, (snapshot) => {
            const data = snapshot?.val();
            if (data){
                setTopPosts(Object.values(data).sort((a, b) => b.timeStamp - a.timeStamp).sort((a, b) => b.likes - a.likes))
                setRawPosts(Object.entries(data).sort((a, b) => b.timeStamp - a.timeStamp).sort((a, b) => b.likes - a.likes))
            }       
        })
    }, [])
    
    return <div className='mt-[50px]'>
        {user === undefined && (
            <LoginComponent single={single} profile={profile}/>
        )}

        {user !== undefined && userData !== undefined && (
            <ProfileComponent user={user} single={single} profile={profile}/>
        )}

        {topPosts?.length > 0 && (
            <div>
                <p className='text-center py-3 mt-10 bg-[#181818] font-bold'>TOP 5</p>
                {
                    topPosts.map((post, index) => (
                        <div className=" h-[350px] overflow-hidden mt-5 bg-[#181818] items-center flex flex-col" key={index}>
                            <p className='text-center my-2'>{post.title}</p>
                            <img src={post.image_url} className="cursor-pointer" width="300" height="100" onClick={() => {
                               const clickedPost = rawPosts.filter((item) => item[1].timeStamp === post.timeStamp)[0]
                               router.push('/post/' + clickedPost[0])
                            }}></img>
                        </div>
                    ))
                }

            </div>
        )}

    </div>
}

export default SideView