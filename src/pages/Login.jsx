import {useState} from 'react';
import {Form, Input, Button, Card, message, Typography} from 'antd';
import {UserOutlined, LockOutlined} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import axiosInstance from '../api/axios';


const {Title} = Typography;


const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/token/', values);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      message.success('Вход выполнен успешно!');
      navigate('/');
    } catch (error) {
      message.error('Ошибка входа. Проверьте логин и пароль.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5'}}>
      <Card style={{width: 350, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
        <Title level={3} style={{textAlign: 'center'}}>Вход в систему</Title>
        <Form
          name="login"
          initialValues={{remember: true}}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{required: true, message: 'Введите имя пользователя!'}]}
          >
            <Input prefix={<UserOutlined/>} placeholder="Имя пользователя"/>
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{required: true, message: 'Введите пароль!'}]}
          >
            <Input.Password prefix={<LockOutlined/>} placeholder="Пароль"/>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Войти
            </Button>
          </Form.Item>
        </Form>
        <div style={{textAlign: 'center'}}>
          <a href="/register">Нет аккаунта? Зарегистрироваться</a>
        </div>
      </Card>
    </div>
  );
};

export default Login;