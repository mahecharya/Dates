import Photo from "../model/photoModel.js";
import User from "../model/userModel.js";
import cloudinary from "../config/cloudinary.js";

// Convert buffer to Cloudinary upload
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "dating-app/photos",
        resource_type: "image",
        transformation: [
          {
            width: 1000,
            height: 1000,
            crop: "limit",
            quality: "auto",
          },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

// UPLOAD ONE PHOTO
export const uploadUserPhoto = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image file",
      });
    }

    const photoCount = await Photo.countDocuments({ user: userId });

    if (photoCount >= 6) {
      return res.status(400).json({
        success: false,
        message: "You can upload a maximum of 6 photos",
      });
    }

    const cloudinaryResult = await uploadToCloudinary(req.file.buffer);

    const isFirstPhoto = photoCount === 0;

    const photo = await Photo.create({
      user: userId,
      imageUrl: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id,
      isPrimary: isFirstPhoto,
      displayOrder: photoCount + 1,
    });

    if (isFirstPhoto) {
      await User.findByIdAndUpdate(userId, {
        profilePhoto: cloudinaryResult.secure_url,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Photo uploaded successfully",
      data: photo,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Photo upload failed",
      error: error.message,
    });
  }
};

// GET MY PHOTOS
export const getMyPhotos = async (req, res) => {
  try {
    const userId = req.user.id;

    const photos = await Photo.find({ user: userId }).sort({
      isPrimary: -1,
      displayOrder: 1,
      createdAt: 1,
    });

    return res.status(200).json({
      success: true,
      message: "Photos fetched successfully",
      data: photos,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch photos",
      error: error.message,
    });
  }
};

// SET PRIMARY PHOTO
export const setPrimaryPhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    const { photoId } = req.params;

    const photo = await Photo.findOne({
      _id: photoId,
      user: userId,
    });

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "Photo not found",
      });
    }

    await Photo.updateMany(
      { user: userId },
      { isPrimary: false }
    );

    photo.isPrimary = true;
    await photo.save();

    await User.findByIdAndUpdate(userId, {
      profilePhoto: photo.imageUrl,
    });

    return res.status(200).json({
      success: true,
      message: "Primary photo updated successfully",
      data: photo,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to set primary photo",
      error: error.message,
    });
  }
};

// DELETE PHOTO
export const deletePhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    const { photoId } = req.params;

    const photo = await Photo.findOne({
      _id: photoId,
      user: userId,
    });

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "Photo not found",
      });
    }

    if (photo.publicId) {
      await cloudinary.uploader.destroy(photo.publicId);
    }

    const wasPrimary = photo.isPrimary;

    await Photo.findByIdAndDelete(photoId);

    if (wasPrimary) {
      const nextPhoto = await Photo.findOne({ user: userId }).sort({
        createdAt: 1,
      });

      if (nextPhoto) {
        nextPhoto.isPrimary = true;
        await nextPhoto.save();

        await User.findByIdAndUpdate(userId, {
          profilePhoto: nextPhoto.imageUrl,
        });
      } else {
        await User.findByIdAndUpdate(userId, {
          profilePhoto: "",
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Photo deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Photo deletion failed",
      error: error.message,
    });
  }
};

// GET PUBLIC PHOTOS OF A USER
export const getUserPhotos = async (req, res) => {
  try {
    const { userId } = req.params;

    const photos = await Photo.find({
      user: userId,
    }).sort({
      isPrimary: -1,
      displayOrder: 1,
      createdAt: 1,
    });

    return res.status(200).json({
      success: true,
      message: "User photos fetched successfully",
      data: photos,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user photos",
      error: error.message,
    });
  }
};