'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Empty, Spin } from 'antd';
import { TaskService } from '../services/TaskService';
import { Task } from '../types/task';
import { TaskCard } from './TaskCard';

interface TaskBoardProps {
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
  tasks: Task[];
  loading: boolean;
  refreshTasks: () => void;
  isAdmin: boolean;
}

export const TaskBoard = ({ onEditTask, onDeleteTask, tasks, loading, refreshTasks, isAdmin }: TaskBoardProps) => {
  const [columns, setColumns] = useState({
    'OPEN': [] as Task[],
    'IN_PROGRESS': [] as Task[],
    'DONE': [] as Task[],
  });

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

  return (
    <div className="task-board">
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
          <div className="loading-text">Loading tasks...</div>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="board-columns">
            {Object.entries(columns).map(([status, taskList]) => (
              <div key={status} className={`task-column column-${status.toLowerCase()}`}>
                <div className="column-header">
                  <span className={`column-badge ${status.toLowerCase()}`}>{taskList.length}</span>
                  <span className="column-title">
                    {status === 'OPEN' ? 'To Do' : status === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
                  </span>
                </div>
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`column-content ${snapshot.isDraggingOver ? 'is-dragging-over' : ''}`}
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