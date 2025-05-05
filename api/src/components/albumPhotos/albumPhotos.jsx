import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import styles from './albumPhotos.module.css';


function AlbumPhotos() {
    const { albumid } = useParams();
    const [photos, setPhotos] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const PHOTOS_PER_PAGE = 10;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [newPhotoData, setNewPhotoData] = useState({ title: '', thumbnailUrl: '' });
    const [isAdding, setIsAdding] = useState(false);
    const firstLoad = useRef(true);

    const fetchPhotos = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/photos?albumId=${albumid}&_start=${page}&_limit=${PHOTOS_PER_PAGE}`);
            const data = await response.json();
            if (data.length < PHOTOS_PER_PAGE)
                setHasMore(false);
            setPhotos((prevPhotos) => [...prevPhotos, ...data]);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (firstLoad.current) {
            firstLoad.current = false
            fetchPhotos();
        }
    }, [page, albumid]);

    //Add a new photo to the selected album.
    const handleAddPhoto = async () => {
        if (!newPhotoData.title || !newPhotoData.thumbnailUrl) return;
        try {
            const response = await fetch(`http://localhost:3000/photos?albumId=${albumid}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    albumId: albumid,
                    title: newPhotoData.title,
                    thumbnailUrl: newPhotoData.thumbnailUrl
                }),
            });
            if (!response.ok)
                throw new Error(`${response.status}`);
            const addedPhoto = await response.json();
            setPhotos((prevPhotos) => [...prevPhotos, addedPhoto]);
            setIsAdding(false);
            setNewPhotoData({ name: '', body: '' });
        } catch (err) {
            setError(err.message);
        }
    };

    //Delete an album.
    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:3000/photos/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok)
                throw new Error(`Error: ${response.status}`);
            setPhotos((prevPhotos) => prevPhotos.filter((photo) => photo.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    //update the Tilte field in of a Photo in db and state.
    const handleUpdatePhoto = async (updatedPhoto) => {
        try {
            const response = await fetch(`http://localhost:3000/photos/${updatedPhoto.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedPhoto),
            });
            if (!response.ok)
                throw new Error(`Error: ${response.status}`);
            const updatedResponsePhoto = await response.json();
            setPhotos((prevPhotos) =>
                prevPhotos.map((photo) => (photo.id === updatedResponsePhoto.id ? updatedResponsePhoto : photo))
            );
        } catch (err) {
            setError(err.message);
        }
    };

    //change the album to an editing mode.Show V/X btns.
    const handleStartEdit = (photo) => {
        setEditingId(photo.id);
        setNewPhotoData({ ...newPhotoData, title: photo.title });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setNewPhotoData({ title: '', thumbnailUrl: '' });
    };

    //Do not save the changes in the album. Back to a regular display.
    const handleSaveEdit = (photo) => {
        const updatedPhoto = { ...photo, title: newPhotoData.title };
        handleUpdatePhoto(updatedPhoto);
        setEditingId(null);
        setNewPhotoData({ title: '', thumbnailUrl: '' });
    };

    //load 10 more photos if still exist in the db.
    const loadMorePhotos = () => {
        if (loading || !hasMore) return;
        setPage((prevPage) => prevPage + PHOTOS_PER_PAGE);
        fetchPhotos();
    };

    if (error) return <p>Error: {error}</p>;
    return (
        <div className={styles.photosPopup}>
            <h2 className={styles.photosHeader}>Photos in Album #{albumid}</h2>

            {/* Input for editing the photos title */}
            {isAdding && (
                <div className={styles.photosActions}>
                    <input
                        type="text"
                        className={styles.photosInput}
                        value={newPhotoData.title}
                        onChange={(e) =>
                            setNewPhotoData((prevData) => ({ ...prevData, title: e.target.value }))
                        }
                        placeholder="Enter new photo title"
                    />
                    <input
                        type="text"
                        className={styles.photosInput}
                        value={newPhotoData.thumbnailUrl}
                        onChange={(e) =>
                            setNewPhotoData((prevData) => ({ ...prevData, thumbnailUrl: e.target.value }))
                        }
                        placeholder="Enter new photo url"
                    />
                    <button onClick={handleAddPhoto} className={styles.photosAddButton}>
                        Add Photo
                    </button>
                    <button onClick={() => setIsAdding(false)} className={styles.photosAddButton}>
                        Cancel
                    </button>
                </div>
            )}
            <button onClick={() => setIsAdding(true)} className={styles.photosAddButton}>
                Add New Photo
            </button>

            <div className={styles.photosGrid}>
                <ul>
                    {photos.map((photo, index) => (
                        <li>
                            <div key={index} className={styles.photoCard}>
                                <div className={styles.photoCardActions}>
                                    {editingId === photo.id ? (
                                        <>
                                            #{photo.id}:
                                            <input
                                                type="text"
                                                value={newPhotoData.title}
                                                onChange={(e) =>
                                                    setNewPhotoData({ ...newPhotoData, title: e.target.value })
                                                }
                                                className={styles.photosInput}
                                            />
                                        </>
                                    ) : (
                                        <span>
                                            #{photo.id}:{' '}
                                            {typeof photo.title === 'string' ? photo.title : JSON.stringify(photo.title)}
                                        </span>
                                    )}
                                    <div className={styles.todoActions}>
                                        {editingId !== photo.id && (
                                            <button onClick={() => handleStartEdit(photo)}>
                                                <img src="/img/edit.png" alt="Edit" />
                                            </button>
                                        )}
                                        {editingId === photo.id && (
                                            <>
                                                <button onClick={() => handleSaveEdit(photo)}>
                                                    <img src="/img/checkmark.png" alt="Save" />
                                                </button>
                                                <button onClick={handleCancelEdit}>
                                                    <img src="/img/cancel.png" alt="Cancel" />
                                                </button>
                                            </>
                                        )}

                                        {editingId !== photo.id && (
                                            <button onClick={() => handleDelete(photo.id)}>
                                                <img src="/img/trash.png" alt="Delete" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <img src={photo.thumbnailUrl} alt={photo.title} className={styles.photoImg} />
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            {photos.length > 0 ? (
                hasMore ? (
                    <button
                        onClick={loadMorePhotos}
                        className={styles.photosAddButton}
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Load More'}
                    </button>
                ) : (
                    <p>No more photos to display.</p>
                )
            ) : (
                <p>no photos for this photo 😒</p>
            )}
        </div>
    );

}

export default AlbumPhotos;
