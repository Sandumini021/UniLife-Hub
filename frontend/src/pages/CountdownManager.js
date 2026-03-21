import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './CountdownManager.module.css';

const CountdownManager = () => {
    const navigate = useNavigate();
    const [countdowns, setCountdowns] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form States
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');

    useEffect(() => {
        fetchCountdowns();
    }, []);

    const fetchCountdowns = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/countdowns');
            setCountdowns(res.data);
        } catch (error) {
            console.error("Error fetching countdowns:", error);
        }
    };

    const handleAddCountdown = async () => {
        if (!description || !deadline) return alert("Please fill all fields!");
        try {
            const res = await axios.post('http://localhost:5000/api/countdowns', {
                description,
                deadline
            });
            setCountdowns([...countdowns, res.data]);
            setIsModalOpen(false);
            setDescription('');
            setDeadline('');
        } catch (error) {
            console.error("Error adding countdown:", error);
        }
    };

    const toggleComplete = async (id, currentStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/countdowns/${id}`, { isCompleted: !currentStatus });
            fetchCountdowns();
        } catch (error) {
            console.error("Error updating countdown:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this countdown?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/countdowns/${id}`);
            setCountdowns(countdowns.filter(c => c._id !== id));
        } catch (error) {
            console.error("Error deleting countdown:", error);
        }
    };

    // Helper function to calculate days left and style
    const getDeadlineInfo = (dateString, isCompleted) => {
        if (isCompleted) return { text: "Completed", styleClass: styles.cardCompleted };
        
        const today = new Date();
        const targetDate = new Date(dateString);
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: "Overdue!", styleClass: styles.cardUrgent, isUrgent: true };
        if (diffDays === 0) return { text: "Due Today!", styleClass: styles.cardUrgent, isUrgent: true };
        if (diffDays <= 3) return { text: `${diffDays} Days Left`, styleClass: styles.cardUrgent, isUrgent: true };
        
        return { text: `${diffDays} Days Left`, styleClass: styles.cardActive };
    };

    return (
        <div className={styles.container}>
            <div className={styles.headerArea}>
                <button className={styles.backBtn} onClick={() => navigate('/')}>⬅ Back to Dashboard</button>
                <div className={styles.title}>Countdown Manager</div>
                <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>+ New Countdown</button>
            </div>

            <div className={styles.listContainer}>
                {countdowns.map((item) => {
                    const info = getDeadlineInfo(item.deadline, item.isCompleted);
                    return (
                        <div key={item._id} className={`${styles.countdownCard} ${info.styleClass}`}>
                            <div className={styles.infoSection}>
                                <div className={`${styles.desc} ${item.isCompleted ? styles.completedText : ''}`}>
                                    {item.description}
                                </div>
                                <div className={styles.dateInfo}>
                                    <span>📅 {new Date(item.deadline).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span className={info.isUrgent ? styles.urgentText : ''}>{info.text}</span>
                                </div>
                            </div>
                            
                            <div className={styles.actionGroup}>
                                <button 
                                    className={`${styles.iconBtn} ${styles.btnDone}`} 
                                    onClick={() => toggleComplete(item._id, item.isCompleted)}
                                    title={item.isCompleted ? "Mark as Undone" : "Mark as Done"}
                                >
                                    {item.isCompleted ? '↩️' : '✓'}
                                </button>
                                <button 
                                    className={`${styles.iconBtn} ${styles.btnDelete}`} 
                                    onClick={() => handleDelete(item._id)}
                                    title="Delete"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    );
                })}
                
                {countdowns.length === 0 && (
                    <div style={{textAlign: 'center', color: '#94a3b8', marginTop: '50px', fontWeight: '500'}}>
                        No countdowns added yet. Click "+ New Countdown" to add one.
                    </div>
                )}
            </div>

            {/* Add Countdown Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2 style={{marginTop: 0, marginBottom: '25px', color: '#0f172a'}}>Add New Countdown</h2>
                        
                        <div className={styles.inputGroup}>
                            <label>Description</label>
                            <input 
                                className={styles.inputField}
                                type="text" 
                                placeholder="e.g., ITPM Assignment Submission"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Deadline</label>
                            <input 
                                className={styles.inputField}
                                type="date" 
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                            />
                        </div>

                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className={styles.confirmBtn} onClick={handleAddCountdown}>Save Countdown</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CountdownManager;