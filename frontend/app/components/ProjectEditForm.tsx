import React, { useEffect, useState } from 'react';
import { Form, Input, Button } from 'antd';
import { Project, UpdateProjectDto } from '../types/project';
import { ProjectService } from '../services/ProjectService';

const { TextArea } = Input;

interface ProjectEditFormProps {
  project: Project;
  onProjectUpdated: () => void;
  onCancel: () => void;
}

const ProjectEditForm: React.FC<ProjectEditFormProps> = ({ 
  project, 
  onProjectUpdated, 
  onCancel 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    form.setFieldsValue({
      name: project.name,
      description: project.description
    });
  }, [project, form]);

  const handleSubmit = async (values: UpdateProjectDto) => {
    setLoading(true);
    setError(null);

    try {
      await ProjectService.updateProject(project.id, values);
      onProjectUpdated();
    } catch {
      setError('Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="project-edit-form">
      <h2>Edit Project</h2>
      {error && <div className="error">{error}</div>}
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

        <div className="button-group">
          <Button type="primary" htmlType="submit" loading={loading}>
            Update Project
          </Button>
          <Button onClick={onCancel} style={{ marginLeft: '10px' }}>
            Cancel
          </Button>
        </div>
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