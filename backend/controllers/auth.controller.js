// @ts-nocheck
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    console.log("Signup request received:", req.body);

    const { fullName, username, email, password } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      console.log(email, "Invalid email format");
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.log("Email is already taken");
      return res.status(400).json({ error: "Email is already taken" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log("Username is already taken");
      return res.status(400).json({ error: "Username is already taken" });
    }

    if (password.length < 6) {
      console.log("Password must be at least 6 characters");
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    generateTokenAndSetCookie(newUser._id, res);

    console.log("User created successfully:", newUser);
    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      username: newUser.username,
      email: newUser.email,
      followers: newUser.followers,
      following: newUser.following,
      profileImg: newUser.profileImg,
      coverImg: newUser.coverImg,
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {

    const { username, password } = req.body
    const user = await User.findOne({username})
    const isPasswordCorrect = await bcrypt.compare(password, user?.password || "")

    if(!user) {
        return res.status(400).json({ error: "Invalid username !"})
    } else if (!isPasswordCorrect) {
        return res.status(400).json({ error: "Invalid password !"})
    }

    generateTokenAndSetCookie(user._id, res)

    res.status(200).json({
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        followers: user.followers,
        following: user.following,
        profileImg: user.profileImg,
        coverImg: user.coverImg,
      });
  } catch (error) {
    console.log("Error in login controller", error.message);

    res.status(500).json({ error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    
    res.cookie("jwt", "", {maxAge:0})
    res.status(200).json({ message: "Logout Successful !"})

  } catch (error) {
    console.log("Error in logout controller", error.message);

    res.status(500).json({ error: error.message });
  }
};


export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password")
        res.status(200).json(user)
    } catch (error) {
        console.log("Error in getMe controller", error.message);

        res.status(500).json({ error: error.message });
    }
}
