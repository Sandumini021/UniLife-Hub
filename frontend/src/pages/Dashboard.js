import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Dashboard.module.css';

const Dashboard = () => {
    const [categories, setCategories] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [countdowns, setCountdowns] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [error, setError] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const navigate = useNavigate();

    const fetchAllData = async () => {
        try {
            const catRes = await axios.get('http://localhost:5000/api/categories');
            const taskRes = await axios.get('http://localhost:5000/api/tasks');
            const countRes = await axios.get('http://localhost:5000/api/countdowns');
            
            setCategories(catRes.data);
            setTasks(taskRes.data);
            setCountdowns(countRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleCategoryClick = (categoryId) => {
        navigate(`/category/${categoryId}`);
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            setError('Category name is required.');
            return;
        }
        try {
            const response = await axios.post('http://localhost:5000/api/categories', {
                name: newCategoryName.trim()
            });
            setCategories([...categories, response.data]);
            setNewCategoryName('');
            setError('');
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error adding category:", error);
            setError('Failed to add category. Please try again.');
        }
    };

    // --- Progress Calculation Logic ---
    const calculateCategoryStats = (categoryId) => {
        const catTasks = tasks.filter(t => t.category === categoryId);
        const total = catTasks.length;
        const todo = catTasks.filter(t => t.status === 'To Do').length;
        const inProgress = catTasks.filter(t => t.status === 'In Progress').length;
        const completed = catTasks.filter(t => t.status === 'Completed').length;
        const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
        
        return { todo, inProgress, completed, progress };
    };

    const totalTasksCount = tasks.length;
    const overallCompletedCount = tasks.filter(t => t.status === 'Completed').length;
    const overallProgress = totalTasksCount === 0 ? 0 : Math.round((overallCompletedCount / totalTasksCount) * 100);

    const activeCountdowns = countdowns
        .filter(c => !c.isCompleted)
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    const getDaysLeft = (dateString) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const targetDate = new Date(dateString);
        targetDate.setHours(0, 0, 0, 0);
        const diffTime = targetDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // --- Enhanced Dummy Data Generation ---
    const handleGenerateDummyData = async () => {
        // Updated short confirmation message
        if (!window.confirm("This will populate dummy data. Proceed?")) return;
        setIsGenerating(true);
        
        try {
            // Distinct Categories with uniquely distributed tasks
            const dummyDataStructure = [
                {
                    name: "ITPM Assignment",
                    tasks: [
                        { content: "Requirement Gathering", status: "Completed" },
                        { content: "UI/UX Figma Design", status: "Completed" },
                        { content: "Backend Setup", status: "In Progress" },
                        { content: "Frontend Integration", status: "In Progress" },
                        { content: "Database Modeling", status: "In Progress" },
                        { content: "Unit Testing", status: "To Do" },
                        { content: "Deployment", status: "To Do" }
                    ]
                },
                {
                    name: "PAF Final Project",
                    tasks: [
                        { content: "Learn Spring Boot", status: "Completed" },
                        { content: "Create REST APIs", status: "Completed" },
                        { content: "Connect MongoDB", status: "Completed" },
                        { content: "Auth Middleware", status: "Completed" },
                        { content: "Write Documentation", status: "To Do" },
                        { content: "Prepare Slides", status: "To Do" }
                    ]
                },
                {
                    name: "CN Repeat Notes",
                    tasks: [
                        { content: "Chapter 1 Summary", status: "Completed" },
                        { content: "Subnetting Practice", status: "In Progress" },
                        { content: "2023 Past Paper", status: "To Do" },
                        { content: "2022 Past Paper", status: "To Do" },
                        { content: "Watch Lecture Recordings", status: "To Do" }
                    ]
                },
                {
                    name: "Mobile App Dev",
                    tasks: [
                        { content: "Setup React Native CLI", status: "Completed" },
                        { content: "Navigation Container", status: "In Progress" },
                        { content: "Login Screen UI", status: "To Do" },
                        { content: "Home Screen UI", status: "To Do" }
                    ]
                },
                {
                    name: "Software Architecture",
                    tasks: [
                        { content: "Microservices Pattern Notes", status: "Completed" },
                        { content: "System Design Diagram", status: "Completed" },
                        { content: "Read MVC Case Study", status: "Completed" }
                    ]
                },
                {
                    name: "Data Science Base",
                    tasks: [
                        { content: "Python Basics", status: "Completed" },
                        { content: "Pandas & Numpy", status: "In Progress" },
                        { content: "Data Cleaning Lab", status: "In Progress" },
                        { content: "Linear Regression", status: "To Do" },
                        { content: "Matplotlib Charts", status: "To Do" },
                        { content: "Final Kaggle Submission", status: "To Do" },
                        { content: "Review Quiz 1", status: "To Do" }
                    ]
                }
            ];

            const taskPromises = [];

            // Loop through the structure to create categories and their specific tasks
            for (const catData of dummyDataStructure) {
                const res = await axios.post('http://localhost:5000/api/categories', { name: catData.name });
                const catId = res.data._id;

                for (const task of catData.tasks) {
                    taskPromises.push(
                        axios.post('http://localhost:5000/api/tasks', { ...task, category: catId })
                    );
                }
            }
            
            // Fire all task creations simultaneously
            await Promise.all(taskPromises);

            // Add some Countdowns
            const today = new Date();
            const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
            const threeDays = new Date(today); threeDays.setDate(threeDays.getDate() + 3);
            const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);
            const nextMonth = new Date(today); nextMonth.setDate(nextMonth.getDate() + 20);

            await axios.post('http://localhost:5000/api/countdowns', { description: "ITPM Progress Presentation", deadline: tomorrow.toISOString().split('T')[0] });
            await axios.post('http://localhost:5000/api/countdowns', { description: "PAF Final Submission", deadline: threeDays.toISOString().split('T')[0] });
            await axios.post('http://localhost:5000/api/countdowns', { description: "MAD Mini Project Review", deadline: nextWeek.toISOString().split('T')[0] });
            await axios.post('http://localhost:5000/api/countdowns', { description: "End Semester Exams Start", deadline: nextMonth.toISOString().split('T')[0] });

            // Refresh UI
            await fetchAllData();
        } catch (error) {
            console.error("Error generating dummy data:", error);
            alert("Failed to generate dummy data. Ensure your backend is running.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>Ready to conquer your tasks? 🚀</h1>

            <div className={styles.alertsSection}>
                <div className={styles.alertsHeader}>
                    <span>📊 Dashboard Overview</span>
                </div>
                <div className={styles.progressLabel}>
                    <span>Overall Project Progress ({overallCompletedCount} of {totalTasksCount} Tasks Completed)</span>
                    <span>{overallProgress}%</span>
                </div>
                <div className={styles.progressBarContainer}>
                    <div className={styles.progressBar} style={{ width: `${overallProgress}%` }}></div>
                </div>
                
                {activeCountdowns.length > 0 && (
                    <div 
                        className={styles.alertCountdownList} 
                        onClick={() => navigate('/countdowns')}
                        title="Click to manage countdowns"
                    >
                        <div style={{fontWeight: '700', color: 'white', marginBottom: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <span>⏳ Upcoming Deadlines ({activeCountdowns.length}):</span>
                            <span style={{fontSize: '13px', opacity: 0.9, backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '12px'}}>Manage ➔</span>
                        </div>
                        
                        {activeCountdowns.slice(0, 3).map(c => {
                            const days = getDaysLeft(c.deadline);
                            let badgeText = `${days} Days Left`;
                            let badgeClass = styles.daysLeftBadge;
                            
                            if (days < 0) { badgeText = "Overdue!"; badgeClass = `${styles.daysLeftBadge} ${styles.urgentBadge}`; }
                            else if (days === 0) { badgeText = "Due Today!"; badgeClass = `${styles.daysLeftBadge} ${styles.urgentBadge}`; }
                            
                            return (
                                <div key={c._id} className={styles.alertCountdownItem}>
                                    <span>{c.description}</span>
                                    <span className={badgeClass}>{badgeText}</span>
                                </div>
                            );
                        })}
                        {activeCountdowns.length > 3 && (
                            <div style={{textAlign: 'center', fontSize: '13px', marginTop: '5px', fontWeight: '600', opacity: 0.8}}>
                                + {activeCountdowns.length - 3} more countdowns
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className={styles.categoryGrid}>
                {categories.map((category) => {
                    const stats = calculateCategoryStats(category._id);
                    return (
                        <div 
                            key={category._id} 
                            className={styles.categoryCard}
                            onClick={() => handleCategoryClick(category._id)}
                        >
                            <div className={styles.categoryTitle}>
                                <div className={styles.categoryIcon}>📁</div>
                                {category.name}
                            </div>
                            
                            <div className={styles.progressLabel} style={{color: '#475569'}}>
                                <span>Progress</span>
                                <span>{stats.progress}%</span>
                            </div>
                            <div className={styles.categoryProgressContainer}>
                                <div className={styles.categoryProgressBar} style={{ width: `${stats.progress}%` }}></div>
                            </div>

                            <div className={styles.taskCounts}>
                                <div className={`${styles.countBadge} ${styles.countTodo}`}>
                                    <span>To Do</span>
                                    <span className={styles.countValue}>{stats.todo}</span>
                                </div>
                                <div className={`${styles.countBadge} ${styles.countInProgress}`}>
                                    <span>Doing</span>
                                    <span className={styles.countValue}>{stats.inProgress}</span>
                                </div>
                                <div className={`${styles.countBadge} ${styles.countDone}`}>
                                    <span>Done</span>
                                    <span className={styles.countValue}>{stats.completed}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {categories.length === 0 && (
                    <div style={{gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8', padding: '40px', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e0'}}>
                        No categories found. Click "+ Add New Category" or use the Dummy Data button.
                    </div>
                )}
            </div>

            <div className={styles.actionButtons}>
                <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
                    <span>+</span> Add New Category
                </button>
                <button className={styles.manageBtn} onClick={() => navigate('/countdowns')}>
                    ⏱️ Manage Countdowns
                </button>
                
                <button 
                    className={styles.dummyBtn} 
                    onClick={handleGenerateDummyData}
                    disabled={isGenerating}
                >
                    {isGenerating ? "⏳ Generating..." : "⚡ Populate Dummy Data"}
                </button>
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2 style={{marginTop: 0, marginBottom: '20px', color: '#1a202c'}}>Create Category</h2>
                        <input 
                            type="text" 
                            className={styles.inputField}
                            placeholder="e.g., ITPM Assignment"
                            value={newCategoryName}
                            onChange={(e) => {
                                setNewCategoryName(e.target.value);
                                setError('');
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                            autoFocus
                        />
                        {error && <span className={styles.errorText}>{error}</span>}
                        
                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className={styles.confirmBtn} onClick={handleAddCategory}>Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;