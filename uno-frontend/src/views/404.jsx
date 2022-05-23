import React, { useEffect } from 'react';
// reactstrap components
import {
    Button,
    Container,
    Row,
} from "reactstrap";
// core components
import LoginNavbar from "../components/Navbars/LoginNavbar";
import TransparentFooter from "../components/Footers/TransparentFooter";
import login2 from '../assets/img/login-2.png';
import { history } from '../helpers';
import { Icon } from '@iconify/react';
import alertFill from '@iconify-icons/ri/alert-fill';


function NotFound() {

    useEffect(() => {
        document.body.classList.add("signup-page");
        document.body.classList.add("sidebar-collapse");
        document.documentElement.classList.remove("nav-open");
        return function cleanup() {
            document.body.classList.remove("landing-page");
            document.body.classList.remove("sidebar-collapse");
        };
    });

    return (
        <>
		<LoginNavbar />
        <div className="page-header clear-filter">
            <div className="page-header-image" style={{ backgroundImage: `url(${login2})`}}></div>
            <div className="content">
                <Container>
                    <Row className="justify-content-center">
                        <div className="col-md-6 col-lg-4">
                            <div className="card-signup card">
                                <div className="card-body">
                                    <h4 className="text-center card-title"><Icon icon={alertFill} color="red"/> Página no encontrada</h4>
                                    <Button block className="btn-round" outline onClick={e =>{e.preventDefault(); history.goBack();} }>Regresar</Button>
                                </div>
                            </div>
                        </div>
                    </Row>
                </Container>
            </div>
            <TransparentFooter />
        </div>
		</>
    );
}

export default NotFound;