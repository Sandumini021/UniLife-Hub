import React, { useMemo, useState } from "react";

const getYearFromSemester = (semester = "") => {
  const match = String(semester).toUpperCase().match(/Y(\d)/);
  return match ? Number(match[1]) : null;
};

export default function AnalyticsScreen({ subjects, currentSemesterCode }) {
  const allSemesters = useMemo(
    () =>
      Array.from({ length: 4 }, (_, y) => [1, 2].map((s) => `Y${y + 1}S${s}`)).flat(),
    []
  );
  const [subjectSemester, setSubjectSemester] = useState("ALL");
  const [selectedSemesters, setSelectedSemesters] = useState(allSemesters);
  const [selectedYearFilter, setSelectedYearFilter] = useState("ALL");
  const [donutMode, setDonutMode] = useState("year"); // year | semester | gpa

  const subjectTop = useMemo(() => {
    const semesterFiltered =
      subjectSemester === "ALL"
        ? subjects
        : subjects.filter((item) => String(item.semester).toUpperCase() === subjectSemester);
    return [...semesterFiltered]
      .sort((a, b) => Number(b.currentScore || 0) - Number(a.currentScore || 0))
      .slice(0, 6);
  }, [subjects, subjectSemester]);

  const semesterPerformance = useMemo(() => {
    const map = {};
    subjects.forEach((item) => {
      if (!selectedSemesters.includes(item.semester)) return;
      if (!map[item.semester]) {
        map[item.semester] = { total: 0, count: 0 };
      }
      map[item.semester].total += Number(item.currentScore || 0);
      map[item.semester].count += 1;
    });

    return Object.entries(map)
      .map(([semester, value]) => ({
        key: semester,
        label: semester,
        score: Number((value.total / value.count).toFixed(1))
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [subjects, selectedSemesters]);

  const yearPerformance = useMemo(() => {
    const map = { 1: { total: 0, count: 0 }, 2: { total: 0, count: 0 }, 3: { total: 0, count: 0 }, 4: { total: 0, count: 0 } };
    subjects.forEach((item) => {
      const year = getYearFromSemester(item.semester);
      if (!year) return;
      map[year].total += Number(item.currentScore || 0);
      map[year].count += 1;
    });

    return Object.entries(map)
      .map(([year, value]) => ({
        key: year,
        label: `Year ${year}`,
        score: value.count ? Number((value.total / value.count).toFixed(1)) : 0
      }))
      .sort((a, b) => Number(a.key) - Number(b.key));
  }, [subjects]);

  const currentYearLimit = useMemo(() => {
    const y = getYearFromSemester(currentSemesterCode);
    return y || 4;
  }, [currentSemesterCode]);

  const gpaProgressYears = useMemo(
    () => yearPerformance.filter((item) => Number(item.key) <= currentYearLimit),
    [currentYearLimit, yearPerformance]
  );

  const overallGpa = useMemo(() => {
    const gradePoints = { A: 4, B: 3, C: 2, D: 1, F: 0 };
    const totalCredits = subjects.reduce((sum, item) => sum + (Number(item.credits) || 0), 0);
    if (!totalCredits) return 0;
    const points = subjects.reduce(
      (sum, item) =>
        sum + (gradePoints[item.calculatedGrade] ?? 0) * (Number(item.credits) || 0),
      0
    );
    return Number((points / totalCredits).toFixed(2));
  }, [subjects]);

  const yearDonut = useMemo(() => {
    const total = yearPerformance.reduce((sum, item) => sum + item.score, 0);
    if (total <= 0) return "conic-gradient(#4a8bff 0deg, #4a8bff 360deg)";
    const colors = ["#38b8ff", "#4a8bff", "#72dcff", "#1f77d8"];
    let start = 0;
    const stops = yearPerformance.map((item, index) => {
      const slice = (item.score / total) * 360;
      const end = start + slice;
      const color = colors[index % colors.length];
      const stop = `${color} ${start.toFixed(1)}deg ${end.toFixed(1)}deg`;
      start = end;
      return stop;
    });
    return `conic-gradient(${stops.join(", ")})`;
  }, [yearPerformance]);

  const semesterDonut = useMemo(() => {
    const total = semesterPerformance.reduce((sum, item) => sum + item.score, 0);
    if (total <= 0) return "conic-gradient(#4a8bff 0deg, #4a8bff 360deg)";
    const colors = ["#38b8ff", "#4a8bff", "#72dcff", "#1f77d8"];
    let start = 0;
    const stops = semesterPerformance.map((item, index) => {
      const slice = (item.score / total) * 360;
      const end = start + slice;
      const color = colors[index % colors.length];
      const stop = `${color} ${start.toFixed(1)}deg ${end.toFixed(1)}deg`;
      start = end;
      return stop;
    });
    return `conic-gradient(${stops.join(", ")})`;
  }, [semesterPerformance]);

  const donutData = useMemo(() => {
    if (donutMode === "semester") {
      const total = semesterPerformance.reduce((sum, item) => sum + item.score, 0);
      return {
        title: "Semester Visualization",
        gradient: semesterDonut,
        centerLabel: "Semester Avg",
        centerValue:
          semesterPerformance.length > 0
            ? (
                semesterPerformance.reduce((sum, item) => sum + item.score, 0) /
                semesterPerformance.length
              ).toFixed(1)
            : "0.0",
        sideValues: semesterPerformance.map((item) =>
          total > 0 ? `${Math.round((item.score / total) * 100)}%` : "0%"
        )
      };
    }

    if (donutMode === "gpa") {
      return {
        title: "GPA Visualization",
        gradient: "conic-gradient(#38b8ff 0deg, #38b8ff 360deg)",
        centerLabel: "Overall GPA",
        centerValue: overallGpa.toFixed(2),
        sideValues: ["", "", "", ""]
      };
    }

    const total = yearPerformance.reduce((sum, item) => sum + item.score, 0);
    return {
      title: "Year Progression",
      gradient: yearDonut,
      centerLabel: "Overall Avg",
      centerValue:
        yearPerformance.length > 0
          ? (
              yearPerformance.reduce((sum, item) => sum + item.score, 0) /
              yearPerformance.length
            ).toFixed(1)
          : "0.0",
      sideValues: yearPerformance.map((item) =>
        total > 0 ? `${Math.round((item.score / total) * 100)}%` : "0%"
      )
    };
  }, [donutMode, overallGpa, semesterDonut, semesterPerformance, yearDonut, yearPerformance]);

  const semesterLinePoints = useMemo(() => {
    if (semesterPerformance.length === 0) return "";
    const width = 100;
    const height = 40;
    const max = Math.max(100, ...semesterPerformance.map((item) => item.score));
    return semesterPerformance
      .map((item, index) => {
        const x = semesterPerformance.length === 1 ? width / 2 : (index / (semesterPerformance.length - 1)) * width;
        const y = height - (item.score / max) * height;
        return `${x},${y}`;
      })
      .join(" ");
  }, [semesterPerformance]);

  const yearLinePoints = useMemo(() => {
    if (gpaProgressYears.length === 0) return "";
    const width = 100;
    const height = 38;
    const max = Math.max(100, ...gpaProgressYears.map((item) => item.score));
    return gpaProgressYears
      .map((item, index) => {
        const x =
          gpaProgressYears.length === 1 ? width / 2 : (index / (gpaProgressYears.length - 1)) * width;
        const y = height - (item.score / max) * height;
        return `${x},${y}`;
      })
      .join(" ");
  }, [gpaProgressYears]);

  const toggleSemesterSelection = (semester) => {
    setSelectedSemesters((prev) => {
      if (prev.includes(semester)) {
        const next = prev.filter((s) => s !== semester);
        return next.length ? next : prev;
      }
      return [...prev, semester].sort();
    });
  };

  const filteredYearPerformance = useMemo(() => {
    if (selectedYearFilter === "ALL") return yearPerformance;
    return yearPerformance.filter((item) => item.key === String(selectedYearFilter));
  }, [selectedYearFilter, yearPerformance]);

  const selectedYearSubjects = useMemo(() => {
    if (selectedYearFilter === "ALL") return subjects;
    return subjects.filter((item) => getYearFromSemester(item.semester) === Number(selectedYearFilter));
  }, [selectedYearFilter, subjects]);

  const distributionRows = filteredYearPerformance;

  return (
    <div className="tab-panel pa-shell">
      <div className="pa-head">
        <div>
          <h3>Performance Analytics</h3>
          <p className="feature-subtitle">
            Track and analyze your academic progress across subjects, semesters and years.
          </p>
        </div>
      </div>

      <div className="pa-grid-top">
        <div className="pa-card">
          <div className="pa-card-head">
            <h4>Progress by Subject</h4>
            <select
              className="pa-inline-select"
              value={subjectSemester}
              onChange={(e) => setSubjectSemester(e.target.value)}
            >
              <option value="ALL">All Semesters</option>
              {allSemesters.map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </div>

          <div className="pa-subject-list">
            {subjectTop.map((item) => (
              <div key={item._id} className="pa-subject-row">
                <span>{item.name}</span>
                <div className="pa-track">
                  <div className="pa-fill" style={{ width: `${Math.min(item.currentScore, 100)}%` }} />
                </div>
                <strong>{Number(item.currentScore || 0).toFixed(1)}%</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="pa-card">
          <div className="pa-card-head">
            <h4>Semester Performance</h4>
            <details className="pa-multi">
              <summary>Choose Semesters ({selectedSemesters.length})</summary>
              <div className="pa-multi-list">
                {allSemesters.map((sem) => (
                  <label key={sem} className="pa-multi-item">
                    <input
                      type="checkbox"
                      checked={selectedSemesters.includes(sem)}
                      onChange={() => toggleSemesterSelection(sem)}
                    />
                    <span>{sem}</span>
                  </label>
                ))}
              </div>
            </details>
          </div>
          <svg viewBox="0 0 100 45" className="pa-trend-svg" preserveAspectRatio="none">
            <polyline points={semesterLinePoints} className="pa-trend-line" />
            {semesterPerformance.map((item, index) => {
              const max = Math.max(100, ...semesterPerformance.map((sp) => sp.score));
              const x = semesterPerformance.length === 1 ? 50 : (index / (semesterPerformance.length - 1)) * 100;
              const y = 40 - (item.score / max) * 40;
              return <circle key={item.key} cx={x} cy={y} r="2" className="pa-trend-dot" />;
            })}
          </svg>
          <div className="pa-axis-labels">
            {semesterPerformance.map((item) => (
              <span key={item.key}>{item.label}</span>
            ))}
          </div>
        </div>

        <div className="pa-card">
          <div className="pa-card-head">
            <h4>{donutData.title}</h4>
            <select
              className="pa-inline-select"
              value={donutMode}
              onChange={(e) => setDonutMode(e.target.value)}
              aria-label="Choose donut visualization"
            >
              <option value="semester">Semester</option>
              <option value="gpa">GPA</option>
              <option value="year">Year Progression</option>
            </select>
          </div>
          <div className="pa-donut-center-wrap">
            <div className="pa-donut" style={{ backgroundImage: donutData.gradient }}>
              <div className="pa-donut-center">
                <span>{donutData.centerLabel}</span>
                <strong>{donutData.centerValue}</strong>
              </div>
            </div>
            <div className="pa-donut-side">
              {donutData.sideValues.slice(0, 4).map((v, idx) => (
                <div key={idx}>{v}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pa-grid-bottom">
        <div className="pa-card">
          <div className="pa-card-head">
            <h4>Year Distribution</h4>
            <div className="pa-card-head-controls">
              <select
                className="pa-inline-select"
                value={selectedYearFilter}
                onChange={(e) => setSelectedYearFilter(e.target.value)}
              >
                <option value="ALL">All Years</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </div>
          </div>
          {distributionRows.map((item) => (
            <div className="pa-year-row" key={item.key}>
              <span>{item.label}</span>
              <div className="pa-track">
                <div className="pa-fill" style={{ width: `${Math.min(item.score, 100)}%` }} />
              </div>
              <strong>{Math.round(item.score)}%</strong>
            </div>
          ))}
          <div className="pa-scale-row">
            <span>0</span>
            <span>2.5</span>
            <span>4.0</span>
          </div>
        </div>

        <div className="pa-card">
          <h4>GPA Progression</h4>
          <div className="pa-progress-lines">
            {gpaProgressYears.map((item, index) => (
              <div className="pa-progress-line" key={item.key}>
                <span className={`pa-dot d${index % 4}`} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <svg viewBox="0 0 100 40" className="pa-mini-line" preserveAspectRatio="none">
            <polyline points={yearLinePoints} className="pa-prog-line" />
            {gpaProgressYears.map((item, index) => {
              const max = Math.max(100, ...gpaProgressYears.map((sp) => sp.score));
              const x = gpaProgressYears.length === 1 ? 50 : (index / (gpaProgressYears.length - 1)) * 100;
              const y = 38 - (item.score / max) * 38;
              return <circle key={item.key} cx={x} cy={y} r="2" className="pa-trend-dot" />;
            })}
          </svg>
          <div className="pa-scale-row">
            <span>0</span>
            <span>2.5</span>
            <span>4.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
