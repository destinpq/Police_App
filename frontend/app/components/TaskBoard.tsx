'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Empty, Spin } from 'antd';
import { TaskService } from '../services/TaskService';
import { Task } from '../types/task';
import TaskCard from './TaskCard';
import { useBreakpoint } from '../utils/responsive';

interface TaskBoardProps {
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
  tasks: Task[];
  loading: boolean;
  refreshTasks: () => void;
  isAdmin?: boolean;
}

export const TaskBoard = ({ onEditTask, onDeleteTask, tasks, loading, refreshTasks, isAdmin }: TaskBoardProps) => {
  const [columns, setColumns] = useState({
    'OPEN': [] as Task[],
    'IN_PROGRESS': [] as Task[],
    'DONE': [] as Task[],
  });
  
  // Get current breakpoint information
  const { isMobile, isTablet } = useBreakpoint();

  // Group tasks by status
  useEffect(() => {
    const groupedTasks = {
      'OPEN': tasks.filter(task => task.status === 'OPEN'),
      'IN_PROGRESS': tasks.filter(task => task.status === 'IN_PROGRESS'),
      'DONE': tasks.filter(task => task.status === 'DONE'),
    };
    setColumns(groupedTasks);
  }, [tasks]);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // No position change
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    if (source.droppableId !== destination.droppableId) {
      // Moving from one column to another
      const sourceColumn = [...columns[source.droppableId as keyof typeof columns]];
      const destColumn = [...columns[destination.droppableId as keyof typeof columns]];
      
      // Find the task that was moved
      const taskId = parseInt(draggableId);
      const task = sourceColumn.find(t => t.id === taskId);
      
      if (!task) return;
      
      // Remove from source column
      const newSourceColumn = sourceColumn.filter(t => t.id !== taskId);
      
      // Add to destination column with new status
      const updatedTask = { ...task, status: destination.droppableId as 'OPEN' | 'IN_PROGRESS' | 'DONE' };
      destColumn.splice(destination.index, 0, updatedTask);
      
      // Update columns state
      setColumns({
        ...columns,
        [source.droppableId]: newSourceColumn,
        [destination.droppableId]: destColumn,
      });
      
      // Update the task in the backend
      try {
        await TaskService.updateTask(taskId, { status: destination.droppableId as 'OPEN' | 'IN_PROGRESS' | 'DONE' });
        refreshTasks();
      } catch (error) {
        console.error('Failed to update task status:', error);
        // Revert the UI change if the API call fails
        refreshTasks();
      }
    } else {
      // Reordering within the same column (we don't save this to backend as we don't track order)
      const columnTasks = [...columns[source.droppableId as keyof typeof columns]];
      const [removed] = columnTasks.splice(source.index, 1);
      columnTasks.splice(destination.index, 0, removed);
      
      setColumns({
        ...columns,
        [source.droppableId]: columnTasks,
      });
    }
  };

  // Responsive styles based on screen size
  const getColumnContainerStyles = () => {
    if (isMobile) {
      // For mobile, stack columns vertically
      return {
        flexDirection: 'column',
        gap: '15px',
      } as const;
    } else {
      // For tablet and desktop, keep columns side by side
      return {
        flexDirection: 'row',
        gap: isTablet ? '10px' : '20px',
      } as const;
    }
  };

  const getColumnStyles = () => {
    if (isMobile) {
      // Full width columns for mobile
      return {
        width: '100%',
        minWidth: 'auto',
      };
    } else if (isTablet) {
      // Equal width columns for tablet
      return {
        flex: 1,
        minWidth: '200px',
      };
    } else {
      // Fixed width columns for desktop
      return {
        flex: 1,
        minWidth: '250px',
      };
    }
  };

  return (
    <div className="task-board">
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
          <div className="loading-text">Loading tasks...</div>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div 
            className="board-columns"
            style={{
              display: 'flex',
              ...getColumnContainerStyles(),
            }}
          >
            {Object.entries(columns).map(([status, taskList]) => (
              <div 
                key={status} 
                className={`task-column column-${status.toLowerCase()}`}
                style={{
                  ...getColumnStyles(),
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  padding: '10px',
                }}
              >
                <div 
                  className="column-header"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '10px',
                    padding: '5px 0',
                    borderBottom: '1px solid #e8e8e8',
                  }}
                >
                  <span 
                    className={`column-badge ${status.toLowerCase()}`}
                    style={{
                      display: 'inline-block',
                      width: '24px',
                      height: '24px',
                      lineHeight: '24px',
                      textAlign: 'center',
                      borderRadius: '50%',
                      background: status === 'OPEN' ? '#d9d9d9' : status === 'IN_PROGRESS' ? '#1677ff' : '#52c41a',
                      color: status === 'OPEN' ? '#000' : '#fff',
                      marginRight: '8px',
                      fontSize: '12px',
                    }}
                  >
                    {taskList.length}
                  </span>
                  <span 
                    className="column-title"
                    style={{
                      fontWeight: 500,
                      fontSize: isMobile ? '14px' : '16px',
                    }}
                  >
                    {status === 'OPEN' ? 'To Do' : status === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
                  </span>
                </div>
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`column-content ${snapshot.isDraggingOver ? 'is-dragging-over' : ''}`}
                      style={{
                        minHeight: '50px',
                        maxHeight: isMobile ? '400px' : '600px',
                        overflowY: 'auto',
                        backgroundColor: snapshot.isDraggingOver ? '#e6f7ff' : 'transparent',
                        borderRadius: '4px',
                        padding: '5px',
                      }}
                    >
                      {taskList.length === 0 ? (
                        <Empty 
                          description={`No ${status.toLowerCase()} tasks`} 
                          image={Empty.PRESENTED_IMAGE_SIMPLE} 
                        />
                      ) : (
                        taskList.map((task, index) => (
                          <Draggable 
                            key={task.id} 
                            draggableId={String(task.id)} 
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  opacity: snapshot.isDragging ? 0.8 : 1,
                                }}
                              >
                                <TaskCard 
                                  task={task} 
                                  onEdit={onEditTask} 
                                  onDelete={onDeleteTask}
                                  isAdmin={isAdmin}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  );
}; 