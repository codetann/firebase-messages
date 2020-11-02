import "./App.css";
import { Button, Form, Container } from "react-bootstrap";

import { useState, useRef } from "react";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

// firebase.initializeApp({
//   apiKey: "AIzaSyAlk1Z7sLQ0voAGJIKjC3xTYT8eB78x74s",
//   authDomain: "fir-messages-d316d.firebaseapp.com",
//   databaseURL: "https://fir-messages-d316d.firebaseio.com",
//   projectId: "fir-messages-d316d",
//   storageBucket: "fir-messages-d316d.appspot.com",
//   messagingSenderId: "944961045890",
//   appId: "1:944961045890:web:0b3427358d06e43f857b9b",
//   measurementId: "G-X7SQZ6QY86",
// });

firebase.initializeApp({
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
});

const auth = firebase.auth();
const firestore = firebase.firestore();

// main application
function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <div className="header">
        <Container className="header">
          <SignOut />
        </Container>
      </div>
      <section>
        <Container>
          {user ? <ChatRoom /> : <SignIn firebase={firebase} />}
        </Container>
      </section>
    </div>
  );
}

// sign in component
function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <div className="sign-in">
      <Button onClick={signInWithGoogle}>Sign in with Google</Button>
    </div>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <Button variant="outline-danger" onClick={() => auth.signOut()}>
        Sign Out
      </Button>
    )
  );
}

function ChatRoom() {
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);
  const dummy = useRef();

  const [formValue, setFromValue] = useState("");

  const [messages] = useCollectionData(query, { idField: "id" });

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    // creates a new document in the firestore
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFromValue("");

    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main className="messages">
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <div ref={dummy}></div>
      </main>

      <Form onSubmit={sendMessage}>
        <Form.Group className="form">
          <Form.Control
            className="form-input"
            value={formValue}
            onChange={(e) => setFromValue(e.target.value)}
            type="text"
          ></Form.Control>
          <Button type="submit">Send</Button>
        </Form.Group>
      </Form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "recieved";

  return (
    <div className={`message ${messageClass}`}>
      {messageClass === "recieved" && <img alt="profile" src={photoURL} />}
      <p>{text}</p>
      {messageClass === "sent" && <img alt="profile" src={photoURL} />}
    </div>
  );
}

export default App;
