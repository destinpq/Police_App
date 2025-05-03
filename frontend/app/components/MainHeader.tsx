'use client';

import { Menu, Button } from 'antd';
import { UserOutlined, LogoutOutlined, DashboardOutlined, BarChartOutlined } from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AuthService } from '../services/AuthService';

interface User {
  id: number;
  email: string;
  isAdmin: boolean;
}

interface MainHeaderProps {
  currentUser: User;
}

const MainHeader = ({ currentUser }: MainHeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    AuthService.logout();
    router.push('/login');
  };

  return (
    <header className="app-header">
      <div className="app-logo">
        <Image 
          src="/destinpq.png" 
          alt="DestinPQ Logo" 
          width={50} 
          height={50} 
          style={{ marginRight: '10px' }}
        />
        <span>Task Tracker</span>
      </div>
      
      <div className="app-nav">
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[pathname]}
          items={[
            {
              key: '/tasks',
              icon: <DashboardOutlined />,
              label: <Link href="/tasks">Tasks</Link>,
            },
            {
              key: '/analytics',
              icon: <BarChartOutlined />,
              label: <Link href="/analytics">Analytics</Link>,
            }
          ]}
        />
      </div>

      <div className="user-menu">
        <div className="user-info">
          <UserOutlined />
          <span>{currentUser.email}{currentUser.isAdmin ? ' (Admin)' : ''}</span>
        </div>
        <Button 
          icon={<LogoutOutlined />} 
          onClick={handleLogout}
          type="default"
          ghost
          className="logout-btn"
        >
          Logout
        </Button>
      </div>
    </header>
  );
};

export default MainHeader; 