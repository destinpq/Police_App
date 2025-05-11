'use client';

import { useState, useEffect, useCallback } from 'react';
import { List, Card, Button, Drawer, Spin, Tag, Empty, Modal, message, Progress } from 'antd';
import { EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import { Milestone, CreateMilestoneDto, UpdateMilestoneDto } from '../types/milestone';
import { MilestoneService } from '../services/MilestoneService';
import MilestoneForm from './MilestoneForm';
import dayjs from 'dayjs';

interface MilestoneListProps {
  projectId: number;
  isAdmin: boolean;
}

const MilestoneList = ({ projectId, isAdmin }: MilestoneListProps) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showMilestoneForm, setShowMilestoneForm] = useState<boolean>(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | undefined>(undefined);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [milestoneToDelete, setMilestoneToDelete] = useState<number | null>(null);

  const fetchMilestones = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const milestoneData = await MilestoneService.getMilestonesByProject(projectId);
      setMilestones(milestoneData);
    } catch (error) {
      console.error('Failed to fetch milestones:', error);
      message.error('Failed to load milestones. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const handleCreateMilestone = () => {
    setSelectedMilestone(undefined);
    setShowMilestoneForm(true);
  };

  const handleEditMilestone = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setShowMilestoneForm(true);
  };

  const handleMilestoneFormSubmit = async (milestoneData: CreateMilestoneDto | UpdateMilestoneDto) => {
    try {
      if (selectedMilestone) {
        await MilestoneService.updateMilestone(selectedMilestone.id, milestoneData as UpdateMilestoneDto);
        message.success('Milestone updated successfully');
      } else {
        await MilestoneService.createMilestone(milestoneData as CreateMilestoneDto);
        message.success('Milestone created successfully');
      }
      setShowMilestoneForm(false);
      fetchMilestones();
    } catch (error) {
      console.error('Failed to save milestone:', error);
      message.error('Failed to save milestone. Please try again.');
    }
  };

  const showDeleteConfirm = (milestoneId: number) => {
    setMilestoneToDelete(milestoneId);
    setDeleteModalVisible(true);
  };

  const handleDeleteMilestone = async () => {
    if (milestoneToDelete === null) return;
    
    try {
      setConfirmLoading(true);
      await MilestoneService.deleteMilestone(milestoneToDelete);
      message.success('Milestone deleted successfully');
      fetchMilestones();
    } catch (error) {
      console.error('Failed to delete milestone:', error);
      message.error('Failed to delete milestone. Please try again.');
    } finally {
      setConfirmLoading(false);
      setDeleteModalVisible(false);
      setMilestoneToDelete(null);
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return <Tag color="default">Not Started</Tag>;
      case 'IN_PROGRESS':
        return <Tag color="processing">In Progress</Tag>;
      case 'COMPLETED':
        return <Tag color="success">Completed</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getProgress = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return 0;
      case 'IN_PROGRESS':
        return 50;
      case 'COMPLETED':
        return 100;
      default:
        return 0;
    }
  };

  return (
    <div className="milestone-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3>Milestones</h3>
        {isAdmin && (
          <Button type="primary" size="small" onClick={handleCreateMilestone}>
            Add Milestone
          </Button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin />
        </div>
      ) : milestones.length === 0 ? (
        <Empty description="No milestones found" />
      ) : (
        <List
          dataSource={milestones}
          grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 }}
          renderItem={(milestone) => (
            <List.Item>
              <Card 
                style={{ marginBottom: '10px' }}
                actions={isAdmin ? [
                  <EditOutlined key="edit" onClick={() => handleEditMilestone(milestone)} />,
                  <DeleteOutlined key="delete" onClick={() => showDeleteConfirm(milestone.id)} />
                ] : []}
              >
                <div>
                  <h4>{milestone.name}</h4>
                  <p style={{ marginBottom: '8px' }}>{milestone.description}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    {getStatusTag(milestone.status)}
                    {milestone.deadline && (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarOutlined style={{ marginRight: '5px' }} />
                        <span>{dayjs(milestone.deadline).format('MMM D, YYYY')}</span>
                      </div>
                    )}
                  </div>
                  
                  <Progress percent={getProgress(milestone.status)} showInfo={false} />
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}

      <Drawer
        title={selectedMilestone ? 'Edit Milestone' : 'Create Milestone'}
        placement="right"
        width={400}
        onClose={() => setShowMilestoneForm(false)}
        open={showMilestoneForm}
      >
        <MilestoneForm
          milestone={selectedMilestone}
          projectId={projectId}
          onSubmit={handleMilestoneFormSubmit}
          onCancel={() => setShowMilestoneForm(false)}
        />
      </Drawer>

      <Modal
        title="Delete Milestone"
        open={deleteModalVisible}
        onOk={handleDeleteMilestone}
        confirmLoading={confirmLoading}
        onCancel={() => setDeleteModalVisible(false)}
      >
        <p>Are you sure you want to delete this milestone?</p>
        <p>All associated tasks will be unlinked from this milestone.</p>
      </Modal>
    </div>
  );
};

export default MilestoneList; 