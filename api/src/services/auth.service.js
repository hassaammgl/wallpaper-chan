import User from "../models/user.model.js";
import { TokenService } from "../utils/Jwt.js";
import { AppError } from "../utils/AppError.js";
import { DTO } from "../utils/Dto.js";
import bcrypt from "bcryptjs";

export class AuthService {
    static async #generateAuthTokens(user) {
        const accessToken = TokenService.generateAccessToken(
            user._id.toString()
        );
        const refreshToken = TokenService.generateRefreshToken(
            user._id.toString()
        );

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return {
            accessToken,
            refreshToken,
        };
    }

    static async register(data) {
        const { email, userName, displayName, password } = data;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AppError("Email already in use", 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, userName, displayName, hashedPassword });
        await user.save();

        const tokens = await this.#generateAuthTokens(user);
        return {
            ...tokens,
            user: DTO.userDto(user),
        };
    }

    static async login(data) {
        const { email, password } = data;

        const user = await User.findOne({ email }).select('+hashedPassword +refreshToken');

        if (!user) {
            throw new AppError("Invalid email or password", 401);
        }

        const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isPasswordValid) {
            throw new AppError("Invalid email or password", 401);
        }

        const tokens = await this.#generateAuthTokens(user);
        return {
            ...tokens,
            user: DTO.userDto(user),
        };
    }

    static async logout(_id) {
        await User.findByIdAndUpdate({ _id }, { refreshToken: null })
        return true
    }
}
