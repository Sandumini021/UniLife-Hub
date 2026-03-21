import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';
import styles from './TaskManager.module.css';

const TaskManager = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    
    const [categoryName, setCategoryName] = useState('Loading...');
    const [columns, setColumns] = useState({
        'To Do': [],
        'In Progress': [],
        'Completed': []
    });

    const [newTaskContent, setNewTaskContent] = useState('');
    const [activeInputColumn, setActiveInputColumn] = useState(null);

    // Modals States
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false, taskName: '', taskId: null, destCol: '', sourceCol: '', originalColumns: null
    });
    
    // New Modal States for Category Edit/Delete
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editCategoryName, setEditCategoryName] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, [categoryId]);

    const fetchData = async () => {
        try {
            const catRes = await axios.get('http://localhost:5000/api/categories');
            const currentCat = catRes.data.find(c => c._id === categoryId);
            if (currentCat) {
                setCategoryName(currentCat.name);
                setEditCategoryName(currentCat.name);
            }

            const taskRes = await axios.get(`http://localhost:5000/api/tasks?category=${categoryId}`);
            const tasks = taskRes.data;

            setColumns({
                'To Do': tasks.filter(t => t.status === 'To Do'),
                'In Progress': tasks.filter(t => t.status === 'In Progress'),
                'Completed': tasks.filter(t => t.status === 'Completed')
            });
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    // Category Actions
    const handleUpdateCategoryName = async () => {
        if (!editCategoryName.trim()) return;
        try {
            await axios.put(`http://localhost:5000/api/categories/${categoryId}`, { name: editCategoryName });
            setCategoryName(editCategoryName);
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Error updating category name:", error);
        }
    };

    const handleDeleteCategory = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/categories/${categoryId}`);
            setIsDeleteModalOpen(false);
            navigate('/');
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    };

    // Task Actions
    const handleAddTask = async (status) => {
        if (!newTaskContent.trim()) {
            setActiveInputColumn(null); // Just close if empty
            return;
        }
        try {
            const res = await axios.post('http://localhost:5000/api/tasks', {
                content: newTaskContent, status: status, category: categoryId
            });
            setColumns(prev => ({
                ...prev, [status]: [...prev[status], res.data]
            }));
            setNewTaskContent('');
            setActiveInputColumn(null);
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    const onDragEnd = (result) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const sourceCol = source.droppableId;
        const destCol = destination.droppableId;
        const taskToMove = columns[sourceCol].find(t => t._id === draggableId);
        const originalColumns = { ...columns };

        const sourceTasks = Array.from(columns[sourceCol]);
        const destTasks = sourceCol === destCol ? sourceTasks : Array.from(columns[destCol]);

        const [removed] = sourceTasks.splice(source.index, 1);
        removed.status = destCol;
        destTasks.splice(destination.index, 0, removed);

        setColumns({
            ...columns, [sourceCol]: sourceTasks, [destCol]: destTasks
        });

        if (sourceCol !== destCol) {
            setConfirmModal({
                isOpen: true, taskName: taskToMove.content, taskId: draggableId,
                destCol: destCol, sourceCol: sourceCol, originalColumns: originalColumns
            });
        } else {
            updateTaskInBackend(draggableId, destCol);
        }
    };

    const handleConfirmDrop = () => {
        updateTaskInBackend(confirmModal.taskId, confirmModal.destCol);
        setConfirmModal({ ...confirmModal, isOpen: false });
    };

    const handleCancelDrop = () => {
        setColumns(confirmModal.originalColumns);
        setConfirmModal({ ...confirmModal, isOpen: false });
    };

    const updateTaskInBackend = async (taskId, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/tasks/${taskId}`, { status: newStatus });
        } catch (error) {
            console.error("Error updating task:", error);
            fetchData(); 
        }
    };

    const getColumnClass = (colName) => {
        if (colName === 'To Do') return `${styles.column} ${styles.colToDo}`;
        if (colName === 'In Progress') return `${styles.column} ${styles.colInProgress}`;
        if (colName === 'Completed') return `${styles.column} ${styles.colCompleted}`;
        return styles.column;
    };

    return (
        <div className={styles.container}>
            <div className={styles.headerArea}>
                <button className={styles.backBtn} onClick={() => navigate('/')}>
                    ⬅ Back to Dashboard
                </button>
                
                <div className={styles.titleSection}>
                    <div className={styles.title}>{categoryName}</div>
                    <div className={styles.headerActions}>
                        <button className={`${styles.iconBtn} ${styles.btnEdit}`} onClick={() => setIsEditModalOpen(true)} title="Rename Category">✏️</button>
                        <button className={`${styles.iconBtn} ${styles.btnDelete}`} onClick={() => setIsDeleteModalOpen(true)} title="Delete Category">🗑️</button>
                    </div>
                </div>
                
                <div style={{width: '150px'}}></div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className={styles.board}>
                    {Object.entries(columns).map(([columnId, columnTasks]) => (
                        <div key={columnId} className={getColumnClass(columnId)}>
                            <div className={styles.columnHeader}>
                                <span>{columnId}</span>
                                <span>{columnTasks.length}</span>
                            </div>

                            <Droppable droppableId={columnId}>
                                {(provided) => (
                                    <div 
                                        className={styles.taskList}
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                    >
                                        {columnTasks.map((task, index) => (
                                            <Draggable key={task._id} draggableId={task._id} index={index}>
                                                {(provided) => (
                                                    <div
                                                        className={styles.taskCard}
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                    >
                                                        {columnId === 'Completed' && <span style={{color: '#10b981', fontWeight: 'bold'}}>✓</span>}
                                                        {task.content}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>

                            {/* --- Enhanced Add Task Section --- */}
                            {columnId !== 'Completed' && (
                                <>
                                    {activeInputColumn === columnId ? (
                                        <div className={styles.addInputContainer}>
                                            <input 
                                                autoFocus
                                                className={styles.addInput}
                                                type="text"
                                                placeholder="What needs to be done?"
                                                value={newTaskContent}
                                                onChange={(e) => setNewTaskContent(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleAddTask(columnId);
                                                    if (e.key === 'Escape') {
                                                        setActiveInputColumn(null);
                                                        setNewTaskContent('');
                                                    }
                                                }}
                                                onBlur={() => {
                                                    if(newTaskContent.trim() === '') setActiveInputColumn(null);
                                                }}
                                            />
                                            <div className={styles.addInputHint}>
                                                <span>Press <strong>Enter</strong> to save</span>
                                                <span><strong>Esc</strong> to cancel</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            className={styles.addTaskBtn}
                                            onClick={() => setActiveInputColumn(columnId)}
                                        >
                                            <span className={styles.plusIcon}>+</span> Add New Task
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </DragDropContext>

            {/* Modals remain unchanged below */}
            {confirmModal.isOpen && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalContent} ${styles.centerModal}`}>
                        <div className={styles.confirmIcon}>⚠️</div>
                        <div className={styles.confirmText}>
                            Are you sure you want to move <br/> 
                            <span className={styles.taskHighlight}>"{confirmModal.taskName}"</span> <br/>
                            to {confirmModal.destCol}?
                        </div>
                        <div className={styles.btnGroup}>
                            <button className={styles.btnCancel} onClick={handleCancelDrop}>Cancel</button>
                            <button className={styles.btnOk} onClick={handleConfirmDrop}>Yes, Move it</button>
                        </div>
                    </div>
                </div>
            )}

            {isEditModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2 style={{marginTop: 0, marginBottom: '20px', color: '#0f172a'}}>Rename Category</h2>
                        <div className={styles.inputGroup}>
                            <label>Category Name</label>
                            <input 
                                className={styles.inputField}
                                type="text" 
                                value={editCategoryName}
                                onChange={(e) => setEditCategoryName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategoryName()}
                                autoFocus
                            />
                        </div>
                        <div className={styles.modalActions}>
                            <button className={styles.btnCancel} onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                            <button className={styles.btnOk} onClick={handleUpdateCategoryName}>Rename</button>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalContent} ${styles.centerModal}`}>
                        <div className={styles.confirmIcon}>🗑️</div>
                        <div className={styles.confirmText}>
                            Are you sure you want to delete <span className={styles.taskHighlight}>"{categoryName}"</span>?<br/>
                            This will also delete all tasks inside it. This cannot be undone.
                        </div>
                        <div className={styles.btnGroup}>
                            <button className={styles.btnCancel} onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                            <button className={styles.btnDeleteConfirm} onClick={handleDeleteCategory}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskManager;