import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Dashboard.module.css';

const Dashboard = () => {
    const [categories, setCategories] = useState([]);
    
    // States for Modal and Form Validation
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/categories');
                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryClick = (categoryId) => {
        navigate(`/category/${categoryId}`);
    };

    // Handle Adding a New Category
    const handleAddCategory = async () => {
        // Form Validation: Check if empty
        if (!newCategoryName.trim()) {
            setError('Category name is required.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/categories', {
                name: newCategoryName.trim()
            });
            
            // Add the new category to the UI instantly
            setCategories([...categories, response.data]);
            
            // Reset and close modal
            setNewCategoryName('');
            setError('');
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error adding category:", error);
            setError('Failed to add category. Please try again.');
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setNewCategoryName('');
        setError('');
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>Welcome</h1>

            <div className={styles.alertsSection}>
                <div className={styles.alertsHeader}>
                    <span>ℹ️ Alerts</span>
                </div>
                <div className={styles.progressLabel}>
                    <span>Overall Progress</span>
                    <span>22%</span>
                </div>
                <div className={styles.progressBarContainer}>
                    <div className={styles.progressBar} style={{ width: '22%' }}></div>
                </div>
            </div>

            <div className={styles.categoryGrid}>
                {categories.map((category) => (
                    <div 
                        key={category._id} 
                        className={styles.categoryCard}
                        onClick={() => handleCategoryClick(category._id)}
                    >
                        <div className={styles.categoryTitle}>{category.name}</div>
                        
                        <div className={styles.progressLabel} style={{color: '#333'}}>
                            <span>Progress</span>
                            <span>0%</span>
                        </div>
                        <div className={styles.categoryProgressContainer}>
                            <div className={styles.categoryProgressBar} style={{ width: '0%' }}></div>
                        </div>

                        <div className={styles.taskCounts}>
                            <span>To Do: 0</span>
                            <span>In Progress: 0</span>
                            <span>Done: 0</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.actionButtons}>
                {/* Open Modal Button */}
                <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
                    + Add New Category
                </button>
                <button className={styles.manageBtn}>Manage Countdowns</button>
            </div>

            {/* Add Category Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2>Add New Category</h2>
                        <input 
                            type="text" 
                            className={styles.inputField}
                            placeholder="Category Name (e.g., ITPM, PAF)"
                            value={newCategoryName}
                            onChange={(e) => {
                                setNewCategoryName(e.target.value);
                                setError(''); // Clear error when typing
                            }}
                        />
                        {error && <span className={styles.errorText}>{error}</span>}
                        
                        <div className={styles.modalActions}>
                            <button className={styles.confirmBtn} onClick={handleAddCategory}>Add</button>
                            <button className={styles.cancelBtn} onClick={handleCloseModal}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;