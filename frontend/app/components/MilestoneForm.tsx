'use client';

import { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, Select, message } from 'antd';
import { Milestone, CreateMilestoneDto, UpdateMilestoneDto } from '../types/milestone';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface MilestoneFormProps {
  milestone?: Milestone;
  projectId: number;
  onSubmit: (milestoneData: CreateMilestoneDto | UpdateMilestoneDto) => Promise<void>;
  onCancel: () => void;
}

const MilestoneForm = ({ milestone, projectId, onSubmit, onCancel }: MilestoneFormProps) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (milestone) {
      form.setFieldsValue({
        ...milestone,
        deadline: milestone.deadline ? dayjs(milestone.deadline) : undefined,
      });
    } else {
      form.setFieldsValue({
        project_id: projectId,
        status: 'NOT_STARTED',
      });
    }
  }, [milestone, projectId, form]);

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      const milestoneData: CreateMilestoneDto | UpdateMilestoneDto = {
        ...values,
        deadline: values.deadline ? values.deadline.toISOString() : undefined,
        project_id: projectId,
      };

      if (milestone?.id) {
        await onSubmit({ id: milestone.id, ...milestoneData });
      } else {
        await onSubmit(milestoneData as CreateMilestoneDto);
      }
    } catch (error) {
      console.error('Failed to save milestone:', error);
      message.error('Failed to save milestone. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        status: 'NOT_STARTED',
        project_id: projectId,
      }}
    >
      <Form.Item
        name="name"
        label="Milestone Name"
        rules={[{ required: true, message: 'Please enter the milestone name' }]}
      >
        <Input placeholder="Enter milestone name" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: 'Please enter the milestone description' }]}
      >
        <TextArea
          placeholder="Enter description"
          autoSize={{ minRows: 3, maxRows: 6 }}
        />
      </Form.Item>

      <Form.Item name="status" label="Status">
        <Select>
          <Option value="NOT_STARTED">Not Started</Option>
          <Option value="IN_PROGRESS">In Progress</Option>
          <Option value="COMPLETED">Completed</Option>
        </Select>
      </Form.Item>

      <Form.Item name="deadline" label="Deadline">
        <DatePicker
          style={{ width: '100%' }}
          format="YYYY-MM-DD"
          placeholder="Select deadline"
        />
      </Form.Item>

      <Form.Item>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={submitting}>
            {milestone ? 'Update' : 'Create'} Milestone
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default MilestoneForm; 