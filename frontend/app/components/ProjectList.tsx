import React, { useEffect, useState } from 'react';
import { Project } from '../types/project';
import { ProjectService } from '../services/ProjectService';
import { Modal, Button, Popconfirm, message, List, Card, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import ProjectEditForm from './ProjectEditForm';

// Create a type for the list data that allows the special "All Projects" entry 
type ProjectListItem = Project | { id: number; name: string };

interface ProjectListProps {
  onSelectProject: (projectId: number) => void;
  selectedProjectId?: number;
  isAdmin: boolean;
  onProjectUpdated: () => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ 
  onSelectProject, 
  selectedProjectId,
  isAdmin,
  onProjectUpdated
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const fetchProjects = async () => {
    try {
      const data = await ProjectService.getAllProjects();
      setProjects(data);
      setLoading(false);
    } catch {
      setError('Failed to load projects');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the onClick of the list item
    setSelectedProject(project);
    setEditModalVisible(true);
  };

  const handleDelete = async (projectId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the onClick of the list item
    try {
      await ProjectService.deleteProject(projectId);
      message.success('Project deleted successfully');
      fetchProjects();
      onProjectUpdated();
      
      // If the deleted project was selected, reset to show all projects
      if (selectedProjectId === projectId) {
        onSelectProject(0);
      }
    } catch {
      message.error('Failed to delete project');
    }
  };

  const handleProjectUpdated = () => {
    fetchProjects();
    onProjectUpdated();
    setEditModalVisible(false);
  };

  // Function to check if an item is a full Project (type guard)
  const isProject = (item: ProjectListItem): item is Project => {
    return (item as Project).description !== undefined;
  };

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div className="error">{error}</div>;

  // Create data source with special All Projects item
  const dataSource: ProjectListItem[] = [
    { id: 0, name: 'All Projects' },
    ...projects
  ];

  return (
    <Card title="Projects" className="project-list">
      <div 
        className="project-list-scroll-container"
        style={{ 
          maxHeight: '60vh', 
          overflowY: 'auto',
          paddingRight: '4px' // Add some padding for the scrollbar
        }}
      >
        <List
          itemLayout="vertical"
          dataSource={dataSource}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              onClick={() => onSelectProject(item.id)}
              className={selectedProjectId === item.id ? 'ant-list-item-active' : ''}
              style={{ cursor: 'pointer' }}
              actions={item.id !== 0 && isProject(item) ? [
                isAdmin && (
                  <Space key="actions">
                    <Button 
                      type="text" 
                      icon={<EditOutlined />} 
                      onClick={(e) => handleEdit(item, e as React.MouseEvent)}
                    />
                    <Popconfirm
                      title="Delete Project"
                      description="Are you sure you want to delete this project?"
                      onConfirm={(e) => handleDelete(item.id, e as React.MouseEvent)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Popconfirm>
                  </Space>
                )
              ] : []}
            >
              <List.Item.Meta
                title={item.name}
                description={item.id !== 0 && isProject(item) && item.description}
              />
            </List.Item>
          )}
        />
      </div>

      <Modal
        title="Edit Project"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        {selectedProject && (
          <ProjectEditForm
            project={selectedProject}
            onProjectUpdated={handleProjectUpdated}
            onCancel={() => setEditModalVisible(false)}
          />
        )}
      </Modal>

      <style jsx>{`
        :global(.ant-list-item-active) {
          background-color: #e6f7ff;
        }
        :global(.project-list) {
          margin-bottom: 20px;
        }
        :global(.project-list .ant-card-body) {
          padding: 0;
        }
        :global(.project-list .ant-list-item) {
          padding: 12px 16px;
          border-bottom: 1px solid #f0f0f0;
        }
        :global(.project-list .ant-list-item:last-child) {
          border-bottom: none;
        }
        :global(.project-list .ant-list-item:hover) {
          background-color: #f5f5f5;
        }
        :global(.project-list .ant-list-item-active:hover) {
          background-color: #e6f7ff;
        }
        :global(.project-list-scroll-container) {
          scrollbar-width: thin;
          scrollbar-color: #bfbfbf #f0f0f0;
        }
        :global(.project-list-scroll-container::-webkit-scrollbar) {
          width: 6px;
        }
        :global(.project-list-scroll-container::-webkit-scrollbar-track) {
          background: #f0f0f0;
          border-radius: 3px;
        }
        :global(.project-list-scroll-container::-webkit-scrollbar-thumb) {
          background: #bfbfbf;
          border-radius: 3px;
        }
        :global(.project-list-scroll-container::-webkit-scrollbar-thumb:hover) {
          background: #999;
        }
        .error {
          color: red;
          padding: 10px;
          margin-bottom: 10px;
          background-color: rgba(255, 0, 0, 0.1);
          border-radius: 4px;
        }
      `}</style>
    </Card>
  );
};

export default ProjectList; 