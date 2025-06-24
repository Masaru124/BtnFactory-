const express = require("express");
const User = require("../models/User");
const Product = require("../models/Product");
const authenticateToken = require("../middleware/authenticateToken");
const authorizeRoles = require("../middleware/authorizeRoles");
const { validateRoles, validateDepartments } = require("../utils/validateRolesDepartments");

const router = express.Router();

router.use(authenticateToken);

// Admin route to add user
router.post("/users", authorizeRoles(["admin"]), async (req, res) => {
  const { username, password, roles, departments } = req.body;

  if (!validateRoles(roles)) {
    return res.status(400).json({ message: "Invalid roles" });
  }
  if (!validateDepartments(departments)) {
    return res.status(400).json({ message: "Invalid departments" });
  }

  try {
    const newUser = new User({ username, password, roles, departments });
    await newUser.save();
    res.status(201).json({ message: "User created" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error creating user", error: err.message });
  }
});

// Admin route to get all users
router.get("/users", authorizeRoles(["admin"]), async (req, res) => {
  try {
    const users = await User.find({}, "username roles departments");
    res.json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: err.message });
  }
});

// Admin route to delete a user by username
router.delete("/users/:username", authorizeRoles(["admin"]), async (req, res) => {
  const { username } = req.params;

  try {
    const deletedUser = await User.findOneAndDelete({ username });
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: err.message });
  }
});

// Admin route to update user roles and departments
router.put("/users/:username/role", authorizeRoles(["admin"]), async (req, res) => {
  const { username } = req.params;
  const { roles, departments } = req.body;

  if (!validateRoles(roles)) {
    return res.status(400).json({ message: "Invalid roles" });
  }
  if (!validateDepartments(departments)) {
    return res.status(400).json({ message: "Invalid departments" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.roles = roles;
    user.departments = departments;
    await user.save();
    res.json({ message: "User roles and departments updated" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating user roles", error: err.message });
  }
});

// Admin route to add product
router.post("/products", authorizeRoles(["admin"]), async (req, res) => {
  const { name, description, price, stock } = req.body;
  try {
    const newProduct = new Product({ name, description, price, stock });
    await newProduct.save();
    res.status(201).json({ message: "Product added" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error adding product", error: err.message });
  }
}); 

router.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products", error: err.message });
  }
});

module.exports = router;
