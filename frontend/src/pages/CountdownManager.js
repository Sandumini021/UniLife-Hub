import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './CountdownManager.module.css';

const CountdownManager = () => {
    const navigate = useNavigate();
    const [countdowns, setCountdowns] = useState([]);
    
    // Modals & Form States
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
    const [pastDateWarning, setPastDateWarning] = useState(false);
    
    const [editId, setEditId] = useState(null);
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

    const resetForm = () => {
        setIsFormModalOpen(false);
        setPastDateWarning(false);
        setDescription('');
        setDeadline('');
        setEditId(null);
    };

    const handleEditClick = (countdown) => {
        setEditId(countdown._id);
        setDescription(countdown.description);
        // Format date for the input field (YYYY-MM-DD)
        const dateObj = new Date(countdown.deadline);
        const formattedDate = dateObj.toISOString().split('T')[0];
        setDeadline(formattedDate);
        setIsFormModalOpen(true);
    };

    const handleSaveClick = () => {
        if (!description || !deadline) return alert("Please fill all fields!");

        // Check for past date
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        const selectedDate = new Date(deadline);

        if (selectedDate < today) {
            setPastDateWarning(true); // Show warning modal
        } else {
            proceedToSave();
        }
    };

    const proceedToSave = async () => {
        try {
            if (editId) {
                // Update existing countdown
                const res = await axios.put(`http://localhost:5000/api/countdowns/${editId}`, {
                    description,
                    deadline
                });
                setCountdowns(countdowns.map(c => c._id === editId ? res.data : c));
            } else {
                // Create new countdown
                const res = await axios.post('http://localhost:5000/api/countdowns', {
                    description,
                    deadline
                });
                setCountdowns([...countdowns, res.data]);
            }
            resetForm();
        } catch (error) {
            console.error("Error saving countdown:", error);
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

    const confirmDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/countdowns/${deleteModal.id}`);
            setCountdowns(countdowns.filter(c => c._id !== deleteModal.id));
            setDeleteModal({ isOpen: false, id: null });
        } catch (error) {
            console.error("Error deleting countdown:", error);
        }
    };

    const getDeadlineInfo = (dateString, isCompleted) => {
        if (isCompleted) return { text: "Completed", styleClass: styles.cardCompleted };
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const targetDate = new Date(dateString);
        targetDate.setHours(0, 0, 0, 0);
        
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
                <button className={styles.addBtn} onClick={() => setIsFormModalOpen(true)}>+ New Countdown</button>
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
                                    className={`${styles.iconBtn} ${styles.btnEdit}`} 
                                    onClick={() => handleEditClick(item)}
                                    title="Edit"
                                >
                                    ✏️
                                </button>
                                <button 
                                    className={`${styles.iconBtn} ${styles.btnDelete}`} 
                                    onClick={() => setDeleteModal({ isOpen: true, id: item._id })}
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

            {/* Main Form Modal (Add / Edit) */}
            {isFormModalOpen && !pastDateWarning && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2 style={{marginTop: 0, marginBottom: '25px', color: '#0f172a'}}>
                            {editId ? 'Edit Countdown' : 'Add New Countdown'}
                        </h2>
                        
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
                            <button className={styles.cancelBtn} onClick={resetForm}>Cancel</button>
                            <button className={styles.confirmBtn} onClick={handleSaveClick}>
                                {editId ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Past Date Warning Modal */}
            {pastDateWarning && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.confirmIcon}>⚠️</div>
                        <div className={styles.confirmText}>
                            This day has passed. <br/> Still do you want to add this date?
                        </div>
                        <div className={styles.modalActions} style={{justifyContent: 'center'}}>
                            <button className={styles.cancelBtn} onClick={() => setPastDateWarning(false)}>No, Go Back</button>
                            <button className={styles.warningBtn} onClick={proceedToSave}>Yes, Add it</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.confirmIcon}>🗑️</div>
                        <div className={styles.confirmText}>
                            Are you sure you want to delete this countdown?<br/>
                            This action cannot be undone.
                        </div>
                        <div className={styles.modalActions} style={{justifyContent: 'center'}}>
                            <button className={styles.cancelBtn} onClick={() => setDeleteModal({ isOpen: false, id: null })}>Cancel</button>
                            <button className={styles.deleteBtn} onClick={confirmDelete}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CountdownManager;