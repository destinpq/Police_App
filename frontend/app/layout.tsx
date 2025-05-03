import './globals.css';
import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';

export const metadata: Metadata = {
  title: 'DestinPQ Task Tracker',
  description: 'A task tracking application for DestinPQ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#1677ff',
                colorSuccess: '#52c41a',
                colorWarning: '#fa8c16',
                colorError: '#f5222d',
                borderRadius: 4,
                colorBgContainer: '#ffffff',
              },
              components: {
                Card: {
                  colorBorderSecondary: 'rgba(0, 0, 0, 0.06)',
                },
                Button: {
                  colorBgContainer: 'transparent',
                },
                Menu: {
                  darkItemColor: 'rgba(255, 255, 255, 0.85)',
                  darkItemHoverColor: '#ffffff',
                  darkItemSelectedColor: '#ffffff',
                  darkItemSelectedBg: 'rgba(255, 255, 255, 0.1)',
                },
                Layout: {
                  headerBg: '#000000',
                  bodyBg: '#ffffff',
                }
              },
            }}
          >
            {children}
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
