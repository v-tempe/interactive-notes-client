import {Typography, Button, Card, Empty, Divider} from 'antd';
import {ArrowLeftOutlined} from '@ant-design/icons';


const {Title, Text} = Typography;

const NotebookViewer = ({notebook, onBack}) => {
  return (
    <div style={{padding: '24px', maxWidth: '1000px', margin: '0 auto'}}>
      <Title level={2} style={{margin: 0, paddingBottom: 20}}>{notebook.title}</Title>
      <div style={{marginBottom: 24}}>
        <Button icon={<ArrowLeftOutlined/>} onClick={onBack}>Назад</Button>
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