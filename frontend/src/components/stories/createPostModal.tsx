"use client";

import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  TextareaAutosize,
} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import React, { useState } from "react";

// Constants
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// Types
interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: (newPost: any) => void;
}

interface PostData {
  author: string;
  description: string;
  photo_url: string;
  created_at: string;
}

export function CreatePostModal({
  isOpen,
  onClose,
  onPostCreated,
}: CreatePostModalProps) {
  // State
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Validation
  const isFormValid = selectedFile && description.trim() && author.trim();

  // Handlers
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      alert("Please select a valid image file (JPG, PNG, GIF, WEBP)");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      alert("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImageToBackend = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${errorText}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Upload failed");
    }

    return result.url;
  };

  const createPost = async (postData: PostData): Promise<any> => {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/posts/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` }),
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication required. Please log in.");
      }
      if (response.status === 403) {
        throw new Error("You don't have permission to create posts.");
      }
      throw new Error(`Failed to create post: ${response.statusText}`);
    }

    return response.json();
  };

  const showSuccessMessage = (data: any) => {
    let message = "🎉 Your post has been created successfully!";
    
    if (data.facebookPosted) {
      message += "\n✅ Also posted to Facebook!";
    } else if (data.facebookError?.includes('Only Staff members')) {
      message += "\nℹ️ (Facebook posting is only available for Staff members)";
    } else if (data.facebookError) {
      message += `\n⚠️ Facebook posting failed: ${data.facebookError}`;
    }
    
    alert(message);
  };

  const resetForm = () => {
    setAuthor("");
    setDescription("");
    setSelectedImage(null);
    setSelectedFile(null);
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setUploading(true);

    try {
      // Upload image
      const imageUrl = await uploadImageToBackend(selectedFile!);

      // Create post
      const postData: PostData = {
        author,
        description,
        photo_url: imageUrl,
        created_at: new Date().toISOString(),
      };

      const data = await createPost(postData);
      
      // Show success message
      showSuccessMessage(data);
      
      // Validate response and notify parent
      if (data?.id) {
        onPostCreated?.(data);
      } else {
        console.error('Invalid post response:', data);
        alert("Post created but there was an issue refreshing. Please refresh manually.");
      }
      
      // Reset and close
      resetForm();
      onClose();
      
    } catch (error: any) {
      console.error('Error creating post:', error);
      alert(error.message || "Failed to create post. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const removeImage = () => {
    setSelectedImage(null);
    setSelectedFile(null);
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Post</DialogTitle>

      <DialogContent>
        {/* Author Input */}
        <div className="space-y-2 mb-4">
          <h3 className="font-semibold">Author</h3>
          <TextField
            id="author"
            placeholder="Enter your name"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            fullWidth
            variant="outlined"
            disabled={uploading}
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-2 mb-4">
          <h3 className="font-semibold">Image</h3>
          {selectedImage ? (
            <div className="relative">
              <img
                src={selectedImage}
                alt="Selected"
                className="w-full h-48 object-cover rounded-lg"
              />
              <IconButton
                size="small"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                onClick={removeImage}
                disabled={uploading}
              >
                ✕
              </IconButton>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors">
              <input
                id="image-upload"
                type="file"
                accept={ALLOWED_FILE_TYPES.join(",")}
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              >
                <Avatar className="w-8 h-8 bg-gray-200" />
                <span>Click to upload an image</span>
                <span className="text-xs">
                  {ALLOWED_FILE_TYPES.map(type => type.split('/')[1].toUpperCase()).join(', ')} up to 5MB
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Description Input */}
        <div className="space-y-2">
          <h3 className="font-semibold">Description</h3>
          <TextareaAutosize
            id="description"
            placeholder="Write a description for your post..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-3 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={uploading}
          />
        </div>
      </DialogContent>

      <DialogActions className="p-4">
        <Button 
          onClick={handleClose} 
          disabled={uploading}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || uploading}
          variant="contained"
          color="primary"
        >
          {uploading ? (
            <>
              <CircularProgress size={20} className="mr-2" color="inherit" />
              Creating Post...
            </>
          ) : (
            "Share Post"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
