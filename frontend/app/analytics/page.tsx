'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, Statistic, Typography, Alert, Layout, Tag, Select, Button, Divider } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, BarChart, Bar, CartesianGrid } from 'recharts';
import { getAuthHeaders } from '../services/AuthService';
import { useRouter } from 'next/navigation';
import { AuthService } from '../services/AuthService';
import { User } from '../types/user';
import MainHeader from '../components/MainHeader';
import { 
  UserOutlined, 
  TeamOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  FileOutlined,
  TrophyOutlined,
  LockOutlined,
  StarFilled,
  StarOutlined,
  FieldTimeOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { API_BASE_URL } from '../config';

const { Title } = Typography;
const { Content } = Layout;

// Add these style constants at the top level to prevent re-renders
const solidTitleStyle = { 
  margin: '0 0 24px', 
  color: '#4158D0',
  display: 'inline-block'
};

// More readable solid color definitions to replace gradients
const PROJECT_COLORS = {
  primary: '#4158D0',
  secondary: '#0093E9', 
  accent: '#8EC5FC',
  success: '#43A047',
  warning: '#FB8C00',
  danger: '#E53935',
};

interface UserStats {
  userId: number;
  userEmail: string;
  totalTasks: number;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksOpen: number;
  completionRate: number;
  
  // New accuracy metrics (admin-rated)
  accuracyScore: number; // 0-100 score assigned by admin
  qualityRating: number; // 1-5 stars rating
  
  // Time-based metrics
  avgCompletionTime: number; // in hours
  timeEfficiency: number; // percentage (100% means on time, <100% means faster than expected)
  onTimeCompletionRate: number; // percentage of tasks completed on time
}

interface ProjectStats {
  projectId: number;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  openTasks: number;
  completionRate: number;
}

// Add interfaces for random metrics to fix hydration issues
interface ProjectMetrics {
  [key: string]: {
    velocity: string;
    deadlineCompliance: {
      value: number;
      success: boolean;
    };
    efficiencyScore: string;
  }
}

interface TimelineData {
  [key: string]: {
    data: Array<{
      date: string;
      completed: number;
      added: number;
    }>;
  }
}

interface MonthlyData {
  data: Array<{
    month: string;
    [key: string]: number | string;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [currentUserStats, setCurrentUserStats] = useState<UserStats | null>(null);
  const [projectStats, setProjectStats] = useState<ProjectStats[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserStats, setSelectedUserStats] = useState<UserStats | null>(null);
  
  // Add state for random metrics to fix hydration warnings
  const [projectMetrics, setProjectMetrics] = useState<ProjectMetrics>({});
  const [timelineData, setTimelineData] = useState<TimelineData>({});
  const [monthlyData, setMonthlyData] = useState<MonthlyData>({ data: [] });
  
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const user = AuthService.getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(user);

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const options = getAuthHeaders();
        
        // Get current user stats
        const currentUserResponse = await fetch(`${API_BASE_URL}/analytics/current-user`, options);
        
        if (!currentUserResponse.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        
        const currentUserData = await currentUserResponse.json();
        setCurrentUserStats(currentUserData);
        
        // Try to get all user stats and project stats (only for admin)
        if (user.isAdmin) {
          try {
            const [allUsersResponse, projectsResponse] = await Promise.all([
              fetch(`${API_BASE_URL}/analytics`, options),
              fetch(`${API_BASE_URL}/analytics/projects`, options)
            ]);
            
            if (allUsersResponse.ok) {
              const allUsersData = await allUsersResponse.json();
              setUserStats(allUsersData);
            }
            
            if (projectsResponse.ok) {
              const projectsData = await projectsResponse.json();
              setProjectStats(projectsData || []);
            } else {
              // Mock project data if endpoint doesn't exist yet
              setProjectStats([
                {
                  projectId: 1,
                  projectName: 'Website Redesign',
                  totalTasks: 10,
                  completedTasks: 5,
                  inProgressTasks: 3,
                  openTasks: 2,
                  completionRate: 0.5
                },
                {
                  projectId: 2,
                  projectName: 'Mobile App Development',
                  totalTasks: 15,
                  completedTasks: 2,
                  inProgressTasks: 8,
                  openTasks: 5,
                  completionRate: 0.13
                },
                {
                  projectId: 3,
                  projectName: 'Marketing Campaign',
                  totalTasks: 8,
                  completedTasks: 6,
                  inProgressTasks: 1,
                  openTasks: 1,
                  completionRate: 0.75
                },
                {
                  projectId: 4,
                  projectName: 'Internal Tools',
                  totalTasks: 12,
                  completedTasks: 8,
                  inProgressTasks: 2,
                  openTasks: 2,
                  completionRate: 0.67
                }
              ]);
            }
          } catch {
            console.log('Additional analytics endpoints not available or error occurred');
          }
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [router]);
  
  const fetchUserStats = async (userId: number) => {
    try {
      setLoading(true);
      const options = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/analytics/user/${userId}`, options);
      
      if (response.ok) {
        const userData = await response.json();
        setSelectedUserStats(userData);
      } else {
        console.error('Failed to fetch user analytics');
      }
    } catch (error) {
      console.error('Error fetching user analytics:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (selectedUserId) {
      fetchUserStats(selectedUserId);
    } else {
      setSelectedUserStats(null);
    }
  }, [selectedUserId]);
  
  // Initialize random metrics after component mounts
  useEffect(() => {
    // Only initialize metrics if projectStats exists AND we haven't initialized metrics yet
    if (projectStats.length > 0 && Object.keys(projectMetrics).length === 0) {
      // Create empty objects for metrics without triggering re-renders
      const metrics: ProjectMetrics = {};
      const timeline: TimelineData = {};
      
      // Initialize with empty data once
      setProjectMetrics(metrics);
      setTimelineData(timeline);
      setMonthlyData({ data: [] });
    }
  // We intentionally omit projectMetrics from the dependency array to avoid infinite loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectStats]);

  const getChartData = (stats: UserStats | ProjectStats) => {
    return [
      { name: 'Open', value: 'tasksOpen' in stats ? stats.tasksOpen : stats.openTasks },
      { name: 'In Progress', value: 'tasksInProgress' in stats ? stats.tasksInProgress : stats.inProgressTasks },
      { name: 'Completed', value: 'tasksCompleted' in stats ? stats.tasksCompleted : stats.completedTasks },
    ];
  };
  
  // Generate data for charts based only on actual values
  const getMonthlyCompletionData = () => {
    // If we don't have real data, return empty array rather than generating fake data
    if (!currentUserStats) {
      return [];
    }
    
    // Return empty array or in the future, real historical completion data from backend
    return [];
  };
  
  // Helper to render star ratings
  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarFilled key={`full-${i}`} style={{ color: '#fadb14', fontSize: '18px' }} />);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<StarFilled key="half" style={{ color: '#fadb14', fontSize: '18px' }} />);
    }
    
    // Add empty stars
    for (let i = Math.ceil(rating); i < 5; i++) {
      stars.push(<StarOutlined key={`empty-${i}`} style={{ color: '#fadb14', fontSize: '18px' }} />);
    }
    
    return <div>{stars}</div>;
  };
  
  if (!currentUser) {
    return null;
  }
  
  const loadingContent = (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <div style={{ background: 'rgba(0, 0, 0, 0.05)', padding: '50px', borderRadius: '4px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '20px', color: '#666' }}>Loading analytics...</div>
      </div>
    </div>
  );
  
  const renderUserAnalytics = () => (
    <>
      <Title level={3} style={{ marginBottom: '20px' }}>
        <UserOutlined style={{ marginRight: '8px' }} />
        Your Performance Dashboard
      </Title>
      
      {currentUserStats ? (
        <>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Total Tasks" 
                  value={currentUserStats.totalTasks} 
                  prefix={<FileOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Tasks Completed" 
                  value={currentUserStats.tasksCompleted} 
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Tasks In Progress" 
                  value={currentUserStats.tasksInProgress} 
                  prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Completion Rate" 
                  value={Math.round(currentUserStats.completionRate * 100)} 
                  suffix="%" 
                  prefix={<TrophyOutlined style={{ color: '#fa8c16' }} />}
                />
              </Card>
            </Col>
          </Row>
          
          <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
            <Col span={12}>
              <Card title="Task Status Distribution">
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getChartData(currentUserStats)}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : null}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={3}
                      >
                        {getChartData(currentUserStats).map((entry, index) => (
                          <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => Number(value) > 0 ? value : `0`} />
                      <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        wrapperStyle={{
                          paddingTop: "20px"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Your Monthly Productivity">
                <div style={{ height: 300 }}>
                  {getMonthlyCompletionData().length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={getMonthlyCompletionData()}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 20,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" />
                        <YAxis width={30} />
                        <Tooltip />
                        <Legend wrapperStyle={{ bottom: 0, left: 25 }} />
                        <Line 
                          type="monotone" 
                          dataKey="Tasks" 
                          stroke="#8884d8"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ 
                      height: '100%', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      flexDirection: 'column',
                      color: '#999',
                      background: '#f5f5f5',
                      borderRadius: '4px'
                    }}>
                      <FileOutlined style={{ fontSize: '32px', marginBottom: '16px' }} />
                      <p>No historical data available</p>
                      <p style={{ fontSize: '12px' }}>Complete more tasks to generate productivity data</p>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
            <Col span={12}>
              <Card title={
                <span>
                  <SafetyOutlined style={{ marginRight: '5px' }} />
                  Accuracy & Quality
                </span>
              }>
                <div style={{ padding: '10px 0' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Accuracy Score:</span>
                      <span style={{ 
                        fontWeight: 'bold',
                        fontSize: '16px',
                        color: currentUserStats.accuracyScore >= 90 ? '#52c41a' : 
                               currentUserStats.accuracyScore >= 70 ? '#faad14' : '#f5222d'
                      }}>
                        {currentUserStats.accuracyScore}/100
                      </span>
                    </div>
                    <div style={{ 
                      height: '10px', 
                      background: '#f0f0f0', 
                      borderRadius: '5px', 
                      marginTop: '5px' 
                    }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${currentUserStats.accuracyScore}%`, 
                        background: currentUserStats.accuracyScore >= 90 ? '#52c41a' : 
                                   currentUserStats.accuracyScore >= 70 ? '#faad14' : '#f5222d',
                        borderRadius: '5px',
                        transition: 'width 1s ease-in-out'
                      }} />
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Quality Rating:</span>
                      <span>{renderStarRating(currentUserStats.qualityRating)}</span>
                    </div>
                  </div>
                  
                  <div style={{ 
                    marginTop: '15px', 
                    fontSize: '12px', 
                    color: '#888', 
                    fontStyle: 'italic',
                    textAlign: 'center'
                  }}>
                    Accuracy metrics are assessed by admin based on task quality
                  </div>
                </div>
              </Card>
            </Col>
            
            <Col span={12}>
              <Card title={
                <span>
                  <FieldTimeOutlined style={{ marginRight: '5px' }} />
                  Time Performance
                </span>
              }>
                <div style={{ padding: '10px 0' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Average Completion Time:</span>
                      <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                        {currentUserStats.avgCompletionTime} hours
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Time Efficiency:</span>
                      <span style={{ 
                        fontWeight: 'bold',
                        fontSize: '16px',
                        color: currentUserStats.timeEfficiency >= 90 ? '#52c41a' : 
                               currentUserStats.timeEfficiency >= 70 ? '#faad14' : '#f5222d'
                      }}>
                        {currentUserStats.timeEfficiency}%
                      </span>
                    </div>
                    <div style={{ 
                      height: '10px', 
                      background: '#f0f0f0', 
                      borderRadius: '5px', 
                      marginTop: '5px' 
                    }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${currentUserStats.timeEfficiency}%`, 
                        background: currentUserStats.timeEfficiency >= 90 ? '#52c41a' : 
                                   currentUserStats.timeEfficiency >= 70 ? '#faad14' : '#f5222d',
                        borderRadius: '5px',
                        transition: 'width 1s ease-in-out'
                      }} />
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>On-Time Completion Rate:</span>
                      <span style={{ 
                        fontWeight: 'bold',
                        fontSize: '16px',
                        color: currentUserStats.onTimeCompletionRate >= 0.9 ? '#52c41a' : 
                               currentUserStats.onTimeCompletionRate >= 0.7 ? '#faad14' : '#f5222d'
                      }}>
                        {Math.round(currentUserStats.onTimeCompletionRate * 100)}%
                      </span>
                    </div>
                    <div style={{ 
                      height: '10px', 
                      background: '#f0f0f0', 
                      borderRadius: '5px', 
                      marginTop: '5px' 
                    }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${currentUserStats.onTimeCompletionRate * 100}%`, 
                        background: currentUserStats.onTimeCompletionRate >= 0.9 ? '#52c41a' : 
                                   currentUserStats.onTimeCompletionRate >= 0.7 ? '#faad14' : '#f5222d',
                        borderRadius: '5px',
                        transition: 'width 1s ease-in-out'
                      }} />
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <Alert 
          message="No data available" 
          description="Your personal analytics data is not available at this time." 
          type="info" 
        />
      )}
    </>
  );
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <MainHeader currentUser={currentUser} />
      <Content style={{ padding: '20px' }}>
        <Title level={2}>Task Analytics Dashboard</Title>
        
        {loading ? loadingContent : (
          <>
            {/* Change the layout for admin users to prioritize organization view */}
            {currentUser.isAdmin ? (
              <>
                {/* Organization Analytics Section */}
                <Title level={3} style={{ marginBottom: '20px' }}>
                  <TeamOutlined style={{ marginRight: '8px' }} />
                  Team Performance Dashboard
                  <Tag color="gold" style={{ marginLeft: '10px' }}>
                    <LockOutlined /> Admin Only
                  </Tag>
                </Title>

                {/* Team Overview - Show Combined Performance */}
                <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Total Team Members" 
                        value={6} 
                        prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Total Tasks" 
                        value={userStats.reduce((sum, user) => sum + user.totalTasks, 0) || 0} 
                        prefix={<FileOutlined style={{ color: '#52c41a' }} />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Tasks Completed" 
                        value={userStats.reduce((sum, user) => sum + user.tasksCompleted, 0) || 0} 
                        prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Team Completion Rate" 
                        value={
                          userStats.length > 0 
                            ? Math.round(
                                (userStats.reduce((sum, user) => sum + user.tasksCompleted, 0) / 
                                userStats.reduce((sum, user) => sum + user.totalTasks, 0)) * 100
                              ) || 0
                            : 0
                        } 
                        suffix="%" 
                        prefix={<TrophyOutlined style={{ color: '#fa8c16' }} />}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* Project Analysis Section - ENHANCED VERSION */}
                <div style={{ 
                  padding: '20px', 
                  borderRadius: '12px', 
                  background: 'rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  marginBottom: '40px'
                }}>
                  <Title level={3} style={solidTitleStyle}>
                    <FileOutlined style={{ marginRight: '12px' }} />
                    Project Analytics Dashboard
                  </Title>

                  {/* Project Summary Cards */}
                  <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
                    <Col span={6}>
                      <Card 
                        style={{ 
                          borderRadius: '12px', 
                          overflow: 'hidden',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
                        }}
                        styles={{ 
                          body: { padding: '16px' },
                          header: {
                            background: PROJECT_COLORS.primary,
                            color: 'white'
                          }
                        }}
                        title={<span style={{ color: 'white' }}>Projects Overview</span>}
                      >
                        <Statistic 
                          title="Total Projects" 
                          value={projectStats.length} 
                          prefix={<FileOutlined />}
                          valueStyle={{ color: PROJECT_COLORS.primary }}
                        />
                        <div style={{ marginTop: '16px' }}>
                          <Statistic 
                            title="Avg. Completion Rate" 
                            value={
                              projectStats.length > 0 
                                ? Math.round(projectStats.reduce((acc, p) => acc + p.completionRate, 0) / projectStats.length * 100) 
                                : 0
                            } 
                            suffix="%" 
                            valueStyle={{ color: PROJECT_COLORS.secondary }}
                          />
                        </div>
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card 
                        style={{ 
                          borderRadius: '12px', 
                          overflow: 'hidden',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
                        }}
                        styles={{ 
                          body: { padding: '16px' },
                          header: {
                            background: PROJECT_COLORS.secondary,
                            color: 'white'
                          }
                        }}
                        title={<span style={{ color: 'white' }}>Task Distribution</span>}
                      >
                        <Row gutter={[8, 16]}>
                          <Col span={8}>
                            <Statistic 
                              title="Open" 
                              value={projectStats.reduce((acc, p) => acc + p.openTasks, 0)}
                              valueStyle={{ fontSize: '18px', color: '#FFBB28' }}
                            />
                          </Col>
                          <Col span={8}>
                            <Statistic 
                              title="In Progress" 
                              value={projectStats.reduce((acc, p) => acc + p.inProgressTasks, 0)}
                              valueStyle={{ fontSize: '18px', color: '#0088FE' }}
                            />
                          </Col>
                          <Col span={8}>
                            <Statistic 
                              title="Completed" 
                              value={projectStats.reduce((acc, p) => acc + p.completedTasks, 0)}
                              valueStyle={{ fontSize: '18px', color: '#00C49F' }}
                            />
                          </Col>
                        </Row>
                        <div style={{ height: 120, marginTop: '16px' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { 
                                    name: 'Open', 
                                    value: projectStats.reduce((acc, p) => acc + p.openTasks, 0) 
                                  },
                                  { 
                                    name: 'In Progress', 
                                    value: projectStats.reduce((acc, p) => acc + p.inProgressTasks, 0) 
                                  },
                                  { 
                                    name: 'Completed', 
                                    value: projectStats.reduce((acc, p) => acc + p.completedTasks, 0) 
                                  },
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={50}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                              >
                                <Cell fill="#FFBB28" /> {/* Open */}
                                <Cell fill="#0088FE" /> {/* In Progress */}
                                <Cell fill="#00C49F" /> {/* Completed */}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card 
                        style={{ 
                          borderRadius: '12px', 
                          overflow: 'hidden',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          height: '100%'
                        }}
                        styles={{ 
                          body: { padding: '16px' },
                          header: {
                            background: PROJECT_COLORS.accent,
                            color: 'white'
                          }
                        }}
                        title={<span style={{ color: 'white' }}>Projects Performance Ranking</span>}
                      >
                        {projectStats.length > 0 ? (
                          <div style={{ height: 180 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={[...projectStats].sort((a, b) => b.completionRate - a.completionRate)}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                              >
                                <XAxis type="number" domain={[0, 1]} tickFormatter={(value) => `${Math.round(value * 100)}%`} />
                                <YAxis dataKey="projectName" type="category" width={150} />
                                <Tooltip formatter={(value) => Number(value) > 0 ? value : `0`} />
                                <Bar dataKey="completionRate" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                  {projectStats.map((entry) => (
                                    <Cell 
                                      key={`cell-${entry.projectId}`} 
                                      fill={PROJECT_COLORS.primary}
                                    />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <Alert
                            message="No project data available"
                            description="Create projects and assign tasks to them to view project performance rankings."
                            type="info"
                          />
                        )}
                      </Card>
                    </Col>
                  </Row>

                  {/* Detailed Project Cards */}
                  <Row gutter={[24, 24]}>
                    {projectStats.length > 0 ? (
                      projectStats.map(project => (
                        <Col span={8} key={project.projectId}>
                          <Card 
                            style={{ 
                              borderRadius: '12px', 
                              overflow: 'hidden',
                              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                              border: '1px solid #f0f0f0',
                              height: '100%'
                            }}
                            cover={
                              <div 
                                style={{ 
                                  padding: '20px', 
                                  background: PROJECT_COLORS.primary,
                                  color: 'white',
                                  position: 'relative',
                                  overflow: 'hidden'
                                }}
                              >
                                <div style={{ 
                                  position: 'absolute', 
                                  top: 0, 
                                  right: 0, 
                                  padding: '4px 12px',
                                  background: project.completionRate >= 0.7 ? PROJECT_COLORS.success : 
                                            project.completionRate >= 0.4 ? PROJECT_COLORS.warning : 
                                            PROJECT_COLORS.danger,
                                  color: 'white',
                                  borderBottomLeftRadius: '8px'
                                }}>
                                  {Math.round(project.completionRate * 100)}% Complete
                                </div>
                                <h3 style={{ 
                                  color: 'white', 
                                  margin: '0 0 8px', 
                                  fontSize: '20px', 
                                  fontWeight: 'bold',
                                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}>
                                  {project.projectName}
                                </h3>
                                <div style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between',
                                  color: 'rgba(255, 255, 255, 0.9)'
                                }}>
                                  <span>Total Tasks: {project.totalTasks}</span>
                                  <span>ID: {project.projectId}</span>
                                </div>
                                
                                {/* Progress Bar */}
                                <div style={{ 
                                  height: '8px', 
                                  background: 'rgba(255,255,255,0.3)', 
                                  borderRadius: '4px',
                                  margin: '16px 0 0',
                                  overflow: 'hidden'
                                }}>
                                  <div style={{ 
                                    height: '100%', 
                                    width: `${project.completionRate * 100}%`,
                                    background: 'white',
                                    borderRadius: '4px',
                                    transition: 'width 1s ease-in-out'
                                  }} />
                                </div>
                              </div>
                            }
                          >
                            <Row gutter={[16, 16]}>
                              <Col span={8}>
                                <Statistic 
                                  title="Open" 
                                  value={project.openTasks} 
                                  valueStyle={{ fontSize: '16px', color: '#FFBB28' }}
                                />
                              </Col>
                              <Col span={8}>
                                <Statistic 
                                  title="In Progress" 
                                  value={project.inProgressTasks} 
                                  valueStyle={{ fontSize: '16px', color: '#0088FE' }}
                                />
                              </Col>
                              <Col span={8}>
                                <Statistic 
                                  title="Completed" 
                                  value={project.completedTasks} 
                                  valueStyle={{ fontSize: '16px', color: '#00C49F' }}
                                />
                              </Col>
                            </Row>
                            
                            <Divider style={{ margin: '16px 0' }} />
                            
                            {/* Project Metrics */}
                            <div style={{ marginBottom: '16px' }}>
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                marginBottom: '8px'
                              }}>
                                <span>Velocity:</span>
                                <span style={{ fontWeight: 'bold' }}>
                                  {projectMetrics[project.projectId]?.velocity || "0.0"} tasks/week
                                </span>
                              </div>
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                marginBottom: '8px'
                              }}>
                                <span>Deadline Compliance:</span>
                                <span style={{ 
                                  fontWeight: 'bold',
                                  color: projectMetrics[project.projectId]?.deadlineCompliance.success 
                                    ? '#4CAF50' : '#F44336'
                                }}>
                                  {projectMetrics[project.projectId]?.deadlineCompliance.value || 0}%
                                </span>
                              </div>
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between'
                              }}>
                                <span>Efficiency Score:</span>
                                <span style={{ fontWeight: 'bold' }}>
                                  {projectMetrics[project.projectId]?.efficiencyScore || "0.0"}/10
                                </span>
                              </div>
                            </div>
                            
                            {/* Task Completion Timeline */}
                            <h4 style={{ margin: '16px 0 12px' }}>Completion Trend</h4>
                            <div style={{ height: 120 }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                  data={timelineData[project.projectId]?.data || []}
                                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                                >
                                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                  <YAxis tick={{ fontSize: 10 }} width={20} />
                                  <Tooltip />
                                  <Line 
                                    type="monotone" 
                                    dataKey="completed" 
                                    stroke="#00C49F" 
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 5 }}
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="added" 
                                    stroke="#FF8042" 
                                    strokeWidth={2}
                                    strokeDasharray="3 3"
                                    dot={{ r: 3 }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                            
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'center',
                              marginTop: '16px'
                            }}>
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                marginRight: '16px'
                              }}>
                                <div style={{ 
                                  width: '10px', 
                                  height: '10px', 
                                  background: '#00C49F',
                                  borderRadius: '50%',
                                  marginRight: '4px'
                                }} />
                                <span style={{ fontSize: '12px' }}>Completed</span>
                              </div>
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center' 
                              }}>
                                <div style={{ 
                                  width: '10px', 
                                  height: '10px', 
                                  background: '#FF8042',
                                  borderRadius: '50%',
                                  marginRight: '4px'
                                }} />
                                <span style={{ fontSize: '12px' }}>New Tasks</span>
                              </div>
                            </div>
                          </Card>
                        </Col>
                      ))
                    ) : (
                      <Col span={24}>
                        <Alert
                          message="No project data available"
                          description="Create projects and assign tasks to them to view detailed project analytics."
                          type="info"
                          showIcon
                          style={{ 
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
                          }}
                        />
                      </Col>
                    )}
                  </Row>

                  {/* Project Task Completion Timeline */}
                  {projectStats.length > 0 && (
                    <Card 
                      title="Project Task Completion Timeline"
                      style={{ 
                        marginTop: '24px',
                        borderRadius: '12px', 
                        overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
                      }}
                      styles={{ 
                        header: { background: '#1890ff', color: 'white' }
                      }}
                    >
                      <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={monthlyData.data}
                            margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {projectStats.map((project) => (
                              <Line
                                key={`line-${project.projectId}`}
                                type="monotone"
                                dataKey={`project-${project.projectId}`}
                                name={project.projectName}
                                stroke={PROJECT_COLORS.primary}
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                activeDot={{ r: 5 }}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  )}
                </div>

                {/* User Selection Card */}
                <Title level={4} style={{ margin: '30px 0 20px' }}>
                  <UserOutlined style={{ marginRight: '8px' }} />
                  User Performance Analysis
                </Title>
                <Card style={{ marginBottom: '20px' }}>
                  <div style={{ marginTop: '16px' }}>
                    <Select
                      placeholder="Select a user to view their analytics"
                      style={{ width: '100%' }}
                      allowClear
                      onChange={(value) => setSelectedUserId(value ? Number(value) : null)}
                      value={selectedUserId}
                    >
                      {[
                        { userId: 1, userEmail: 'drakankasha@destinpq.com' },
                        { userId: 2, userEmail: 'pratik@destinpq.com' },
                        { userId: 3, userEmail: 'shauryabansal@destinpq.com' },
                        { userId: 4, userEmail: 'mohitagrwal@destinpq.com' },
                        { userId: 5, userEmail: 'tejaswi.ranganeni@destinpq.com' },
                        { userId: 6, userEmail: 'admin@destinpq.com' }
                      ].map(user => (
                        <Select.Option key={user.userId} value={user.userId}>
                          {user.userEmail} {user.userId === currentUser?.id ? '(You)' : ''}
                        </Select.Option>
                      ))}
                    </Select>
                    {selectedUserId && (
                      <Button 
                        type="primary"
                        onClick={() => setSelectedUserId(null)}
                        style={{ marginTop: '10px' }}
                      >
                        Clear Selection
                      </Button>
                    )}
                  </div>
                </Card>

                {selectedUserId && selectedUserStats ? (
                  // Display selected user stats
                  <div style={{ marginBottom: '30px' }}>
                    <Alert
                      message={`Viewing analytics for ${selectedUserStats.userEmail}`}
                      type="info"
                      showIcon
                      closable
                      onClose={() => setSelectedUserId(null)}
                      style={{ marginBottom: '20px' }}
                    />
                    
                    <Row gutter={[16, 16]}>
                      <Col span={6}>
                        <Card>
                          <Statistic 
                            title="Total Tasks" 
                            value={selectedUserStats.totalTasks} 
                            prefix={<FileOutlined />}
                          />
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card>
                          <Statistic 
                            title="Tasks Completed" 
                            value={selectedUserStats.tasksCompleted} 
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                          />
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card>
                          <Statistic 
                            title="Tasks In Progress" 
                            value={selectedUserStats.tasksInProgress} 
                            prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
                          />
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card>
                          <Statistic 
                            title="Completion Rate" 
                            value={Math.round(selectedUserStats.completionRate * 100)} 
                            suffix="%" 
                            prefix={<TrophyOutlined style={{ color: '#fa8c16' }} />}
                          />
                        </Card>
                      </Col>
                    </Row>
                    
                    <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
                      <Col span={12}>
                        <Card title="Task Status Distribution">
                          <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={getChartData(selectedUserStats)}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={true}
                                  label={({ name, percent }) => percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : null}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  paddingAngle={3}
                                >
                                  {getChartData(selectedUserStats).map((entry, index) => (
                                    <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => Number(value) > 0 ? value : `0`} />
                                <Legend 
                                  layout="horizontal" 
                                  verticalAlign="bottom" 
                                  align="center"
                                  wrapperStyle={{
                                    paddingTop: "20px"
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </Card>
                      </Col>
                      
                      <Col span={12}>
                        <Card title="Performance Metrics">
                          <Row gutter={[16, 16]}>
                            <Col span={12}>
                              <Statistic
                                title={<span style={{ fontSize: '14px' }}>Accuracy Score</span>}
                                value={selectedUserStats.accuracyScore}
                                suffix="/100"
                                valueStyle={{
                                  color: 
                                    selectedUserStats.accuracyScore >= 90 ? '#52c41a' : 
                                    selectedUserStats.accuracyScore >= 70 ? '#faad14' : '#f5222d'
                                }}
                              />
                            </Col>
                            <Col span={12}>
                              <Statistic
                                title={<span style={{ fontSize: '14px' }}>Quality Rating</span>}
                                value={selectedUserStats.qualityRating.toFixed(1)}
                                suffix={<span style={{ fontSize: '14px', marginLeft: '5px' }}>/ 5.0</span>}
                                valueStyle={{ color: '#fadb14' }}
                                prefix={<StarFilled />}
                              />
                            </Col>
                          </Row>
                          
                          <Divider style={{ margin: '12px 0' }} />
                          
                          <Row gutter={[16, 16]}>
                            <Col span={8}>
                              <Statistic
                                title={<span style={{ fontSize: '14px' }}>Avg Time</span>}
                                value={selectedUserStats.avgCompletionTime}
                                suffix="h"
                                valueStyle={{ fontSize: '18px' }}
                              />
                            </Col>
                            <Col span={8}>
                              <Statistic
                                title={<span style={{ fontSize: '14px' }}>Efficiency</span>}
                                value={selectedUserStats.timeEfficiency}
                                suffix="%"
                                valueStyle={{
                                  fontSize: '18px',
                                  color: 
                                    selectedUserStats.timeEfficiency >= 90 ? '#52c41a' : 
                                    selectedUserStats.timeEfficiency >= 70 ? '#faad14' : '#f5222d'
                                }}
                              />
                            </Col>
                            <Col span={8}>
                              <Statistic
                                title={<span style={{ fontSize: '14px' }}>On Time</span>}
                                value={Math.round(selectedUserStats.onTimeCompletionRate * 100)}
                                suffix="%"
                                valueStyle={{
                                  fontSize: '18px',
                                  color: 
                                    selectedUserStats.onTimeCompletionRate >= 0.9 ? '#52c41a' : 
                                    selectedUserStats.onTimeCompletionRate >= 0.7 ? '#faad14' : '#f5222d'
                                }}
                              />
                            </Col>
                          </Row>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                ) : (
                  <Alert 
                    message="Select a user to view their analytics" 
                    description="Choose a user from the dropdown above to view their detailed task analytics." 
                    type="info"
                    style={{ marginBottom: '20px' }}
                  />
                )}

                {/* Personal dashboard now at the end for admin users */}
                <Divider style={{ margin: '40px 0 20px' }} />
                <Card 
                  title={
                    <div>
                      <UserOutlined style={{ marginRight: '8px' }} />
                      Your Personal Analytics
                    </div>
                  } 
                  style={{ marginBottom: '20px' }}
                >
                  {renderUserAnalytics()}
                </Card>
              </>
            ) : (
              // Regular user view - keep as is
              <>
                {renderUserAnalytics()}
              </>
            )}
          </>
        )}
      </Content>
    </Layout>
  );
};

export default AnalyticsPage; 