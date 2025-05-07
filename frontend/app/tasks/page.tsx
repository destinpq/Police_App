'use client';

import { useEffect, useState } from 'react';
import { Layout } from 'antd';
import { useRouter } from 'next/navigation';
import { AuthService } from '../services/AuthService';
import { User } from '../types/user';
import ProjectTaskBoard from '../components/ProjectTaskBoard';
import MainHeader from '../components/MainHeader';

const { Content } = Layout;

export default function TasksPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const user = AuthService.getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(user);
  }, [router]);

  if (!currentUser) {
    return null;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <MainHeader currentUser={currentUser} />
      <Content className="container" style={{ padding: '20px' }}>
        <ProjectTaskBoard currentUser={currentUser} />
      </Content>
    </Layout>
  );
} 