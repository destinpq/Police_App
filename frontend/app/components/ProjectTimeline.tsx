import React from 'react';
import { Timeline, Card, Tag, Progress, Typography, Space } from 'antd';
import { Project, ProjectStatus } from '../types/project';
import { CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface ProjectTimelineProps {
  project: Project;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ project }) => {
  // Helper function to determine timeline item color
  const getTimelineColor = (status?: ProjectStatus) => {
    if (!status) return 'gray';
    
    switch (status) {
      case ProjectStatus.NOT_STARTED:
        return 'gray';
      case ProjectStatus.IN_PROGRESS:
        return 'blue';
      case ProjectStatus.ON_HOLD:
        return 'orange';
      case ProjectStatus.COMPLETED:
        return 'green';
      case ProjectStatus.DELAYED:
        return 'red';
      default:
        return 'gray';
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

  // Format date to readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate days remaining or days overdue
  const calculateDaysRemaining = () => {
    if (!project.endDate) return null;
    
    const today = new Date();
    const endDate = new Date(project.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return { days: diffDays, overdue: false };
    } else {
      return { days: Math.abs(diffDays), overdue: true };
    }
  };

  const daysInfo = calculateDaysRemaining();

  // Determine status icon
  const getStatusIcon = (status?: ProjectStatus) => {
    if (!status) return <ClockCircleOutlined />;
    
    switch (status) {
      case ProjectStatus.NOT_STARTED:
        return <ClockCircleOutlined />;
      case ProjectStatus.IN_PROGRESS:
        return <CalendarOutlined />;
      case ProjectStatus.ON_HOLD:
        return <WarningOutlined style={{ color: 'orange' }} />;
      case ProjectStatus.COMPLETED:
        return <CheckCircleOutlined style={{ color: 'green' }} />;
      case ProjectStatus.DELAYED:
        return <WarningOutlined style={{ color: 'red' }} />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  return (
    <Card title={<Title level={4}>Project Timeline</Title>} className="project-timeline-card">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Tag color={getTimelineColor(project.status)} icon={getStatusIcon(project.status)}>
            {formatStatus(project.status)}
          </Tag>
          
          {project.completionPercentage !== undefined && (
            <div style={{ width: '60%' }}>
              <Progress 
                percent={project.completionPercentage} 
                status={project.status === ProjectStatus.DELAYED ? 'exception' : 'active'}
              />
            </div>
          )}
        </div>

        {project.startDate && project.endDate && (
          <div style={{ marginBottom: 16 }}>
            <Text strong>Timeline: </Text>
            <Text>{formatDate(project.startDate)} - {formatDate(project.endDate)}</Text>
            
            {daysInfo && (
              <div style={{ marginTop: 8 }}>
                {daysInfo.overdue ? (
                  <Tag color="error">{daysInfo.days} days overdue</Tag>
                ) : (
                  <Tag color="processing">{daysInfo.days} days remaining</Tag>
                )}
              </div>
            )}
          </div>
        )}

        <Timeline
          mode="left"
          items={[
            {
              label: 'Project Created',
              color: 'gray',
              children: formatDate(project.createdAt)
            },
            {
              label: 'Project Started',
              color: project.startDate ? 'blue' : 'gray',
              children: project.startDate ? formatDate(project.startDate) : 'Not started yet'
            },
            {
              label: 'Current Progress',
              color: getTimelineColor(project.status),
              children: (
                <>
                  <div>{formatStatus(project.status)}</div>
                  {project.completionPercentage !== undefined && (
                    <div>{project.completionPercentage}% Complete</div>
                  )}
                </>
              )
            },
            {
              label: 'Expected Completion',
              color: project.status === ProjectStatus.COMPLETED ? 'green' : 
                    (daysInfo?.overdue ? 'red' : 'blue'),
              children: project.endDate ? formatDate(project.endDate) : 'Not set'
            }
          ]}
        />
      </Space>
    </Card>
  );
};

export default ProjectTimeline; 