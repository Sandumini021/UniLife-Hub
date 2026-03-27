import React from "react";

export default function StudyTipsScreen() {
  return (
    <div className="tab-panel">
      <h3>Study Tips & Resources</h3>
      <p className="feature-subtitle">
        Practical routines and links you can follow while tracking your grades.
      </p>

      <div className="tips-grid">
        <div className="tips-card">
          <h4>Weekly Plan</h4>
          <ul>
            <li>Block 2 focused study sessions per subject</li>
            <li>Review lecture notes within 24 hours</li>
            <li>Do a 30-minute recap every Sunday</li>
          </ul>
        </div>

        <div className="tips-card">
          <h4>Exam Prep</h4>
          <ul>
            <li>Practice past papers under timed conditions</li>
            <li>Make a mistake log and revise it daily</li>
            <li>Prioritize topics with low marks in analytics</li>
          </ul>
        </div>

        <div className="tips-card">
          <h4>Resources</h4>
          <ul>
            <li>Active recall + spaced repetition</li>
            <li>Pomodoro (25/5) for consistency</li>
            <li>Use grade predictor to set realistic targets</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

