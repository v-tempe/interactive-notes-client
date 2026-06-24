import {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {
  Typography, Button, Input, Select, Card,
  Divider, message, Spin, Empty, Popconfirm
} from 'antd';
import {
  PlusOutlined, SaveOutlined, ArrowLeftOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import axiosInstance from '../api/axios';

const {Title, Text} = Typography;
const {TextArea} = Input;
const {Option} = Select;

const NotebookEditor = () => {
  const {id} = useParams();
  const navigate = useNavigate();

  const [notebook, setNotebook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Загрузка данных конспекта
  const fetchNotebook = async () => {
    try {
      const response = await axiosInstance.get(`/notebooks/${id}/`);
      setNotebook(response.data);

      // Получаем роль пользователя для этого конспекта
      try {
        const collabResponse = await axiosInstance.get(`/notebooks/${id}/collaborators/`);
        const usernameCurrent = localStorage.getItem('username');

        // Проверяем, владелец ли пользователь
        if (response.data.owner_details.username === usernameCurrent) {
          setUserRole('owner');
        } else {
          const userCollab = collabResponse.data.find(c => c.user_details.username === usernameCurrent);
          if (userCollab) {
            setUserRole(userCollab.role);
          }
        }
      } catch (e) {
        console.error('Не удалось загрузить роль пользователя');
      }
    } catch (error) {
      message.error('Не удалось загрузить конспект');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

// Функция проверки прав на редактирование
  const canEdit = () => {
    return userRole === 'owner' || userRole === 'editor';
  };

  useEffect(() => {
    fetchNotebook();
  }, [id]);

  // Сохранение изменений
  const handleSave = async () => {
    setSaving(true);
    try {
      await axiosInstance.put(`/notebooks/${id}/`, notebook);
      message.success('Конспект сохранен');
    } catch (error) {
      message.error('Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  // Добавление новой секции
  const addSection = () => {
    const newSection = {
      id: Date.now(), // Временный ID для UI
      title: 'Новый раздел',
      order: notebook.sections.length,
      blocks: []
    };
    setNotebook({
      ...notebook,
      sections: [...notebook.sections, newSection]
    });
  };

  // Удаление секции
  const removeSection = (sectionIndex) => {
    const newSections = notebook.sections.filter((_, index) => index !== sectionIndex);
    setNotebook({...notebook, sections: newSections});
  };

  // Обновление заголовка секции
  const updateSectionTitle = (sectionIndex, title) => {
    const newSections = [...notebook.sections];
    newSections[sectionIndex].title = title;
    setNotebook({...notebook, sections: newSections});
  };

  // Добавление блока в секцию
  const addBlock = (sectionIndex) => {
    const newSections = [...notebook.sections];
    const newBlock = {
      id: Date.now() + Math.random(),
      block_type: 'text',
      content: '',
      order: newSections[sectionIndex].blocks.length
    };
    newSections[sectionIndex].blocks.push(newBlock);
    setNotebook({...notebook, sections: newSections});
  };

  // Удаление блока
  const removeBlock = (sectionIndex, blockIndex) => {
    const newSections = [...notebook.sections];
    newSections[sectionIndex].blocks = newSections[sectionIndex].blocks.filter((_, idx) => idx !== blockIndex);
    setNotebook({...notebook, sections: newSections});
  };

  // Обновление блока
  const updateBlock = (sectionIndex, blockIndex, field, value) => {
    const newSections = [...notebook.sections];
    newSections[sectionIndex].blocks[blockIndex][field] = value;
    setNotebook({...notebook, sections: newSections});
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: 50}}><Spin size="large"/></div>;
  if (!notebook) return <Empty description="Конспект не найден"/>;

  return (
    <div style={{padding: '24px', maxWidth: '1000px', margin: '0 auto'}}>
      <Title level={2} style={{margin: 0, paddingBottom: 20}}>{notebook.title}</Title>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
        <Button icon={<ArrowLeftOutlined/>} onClick={() => navigate('/')}>Назад</Button>
        <Button type="primary" icon={<SaveOutlined/>} onClick={handleSave} loading={saving}>
          Сохранить
        </Button>
      </div>

      <Divider/>

      {notebook.sections.map((section, sIndex) => (
        <Card
          key={section.id || sIndex}
          title={
            <Input
              value={section.title}
              onChange={(e) => updateSectionTitle(sIndex, e.target.value)}
              style={{width: 300}}
              placeholder="Заголовок раздела"
            />
          }
          extra={
            <Popconfirm title="Удалить раздел?" onConfirm={() => removeSection(sIndex)}>
              <Button danger icon={<DeleteOutlined/>} size="small">Удалить раздел</Button>
            </Popconfirm>
          }
          style={{marginBottom: 24}}
        >
          {section.blocks.map((block, bIndex) => (
            <div key={block.id || bIndex}
                 style={{marginBottom: 16, border: '1px solid #f0f0f0', padding: 16, borderRadius: 4}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
                <Select
                  value={block.block_type}
                  style={{width: 120}}
                  onChange={(val) => updateBlock(sIndex, bIndex, 'block_type', val)}
                >
                  <Option value="text">Текст</Option>
                  <Option value="code">Код</Option>
                </Select>
                <Button danger type="text" icon={<DeleteOutlined/>} onClick={() => removeBlock(sIndex, bIndex)}/>
              </div>

              {block.block_type === 'text' ? (
                <TextArea
                  rows={4}
                  value={block.content}
                  onChange={(e) => updateBlock(sIndex, bIndex, 'content', e.target.value)}
                  placeholder="Введите текст..."
                />
              ) : (
                <TextArea
                  rows={4}
                  value={block.content}
                  onChange={(e) => updateBlock(sIndex, bIndex, 'content', e.target.value)}
                  placeholder="// Введите код..."
                  style={{fontFamily: 'monospace'}}
                />
              )}
            </div>
          ))}

          <Button type="dashed" block icon={<PlusOutlined/>} onClick={() => addBlock(sIndex)}>
            Добавить блок
          </Button>
        </Card>
      ))}

      <Button type="dashed" block icon={<PlusOutlined/>} onClick={addSection} style={{height: 50}}>
        Добавить новый раздел
      </Button>
    </div>
  );
};

export default NotebookEditor;