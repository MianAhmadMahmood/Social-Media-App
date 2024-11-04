import { User } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import getDatauri from '../utils/datauri.js';
import cloudinary from '../utils/cloudinary.js';
import { Post } from '../models/post.model.js'; 

//register
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(401).json({
                message: "Try different email",
                success: false,
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            username,
            email,
            password: hashedPassword,
        });
        return res.status(201).json({
            message: "Account created successfully.",
            success: true,
        });
    } catch (error) {
        console.log(error);
    }
};

//login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        }

        const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });

        const populatedPosts = await Promise.all(
            user.posts.map(async (postId) => {
                const post = await Post.findById(postId);
                if (post && post.author.equals(user._id)) {
                    return post;
                }
                return null;
            })
        );

        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            posts: populatedPosts,
        };

        return res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 1 * 24 * 60 * 60 * 1000 }).json({
            message: `Welcome back ${user.username}`,
            success: true,
            user,
        });

    } catch (error) {
        console.log(error);
    }
};

//logout
export const logout = async (req, res) => {
    try {
        return res.cookie("token", "", { maxAge: 0 }).json({
            message: 'Logged out successfully',
            success: true,
        });
    } catch (error) {
        console.log(error);
    }
};

//get profile
export const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        let user = await User.findById(userId).populate({path:'posts', createdAt:-1}).populate('bookmarks');
        return res.status(200).json({
            user,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};
//edit profile
export const editProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { bio, gender } = req.body;
        const profilePicture = req.file;
        let cloudResponse;

        if (profilePicture) {
            const fileUri = getDatauri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false,
            });
        }
        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (profilePicture) user.profilePicture = cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            message: 'Profile updated',
            success: true,
            user,
        });
    } catch (error) {
        console.log(error);
    }
};

//get suggested users
export const getSuggestedUsers = async (req, res) => {
    try {
        const SuggestedUsers = await User.find({ _id: { $ne: req.id } }).select("-password");
        if (!SuggestedUsers) {
            return res.status(400).json({
                message: 'Currently do not have any user',
            });
        }
        return res.status(200).json({
            success: true,
            users: SuggestedUsers,
        });
    } catch (error) {
        console.log(error);
    }
};

//follow or unfollow
export const followOrunfollow = async (req, res) => {
    try {
        const followkrnewala = req.id; // user 1 (logged-in user)
        const jiskoFollowkrunga = req.params.id; // user 2 (target user)

        if (followkrnewala === jiskoFollowkrunga) {
            return res.status(400).json({
                message: "You cannot follow or unfollow yourself",
                success: false,
            });
        }

        const user = await User.findById(followkrnewala);
        const targetUser = await User.findById(jiskoFollowkrunga);

        if (!user || !targetUser) {
            return res.status(400).json({
                message: "User not found",
                success: false,
            });
        }

        const isFollowing = user.following.includes(jiskoFollowkrunga);
        if (isFollowing) {
            // Unfollow logic
            await Promise.all([
                User.updateOne({ _id: followkrnewala }, { $pull: { following: jiskoFollowkrunga } }),
                User.updateOne({ _id: jiskoFollowkrunga }, { $pull: { followers: followkrnewala } }),
            ]);
            return res.status(200).json({
                message: 'Unfollowed successfully',
                success: true,
            });
        } else {
            // Follow logic
            await Promise.all([
                User.updateOne({ _id: followkrnewala }, { $push: { following: jiskoFollowkrunga } }),
                User.updateOne({ _id: jiskoFollowkrunga }, { $push: { followers: followkrnewala } }),
            ]);
            return res.status(200).json({
                message: 'Followed successfully',
                success: true,
            });
        }
    } catch (error) {
        console.log(error);
    }
};
