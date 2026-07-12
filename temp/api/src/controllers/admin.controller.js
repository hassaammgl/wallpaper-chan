import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import Pin from "../models/pin.model.js";
import Comment from "../models/comment.model.js";
import Board from "../models/board.model.js";
import Like from "../models/like.model.js";
import Follow from "../models/follow.model.js";
import Save from "../models/save.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AppError } from "../utils/AppError.js";
import { SettingsService } from "../services/settings.service.js";

export const getStats = asyncHandler(async (req, res) => {
    const [
        totalUsers,
        totalPins,
        totalComments,
        totalBoards,
        totalLikes,
        totalFollows,
        totalSaves,
        recentUsers,
        recentPins,
    ] = await Promise.all([
        User.countDocuments(),
        Pin.countDocuments(),
        Comment.countDocuments(),
        Board.countDocuments(),
        Like.countDocuments(),
        Follow.countDocuments(),
        Save.countDocuments(),
        User.find().sort({ createdAt: -1 }).limit(5).select("userName displayName email img role createdAt"),
        Pin.find().sort({ createdAt: -1 }).limit(5).populate("user", "userName displayName img"),
    ]);

    return ApiResponse.success(res, {
        message: "Admin stats fetched",
        data: {
            totals: {
                users: totalUsers,
                pins: totalPins,
                comments: totalComments,
                boards: totalBoards,
                likes: totalLikes,
                follows: totalFollows,
                saves: totalSaves,
            },
            recentUsers,
            recentPins,
        },
    });
});

export const getUsers = asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const search = req.query.search?.trim();

    const query = search
        ? {
            $or: [
                { userName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { displayName: { $regex: search, $options: "i" } },
            ],
        }
        : {};

    const [users, total] = await Promise.all([
        User.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .select("userName displayName email img role createdAt"),
        User.countDocuments(query),
    ]);

    return ApiResponse.success(res, {
        message: "Users fetched",
        data: { users, total, page, pages: Math.ceil(total / limit) },
    });
});

export const updateUser = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const { id } = req.params;

    if (!["user", "admin"].includes(role)) {
        throw new AppError("Invalid role", 400);
    }

    if (id === req.userId.toString() && role !== "admin") {
        throw new AppError("Cannot demote yourself", 400);
    }

    const user = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true, runValidators: true }
    ).select("userName displayName email img role createdAt");

    if (!user) throw new AppError("User not found", 404);

    return ApiResponse.success(res, {
        message: "User updated",
        data: user,
    });
});

export const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (id === req.userId.toString()) {
        throw new AppError("Cannot delete your own account from admin panel", 400);
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) throw new AppError("User not found", 404);

    await Promise.all([
        Pin.deleteMany({ user: id }),
        Comment.deleteMany({ user: id }),
        Board.deleteMany({ user: id }),
        Like.deleteMany({ user: id }),
        Save.deleteMany({ user: id }),
        Follow.deleteMany({ $or: [{ follower: id }, { following: id }] }),
    ]);

    return ApiResponse.success(res, { message: "User and related data deleted" });
});

export const getPins = asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const search = req.query.search?.trim();

    const query = search
        ? {
            $or: [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { tags: { $in: [search] } },
            ],
        }
        : {};

    const [pins, total] = await Promise.all([
        Pin.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("user", "userName displayName img"),
        Pin.countDocuments(query),
    ]);

    return ApiResponse.success(res, {
        message: "Pins fetched",
        data: { pins, total, page, pages: Math.ceil(total / limit) },
    });
});

export const deletePin = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const pin = await Pin.findByIdAndDelete(id);
    if (!pin) throw new AppError("Pin not found", 404);

    await Promise.all([
        Comment.deleteMany({ pin: id }),
        Like.deleteMany({ pin: id }),
        Save.deleteMany({ pin: id }),
    ]);

    return ApiResponse.success(res, { message: "Pin deleted" });
});

export const getComments = asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);

    const [comments, total] = await Promise.all([
        Comment.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("user", "userName displayName img"),
        Comment.countDocuments(),
    ]);

    return ApiResponse.success(res, {
        message: "Comments fetched",
        data: { comments, total, page, pages: Math.ceil(total / limit) },
    });
});

export const deleteComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const comment = await Comment.findByIdAndDelete(id);
    if (!comment) throw new AppError("Comment not found", 404);

    return ApiResponse.success(res, { message: "Comment deleted" });
});

export const getSettings = asyncHandler(async (req, res) => {
    const settings = await SettingsService.get();
    return ApiResponse.success(res, {
        message: "Settings fetched",
        data: settings,
    });
});

export const updateSettings = asyncHandler(async (req, res) => {
    const { uploadProvider } = req.body;

    if (uploadProvider && !["imagekit", "cloudinary"].includes(uploadProvider)) {
        throw new AppError("Invalid upload provider", 400);
    }

    const settings = await SettingsService.update({ uploadProvider });
    return ApiResponse.success(res, {
        message: "Settings updated",
        data: settings,
    });
});
