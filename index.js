require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();

// Initialize Firebase
const {initializeApp} = require("firebase/app");
const appSettings = {
  databaseURL: process.env.DATABASE_URL,
};
const fb = initializeApp(appSettings);
const {
  getDatabase,
  ref,
  push,
  get,
  child,
  remove,
} = require("firebase/database");
const db = getDatabase(fb);
const moviesRef = ref(db, "movies");

// Express
app.use(express.json());
app.use(express.static(path.join(__dirname, "static")));

app.get("/list", async (req, res) => {
  try {
    const snapshot = await get(moviesRef);
    if (snapshot.exists()) {
      let items = Object.entries(snapshot.val());
      let arr = items
        .map((element) => ({
          key: element[0],
          value: element[1].item,
        }))
        .filter((item) => item.value.length > 0);
      res.status(200).send({items: arr});
    } else {
      res.status(200).send({items: []});
    }
  } catch (error) {
    console.log("err", error);
    res.status(500).send("Error fetching data");
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./static/index.html"));
});

app.post("/", async (req, res) => {
  try {
    const newPostRef = push(moviesRef, req.body);
    res.status(200).send({key: newPostRef.key, ...req.body});
  } catch (error) {
    console.log(error);
    res.status(500).send("Error saving data");
  }
});

app.post("/delete", async (req, res) => {
  try {
    console.log(req.body);
    const deleteItem = ref(db, `movies/${req.body.item}`);
    await remove(deleteItem);
    res.status(200).send({success: true});
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

app.listen(8090, () => {
  console.log("server running on : http://localhost:8090/");
});
