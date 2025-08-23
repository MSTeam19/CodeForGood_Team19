"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  IconButton,
  TextField,
  TextareaAutosize,
} from "@mui/material";
import Button from "@mui/material/Button";
// import TextareaAutosize from "@mui/material/TextareaAutosize";
// import { X, ImageIcon } from "lucide-react";
import Avatar from "@mui/material/Avatar";

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // const file = event.target.files?.[0];
    // if (file) {
    //   const reader = new FileReader();
    //   reader.onload = (e) => {
    //     setSelectedImage(e.target?.result as string);
    //   };
    //   reader.readAsDataURL(file);
    // }
    setSelectedImage(
      "https://reach.org.hk/_assets/media/249dbbdf026cabf4f1b434f666385116.jpg"
    ); // to be changed
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:3000/posts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          author,
          description,
          photo_url: selectedImage, // to be changed
          created_at: new Date().toISOString(),
        }),
      });

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
    setSelectedImage(null);
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
                onClick={() => setSelectedImage(null)}
              >
                {/* <X className="w-4 h-4" /> */}
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
                <span className="text-xs">PNG, JPG, GIF up to 10MB</span>
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
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          disabled={!selectedImage || !description.trim()}
          variant="contained"
          color="primary"
        >
          Share Post
        </Button>
      </DialogActions>
    </Dialog>
  );
}
