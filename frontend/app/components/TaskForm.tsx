'use client';

import { FC, useEffect, useState } from 'react';
import { Form, Input, Button, Select, DatePicker, Spin, notification, InputNumber } from 'antd';
import { Task, CreateTaskDto, UpdateTaskDto } from '../types/task';
import { User } from '../types/user';
import { Project } from '../types/project';
import { UserService } from '../services/UserService';
import { ProjectService } from '../services/ProjectService';
import { SendOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface TaskFormProps {
  task?: Task;
  onSubmit: (task: CreateTaskDto | UpdateTaskDto) => void;
  onCancel: () => void;
  isAdmin: boolean;
}

// Extended type for form values with dayjs for deadline
interface TaskFormValues {
  id?: number;
  title: string;
  description: string;
  status?: 'OPEN' | 'IN_PROGRESS' | 'DONE';
  assignee_id?: number;
  project_id: number;
  deadline?: dayjs.Dayjs | null;
  moneySpent?: number;
}

export const TaskForm: FC<TaskFormProps> = ({ task, onSubmit, onCancel, isAdmin }) => {
  const [form] = Form.useForm();
  const isEditing = !!task;
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [allUsers, allProjects] = await Promise.all([
          UserService.getAllUsers(),
          ProjectService.getAllProjects()
        ]);
        setUsers(allUsers);
        setProjects(allProjects);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (task) {
      // Convert string date to dayjs object for the DatePicker
      const formData = {
        ...task,
        assignee_id: task.assignee?.id,
        deadline: task.deadline ? dayjs(task.deadline) : null,
      };
      form.setFieldsValue(formData);
    } else {
      form.resetFields();
    }
  }, [task, form]);

  const handleSubmit = async (values: TaskFormValues) => {
    try {
      setSubmitting(true);
      
      // Start notification for email sending if a user is assigned
      let notificationKey = '';
      if (values.assignee_id) {
        const assignedUser = users.find(user => user.id === values.assignee_id);
        if (assignedUser) {
          notificationKey = `email-${Date.now()}`;
          notification.open({
            key: notificationKey,
            message: 'Sending notification email',
            description: 
              <div>
                <Spin spinning={true} /> Sending task notification to {assignedUser.email}...
              </div>,
            duration: 0,
            icon: <SendOutlined style={{ color: '#1890ff' }} spin />
          });
        }
      }
      
      // Convert dayjs object to ISO string for the backend
      const formattedValues: CreateTaskDto | UpdateTaskDto = { 
        ...values,
        deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : undefined 
      };
      
      // Submit the form
      await onSubmit(formattedValues);
      
      // Close email notification if it was opened
      if (notificationKey) {
        setTimeout(() => {
          notification.success({
            key: notificationKey,
            message: 'Email notification sent',
            description: 'The task assignment email was sent successfully.',
            duration: 3
          });
        }, 1500);
      }
      
      form.resetFields();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h2>{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ 
          status: 'OPEN',
        }}
        disabled={submitting}
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please enter a title' }]}
        >
          <Input placeholder="Task title" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter a description' }]}
        >
          <TextArea rows={4} placeholder="Task description" />
        </Form.Item>

        <Form.Item
          name="project_id"
          label="Project"
          rules={[{ required: true, message: 'Please select a project' }]}
        >
          <Select 
            placeholder="Select a project" 
            loading={loading}
          >
            {projects.map(project => (
              <Option key={project.id} value={project.id}>
                {project.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select a status' }]}
        >
          <Select placeholder="Select a status">
            <Option value="OPEN">To Do</Option>
            <Option value="IN_PROGRESS">In Progress</Option>
            <Option value="DONE">Done</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="assignee_id"
          label="Assign To"
        >
          <Select 
            placeholder="Select a user" 
            allowClear
            loading={loading}
            disabled={!isAdmin}
          >
            {users.map(user => (
              <Option key={user.id} value={user.id}>
                {user.email}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="deadline"
          label="Deadline"
        >
          <DatePicker 
            style={{ width: '100%' }} 
            format="YYYY-MM-DD"
            placeholder="Select deadline"
            showTime={false}
          />
        </Form.Item>

        <Form.Item
          name="moneySpent"
          label="Money Spent ($)"
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            step={10}
            precision={2}
            placeholder="Enter amount spent on this task"
            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          />
        </Form.Item>

        <div className="button-group">
          <Button type="primary" htmlType="submit" loading={submitting}>
            {isEditing ? 'Update' : 'Create'}
          </Button>
          <Button onClick={onCancel} disabled={submitting}>Cancel</Button>
        </div>
      </Form>
    </div>
  );
}; 