"use client";

import { useState } from "react";
import { PostCard } from "../components/stories/postCard";
import { CreatePostModal } from "../components/stories/createPostModal";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../contexts/authContext";

import "./postPage.css";

export default function PostPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleCreatePost = () => {
    setIsCreateModalOpen(true);
  };

  const mockPosts = [
    {
      id: 1,
      image:
        "https://reach.org.hk/_assets/media/249dbbdf026cabf4f1b434f666385116.jpg",
      caption: "Day in the life of the kids!",
      author: "Hui Xin",
      created_at: "2023-03-01T12:00:00Z",
    },
    {
      id: 2,
      image:
        "https://reach.org.hk/_assets/media/249dbbdf026cabf4f1b434f666385116.jpg",
      caption: "Lovely kids!",
      author: "Jie Qing",
      created_at: "2023-03-01T12:00:00Z",
    },
    {
      id: 3,
      image:
        "https://reach.org.hk/_assets/media/249dbbdf026cabf4f1b434f666385116.jpg",
      caption: "The kids are learning so well!",
      author: "Jun Jie",
      created_at: "2023-03-01T12:00:00Z",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {isAuthenticated && (
        <div
          style={{ display: "flex", justifyContent: "flex-end", padding: "16px" }}
        >
          <Button
            onClick={handleCreatePost}
            className="btn-primary"
          >
            <AddIcon className="w-4 h-4 mr-2" />
            Create post
          </Button>
        </div>
      )}

      {/* Posts Grid */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </main>

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}