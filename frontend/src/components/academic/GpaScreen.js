import React, { useMemo, useState } from "react";

const DEFAULT_GRADING_SCALE = [
  { grade: "A+", gpa: 4.0, marks: "90-100" },
  { grade: "A", gpa: 4.0, marks: "80-89" },
  { grade: "A-", gpa: 3.7, marks: "75-79" },
  { grade: "B+", gpa: 3.3, marks: "70-74" },
  { grade: "B", gpa: 3.0, marks: "65-69" },
  { grade: "B-", gpa: 2.7, marks: "60-64" },
  { grade: "C+", gpa: 2.3, marks: "55-59" },
  { grade: "C-", gpa: 2.0, marks: "45-54" },
  { grade: "D+", gpa: 1.7, marks: "40-44" },
  { grade: "D", gpa: 1.0, marks: "30-34" },
  { grade: "E", gpa: 0.0, marks: "0-29" }
];
const ALL_SUBJECT_MANAGEMENT_SEMESTERS = Array.from({ length: 4 }, (_, yearIndex) =>
  [1, 2].map((sem) => `Y${yearIndex + 1}S${sem}`)
).flat();

const parseRange = (marks = "") => {
  const [min = "0", max = "0"] = String(marks).split("-");
  return { min: Number(min), max: Number(max) };
};

const marksToScale = (marks, scale) => {
  const sorted = [...scale].sort((a, b) => parseRange(b.marks).max - parseRange(a.marks).max);
  const found = sorted.find((item) => {
    const range = parseRange(item.marks);
    return marks >= range.min && marks <= range.max;
  });
  return found || sorted[sorted.length - 1] || { grade: "E", gpa: 0.0, marks: "0-29" };
};

export default function GpaScreen({ overview, subjects, currentSemesterCode }) {
  const [gradingScale, setGradingScale] = useState(() => {
    const saved = window.localStorage.getItem("gradingScale");
    return saved ? JSON.parse(saved) : DEFAULT_GRADING_SCALE;
  });
  const [isEditingScale, setIsEditingScale] = useState(false);
  const semesterOptions = useMemo(
    () => ALL_SUBJECT_MANAGEMENT_SEMESTERS,
    []
  );
  const [selectedSemester, setSelectedSemester] = useState(
    ""
  );
  const [showCgpa, setShowCgpa] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const semesterSubjects = useMemo(
    () => subjects.filter((item) => item.semester === selectedSemester),
    [subjects, selectedSemester]
  );

  const rows = useMemo(
    () =>
      semesterSubjects.flatMap((subject) =>
        (subject.assessments || []).map((assessment) => {
          const marks = assessment.maxMarks
            ? Number(((assessment.scoredMarks / assessment.maxMarks) * 100).toFixed(0))
            : 0;
          const scale = marksToScale(marks, gradingScale);
          return {
            subject: subject.name,
            type: assessment.type === "exam" ? "Exam" : "Assignment",
            title: assessment.title,
            credits: subject.credits,
            grade: scale.grade,
            gpa: Number(scale.gpa).toFixed(1),
            marks
          };
        })
      ),
    [semesterSubjects, gradingScale]
  );

  const totalCredits = semesterSubjects.reduce((sum, item) => sum + (Number(item.credits) || 0), 0);
  const semesterGpaFromScale =
    rows.length > 0
      ? Number((rows.reduce((sum, row) => sum + Number(row.gpa), 0) / rows.length).toFixed(2))
      : 0;

  const updateScaleRow = (index, key, value) => {
    setGradingScale((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  const saveScale = () => {
    setIsEditingScale(false);
    window.localStorage.setItem("gradingScale", JSON.stringify(gradingScale));
  };

  const resetScale = () => {
    setGradingScale(DEFAULT_GRADING_SCALE);
    window.localStorage.setItem("gradingScale", JSON.stringify(DEFAULT_GRADING_SCALE));
  };

  const goToCurrentSemester = () => {
    if (currentSemesterCode) {
      setSelectedSemester(currentSemesterCode);
    }
  };

  const openPdfWindowAndPrint = (title, bodyHtml) => {
    const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
    if (!w) return;
    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #0d2a4a; }
    h1 { margin: 0 0 6px; }
    .meta { color: #365c82; margin-bottom: 16px; }
    .card { border: 1px solid #c9def6; border-radius: 12px; padding: 14px; margin: 12px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border-bottom: 1px solid #e6f0fc; padding: 8px; text-align: left; font-size: 13px; }
    th { background: #eef6ff; color: #204c78; }
    .right { text-align: right; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .big { font-size: 22px; font-weight: 700; color: #0a6ed1; }
    @media print { body { padding: 0; } .card { break-inside: avoid; } }
  </style>
</head>
<body>
  ${bodyHtml}
  <script>
    window.onload = () => { window.print(); };
  </script>
</body>
</html>`;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const buildSemesterReportHtml = () => {
    const semester = selectedSemester || "Not selected";
    const today = new Date().toLocaleString();
    const rowsHtml =
      rows.length > 0
        ? rows
            .map(
              (r) => `
        <tr>
          <td>${r.subject}</td>
          <td>${r.type}</td>
          <td>${r.title}</td>
          <td class="right">${r.credits}</td>
          <td>${r.grade}</td>
          <td class="right">${r.gpa}</td>
          <td class="right">${r.marks}</td>
        </tr>`
            )
            .join("")
        : `<tr><td colspan="7">No marks available for this semester.</td></tr>`;

    const gradingHtml = gradingScale
      .map((g) => `<tr><td>${g.grade}</td><td class="right">${g.gpa}</td><td class="right">${g.marks}</td></tr>`)
      .join("");

    return `
      <h1>Semester GPA Report</h1>
      <div class="meta">Generated: ${today}</div>
      <div class="card grid">
        <div><div>Semester</div><div class="big">${semester}</div></div>
        <div><div>Semester GPA</div><div class="big">${semesterGpaFromScale.toFixed(2)}</div></div>
      </div>
      <div class="card">
        <div><strong>Results</strong></div>
        <table>
          <thead>
            <tr>
              <th>Subject</th><th>Type</th><th>Title</th><th class="right">Credits</th><th>Your Grade</th><th class="right">GPA</th><th class="right">Marks</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
      <div class="card">
        <div><strong>Grading Scale Used</strong></div>
        <table>
          <thead><tr><th>Grade</th><th class="right">GPA</th><th class="right">Marks</th></tr></thead>
          <tbody>${gradingHtml}</tbody>
        </table>
      </div>
    `;
  };

  const buildCgpaReportHtml = () => {
    const today = new Date().toLocaleString();
    const gradingHtml = gradingScale
      .map((g) => `<tr><td>${g.grade}</td><td class="right">${g.gpa}</td><td class="right">${g.marks}</td></tr>`)
      .join("");
    return `
      <h1>CGPA Report</h1>
      <div class="meta">Generated: ${today}</div>
      <div class="card grid">
        <div><div>Total Subjects</div><div class="big">${subjects.length}</div></div>
        <div><div>Cumulative GPA (CGPA)</div><div class="big">${Number(overview?.overallGpa ?? 0).toFixed(2)}</div></div>
      </div>
      <div class="card">
        <div><strong>Overview</strong></div>
        <table>
          <thead><tr><th>Semester</th><th class="right">GPA</th></tr></thead>
          <tbody>
            ${(overview?.semesterGpa || [])
              .map((s) => `<tr><td>${s.semester}</td><td class="right">${Number(s.gpa).toFixed(2)}</td></tr>`)
              .join("")}
          </tbody>
        </table>
      </div>
      <div class="card">
        <div><strong>Grading Scale Used</strong></div>
        <table>
          <thead><tr><th>Grade</th><th class="right">GPA</th><th class="right">Marks</th></tr></thead>
          <tbody>${gradingHtml}</tbody>
        </table>
      </div>
    `;
  };

  return (
    <div className="tab-panel gpa-modern">
      <div className="gpa-main">
        <h3>GPA Calculator</h3>
        <p className="feature-subtitle">Calculate your semester and cumulative GPA.</p>

        <div className="gpa-sem-bar">
          <button type="button" className="gpa-chip active" onClick={goToCurrentSemester}>
            Current Semester{currentSemesterCode ? `: ${currentSemesterCode}` : ""}
          </button>
          <select
            className="gpa-sem-select"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            aria-label="Choose semester"
          >
            <option value="">Choose Semester</option>
            {semesterOptions.map((semester) => (
              <option key={semester} value={semester}>
                {semester}
              </option>
            ))}
          </select>
          <button type="button" className="gpa-chip">
            Sem GPA: {semesterGpaFromScale.toFixed(2)}
          </button>
        </div>

        <h4>Select Semester</h4>
        <div className="table-wrap sm-table">
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Type</th>
                <th>Title</th>
                <th>Credits</th>
                <th>Your Grade</th>
                <th>GPA</th>
                <th>Marks</th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((row, index) => (
                  <tr key={`${row.subject}-${row.title}-${index}`}>
                    <td>{row.subject}</td>
                    <td>{row.type}</td>
                    <td>{row.title}</td>
                    <td>{row.credits}</td>
                    <td>{row.grade}</td>
                    <td>{row.gpa}</td>
                    <td>{row.marks}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No marks available for selected semester.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="gpa-cgpa">
          <h4>Calculate CGPA</h4>
          <div className="gpa-cgpa-row">
            <div>
              <div className="gpa-meta-label">Total Credits</div>
              <div className="gpa-meta-value">{totalCredits}</div>
            </div>
            <div>
              <div className="gpa-meta-label">Cumulative GPA</div>
              <div className="gpa-meta-value">{Number(overview?.overallGpa ?? 0).toFixed(2)}</div>
            </div>
            <button type="button" className="gpa-calc-btn" onClick={() => setShowCgpa(true)}>
              Calculate CGPA
            </button>
          </div>
          {showCgpa && (
            <div className="gpa-cgpa-result">
              CGPA: <strong>{Number(overview?.overallGpa ?? 0).toFixed(2)}</strong>
            </div>
          )}
          <button type="button" className="gpa-pdf-btn" onClick={() => setIsPdfModalOpen(true)}>
            Generate PDF
          </button>
        </div>
      </div>

      <aside className="gpa-scale">
        <div className="gpa-scale-head">
          <h4>Grading Scale</h4>
          {!isEditingScale ? (
            <button type="button" className="gpa-scale-btn" onClick={() => setIsEditingScale(true)}>
              Edit
            </button>
          ) : (
            <div className="gpa-scale-actions">
              <button type="button" className="gpa-scale-btn" onClick={saveScale}>
                Save
              </button>
              <button type="button" className="gpa-scale-btn muted" onClick={resetScale}>
                Reset
              </button>
            </div>
          )}
        </div>
        <table>
          <thead>
            <tr>
              <th>Grade</th>
              <th>GPA</th>
              <th>Marks</th>
            </tr>
          </thead>
          <tbody>
            {gradingScale.map((item, index) => (
              <tr key={item.grade}>
                <td>{item.grade}</td>
                <td>
                  {isEditingScale ? (
                    <input
                      className="gpa-scale-input"
                      type="number"
                      step="0.1"
                      min="0"
                      max="4"
                      value={item.gpa}
                      onChange={(e) => updateScaleRow(index, "gpa", Number(e.target.value))}
                    />
                  ) : (
                    item.gpa
                  )}
                </td>
                <td>
                  {isEditingScale ? (
                    <input
                      className="gpa-scale-input"
                      type="text"
                      value={item.marks}
                      onChange={(e) => updateScaleRow(index, "marks", e.target.value)}
                    />
                  ) : (
                    item.marks
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </aside>

      {isPdfModalOpen && (
        <div className="sm-modal-overlay" onClick={() => setIsPdfModalOpen(false)}>
          <div className="sm-modal" onClick={(e) => e.stopPropagation()}>
            <h4>Generate PDF</h4>
            <p>Choose what report you want to export.</p>
            <div className="sm-modal-actions">
              <button type="button" className="sm-modal-cancel" onClick={() => setIsPdfModalOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="sm-modal-delete"
                disabled={!selectedSemester}
                onClick={() => {
                  setIsPdfModalOpen(false);
                  openPdfWindowAndPrint(
                    `Semester GPA Report - ${selectedSemester}`,
                    buildSemesterReportHtml()
                  );
                }}
              >
                Semester PDF
              </button>
              <button
                type="button"
                className="sm-modal-delete"
                onClick={() => {
                  setIsPdfModalOpen(false);
                  openPdfWindowAndPrint("CGPA Report", buildCgpaReportHtml());
                }}
              >
                CGPA PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
