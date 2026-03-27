import React, { useState } from "react";

const TYPE_OPTIONS = [
  { label: "Assignment", apiType: "assignment" },
  { label: "Midterm Exam", apiType: "exam" },
  { label: "Final Exam", apiType: "exam" },
  { label: "Lab Test", apiType: "assignment" }
];

export default function MarksEntryScreen({
  subjects,
  onAddMark,
  onDeleteMark,
  onUpdateMark,
  currentSemesterCode,
}) {
  const semesterSubjects = currentSemesterCode
    ? subjects.filter((subject) => subject.semester === currentSemesterCode)
    : subjects;

  const [form, setForm] = useState({
    subjectId: "",
    title: "",
    typeLabel: TYPE_OPTIONS[0].label,
    maxMarks: "",
    scoredMarks: "",
    weight: ""
  });
  const [editingRow, setEditingRow] = useState(null);

  const currentType = TYPE_OPTIONS.find((item) => item.label === form.typeLabel) || TYPE_OPTIONS[0];

  const recordedRows = semesterSubjects.flatMap((subject) =>
    (subject.assessments || []).map((assessment) => ({
      subjectId: subject._id,
      markId: assessment._id,
      subjectName: subject.name,
      type: assessment.type === "exam" ? "Exam" : "Assignment",
      title: assessment.title,
      weight: assessment.weight,
      maxMarks: assessment.maxMarks,
      scoredMarks: assessment.scoredMarks,
      gainedWeightage:
        assessment.maxMarks > 0
          ? Number(((assessment.scoredMarks / assessment.maxMarks) * assessment.weight).toFixed(2))
          : 0
    }))
  );
  const totalGainedWeightage = Number(
    recordedRows.reduce((sum, row) => sum + row.gainedWeightage, 0).toFixed(2)
  );

  const submit = async (e) => {
    e.preventDefault();
    if (!form.subjectId) return;
    await onAddMark(form.subjectId, {
      title: form.title.trim() || form.typeLabel,
      type: currentType.apiType,
      maxMarks: Number(form.maxMarks),
      scoredMarks: Number(form.scoredMarks),
      weight: Number(form.weight)
    });
    setForm({ ...form, title: "", maxMarks: "", scoredMarks: "", weight: "" });
  };

  const startEdit = (row) => {
    setEditingRow({
      subjectId: row.subjectId,
      markId: row.markId,
      title: row.title,
      typeLabel: row.type === "Exam" ? "Midterm Exam" : "Assignment",
      maxMarks: String(row.maxMarks),
      scoredMarks: String(row.scoredMarks),
      weight: String(row.weight)
    });
  };

  const saveEdit = async () => {
    if (!editingRow) return;
    const typeObj = TYPE_OPTIONS.find((item) => item.label === editingRow.typeLabel) || TYPE_OPTIONS[0];
    await onUpdateMark(editingRow.subjectId, editingRow.markId, {
      title: editingRow.title.trim() || editingRow.typeLabel,
      type: typeObj.apiType,
      maxMarks: Number(editingRow.maxMarks),
      scoredMarks: Number(editingRow.scoredMarks),
      weight: Number(editingRow.weight)
    });
    setEditingRow(null);
  };

  return (
    <div className="tab-panel marks-modern">
      <h3>Marks Entry</h3>
      <p className="feature-subtitle">Add assignment and exam marks with weights.</p>

      <form className="marks-grid" onSubmit={submit}>
        <select
          value={form.subjectId}
          onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
          required
        >
          <option value="">Select Subject</option>
          {semesterSubjects.map((subject) => (
            <option key={subject._id} value={subject._id}>
              {subject.name}
            </option>
          ))}
        </select>

        <select
          value={form.typeLabel}
          onChange={(e) => setForm({ ...form, typeLabel: e.target.value })}
        >
          {TYPE_OPTIONS.map((item) => (
            <option key={item.label} value={item.label}>
              {item.label}
            </option>
          ))}
        </select>

        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Enter assignment title"
          required
        />

        <input
          type="number"
          min="1"
          value={form.maxMarks}
          onChange={(e) => setForm({ ...form, maxMarks: e.target.value })}
          placeholder="Max Marks"
          required
        />
        <input
          type="number"
          min="0"
          max="100"
          value={form.weight}
          onChange={(e) => setForm({ ...form, weight: e.target.value })}
          placeholder="Weight (%)"
          required
        />
        <input
          type="number"
          min="0"
          value={form.scoredMarks}
          onChange={(e) => setForm({ ...form, scoredMarks: e.target.value })}
          placeholder="Your Marks"
          required
        />
        <button type="submit" className="marks-add-btn">Add Marks</button>
      </form>

      <div className="marks-recorded-title">Recorded Marks</div>
      <div className="table-wrap sm-table">
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Type</th>
              <th>Title</th>
              <th>Weight</th>
              <th>Max Marks</th>
              <th>Your Marks</th>
              <th>Gained (Weightage)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {recordedRows.length > 0 ? (
              recordedRows.map((row) => (
                <tr key={`${row.subjectId}-${row.markId}`}>
                  <td>{row.subjectName}</td>
                  <td>{row.type}</td>
                  <td>{row.title}</td>
                  <td>{row.weight}%</td>
                  <td>{row.maxMarks}</td>
                  <td>{row.scoredMarks}</td>
                  <td>{row.gainedWeightage}</td>
                  <td>
                    <button
                      type="button"
                      className="marks-edit-btn"
                      onClick={() => startEdit(row)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="marks-delete-btn"
                      onClick={() => onDeleteMark(row.subjectId, row.markId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">No marks recorded for the current semester subjects.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="marks-gained-summary">Total gained weightage: {totalGainedWeightage}%</div>

      {editingRow && (
        <div className="sm-modal-overlay" onClick={() => setEditingRow(null)}>
          <div className="sm-modal" onClick={(e) => e.stopPropagation()}>
            <h4>Edit Mark</h4>
            <div className="marks-edit-grid">
              <input
                value={editingRow.title}
                onChange={(e) => setEditingRow({ ...editingRow, title: e.target.value })}
                placeholder="Title"
              />
              <select
                value={editingRow.typeLabel}
                onChange={(e) => setEditingRow({ ...editingRow, typeLabel: e.target.value })}
              >
                {TYPE_OPTIONS.map((item) => (
                  <option key={item.label} value={item.label}>
                    {item.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={editingRow.maxMarks}
                onChange={(e) => setEditingRow({ ...editingRow, maxMarks: e.target.value })}
                placeholder="Max Marks"
              />
              <input
                type="number"
                min="0"
                value={editingRow.scoredMarks}
                onChange={(e) => setEditingRow({ ...editingRow, scoredMarks: e.target.value })}
                placeholder="Your Marks"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={editingRow.weight}
                onChange={(e) => setEditingRow({ ...editingRow, weight: e.target.value })}
                placeholder="Weight (%)"
              />
            </div>
            <div className="sm-modal-actions">
              <button type="button" className="sm-modal-cancel" onClick={() => setEditingRow(null)}>
                Cancel
              </button>
              <button type="button" className="sm-modal-delete" onClick={saveEdit}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
