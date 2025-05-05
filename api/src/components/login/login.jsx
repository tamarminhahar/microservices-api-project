import React, { useRef, useState } from 'react';
import styles from '../login/login.module.css';
import { useCurrentUser } from '../userProvider';
import { useNavigate, Link } from 'react-router-dom'
import CryptoJS from 'crypto-js';
//Login Form
export default function Login() {
    const nameRef = useRef();
    const passwordRef = useRef();
    const alertDivRef = useRef();
    const navigate = useNavigate();
    const { setCurrentUser } = useCurrentUser();
    const KEY = CryptoJS.enc.Utf8.parse('1234567890123456');
    const IV = CryptoJS.enc.Utf8.parse('6543210987654321');
    const [error, setError] = useState(null);

    //update the text in alert div.
    const manageMassages = (message) => {
        alertDivRef.current.innerText = message;
    }

    // check if the user exists in the DB.Returns the response status and the user-if exists.
    const checkUserExists = async (username, pass) => {
        try {
            const response = await fetch(`http://localhost:3000/users?username=${username}&_exact=true`);
            if (!response.ok) {
                throw new Error('Failed to fetch data from JSON Server');
            }
            const users = await response.json();
            if ((users.length > 0) && ((users[0].website === pass) || (users[0].website == CryptoJS.AES.encrypt(pass, KEY, {
                iv: IV,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
            }).toString())))
                return { ok: true, user: users[0] };
            else
                return { ok: false, user: null };
        } catch (error) {
            setError(err.message);
            return { ok: false, user: null };
        }
    };

    //if the user is valid - navigate to home page.
    const handleLoginSubmit = (event) => {
        event.preventDefault()
        checkUserExists(nameRef.current.value, passwordRef.current.value).then((exists) => {
            if (!exists.ok) {
                manageMassages('user name or password incorrect, try again');
            } else {
                let currentUser = {
                    id: exists.user.id,
                    username: nameRef.current.value,
                    email: exists.user.email,
                }
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                setCurrentUser(currentUser);
                navigate('/home');
            }
        });
    }

    if (error) return <p>Error: {error}</p>;

    return (
<div className={styles.loginForm}>
    <div id="container" className={styles.container}>
        <h3 className={styles.title}>Login</h3>
        <form onSubmit={handleLoginSubmit} className={styles.form}>
            <input ref={nameRef} type="text" placeholder="name" required className={styles.input} />
            <input ref={passwordRef} type="password" placeholder="password" required className={styles.input} />
            <div ref={alertDivRef} className={styles.alert}></div>
            <button type="submit" className={styles.button}>submit</button>
            <div className={styles.linkContainer}>
                <span>First time? </span>
                <Link to="/register" className={styles.link}>Register</Link>
            </div>
        </form>
    </div>
</div>


    )
}