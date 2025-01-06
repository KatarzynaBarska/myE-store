//schemat users
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"],
    },
    email: {
        type: String,
        required: [true, "Please add an email"],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Please add a password"],
        minlength: [6, "Password must be at least 6 characters"],
    },

    cartItems: [
        {
        quantity: {
            type: Number,
            required: true,
            default: 1,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
    }],
    role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer",
    },
}, 
{
    timestamps: true,
}
);

const User = mongoose.model("User", userSchema);

export default User;