const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;
const lifeTime = process.env.JWT_LIFETIME;

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide name"],
        minlength: 3,
        maxlength: 50,
    },
    email: {
        type: String,
        required: [true, "Please provide email"],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please provide valid email",
        ],
        unique: [true, "Email already exist"],
    },
    password: {
        type: String,
        required: [true, "Please provide password"],
        minlength: 5,
    },
    IsAdmin: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    versionKey: false,
});

UserSchema.set('toJSON', ({
    transform: (document, returnOnject) => {
        returnOnject.id = returnOnject._id
        delete returnOnject._id
        delete returnOnject.__v
    }
}))

// Crypting password here in model/better way for me
UserSchema.pre("save", async function() {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// JWT procedure here in model/better way for me
UserSchema.methods.createJWT = function() {
    return jwt.sign({ userId: this._id, name: this.name }, secretKey, {
        expiresIn: lifeTime,
    });
};

// Compare password procedure here in model/better way for me
UserSchema.methods.comparePassword = async function(candidatePassword) {
    const isMatch = await bcrypt.compare(
        candidatePassword,
        this.password
    );
    return isMatch;
};

module.exports = mongoose.model("User", UserSchema);