"use client";
import {
  Stories,
  StoriesContent,
  Story,
  StoryImage,
  StoryOverlay,
} from "@/components/ui/kibo-ui/stories";
import { Share } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  IconButton,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { PostDetailModal } from "./postDetailModal";

interface Post {
  id: number;
  photo_url: string;
  description: string;
  author: string;
  created_at: string;
  facebookPosted?: boolean;
  stories?: StoryType[];
}

interface StoryType {
  id: number;
  video: string;
  avatar: string;
  author: string;
  fallback?: string;
}

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const initials = post.author
    .split(" ")
    .map((n) => n[0])
    .join("");

  const handleCardClick = () => {
    setIsDetailModalOpen(true);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when share button is clicked
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.author}`,
          text: post.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `Check out this post by ${post.author}: ${post.description}`
      );
      alert('Link copied to clipboard!');
    }
  };

  return (
    <>
      <Card
        onClick={handleCardClick}
        sx={{
          maxWidth: 400,
          mb: 3,
          borderRadius: 3,
          overflow: "hidden",
          transition: "all 0.3s",
          cursor: "pointer",
          "&:hover": { 
            boxShadow: 6, 
            transform: "translateY(-4px)",
          },
        }}
      >
        <Stories>
          <StoriesContent>
            <Story
              key={post.id}
              style={{ width: 340, aspectRatio: "3/4", position: "relative" }}
            >
              <StoryImage src={post.photo_url} alt="post image" />
              <StoryOverlay />
            </Story>
          </StoriesContent>
        </Stories>

        <CardContent>
          <Box display="flex" alignItems="center" mb={1}>
            <Avatar sx={{ width: 32, height: 32, mr: 1 }}>{initials}</Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                {post.author}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(post.created_at).toLocaleString()}
              </Typography>
            </Box>
          </Box>

          <Typography 
            variant="body2" 
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              mb: 1,
            }}
          >
            {post.description}
          </Typography>

          {post.facebookPosted && (
            <Box sx={{ mb: 1 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'primary.main',
                  fontWeight: 'medium',
                }}
              >
                ✅ Posted to Facebook
              </Typography>
            </Box>
          )}

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              Click to view full post
            </Typography>
            <IconButton 
              onClick={handleShare}
              color="default"
              size="small"
            >
              <Share />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* Full View Modal */}
      <PostDetailModal
        post={post}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </>
  );
}
