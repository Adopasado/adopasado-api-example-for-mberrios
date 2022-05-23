const mongoose = require("mongoose");

// soft delete
const mongooseDelete = require("mongoose-delete");

const JobSchema = new mongoose.Schema({
    company: {
        type: String,
        required: [true, "Please provide company name"],
        maxlength: 50,
    },
    position: {
        type: String,
        required: [true, "Please provide position"],
        maxlength: 100,
    },
    status: {
        type: String,
        enum: ["interview", "declined", "pending", "aproved"],
        default: "pending",
    },
    createdByUserId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: [true, "Please provide UserId"],
    },
    emailOfCreator: {
        type: String,
        required: [true, "Please provide email"],
    },
}, {
    timestamps: true,
    versionKey: false,
});

JobSchema.set('toJSON', ({
    transform: (document, returnOnject) => {
        returnOnject.id = returnOnject._id
        delete returnOnject._id
        delete returnOnject.__v
    }
}))


// using soft delete
JobSchema.plugin(mongooseDelete, { overrideMethods: "all" });
module.exports = mongoose.model("Job", JobSchema);