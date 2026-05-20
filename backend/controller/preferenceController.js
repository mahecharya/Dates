import Preference from "../model/preferenceModel.js";

// CREATE PREFERENCE
export const createPreference = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      preferredGender,
      minAge,
      maxAge,
      maxDistanceKm,
      relationshipGoal,
      interests,
      city,
      country,
    } = req.body;

    if (minAge && maxAge && minAge > maxAge) {
      return res.status(400).json({
        success: false,
        message: "Minimum age cannot be greater than maximum age",
      });
    }

    const existingPreference = await Preference.findOne({ user: userId });

    if (existingPreference) {
      return res.status(409).json({
        success: false,
        message: "Preference already exists. Please update it instead.",
      });
    }

    const preference = await Preference.create({
      user: userId,
      preferredGender,
      minAge,
      maxAge,
      maxDistanceKm,
      relationshipGoal,
      interests,
      city,
      country,
    });

    return res.status(201).json({
      success: true,
      message: "Preference created successfully",
      data: preference,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Preference creation failed",
      error: error.message,
    });
  }
};

// GET CURRENT USER PREFERENCE
export const getMyPreference = async (req, res) => {
  try {
    const userId = req.user.id;

    const preference = await Preference.findOne({ user: userId });

    if (!preference) {
      return res.status(404).json({
        success: false,
        message: "Preference not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Preference fetched successfully",
      data: preference,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch preference",
      error: error.message,
    });
  }
};

// UPDATE CURRENT USER PREFERENCE
export const updateMyPreference = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      preferredGender,
      minAge,
      maxAge,
      maxDistanceKm,
      relationshipGoal,
      interests,
      city,
      country,
    } = req.body;

    if (minAge && maxAge && minAge > maxAge) {
      return res.status(400).json({
        success: false,
        message: "Minimum age cannot be greater than maximum age",
      });
    }

    const updateData = {
      preferredGender,
      minAge,
      maxAge,
      maxDistanceKm,
      relationshipGoal,
      interests,
      city,
      country,
    };

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const preference = await Preference.findOneAndUpdate(
      { user: userId },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!preference) {
      return res.status(404).json({
        success: false,
        message: "Preference not found. Please create preference first.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Preference updated successfully",
      data: preference,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Preference update failed",
      error: error.message,
    });
  }
};

// CREATE OR UPDATE PREFERENCE
export const upsertMyPreference = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      preferredGender,
      minAge,
      maxAge,
      maxDistanceKm,
      relationshipGoal,
      interests,
      city,
      country,
    } = req.body;

    if (minAge && maxAge && minAge > maxAge) {
      return res.status(400).json({
        success: false,
        message: "Minimum age cannot be greater than maximum age",
      });
    }

    const preference = await Preference.findOneAndUpdate(
      { user: userId },
      {
        preferredGender,
        minAge,
        maxAge,
        maxDistanceKm,
        relationshipGoal,
        interests,
        city,
        country,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Preference saved successfully",
      data: preference,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Preference save failed",
      error: error.message,
    });
  }
};

// DELETE CURRENT USER PREFERENCE
export const deleteMyPreference = async (req, res) => {
  try {
    const userId = req.user.id;

    const preference = await Preference.findOneAndDelete({ user: userId });

    if (!preference) {
      return res.status(404).json({
        success: false,
        message: "Preference not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Preference deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Preference deletion failed",
      error: error.message,
    });
  }
};