import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Forum = () => {
    const [topics, setTopics] = useState([]);
    const [newTopic, setNewTopic] = useState({ title: '', description: '' });
    const [editingTopic, setEditingTopic] = useState(null);
    const [comments, setComments] = useState({});
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentContent, setEditingCommentContent] = useState('');
    const [selectedTopicId, setSelectedTopicId] = useState('');
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    const getUserFromToken = () => {
        const token = localStorage.getItem('token'); 
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1])); 
            return { username: payload.username, id: payload.id }; 
        }
        return null; 
    };

    useEffect(() => {
        const user = getUserFromToken();
        if (user) {
            setCurrentUser(user);
            console.log('Current user:', user); // Debugging line
        }
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/topics');
            setTopics(response.data);
        } catch (error) {
            console.error("Error fetching topics:", error);
            setError("Could not load topics. Please try again later.");
        }
    };

    const createOrUpdateTopic = async () => {
        if (!newTopic.title.trim()) {
            setError("Please provide a title for the topic.");
            return;
        }

        if (!newTopic.description.trim()) {
            setError("Please provide a description for the topic.");
            return;
        }

        const topicData = { ...newTopic, createdBy: currentUser?.username };
        try {
            if (editingTopic) {
                const response = await axios.put(`http://localhost:4000/api/topics/${editingTopic._id}`, topicData);
                setTopics(topics.map(topic => (topic._id === editingTopic._id ? response.data : topic)));
                setEditingTopic(null);
            } else {
                const response = await axios.post('http://localhost:4000/api/topics', topicData,{headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}});
                console.log(response.data)
                setTopics([...topics, response.data]);
                setSelectedTopicId(response.data._id);
            }
            setNewTopic({ title: '', description: '' });
            setError(null);
        } catch (error) {
            console.error("Error saving topic:", error);
            setError("Failed to save topic. Please try again.");
        }
    };

    const deleteTopic = async (topicId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this topic?"); // Prompt for topic deletion
        if (!confirmDelete) return; // If the user cancels, do nothing
    
        try {
            console.log(topicId);
            let res = await axios.delete(`http://localhost:4000/api/topics/${topicId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            console.log(res.data);
            setTopics(topics.filter(topic => topic._id !== topicId));
            if (selectedTopicId === topicId) {
                setSelectedTopicId('');
                setNewTopic({ title: '', description: '' });
            }
            setError(null);
        } catch (error) {
            console.error("Error deleting topic:", error);
            setError("Failed to delete topic. Please try again.");
        }
    };
    

    const fetchComments = async (topicId) => {
        try {
            const response = await axios.get(`http://localhost:4000/api/topics/${topicId}/comments`);
            setComments(prev => ({ ...prev, [topicId]: response.data }));
        } catch (error) {
            console.error("Error fetching comments:", error);
            setError("Could not load comments. Please try again.");
        }
    };

    const createComment = async (topicId) => {
        if (!newComment.trim()) return;
        const commentData = { username: currentUser?.username, content: newComment };
        try {
            const response = await axios.post(`http://localhost:4000/api/topics/${topicId}/comments`, commentData,{headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}});
            setComments(prev => ({ ...prev, [topicId]: [...(prev[topicId] || []), response.data] }));
            setNewComment('');
            setError(null);
        } catch (error) {
            console.error('Error creating comment:', error);
            setError("Failed to create comment. Please try again.");
        }
    };

    const updateComment = async (topicId) => {
        if (!editingCommentContent.trim()) return;
        try {
            const response = await axios.put(`http://localhost:4000/api/topics/${topicId}/comments/${editingCommentId}`, {
                content: editingCommentContent
            });
            setComments(prev => ({
                ...prev,
                [topicId]: prev[topicId].map(comment => (comment._id === editingCommentId ? response.data : comment))
            }));
            setEditingCommentId(null);
            setEditingCommentContent('');
            setError(null);
        } catch (error) {
            console.error('Error updating comment:', error);
            setError("Failed to update comment. Please try again.");
        }
    };

    const deleteComment = async (topicId, commentId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this comment?"); // Prompt for comment deletion
        if (!confirmDelete) return; // If the user cancels, do nothing
    
        try {
            await axios.delete(`http://localhost:4000/api/topics/${topicId}/comments/${commentId}`);
            setComments(prev => ({
                ...prev,
                [topicId]: prev[topicId].filter(comment => comment._id !== commentId),
            }));
            setError(null);
        } catch (error) {
            console.error("Error deleting comment:", error);
            setError("Failed to delete comment. Please try again.");
        }
    };

    const handleTopicChange = (e) => {
        const topicId = e.target.value;
        setSelectedTopicId(topicId);
        if (topicId) {
            fetchComments(topicId);
            setEditingTopic(null);
        } else {
            setComments({});
            setNewTopic({ title: '', description: '' });
        }
    };

    const handleEditClick = (topic) => {
        setEditingTopic(topic);
        setNewTopic({ title: topic.title, description: topic.description });
    };
    

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <h2 style={{ textAlign: 'center' }}>Join the Discussion!</h2>
            {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}

            {currentUser && (
    <>
        <h3>Create a New Topic</h3>
        <div style={{ marginBottom: '20px' }}>
            <input
                type="text"
                placeholder="Title"
                value={newTopic.title}
                onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            />
            <textarea
                placeholder="Description"
                value={newTopic.description}
                onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            />
            <button onClick={createOrUpdateTopic} style={{ padding: '10px 20px' }}>
                Create Topic
            </button>
        </div>


                    <h3>Choose a Topic</h3>
                    <select
                        value={selectedTopicId}
                        onChange={handleTopicChange}
                        style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
                    >
                        <option value="">Select a topic</option>
                        {topics.map(topic => (
                            <option key={topic._id} value={topic._id}>{topic.title}</option>
                        ))}
                    </select>

                    {selectedTopicId && (
                        <div>
                            <h3>Topic Details</h3>
                            {topics.find(topic => topic._id === selectedTopicId) && (
                                <>
                                    {editingTopic ? (
    <>
        <h4>Edit Topic</h4>
        <div style={{ marginBottom: '10px' }}>
            <label htmlFor="editTitle" style={{ display: 'block', marginBottom: '5px' }}>Title:</label>
            <input
                id="editTitle"  // Added id for accessibility
                value={newTopic.title}
                onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            />
        </div>
        <div style={{ marginBottom: '10px' }}>
            <label htmlFor="editDescription" style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
            <textarea
                id="editDescription" // Added id for accessibility
                value={newTopic.description}
                onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            />
        </div>
        <button onClick={createOrUpdateTopic} style={{ padding: '10px 20px' }}>Update Topic</button>
        <button onClick={() => setEditingTopic(null)} style={{ padding: '10px 20px', marginLeft: '10px' }}>Cancel</button>
    </>
) : (
                                        <>
                                            <div style={{ marginBottom: '10px' }}>
                                                <div style={{ marginBottom: '5px' }}>
                                                    <strong>Title: </strong>
                                                    <span>{topics.find(topic => topic._id === selectedTopicId).title}</span>
                                                </div>

                                                <div style={{ marginBottom: '5px' }}>
                                                    <strong>Description: </strong>
                                                    <span>{topics.find(topic => topic._id === selectedTopicId).description}</span>
                                                </div>

                                                <div style={{ marginBottom: '5px' }}>
                                                    <strong>Created By: </strong>
                                                    <span>{topics.find(topic => topic._id === selectedTopicId).createdBy}</span>
                                                </div>

                                                <div style={{ marginBottom: '5px' }}>
                                                <strong>Created At: </strong>
                                                <span>{new Date(topics.find(topic => topic._id === selectedTopicId).createdAt).toLocaleString()}</span>
                                                </div>
                                            </div>

                                            {/* Show edit and delete buttons only for the user who created the topic */}
                                            {currentUser?.username === topics.find(topic => topic._id === selectedTopicId).createdBy && (
                                                <>
                                                    <button onClick={() => deleteTopic(selectedTopicId)} style={{ padding: '10px 20px' }}>Delete Topic</button>
                                                    <button onClick={() => handleEditClick(topics.find(topic => topic._id === selectedTopicId))} style={{ padding: '10px 20px', marginLeft: '10px' }}>Edit Topic</button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </>
                            )}

                            <h4>Comments</h4>
                            <textarea
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
                            />
                            <button onClick={() => createComment(selectedTopicId)} style={{ padding: '10px 20px' }}>Add Comment</button>

                            <div>
                            {comments[selectedTopicId]?.map(comment => (
    <div key={comment._id} style={{ borderBottom: '1px solid #ccc', marginBottom: '10px', paddingBottom: '10px', display: 'flex', alignItems: 'center' }}>
        <strong>{comment.username}:</strong>
        {editingCommentId === comment._id ? (
            <>
                <textarea
                    value={editingCommentContent}
                    onChange={(e) => setEditingCommentContent(e.target.value)}
                    style={{ marginLeft: '10px', padding: '10px', width: '50%', height: '30px' }}
                />
                <button onClick={() => updateComment(selectedTopicId)} style={{ marginLeft: '10px', padding: '5px 10px' }}>Update</button>
                <button onClick={() => setEditingCommentId(null)} style={{ marginLeft: '10px', padding: '5px 10px' }}>Cancel</button>
            </>
        ) : (
            <>
                <span style={{ marginLeft: '10px' }}>{comment.content}</span>
                {/* Add this line to display the createdAt timestamp */}
                <span style={{ marginLeft: '10px', fontSize: 'smaller', color: '#777' }}>
                    (Sent at: {new Date(comment.createdAt).toLocaleString()})
                </span>
                {currentUser && currentUser.username === comment.username && (
                    <>
                        <button onClick={() => {
                            setEditingCommentId(comment._id);
                            setEditingCommentContent(comment.content);
                        }} style={{ marginLeft: '10px', padding: '5px 10px' }}>Edit</button>
                        <button onClick={() => deleteComment(selectedTopicId, comment._id)} style={{ marginLeft: '10px', padding: '5px 10px' }}>Delete</button>
                    </>
                )}
            </>
        )}
    </div>
    )) || <p>No comments yet. Be the first to comment!</p>}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Forum;
