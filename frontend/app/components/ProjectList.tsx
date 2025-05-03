import React, { useEffect, useState } from 'react';
import { Project } from '../types/project';
import { ProjectService } from '../services/ProjectService';
import { Modal, Button, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import ProjectEditForm from './ProjectEditForm';

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

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="project-list">
      <h2>Projects</h2>
      <ul>
        <li 
          className={!selectedProjectId ? 'active' : ''}
          onClick={() => onSelectProject(0)}
        >
          All Projects
        </li>
        {projects.map((project) => (
          <li 
            key={project.id} 
            className={selectedProjectId === project.id ? 'active' : ''}
          >
            <div className="project-item" onClick={() => onSelectProject(project.id)}>
              <span className="project-name">{project.name}</span>
              {isAdmin && (
                <div className="project-actions">
                  <Button 
                    type="text" 
                    icon={<EditOutlined />} 
                    size="small"
                    onClick={(e) => handleEdit(project, e)}
                  />
                  <Popconfirm
                    title="Delete Project"
                    description="Are you sure you want to delete this project?"
                    onConfirm={(e) => handleDelete(project.id, e as React.MouseEvent)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />} 
                      size="small"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Popconfirm>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

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
        .project-list {
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        h2 {
          font-size: 18px;
          margin-bottom: 10px;
        }
        ul {
          list-style-type: none;
          padding: 0;
        }
        li {
          padding: 8px 12px;
          cursor: pointer;
          margin-bottom: 5px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        li:hover {
          background-color: #e9e9e9;
        }
        li.active {
          background-color: #1890ff;
          color: white;
        }
        .error {
          color: red;
          padding: 10px;
        }
        .project-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .project-name {
          flex: 1;
        }
        .project-actions {
          opacity: 0.7;
        }
        .project-actions:hover {
          opacity: 1;
        }
        li.active .project-actions {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default ProjectList; 