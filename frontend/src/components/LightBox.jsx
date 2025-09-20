"use client";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { closeLightBox } from "@/app/(redux)/features/lightBox";
import { DialogTitle } from "@radix-ui/react-dialog";

export default function LightBox() {
  const dispatch = useDispatch();
  const lightBox = useSelector((state) => state.lightBox);
  const { isOpen, image, images, index } = lightBox;
  console.log(images, image, isOpen);

  if (!isOpen) return null;

  const currentImage = images && images.length > 0 ? images[index] : image;
  const hasMultipleImages = images && images.length > 1;

  const closeLightbox = () => {
    dispatch(closeLightBox());
  };

  const nextImage = () => {
    if (hasMultipleImages) {
      const nextIndex = (index + 1) % images.length;
    }
  };

  const prevImage = () => {
    if (hasMultipleImages) {
      const prevIndex = (index - 1 + images.length) % images.length;
    }
  };

  const downloadImage = async () => {
    if (!currentImage) return;

    try {
      const response = await fetch(currentImage.src || currentImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = currentImage.name || currentImage.alt || "image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case "Escape":
        closeLightbox();
        break;
      case "ArrowLeft":
        prevImage();
        break;
      case "ArrowRight":
        nextImage();
        break;
      default:
        break;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeLightbox}>
      <DialogContent
        className="max-w-[100vw] w-[100vw] h-[100vh] max-h-screen p-0 border-0 bg-black/50"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="p-0 sr-only">
          <DialogTitle>Lightbox</DialogTitle>
        </DialogHeader>
        {/* Header with controls */}
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <a href={image.src || image || ""} download>
            <Button
              variant="secondary"
              size="icon"
              onClick={downloadImage}
              className="bg-black/50 hover:bg-black/70 text-white border-white/20"
            >
              <Download className="h-4 w-4" />
            </Button>
          </a>
          <Button
            variant="secondary"
            size="icon"
            onClick={closeLightbox}
            className="bg-black/50 hover:bg-black/70 text-white border-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Image container */}
        <div className="flex items-center justify-center w-full h-full p-8">
          {image && (
            <img
              src={image.src || image}
              alt={image.alt || "Lightbox image"}
              className="max-w-full max-h-full object-contain"
              style={{ userSelect: "none" }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
