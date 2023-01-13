import Image from 'next/image'
import { Navbar, Nav, Modal, Button, Input, InputPicker } from 'rsuite';
import PlusIcon from '@rsuite/icons/Plus';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../pages';
import { ref, set } from 'firebase/database';
import { database } from '../../firebase/clientApp';
import { SingleContext } from '../../pages/post/[post]';
import { useRouter } from 'next/router';
import { goToRandomPost } from '../mainView/mainViewManager';
import { ProfileContext } from '../../pages/user/[user]';


function writePostData(userId, title, imageUrl, category) {
    const db = database
    set(ref(db, 'posts/' + Math.floor(Math.random() * 10000)), {
        userId: userId,
        title: title,
        category: category,
        image_url: imageUrl,
        timeStamp: Date.now(),
        likes: 0
    });
}

function checkURL(url) {
    return (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

function validate(title, category, photoURL) {

    if (photoURL === undefined) return true
    if (title === undefined) return true
    if (category === undefined) return true
    if (!checkURL(photoURL)) return true
    return false
}


const data = [
    'Motoryzacja',
    'Humor',
    'Sport'
].map(item => ({ label: item, value: item }));


const NavBarManager = ({ single, profile }) => {
    const { user, userData, setNav, setFav } = useContext(single ? SingleContext : profile ? ProfileContext: AuthContext)
    const [show, setShow] = useState(false)
    const [title, setTitle] = useState(undefined)
    const [category, setCategory] = useState(undefined)
    const [photoURL, setPhotoURL] = useState(undefined)
    const router = useRouter()

    return <div className="w-full bg-[#181818] fixed top-0 z-50">
        <Navbar className='mx-[20%]' appearance="subtle">
            <Navbar.Brand href="/" className="flex" onClick={() => {
                setNav('Strona główna')
                setFav(false)
            }}>
                <div className='mt-[-5px]'>
                    <Image
                        src="../../logo.png"
                        alt="Picture of the author"
                        width={52}
                        height={35}
                    />
                </div>
            </Navbar.Brand>
            <Nav pullRight classPrefix="div">
                {user !== undefined && userData !== undefined && (
                    <Nav.Item icon={<PlusIcon />}
                        onSelect={() => {
                            setShow(true)
                        }}>Dodaj</Nav.Item>
                )}
                {user !== undefined  && profile === undefined && userData !== undefined && (
                    <Nav.Item onSelect={() => {
                        if (single || profile) router.push("/")
                        setFav(true)
                    }}>Ulubione</Nav.Item>
                )}
                <Nav.Item onSelect={() => {
                    setFav(false)
                    goToRandomPost(router)
                }}>Losowe</Nav.Item>
                {single === undefined && profile === undefined && (
                    <Nav.Menu appearance="subtle" title="Działy">
                        <Nav.Item
                            onSelect={() => {
                                if (single || profile) router.push("/")
                                setNav('Strona główna')
                                setFav(false)
                            }}>Główna</Nav.Item>
                        {data.map((item, index) => (
                            <Nav.Item key={index}
                                onSelect={() => {
                                    if (single || profile) router.push("/")
                                    setNav(item.label)
                                }}>{item.label}</Nav.Item>
                        ))}
                    </Nav.Menu>
                )}

                {single || profile && (
                    <Nav.Item onSelect={() => {
                        if (single || profile) router.push("/")
                    }}>Strona Główna</Nav.Item>
                )}

            </Nav>
        </Navbar>


        <Modal open={show} onClose={() => { setShow(false) }}>
            <Modal.Header>
                <Modal.Title>Dodawanie</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='flex flex-row gap-5'>
                    <Input placeholder='Tytuł'
                        onChange={(value) => {
                            setTitle(value != '' ? value : undefined)
                        }} />
                    <InputPicker data={data} placeholder="Kategoria" onSelect={(value) => {
                        setCategory(value != '' ? value : undefined)
                    }} />
                </div>
                <Input placeholder='Link do zdjęcia' className='mt-5'
                    onChange={(value) => {
                        setPhotoURL(value != '' ? value : undefined)
                    }} />

            </Modal.Body>
            <Modal.Footer>
                <Button
                    color="red"
                    disabled={validate(title, category, photoURL)}
                    active={!validate(title, category, photoURL)}
                    onClick={() => {
                        writePostData(user.uid, title, photoURL, category)
                        setShow(false)
                    }} appearance="primary">
                    Ok
                </Button>
                <Button onClick={() => { setShow(false) }} appearance="subtle">
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    </div>
}

export default NavBarManager