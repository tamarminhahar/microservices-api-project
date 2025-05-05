import { React, useState, useEffect } from 'react'
import { Link, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useCurrentUser } from '../userProvider';
import AlbumPhotos from '../albumPhotos/albumPhotos';
import classes from './singleAlbum.module.css';

//Each album item in the albums list
function SingleAlbum({ album }) {
    const { currentUser } = useCurrentUser();
    const [showPhotos, setShowPhotos] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === `/users/${currentUser.id}/albums/${album.id}/photos`) {
            setShowPhotos(true);
        } else {
            setShowPhotos(false);
        }
    }, [location.pathname, currentUser.id, album.id])

    return (
        <>
            {/*The photos */}
            <Routes>
                <Route path=':albumid/photos' element={showPhotos && <AlbumPhotos />} />
                {/* <Route path="*" element={<Navigate to='/a'/>} /> */}
            </Routes>

            {/*link to the album's photos*/}
            <button className='linkBtns' onClick={() => setShowPhotos(true)}>
                <Link to={`/users/${currentUser.id}/albums/${album.id}/photos`} className={classes.singleAlbumLink}>
                    <strong>#{album.id}:</strong> {album.title}
                </Link>
            </button>

            {/*gray div for to close the comments div*/}
            {showPhotos && <div className={classes.overlay} onClick={() => {
                setShowPhotos(false);
                navigate(-1);
            }
            } />}
        </>
    );
}

export default SingleAlbum;
