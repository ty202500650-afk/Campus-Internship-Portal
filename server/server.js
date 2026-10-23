
const bcrypt = require("bcryptjs");
const express = require("express");
const cors = require("cors");
const db = require("./db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Job and Internship Application System API is running!");
});

app.get("/api/test", (req, res) => {
    res.json({
        message: "Backend is working successfully!"
    });
});

// Test the MySQL connection
app.get("/api/db-test", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT DATABASE() AS database_name");

        res.json({
            message: "Database connection successful!",
            database: rows[0].database_name
        });
    } catch (error) {
        console.error("Database connection error:", error.message);

        res.status(500).json({
            message: "Database connection failed.",
            error: error.message
        });
    }
});


app.post("/api/auth/register", async (req, res) => {
    try {
        const {
            first_name,
            middle_initial,
            last_name,
            email,
            password,
            role
        } = req.body;

        // Check required fields
        if (!first_name || !last_name || !email || !password || !role) {
            return res.status(400).json({
                message: "Please fill in all required fields."
            });
        }

        // Check that the role is allowed
        const allowedRoles = ["Student", "Employer"];

        const formattedRole =
            role.charAt(0).toUpperCase() +
            role.slice(1).toLowerCase();

        if (!allowedRoles.includes(formattedRole)) {
            return res.status(400).json({
                message: "Invalid account type."
            });
        }

        // Check if the email is already registered
        const [existingUsers] = await db.execute(
            "SELECT user_id FROM users WHERE email = ?",
            [email.trim()]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                message: "This email is already registered."
            });
        }

        // Hash the password before saving it
        const passwordHash = await bcrypt.hash(password, 10);

        // Save the user to MySQL
        await db.execute(
            `INSERT INTO users
            (name, first_name, middle_initial, last_name, email, password_hash, role)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                `${first_name.trim()} ${last_name.trim()}`,
                first_name.trim(),
                middle_initial ? middle_initial.trim().replace(/\.$/, "").charAt(0) : null,
                last_name.trim(),
                email.trim(),
                passwordHash,
                formattedRole
            ]
        );

        return res.status(201).json({
            message: "Account created successfully!"
        });

    } catch (error) {
        console.error("Registration error:", error.message);

        return res.status(500).json({
            message: "Unable to create account. Please try again."
        });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
