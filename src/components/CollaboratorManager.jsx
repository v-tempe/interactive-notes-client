import {useState, useEffect} from 'react';
import {Modal, Table, Button, Input, Space, message, Popconfirm, Select} from 'antd';
import {DeleteOutlined, UserAddOutlined} from '@ant-design/icons';
import axiosInstance from '../api/axios';


const {Option} = Select;

const CollaboratorManager = ({visible, notebookId, onClose, onUpdate}) => {
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState('viewer');

  // Загрузка списка соавторов
  const fetchCollaborators = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/notebooks/${notebookId}/collaborators/`);
      setCollaborators(response.data);
    } catch (error) {
      message.error('Не удалось загрузить список соавторов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && notebookId) {
      fetchCollaborators();
    }
  }, [visible, notebookId]);

  // Добавление соавтора
  const handleAddCollaborator = async () => {
    if (!newUsername.trim()) {
      message.warning('Введите имя пользователя');
      return;
    }

    setAddingUser(true);
    try {
      await axiosInstance.post(`/notebooks/${notebookId}/collaborators/`, {
        username: newUsername,
        role: newRole,
      });
      message.success('Соавтор добавлен');
      setNewUsername('');
      setNewRole('viewer');
      fetchCollaborators();
      onUpdate(); // Уведомляем родителя об обновлении
    } catch (error) {
      if (error.response?.data) {
        message.error(error.response.data.detail || 'Ошибка при добавлении соавтора');
      } else {
        message.error('Ошибка при добавлении соавтора');
      }
    } finally {
      setAddingUser(false);
    }
  };

  // Удаление соавтора
  const handleRemoveCollaborator = async (collaboratorId) => {
    try {
      await axiosInstance.delete(`/notebooks/${notebookId}/collaborators/${collaboratorId}/`);
      message.success('Соавтор удалён');
      fetchCollaborators();
      onUpdate();
    } catch (error) {
      message.error('Ошибка при удалении соавтора');
    }
  };

  // Изменение роли соавтора
  const handleRoleChange = async (collaboratorId, newRole) => {
    try {
      await axiosInstance.patch(`/notebooks/${notebookId}/collaborators/${collaboratorId}/`, {
        role: newRole,
      });
      message.success('Роль обновлена');
      fetchCollaborators();
    } catch (error) {
      message.error('Ошибка при обновлении роли');
    }
  };

  const columns = [
    {
      title: 'Пользователь',
      dataIndex: 'user_details',
      key: 'username',
      render: (userDetails) => userDetails?.username || '—',
    },
    {
      title: 'Email',
      dataIndex: 'user_details',
      key: 'email',
      render: (userDetails) => userDetails?.email || '—',
    },
    {
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
      render: (role, record) => (
        <Select
          defaultValue={role}
          style={{width: 120}}
          onChange={(value) => handleRoleChange(record.id, value)}
        >
          <Option value="viewer">Просмотр</Option>
          <Option value="editor">Редактирование</Option>
        </Select>
      ),
    },
    {
      title: 'Действия',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Удалить соавтора?"
          description={`Пользователь ${record.user_details?.username} потеряет доступ к конспекту.`}
          onConfirm={() => handleRemoveCollaborator(record.id)}
          okText="Да, удалить"
          cancelText="Отмена"
          okButtonProps={{danger: true}}
        >
          <Button type="text" danger icon={<DeleteOutlined/>} size="small">
            Удалить
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Modal
      title="Управление соавторами"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <div style={{marginBottom: 16}}>
        <Space.Compact style={{width: '100%'}}>
          <Input
            placeholder="Имя пользователя"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            onPressEnter={handleAddCollaborator}
            style={{width: '40%'}}
          />
          <Select
            value={newRole}
            onChange={setNewRole}
            style={{width: '20%'}}
          >
            <Option value="viewer">Просмотр</Option>
            <Option value="editor">Редактирование</Option>
          </Select>
          <Button
            type="primary"
            icon={<UserAddOutlined/>}
            onClick={handleAddCollaborator}
            loading={addingUser}
            style={{width: '20%'}}
          >
            Добавить
          </Button>
        </Space.Compact>
      </div>

      <Table
        columns={columns}
        dataSource={collaborators}
        rowKey="id"
        loading={loading}
        pagination={false}
        locale={{emptyText: 'Нет соавторов'}}
      />
    </Modal>
  );
};

export default CollaboratorManager;