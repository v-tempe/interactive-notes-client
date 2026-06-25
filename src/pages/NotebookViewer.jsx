import {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {Typography, Button, Card, Empty, Divider, Spin, message} from 'antd';
import {ArrowLeftOutlined} from '@ant-design/icons';
import axiosInstance from '../api/axios';


const {Title, Text} = Typography;

const NotebookViewer = () => {
  const {id} = useParams();
  const navigate = useNavigate();
  const [notebook, setNotebook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotebook = async () => {
      try {
        const response = await axiosInstance.get(`/notebooks/${id}/`);
        setNotebook(response.data);
      } catch (error) {
        message.error('Не удалось загрузить конспект');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchNotebook();
  }, [id, navigate]);

  if (loading) return <div style={{textAlign: 'center', marginTop: 50}}><Spin size="large"/></div>;
  if (!notebook) return <Empty description="Конспект не найден"/>;

  return (
    <div style={{padding: '24px', maxWidth: '1000px', margin: '0 auto'}}>
      <Title level={2} style={{margin: 0, paddingBottom: 20}}>{notebook.title}</Title>
      <div style={{marginBottom: 24}}>
        <Button icon={<ArrowLeftOutlined/>} onClick={() => navigate('/')}>Назад</Button>
      </div>
      <Divider/>

      {notebook.sections.map((section, sIndex) => (
        <Card
          key={section.id || sIndex}
          title={section.title}
          style={{marginBottom: 24}}
        >
          {section.blocks.map((block, bIndex) => (
            <div key={block.id || bIndex} style={{marginBottom: 16}}>
              {block.block_type === 'text' ? (
                <Text>{block.content || '(пустой блок)'}</Text>
              ) : (
                <pre style={{
                  background: '#f5f5f5',
                  padding: '12px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap'
                }}>
                  {block.content || '(пустой блок)'}
                </pre>
              )}
            </div>
          ))}
          {section.blocks.length === 0 && (
            <Text type="secondary">Нет блоков</Text>
          )}
        </Card>
      ))}

      {notebook.sections.length === 0 && (
        <Empty description="Конспект пуст"/>
      )}
    </div>
  );
};

export default NotebookViewer;