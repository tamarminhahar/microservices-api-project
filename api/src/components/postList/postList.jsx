import React, { useEffect, useState } from "react";
import { useCurrentUser } from '../userProvider';
import SinglePost from "../singlePost/singlePost";
import styles from './postList.module.css'
import Nav from "../nav/nav";

//Manage the list of all the posts.
const PostList = () => {
    const { currentUser } = useCurrentUser();
    const [posts, setPosts] = useState([]);
    const [displayedPosts, setDisplayedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCriteria, setFilterCriteria] = useState("id"); // קריטריון החיפוש
    const [isAdding, setIsAdding] = useState(false);
    const [newPostData, setNewPostData] = useState({ title: '', body: '' });
    const [selectedUser, setSelectedUser] = useState({ username: currentUser.username, id: null });
    const [displayedUsername, setDisplayedUsername] = useState(currentUser.username);
    const [selectedPostId, setSelectedPostId] = useState(null);

    //fetch all posts of the current user when the component is load.
    const fetchPosts = async (id) => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3000/posts?userId=${id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch posts");
            }
            const data = await response.json();
            setPosts(data);
            setDisplayedPosts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (currentUser) {
            fetchPosts(currentUser.id);
        }
    }, [currentUser]);

    //Returns the selceted user's id from DB according to his username.
    const findSelectedUserId = async () => {
        setDisplayedUsername(selectedUser.username);
        try {
            const response = await fetch(`http://localhost:3000/users?username=${selectedUser.username}&_exact=true`);
            if (!response.ok) {
                throw new Error("Failed to fetch posts");
            }
            const data = await response.json();
            fetchPosts(data[0].id);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    //Search a post acooriding to its id/title.
    const filterPosts = () => {
        if (searchTerm.trim() === "") {
            setDisplayedPosts(posts);
            return;
        }
        if (filterCriteria === "id") {
            setDisplayedPosts(
                posts.filter((post) =>
                    post.id.toString().includes(searchTerm)
                )
            );
        } else if (filterCriteria === "title") {
            const sortedPosts = posts
                .filter((post) => post.title.toLowerCase().includes(searchTerm.toLowerCase()))
                .sort((a, b) => {//sort the results.
                    const aStartsWith = a.title.toLowerCase().startsWith(searchTerm.toLowerCase());
                    const bStartsWith = b.title.toLowerCase().startsWith(searchTerm.toLowerCase());
                    if (aStartsWith && !bStartsWith) {
                        return -1;
                    }
                    if (!aStartsWith && bStartsWith) {
                        return 1;
                    }
                    return 0;
                });

            setDisplayedPosts(sortedPosts);
        }
    };
    useEffect(() => {
        filterPosts();
    }, [searchTerm, filterCriteria, posts]);

    //Add a new post to the DB.
    const handleAddPost = async () => {
        if (!newPostData.title || !newPostData.body) return;
        try {
            const response = await fetch(`http://localhost:3000/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: Number(currentUser.id),
                    title: newPostData.title,
                    body: newPostData.body
                }),
            });
            if (!response.ok)
                throw new Error(`Error: ${response.status}`);
            const addedPost = await response.json();
            setPosts((prevPosts) => [...prevPosts, addedPost]);
            setIsAdding(false);
            setNewPostData({ title: "", body: "" });
        } catch (err) {
            setError(err.message);
        }
    };
    //Back to default display.
    const resetSearch = () => {
        setSearchTerm("");
        setDisplayedPosts(posts);
        setFilterCriteria("id");
    };

    if (loading) return <p>Loading posts...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <>
            <Nav />
            <div className={styles.postListContainer}>
                <h2 className={styles.header}>{displayedUsername}'s Posts</h2>

                <label>
                    More Posts
                    <div className={styles.inputContainer}>
                        <input
                            type="text"
                            value={selectedUser.username}
                            placeholder="Enter user name"
                            onChange={(e) =>
                                setSelectedUser((prev) => ({ ...prev, username: e.target.value }))
                            }
                        />
                        <button
                            type="button"
                            onClick={findSelectedUserId}
                            className={styles.okButton}
                        >
                            OK
                        </button>
                        <button
                            onClick={() => {
                                setSelectedUser({ username: currentUser.username, id: currentUser.id });
                                fetchPosts(currentUser.id);
                            }}
                            className={styles.myPostsButton}
                        >
                            My Posts
                        </button>
                    </div>
                </label>

                <div className={styles.searchSection}>
                    <label className={styles.searchLabel}>
                        Search by:
                        <select
                            value={filterCriteria}
                            onChange={(e) => setFilterCriteria(e.target.value)}

                        >
                            <option value="id">ID</option>
                            <option value="title">Title</option>
                        </select>
                    </label>
                    <input
                        type="text"
                        placeholder={`Search by ${filterCriteria}`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button onClick={resetSearch} className={styles.resetButton}>
                        Reset Search
                    </button>
                </div>

                <ul className={styles.postList}>
                    {displayedPosts.length > 0 ? (
                        displayedPosts.map((post, index) => (
                    
                            <li key={index} className={styles.postItem}>
                                <SinglePost
                                    post={post}
                                    setPosts={setPosts}
                                    selectedPostId={selectedPostId}
                                    setSelectedPostId={setSelectedPostId}
                                    className={styles.singlePost}
                                />
                            </li>
                        ))
                    ) : (
                        <p className={styles.noPostsMessage}>No Posts Found 😒</p>
                    )}
                </ul>

                {isAdding && (
                    <div className={styles.addPostContainer}>
                        <input
                            type="text"
                            value={newPostData.title}
                            onChange={(e) =>
                                setNewPostData((prevData) => ({
                                    ...prevData,
                                    title: e.target.value,
                                }))
                            }
                            placeholder="Enter new post title"
                        />
                        <input
                            type="text"
                            value={newPostData.body}
                            onChange={(e) =>
                                setNewPostData((prevData) => ({
                                    ...prevData,
                                    body: e.target.value,
                                }))
                            }
                            placeholder="Enter new post body"
                            className={styles.newPostInput}
                        />
                        <div className={styles.addPostBtns}>
                            <button onClick={handleAddPost} className={styles.addPostButton}>
                                Add Post
                            </button>
                            <button
                                onClick={() => setIsAdding(false)}
                                className={styles.cancelButton}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
                {!isAdding &&
                    <button onClick={() => setIsAdding(true)} className={styles.addNewPostButton}>
                        Add New Post
                    </button>
                }
            </div>
        </>
    );

};

export default PostList;
