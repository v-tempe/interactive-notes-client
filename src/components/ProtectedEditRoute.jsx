import {useState, useEffect} from 'react';
import {Navigate, useParams} from 'react-router-dom';
import {Spin, message} from 'antd';
import axiosInstance from '../api/axios';


const ProtectedEditRoute = ({children}) => {
  const {id} = useParams();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Проверяем, есть ли у пользователя права на редактирование
        const token = localStorage.getItem('access_token');
        if (!token) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        // Получаем информацию о конспекте
        const notebookResponse = await axiosInstance.get(`/notebooks/${id}/`);
        const usernameCurrent = localStorage.getItem('username');

        // Проверяем, является ли пользователь владельцем
        if (notebookResponse.data.owner_details.username === usernameCurrent) {
          setHasAccess(true);
          setLoading(false);
          return;
        }

        // Проверяем, является ли пользователь редактором
        const collabResponse = await axiosInstance.get(`/notebooks/${id}/collaborators/`);
        const userCollab = collabResponse.data.find(
          c => c.user_details.username === usernameCurrent
        );

        if (userCollab && userCollab.role === 'editor') {
          setHasAccess(true);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        message.error('Ошибка при проверке прав доступа');
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [id]);

  if (loading) {
    return <div style={{textAlign: 'center', marginTop: 50}}><Spin size="large"/></div>;
  }

  if (!hasAccess) {
    // Перенаправляем на страницу просмотра
    return <Navigate to={`/notebook/${id}`} replace/>;
  }

  return children;
};

export default ProtectedEditRoute;