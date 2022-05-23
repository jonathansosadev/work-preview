/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { terminalActions } from '../../actions';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Col, Row, Button, Form, FormGroup, Label, Container, Alert  } from 'reactstrap';
import { useForm  } from "react-hook-form";
import { history } from '../../helpers';
function TerminalCreatePage() {

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
    const { handleSubmit, register, errors, reset } = useForm();

    //Registrar data
    const onCreateData = (data, e) => {
        dispatch(terminalActions.createTerminal( data ));
    };

    //State de guardado
    const registering = useSelector(state => state.terminal.registering);
    const terminals = useSelector(state => state.terminal);
    //Actualizar estado de terminal al cambio de información
    useEffect(() => {
        if(terminals.success){
            reset();
        }
    },[terminals.success]);
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
                                <h3 style={{ fontWeight:'bold',fontStyle: 'italic'}}>Añadir terminal</h3>
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
                                <Form onSubmit={handleSubmit(onCreateData)} className="form">
                                    <Row form>
                                        <Col md={6}>
                                        <FormGroup>
                                            <Label for="code">Código</Label>
                                            <input
                                                maxLength="20"
                                                autoComplete="off"
                                                className={'form-control' + (errors.code ? ' is-invalid' : '')}
                                                name="code"
                                                ref={register({
                                                    required: "El código es requerido",
                                                })}
                                            />
                                            {errors.code && <div className="invalid-feedback">{errors.code.message}</div>}
                                        </FormGroup>
                                        </Col>
                                        <Col md={6}>
                                        <FormGroup>
                                            <Label for="serial">Serial</Label>
                                            <input
                                                maxLength="20"
                                                autoComplete="off"
                                                className={'form-control' + (errors.serial ? ' is-invalid' : '')}
                                                name="serial"
                                                ref={register({
                                                    required: "El serial es requerido",
                                                })}
                                            />
                                            {errors.serial && <div className="invalid-feedback">{errors.serial.message}</div>}
                                        </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row form>
                                        <Col md={4}>
                                            <FormGroup>
                                                <Label for="bank">Banco</Label>
                                                <input
                                                    maxLength="100"
                                                    autoComplete="off"
                                                    className={'form-control' + (errors.bank ? ' is-invalid' : '')}
                                                    name="bank"
                                                    ref={register({
                                                        required: "El banco es requerido",
                                                    })}
                                                />
                                                {errors.bank && <div className="invalid-feedback">{errors.bank.message}</div>}
                                            </FormGroup>
                                        </Col>
                                        <Col md={4}>
                                            <FormGroup>
                                                <Label for="brand">Marca</Label>
                                                <input
                                                    maxLength="50"
                                                    autoComplete="off"
                                                    className={'form-control' + (errors.brand ? ' is-invalid' : '')}
                                                    name="brand"
                                                    ref={register({
                                                        required: "El marca es requerida",
                                                    })}
                                                />
                                                {errors.brand && <div className="invalid-feedback">{errors.brand.message}</div>}
                                            </FormGroup>
                                        </Col>
                                        <Col md={4}>
                                            <FormGroup>
                                                <Label for="model">Modelo</Label>
                                                <input
                                                    maxLength="50"
                                                    autoComplete="off"
                                                    className={'form-control' + (errors.model ? ' is-invalid' : '')}
                                                    name="model"
                                                    ref={register({
                                                        required: "El modelo es requerido",
                                                    })}
                                                />
                                                {errors.model && <div className="invalid-feedback">{errors.model.message}</div>}
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <FormGroup>
                                        <Label for="description">Descripción</Label>
                                        <input
                                            maxLength="250"
                                            autoComplete="off"
                                            className={'form-control' + (errors.description ? ' is-invalid' : '')}
                                            name="description"
                                            ref={register}
                                        />
                                        {errors.description && <div className="invalid-feedback">{errors.description.message}</div>}
                                    </FormGroup>
                                    <div className="d-flex justify-content-between">
                                        <Button color="primary" disabled={registering}>
                                            {registering && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                            Guardar
                                        </Button>
                                        <Button onClick={e =>{e.preventDefault(); history.goBack();} }>Cancelar</Button>
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

export default TerminalCreatePage;