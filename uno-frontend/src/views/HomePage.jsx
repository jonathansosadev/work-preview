/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { Button, Col, Modal } from 'reactstrap';
import { useSelector } from 'react-redux';
import { history } from '../helpers';
// core components
import AdminNavbar from "../components/Navbars/AdminNavbar";
//import DefaultFooter from "../components/Footers/DefaultFooter";
import SideBar from "../components/SideBar/SideBar"

function HomePage() {
    const user = useSelector(state => state.authentication.user);

    useEffect(() => {
        document.body.classList.add("landing-page");
        document.body.classList.add("sidebar-collapse");
        document.documentElement.classList.remove("nav-open");
        return function cleanup() {
            document.body.classList.remove("landing-page");
            document.body.classList.remove("sidebar-collapse");
        };
    }); 

    //Modal genérico y mensaje
	const [modalVisible, setModalVisible] = useState(false);
	const [modalMsg, setModalMsg] = useState('');

	/**
	 * 	Cerrar sesion
	 */
    const handleLogout = () => {
		setModalVisible(true);
		setModalMsg('¿Está seguro que desea salir del sistema?');
    }

    return (
        <>
            <div className="d-flex" id="wrapper">
                <SideBar/>
                <div id="page-content-wrapper">
                    <AdminNavbar/>
                    <div className="container">
                        <Col md="4">
                            {user && <>
                                <h2 style={{fontWeight:"400", color:"#5A0C0D", marginBottom:0}}>Bienvenido</h2>
                                <h1 style={{fontWeight:"400", color:"#707070", fontSize:'4em'}}>{user.firstName}</h1>  
                            </>
                            }
                        </Col>
                        <div className="text-center">
                            <Button className="btn-round"  color="secondary" size="md" outline
                                style={{fontWeight: "bold", minWidth:200}}
                                onClick={handleLogout}
                            > SALIR
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <Modal toggle={() => {setModalVisible(false); setModalMsg('')}} isOpen={modalVisible}>
                <div className="modal-header">
                    <h5 className="modal-title">Cerrar sesión</h5>
                    <button aria-label="Close" className="close" type="button" onClick={() =>  {setModalVisible(false); setModalMsg('')}}>
                        <span aria-hidden={true}>×</span>
                    </button>
                </div>
                <div className="modal-body">
                    <p>{modalMsg}</p>
                </div>
                <div className="modal-footer mr auto">
                    <Button color="primary" className="btn-round" onClick={(e)=>{e.preventDefault(); history.push('/')}}>
                        Aceptar
                    </Button>
                    <Button color="secondary" className="btn-round" outline type="button" onClick={() =>  {setModalVisible(false); setModalMsg('')}}>
                        Cancelar
                    </Button>
                </div>
            </Modal>
        </>
    );
}

export default HomePage;