import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

// Register a new user
export const register = (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "Please provide all fields" });

  // Hash password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ message: err.message });

    // Insert into DB
    db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword],
      (err) => {
        if (err) return res.status(500).json({ message: err.message });
        res.status(201).json({ message: "User registered successfully" });
      }
    );
  });
};

// Login user
export const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Please provide email and password" });

  // Check user exists
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0)
      return res.status(400).json({ message: "Invalid credentials" });

    const user = results[0];

    // Compare password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ message: err.message });
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

      // Create JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ token });
    });
  });
};

// Get current logged-in user
export const getMe = (req, res) => {
  res.json({ user: req.user });
};
