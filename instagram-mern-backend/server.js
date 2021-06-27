import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Pusher from "pusher";
import Posts from "./dbModel.js";

//app config
const app = express();
const port = process.env.PORT || 8080;
const pusher = new Pusher({
  appId: "1219484",
  key: "15c0b9cb2d73e58ca5ea",
  secret: "850ecb79b8c55df3679f",
  cluster: "ap1",
  useTLS: true
});

//middlewares
app.use(express.json());
app.use(cors());

//DB config
/* MongoDB.com => name: admin, password: cLtyGP9idPVHCNrv */
const connection_url = "mongodb+srv://admin:cLtyGP9idPVHCNrv@cluster0.jantq.mongodb.net/instagramdb?retryWrites=true&w=majority"
mongoose.connect(connection_url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
    console.log("db connected");
    
    const changeStream = mongoose.connection.collection("posts").watch();
    changeStream.on("change", (change) => {
        console.log("change triggered...")
        console.log(change);
        console.log("change end...");

        if (change.operationType === "insert") {
            console.log("post uploaded...");

            const postDetails = change.fullDocument;
            pusher.trigger("posts", "inserted", {
                user: postDetails.user,
                caption: postDetails.caption,
                image: postDetails.image,
            });
        } else {
            console.log("error in pusher...");
        }
    });
});

//API routes
app.get("/", (req, res) => res.status(200).send("Hello World!"));

app.post("/upload", (req, res) => {
    const body = req.body;

    Posts.create(body, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(201).send(data);
        }
    })
});

app.get("/sync", (req, res) => {
    Posts.find((err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(data);
        }
    });
});

//listen
app.listen(port, () => console.log(`listening on localhost:${port}`));