import { onValue, ref } from "firebase/database";
import Head from "next/head";
import { useRouter } from "next/router";
import { createContext, useEffect, useState } from "react";
import NavBarManager from "../../components/navbar/navBarManager";
import ProfileMainView from "../../components/profile/profileMainView";
import { auth, database } from "../../firebase/clientApp";

export const ProfileContext = createContext()

function getUserData(userId, setData) {
    const db = database
    const dataTemp = ref(db, 'users/' + userId);
    onValue(dataTemp, (snapshot) => {
        const data = snapshot.val();
        setData(data)
    })
}

const ProfilePage = () => {
    const [user, setUser] = useState(auth.currentUser || undefined)
    const [userData, setUserData] = useState(undefined)
    const [profileData, setProfileData] = useState(undefined)
    const [nav, setNav] = useState(undefined)
    const [fav, setFav] = useState(false)
    const profileID = useRouter()?.query?.user

    useEffect(() => {
        if (user === undefined) {
            const userLocal = localStorage.getItem('userLocal')

            if (userLocal) {
                setUser(JSON.parse(userLocal))
            }
        }
    }, [])

    useEffect(() => {
        if (user) {
            localStorage.setItem('userLocal', JSON.stringify(user))
        }

        if (user?.uid) {
            getUserData(user.uid, setUserData)
        }
    }, [user])

    useEffect(() => {
        if (profileID) {
            getUserData(profileID, setProfileData)
        }
    }, [profileID])


    return <>
        <Head>
            <title>Project JBZD</title>
            <meta name="description" content="Project JBZD" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/logo.png" />
        </Head>
        <main>
            <ProfileContext.Provider value={{
                user,
                setUser,
                userData,
                setUserData,
                nav,
                setNav,
                fav,
                setFav,
                profileData,
                profileID
            }}>
                <NavBarManager profile />
                <div className='mt-[50px]'>
                    <ProfileMainView />
                </div>

            </ProfileContext.Provider>
        </main>
    </>
}

export default ProfilePage