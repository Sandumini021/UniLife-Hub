import React, { useState } from "react";
import api from "../../api";

const GRADE_THRESHOLDS = { A: 85, "B+": 75, B: 65 };
const GRADE_POINTS = { A: 4, B: 3, C: 2, D: 1, F: 0 };

const getDifficulty = (required) => {
  if (required <= 60) return "Easy";
  if (required <= 80) return "Moderate";
  return "Hard";
};

export default function PredictorScreen({ subjects }) {
  const [subjectId, setSubjectId] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [targetGrade, setTargetGrade] = useState("A");

  const selectedSubject = subjects.find((subject) => subject._id === subjectId);
  const completedWeight = selectedSubject?.totalWeight ?? 0;
  const currentGpa =
    subjects.length > 0
      ? (
          subjects.reduce(
            (sum, s) => sum + (GRADE_POINTS[s.calculatedGrade] ?? 0) * (Number(s.credits) || 0),
            0
          ) /
          Math.max(1, subjects.reduce((sum, s) => sum + (Number(s.credits) || 0), 0))
        ).toFixed(1)
      : "0.0";

  const buildQuickTarget = (label, threshold) => {
    if (!selectedSubject) return { label, value: 0, note: "Select subject", color: "neutral" };
    const currentScore = Number(selectedSubject.currentScore || 0);
    const remaining = Math.max(0, 100 - completedWeight);
    const required = remaining ? ((threshold - currentScore) * 100) / remaining : 0;
    const safeRequired = Number(required.toFixed(0));
    return {
      label,
      value: Math.max(0, safeRequired),
      note: `${Math.max(0, safeRequired)}% needed`,
      color: label === "A" ? "green" : label === "B+" ? "orange" : "yellow"
    };
  };

  const quickTargets = [
    buildQuickTarget("A", GRADE_THRESHOLDS.A),
    buildQuickTarget("B+", GRADE_THRESHOLDS["B+"]),
    buildQuickTarget("B", GRADE_THRESHOLDS.B)
  ];

  const runPrediction = async () => {
    if (!subjectId) return;
    const res = await api.get(`/subjects/${subjectId}/predict?targetGrade=${targetGrade}`);
    setPrediction(res.data);
  };

  return (
    <div className="tab-panel predictor-modern">
      <div className="predictor-top">
        <div>
          <h3>Grade Predictor</h3>
          <p className="feature-subtitle">
            Estimate required scores to reach your target grade.
          </p>
        </div>
        <div className="predictor-badges">
          <div className="predictor-badge">Current GPA <strong>{currentGpa}</strong></div>
          <div className="predictor-badge">Completed Weight <strong>{completedWeight}%</strong></div>
        </div>
      </div>

      <div className="predictor-form">
        <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
          <option value="">Select Subject</option>
          {subjects.map((subject) => (
            <option key={subject._id} value={subject._id}>
              {subject.name}
            </option>
          ))}
        </select>
        <select value={targetGrade} onChange={(e) => setTargetGrade(e.target.value)}>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
        <button type="button" onClick={runPrediction}>
          Predict Required Grade
        </button>
      </div>

      <div className="predictor-grid">
        <div className="predictor-left">
          <h4>Prediction Result</h4>
          {prediction ? (
            <>
              <div className="predictor-metrics">
                <div><span>Required Marks</span><strong>{Math.max(0, Math.round(prediction.requiredAverageOnRemaining))}%</strong></div>
                <div><span>Remaining Weight</span><strong>{Math.round(prediction.remainingWeight)}%</strong></div>
                <div><span>Difficulty</span><strong className={prediction.achievable ? "warn" : "danger"}>{getDifficulty(prediction.requiredAverageOnRemaining)}</strong></div>
              </div>
              <input
                className="predictor-slider"
                type="range"
                min="0"
                max="100"
                value={Math.max(0, Math.min(100, prediction.requiredAverageOnRemaining))}
                readOnly
              />
              <p className="predictor-note">
                Need at least <strong>{Math.max(0, Math.round(prediction.requiredAverageOnRemaining))}%</strong> in remaining assessments to get {targetGrade}.
              </p>
              <div className="predictor-suggestions">
                <div>Suggestions:</div>
                <div>Score consistently above {Math.max(60, Math.round(prediction.requiredAverageOnRemaining))}% in the next assessments.</div>
                <div>Aim 10% above the target required mark for safer results.</div>
              </div>
            </>
          ) : (
            <p className="predictor-note">Select a subject and target grade to view prediction results.</p>
          )}
        </div>

        <div className="predictor-right">
          <h4>Quick Target Grades</h4>
          {quickTargets.map((item) => (
            <div key={item.label} className={`predictor-target ${item.color}`}>
              <div>
                <strong>Predict {item.label}</strong>
                <p>{item.note}</p>
              </div>
              <div className="predictor-target-value">{item.value}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
