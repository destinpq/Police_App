import React, { useState } from 'react';
import { CreateProjectDto, ProjectStatus } from '../types/project';
import { ProjectService } from '../services/ProjectService';
import { Form, Input, Button, Select, DatePicker, Slider, Card, message, InputNumber, Divider } from 'antd';
import { PlusOutlined, DollarOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'INR', label: 'INR (₹)', symbol: '₹' },
  { value: 'JPY', label: 'JPY (¥)', symbol: '¥' },
];

interface ProjectFormProps {
  onProjectAdded: (project?: CreateProjectDto) => void;
  currentUser: { isAdmin: boolean };
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onProjectAdded, currentUser }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      // Extract and format timeline data
      const { dateRange, ...projectData } = values;
      
      // Create the project DTO with timeline information
      const projectDto: CreateProjectDto = {
        ...projectData,
        // If dateRange is provided, extract start and end dates
        startDate: dateRange?.[0] ? dateRange[0].toISOString() : undefined,
        endDate: dateRange?.[1] ? dateRange[1].toISOString() : undefined,
        // Default value already set in form initialValues
      };
      
      const createdProject = await ProjectService.createProject(projectDto);
      message.success(`Project "${createdProject.name}" created successfully!`);
      form.resetFields();
      if (onProjectAdded) {
        onProjectAdded(createdProject);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      message.error('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Only render the form if user is admin
  if (!currentUser || !currentUser.isAdmin) {
    return null;
  }

  return (
    <Card title="Add New Project" className="project-form">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: ProjectStatus.NOT_STARTED,
          completionPercentage: 0,
          budgetCurrency: 'USD',
          budgetSpent: 0
        }}
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
          rules={[{ required: true, message: 'Please enter a project description' }]}
        >
          <TextArea 
            placeholder="Enter project description" 
            rows={4} 
          />
        </Form.Item>
        
        <Divider>Timeline Information</Divider>
        
        <Form.Item
          name="status"
          label="Project Status"
        >
          <Select>
            <Option value={ProjectStatus.NOT_STARTED}>Not Started</Option>
            <Option value={ProjectStatus.IN_PROGRESS}>In Progress</Option>
            <Option value={ProjectStatus.ON_HOLD}>On Hold</Option>
            <Option value={ProjectStatus.COMPLETED}>Completed</Option>
            <Option value={ProjectStatus.DELAYED}>Delayed</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="dateRange"
          label="Project Timeline"
        >
          <RangePicker 
            style={{ width: '100%' }} 
            placeholder={['Start Date', 'End Date']}
          />
        </Form.Item>
        
        <Form.Item
          name="completionPercentage"
          label="Completion Percentage"
        >
          <Slider 
            min={0} 
            max={100} 
            marks={{ 
              0: '0%', 
              25: '25%', 
              50: '50%', 
              75: '75%', 
              100: '100%' 
            }} 
          />
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
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            icon={<PlusOutlined />}
          >
            Add Project
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ProjectForm; 