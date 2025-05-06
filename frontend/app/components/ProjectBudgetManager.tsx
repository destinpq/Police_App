import React, { useState } from 'react';
import { Button, Card, Form, InputNumber, Select, Progress, message, Popconfirm, Space, Typography } from 'antd';
import { DeleteOutlined, DollarOutlined, SaveOutlined, MoneyCollectOutlined } from '@ant-design/icons';
import { ProjectService } from '../services/ProjectService';
import { Project, UpdateProjectDto } from '../types/project';

const { Option } = Select;
const { Text } = Typography;

interface ProjectBudgetManagerProps {
  project: Project;
  onProjectUpdated: (updatedProject: Project) => void;
}

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'INR', label: 'INR (₹)', symbol: '₹' },
  { value: 'JPY', label: 'JPY (¥)', symbol: '¥' },
];

const ProjectBudgetManager: React.FC<ProjectBudgetManagerProps> = ({ 
  project, 
  onProjectUpdated 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  // Reset the form values when the project changes
  React.useEffect(() => {
    if (project) {
      form.setFieldsValue({
        budget: project.budget || undefined,
        budgetSpent: project.budgetSpent || undefined,
        budgetCurrency: project.budgetCurrency || 'USD',
      });
    }
  }, [project, form]);

  const handleSubmit = async (values: {
    budget: number;
    budgetSpent: number;
    budgetCurrency: string;
  }) => {
    try {
      setLoading(true);
      
      const projectDto: UpdateProjectDto = {
        ...values
      };
      
      const updatedProject = await ProjectService.updateProject(project.id, projectDto);
      message.success('Budget updated successfully!');
      onProjectUpdated(updatedProject);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update budget:', error);
      message.error('Failed to update budget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBudget = async () => {
    try {
      setLoading(true);
      
      // Update the project to remove budget data
      const projectDto: UpdateProjectDto = {
        budget: null,
        budgetSpent: null,
        budgetCurrency: null,
      };
      
      const updatedProject = await ProjectService.updateProject(project.id, projectDto);
      message.success('Budget information removed successfully!');
      onProjectUpdated(updatedProject);
    } catch (error) {
      console.error('Failed to remove budget:', error);
      message.error('Failed to remove budget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hasBudget = Boolean(project.budget);
  
  // Calculate budget utilization percentage
  const getBudgetPercentage = () => {
    if (!project.budget || !project.budgetSpent) return 0;
    const percentage = (project.budgetSpent / project.budget) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  };
  
  // Get currency symbol from currency code
  const getCurrencySymbol = (currencyCode?: string) => {
    if (!currencyCode) return '$'; // Default to USD
    const currency = CURRENCIES.find(c => c.value === currencyCode);
    return currency?.symbol || '$';
  };
  
  // Determine budget status
  const getBudgetStatus = () => {
    if (!project.budget || !project.budgetSpent) return 'normal';
    const percentage = (project.budgetSpent / project.budget) * 100;
    
    if (percentage > 100) return 'exception';
    if (percentage > 80) return 'warning';
    return 'success';
  };
  
  // Format currency amount with proper symbol
  const formatCurrency = (amount?: number, currencyCode?: string) => {
    if (amount === undefined) return '-';
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol}${amount.toLocaleString()}`;
  };

  return (
    <Card 
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><MoneyCollectOutlined style={{ marginRight: 8 }} /> Project Budget</span>
          {!editing && (
            <Space>
              {hasBudget && (
                <Popconfirm
                  title="Remove Budget"
                  description="Are you sure you want to remove the project budget information?"
                  onConfirm={handleRemoveBudget}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button 
                    danger
                    icon={<DeleteOutlined />}
                    loading={loading}
                  >
                    Remove Budget
                  </Button>
                </Popconfirm>
              )}
              <Button 
                type="primary"
                onClick={() => setEditing(true)}
                icon={<DollarOutlined />}
              >
                {hasBudget ? 'Edit Budget' : 'Add Budget'}
              </Button>
            </Space>
          )}
        </div>
      }
    >
      {editing ? (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            budget: project.budget || undefined,
            budgetSpent: project.budgetSpent || 0,
            budgetCurrency: project.budgetCurrency || 'USD',
          }}
        >
          <Form.Item
            name="budgetCurrency"
            label="Currency"
            rules={[{ required: true, message: 'Please select currency' }]}
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
            rules={[{ required: true, message: 'Please enter total budget' }]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              min={0}
              step={1000}
              formatter={value => `${getCurrencySymbol(form.getFieldValue('budgetCurrency'))} ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={undefined}
            />
          </Form.Item>
          
          <Form.Item
            name="budgetSpent"
            label="Budget Spent"
            rules={[{ required: true, message: 'Please enter spent budget' }]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              min={0}
              step={500}
              formatter={value => `${getCurrencySymbol(form.getFieldValue('budgetCurrency'))} ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={undefined}
            />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SaveOutlined />}
              >
                Save Budget
              </Button>
              <Button onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      ) : (
        <div style={{ padding: '10px 0' }}>
          {hasBudget ? (
            <div>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <Text strong>Total Budget:</Text>
                  <Text>{formatCurrency(project.budget, project.budgetCurrency)}</Text>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <Text strong>Budget Spent:</Text>
                  <Text>{formatCurrency(project.budgetSpent, project.budgetCurrency)}</Text>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <Text strong>Remaining Budget:</Text>
                  <Text type={getBudgetStatus() === 'exception' ? 'danger' : 'success'}>
                    {formatCurrency(
                      (project.budget || 0) - (project.budgetSpent || 0), 
                      project.budgetCurrency
                    )}
                  </Text>
                </div>
                
                <div style={{ marginTop: '10px' }}>
                  <Text strong>Budget Utilization:</Text>
                  <Progress 
                    percent={getBudgetPercentage()} 
                    status={getBudgetStatus() === 'warning' ? 'normal' : getBudgetStatus() as "success" | "exception" | "normal" | undefined}
                    format={percent => `${percent?.toFixed(1)}%`}
                  />
                </div>
                
                {getBudgetStatus() === 'exception' && (
                  <div style={{ marginTop: '10px' }}>
                    <Text type="danger">Budget exceeded! Consider reviewing project expenses.</Text>
                  </div>
                )}
                
                {getBudgetStatus() === 'warning' && (
                  <div style={{ marginTop: '10px' }}>
                    <Text type="warning">Budget usage is high. Monitor expenses closely.</Text>
                  </div>
                )}
              </Space>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <DollarOutlined style={{ fontSize: '24px', color: '#bfbfbf', marginBottom: '10px' }} />
              <p>No budget information added for this project.</p>
              <p>Click &quot;Add Budget&quot; to set budget details.</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default ProjectBudgetManager; 