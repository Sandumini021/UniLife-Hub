import React, { useMemo, useState } from "react";

const YEAR_OPTIONS = [1, 2, 3, 4];
const SEMESTER_OPTIONS = [1, 2];

const parseSemester = (value = "") => {
  const normalized = String(value).toUpperCase().replace(/\s+/g, "");
  const yearMatch = normalized.match(/Y(\d)/);
  const semMatch = normalized.match(/S(\d)/);
  return {
    year: yearMatch ? Number(yearMatch[1]) : null,
    semester: semMatch ? Number(semMatch[1]) : null
  };
};

export default function SubjectsScreen({
  subjects,
  onCreateSubject,
  onDeleteSubjects,
  currentSemesterCode: activeCurrentSemesterCode,
  onSetCurrentSemester
}) {
  const [form, setForm] = useState({ name: "", credits: "" });
  const [selectedYear, setSelectedYear] = useState(1);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedSemesterCode = `Y${selectedYear}S${selectedSemester}`;

  const filteredSubjects = useMemo(
    () =>
      subjects.filter((item) => {
        const parsed = parseSemester(item.semester);
        return parsed.year === selectedYear && parsed.semester === selectedSemester;
      }),
    [subjects, selectedSemester, selectedYear]
  );

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.credits) return;
    await onCreateSubject({
      name: form.name.trim(),
      credits: Number(form.credits),
      semester: selectedSemesterCode
    });
    setForm({ name: "", credits: "" });
  };

  const toggleSubject = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllVisible = () => {
    const ids = filteredSubjects.map((item) => item._id);
    const allSelected = ids.length > 0 && ids.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) => {
      if (allSelected) {
        return prev.filter((id) => !ids.includes(id));
      }
      return [...new Set([...prev, ...ids])];
    });
  };

  const removeSelected = async () => {
    if (!selectedIds.length) return;
    setIsDeleteModalOpen(true);
  };

  const selectedSubjects = subjects.filter((item) => selectedIds.includes(item._id));

  const confirmDelete = async () => {
    if (!selectedIds.length || isDeleting) return;
    setIsDeleting(true);
    try {
      await onDeleteSubjects(selectedIds);
      setSelectedIds([]);
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="tab-panel subjects-modern">
      <h3>Subjects Management</h3>
      <p className="feature-subtitle">Create and organize subjects for each semester.</p>

      <div className="sm-card">
        <h4>Select Year</h4>
        <div className="sm-year-grid">
          {YEAR_OPTIONS.map((year) => (
            <button
              key={year}
              type="button"
              className={selectedYear === year ? "sm-choice active" : "sm-choice"}
              onClick={() => setSelectedYear(year)}
            >
              Year {year}
            </button>
          ))}
        </div>
      </div>

      <div className="sm-card">
        <h4>Semesters</h4>
        <div className="sm-sem-grid">
          {SEMESTER_OPTIONS.map((semester) => (
            <button
              key={semester}
              type="button"
              className={selectedSemester === semester ? "sm-sem-item active" : "sm-sem-item"}
              onClick={() => setSelectedSemester(semester)}
            >
              <span className="sm-dot">{selectedSemester === semester ? "✓" : ""}</span>
              <span>Semester {semester}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sm-card sm-current-sem-card">
        <div className="sm-current-sem-head">
          <h4>Choose Current Semester</h4>
          <button
            type="button"
            className="sm-set-sem-btn"
            onClick={() => onSetCurrentSemester(selectedSemesterCode)}
          >
            Set {selectedSemesterCode} as Current
          </button>
        </div>
        <p className="sm-current-sem-text">
          Selected in Academic Progress Tracker:{" "}
          <strong>{activeCurrentSemesterCode || "Not selected yet"}</strong>
        </p>
      </div>

      <div className="sm-card">
        <div className="sm-subject-head">
          <h4>Subjects</h4>
          <div className="sm-subject-actions">
            <button type="button" className="sm-remove-btn" onClick={removeSelected} disabled={!selectedIds.length}>
              Remove Subject
            </button>
            <button type="submit" form="subjects-add-form" className="sm-add-btn">
              Add Subject
            </button>
          </div>
        </div>

        <form id="subjects-add-form" className="sm-input-row" onSubmit={submit}>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Subject Name"
            required
          />
          <input
            type="number"
            min="1"
            value={form.credits}
            onChange={(e) => setForm({ ...form, credits: e.target.value })}
            placeholder="Credits"
            required
          />
          <input value={selectedSemesterCode} readOnly aria-label="Current semester" />
        </form>

        <div className="table-wrap sm-table">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    aria-label="Select all subjects"
                    checked={
                      filteredSubjects.length > 0 &&
                      filteredSubjects.every((item) => selectedIds.includes(item._id))
                    }
                    onChange={toggleAllVisible}
                  />
                </th>
                <th>Subject</th>
                <th>Credits</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`Select ${item.name}`}
                        checked={selectedIds.includes(item._id)}
                        onChange={() => toggleSubject(item._id)}
                      />
                    </td>
                    <td>{item.name}</td>
                    <td>{item.credits}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td>-</td>
                  <td>No subjects added yet</td>
                  <td>-</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="sm-modal-overlay" onClick={closeDeleteModal}>
          <div className="sm-modal" onClick={(e) => e.stopPropagation()}>
            <h4>Confirm Delete</h4>
            <p>Are you sure you want to delete the selected subject(s)?</p>
            <div className="sm-modal-list">
              {selectedSubjects.length > 0 ? (
                selectedSubjects.map((item) => <div key={item._id}>{item.name}</div>)
              ) : (
                <div>- Selected subject(s)</div>
              )}
            </div>
            <div className="sm-modal-actions">
              <button type="button" className="sm-modal-cancel" onClick={closeDeleteModal}>
                Cancel
              </button>
              <button type="button" className="sm-modal-delete" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
