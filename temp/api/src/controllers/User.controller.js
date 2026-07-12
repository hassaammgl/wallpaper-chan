import User from "../models/user.model.js"
import Follow from "../models/follow.model.js";

export const getUser = async (req, res) => {
    const { userName } = req.params;

    const user = await User.findOne({ userName });

    if (!user) {
        return res.status(404).json({ message: "user not found" })
    }

    const { hashedPassword, ...detailsWithoutPassword } = user.toObject();

    const followerCounts = await Follow.countDocuments({ following: user._id })
    const followingCounts = await Follow.countDocuments({ follower: user._id })

    let isFollowing = false
    if (req.userId) {
        const isExists = await Follow.exists({
            follower: req.userId,
            following: user._id,
        });
        isFollowing = Boolean(isExists)
    }

    res.status(200).json({
        ...detailsWithoutPassword,
        followerCounts,
        followingCounts,
        isFollowing,
    })
};

export const followUser = async (req, res) => {
    const { userName } = req.params;

    const user = await User.findOne({ userName });
    if (!user) {
        return res.status(404).json({ message: "user not found" })
    }

    const isFollowing = await Follow.exists({
        follower: req.userId,
        following: user._id,
    })

    if (isFollowing) {
        await Follow.deleteOne({ follower: req.userId, following: user._id })
    } else {
        await Follow.create({ follower: req.userId, following: user._id })
    }

    res.status(200).json({ message: "successfull" });
};
