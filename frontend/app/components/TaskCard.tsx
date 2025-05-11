'use client';

import React from 'react';
import { Card, Tag, Button, Typography, Tooltip, Dropdown, Menu, Space } from 'antd';
import { Task } from '../types/task';
import { EditOutlined, DeleteOutlined, MoreOutlined, ClockCircleOutlined, FlagOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useBreakpoint } from '../utils/responsive';

const { Text, Paragraph } = Typography;

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: number) => void;
  isAdmin?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'OPEN':
      return 'default';
    case 'IN_PROGRESS':
      return 'processing';
    case 'DONE':
      return 'success';
    default:
      return 'default';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'OPEN':
      return 'To Do';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'DONE':
      return 'Done';
    default:
      return status;
  }
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, isAdmin }) => {
  const isOverdue = task.deadline && !task.completedAt && new Date(task.deadline) < new Date() && task.status !== 'DONE';
  const { isMobile } = useBreakpoint();
  
  const menu = (
    <Menu>
      {onEdit && isAdmin && (
        <Menu.Item key="edit" onClick={() => onEdit(task)}>
          <EditOutlined /> Edit
        </Menu.Item>
      )}
      {onDelete && isAdmin && (
        <Menu.Item key="delete" onClick={() => onDelete(task.id)} danger>
          <DeleteOutlined /> Delete
        </Menu.Item>
      )}
    </Menu>
  );

  return (
    <Card 
      size="small" 
      className={`task-card ${isOverdue ? 'overdue' : ''}`}
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text 
            strong 
            style={{ 
              flex: 1, 
              marginRight: 8,
              fontSize: isMobile ? '14px' : '16px',
              // Ensure title doesn't overflow on small screens
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              lineHeight: '1.3'
            }}
          >
            {task.title}
          </Text>
          
          {(onEdit || onDelete) && isAdmin && (
            <Dropdown overlay={menu} trigger={['click']}>
              <Button type="text" icon={<MoreOutlined />} size="small" />
            </Dropdown>
          )}
        </div>
      }
      style={{ marginBottom: 8 }}
    >
      <Paragraph 
        ellipsis={{ rows: 2 }}
        style={{ fontSize: isMobile ? '12px' : '14px' }}
      >
        {task.description}
      </Paragraph>
      
      <div style={{ 
        marginBottom: 8,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px'
      }}>
        <Tag color={getStatusColor(task.status)}>{getStatusText(task.status)}</Tag>
        
        {task.assignee && (
          <Tooltip title={`Assigned to: ${task.assignee.email}`}>
            <Tag color="blue">{task.assignee.email.split('@')[0]}</Tag>
          </Tooltip>
        )}
        
        {task.milestone && (
          <Tooltip title={`Milestone: ${task.milestone.name}`}>
            <Tag color="purple" icon={<FlagOutlined />}>
              {isMobile ? 'Milestone' : task.milestone.name}
            </Tag>
          </Tooltip>
        )}
      </div>
      
      <Space direction={isMobile ? "vertical" : "horizontal"} size="small" style={{ width: '100%' }}>
        {task.deadline && (
          <div>
            <Text 
              type={isOverdue ? "danger" : "secondary"} 
              style={{ 
                fontSize: isMobile ? '11px' : '12px', 
                display: 'flex', 
                alignItems: 'center' 
              }}
            >
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {isOverdue ? 'Overdue: ' : 'Due: '}
              {dayjs(task.deadline).format('MMM D, YYYY')}
            </Text>
          </div>
        )}
        
        {task.moneySpent && task.moneySpent > 0 && (
          <div>
            <Text 
              type="secondary" 
              style={{ 
                fontSize: isMobile ? '11px' : '12px'
              }}
            >
              Budget: ${task.moneySpent.toFixed(2)}
            </Text>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default TaskCard; 