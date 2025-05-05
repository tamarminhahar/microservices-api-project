import { React, useState, useEffect } from 'react'
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useCurrentUser } from '../userProvider';
import Comments from "../comments/comments";
import styles from './singlePost.module.css';
import NoPage from '../noPage';

//each todo in the todo list
function SinglePost({ post, setPosts, selectedPostId, setSelectedPostId }) {
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState(null);
    const [newPostData, setNewPostData] = useState({ title: '', body: '' });
    const [showBody, setShowBody] = useState(false);
    const { currentUser } = useCurrentUser();
    const navigate = useNavigate();
    const location = useLocation();

    //show the comments when refreshing the page.
    useEffect(() => {
        if (location.pathname === `/users/${currentUser.id}/posts/${post.id}/comments`) {
            if (!selectedPostId) {
                setSelectedPostId(post.id);
            }
        }
    }, [location.pathname, currentUser.id])


    //Delete a single todo from DB and display.
    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:3000/posts/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    //update the Tilte field of a post in db and display.
    const handleUpdatePost = async (updatedPost) => {
        try {
            const response = await fetch(`http://localhost:3000/posts/${updatedPost.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedPost),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const updatedResponsePost = await response.json();

            setPosts((prevPosts) =>
                prevPosts.map((post) => (post.id === updatedResponsePost.id ? updatedResponsePost : post))
            );

        } catch (err) {
            setError(err.message);
        }
    };

    //change the todo to an editing mode.Show V/X btns.
    const handleStartEdit = (post) => {
        setEditingId(post.id);
        setNewPostData({ title: post.title, body: post.body });
    };
    //Do not save the changes in the todo. Back to a regular display.
    const handleCancelEdit = () => {
        setEditingId(null);
        setNewPostData({ title: '', body: '' });
    };
    //Save the changes. Back to a regular display.
    const handleSaveEdit = (post) => {
        handleUpdatePost(post);
        setEditingId(null);
        setNewPostData({ title: '', body: '' });
    };

    return (
        <>
            {/*The comments */}
            <div className={styles.commentsDiv}>
                <Routes>
                    <Route path=':postId/comments' element={selectedPostId == post.id && <Comments />} />
                </Routes>
            </div>
            {editingId === post.id ? (
                <div>
                    {/*input for edinting the post title*/}
                    #{post.id}:
                    <input
                        type="text"
                        value={newPostData.title}
                        onChange={(e) =>
                            setNewPostData((prevData) => ({
                                ...prevData,
                                title: e.target.value,
                            }))
                        }
                        style={{ marginRight: '10px', flex: 1 }}
                    />
                </div>
            ) : (
                <span className={styles.title}>
                    #{post.id}: {typeof post.title === "string" ? post.title : JSON.stringify(post.title)}
                </span>

            )}

            {/*input for edinting the post body*/}
            {showBody && (editingId === post.id ? (
                <input
                    type="text"
                    value={newPostData.body}
                    onChange={(e) =>
                        setNewPostData((prevData) => ({
                            ...prevData,
                            body: e.target.value,
                        }))
                    }
                    style={{ marginRight: '10px', flex: 1 }}
                />
            ) : (
                <span>
                    {typeof post.title === "string" ? post.body : JSON.stringify(post.body)}
                </span>
            ))}


            {/*editing btns*/}
            <div className={styles.postActions} >
                {showBody ?
                    (<button onClick={() => {
                        setShowBody(false);
                        setEditingId(null);
                    }
                    }>Hide</button>)
                    : (<button onClick={() => setShowBody(true)}>Body</button >)
                }
                {showBody && (editingId !== post.id && (
                    <button onClick={() => handleStartEdit(post)}>
                        <img src="/img/edit.png" alt="Edit" />
                    </button>
                ))}
                {editingId === post.id && (
                    <>
                        <button
                            onClick={() =>
                                handleSaveEdit({
                                    ...post,
                                    title: newPostData.title,
                                    body: newPostData.body,
                                })
                            }
                        >
                            <img src="/img/checkmark.png" alt="Save" />
                        </button>

                        <button onClick={handleCancelEdit}>
                            <img src="/img/cancel.png" alt="Cancel" />
                        </button>
                    </>
                )}
                {/*delete post btn*/}
                {editingId !== post.id && (
                    <button onClick={() => handleDelete(post.id)} disabled={currentUser.id != post.userId}>
                        <img src="/img/trash.png" alt="Delete" />
                    </button>
                )}
            </div>
            {/*link to the post's comments*/}
            {
                editingId !== post.id && (
                    <button className='linkBtns' onClick={() => setSelectedPostId(post.id)}>
                        <Link
                            to={`/users/${post.userId}/posts/${post.id}/comments`}
                            state={{ postId: post.id }}
                        >
                            View Comments
                        </Link>
                    </button>
                )}

            {/*gray div for to close the comments div*/}
            {selectedPostId && <div className={styles.overlay} onClick={() => {
                setSelectedPostId(null)
                navigate(-1);
            }} />}

        </>
    )
}

export default SinglePost