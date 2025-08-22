"use client";

import { useState } from "react";
import { PostCard } from "../components/stories/postCard";
import { CreatePostModal } from "../components/stories/createPostModal";
import {
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export default function PostPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  // const [posts, setPosts] = useState<any[]>([]);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchPosts = async () => {
  //     try {
  //       const res = await fetch("http://localhost:3001/posts/"); // backend route
  //       const data = await res.json();
  //       // setPosts(data); // expects array of { id, image, caption, author, created_at }
  //     } catch (err) {
  //       console.error("Error fetching posts:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchPosts();
  // }, []);

  const mockPosts = [
    {
      story_id: 1,
      photo_url:
        "https://reach.org.hk/_assets/media/249dbbdf026cabf4f1b434f666385116.jpg",
      description: "Day in the life of the kids!",
      author: "Hui Xin",
      created_at: "2024-03-01T12:00:00Z",
    },
    {
      story_id: 2,
      photo_url:
        "https://reach.org.hk/_assets/media/c9c1ff98bfe0c137b8b8c540ac91fe8f.png",
      description: "Lovely kids!",
      author: "Jie Qing",
      created_at: "2025-03-01T12:00:00Z",
    },
    {
      story_id: 3,
      photo_url:
        "https://reach.org.hk/_assets/media/9a4b909f031246b73aa9e895be61ad13.jpg",
      description: "The kids are learning so well!",
      author: "Jun Jie",
      created_at: "2023-03-01T12:00:00Z",
    },
  ];

  const sortedPosts = [...mockPosts].sort((a, b) => {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
          Donation Leaderboard Vercel Test
        </h1>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          variant="contained"
          startIcon={<AddIcon />}
        >
          Create Post
        </Button>
      </Box>

      {/* Posts Grid */}
      <main className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPosts.length > 0 ? (
            sortedPosts.map((post) => (
              <PostCard key={post.story_id} post={post} />
            ))
          ) : (
            <div>No posts available</div>
          )}
        </div>
      </main>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
