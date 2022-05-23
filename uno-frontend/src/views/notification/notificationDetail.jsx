/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notificationActions } from '../../actions';
import { history } from '../../helpers';
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Row, Col, Button, Spinner, Container } from 'reactstrap';
import '../../assets/css/table.css';
import { useLocation } from "react-router-dom";

function NotificationDetailPage() {

    const location = useLocation();
    const dispatch = useDispatch();

  	useEffect(() => {
		document.body.classList.add("landing-page");
		document.body.classList.add("sidebar-collapse");
		document.documentElement.classList.remove("nav-open");
		return function cleanup() {
			document.body.classList.remove("landing-page");
			document.body.classList.remove("sidebar-collapse");
		};
  	});
      
    const notificationState = useSelector(state => state.notification.notification);
    const searching = useSelector(state => state.notification.searching);
    const [notification, setNotification] = useState(null);  

	//Obtener parametros de la notificación
    useEffect(() => {
        if(location.state === undefined){
            history.goBack();
        }else{
			console.log('location.state',location.state)
            dispatch(notificationActions.getNotification( location.state.id ));
        }
    }, [location]);

    useEffect(() => {
		setNotification(notificationState);
    },[notificationState]);

    return (
        <>
            <div className="d-flex" id="wrapper">
				<SideBar/>
				<div id="page-content-wrapper">
					<AdminNavbar/>
                    <div className="container-fluid">
                        <Container>
                            <Row>
                                <Col sm="12" md={{ size: 8, offset: 2 }}>
                                    <div className="d-flex justify-content-between">
                                        <div className="align-self-center">
                                            <h3 style={{ marginBottom: '0' }}>Detalle Notificación</h3>
                                        </div>
                                        <Button onClick={ ()=> history.goBack() } color="secondary" className="btn-round" outline >
                                            Regresar
                                        </Button>
                                    </div>
                                    {searching &&  <div className="d-flex justify-content-center">
                                        <Spinner color="primary" />
                                    </div>}  
                                    {notification && <>
                                        <p style={{ fontWeight:"bold" }}>{notification.title}</p>
                                        <div dangerouslySetInnerHTML={{ __html: notification.description }}></div>
                                    </>
                                    }
                                </Col>
                            </Row>
                        </Container>
					</div>
				</div>
            </div>
        </>
    );
}

export default NotificationDetailPage;