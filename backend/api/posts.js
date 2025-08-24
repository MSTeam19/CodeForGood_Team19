const express = require("express");
const router = express.Router();
const posts = require("../model/posts");
const facebookService = require("../fb/facebookService");
const { authenticateToken } = require("../middleware/auth");

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
    console.error("error fetching posts:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/create", authenticateToken, async (req, res) => {
  try {
    const { author, description, photo_url, created_at } = req.body;

    // Validate that photo_url is a valid GCS URL (since you always upload photos)
    if (!photo_url || !photo_url.startsWith("https://storage.googleapis.com/")) {
      return res.status(400).json({ 
        error: "Invalid photo URL. Please upload the image first using /upload endpoint." 
      });
    }

    // Create post in your database with the validated GCS URL
    const newPost = await posts.createPost({
      author,
      description,
      photo_url,
      created_at,
    });

    // Ensure we have a valid post object
    const createdPost = newPost && newPost[0] ? newPost[0] : null;
    
    if (!createdPost) {
      return res.status(500).json({ error: "Failed to create post in database" });
    }

    // Only post to Facebook if user is authenticated and has Staff role
    let facebookResult = { success: false, error: 'Not authorized for Facebook posting' };
    
    if (req.user && req.user.roles && req.user.roles.includes('Staff')) {
      console.log('User is Staff - posting to Facebook');
      facebookResult = await facebookService.postPhotoToFacebook(
        description,
        photo_url
      );
    } else {
      console.log('User is not Staff - skipping Facebook post');
      facebookResult = { success: false, error: 'Only Staff members can post to Facebook' };
    }

    // Log Facebook result
    if (facebookResult && facebookResult.success) {
      console.log(
        "Successfully posted to Facebook:",
        facebookResult.facebookPostId
      );
    } else if (facebookResult) {
      console.log("Facebook posting skipped or failed:", facebookResult.error);
    }

    // Return response with Facebook status
    res.status(201).json({
      ...createdPost, // Spread the created post
      facebookPosted: facebookResult ? facebookResult.success : false,
      facebookPostId:
        facebookResult ? facebookResult.facebookPostId || null : null,
      facebookError: facebookResult ? facebookResult.error || null : null,
    });
  } catch (error) {
    console.error("error creating post:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
