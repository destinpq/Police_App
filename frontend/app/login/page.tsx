'use client';

import { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { AuthService } from '../services/AuthService';
import { LoginRequest } from '../types/user';
import Image from 'next/image';

const { Title } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: LoginRequest) => {
    try {
      setLoading(true);
      await AuthService.login(values);
      message.success('Login successful');
      router.push('/tasks');
    } catch (error) {
      message.error('Invalid email or password');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Card className="login-card" styles={{ body: { backgroundColor: 'white' } }}>
        <div className="login-logo">
          <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto' }}>
            <Image 
              src="/destinpq.png" 
              alt="DestinPQ Logo" 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <Title level={4} style={{ marginTop: 20, color: '#000000' }}>Task Tracker</Title>
        </div>
        
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email address!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Email" 
              size="large" 
              autoComplete="email"
              style={{ color: 'black' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
              autoComplete="current-password"
              style={{ color: 'black' }}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="default" 
              htmlType="submit" 
              loading={loading}
              block
              size="large"
              className="login-button"
            >
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
} 