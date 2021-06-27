import React, { useState, useEffect } from "react";
import "./Post.css";
import Avatar from "@material-ui/core/Avatar";
import { db } from "./firebase";
import firebase from "firebase";

function Post({ currUser, postId, username, caption, imgUrl }) {
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState("");

    useEffect(() => {
        let unsubscribe;
        if (postId) {
            unsubscribe = db
                            .collection("posts")
                            .doc(postId)
                            .collection("comments")
                            .orderBy("timestamp", "asc")
                            .onSnapshot((snapshot) => {
                                setComments(snapshot.docs.map((doc) => ({id: doc.id, comment: doc.data()})));
                            });
        }
        
        return () => {
            unsubscribe();
        }
    }, [postId]);

    const handlePostComment = (event) => {
        event.preventDefault();
        db
            .collection("posts")
            .doc(postId)
            .collection("comments")
            .add({
                text: comment,
                username: currUser.displayName,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()  
            });
        setComment("");
    }; 

    let commentSection;
    if (comments.length > 0) {
        commentSection = <div className="post__comments">
                            {comments.map(({id, comment}) => (
                                <p key = {id}>
                                    <strong>{comment.username}</strong> {comment.text}
                                </p>
                            ))}
                        </div>;
    }

    return (
        <div className = "post">
            {/* Header */}
            <div className="post__header">
                <Avatar 
                    className = "post__avatar"
                    alt = {username}
                    src = "/1.jpg"
                />
                <h3>{username}</h3>
            </div>

            {/* Image */}
            <img className = "post__image" src={imgUrl} alt="" />

            {/* username + caption */}
            <h4 className = "post__text"><strong>{username}</strong> {caption}</h4>

            {commentSection}

            {
                currUser && (
                    <form className = "post__commentBox">
                        <input
                            className = "post__input"
                            type = "text"
                            placeholder = "Add a comment..."
                            value = {comment}
                            onChange ={(e) => setComment(e.target.value)}
                        />
                        <button className="post__button" disabled = {!comment} onClick = {handlePostComment} type = "submit">Post</button>
                    </form>
                )
            }
            
        </div>
    )
}

export default Post;
