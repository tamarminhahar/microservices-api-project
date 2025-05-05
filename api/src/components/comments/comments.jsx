import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from "react-router-dom";
import { useCurrentUser } from '../userProvider';
import styles from './comments.module.css';

//Comments list of a single post.
const Comments = () => {
    const [editingId, setEditingId] = useState(null);
    const location = useLocation();
    const { currentUser } = useCurrentUser();
    const postId = location.state?.postId;
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newCommentData, setNewCommentData] = useState({ name: '', body: '' });
    const firstLoad = useRef(true);
    
    //fetch all comments of the selected post when the component is load.
    const fetchComments = async (postId) => {
        try {
            const response = await fetch(`http://localhost:3000/comments?postId=${postId}&_exact=true`);
            if (!response.ok) {
                throw new Error('Failed to fetch comments');
            }
            const data = await response.json();
            setComments(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (firstLoad.current) {
            firstLoad.current = false;
            fetchComments(postId);
        }
    }, [postId]);

    //Add a new comment to the selected post.
    const handleAddComment = async () => {
        if (!newCommentData.name || !newCommentData.body) return;
        try {
            const response = await fetch(`http://localhost:3000/comments?postId=${postId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postId: postId,
                    name: newCommentData.name,
                    email: currentUser.email,
                    body: newCommentData.body,
                }),
            });
            if (!response.ok) {
                throw new Error(`${response.status}`);
            }
            const addedComment = await response.json();
            setComments((prevComments) => [...prevComments, addedComment]);
            setIsAdding(false);
            setNewCommentData({ name: '', body: '' });
        } catch (err) {
            setError(err.message);
        }
    };

    //Delete a comment.
    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:3000/comments/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok)
                throw new Error(`${response.status}`);
            setComments((prevComments) => prevComments.filter((comment) => comment.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    //update the Tilte field of a comment in db and state.
    const handleUpdateComments = async (updatedComments) => {
        try {
            const response = await fetch(`http://localhost:3000/comments/${updatedComments.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedComments),
            });
            if (!response.ok)
                throw new Error(`${response.status}`);
            const updatedResponseComments = await response.json();
            setComments((prevComments) =>
                prevComments.map((comment) => (comment.id === updatedResponseComments.id ? updatedResponseComments : comment))
            );
        } catch (err) {
            setError(err.message);
        }
    };

    //change the comment to an editing mode.Show V/X btns.
    const handleStartEdit = (comment) => {
        setEditingId(comment.id);
        setNewCommentData({ name: comment.name, body: comment.body });
    };

    //Do not save the changes in the comment. Back to a regular display.
    const handleCancelEdit = () => {
        setEditingId(null);
        setNewCommentData({ name: '', body: '' });
    };

    //Save the changes. Back to a regular display.
    const handleSaveEdit = (comment) => {
        handleUpdateComments(comment);
        setEditingId(null);
        setNewCommentData({ name: '', body: '' });
    };

    if (loading) return <p>Loading comments...</p>;
    if (error) return <p>Error: {error}</p>;
    return (
        <div className={styles.commentsContainer}>
            <h1>Comments for Post #{postId}</h1>
            {/* comments list */}
            <ul>
                {comments.length > 0 ? comments.map((comment) => (
                    <li key={comment.id}>
                        {(editingId === comment.id ? (
                            <input
                                type="text"
                                value={newCommentData.name}
                                onChange={(e) =>
                                    setNewCommentData((prevData) => ({
                                        ...prevData,
                                        name: e.target.value,
                                    }))
                                }
                                className={styles.inputField}
                            />
                        ) : (
                            <strong>{comment.name}</strong>
                        ))}
                        {/* input for editing the comment body */}
                        {(editingId === comment.id ? (
                            <input
                                type="text"
                                value={newCommentData.body}
                                onChange={(e) =>
                                    setNewCommentData((prevData) => ({
                                        ...prevData,
                                        body: e.target.value,
                                    }))
                                }
                                className={styles.inputField}
                            />
                        ) : (
                            <div>{comment.body}</div>
                        ))}
                        <div><strong>By:</strong> {comment.email}</div>

                        {/* editing btns */}
                        <div className={styles.commentActionBtn}>
                            {(editingId !== comment.id) && (
                                <button onClick={() => handleStartEdit(comment)} disabled={currentUser.email !== comment.email}>
                                    <img src="/img/edit.png" alt="Edit" />
                                </button>
                            )}
                            {editingId === comment.id && (
                                <>
                                    <button
                                        onClick={() =>
                                            handleSaveEdit({
                                                ...comment,
                                                name: newCommentData.name,
                                                body: newCommentData.body,
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
                            {/* delete post btn */}
                            {(editingId !== comment.id) && (
                                <button onClick={() => handleDelete(comment.id)} disabled={currentUser.email !== comment.email}>
                                    <img src="/img/trash.png" alt="Delete" />
                                </button>
                            )}
                        </div>
                    </li>
                )) : <p> no Comments found😒</p>}
            </ul>

            {/* small form for the new comment */}
            {isAdding && (
                <div>
                    <div>
                        <input
                            type="text"
                            value={newCommentData.name}
                            onChange={(e) => setNewCommentData((prevData) => ({
                                ...prevData,
                                name: e.target.value,
                            }))}
                            placeholder="Enter new comment name"
                            className={styles.inputField}
                        />
                    </div>
                    <textarea
                        rows="10"
                        cols="50"
                        placeholder="Enter new comment body"
                        onChange={(e) => setNewCommentData((prevData) => ({
                            ...prevData,
                            body: e.target.value,
                        }))}
                        className={styles.inputField}
                    />
                    <button onClick={handleAddComment} className={styles.addButton}>Add Comment</button>
                    <button onClick={() => setIsAdding(false)} className={styles.cancelButton}>Cancel</button>
                </div>
            )}
            {!isAdding &&
                <button onClick={() => setIsAdding(true)} className={styles.addButton}>Add New Comment</button>
            }
        </div>
    );
}

export default Comments;
