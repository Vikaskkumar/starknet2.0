const express = require("express");
const router = express.Router();
const POST = require("../models/post");
const USER = require("../models/User");
const requireLogin = require("../middlewares/requireLogin")



//for user-profile
router.get("/user/:id", async (req, res) => {
  try {
    const user = await USER.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await POST.find({ postedBy: req.params.id })
      .populate("postedBy", "_id name Photo")
      .sort("-createdAt");

    return res.status(200).json({ user, posts });
  } catch (err) {
    return res.status(422).json({ error: err.message });
  }
});

// follow user
router.put("/follow", requireLogin, async (req, res) => {
  try {
    const { followId } = req.body;

    if (!followId) {
      return res.status(422).json({ error: "followId is required" });
    }
    if (followId === req.user._id.toString()) {
      return res.status(422).json({ error: "You cannot follow yourself" });
    }

    const userToFollow = await USER.findById(followId);
    if (!userToFollow) {
      return res.status(404).json({ error: "User not found" });
    }

    await USER.findByIdAndUpdate(
      followId,
      { $addToSet: { followers: req.user._id } },
      { new: true }
    );

    const result = await USER.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { following: followId } },
      { new: true }
    );

    res.json({
      message: "User followed successfully",
      user: result
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//unfollow user
router.put("/unfollow", requireLogin, async (req, res) => {
  try {
    const { followId } = req.body;

    if (!followId) {
      return res.status(422).json({ error: "followId is required" });
    }

    // add me to his followers
    await USER.findByIdAndUpdate(
      followId,
      { $pull: { followers: req.user._id } }, // no duplicates
      { new: true }
    );

    // add him to my following
    const result = await USER.findByIdAndUpdate(
      req.user._id,
      { $pull: { following: followId } },
      { new: true }
    );

    res.json({
      message: "User unfollowed successfully",
      user: result
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// to show following posts
router.get("/myfollowingpost", requireLogin, async (req, res) => {
  try {
    const posts = await POST.find({
      postedBy: { $in: req.user.following }
    })
      .populate("postedBy", "_id name Photo")
      .populate("comments.postedBy", "_id name Photo")
      .sort("-createdAt");

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


router.put("/uploadProfilePic", requireLogin, async (req, res) => {
  try {
    if (!req.body.pic || typeof req.body.pic !== "string") {
      return res.status(422).json({ error: "A profile picture URL is required" });
    }

    const result = await USER.findByIdAndUpdate(
      req.user._id,
      {
        $set: { Photo: req.body.pic }
      },
      { new: true }
    );

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(422).json({ error: error.message });
  }
});

router.put("/removeProfilePic", requireLogin, async (req, res) => {
  try {
    const user = await USER.findByIdAndUpdate(
      req.user._id,
      { $unset: { Photo: "" } },
      { new: true }
    );

    res.json(user);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});




// Get all users for chat
router.get("/allusers", requireLogin, async (req, res) => {
  try {
    // Find all users except the currently logged in user
    const users = await USER.find({ _id: { $ne: req.user._id } }).select("_id name Photo userName");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
