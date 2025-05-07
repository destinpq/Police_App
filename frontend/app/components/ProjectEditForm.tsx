import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, InputNumber, Space, message, Divider } from 'antd';
import { Project, UpdateProjectDto } from '../types/project';
import { ProjectService } from '../services/ProjectService';
import { DollarOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'INR', label: 'INR (₹)', symbol: '₹' },
  { value: 'JPY', label: 'JPY (¥)', symbol: '¥' },
];

interface ProjectEditFormProps {
  project: Project;
  onProjectUpdated: (updatedProject?: Project) => void;
  onCancel: () => void;
}

const ProjectEditForm: React.FC<ProjectEditFormProps> = ({ 
  project, 
  onProjectUpdated, 
  onCancel 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    form.setFieldsValue({
      name: project.name,
      description: project.description,
      budget: project.budget || undefined,
      budgetSpent: project.budgetSpent || 0,
      budgetCurrency: project.budgetCurrency || 'USD',
    });
  }, [project, form]);

  const handleSubmit = async (values: {
    name: string;
    description: string;
    budget?: number;
    budgetSpent?: number;
    budgetCurrency?: string;
  }) => {
    try {
      setLoading(true);
      
      // Create the project update DTO
      const projectDto: UpdateProjectDto = values;
      
      const updatedProject = await ProjectService.updateProject(project.id, projectDto);
      message.success(`Project "${updatedProject.name}" updated successfully!`);
      
      if (onProjectUpdated) {
        onProjectUpdated(updatedProject);
      }
      
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error('Failed to update project:', error);
      message.error('Failed to update project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="project-edit-form">
      <h2>Edit Project</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label="Project Name"
          rules={[{ required: true, message: 'Please enter a project name' }]}
        >
          <Input placeholder="Enter project name" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter a description' }]}
        >
          <TextArea rows={4} placeholder="Enter project description" />
        </Form.Item>
        
        <Divider>Budget Information</Divider>
        
        <Form.Item
          name="budgetCurrency"
          label="Currency"
        >
          <Select>
            {CURRENCIES.map(currency => (
              <Option key={currency.value} value={currency.value}>{currency.label}</Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item
          name="budget"
          label="Total Budget"
        >
          <InputNumber 
            style={{ width: '100%' }} 
            min={0}
            step={1000}
            prefix={<DollarOutlined />}
          />
        </Form.Item>
        
        <Form.Item
          name="budgetSpent"
          label="Budget Spent"
        >
          <InputNumber 
            style={{ width: '100%' }} 
            min={0}
            step={500}
            prefix={<DollarOutlined />}
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update Project
            </Button>
            <Button onClick={onCancel}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
      <style jsx>{`
        .project-edit-form {
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        h2 {
          font-size: 18px;
          margin-bottom: 15px;
        }
        .error {
          color: red;
          padding: 10px;
          margin-bottom: 10px;
          background-color: rgba(255, 0, 0, 0.1);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default ProjectEditForm; 