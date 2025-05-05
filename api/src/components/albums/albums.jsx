import React, { useState, useEffect } from 'react';
import { useCurrentUser } from '../userProvider';
import { useNavigate } from 'react-router-dom';
import SingleAlbum from '../singleAlbum/singleAlbum';
import Nav from "../nav/nav";
import styles from './albums.module.css';

//Manage the list of all the albums.
const Albums = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser } = useCurrentUser();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  //fetch all albums of the current user when the component is load.
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await fetch(`http://localhost:3000/albums?userId=${currentUser.id}`);
        const data = await response.json();
        setAlbums(data);
        setLoading(false);
      } catch (error) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchAlbums();
  }, [currentUser.id]);

  //Search a album acooriding to its id/title.
  const displayedAlbums = searchQuery
    ? albums.filter((album) =>
      album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.id.toString().includes(searchQuery)
    )
    : albums;

  //Add a new album to the DB.
  const handleAddAlbum = async () => {
    if (!newTitle) return;
    try {
      const response = await fetch(`http://localhost:3000/albums`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: Number(currentUser.id),
          title: newTitle,
          completed: false,
        }),
      });
      if (!response.ok)
        throw new Error(`Error: ${response.status}`);
      const addedAlbum = await response.json();
      setAlbums((prevAlbums) => [...prevAlbums, addedAlbum]);
      setIsAdding(false);
      setNewTitle("");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading albums...</p>;
  if (error) return <p>Error: {error}</p>;
  return (
    <>
      <Nav />
      <div className={styles.albumsContainer}>
        <h2 className={styles.albumsHeader}>{currentUser.username}'s Albums</h2>
        <div className={styles.albumsButtons}>
        </div>

        {/* Search btn and input */}
        <div className={styles.albumsSearchContainer}>
          <input
            type="text"
            className={styles.albumsSearchInput}
            placeholder="Search by ID or title"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {/* Reset btn */}
          <button onClick={() => setSearchQuery('')} className={styles.albumsSearchButton}>Reset</button>
        </div>

        {/* Album list */}
        <ul className={styles.albumsList}>
          {displayedAlbums.length > 0
            ? displayedAlbums.map((album, index) => (
              <li key={index} className={styles.albumsListItem}>
                <SingleAlbum album={album} />
              </li>
            ))
            : <p>no results found😒</p>}
        </ul>
      </div>
      {/* Small form for the new album */}
      {isAdding && (
        <div className={styles.addAlbumContainer}>
          <input
            type="text"
            className={styles.addAlbumInput}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter new album title"
          />
          <button onClick={handleAddAlbum} className={styles.addAlbumButton}>Add Album</button>
          <button onClick={() => setIsAdding(false)} className={styles.addAlbumButton}>Cancel</button>
        </div>
      )}
      {!isAdding && <button onClick={() => setIsAdding(true)} className={styles.addAlbumButton}>Add New Album</button>}
    </>
  );
}

export default Albums;


