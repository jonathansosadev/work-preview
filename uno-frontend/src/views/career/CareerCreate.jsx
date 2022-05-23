/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { careerActions } from '../../actions';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Col, Row, Button, Form, FormGroup, Label, Container, Alert  } from 'reactstrap';
import { useForm  } from "react-hook-form";
import { history } from '../../helpers';

function CareerCreatePage() {

  	useEffect(() => {
		document.body.classList.add("landing-page");
		document.body.classList.add("sidebar-collapse");
		document.documentElement.classList.remove("nav-open");
		return function cleanup() {
			document.body.classList.remove("landing-page");
			document.body.classList.remove("sidebar-collapse");
		};
    });
      
	//usuario
    const user = useSelector(state => state.authentication.user);
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
        dispatch(careerActions.createCareer( data ));
    };

    //State de guardado
    const registering = useSelector(state => state.careers.registering);

    const careers = useSelector(state => state.careers);

    
    useEffect(() => {
        //limpiar form en guardado exitoso
        if(careers.saved){
           reset()
        }
    },[careers.saved]);

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
                                <h3>Agregar Carrera</h3>
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
                                            <Label for="name">Nombre</Label>
                                            <input
                                                maxLength="80"
                                                autoComplete="off"
                                                className={'form-control' + (errors.name ? ' is-invalid' : '')}
                                                name="name"
                                                ref={register({
                                                    required: "El nombre es requerido",
                                                })}
                                            />
                                            {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                                        </FormGroup>
                                        </Col>
                                        <Col md={6}>
                                        <FormGroup>
                                            <Label for="code">Código</Label>
                                            <input
                                                maxLength="50"
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
                                            <Label for="description">Descripción</Label>
                                            <input
                                                maxLength="80"
                                                autoComplete="off"
                                                className={'form-control' + (errors.description ? ' is-invalid' : '')}
                                                name="description"
                                                ref={register({
                                                    required: "La descripción es requerida",
                                                })}
                                            />
                                            {errors.description && <div className="invalid-feedback">{errors.description.message}</div>}
                                        </FormGroup>
                                        </Col>
                                        <Col md={6}>
                                        <FormGroup>
                                            <Label for="description">Grado</Label>
                                            <select className={'form-control' + (errors.type ? ' is-invalid' : '')} name="type"
                                                ref={register({ 
                                                        required: "El grado es requerido" 
                                                    })}>
                                                    <option key="0" name="" value="">Seleccione grado</option>
                                                    {/* <option key="1" name="1" value="1">Preparatoria</option> */}
                                                    <option key="2" name="2" value="2">Licenciatura</option>
                                                    <option key="3" name="3" value="3">Maestría</option>
                                                    <option key="4" name="4" value="4">Doctorado</option>
                                                    <option key="5" name="5" value="5">Nivelación</option>
                                            </select>
                                            {errors.type && <div className="invalid-feedback d-block">{errors.type.message}</div>}
                                        </FormGroup>
                                        </Col>
                                    </Row>
                                    
                                    <div className="d-flex justify-content-between">
                                        <Button color="primary" className="btn-round" disabled={registering}>
                                            {registering && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                            Guardar
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

export default CareerCreatePage;