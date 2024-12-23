const Admin = require("../model/adminloginModel");

// Admin login
const adminLogin = async (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        // Check if admin exists in the database
        const admin = await Admin.findOne({ name });
        if (!admin) {
            return res.status(404).json({ message: "Admin not found." });
        }

        // Verify password
        if (admin.password !== password) {
            console.log("pass not correct")
            return res.status(401).json({ message: "Invalid credentials." });
        }

        // Successful login
        console.log(admin)
        res.status(200).json({success:true, message: "Login successful.", admin: admin });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Server error." });
    }
};

module.exports = {
    adminLogin,
};
