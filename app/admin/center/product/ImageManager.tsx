"use client";

import React, { useState, useRef, useCallback } from "react";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiTrash2,
  FiArrowUp,
  FiArrowDown,
  FiCheck,
} from "react-icons/fi";
import { MdEdit } from "react-icons/md";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";

interface ImageManagerProps {
  productId: string;
  imageUrls: string[];
  onImagesUpdate: (newImages: string[]) => void;
}

export default function ImageManager({
  productId,
  imageUrls,
  onImagesUpdate,
}: ImageManagerProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>(imageUrls || []);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const imgRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getAdminToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("adminToken") || "";
    }
    return "";
  };

  // 上一张图片
  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // 下一张图片
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // 触发文件选择
  const handleSelectFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);

    // 清空input值，允许再次选择同一文件
    if (e.target) {
      e.target.value = "";
    }
  };

  // 调整图片顺序
  const moveImage = (direction: "up" | "down") => {
    if (images.length <= 1) return;

    const newImages = [...images];
    const currentImage = newImages[currentImageIndex];

    if (direction === "up" && currentImageIndex > 0) {
      newImages.splice(currentImageIndex, 1);
      newImages.splice(currentImageIndex - 1, 0, currentImage);
      setCurrentImageIndex(currentImageIndex - 1);
    } else if (direction === "down" && currentImageIndex < images.length - 1) {
      newImages.splice(currentImageIndex, 1);
      newImages.splice(currentImageIndex + 1, 0, currentImage);
      setCurrentImageIndex(currentImageIndex + 1);
    }

    setImages(newImages);
  };

  // 删除当前图片
  const deleteCurrentImage = async () => {
    if (images.length === 0) return;

    const imageToDelete = images[currentImageIndex];

    try {
      setIsLoading(true);
      const token = getAdminToken();
      if (!token) {
        throw new Error("Unauthorized, please login");
      }

      await axios.delete(
        `${API_BASE_URL}/product/delete_image/${productId}`,

        {
          data: { image: imageToDelete },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update local state
      const newImages = [...images];
      newImages.splice(currentImageIndex, 1);
      setImages(newImages);

      // Adjust current index
      if (currentImageIndex >= newImages.length && newImages.length > 0) {
        setCurrentImageIndex(newImages.length - 1);
      }

      setSuccess("Image deleted successfully");

      // Notify parent component of image update
      onImagesUpdate(newImages);

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Failed to delete image:", err);
      setError("Failed to delete image, please try again");

      setTimeout(() => {
        setError("");
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // 保存图片顺序
  const saveImageOrder = async () => {
    try {
      setIsLoading(true);
      const token = getAdminToken();
      if (!token) {
        throw new Error("Unauthorized, please login");
      }

      await axios.put(
        `${API_BASE_URL}/product/update_images/${productId}`,
        { images },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccess("Image order updated");

      // Notify parent component
      onImagesUpdate(images);

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Failed to update image order:", err);
      setError("Failed to update image order, please try again");

      setTimeout(() => {
        setError("");
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // 完成裁剪并上传图片
  const completeCrop = useCallback(async () => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) return;

    // 创建裁剪后的图片Canvas
    const canvas = document.createElement("canvas");
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    // Convert to base64
    const base64data = canvas.toDataURL("image/jpeg");

    try {
      setIsLoading(true);
      const token = getAdminToken();
      if (!token) {
        throw new Error("Unauthorized, please login");
      }

      // Remove base64 data prefix
      const base64Image = base64data.replace(/^data:image\/\w+;base64,/, "");

      await axios.put(
        `${API_BASE_URL}/product/upload_image/${productId}`,
        { image_base64: base64Image },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Refresh product images
      const productResponse = await axios.get(
        `${API_BASE_URL}/product/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedImages = productResponse.data.images || [];
      setImages(updatedImages);

      // Set index to newly added image
      if (updatedImages.length > 0) {
        setCurrentImageIndex(updatedImages.length - 1);
      }

      setSuccess("Image uploaded successfully");
      setShowCropModal(false);
      setUploadedImage(null);

      // Notify parent component
      onImagesUpdate(updatedImages);

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Failed to upload image:", err);
      setError("Failed to upload image, please try again");

      setTimeout(() => {
        setError("");
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  }, [completedCrop, productId, onImagesUpdate]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
      <h2 className="text-lg font-medium mb-4">Product Image Management</h2>

      {/* Error and success messages */}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {success}
        </div>
      )}

      {/* Image preview area */}
      <div className="mb-6">
        <div className="relative w-full h-64 border rounded-md flex items-center justify-center bg-gray-50">
          {images.length > 0 ? (
            <>
              <img
                src={images[currentImageIndex]}
                alt={`Product ${currentImageIndex + 1}`}
                className="max-h-full max-w-full object-contain"
              />
              <button
                onClick={prevImage}
                disabled={images.length <= 1}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md text-gray-800 hover:bg-gray-100 disabled:opacity-50"
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                onClick={nextImage}
                disabled={images.length <= 1}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md text-gray-800 hover:bg-gray-100 disabled:opacity-50"
              >
                <FiChevronRight size={20} />
              </button>
              <div className="absolute bottom-2 left-0 right-0 text-center text-sm text-gray-600">
                {currentImageIndex + 1} / {images.length}
              </div>
            </>
          ) : (
            <div className="text-gray-500">No images available</div>
          )}
        </div>
      </div>

      {/* Image operation buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={handleSelectFile}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-1 disabled:bg-gray-400"
        >
          <FiPlus /> Upload Image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {images.length > 0 && (
          <>
            <button
              onClick={() => moveImage("up")}
              disabled={
                images.length <= 1 || currentImageIndex === 0 || isLoading
              }
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-1 disabled:opacity-50"
            >
              <FiArrowUp /> Move Up
            </button>
            <button
              onClick={() => moveImage("down")}
              disabled={
                images.length <= 1 ||
                currentImageIndex === images.length - 1 ||
                isLoading
              }
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-1 disabled:opacity-50"
            >
              <FiArrowDown /> Move Down
            </button>
            <button
              onClick={saveImageOrder}
              disabled={isLoading || images.length <= 1}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-1 disabled:bg-green-400"
            >
              <FiCheck /> Save Order
            </button>
            <button
              onClick={deleteCurrentImage}
              disabled={images.length === 0 || isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-1 disabled:bg-red-400"
            >
              <FiTrash2 /> Delete Image
            </button>
          </>
        )}
      </div>

      {/* Thumbnail preview */}
      {images.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {images.map((img, index) => (
            <div
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-16 h-16 border rounded-md overflow-hidden cursor-pointer ${
                index === currentImageIndex ? "ring-2 ring-gray-800" : ""
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Image cropping modal */}
      {showCropModal && uploadedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-auto">
            <h3 className="text-lg font-medium mb-4">Crop Image</h3>
            <div className="mb-4">
              <ReactCrop
                crop={crop}
                onChange={(c: Crop) => setCrop(c)}
                onComplete={(c: PixelCrop) => setCompletedCrop(c)}
                aspect={1}
              >
                <img
                  ref={imgRef}
                  src={uploadedImage}
                  alt="Upload preview"
                  className="max-w-full"
                />
              </ReactCrop>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowCropModal(false);
                  setUploadedImage(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={completeCrop}
                disabled={isLoading || !completedCrop}
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-400"
              >
                {isLoading ? "Processing..." : "Confirm & Upload"}
              </button>
            </div>
            <canvas
              ref={previewCanvasRef}
              style={{
                display: "none",
                width: completedCrop?.width ?? 0,
                height: completedCrop?.height ?? 0,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
