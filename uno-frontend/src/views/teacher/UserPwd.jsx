/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { userActions } from '../../actions';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Col, Row, Button, Form, FormGroup, Label, Container, Alert, Spinner  } from 'reactstrap';
import { useForm  } from "react-hook-form";
import { history } from '../../helpers';
import { useLocation } from "react-router-dom";

function UserPwdPage() {

    const location = useLocation();

  	useEffect(() => {
		document.body.classList.add("landing-page");
		document.body.classList.add("sidebar-collapse");
		document.documentElement.classList.remove("nav-open");
		return function cleanup() {
			document.body.classList.remove("landing-page");
			document.body.classList.remove("sidebar-collapse");
		};
    });


    const dispatch = useDispatch();

    //id del usuario
    const [userId, setUserId] = useState(null);

    /**
     * Obtener parametros del usuario (id)
     */
    useEffect(() => {
        if(location.state === undefined){
            history.goBack();
        }else[
            setUserId(location.state.id)
        ]
    }, [location]);

    
    //usuario logueado
    const user = useSelector(state => state.authentication.user);

    //Alertas
    const alert = useSelector(state => state.alert);
    //Mostrar alertas
    const [visible, setVisible] = useState(true);
    const onDismiss = () => setVisible(false);

    useEffect(() => {
        if(alert.message){
            setVisible(true); 
            window.setTimeout(()=>{setVisible(false)},5000);   
        }
    },[alert]);

	//Form Data
    const { handleSubmit, register, errors, watch, reset } = useForm();

    //Registrar data
    const onUpdateData = (data, e) => {
        dispatch(userActions.updatePwd(userId, data ));
    };

    //State de actualizacion
    const updating = useSelector(state => state.users.updating);
    const users = useSelector(state => state.users);

    //Actualizar estado usuario cambio de información
    useEffect(() => {
        if(users.success){
            reset();
        }
    },[users.success]);

    let pwd = watch("password");

    return (
        <>
            <div className="d-flex" id="wrapper">
				<SideBar/>
				<div id="page-content-wrapper">
					<AdminNavbar/>
                    <div className="container-fluid">
                        <Container>
                        <Row>
                            <Col sm="8" md={{ size: 8, offset: 2 }}>
                                <h3>Resetear contraseña</h3>
                                {alert.message &&
                                    <Alert color={`alert ${alert.type}`} isOpen={visible} fade={true}>
                                        <div className="container">
                                            {alert.message}
                                            <button
                                                type="button"
                                                className="close"
                                                aria-label="Close"
                                                onClick={onDismiss}
                                            >
                                                <span aria-hidden="true">
                                                <i className="now-ui-icons ui-1_simple-remove"></i>
                                                </span>
                                            </button>
                                        </div>
                                    </Alert>
                                }
                                <Form onSubmit={handleSubmit(onUpdateData)}className="form">
                                    <Row form>
                                        <Col md={12}>
                                        <FormGroup>
                                            <Label for="password">Contraseña</Label>
                                                <input
                                                    maxLength="20"
                                                    className={'form-control' + (errors.password ? ' is-invalid' : '')}
                                                    name="password"
                                                    type="password"
                                                    ref={register({
                                                        required: "La contraseña es requerida",
                                                        minLength:{ value:6, message: "La contraseña debe contener mínimo 6 caracteres"}
                                                    })}
                                                />
                                                {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                                        </FormGroup>
                                        </Col>
                                        <Col md={12}>
                                        <FormGroup>
                                            <Label for="confirm_password">Confirmar contraseña</Label>
                                                <input
                                                    maxLength="20"
                                                    className={'form-control' + (errors.confirm_password ? ' is-invalid' : '')}
                                                    name="confirm_password"
                                                    type="password"
                                                    ref={register({
                                                        required: "La confirmación de contraseña es requerida",
                                                        validate: value => value === pwd || "Las contraseñas no coinciden"
                                                    })}
                                                />
                                                {errors.confirm_password && <div className="invalid-feedback">{errors.confirm_password.message}</div>}
                                        </FormGroup>
                                        </Col>
                                    </Row>
                                    <div className="d-flex justify-content-between">
                                        <Button color="primary" className="btn-round" disabled={updating}>
                                            {updating && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                            Actualizar
                                        </Button>
                                        <Button className="btn-round" outline onClick={e =>{e.preventDefault(); history.goBack();} }>Cancelar</Button>
                                    </div>
                                </Form>        
                            </Col>
                        </Row>
                        </Container>
                    </div>

				</div>
            </div>
        </>
    );
}

export default UserPwdPage;