"use client";
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { Share } from "@mui/icons-material";
import {
  Stories,
  StoriesContent,
  Story,
  StoryOverlay,
  StoryImage,
} from "@/components/ui/kibo-ui/stories";

interface Post {
  story_id: number;
  photo_url: string;
  description: string;
  author: string;
  created_at: string;
  // timeAgo: string;
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
  const initials = post.author
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Card
      sx={{
        maxWidth: 400,
        mb: 3,
        borderRadius: 3,
        overflow: "hidden",
        transition: "all 0.3s",
        "&:hover": { boxShadow: 6, transform: "translateY(-4px)" },
      }}
    >
      <Stories>
        <StoriesContent>
          <Story
            key={post.story_id}
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
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {post.author}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(post.created_at).toLocaleString()}{" "}
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2">{post.description}</Typography>

        <Box display="flex" alignItems="center" gap={1}>
          <IconButton color="default">
            <Share />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
}
