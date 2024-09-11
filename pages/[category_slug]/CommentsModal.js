import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';
import './commentsModal.css';

const CommentsModal = ({ isOpen, onClose, postId }) => {
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [user, setUser] = useState(null);
    const [showFullComment, setShowFullComment] = useState({});
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (loggedInUser) {
            const foundUser = JSON.parse(loggedInUser);
            setUser(foundUser);
        }
    }, []);

    const fetchComments = useCallback(async () => {
        if (isOpen && postId) {
            setIsLoading(true);
            try {
                const response = await axios.get(`https://blog.tourismofkashmir.com/api_comments.php?post_id=${postId}`);
                setComments(response.data);
            } catch (error) {
                console.error("There was an error fetching the comments:", error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [isOpen, postId]);

    useEffect(() => {
        fetchComments();
    }, [isOpen, postId, fetchComments]);

    const postComment = async () => {
        if (!user) {
            // Show toast message for not logged in
            toast.error("Please log in to post the comment");
            return;
        }

        if (!newComment.trim()) return;

        const commentData = {
            post_id: postId,
            user_id: user?.id,
            content: newComment,
        };

        try {
            const response = await axios.post('https://blog.tourismofkashmir.com/api_comments.php', commentData);
            fetchComments();
            setNewComment('');
            console.log(response.data.message);
        } catch (error) {
            console.error("There was an error posting the comment:", error);
        }
    };

    const toggleFullComment = (commentIndex) => {
        setShowFullComment({
            ...showFullComment,
            [commentIndex]: !showFullComment[commentIndex]
        });
    };

    // Function to fetch more comments
    const loadMoreComments = useCallback(async () => {
        setIsLoadingMore(true);
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 50));
        // Fetch more comments using offset and limit
        // Adjust offset and limit according to your requirements
        const offset = comments.length;
        const limit = 10;
        try {
            const response = await axios.get(`https://blog.tourismofkashmir.com/api_comments.php?post_id=${postId}&offset=${offset}&limit=${limit}`);
            setComments(prevComments => [...prevComments, ...response.data]);
        } catch (error) {
            console.error("There was an error fetching more comments:", error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [comments.length, postId]);

    // IntersectionObserver callback function
    const handleObserver = useCallback((entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
            // Fetch more comments when the target element is intersecting
            loadMoreComments();
        }
    }, [loadMoreComments]);

    useEffect(() => {
        // Create IntersectionObserver and observe the target element
        const observer = new IntersectionObserver(handleObserver, { threshold: 1 });
        const targetElement = document.getElementById('observer-target');
        if (targetElement) {
            observer.observe(targetElement);
        }
        // Cleanup function
        return () => {
            if (targetElement) {
                observer.unobserve(targetElement);
            }
        };
    }, [handleObserver]);

    return isOpen ? (
        <div className={`modal show ${isOpen ? 'modal-visible' : ''}`}>
            <div className="modal-content">
                <div id="modelHeader" className="modal-header">
                    <h2>Comments</h2>
                    <span className="close" onClick={onClose}>&times;</span>
                </div>
                <div className="modal-body">
                    {isLoading ? (
                        <div className="loading-comments-placeholder">
                            {[...Array(7)].map((_, index) => (
                                <div className="loading-comment-item" key={index}>
                                    <div className="loading-avatar"></div>
                                    <div className="loading-details">
                                        <div className="loading-line loading-name"></div>
                                        <div className="loading-line loading-message"></div>
                                        <div className="loading-line loading-message"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {comments.length === 0 ? (
                                <div className="no-comments-message">No comments yet.</div>
                            ) : (
                                <>
                                    {comments.map((comment, index) => (
                                        <div key={index} className="comment">
                                            <div className="comment-avatar">
                                                <img src={comment.avatar} alt="Avatar"/>
                                            </div>
                                            <div className="comment-content">
                                                <div className="comment-header">
                                                    <a className="comment-author" style={{ color: '#777', textDecoration: 'none' }} href={`#${comment.username}`}>
                                                        {comment.username}
                                                    </a>
                                                    <span className="comment-date">
                                                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <div className="comment-text">
                                                    {showFullComment[index] ? (
                                                        <>
                                                            {comment.content}{' '}
                                                            <a href="#!" className="read-more-link" onClick={() => toggleFullComment(index)}>Read less</a>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {comment.content.length > 100 ? `${comment.content.substring(0, 100)}...` : comment.content}
                                                            {comment.content.length > 100 && (
                                                                <a href="#!" className="read-more-link" onClick={() => toggleFullComment(index)}>Read more</a>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div id="observer-target"></div>
                                </>
                            )}
                        </>
                    )}
                </div>
                {isLoadingMore && (
                    <div className="loader">
                        <img src="https://blog.tourismofkashmir.com/kOnzy.gif" alt="Loading..." />
                    </div>
                )}
                <div className="modal-footer">
                    <input
                        type="text"
                        className="comment-input"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                    />
                    <button className="submit-comment-btn" onClick={postComment}>Post</button>
                </div>
            </div>
        </div>
    ) : null;
};

export default CommentsModal;
