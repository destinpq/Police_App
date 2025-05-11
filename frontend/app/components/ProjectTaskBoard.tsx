'use client';

import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Button, Drawer, message, Empty, Tabs } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { TaskService } from '../services/TaskService';
import { Task, CreateTaskDto, UpdateTaskDto } from '../types/task';
import { Project } from '../types/project';
import { TaskBoard } from './TaskBoard';
import { TaskForm } from './TaskForm';
import ProjectList from './ProjectList';
import ProjectForm from './ProjectForm';
import ProjectBudgetManager from './ProjectBudgetManager';
import MilestoneList from './MilestoneList';
import { ProjectService } from '../services/ProjectService';
import { useBreakpoint } from '../utils/responsive';

const { TabPane } = Tabs;

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
  const [activeTab, setActiveTab] = useState<string>('tasks');
  const [showProjectDrawer, setShowProjectDrawer] = useState<boolean>(false);
  
  // Get current breakpoint information
  const { isMobile, isTablet } = useBreakpoint();

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
      const project = await ProjectService.getProjectById(selectedProjectId);
      setSelectedProject(project);
    } catch (error) {
      console.error('Failed to fetch project details:', error);
      message.error('Failed to load project details');
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
    // On mobile, close the project drawer after selection
    if (isMobile || isTablet) {
      setShowProjectDrawer(false);
    }
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

  // Project list to show in sidebar or drawer
  const ProjectListComponent = (
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
  );

  // Responsive drawer width for forms
  const drawerWidth = isMobile ? '100%' : isTablet ? '70%' : 500;

  return (
    <div className="project-task-board">
      {/* Project drawer toggle for mobile and tablet */}
      {(isMobile || isTablet) && (
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '15px', 
            alignItems: 'center',
            padding: '0 5px'
          }}
        >
          <Button 
            icon={<MenuOutlined />} 
            onClick={() => setShowProjectDrawer(true)}
            style={{ marginRight: '10px' }}
          >
            Projects
          </Button>
          <h2 style={{ margin: 0, fontSize: isMobile ? '18px' : '24px' }}>
            {selectedProjectId 
              ? tasks.length > 0 && tasks[0].project 
                ? tasks[0].project.name 
                : (selectedProject ? selectedProject.name : 'Project')
              : 'All Tasks'
            }
          </h2>
        </div>
      )}

      <Row gutter={[16, 16]}>
        {/* Project list column - only visible on desktop */}
        {!isMobile && !isTablet && (
          <Col span={6}>
            {ProjectListComponent}
          </Col>
        )}

        {/* Main content column */}
        <Col span={isMobile || isTablet ? 24 : 18}>
          {/* Header with project title and create button - only for desktop */}
          {!isMobile && !isTablet && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
              <h2>
                {selectedProjectId 
                  ? `Project: ${tasks.length > 0 && tasks[0].project ? tasks[0].project.name : (selectedProject ? selectedProject.name : 'Project')}`
                  : 'All Tasks'
                }
              </h2>
              {currentUser.isAdmin && selectedProjectId && (
                <Button type="primary" onClick={handleCreateTask}>
                  Create Task
                </Button>
              )}
            </div>
          )}

          {/* Mobile create task button */}
          {(isMobile || isTablet) && currentUser.isAdmin && selectedProjectId && (
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="primary" onClick={handleCreateTask}>
                Create Task
              </Button>
            </div>
          )}
          
          {/* Project budget section */}
          {selectedProject && (
            <div style={{ marginBottom: '20px' }}>
              {currentUser.isAdmin && (
                <div style={{ marginTop: '20px' }}>
                  <ProjectBudgetManager 
                    project={selectedProject} 
                    onProjectUpdated={handleProjectUpdated} 
                  />
                </div>
              )}
            </div>
          )}

          {/* Tabs for Tasks and Milestones */}
          {selectedProjectId ? (
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              size={isMobile ? "small" : "middle"}
            >
              <TabPane tab="Tasks" key="tasks">
                <TaskBoard 
                  tasks={tasks}
                  loading={loading}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  refreshTasks={fetchTasks}
                  isAdmin={currentUser.isAdmin}
                />
              </TabPane>
              <TabPane tab="Milestones" key="milestones">
                <MilestoneList
                  projectId={selectedProjectId}
                  isAdmin={currentUser.isAdmin}
                />
              </TabPane>
            </Tabs>
          ) : (
            <>
              {!loading && tasks.length === 0 ? (
                <Empty 
                  description="No tasks available. Select a project or create a new task."
                  style={{ margin: '40px 0' }}
                />
              ) : (
                <TaskBoard 
                  tasks={tasks}
                  loading={loading}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  refreshTasks={fetchTasks}
                  isAdmin={currentUser.isAdmin}
                />
              )}
            </>
          )}
        </Col>
      </Row>

      {/* Drawer for projects on mobile/tablet */}
      <Drawer
        title="Projects"
        placement="left"
        width={isMobile ? '80%' : '50%'}
        onClose={() => setShowProjectDrawer(false)}
        open={showProjectDrawer}
      >
        {ProjectListComponent}
      </Drawer>

      {/* Task form drawer */}
      <Drawer
        title={selectedTask ? 'Edit Task' : 'Create Task'}
        placement="right"
        width={drawerWidth}
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