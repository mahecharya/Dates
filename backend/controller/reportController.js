import mongoose from "mongoose";
import Report from "../model/reportModel.js";
import User from "../model/userModel.js";

// CREATE REPORT
export const createReport = async (req, res) => {
  try {
    const reporterId = req.user.id;

    const { reportedUserId, reason, description } = req.body;

    if (!reportedUserId || !reason) {
      return res.status(400).json({
        success: false,
        message: "reportedUserId and reason are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(reportedUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reported user ID",
      });
    }

    if (reporterId.toString() === reportedUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot report yourself",
      });
    }

    const allowedReasons = [
      "fake_profile",
      "harassment",
      "spam",
      "scam",
      "inappropriate_photo",
      "abusive_language",
      "underage",
      "other",
    ];

    if (!allowedReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report reason",
        allowedReasons,
      });
    }

    const reportedUser = await User.findById(reportedUserId);

    if (!reportedUser) {
      return res.status(404).json({
        success: false,
        message: "Reported user not found",
      });
    }

    const existingReport = await Report.findOne({
      reporter: reporterId,
      reportedUser: reportedUserId,
      reason,
    });

    if (existingReport) {
      return res.status(409).json({
        success: false,
        message: "You have already reported this user for this reason",
      });
    }

    const report = await Report.create({
      reporter: reporterId,
      reportedUser: reportedUserId,
      reason,
      description: description || "",
    });

    const populatedReport = await Report.findById(report._id)
      .populate("reporter", "name email profilePhoto")
      .populate("reportedUser", "name email profilePhoto age gender");

    return res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data: populatedReport,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reported this user for this reason",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to submit report",
      error: error.message,
    });
  }
};

// GET MY SUBMITTED REPORTS
export const getMyReports = async (req, res) => {
  try {
    const userId = req.user.id;

    const reports = await Report.find({
      reporter: userId,
    })
      .populate("reportedUser", "name email age gender profilePhoto")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "My reports fetched successfully",
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch my reports",
      error: error.message,
    });
  }
};

// GET REPORT DETAIL BY ID FOR REPORTER
export const getMyReportById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reportId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID",
      });
    }

    const report = await Report.findOne({
      _id: reportId,
      reporter: userId,
    })
      .populate("reportedUser", "name email age gender profilePhoto")
      .populate("reviewedBy", "name email");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Report fetched successfully",
      data: report,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch report",
      error: error.message,
    });
  }
};

// DELETE MY PENDING REPORT
export const deleteMyReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reportId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID",
      });
    }

    const report = await Report.findOne({
      _id: reportId,
      reporter: userId,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (report.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending reports can be deleted",
      });
    }

    await Report.findByIdAndDelete(reportId);

    return res.status(200).json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete report",
      error: error.message,
    });
  }
};