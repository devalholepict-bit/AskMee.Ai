import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../service/mail.service.js";


export async function register(req, res) {

    const { username, email, password } = req.body;

    const isUserAlreadyExists = await userModel.findOne({
        $or: [ { email }, { username } ]
    })

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "User with this email or username already exists",
            success: false,
            err: "User already exists"
        })
    }

    const user = await userModel.create({ username, email, password })

    const EmailverificationToken = jwt.sign({
        email: user.email,
    }, process.env.JWT_SECRET)

const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
const verifyLink = `${baseUrl}/api/auth/verify-email?token=${EmailverificationToken}`

await sendEmail({
  to: email,
  subject: "Verify your email - AskMee.AI",
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Welcome to AskMee.AI 🚀</h2>
      
      <p>Hi ${username},</p>
      
      <p>Thanks for signing up. Please confirm your email address to activate your account.</p>
      
      <p>
        <a 
          href="${verifyLink}" 
          style="
            display:inline-block;
            padding:10px 18px;
            background-color:#F95C4B;
            color:#ffffff;
            text-decoration:none;
            border-radius:6px;
            font-weight:bold;
          "
        >
          Verify Email
        </a>
      </p>

      <p>If you didn’t create this account, you can safely ignore this email.</p>

      <p>Thanks,<br/>The AskMee.AI Team</p>
    </div>
  `
});

    res.status(201).json({
        message: "User registered successfully",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            hasSetUsername: user.hasSetUsername
        }
    });



}

export async function login(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password",
            success: false,
            err: "User not found"
        })
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
        return res.status(400).json({
            message: "Invalid email or password",
            success: false,
            err: "Incorrect password"
        })
    }

    if (!user.verified) {
        return res.status(400).json({
            message: "Please verify your email before logging in",
            success: false,
            err: "Email not verified"
        })
    }

    const token = jwt.sign({
        id: user._id,
        username: user.username,
    }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.cookie("token", token)

    res.status(200).json({
        message: "Login successful",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            hasSetUsername: user.hasSetUsername
        }
    })

}

/**
 * @desc Get current logged in user's details
 * @route GET /api/auth/get-me
 * @access Private
 */
export async function getMe(req, res) {
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
        return res.status(404).json({
            message: "User not found",
            success: false,
            err: "User not found"
        })
    }

    res.status(200).json({
        message: "User details fetched successfully",
        success: true,
        user
    })
}

export async function verifyEmail(req, res) {
    const { token } = req.query;
  
    try {


        const decoded = jwt.verify(token, process.env.JWT_SECRET);


        const user = await userModel.findOne({ email: decoded.email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid token",
                success: false,
                err: "User not found"
            })
        }

        user.verified = true;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/login?verified=true`);

    } catch (err) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/login?verified=false`);
}
}

export async function logout(req, res) {
    res.clearCookie("token")
    res.status(200).json({
        message: "Logged out successfully",
        success: true,
    })
}

export async function updateUsername(req, res) {
    const { username } = req.body;
    const userId = req.user.id;

    if (!username || username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({
            message: "Username must be 3-20 characters long and contain only alphanumeric characters and underscores",
            success: false,
            err: "Invalid username"
        });
    }

    const isUsernameTaken = await userModel.findOne({ username, _id: { $ne: userId } });

    if (isUsernameTaken) {
        return res.status(400).json({
            message: "Username already taken",
            success: false,
            err: "Username taken"
        });
    }

    const user = await userModel.findByIdAndUpdate(userId, { username, hasSetUsername: true }, { new: true });

    res.status(200).json({
        message: "Username updated successfully",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            hasSetUsername: user.hasSetUsername
        }
    });
}