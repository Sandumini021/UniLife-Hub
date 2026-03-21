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

    // Fetch all data to calculate progress
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

    const urgentCountdowns = countdowns.filter(c => !c.isCompleted).length;

    // --- Dummy Data Generation Logic (For Presentation) ---
    const handleGenerateDummyData = async () => {
        if (!window.confirm("This will populate your app with dummy data. Proceed?")) return;
        
        setIsGenerating(true);
        try {
            // 1. Create Dummy Categories
            const catRes1 = await axios.post('http://localhost:5000/api/categories', { name: "ITPM Assignment" });
            const catRes2 = await axios.post('http://localhost:5000/api/categories', { name: "PAF Project" });
            const catRes3 = await axios.post('http://localhost:5000/api/categories', { name: "CN Repeat" });

            const id1 = catRes1.data._id;
            const id2 = catRes2.data._id;
            const id3 = catRes3.data._id;

            // 2. Create Dummy Tasks for ITPM
            await axios.post('http://localhost:5000/api/tasks', { content: "Create Frontend UI", status: "Completed", category: id1 });
            await axios.post('http://localhost:5000/api/tasks', { content: "Setup Backend Routes", status: "In Progress", category: id1 });
            await axios.post('http://localhost:5000/api/tasks', { content: "Implement Drag and Drop", status: "To Do", category: id1 });

            // 3. Create Dummy Tasks for PAF
            await axios.post('http://localhost:5000/api/tasks', { content: "Learn Spring Boot", status: "Completed", category: id2 });
            await axios.post('http://localhost:5000/api/tasks', { content: "Connect MySQL DB", status: "To Do", category: id2 });

            // 4. Create Dummy Tasks for CN
            await axios.post('http://localhost:5000/api/tasks', { content: "Study Subnetting", status: "In Progress", category: id3 });
            await axios.post('http://localhost:5000/api/tasks', { content: "Past Paper 2023", status: "To Do", category: id3 });

            // 5. Create Dummy Countdowns
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);

            await axios.post('http://localhost:5000/api/countdowns', { description: "ITPM Progress Presentation", deadline: tomorrow.toISOString().split('T')[0] });
            await axios.post('http://localhost:5000/api/countdowns', { description: "PAF Final Submission", deadline: nextWeek.toISOString().split('T')[0] });

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
            <h1 className={styles.header}>Welcome back, Dinuka! 👋</h1>

            <div className={styles.alertsSection}>
                <div className={styles.alertsHeader}>
                    <span>🚀 Dashboard Overview</span>
                </div>
                <div className={styles.progressLabel}>
                    <span>Overall Project Progress ({overallCompletedCount} of {totalTasksCount} Tasks Completed)</span>
                    <span>{overallProgress}%</span>
                </div>
                <div className={styles.progressBarContainer}>
                    <div className={styles.progressBar} style={{ width: `${overallProgress}%` }}></div>
                </div>
                {urgentCountdowns > 0 && (
                    <div style={{marginTop: '15px', fontSize: '14px', background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '8px', display: 'inline-block'}}>
                        ⚠️ You have <strong>{urgentCountdowns}</strong> active countdown(s) pending!
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
                            <div className={styles.categoryTitle}>{category.name}</div>
                            
                            <div className={styles.progressLabel} style={{color: '#4a5568'}}>
                                <span>Progress</span>
                                <span>{stats.progress}%</span>
                            </div>
                            <div className={styles.categoryProgressContainer}>
                                <div className={styles.categoryProgressBar} style={{ width: `${stats.progress}%` }}></div>
                            </div>

                            <div className={styles.taskCounts}>
                                <span>To Do: {stats.todo}</span>
                                <span>In Progress: {stats.inProgress}</span>
                                <span>Done: {stats.completed}</span>
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
                
                {/* Dummy Data Button for Presentation */}
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