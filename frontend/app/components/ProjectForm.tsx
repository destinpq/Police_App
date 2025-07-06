'use client';

import { useState } from 'react';
import { Button, Form, Input, Select, InputNumber, Modal, message } from 'antd';
import { CreateProjectDto } from '../types/project';
import { ProjectService } from '../services/ProjectService';
import { useBreakpoint } from '../utils/responsive';

const { TextArea } = Input;
const { Option } = Select;

// Helper function for InputNumber parser
const parseAmount = (value: string | undefined): number => {
  if (!value) return 0;
  const parsedValue = value.replace(/\$\s?|(,*)/g, '');
  return parseFloat(parsedValue) || 0;
};

interface ProjectFormProps {
  onProjectAdded: () => void;
  currentUser: {
    id: number;
    email: string;
    isAdmin: boolean;
  };
}

const ProjectForm = ({ onProjectAdded, currentUser }: ProjectFormProps) => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { isMobile } = useBreakpoint();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const handleSubmit = async (values: CreateProjectDto) => {
    if (!currentUser.isAdmin) {
      message.error('Only administrators can create projects');
      return;
    }

    try {
      setIsSubmitting(true);
      await ProjectService.createProject(values);
      message.success('Project created successfully');
      form.resetFields();
      setIsModalVisible(false);
      onProjectAdded();
    } catch (error) {
      console.error('Failed to create project:', error);
      message.error('Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button 
        type="primary" 
        onClick={showModal} 
        style={{ width: '100%', marginTop: '20px' }}
        size={isMobile ? 'middle' : 'large'}
      >
        Create New Project
      </Button>

      <Modal
        title="Create New Project"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={isMobile ? '95%' : 520}
      >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
            currency: 'USD',
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
            rules={[{ required: true, message: 'Please enter a description' }]}
        >
          <TextArea 
            placeholder="Enter project description" 
              autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </Form.Item>
        
        <Form.Item
          name="budgetCurrency"
          label="Currency"
        >
            <Select defaultValue="USD">
              <Option value="USD">USD ($)</Option>
              <Option value="EUR">EUR (€)</Option>
              <Option value="GBP">GBP (£)</Option>
              <Option value="CAD">CAD (C$)</Option>
              <Option value="AUD">AUD (A$)</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="budget"
            label="Budget"
        >
          <InputNumber 
            style={{ width: '100%' }} 
            min={0}
              step={100}
              placeholder="Enter budget amount"
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={parseAmount}
          />
        </Form.Item>
        
        <Form.Item
          name="budgetSpent"
          label="Budget Spent"
            initialValue={0}
        >
          <InputNumber 
            style={{ width: '100%' }} 
            min={0}
              step={100}
              placeholder="Enter amount spent"
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={parseAmount}
          />
        </Form.Item>
        
        <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                Create Project
          </Button>
            </div>
        </Form.Item>
      </Form>
      </Modal>
    </>
  );
};

export default ProjectForm; 