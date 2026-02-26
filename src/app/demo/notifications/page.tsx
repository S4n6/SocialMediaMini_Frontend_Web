'use client';

import React from 'react';
import { NotificationDrawer } from '@/features/notification';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

/**
 * Demo page để test notification system
 * Có thể sử dụng trang này để kiểm tra:
 * - Notification drawer mở/đóng
 * - Infinite scroll functionality
 * - Search và filter
 * - Real-time updates
 */
export default function NotificationDemo() {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const handleToggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Notification System Demo
          </h1>

          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                ✅ Hoàn thành Giai đoạn 3 - Advanced Notification Features
              </h2>
              <p className="text-gray-600 mb-4">
                Hệ thống thông báo đã được nâng cấp với đầy đủ tính năng:
              </p>

              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>
                    <strong>Infinite Scroll:</strong> Tự động tải thêm thông báo
                    khi cuộn xuống
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>
                    <strong>Search & Filter:</strong> Tìm kiếm và lọc thông báo
                    theo loại, ngày, trạng thái
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>
                    <strong>Date Grouping:</strong> Nhóm thông báo theo thời
                    gian (Today, Yesterday, This Week, Earlier)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>
                    <strong>Real API Integration:</strong> Kết nối với backend
                    API thật với pagination
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>
                    <strong>Real-time Updates:</strong> Socket.IO cho thông báo
                    real-time
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>
                    <strong>Instagram-style UI:</strong> Giao diện giống
                    Instagram 2024
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>
                    <strong>Advanced Navigation:</strong> Tự động navigate đến
                    nội dung liên quan
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>
                    <strong>Loading States:</strong> Loading indicators cho tất
                    cả trạng thái
                  </span>
                </li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Test Notification Drawer
              </h3>

              <div className="flex flex-wrap gap-4 mb-6">
                <Button
                  onClick={handleToggleDrawer}
                  className="flex items-center gap-2"
                  data-notification-toggle
                >
                  <Bell className="w-4 h-4" />
                  {isDrawerOpen ? 'Close' : 'Open'} Notifications
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  Toggle Layout ({isCollapsed ? 'Collapsed' : 'Expanded'})
                </Button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">
                  Hướng dẫn test:
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Click "Open Notifications" để mở drawer</li>
                  <li>Click "Search" để mở giao diện tìm kiếm và filter</li>
                  <li>
                    Thử tìm kiếm bằng từ khóa hoặc filter theo loại thông báo
                  </li>
                  <li>Cuộn xuống để test infinite scroll</li>
                  <li>Click vào thông báo để test navigation</li>
                  <li>Test mark as read/unread functionality</li>
                  <li>Test tabs (All, Following, You)</li>
                </ol>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Technical Implementation
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">
                    Backend Integration
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Notification API endpoints</li>
                    <li>• Pagination support</li>
                    <li>• Search & filtering</li>
                    <li>• Real-time Socket.IO</li>
                    <li>• Mark read/unread</li>
                    <li>• Bulk actions</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">
                    Frontend Features
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• TypeScript type safety</li>
                    <li>• React hooks optimization</li>
                    <li>• Infinite scroll với Intersection Observer</li>
                    <li>• Advanced search interface</li>
                    <li>• Date grouping logic</li>
                    <li>• Loading states & error handling</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-green-800 mb-2">
                🎉 Giai đoạn 3 Hoàn thành!
              </h3>
              <p className="text-green-700">
                Notification system đã được implement đầy đủ với tất cả tính
                năng advanced: notification history, infinite scroll, search &
                filter, real-time updates, và UI giống Instagram. Sẵn sàng để
                integrate vào production!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isDrawerOpen}
        isCollapsed={isCollapsed}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}
