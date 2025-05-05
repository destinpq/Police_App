import React, { useState } from 'react';
import { Button, Card, Form, DatePicker, Select, Slider, message, Popconfirm, Space } from 'antd';
import { DeleteOutlined, CalendarOutlined, SaveOutlined } from '@ant-design/icons';
import { ProjectService } from '../services/ProjectService';
import { Project, ProjectStatus, UpdateProjectDto } from '../types/project';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface ProjectTimelineManagerProps {
  project: Project;
  onProjectUpdated: (updatedProject: Project) => void;
}

const ProjectTimelineManager: React.FC<ProjectTimelineManagerProps> = ({ 
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
        status: project.status,
        completionPercentage: project.completionPercentage || 0,
        dateRange: project.startDate && project.endDate ? 
          [dayjs(project.startDate), dayjs(project.endDate)] : 
          undefined
      });
    }
  }, [project, form]);

  const handleSubmit = async (values: {
    status: ProjectStatus;
    completionPercentage: number;
    dateRange?: [dayjs.Dayjs, dayjs.Dayjs];
  }) => {
    try {
      setLoading(true);
      
      const { dateRange, ...projectData } = values;
      
      const projectDto: UpdateProjectDto = {
        ...projectData,
        startDate: dateRange?.[0] ? dateRange[0].toISOString() : undefined,
        endDate: dateRange?.[1] ? dateRange[1].toISOString() : undefined,
      };
      
      const updatedProject = await ProjectService.updateProject(project.id, projectDto);
      message.success('Timeline updated successfully!');
      onProjectUpdated(updatedProject);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update timeline:', error);
      message.error('Failed to update timeline. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTimeline = async () => {
    try {
      setLoading(true);
      
      // Update the project to remove timeline data
      const projectDto: UpdateProjectDto = {
        startDate: null,
        endDate: null,
        status: ProjectStatus.NOT_STARTED,
        completionPercentage: 0
      };
      
      const updatedProject = await ProjectService.updateProject(project.id, projectDto);
      message.success('Timeline removed successfully!');
      onProjectUpdated(updatedProject);
    } catch (error) {
      console.error('Failed to remove timeline:', error);
      message.error('Failed to remove timeline. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hasTimeline = Boolean(project.startDate && project.endDate);

  return (
    <Card 
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Project Timeline Manager</span>
          {!editing && (
            <Space>
              {hasTimeline && (
                <Popconfirm
                  title="Remove Timeline"
                  description="Are you sure you want to remove the project timeline?"
                  onConfirm={handleRemoveTimeline}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button 
                    danger
                    icon={<DeleteOutlined />}
                    loading={loading}
                  >
                    Remove Timeline
                  </Button>
                </Popconfirm>
              )}
              <Button 
                type="primary"
                onClick={() => setEditing(true)}
                icon={<CalendarOutlined />}
              >
                {hasTimeline ? 'Edit Timeline' : 'Add Timeline'}
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
            status: project.status || ProjectStatus.NOT_STARTED,
            completionPercentage: project.completionPercentage || 0,
            dateRange: project.startDate && project.endDate ? 
              [dayjs(project.startDate), dayjs(project.endDate)] : 
              undefined
          }}
        >
          <Form.Item
            name="status"
            label="Project Status"
            rules={[{ required: true, message: 'Please select project status' }]}
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
            rules={[{ required: true, message: 'Please select timeline dates' }]}
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
          
          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SaveOutlined />}
              >
                Save Timeline
              </Button>
              <Button onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          {hasTimeline ? (
            <div>
              <p>
                This project has a timeline from {new Date(project.startDate!).toLocaleDateString()} 
                to {new Date(project.endDate!).toLocaleDateString()}.
              </p>
              <p>
                Current status: {project.status.replace(/_/g, ' ').toLowerCase()
                  .split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </p>
              <p>
                Completion: {project.completionPercentage || 0}%
              </p>
            </div>
          ) : (
            <p>This project doesn&apos;t have a timeline yet. Click &quot;Add Timeline&quot; to create one.</p>
          )}
        </div>
      )}
    </Card>
  );
};

export default ProjectTimelineManager; 