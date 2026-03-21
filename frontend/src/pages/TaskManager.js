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

    // Custom Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        taskName: '',
        taskId: null,
        destCol: '',
        sourceCol: '',
        originalColumns: null // Store original state to revert if cancelled
    });

    useEffect(() => {
        fetchData();
    }, [categoryId]);

    const fetchData = async () => {
        try {
            const catRes = await axios.get('http://localhost:5000/api/categories');
            const currentCat = catRes.data.find(c => c._id === categoryId);
            if (currentCat) setCategoryName(currentCat.name);

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

    const handleAddTask = async (status) => {
        if (!newTaskContent.trim()) return;
        try {
            const res = await axios.post('http://localhost:5000/api/tasks', {
                content: newTaskContent,
                status: status,
                category: categoryId
            });
            setColumns(prev => ({
                ...prev,
                [status]: [...prev[status], res.data]
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

        // Save current state in case we need to revert
        const originalColumns = { ...columns };

        // Optimistically update UI so the item doesn't snap back immediately
        const sourceTasks = Array.from(columns[sourceCol]);
        const destTasks = sourceCol === destCol ? sourceTasks : Array.from(columns[destCol]);

        const [removed] = sourceTasks.splice(source.index, 1);
        removed.status = destCol;
        destTasks.splice(destination.index, 0, removed);

        setColumns({
            ...columns,
            [sourceCol]: sourceTasks,
            [destCol]: destTasks
        });

        // If moving to a different column, trigger custom confirmation
        if (sourceCol !== destCol) {
            setConfirmModal({
                isOpen: true,
                taskName: taskToMove.content,
                taskId: draggableId,
                destCol: destCol,
                sourceCol: sourceCol,
                originalColumns: originalColumns
            });
        } else {
            // Reordering within the same column (No confirmation needed)
            updateTaskInBackend(draggableId, destCol);
        }
    };

    // Confirm Modal Actions
    const handleConfirmDrop = () => {
        updateTaskInBackend(confirmModal.taskId, confirmModal.destCol);
        setConfirmModal({ ...confirmModal, isOpen: false });
    };

    const handleCancelDrop = () => {
        // Revert to original UI state
        setColumns(confirmModal.originalColumns);
        setConfirmModal({ ...confirmModal, isOpen: false });
    };

    const updateTaskInBackend = async (taskId, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/tasks/${taskId}`, { status: newStatus });
        } catch (error) {
            console.error("Error updating task:", error);
            fetchData(); // Revert on error
        }
    };

    // Helper function to set specific CSS classes per column
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
                <div className={styles.title}>{categoryName}</div>
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
                                                        {columnId === 'Completed' && <span style={{color: '#69b3a2', fontWeight: 'bold'}}>✓</span>}
                                                        {task.content}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>

                            {columnId !== 'Completed' && (
                                <>
                                    {activeInputColumn === columnId ? (
                                        <input 
                                            autoFocus
                                            className={styles.addInput}
                                            type="text"
                                            placeholder="Press Enter to add..."
                                            value={newTaskContent}
                                            onChange={(e) => setNewTaskContent(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleAddTask(columnId);
                                                if (e.key === 'Escape') setActiveInputColumn(null);
                                            }}
                                            onBlur={() => setActiveInputColumn(null)}
                                        />
                                    ) : (
                                        <button 
                                            className={styles.addTaskBtn}
                                            onClick={() => setActiveInputColumn(columnId)}
                                        >
                                            + Add New Task
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </DragDropContext>

            {/* Custom Interactive Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className={styles.confirmOverlay}>
                    <div className={styles.confirmBox}>
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
        </div>
    );
};

export default TaskManager;