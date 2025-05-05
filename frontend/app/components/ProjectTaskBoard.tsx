'use client';

import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Button, Drawer, message, Empty, Space } from 'antd';
import { TaskService } from '../services/TaskService';
import { Task, CreateTaskDto, UpdateTaskDto } from '../types/task';
import { Project } from '../types/project';
import { TaskBoard } from './TaskBoard';
import { TaskForm } from './TaskForm';
import ProjectList from './ProjectList';
import ProjectForm from './ProjectForm';
import ProjectTimeline from './ProjectTimeline';
import ProjectTimelineManager from './ProjectTimelineManager';
import ProjectBudgetManager from './ProjectBudgetManager';
import { ProjectService } from '../services/ProjectService';

interface ProjectTaskBoardProps {
  currentUser: {
    id: number;
    email: string;
    isAdmin: boolean;
  };
}

const ProjectTaskBoard = ({ currentUser }: ProjectTaskBoardProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
  const [projectListUpdated, setProjectListUpdated] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loadingProject, setLoadingProject] = useState<boolean>(false);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      let taskData: Task[];
      
      if (selectedProjectId) {
        taskData = await TaskService.getTasksByProject(selectedProjectId);
      } else {
        taskData = await TaskService.getAllTasks();
      }
      
      setTasks(taskData);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      message.error('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  const fetchSelectedProject = useCallback(async () => {
    if (!selectedProjectId) {
      setSelectedProject(null);
      return;
    }

    try {
      setLoadingProject(true);
      const project = await ProjectService.getProjectById(selectedProjectId);
      setSelectedProject(project);
    } catch (error) {
      console.error('Failed to fetch project details:', error);
      message.error('Failed to load project details');
    } finally {
      setLoadingProject(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    fetchTasks();
    if (selectedProjectId) {
      fetchSelectedProject();
    } else {
      setSelectedProject(null);
    }
  }, [fetchTasks, fetchSelectedProject, selectedProjectId, projectListUpdated]);

  const handleProjectSelect = (projectId: number) => {
    setSelectedProjectId(projectId === 0 ? undefined : projectId);
  };

  const handleCreateTask = () => {
    setSelectedTask(undefined);
    setShowTaskForm(true);
  };

  const handleEditTask = (task: Task) => {
    if (!currentUser.isAdmin) {
      message.info('Only administrators can edit tasks');
      return;
    }
    setSelectedTask(task);
    setShowTaskForm(true);
  };

  const handleTaskFormSubmit = async (taskData: CreateTaskDto | UpdateTaskDto) => {
    try {
      if ('id' in taskData && taskData.id) {
        await TaskService.updateTask(taskData.id, taskData);
        message.success('Task updated successfully');
      } else {
        await TaskService.createTask(taskData as CreateTaskDto);
        message.success('Task created successfully');
      }
      setShowTaskForm(false);
      fetchTasks();
    } catch (error) {
      console.error('Failed to save task:', error);
      message.error('Failed to save task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!currentUser.isAdmin) {
      message.info('Only administrators can delete tasks');
      return;
    }
    
    try {
      await TaskService.deleteTask(taskId);
      message.success('Task deleted successfully');
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
      message.error('Failed to delete task. Please try again.');
    }
  };

  const handleProjectAdded = () => {
    setProjectListUpdated(prev => !prev);
    message.success('Project added successfully');
  };

  const handleProjectUpdated = () => {
    setProjectListUpdated(prev => !prev);
  };

  return (
    <div className="project-task-board">
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <div style={{ marginBottom: '20px' }}>
            <ProjectList 
              onSelectProject={handleProjectSelect} 
              selectedProjectId={selectedProjectId}
              isAdmin={currentUser.isAdmin}
              onProjectUpdated={handleProjectUpdated}
            />
            {currentUser.isAdmin && (
              <ProjectForm 
                onProjectAdded={handleProjectAdded} 
                currentUser={currentUser}
              />
            )}
          </div>
        </Col>

        <Col span={18}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
            <h2>
              {selectedProjectId 
                ? `Tasks for ${tasks.length > 0 && tasks[0].project ? tasks[0].project.name : (selectedProject ? selectedProject.name : 'Project')}`
                : 'All Tasks'
              }
            </h2>
            {currentUser.isAdmin && (
              <Button type="primary" onClick={handleCreateTask}>
                Create Task
              </Button>
            )}
          </div>
          
          {selectedProject && (
            <div style={{ marginBottom: '20px' }}>
              <ProjectTimeline project={selectedProject} />
              
              {currentUser.isAdmin && (
                <div style={{ marginTop: '20px' }}>
                  <ProjectTimelineManager 
                    project={selectedProject} 
                    onProjectUpdated={handleProjectUpdated} 
                  />
                  
                  <div style={{ marginTop: '20px' }}>
                    <ProjectBudgetManager 
                      project={selectedProject} 
                      onProjectUpdated={handleProjectUpdated} 
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          
          {!selectedProjectId && !loading && tasks.length === 0 && (
            <Empty 
              description="No tasks available. Select a project or create a new task."
              style={{ margin: '40px 0' }}
            />
          )}

          <TaskBoard 
            tasks={tasks}
            loading={loading}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            refreshTasks={fetchTasks}
            isAdmin={currentUser.isAdmin}
          />
        </Col>
      </Row>

      <Drawer
        title={selectedTask ? 'Edit Task' : 'Create Task'}
        placement="right"
        width={500}
        onClose={() => setShowTaskForm(false)}
        open={showTaskForm}
      >
        <TaskForm
          task={selectedTask}
          isAdmin={currentUser.isAdmin}
          onSubmit={handleTaskFormSubmit}
          onCancel={() => setShowTaskForm(false)}
        />
      </Drawer>
    </div>
  );
};

export default ProjectTaskBoard; 