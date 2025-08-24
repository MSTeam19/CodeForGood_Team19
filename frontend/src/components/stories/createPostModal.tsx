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

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: (newPost: any) => void;
}

export function CreatePostModal({
  isOpen,
  onClose,
  onPostCreated,
}: CreatePostModalProps) {
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToBackend = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
        }/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        return result.url;
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !description.trim() || !author.trim()) {
      return;
    }

    setUploading(true);

    try {
      const imageUrl = await uploadImageToBackend(selectedFile);

      console.log("Creating post:", {
        author,
        description,
        imageUrl,
      });

      setSelectedImage(imageUrl);

      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
        }/posts/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            author,
            description,
            photo_url: imageUrl, // to be changed
            created_at: new Date().toISOString(),
          }),
        }
      );

      alert("🎉 Image uploaded successfully! Your post has been created.");

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      const data = await response.json();
      console.log("Post created:", data);
      onPostCreated?.(data[0]);
      setAuthor("");
      setDescription("");
      setSelectedImage(null);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClose = () => {
    setDescription("");
    setAuthor("");
    setSelectedImage(null);
    setSelectedFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Post</DialogTitle>

      <DialogContent>
        <div className="space-y-2">
          <h3 className="font-semibold">Author</h3>
          <TextField
            id="author"
            placeholder="Fill in your name"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full border rounded-md p-2 min-h-[100px] resize-none"
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
                className="absolute top-2 right-2 bg-white/80"
                onClick={() => {
                  setSelectedImage(null);
                  setSelectedFile(null);
                }}
              >
                ✕
              </IconButton>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer">
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              >
                <Avatar className="w-8 h-8" />
                <span>Click to upload an image</span>
                <span className="text-xs">PNG, JPG, GIF up to 5MB</span>
              </label>
            </div>
          )}
        </div>

        {/* Caption */}
        <div className="space-y-2">
          <h3 className="font-semibold">Description</h3>
          <TextareaAutosize
            id="description"
            placeholder="Write a description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-md p-2 min-h-[100px] resize-none"
          />
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!selectedImage || !description.trim()}
          variant="contained"
          color="primary"
        >
          {uploading ? (
            <>
              <CircularProgress size={20} className="mr-2" />
              Uploading...
            </>
          ) : (
            "Share Post"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
