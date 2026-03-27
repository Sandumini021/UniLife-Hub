const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ["assignment", "exam"], required: true },
    maxMarks: { type: Number, required: true, min: 1 },
    scoredMarks: { type: Number, required: true, min: 0 },
    weight: { type: Number, required: true, min: 0, max: 100 }
  },
  { _id: true }
);

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  credits: { type: Number, required: true, min: 1 },
  semester: { type: String, required: true, trim: true },
  finalGrade: { type: String, default: "" },
  assessments: { type: [assessmentSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model("Subject", SubjectSchema);
