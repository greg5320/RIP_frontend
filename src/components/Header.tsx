import React, { useEffect } from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/index'; 
import { logoutUser } from '../store/authSlice'; 
import 'bootstrap/dist/css/bootstrap.min.css';

const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const isStaff = useSelector((state: RootState) => state.auth.is_staff);
  const [username, setUsername] = React.useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (user) {
          const response = await api.users.usersProfileUpdate({
            withCredentials: true,
          }); 
          const myData = response.data;
          setUsername(myData.username);
        }
      } catch (error) {
        console.error('Ошибка при получении профиля:', error);
        setUsername(null); 
      }
    };

    if (user && !username) {
      fetchUserProfile();
    }
  }, [user, username]);

  const handleLogout = async () => {
    try {
      await api.users.usersLogoutCreate();
      dispatch(logoutUser()); 
      setUsername(null); 
      navigate('/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  const handleLoginClick = () => {
    navigate('/login', { replace: true });
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>Домой</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/maps">
              <Nav.Link>Карты</Nav.Link>
            </LinkContainer>
            {isStaff && ( 
              <LinkContainer to="/maps/edit">
                <Nav.Link>Список карт</Nav.Link>
              </LinkContainer>
            )}
          </Nav>
          
          <Nav className="ms-auto">
            {username ? (
              <NavDropdown title={username} id="basic-nav-dropdown">
                <NavDropdown.Item as="button" onClick={() => navigate('/profile')}>
                  Профиль
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as="button" onClick={handleLogout}>
                  Выйти
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Button onClick={handleLoginClick} className="enter-button">Войти</Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
