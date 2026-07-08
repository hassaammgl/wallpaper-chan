import User from "../models/user.model.js";
import { TokenService } from "../utils/Jwt.js"
import { AppError } from "../utils/AppError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const attachUserFromToken = async (req, accessToken) => {
    const decoded = TokenService.verifyAccessToken(accessToken);
    const user = await User.findById(decoded.id).select('-hashedPassword -refreshToken')
    if (!user) {
        throw new AppError('User not found', 404);
    }
    req.userId = user._id;
    req.user = user;
    return user;
}

export const protect = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            throw new AppError("Access token is required", 401);
        }
        await attachUserFromToken(req, accessToken);
        next()

    } catch (error) {
        if (error.message?.includes('expired')) {
            return ApiResponse.error(res, {
                message: 'Access token expired',
                statusCode: 401
            })
        }
        next(error);
    }
}

export const optionalAuth = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        if (accessToken) {
            await attachUserFromToken(req, accessToken);
        }
        next()
    } catch {
        next()
    }
}

export const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return ApiResponse.error(res, {
            message: "Admin access required",
            statusCode: 403,
        });
    }
    next();
}
