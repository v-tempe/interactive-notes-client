import {useState} from 'react';
import {Form, Input, Button, Card, message, Typography} from 'antd';
import {UserOutlined, LockOutlined, MailOutlined} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import axiosInstance from '../api/axios';


const {Title} = Typography;


const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Отправляем запрос на регистрацию
      await axiosInstance.post('/auth/register/', values);
      message.success('Регистрация прошла успешно! Теперь войдите в систему.');
      navigate('/login');
    } catch (error) {
      if (error.response && error.response.data.error) {
        message.error(error.response.data.error);
      } else {
        message.error('Ошибка регистрации. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5'}}>
      <Card style={{width: 350, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
        <Title level={3} style={{textAlign: 'center'}}>Регистрация</Title>
        <Form
          name="register"
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
            name="email"
            rules={[
              {required: true, message: 'Введите email!'},
              {type: 'email', message: 'Некорректный email!'}
            ]}
          >
            <Input prefix={<MailOutlined/>} placeholder="Email"/>
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              {required: true, message: 'Введите пароль!'},
              {min: 6, message: 'Пароль должен быть не менее 6 символов!'}
            ]}
          >
            <Input.Password prefix={<LockOutlined/>} placeholder="Пароль"/>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Зарегистрироваться
            </Button>
          </Form.Item>
        </Form>
        <div style={{textAlign: 'center'}}>
          <a href="/login">Уже есть аккаунт? Войти</a>
        </div>
      </Card>
    </div>
  );
};

export default Register;