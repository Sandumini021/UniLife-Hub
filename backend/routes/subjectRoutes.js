const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject");

const GRADE_THRESHOLDS = { A: 85, B: 75, C: 65 };
const GRADE_POINTS = { A: 4, B: 3, C: 2, D: 1, F: 0 };

const getSubjectScore = (subject) => {
  if (!subject.assessments?.length) {
    return 0;
  }

  return subject.assessments.reduce((total, item) => {
    const percentage = item.maxMarks ? (item.scoredMarks / item.maxMarks) * 100 : 0;
    return total + (percentage * item.weight) / 100;
  }, 0);
};

const scoreToGrade = (score) => {
  if (score >= GRADE_THRESHOLDS.A) return "A";
  if (score >= GRADE_THRESHOLDS.B) return "B";
  if (score >= GRADE_THRESHOLDS.C) return "C";
  if (score >= 55) return "D";
  return "F";
};

const buildSubjectView = (subjectDoc) => {
  const subject = subjectDoc.toObject();
  const totalWeight = subject.assessments.reduce((sum, item) => sum + item.weight, 0);
  const currentScore = Number(getSubjectScore(subject).toFixed(2));
  const calculatedGrade = subject.finalGrade || scoreToGrade(currentScore);

  return {
    ...subject,
    totalWeight: Number(totalWeight.toFixed(2)),
    currentScore,
    calculatedGrade
  };
};

const buildGpaPayload = (subjects) => {
  const semesterMap = {};

  subjects.forEach((subject) => {
    const grade = subject.calculatedGrade || "F";
    const points = GRADE_POINTS[grade] ?? 0;
    if (!semesterMap[subject.semester]) {
      semesterMap[subject.semester] = { points: 0, credits: 0 };
    }

    semesterMap[subject.semester].points += points * subject.credits;
    semesterMap[subject.semester].credits += subject.credits;
  });

  const semesters = Object.entries(semesterMap).map(([semester, data]) => ({
    semester,
    gpa: data.credits ? Number((data.points / data.credits).toFixed(2)) : 0
  }));

  const totalPoints = Object.values(semesterMap).reduce((sum, item) => sum + item.points, 0);
  const totalCredits = Object.values(semesterMap).reduce((sum, item) => sum + item.credits, 0);

  return {
    semesterGpa: semesters,
    overallGpa: totalCredits ? Number((totalPoints / totalCredits).toFixed(2)) : 0
  };
};

// Create subject
router.post("/", async (req, res) => {
  try {
    const { name, credits, semester } = req.body;
    const subject = await Subject.create({ name, credits, semester });
    res.status(201).json(buildSubjectView(subject));
  } catch (error) {
    res.status(400).json({ message: "Unable to create subject", error: error.message });
  }
});

// Add mark / assessment into a subject
router.post("/:id/marks", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, maxMarks, scoredMarks, weight } = req.body;
    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    subject.assessments.push({ title, type, maxMarks, scoredMarks, weight });
    await subject.save();

    return res.status(201).json(buildSubjectView(subject));
  } catch (error) {
    return res.status(400).json({ message: "Unable to add assessment", error: error.message });
  }
});

// Delete a specific assessment/mark from subject
router.delete("/:id/marks/:markId", async (req, res) => {
  try {
    const { id, markId } = req.params;
    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    subject.assessments = subject.assessments.filter(
      (assessment) => String(assessment._id) !== String(markId)
    );
    await subject.save();

    return res.json(buildSubjectView(subject));
  } catch (error) {
    return res.status(500).json({ message: "Unable to remove mark", error: error.message });
  }
});

// Update a specific assessment/mark in subject
router.put("/:id/marks/:markId", async (req, res) => {
  try {
    const { id, markId } = req.params;
    const { title, type, maxMarks, scoredMarks, weight } = req.body;
    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const mark = subject.assessments.id(markId);
    if (!mark) {
      return res.status(404).json({ message: "Mark not found" });
    }

    mark.title = title;
    mark.type = type;
    mark.maxMarks = maxMarks;
    mark.scoredMarks = scoredMarks;
    mark.weight = weight;
    await subject.save();

    return res.json(buildSubjectView(subject));
  } catch (error) {
    return res.status(500).json({ message: "Unable to update mark", error: error.message });
  }
});

// List all subjects
router.get("/", async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ createdAt: -1 });
    res.json(subjects.map(buildSubjectView));
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch subjects", error: error.message });
  }
});

// GPA overview + progress trend
router.get("/gpa/overview", async (_req, res) => {
  try {
    const subjects = await Subject.find().sort({ createdAt: 1 });
    const views = subjects.map(buildSubjectView);
    const gpa = buildGpaPayload(views);

    let runningPoints = 0;
    let runningCredits = 0;
    const trend = views.map((item) => {
      const points = (GRADE_POINTS[item.calculatedGrade] ?? 0) * item.credits;
      runningPoints += points;
      runningCredits += item.credits;
      return {
        subject: item.name,
        date: item.createdAt,
        overallGpa: runningCredits ? Number((runningPoints / runningCredits).toFixed(2)) : 0
      };
    });

    res.json({ ...gpa, trend });
  } catch (error) {
    res.status(500).json({ message: "Unable to calculate GPA", error: error.message });
  }
});

// Delete one subject
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Subject.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Subject not found" });
    }
    return res.json({ message: "Subject removed" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to remove subject", error: error.message });
  }
});

// Predict required score for target grade
router.get("/:id/predict", async (req, res) => {
  try {
    const { id } = req.params;
    const targetGrade = String(req.query.targetGrade || "A").toUpperCase();
    const threshold = GRADE_THRESHOLDS[targetGrade];
    if (!threshold) {
      return res.status(400).json({ message: "targetGrade must be A, B or C" });
    }

    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const view = buildSubjectView(subject);
    const currentWeighted = view.currentScore;
    const remainingWeight = Math.max(0, 100 - view.totalWeight);

    const requiredOnRemaining = remainingWeight
      ? ((threshold - currentWeighted) * 100) / remainingWeight
      : 0;

    res.json({
      subjectId: view._id,
      subject: view.name,
      targetGrade,
      currentScore: currentWeighted,
      completedWeight: view.totalWeight,
      remainingWeight,
      requiredAverageOnRemaining: Number(requiredOnRemaining.toFixed(2)),
      achievable: requiredOnRemaining <= 100
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to predict grade", error: error.message });
  }
});

module.exports = router;