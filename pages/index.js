import { onValue, ref } from 'firebase/database'
import Head from 'next/head'
import { createContext, useEffect, useState } from 'react'
import MainViewManager from '../components/mainView/mainViewManager'
import NavBarManager from '../components/navbar/navBarManager'
import { auth, database } from '../firebase/clientApp'

export const AuthContext = createContext()

function getUserData(userId, setData) {
  const db = database
  const dataTemp = ref(db, 'users/' + userId);
  onValue(dataTemp, (snapshot) => {
    const data = snapshot.val();
    setData(data)
  })
}

export default function Home() {
  const [user, setUser] = useState(auth.currentUser || undefined)
  const [userData, setUserData] = useState(undefined)
  const [nav, setNav] = useState(undefined)
  const [fav, setFav] = useState(false)

  useEffect(() => {
    if (user === undefined) {
      const userLocal = localStorage.getItem('userLocal')

      if(userLocal){
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

  return (
    <>
      <Head>
        <title>Project JBZD</title>
        <meta name="description" content="Project JBZD" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
      </Head>
      <main>
        <AuthContext.Provider value={{
          user, 
          setUser,
          userData, 
          setUserData,
          nav, 
          setNav,
          fav, 
          setFav
        }}>
          <NavBarManager />
          <div className='mt-[50px]'>
            <MainViewManager />
          </div>

        </AuthContext.Provider>
      </main>
    </>
  )
}
