import mongoose from "mongoose";
import Report from "../model/reportModel.js";
import User from "../model/userModel.js";
import { createNotification } from "../utils/createNotification.js";

// ADMIN: GET ALL REPORTS
export const getAllReports = async (req, res) => {
  try {
    const { status, reason } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (reason) {
      query.reason = reason;
    }

    const reports = await Report.find(query)
      .populate("reporter", "name email profilePhoto")
      .populate("reportedUser", "name email age gender profilePhoto isBanned")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Reports fetched successfully",
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
      error: error.message,
    });
  }
};

// ADMIN: GET REPORT BY ID
export const getReportByIdForAdmin = async (req, res) => {
  try {
    const { reportId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID",
      });
    }

    const report = await Report.findById(reportId)
      .populate("reporter", "name email profilePhoto")
      .populate("reportedUser", "name email age gender profilePhoto isBanned")
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

// ADMIN: UPDATE REPORT STATUS
export const updateReportStatus = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { reportId } = req.params;
    const { status, adminNote } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID",
      });
    }

    const allowedStatuses = ["pending", "reviewed", "resolved", "rejected"];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
        allowedStatuses,
      });
    }

    const report = await Report.findByIdAndUpdate(
      reportId,
      {
        status,
        adminNote: adminNote || "",
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    )
      .populate("reporter", "name email profilePhoto")
      .populate("reportedUser", "name email age gender profilePhoto isBanned")
      .populate("reviewedBy", "name email");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    await createNotification({
      user: report.reporter._id,
      type: "report_update",
      title: "Report Update",
      message: `Your report status has been updated to ${status}.`,
      relatedReport: report._id,
    });

    return res.status(200).json({
      success: true,
      message: "Report status updated successfully",
      data: report,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update report status",
      error: error.message,
    });
  }
};

// ADMIN: BAN REPORTED USER
export const banReportedUser = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { reportId } = req.params;
    const { adminNote } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID",
      });
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    const user = await User.findByIdAndUpdate(
      report.reportedUser,
      {
        isBanned: true,
      },
      {
        returnDocument: "after",
      }
    ).select("-password -refreshToken");

    report.status = "resolved";
    report.adminNote = adminNote || "Reported user banned by admin";
    report.reviewedBy = adminId;
    report.reviewedAt = new Date();

    await report.save();

    await createNotification({
      user: report.reporter,
      type: "report_update",
      title: "Report Resolved",
      message: "Your report has been resolved by admin.",
      relatedReport: report._id,
    });

    return res.status(200).json({
      success: true,
      message: "Reported user banned successfully",
      data: {
        report,
        bannedUser: user,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to ban reported user",
      error: error.message,
    });
  }
};
// ADMIN: GET REPORTED USERS SUMMARY
export const getReportedUsersSummary = async (req, res) => {
  try {
    const reportedUsers = await Report.aggregate([
      {
        $group: {
          _id: "$reportedUser",
          reportCount: { $sum: 1 },
          pendingCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
            },
          },
          reviewedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "reviewed"] }, 1, 0],
            },
          },
          resolvedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "resolved"] }, 1, 0],
            },
          },
          rejectedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "rejected"] }, 1, 0],
            },
          },
          reasons: { $push: "$reason" },
          latestReportAt: { $max: "$createdAt" },
        },
      },
      {
        $sort: {
          reportCount: -1,
          latestReportAt: -1,
        },
      },
    ]);

    const populatedUsers = await Report.populate(reportedUsers, {
      path: "_id",
      select: "name email age gender profilePhoto isBanned role",
      model: "User",
    });

    const formatted = populatedUsers.map((item) => ({
      user: item._id,
      reportCount: item.reportCount,
      pendingCount: item.pendingCount,
      reviewedCount: item.reviewedCount,
      resolvedCount: item.resolvedCount,
      rejectedCount: item.rejectedCount,
      reasons: item.reasons,
      latestReportAt: item.latestReportAt,
    }));

    return res.status(200).json({
      success: true,
      message: "Reported users summary fetched successfully",
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reported users summary",
      error: error.message,
    });
  }
};