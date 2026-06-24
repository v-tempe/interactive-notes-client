import React, { useState, useEffect } from 'react';
import { Table, Button, message, Typography, Space, Modal, Input } from 'antd';
import { PlusOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';

const { Title } = Typography;

const Dashboard = () => {
  const [notebooks, setNotebooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState('');
  const [userRoles, setUserRoles] = useState({});
  const navigate = useNavigate();

  // Загрузка списка конспектов
  const fetchNotebooks = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/notebooks/');
      setNotebooks(response.data);

      // Загружаем информацию о соавторах для каждого конспекта
      const roles = {};
      for (const notebook of response.data) {
        try {
          const collabResponse = await axiosInstance.get(`/notebooks/${notebook.id}/collaborators/`);
          const usernameCurrent = localStorage.getItem('username');
          const userCollab = collabResponse.data.find(c => c.user_details.username === usernameCurrent);
          if (userCollab) {
            roles[notebook.id] = userCollab.role;
          } else if (notebook.owner_details.username === usernameCurrent) {
            roles[notebook.id] = 'owner';
          }
        } catch (e) {
          console.error('Не удалось загрузить соавторов для конспекта', notebook.id);
        }
      }
      setUserRoles(roles);
    } catch (error) {
      message.error('Не удалось загрузить конспекты');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotebooks();
  }, []);

  // Обработка выхода
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  // Создание нового конспекта
  const handleCreateNotebook = async () => {
    if (!newNotebookTitle.trim()) {
      message.warning('Введите название конспекта');
      return;
    }
    try {
      await axiosInstance.post('/notebooks/', {
        title: newNotebookTitle,
        sections: []
      });
      message.success('Конспект создан');
      setIsModalOpen(false);
      setNewNotebookTitle('');
      fetchNotebooks(); // Обновляем список
    } catch (error) {
      message.error('Ошибка при создании конспекта');
    }
  };

  // Колонки для таблицы
  const columns = [
    {
      title: 'Название',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <a onClick={() => navigate(`/notebook/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: 'Дата обновления',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Действия',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => navigate(`/notebook/${record.id}`)}>
          Открыть
        </Button>
      ),
    },
    {
      title: 'Роль',
      key: 'role',
      render: (_, record) => {
        const role = userRoles[record.id];
        const roleMap = {
          'owner': 'Владелец',
          'editor': 'Редактор',
          'viewer': 'Просмотр'
        };
        return roleMap[role] || '—';
      },
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Мои конспекты</Title>
        <Space style={{ marginTop: '16px' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Создать конспект
          </Button>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>
            Выйти
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={notebooks}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Новый конспект"
        open={isModalOpen}
        onOk={handleCreateNotebook}
        onCancel={() => setIsModalOpen(false)}
        okText="Создать"
        cancelText="Отмена"
      >
        <Input
          placeholder="Название конспекта"
          value={newNotebookTitle}
          onChange={(e) => setNewNotebookTitle(e.target.value)}
          onPressEnter={handleCreateNotebook}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;