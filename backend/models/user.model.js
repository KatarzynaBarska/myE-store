//schemat users
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

//schemat dla dla modelu usera w bibliotece Mongoose dla Node.js
//Schemat Mongoose to konstrukcja danych w bazie danych MongoDB.
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



//Pre-save hook to hash password before saving to database
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error)
    }
});

//sprawdza dane uwierzytalniające (credentials)
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// utworzenie modelu usera musi być na końcu pliku, żeby funkcja hashPassword działała
const User = mongoose.model("User", userSchema);


export default User;