import React, { useEffect, useRef, useState } from "react";
import api from "../api";
import SubjectsScreen from "./academic/SubjectsScreen";
import MarksEntryScreen from "./academic/MarksEntryScreen";
import GpaScreen from "./academic/GpaScreen";
import PredictorScreen from "./academic/PredictorScreen";
import AnalyticsScreen from "./academic/AnalyticsScreen";
import StudyTipsScreen from "./academic/StudyTipsScreen";
import slideGpa from "../assets/slide-gpa.png";
import slidePredict from "../assets/slide-predict.png";
import slideAnalytics from "../assets/slide-analytics.png";
import slideStudy from "../assets/slide-study.png";
import slideInsights from "../assets/slide-insights.png";
import slideGraduation from "../assets/slide-graduation.png";

const FEATURE_CARDS = [
  {
    key: "Grade Predictor",
    title: "Predict GPA",
    desc: "Estimate your future GPA based on potential grades.",
    icon: "orb",
    thumb: slidePredict
  },
  {
    key: "Analytics",
    title: "Visualize Progress",
    desc: "Track your GPA trends with interactive charts.",
    icon: "chart",
    thumb: slideAnalytics
  },
  {
    key: "Study Tips",
    title: "Study Resources",
    desc: "Improve your learning with helpful materials.",
    icon: "cap",
    thumb: slideStudy
  }
];

const QUICK_ACTIONS = [
  {
    key: "Subjects",
    title: "Manage Subjects",
    desc: "Add subjects, credits, and semesters.",
    icon: "books",
    thumb: slideInsights
  },
  {
    key: "Marks Entry",
    title: "Enter Marks",
    desc: "Record assignments and exam marks.",
    icon: "check",
    thumb: slideGpa
  },
  {
    key: "GPA",
    title: "GPA Dashboard",
    desc: "View semester and overall GPA breakdown.",
    icon: "pie",
    thumb: slideGraduation
  }
];

function FeatureIcon({ kind }) {
  if (kind === "chart") {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
        <path
          d="M4 19V5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M4 19H20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M7.5 16.5V12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 16.5V9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16.5 16.5V6.8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (kind === "cap") {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
        <path
          d="M12 3 2.5 7.6 12 12.2 21.5 7.6 12 3Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M6.7 10.4v4.7c0 2 2.4 3.6 5.3 3.6s5.3-1.6 5.3-3.6v-4.7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (kind === "books") {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
        <path
          d="M6 4h9a2 2 0 0 1 2 2v14H8a2 2 0 0 0-2 2V6a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M8 20h11"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M8 8h6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (kind === "check") {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
        <path
          d="M20 6 9 17l-5-5"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (kind === "pie") {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
        <path
          d="M11.5 3.2A9 9 0 1 0 20.8 12H12a.5.5 0 0 1-.5-.5V3.2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M13.5 3.2A9 9 0 0 1 20.8 10.5H13.5V3.2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // orb
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
      <path
        d="M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M9 10.2c1-.9 2.5-1.4 4-1.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AcademicProgressPage() {
  const [subjects, setSubjects] = useState([]);
  const [overview, setOverview] = useState(null);
  const [activeTab, setActiveTab] = useState("");
  const [currentSemesterCode, setCurrentSemesterCode] = useState(
    () => window.localStorage.getItem("currentSemesterCode") || ""
  );
  const [slideIndex, setSlideIndex] = useState(0);
  const hoverTimerRef = useRef(null);

  const fetchAll = async () => {
    const [subjectRes, overviewRes] = await Promise.all([
      api.get("/subjects"),
      api.get("/subjects/gpa/overview")
    ]);
    setSubjects(subjectRes.data);
    setOverview(overviewRes.data);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const onCreateSubject = async (payload) => {
    await api.post("/subjects", payload);
    await fetchAll();
  };

  const onAddMark = async (subjectId, payload) => {
    await api.post(`/subjects/${subjectId}/marks`, payload);
    await fetchAll();
  };

  const onDeleteMark = async (subjectId, markId) => {
    await api.delete(`/subjects/${subjectId}/marks/${markId}`);
    await fetchAll();
  };

  const onUpdateMark = async (subjectId, markId, payload) => {
    await api.put(`/subjects/${subjectId}/marks/${markId}`, payload);
    await fetchAll();
  };

  const onDeleteSubjects = async (ids) => {
    await Promise.all(ids.map((id) => api.delete(`/subjects/${id}`)));
    await fetchAll();
  };

  const onSetCurrentSemester = (semesterCode) => {
    setCurrentSemesterCode(semesterCode);
    window.localStorage.setItem("currentSemesterCode", semesterCode);
  };

  const dashboardSubjects = currentSemesterCode
    ? subjects.filter((item) => item.semester === currentSemesterCode)
    : subjects;

  const slides = [
    {
      title: "Track Your GPA Easily",
      desc: "Monitor your academic performance in real-time.",
      img: slideGpa,
      onClick: () => setActiveTab("GPA")
    },
    {
      title: "Predict Your Grades",
      desc: "Estimate required marks to achieve your target GPA.",
      img: slidePredict,
      onClick: () => setActiveTab("Grade Predictor")
    },
    {
      title: "Visualize Your Progress",
      desc: "See trends with charts and analytics.",
      img: slideAnalytics,
      onClick: () => setActiveTab("Analytics")
    },
    {
      title: "Study Smarter",
      desc: "Use resources and tips to improve your results.",
      img: slideStudy,
      onClick: () => setActiveTab("Study Tips")
    },
    {
      title: "Insights & Planning",
      desc: "Review patterns and plan your next semester.",
      img: slideInsights,
      onClick: () => setActiveTab("Analytics")
    },
    {
      title: "Celebrate Milestones",
      desc: "Stay motivated and track how far you’ve come.",
      img: slideGraduation,
      onClick: () => setActiveTab("Analytics")
    }
  ];

  const visibleSlides = slides.length <= 3
    ? slides.map((s, realIdx) => ({ s, realIdx }))
    : [-1, 0, 1].map((delta) => {
        const realIdx = (slideIndex + delta + slides.length) % slides.length;
        return { s: slides[realIdx], realIdx };
      });

  return (
    <section className="feature-shell academic-dashboard">
      {!activeTab && <div className="ap-page-title">Academic Progress Tracking</div>}

      {!activeTab && (
        <>
          <div className="ap-panel">
            <div className="ap-panel-body">
              <div className="ap-slides">
                <div className="ap-slide-row" role="region" aria-label="Highlights">
                  {visibleSlides.map(({ s, realIdx }) => (
                    <div
                      key={s.title}
                      className={realIdx === slideIndex ? "ap-slide-card active" : "ap-slide-card"}
                      style={{ backgroundImage: `url(${s.img})` }}
                      onMouseEnter={() => {
                        if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
                        hoverTimerRef.current = window.setTimeout(() => {
                          setSlideIndex(realIdx);
                        }, 450);
                      }}
                      onMouseLeave={() => {
                        if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
                      }}
                      onClick={s.onClick}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          s.onClick();
                        }
                      }}
                    >
                      <div className="ap-slide-overlay">
                        <div className="ap-slide-title">{s.title}</div>
                        <div className="ap-slide-desc">{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="ap-slide-dots" aria-label="Slide indicators">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={idx === slideIndex ? "ap-dot active" : "ap-dot"}
                      onClick={() => setSlideIndex(idx)}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className="ap-section-title">
                Your Courses & Grades{" "}
                {currentSemesterCode ? `(Current Semester: ${currentSemesterCode})` : ""}
              </div>

              <div className="table-wrap compact">
                <table className="ap-table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardSubjects.map((item) => (
                      <tr key={item._id}>
                        <td>{item.name}</td>
                        <td>{item.credits}</td>
                      </tr>
                    ))}
                    <tr className="total-row">
                      <td>Total</td>
                      <td>{dashboardSubjects.reduce((sum, s) => sum + (Number(s.credits) || 0), 0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="feature-cards ap-feature-grid">
                {QUICK_ACTIONS.map((card) => (
                  <button
                    key={card.key}
                    type="button"
                    className="ap-feature-card"
                    onClick={() => setActiveTab(card.key)}
                  >
                    <div className={`ap-feature-icon small kind-${card.icon}`} aria-hidden="true">
                      <FeatureIcon kind={card.icon} />
                    </div>
                    <div className="ap-feature-body">
                      <h4>{card.title}</h4>
                      <p>{card.desc}</p>
                    </div>
                    {card.thumb && (
                      <div className="ap-feature-thumb" aria-hidden="true">
                        <img src={card.thumb} alt="" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="feature-cards ap-feature-grid secondary">
                {FEATURE_CARDS.map((card) => (
                  <button
                    key={card.key}
                    type="button"
                    className="ap-feature-card"
                    onClick={() => setActiveTab(card.key)}
                  >
                    <div className={`ap-feature-icon kind-${card.icon}`} aria-hidden="true">
                      <FeatureIcon kind={card.icon} />
                    </div>
                    <div className="ap-feature-body">
                      <h4>{card.title}</h4>
                      <p>{card.desc}</p>
                    </div>
                    {card.thumb && (
                      <div className="ap-feature-thumb" aria-hidden="true">
                        <img src={card.thumb} alt="" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </>
      )}

      {activeTab === "Subjects" && (
        <SubjectsScreen
          subjects={subjects}
          onCreateSubject={onCreateSubject}
          onDeleteSubjects={onDeleteSubjects}
          currentSemesterCode={currentSemesterCode}
          onSetCurrentSemester={onSetCurrentSemester}
        />
      )}
      {activeTab === "Marks Entry" && (
        <MarksEntryScreen
          subjects={subjects}
          onAddMark={onAddMark}
          onDeleteMark={onDeleteMark}
          onUpdateMark={onUpdateMark}
          currentSemesterCode={currentSemesterCode}
        />
      )}
      {activeTab === "GPA" && (
        <GpaScreen
          overview={overview}
          subjects={subjects}
          currentSemesterCode={currentSemesterCode}
        />
      )}
      {activeTab === "Grade Predictor" && <PredictorScreen subjects={subjects} />}
      {activeTab === "Analytics" && (
        <AnalyticsScreen subjects={subjects} currentSemesterCode={currentSemesterCode} />
      )}
      {activeTab === "Study Tips" && <StudyTipsScreen />}

      {activeTab && (
        <div className="back-row">
          <button type="button" className="back-btn" onClick={() => setActiveTab("")}>
            Back
          </button>
        </div>
      )}
    </section>
  );
}
