
// ============================================
// InternLink - Campus Job & Internship Portal
// File: server.js
// ============================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(express.json());

// ============================================
// HOME ROUTE
// ============================================

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the InternLink API!",
    status: "Server is running",
  });
});

// ============================================
// TEST API ROUTE
// ============================================

app.get("/api/test", (req, res) => {
  res.json({
    message: "InternLink API is working!",
  });
});

// ============================================
// TEST DATABASE CONNECTION
// ============================================

app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT 1 AS result");

    res.json({
      message: "Database connection successful!",
      result: rows[0].result,
    });
  } catch (error) {
    console.error("Database test error:", error.message);

    res.status(500).json({
      message: "Database connection failed.",
    });
  }
});

// ============================================
// REGISTER NEW USER
// ============================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      first_name,
      middle_initial,
      last_name,
      email,
      password,
      role,
    } = req.body;

    // Validate required fields
    if (
      typeof first_name !== "string" ||
      typeof last_name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !first_name.trim() ||
      !last_name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Please complete all required fields.",
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
      });
    }

    // Validate account role
    if (!["Student", "Employer"].includes(role)) {
      return res.status(400).json({
        message: "Please select a valid account type.",
      });
    }

    const cleanFirstName = first_name.trim();
    const cleanLastName = last_name.trim();
    const cleanEmail = email.trim().toLowerCase();

    const cleanMiddleInitial =
      typeof middle_initial === "string" &&
      middle_initial.trim() !== ""
        ? middle_initial.trim().replace(/\.$/, "").charAt(0)
        : null;

    const fullName = cleanMiddleInitial
      ? `${cleanFirstName} ${cleanMiddleInitial}. ${cleanLastName}`
      : `${cleanFirstName} ${cleanLastName}`;

    // Check whether the email is already registered
    const [existingUsers] = await db.execute(
      "SELECT user_id FROM users WHERE email = ? LIMIT 1",
      [cleanEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: "This email is already registered.",
      });
    }

    // Hash the password before saving it
    const passwordHash = await bcrypt.hash(password, 12);

    // Save the new account
    const [result] = await db.execute(
      `INSERT INTO users
        (
          name,
          first_name,
          middle_initial,
          last_name,
          email,
          password_hash,
          role
        )
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        fullName,
        cleanFirstName,
        cleanMiddleInitial,
        cleanLastName,
        cleanEmail,
        passwordHash,
        role,
      ]
    );

    return res.status(201).json({
      message: "Account created successfully!",
      user: {
        user_id: result.insertId,
        name: fullName,
        email: cleanEmail,
        role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    return res.status(500).json({
      message: "Unable to create your account. Please try again.",
    });
  }
});

// ============================================
// LOGIN USER
// ============================================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate login fields
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Please enter your email and password.",
      });
    }

    // Find the account by email
    const [users] = await db.execute(
      `SELECT
          user_id,
          name,
          email,
          password_hash,
          role
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email.trim().toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const user = users[0];

    // Compare the entered password with the stored password hash
    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Check JWT configuration
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET is missing from server/.env");

      return res.status(500).json({
        message: "Server authentication is not configured.",
      });
    }

    // Create an authentication token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role,
      },
      secret,
      {
        expiresIn: "2h",
      }
    );

    // Return token and safe user information
    return res.json({
      message: "Login successful!",
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Unable to log in. Please try again.",
    });
  }
});

// ============================================
// GET OPEN JOBS AND INTERNSHIPS
// ============================================

app.get("/api/jobs", async (req, res) => {
  try {
    const [jobs] = await db.execute(
      `SELECT
          jp.*,
          c.company_name
       FROM job_postings AS jp
       LEFT JOIN companies AS c
          ON jp.company_id = c.company_id
       WHERE LOWER(jp.status) = 'open'
         AND (
           jp.deadline IS NULL
           OR jp.deadline >= CURDATE()
         )
       ORDER BY jp.deadline IS NULL ASC, jp.deadline ASC`
    );

    return res.json(jobs);
  } catch (error) {
    console.error("Get jobs error:", error.message);

    return res.status(500).json({
      message: "Unable to retrieve jobs and internships.",
    });
  }
});

// ============================================
// CHECK JOBS API
// ============================================

app.get("/api/jobs-check", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT COUNT(*) AS total FROM job_postings"
    );

    return res.json({
      message: "Jobs API is working!",
      totalJobs: rows[0].total,
    });
  } catch (error) {
    console.error("Jobs check error:", error.message);

    return res.status(500).json({
      message: "Unable to check job postings.",
    });
  }
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(
    `InternLink server is running at http://localhost:${PORT}`
  );
});