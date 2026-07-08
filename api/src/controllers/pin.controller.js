import Pin from "../models/pin.model.js";
import imagekit from "../utils/imagekit.js";
import likeModel from "../models/like.model.js";
import saveModel from "../models/save.model.js";
import { getDownloadUrl } from "../utils/mediaUrls.js";

export const getPins = async (req, res) => {
    const pageNumber = Number(req.query.cursor) || 0;
    const search = req.query.search?.trim();
    const userId = req.query.userId;
    const boardId = req.query.boardId;
    const deviceType = req.query.deviceType;
    const LIMIT = 21;

    let query = {};
    if (search && search !== "") {
        query = {
            $or: [
                { title: { $regex: search, $options: "i" } },
                { tags: { $in: [search] } },
                { category: { $regex: search, $options: "i" } },
            ],
        };
    } else if (userId) {
        query = { user: userId };
    } else if (boardId) {
        query = { board: boardId };
    }

    if (deviceType && deviceType !== "all") {
        query.deviceType = deviceType === "both"
            ? "both"
            : { $in: [deviceType, "both"] };
    }

    const pins = await Pin.find(query).limit(LIMIT).skip(pageNumber * LIMIT);
    const hasNextPage = pins.length === LIMIT;

    res.status(200).json({ pins, nextCursor: hasNextPage ? pageNumber + 1 : null });
};

export const getPin = async (req, res) => {
    const { id } = req.params;
    const pin = await Pin.findById(id).populate("user", "userName img displayName");
    res.status(200).json(pin);
};

export const getPinDownload = async (req, res) => {
    const { id } = req.params;
    const pin = await Pin.findById(id);
    if (!pin) {
        return res.status(404).json({ message: "Pin not found" });
    }

    const downloadUrl = getDownloadUrl(pin);
    if (!downloadUrl) {
        return res.status(404).json({ message: "Download URL not available" });
    }

    const safeTitle = (pin.title || "wallpaper").replace(/[^a-z0-9-_]/gi, "_");
    const ext = pin.originalUrl?.includes(".png") ? "png" : "jpg";

    return res.status(200).json({
        downloadUrl,
        filename: `${safeTitle}_${pin.resolution || `${pin.width}x${pin.height}`}.${ext}`,
        resolution: pin.resolution || `${pin.width}x${pin.height}`,
        width: pin.width,
        height: pin.height,
        deviceType: pin.deviceType,
    });
};

const buildTransformationString = (parsedTextOptions, parsedCanvasOptions, width, height, originalAspectRatio, clientAspectRatio) => {
    const textLeftPosition = Math.round((parsedTextOptions.left * width) / 375);
    const textTopPosition = Math.round((parsedTextOptions.top * height) / parsedCanvasOptions.height);

    return `w-${width},h-${height}${
        originalAspectRatio > clientAspectRatio ? ",cm-pad_resize" : ""
    },bg-${(parsedCanvasOptions.backgroundColor || "#008080").substring(1)}${
        parsedTextOptions.text
            ? `,l-text,i-${parsedTextOptions.text},fs-${parsedTextOptions.fontSize},lx-${textLeftPosition},ly-${textTopPosition},co-${parsedTextOptions.color.substring(1)},l-end`
            : ""
    }`;
};

const applyImageKitTransform = async (mediaPath, transformationString, fileName) => {
    const transformedUrl = imagekit.url({
        path: mediaPath,
        transformation: [{ raw: transformationString }],
    });

    const response = await imagekit.upload({
        file: transformedUrl,
        fileName: fileName || `pin-${Date.now()}.jpg`,
        folder: "/wallpapers",
    });

    return response;
};

export const createPin = async (req, res) => {
    try {
        const {
            title, description, link, board, tags,
            textOptions, canvasOptions,
            media, originalMedia, originalUrl, uploadProvider,
            width, height, deviceType, category, resolution,
        } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: "Title and description are required!" });
        }

        const parsedTextOptions = typeof textOptions === "string" ? JSON.parse(textOptions || "{}") : (textOptions || {});
        const parsedCanvasOptions = typeof canvasOptions === "string" ? JSON.parse(canvasOptions || "{}") : (canvasOptions || {});

        let mediaPath = media || originalMedia;
        let originalPath = originalMedia || media;
        let pinWidth = Number(width);
        let pinHeight = Number(height);
        const provider = uploadProvider || "imagekit";

        if (!mediaPath) {
            return res.status(400).json({ message: "Image upload is required!" });
        }

        const hasEditorChanges =
            provider === "imagekit" &&
            (parsedTextOptions.text ||
                parsedCanvasOptions.size !== "original" ||
                parsedCanvasOptions.backgroundColor !== "#008080");

        if (hasEditorChanges && pinWidth && pinHeight) {
            const originalAspectRatio = pinWidth / pinHeight;
            const originalOrientation = pinWidth < pinHeight ? "portrait" : "landscape";

            let clientAspectRatio;
            if (parsedCanvasOptions.size !== "original") {
                const [w, h] = parsedCanvasOptions.size.split(":");
                clientAspectRatio = w / h;
            } else {
                clientAspectRatio =
                    parsedCanvasOptions.orientation === originalOrientation
                        ? originalAspectRatio
                        : 1 / originalAspectRatio;
            }

            const transformWidth = pinWidth;
            const transformHeight = pinWidth / clientAspectRatio;

            const transformationString = buildTransformationString(
                parsedTextOptions,
                parsedCanvasOptions,
                transformWidth,
                transformHeight,
                originalAspectRatio,
                clientAspectRatio
            );

            const response = await applyImageKitTransform(originalPath, transformationString, `pin-${Date.now()}.jpg`);
            mediaPath = response.filePath;
            pinWidth = response.width;
            pinHeight = response.height;
        }

        const tagList = Array.isArray(tags)
            ? tags
            : (tags ? tags.split(",").map((tag) => tag.trim()).filter(Boolean) : []);

        const newPin = await Pin.create({
            user: req.userId,
            title,
            description,
            link: link || null,
            board: board || "general",
            tags: tagList,
            media: mediaPath,
            originalMedia: originalPath,
            originalUrl: originalUrl || null,
            uploadProvider: provider,
            width: pinWidth,
            height: pinHeight,
            resolution: resolution || `${pinWidth}x${pinHeight}`,
            deviceType: deviceType || "both",
            category: category || "general",
        });

        return res.status(201).json(newPin);
    } catch (err) {
        console.error("createPin error:", err);
        return res.status(500).json({ message: err.message || "Failed to create pin" });
    }
};

export const interactionCheck = async (req, res) => {
    const { id } = req.params;
    const likeCount = await likeModel.countDocuments({ pin: id });

    if (!req.userId) {
        return res.status(200).json({ likeCount, isLiked: false, isSaved: false });
    }

    const isLiked = await likeModel.findOne({ user: req.userId, pin: id });
    const isSaved = await saveModel.findOne({ user: req.userId, pin: id });

    return res.status(200).json({
        likeCount,
        isLiked: Boolean(isLiked),
        isSaved: Boolean(isSaved),
    });
};

export const interact = async (req, res) => {
    const { id } = req.params;
    const { type } = req.body;

    if (type === "like") {
        const isLiked = await likeModel.findOne({ pin: id, user: req.userId });
        if (isLiked) {
            await likeModel.deleteOne({ pin: id, user: req.userId });
        } else {
            await likeModel.create({ pin: id, user: req.userId });
        }
    } else {
        const isSaved = await saveModel.findOne({ pin: id, user: req.userId });
        if (isSaved) {
            await saveModel.deleteOne({ pin: id, user: req.userId });
        } else {
            await saveModel.create({ pin: id, user: req.userId });
        }
    }

    return res.status(200).json({ message: "Successfull" });
};
