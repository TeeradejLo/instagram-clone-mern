import React, { useState, useEffect } from "react";
import './App.css';
import Post from "./Post";
import ImageUpload from "./ImageUpload";
import { db, auth } from "./firebase";
import Modal from '@material-ui/core/Modal';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Input } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import axios from "./axios";
import Pusher from "pusher-js";

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  small: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginRight: "15px",
  },
}));

function App() {
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [open, setOpen] = useState(false);
  const [openSignIn, setOpenSignIn] = useState(false);

  const [posts, setPosts] = useState([]);

  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log("auth applied");
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        //user logged in...
        console.log(authUser.displayName);
        setUser(authUser);
      } else {
        //user logged out...
        console.log(authUser);
        setUser(null);
      }
    })

    return () => {
      //perform some cleanup action
      console.log("auth cleaned up");
      unsubscribe();
    }
  }, [user]);

  const fetchPosts = async () => { 
    await axios.get("/sync").then(response => {
      setPosts(response.data.map(item => ({
        id: item._id,
        post: {
          username: item.user,
          caption: item.caption,
          imgUrl: item.image,
        },
      })));
    })
  };

  useEffect(() => {
    fetchPosts()
  }, []);

  useEffect(() => {
    const pusher = new Pusher('15c0b9cb2d73e58ca5ea', {
      cluster: 'ap1'
    });

    const channel = pusher.subscribe("posts");
    channel.bind("inserted", (data) => {fetchPosts()});
  }, []);

  function signUp(email, password) {
    return new Promise((resolve, reject) => {
      auth.createUserWithEmailAndPassword(email, password)
        .then((authUser) => {
          return authUser.user.updateProfile({
            displayName: username
          })})
        .then((userCreds) => resolve(userCreds))
        .catch((reason) => reject(reason));
    });
  }

  async function handleSignUp(event) {
    event.preventDefault();

    try {
      await signUp(email, password);
      setOpen(false);
    } catch  (error) {
      alert(error.message);
    }
  }

  function signIn(email, password) {
    return new Promise((resolve, reject) => {
      auth.signInWithEmailAndPassword(email, password)
        .then((userCreds) => resolve(userCreds))
        .catch((reason) => reject(reason));
    });
  }

  async function handleSignIn(event) {
    event.preventDefault();

    try {
      await signIn(email, password);
      setOpenSignIn(false);
    } catch  (error) {
      alert(error.message);
    }
  };

  const resetInfo = () => {
    setUsername(""); 
    setEmail(""); 
    setPassword("");
  };

  return (
    <div className="app">
      <Modal
        open={open}
        onClose={() => setOpen(false)}
      >
        <div style={modalStyle} className={classes.paper}>
          <form className = "app__signup">
            <center>
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/1200px-Instagram_logo.svg.png" alt="" className="app__headerImage" />
            </center>
            <Input
              type = "text"
              placeholder = "username"
              value = {username}
              onChange = {(e) => setUsername(e.target.value)}
            />
            <Input
              type = "text"
              placeholder = "email"
              value = {email}
              onChange = {(e) => setEmail(e.target.value)}
            />
            <Input
              type = "password"
              placeholder = "password"
              value = {password}
              onChange = {(e) => setPassword(e.target.value)}
            />
            <Button type = "submit" onClick = {handleSignUp}>Sign Up</Button>
          </form>
        </div>
      </Modal>

      <Modal
        open={openSignIn}
        onClose={() => setOpenSignIn(false)}
      >
        <div style={modalStyle} className={classes.paper}>
          <form className = "app__signup">
            <center>
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/1200px-Instagram_logo.svg.png" alt="" className="app__headerImage" />
            </center>
            <Input
              type = "text"
              placeholder = "email"
              value = {email}
              onChange = {(e) => setEmail(e.target.value)}
            />
            <Input
              type = "password"
              placeholder = "password"
              value = {password}
              onChange = {(e) => setPassword(e.target.value)}
            />
            <Button type = "submit" onClick = {handleSignIn}>Sign In</Button>
          </form>
        </div>
      </Modal> 

      <div className="app__header">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/1200px-Instagram_logo.svg.png" alt="" className="app__headerImage" />
        {
          user ? (
            <div className="app__logContainer">
              <Avatar 
                    className={classes.small}
                    alt = {user.displayName}
                    src = "/1.jpg"
              />
              <h3>{user.displayName}</h3>
              <Button className = "app__logout" onClick = {() => {auth.signOut(); resetInfo()}}>Log out</Button>
            </div>
          ) : (
            <div className="app__logContainer">
              <Button onClick = {() => {setOpenSignIn(true); resetInfo()}}>Sign In</Button>
              <Button onClick = {() => {setOpen(true); resetInfo()}}>Sign Up</Button>
            </div>
          )
        }
      </div>

      <div className="app__posts">
        {
          posts.map(({id, post}) => (
            <Post key = {id} postId = {id} currUser = {user} username = {post.username} caption = {post.caption} imgUrl = {post.imgUrl}/>
          ))
        }
      </div>

      <div className="app__footer">
        {
          user?.displayName ? (
            <ImageUpload username = {user.displayName}/>
          ) : (
            <h3 style={{textAlign: "center"}}>Signin to Upload</h3>
          )
        }
      </div>
    </div>
  );
}

export default App;