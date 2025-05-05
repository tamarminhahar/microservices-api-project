import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../userProvider';
import styles from './nav.module.css'
function Nav() {
    const navigate = useNavigate();
    const { currentUser, setCurrentUser } = useCurrentUser();
    const handleLogout = () => {
        localStorage.removeItem('currentUser');  // מחיקת המידע ב-Local Storage
        setCurrentUser({ id: -1, username: '', website: '' });
        navigate('/login');  // ניווט לעמוד הכניסה
    };
    return (
        <nav className={styles.nav}>
            <button onClick={() => navigate('/home')} className={styles.navButton}>Home</button>
            <button onClick={() => navigate(`/info`)} className={styles.navButton}>Info</button>
            <button onClick={() => navigate(`/users/${currentUser.id}/todos`)} className={styles.navButton}>Todos</button>
            <button onClick={() => navigate(`/users/${currentUser.id}/posts`)} className={styles.navButton}>Posts</button>
            <button onClick={() => navigate(`/users/${currentUser.id}/albums`)} className={styles.navButton}>Albums</button>
            <button onClick={handleLogout} className={styles.navButton}>Logout</button>
        </nav>

    )
}

export default Nav