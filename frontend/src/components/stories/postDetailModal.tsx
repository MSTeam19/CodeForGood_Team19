"use client";

import { AccessTime, Close, Share } from "@mui/icons-material";
import {
    Avatar,
    Box,
    Chip,
    Dialog,
    DialogContent,
    IconButton,
    Typography,
} from "@mui/material";
import { useState } from "react";

interface Post {
  id: number;
  photo_url: string;
  description: string;
  author: string;
  created_at: string;
  facebookPosted?: boolean;
}

interface PostDetailModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PostDetailModal({ post, isOpen, onClose }: PostDetailModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!post) return null;

  const initials = post.author
    .split(" ")
    .map((n) => n[0])
    .join("");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const { date, time } = formatDate(post.created_at);

  const handleShare = async () => {
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
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
          margin: 2,
        }
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative' }}>
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
            },
          }}
        >
          <Close />
        </IconButton>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Image Section */}
          <Box 
            sx={{ 
              flex: { xs: 'none', md: 1 },
              position: 'relative',
              backgroundColor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: { xs: '300px', md: '500px' },
            }}
          >
            {!imageLoaded && (
              <Box sx={{ 
                position: 'absolute', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '100%',
                height: '100%',
              }}>
                <Typography color="text.secondary">Loading...</Typography>
              </Box>
            )}
            <img
              src={post.photo_url}
              alt="Post image"
              onLoad={() => setImageLoaded(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: imageLoaded ? 'block' : 'none',
              }}
            />
          </Box>

          {/* Content Section */}
          <Box 
            sx={{ 
              flex: { xs: 'none', md: '0 0 400px' },
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              minHeight: { xs: 'auto', md: '500px' },
            }}
          >
            {/* Author Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ width: 48, height: 48, mr: 2, fontSize: '1.2rem' }}>
                {initials}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  {post.author}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {date} at {time}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Facebook Status */}
            {post.facebookPosted && (
              <Box sx={{ mb: 2 }}>
                <Chip 
                  label="Posted to Facebook" 
                  color="primary" 
                  size="small"
                  sx={{ fontSize: '0.75rem' }}
                />
              </Box>
            )}

            {/* Description */}
            <Box sx={{ flex: 1, mb: 3 }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {post.description}
              </Typography>
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <IconButton 
                onClick={handleShare}
                color="primary"
                sx={{
                  '&:hover': {
                    backgroundColor: 'primary.50',
                  },
                }}
              >
                <Share />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
