import React, { useState } from 'react';
import { CreateProjectDto } from '../types/project';
import { ProjectService } from '../services/ProjectService';

interface ProjectFormProps {
  onProjectAdded: () => void;
  currentUser: { isAdmin: boolean };
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onProjectAdded, currentUser }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Only admins can add projects
  if (!currentUser || !currentUser.isAdmin) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!name.trim() || !description.trim()) {
      setError('Name and description are required');
      setLoading(false);
      return;
    }

    const newProject: CreateProjectDto = {
      name: name.trim(),
      description: description.trim(),
    };

    try {
      await ProjectService.createProject(newProject);
      setName('');
      setDescription('');
      onProjectAdded();
      setLoading(false);
    } catch {
      setError('Failed to create project');
      setLoading(false);
    }
  };

  return (
    <div className="project-form">
      <h2>Add New Project</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Project Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter project name"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter project description"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Project'}
        </button>
      </form>
      <style jsx>{`
        .project-form {
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        h2 {
          font-size: 18px;
          margin-bottom: 15px;
        }
        .form-group {
          margin-bottom: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        input, textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        textarea {
          min-height: 80px;
          resize: vertical;
        }
        button {
          background-color: #1890ff;
          color: white;
          border: none;
          padding: 8px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        button:hover {
          background-color: #40a9ff;
        }
        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
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

export default ProjectForm; 