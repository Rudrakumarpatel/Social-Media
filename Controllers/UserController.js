import UserModel from "../Models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

//get all users
export const getAllUsers = async (req, res) =>
{
  try
  {
    let users = await UserModel.find()
    users = users.map((user)=>{
      const { password,...otherDetails } = user._doc;
      return otherDetails;
    })
    res.status(200).json(users)
  }
  catch(e)
  {
    res.status(404).json({ message:"error"})
  }
}


// get a User
export const getUser = async (req, res) => {
  const id = req.params.id;
  console.log(id);
  try {
    const user = await UserModel.findById(id);

    if (user) {
      const { password, ...otherDetails } = user._doc;
      res.status(200).json(otherDetails);
    } else {
      res.status(404).json("No such user exists");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// update a user
export const updateUser = async (req, res) => {
  const id = req.params.id;
  console.log(req.body)
  const { _id, currentUserAdminStatus, password } = req.body;

  if (id === _id) {
    try {
      if (password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
      }
      const user = await UserModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      console.log("inUserController");

      const token = jwt.sign(
        {
          username: user.username,
          id: user._id
        },

        process.env.JWT_KEY,

        { expiresIn: "1h" }

      )

      res.status(200).json(user, token);
    } catch (error) {
      console.log("inerror");
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("Access Denied! you can only update your own profile");
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  const id = req.params.id;

  const { _id, currentUserAdminStatus } = req.body;

  if (_id === id || currentUserAdminStatus) {
    try {
      await UserModel.findByIdAndDelete(id);
      res.status(200).json("User deleted successfully");
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("Access Denied! you can only delete your own profile");
  }
};

// Follow a User
export const followUser = async (req, res) => {
  const id = req.params.id;
  const { _id } = req.body;
  console.log(id, _id)
  if (_id == id) {
    res.status(403).json("Action Forbidden");
  } else {
    try {
      const followUser = await UserModel.findById(id);
      const followingUser = await UserModel.findById(_id);

      if (!followUser.followers.includes(_id)) {
        await followUser.updateOne({ $push: { followers: _id } });
        await followingUser.updateOne({ $push: { following: id } });
        res.status(200).json("User followed!");
      } else {
        res.status(403).json("you are already following this id");
      }
    } catch (error) {
      console.log(error)
      res.status(500).json(error);
    }
  }
};

// UnFollow a User
export const unfollowUser = async (req, res) => {
  const id = req.params.id;
  const { _id } = req.body;
  console.log("in unfollwuser",id,_id);
  if(_id === id)
  {
    res.status(403).json("Action Forbidden")
  }
  else{
    try {
      const unFollowUser = await UserModel.findById(id)
      const unFollowingUser = await UserModel.findById(_id)


      if (unFollowUser.followers.includes(_id))
      {
        await unFollowUser.updateOne({$pull : {followers: _id}})
        await unFollowingUser.updateOne({$pull : {following: id}})
        res.status(200).json("Unfollowed Successfully!")
      }
      else{
        res.status(403).json("You are not following this User")
      }
    } catch (error) {
      res.status(500).json(error)
    }
  }
};