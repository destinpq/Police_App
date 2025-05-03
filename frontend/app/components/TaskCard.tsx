'use client';

import { FC } from 'react';
import { Typography, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined, ProjectOutlined, CalendarOutlined } from '@ant-design/icons';
import { Task } from '../types/task';

const { Paragraph } = Typography;

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  isAdmin: boolean;
}

type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE';

const getStatusTag = (status: string) => {
  const statusClasses: Record<TaskStatus, string> = {
    'OPEN': 'status-open',
    'IN_PROGRESS': 'status-in-progress',
    'DONE': 'status-done'
  };
  
  const statusText: Record<TaskStatus, string> = {
    'OPEN': 'To Do',
    'IN_PROGRESS': 'In Progress',
    'DONE': 'Done'
  };
  
  const validStatus = (status as TaskStatus) in statusClasses ? (status as TaskStatus) : null;
  const className = validStatus ? statusClasses[validStatus] : '';
  const text = validStatus ? statusText[validStatus] : 'Unknown';
  
  return <span className={`task-status ${className}`}>{text}</span>;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const isOverdue = (deadline?: string, status?: string) => {
  if (!deadline || status === 'DONE') return false;
  const today = new Date();
  const deadlineDate = new Date(deadline);
  return deadlineDate < today;
};

export const TaskCard: FC<TaskCardProps> = ({ task, onEdit, onDelete, isAdmin }) => {
  const overdue = isOverdue(task.deadline, task.status);
  
  // Prepare action buttons only if user is admin
  const actionButtons = isAdmin ? [
    <button key="edit" className="btn" onClick={() => onEdit(task)}>
      <EditOutlined />
    </button>,
    <button key="delete" className="btn btn-danger" onClick={() => onDelete(task.id)}>
      <DeleteOutlined />
    </button>
  ] : [];
  
  return (
    <div className="task-card">
      <div className="card-header">
        <Tooltip title={task.title}>
          <h3 className="task-title">{task.title}</h3>
        </Tooltip>
        {getStatusTag(task.status)}
      </div>
      
      <div className="card-body">
        <Paragraph ellipsis={{ rows: 2 }} className="task-description">
          {task.description}
        </Paragraph>
        
        <div className="task-meta">
          <div className="task-meta-item">
            <ProjectOutlined />
            <span>Project: {task.project.name}</span>
          </div>
          
          {task.deadline && (
            <div className="task-meta-item">
              <CalendarOutlined />
              <span className={overdue ? 'text-danger' : ''}>
                Deadline: {formatDate(task.deadline)} {overdue && <span className="tag-overdue">Overdue</span>}
              </span>
            </div>
          )}
        </div>
        
        {task.assignee && (
          <div className="task-assignee">
            <div className="avatar">
              <UserOutlined />
            </div>
            <span>Assigned to: {task.assignee.email}</span>
          </div>
        )}
      </div>
      
      {isAdmin && (
        <div className="card-actions">
          {actionButtons}
        </div>
      )}
    </div>
  );
}; 