"use client";

import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select
} from "@mui/material";
import { useEffect, useState } from "react";
import { CreatePostModal } from "../components/stories/createPostModal";
import { PostCard } from "../components/stories/postCard";
import { useAuth } from "../contexts/authContext";

import "./postPage.css";

export default function PostPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { isAuthenticated } = useAuth();

  const handleCreatePost = () => {
    setIsCreateModalOpen(true);
  };

  const [sortBy, setSortBy] = useState("newest");
  const [posts, setPosts] = useState<any[]>([]);
  // const [loading, setLoading] = useState(true);

  const handlePostCreated = (newPost: any) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === "newest") {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sortBy === "oldest") {
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else if (sortBy === "author") {
      return a.author.localeCompare(b.author);
    }
    return 0;
  });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("http://localhost:3000/posts/all");
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}

      {isAuthenticated && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "16px",
          }}
        >
          <Button onClick={handleCreatePost} className="btn-primary">
            <AddIcon className="w-4 h-4 mr-2" />
            Create post
          </Button>
        </div>
      )}

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        className="max-w-6xl mx-auto px-4 py-8"
      >
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="sort-label">Sort By</InputLabel>
          <Select
            labelId="sort-label"
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="oldest">Oldest</MenuItem>
            <MenuItem value="author">Author</MenuItem>
          </Select>
        </FormControl>
        <h1
          className="section-title"
          style={{
            textAlign: "center",
            flex: 1,
            margin: 0,
          }}
        >
          Personal Stories
        </h1>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          // variant="contained"
          style={{ color: "#00796b" }}
          startIcon={<AddIcon />}
        >
          Create Post
        </Button>
      </Box>

      {/* Posts Grid */}
      <main className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPosts.length > 0 ? (
            sortedPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div>No posts available</div>
          )}
        </div>
      </main>

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={handlePostCreated} // new prop
      />
    </div>
  );
}
