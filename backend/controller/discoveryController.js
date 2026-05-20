import User from "../model/userModel.js";
import Preference from "../model/preferenceModel.js";
import Photo from "../model/photoModel.js";
import Swipe from "../model/swipeModel.js";

// DISCOVER USERS
export const discoverUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "Current user not found",
      });
    }

    if (currentUser.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned",
      });
    }

    const preference = await Preference.findOne({
      user: currentUserId,
    });

    if (!preference) {
      return res.status(404).json({
        success: false,
        message: "Please set your dating preferences first",
      });
    }

    const swipedUsers = await Swipe.find({
      swiper: currentUserId,
    }).select("target");

    const swipedUserIds = swipedUsers.map((swipe) => swipe.target);

    const query = {
      _id: {
        $ne: currentUserId,
        $nin: swipedUserIds,
      },
      isBanned: false,
      isProfileComplete: true,
      age: {
        $gte: preference.minAge,
        $lte: preference.maxAge,
      },
    };

    if (preference.preferredGender && preference.preferredGender !== "any") {
      query.gender = preference.preferredGender;
    }

    if (preference.relationshipGoal && preference.relationshipGoal !== "any") {
      query.relationshipGoal = preference.relationshipGoal;
    }

    if (preference.city) {
      query.city = preference.city;
    }

    if (preference.country) {
      query.country = preference.country;
    }

    const users = await User.find(query)
      .select(
        "-password -otp -otpExpire -resetPasswordToken -resetPasswordExpire -refreshToken"
      )
      .limit(20)
      .sort({ createdAt: -1 });

    const usersWithPhotos = [];

    for (const user of users) {
      const photos = await Photo.find({
        user: user._id,
      }).sort({
        isPrimary: -1,
        displayOrder: 1,
        createdAt: 1,
      });

      if (photos.length > 0) {
        usersWithPhotos.push({
          ...user.toObject(),
          photos,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Users discovered successfully",
      count: usersWithPhotos.length,
      data: usersWithPhotos,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Discovery failed",
      error: error.message,
    });
  }
};