import React, { useEffect, useState } from 'react';
import { Project, ProjectStatus } from '../types/project';
import { ProjectService } from '../services/ProjectService';
import { Modal, Button, Popconfirm, message, List, Card, Tag, Progress, Space, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import ProjectEditForm from './ProjectEditForm';

const { Text } = Typography;

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

  // Function to get tag color based on project status
  const getStatusTagColor = (status?: ProjectStatus) => {
    if (!status) return 'default';
    
    switch (status) {
      case ProjectStatus.NOT_STARTED:
        return 'default';
      case ProjectStatus.IN_PROGRESS:
        return 'processing';
      case ProjectStatus.ON_HOLD:
        return 'warning';
      case ProjectStatus.COMPLETED:
        return 'success';
      case ProjectStatus.DELAYED:
        return 'error';
      default:
        return 'default';
    }
  };

  // Format status text to be more readable
  const formatStatus = (status?: ProjectStatus) => {
    if (!status) return 'Unknown';
    
    return status.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Function to check if an item is a full Project (type guard)
  const isProject = (item: ProjectListItem): item is Project => {
    return (item as Project).status !== undefined;
  };

  // Format date to readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
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
              <Space key="dates">
                <CalendarOutlined />
                <Text>{item.startDate && item.endDate ? 
                  `${formatDate(item.startDate)} - ${formatDate(item.endDate)}` : 
                  'No dates set'}
                </Text>
              </Space>,
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
            {item.id !== 0 && isProject(item) && (
              <div>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    <Tag color={getStatusTagColor(item.status)}>
                      {formatStatus(item.status)}
                    </Tag>
                    {item.completionPercentage !== undefined && (
                      <Progress 
                        percent={item.completionPercentage} 
                        size="small" 
                        status={item.status === ProjectStatus.DELAYED ? 'exception' : 'active'}
                      />
                    )}
                  </Space>
                </Space>
              </div>
            )}
          </List.Item>
        )}
      />

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