"use client";

import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  useMediaQuery,
  useTheme,
  LinearProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { MobileBottomNav } from "../components/navigation/mobileBottomNav";
import { CreatePostModal } from "../components/stories/createPostModal";
import { PostCard } from "../components/stories/postCard";
import { useAuth } from "../contexts/authContext";

import "./postPage.css";

export default function PostPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [sortBy, setSortBy] = useState("newest");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleCreatePost = () => {
    setIsCreateModalOpen(true);
  };

  const handlePostCreated = (newPost: any) => {
    // Validate the new post has required fields before adding to state
    if (newPost && newPost.id && typeof newPost === "object") {
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    } else {
      console.error("Invalid post object received:", newPost);
      // Optionally, refetch all posts to ensure consistency
      window.location.reload(); // Simple solution to refresh the posts
    }
  };

  const sortedPosts = [...posts]
    .filter((post) => post && post.id) // Filter here too for extra safety
    .sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
        );
      } else if (sortBy === "oldest") {
        return (
          new Date(a.created_at || 0).getTime() -
          new Date(b.created_at || 0).getTime()
        );
      } else if (sortBy === "author") {
        return (a.author || "").localeCompare(b.author || "");
      }
      return 0;
    });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
          }/posts/all`
        );
        const data = await res.json();
        console.log("Fetched posts data:", data); // Debug log

        // Ensure data is an array and filter out invalid posts
        const validPosts = Array.isArray(data)
          ? data.filter((post) => post && typeof post === "object" && post.id)
          : [];

        setPosts(validPosts);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setPosts([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {loading && <LinearProgress />}

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

        {isAuthenticated && !isMobile && (
          <Button
            onClick={handleCreatePost}
            variant="outlined"
            style={{ color: "#00796b", borderColor: "#00796b" }}
            startIcon={<AddIcon />}
          >
            Create Post
          </Button>
        )}
      </Box>

      <main className="max-w-6xl mx-auto px-4 py-4">
        {loading ? (
          <div className="text-center py-10">Loading posts...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPosts.length > 0 ? (
              sortedPosts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <div>No posts available</div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onCreatePost={handleCreatePost} />

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={handlePostCreated} // new prop
      />
    </div>
  );
}
