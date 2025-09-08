// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  getAllowedPids, 
  createAllowedPid, 
  updateAllowedPid, 
  deleteAllowedPid,
  getChatSessions,
  cleanupInactiveSessions,
  getSystemStatistics 
} from '../api/client';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [allowedPids, setAllowedPids] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  const [newPid, setNewPid] = useState({ pid: '', description: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  // 載入統計資料
  const loadStatistics = async () => {
    try {
      const stats = await getSystemStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('載入統計失敗:', error);
    }
  };

  // 載入允許的 PID
  const loadAllowedPids = async () => {
    try {
      const response = await getAllowedPids(false); // 顯示所有 PID
      setAllowedPids(response.pids);
    } catch (error) {
      console.error('載入 PID 清單失敗:', error);
    }
  };

  // 載入聊天會話
  const loadChatSessions = async () => {
    try {
      const response = await getChatSessions(false);
      setChatSessions(response.sessions);
    } catch (error) {
      console.error('載入會話清單失敗:', error);
    }
  };

  // 新增 PID
  const handleAddPid = async () => {
    if (!newPid.pid.trim()) {
      setMessage({ type: 'error', text: '請輸入 PID' });
      return;
    }

    try {
      setLoading(true);
      await createAllowedPid(newPid.pid, newPid.description);
      setNewPid({ pid: '', description: '' });
      setMessage({ type: 'success', text: 'PID 新增成功' });
      loadAllowedPids();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  // 切換 PID 狀態
  const handleTogglePid = async (pidId, currentStatus) => {
    try {
      await updateAllowedPid(pidId, { is_active: !currentStatus });
      setMessage({ type: 'success', text: '狀態更新成功' });
      loadAllowedPids();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  // 刪除 PID
  const handleDeletePid = async (pidId) => {
    if (!confirm('確定要刪除此 PID 嗎？')) return;

    try {
      await deleteAllowedPid(pidId);
      setMessage({ type: 'success', text: 'PID 刪除成功' });
      loadAllowedPids();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  // 清理非活躍會話
  const handleCleanupSessions = async () => {
    try {
      const result = await cleanupInactiveSessions(5);
      setMessage({ 
        type: 'success', 
        text: `已清理 ${result.ended_sessions} 個非活躍會話` 
      });
      loadChatSessions();
      loadStatistics();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') {
      loadStatistics();
    } else if (activeTab === 'pids') {
      loadAllowedPids();
    } else if (activeTab === 'sessions') {
      loadChatSessions();
    }
  }, [activeTab]);

  // 清除訊息
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">系統管理儀表板</h1>

        {/* 訊息提示 */}
        {message.text && (
          <div className={`mb-4 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* 標籤頁 */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: '總覽' },
              { id: 'pids', name: 'PID 管理' },
              { id: 'sessions', name: '會話管理' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-4 rounded-lg font-medium ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* 總覽頁面 */}
        {activeTab === 'overview' && statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">總用戶數</h3>
              <p className="text-3xl font-bold text-blue-600">{statistics.overview.total_users}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">授權 PID</h3>
              <p className="text-3xl font-bold text-green-600">{statistics.overview.total_allowed_pids}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">活躍會話</h3>
              <p className="text-3xl font-bold text-yellow-600">{statistics.overview.active_sessions}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">總訊息數</h3>
              <p className="text-3xl font-bold text-purple-600">{statistics.overview.total_messages}</p>
            </div>
          </div>
        )}

        {/* PID 管理頁面 */}
        {activeTab === 'pids' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">新增允許的 PID</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="PID (例如: 123A)"
                  value={newPid.pid}
                  onChange={(e) => setNewPid({ ...newPid, pid: e.target.value.toUpperCase() })}
                  className="px-3 py-2 border rounded-md"
                  maxLength={4}
                />
                <input
                  type="text"
                  placeholder="備註說明 (可選)"
                  value={newPid.description}
                  onChange={(e) => setNewPid({ ...newPid, description: e.target.value })}
                  className="px-3 py-2 border rounded-md flex-1"
                />
                <button
                  onClick={handleAddPid}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? '新增中...' : '新增'}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">說明</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">建立時間</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allowedPids.map((pid) => (
                    <tr key={pid.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{pid.pid}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{pid.description || '無'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          pid.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {pid.is_active ? '啟用' : '停用'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(pid.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => handleTogglePid(pid.id, pid.is_active)}
                          className={`px-3 py-1 rounded text-xs ${
                            pid.is_active ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                          }`}
                        >
                          {pid.is_active ? '停用' : '啟用'}
                        </button>
                        <button
                          onClick={() => handleDeletePid(pid.id)}
                          className="px-3 py-1 bg-gray-500 text-white rounded text-xs"
                        >
                          刪除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 會話管理頁面 */}
        {activeTab === 'sessions' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">聊天會話管理</h2>
              <button
                onClick={handleCleanupSessions}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
              >
                清理非活躍會話
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用戶 PID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">機器人類型</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">開始時間</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">持續時間</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">訊息數</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">結束原因</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {chatSessions.map((session) => (
                    <tr key={session.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {session.user_pid || `用戶 ${session.user_id}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {session.bot_type || '未設定'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(session.session_start).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {session.duration_minutes.toFixed(1)} 分鐘
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {session.message_count}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          session.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {session.is_active ? '進行中' : '已結束'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {session.end_reason ? {
                          'user_ended': '用戶結束',
                          'timeout': '超時結束',
                          'system': '系統結束'
                        }[session.end_reason] || session.end_reason : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;