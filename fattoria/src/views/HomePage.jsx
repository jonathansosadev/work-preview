/* eslint-disable */
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button, Col } from 'reactstrap';
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

    return (
        <>
            <div className="d-flex" id="wrapper">
                <SideBar/>
                <div id="page-content-wrapper">
                    <AdminNavbar/>
                    <div className="container">
                        <Col md="4">
                            <h2 style={{fontWeight:"800", fontStyle:"italic", color:"#FFCA00"}}>Bienvenido</h2>
                            <h1 className="name-user">{user.firstName}</h1>  
                        </Col>
                        <div className="text-center">
                                <Button
                                    className="btn-round"
                                    color="primary"
                                    size="md"
                                    outline
                                    style={{fontWeight: "bold", minWidth:170}}
                                    onClick={e =>{ e.preventDefault();history.push('/login'); } }
                                >
                                    SALIR
                                </Button>
                            </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default HomePage;