const express = require("express");
const router = express.Router();
const posts = require("../model/posts");

router.get("/", async (req, res) => {
  try {
    res.status(200).json("Successfully checked for posts!");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    const allPosts = await posts.getAllPosts();

    res.status(200).json(allPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { author, description, photo_url } = req.body;
    const newPost = await posts.createPost({ author, description, photo_url });
    res.status(201).json(newPost);
  } catch (error) {
    console.error("error creating post:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
