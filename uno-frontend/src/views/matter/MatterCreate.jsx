/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { matterActions, careerActions } from '../../actions';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Col, Row, Button, Form, FormGroup, Label, Container, Alert  } from 'reactstrap';
import { useForm  } from "react-hook-form";
import { history } from '../../helpers';

function MatterCreatePage() {

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
        dispatch(matterActions.createMatter( data ));
    };

    const statusSave = useSelector(state => state.matters);
    //Verificar si guardo y limpiar form
    useEffect(() => {
        if(statusSave.success){ 
            reset();
        }
    },[statusSave.success]);

    //State de guardado
    const registering = useSelector(state => state.matters.registering);

    //obtener carreras para select
    const getting = useSelector(state => state.careers.getting);
    const careers = useSelector(state => state.careers);
    useEffect(() => {
        dispatch(careerActions.listCareers());
    },[]);

    const [listCareers, setListCareers] = useState(null);

    useEffect(() => {
        if(careers.obtained){
            setListCareers(careers.list);
        }
    },[careers.obtained]);

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
                                <h3>Agregar Materia</h3>
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
                                            <Label for="career">Carrera</Label>{' '}
                                            {getting && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                            <select className={'form-control' + (errors.career ? ' is-invalid' : '')} name="career"
                                                ref={register({ 
                                                        required: "La carrera es requerida" 
                                                    })}>
                                                    <option key="" name="" value=""></option>
                                                    {listCareers && listCareers.map(list => 
                                                        <option
                                                            key={list.id}
                                                            name={list.id}
                                                            value={list.id}>
                                                            {list.name}
                                                        </option>
                                                    )}
                                            </select>
                                            {errors.career && <div className="invalid-feedback d-block">{errors.career.message}</div>}
                                        </FormGroup>
                                        </Col>
                                        <Col md={6}>
                                        <FormGroup>
                                            <Label for="quarter">Cuatrimestre</Label>
                                            <input
                                                type="number"
                                                maxLength="1"
                                                autoComplete="off"
                                                className={'form-control' + (errors.quarter ? ' is-invalid' : '')}
                                                name="quarter"
                                                ref={register({
                                                    required: "El cuatrimestre es requerido",
                                                })}
                                                min="1" max="9"
                                            />
                                            {errors.quarter && <div className="invalid-feedback">{errors.quarter.message}</div>}
                                        </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row form>
                                        <Col md={6}>
                                        <FormGroup>
                                            <Label for="name">Nombre</Label>
                                            <input
                                                maxLength="50"
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
                                    </Row>
                                    <FormGroup>
                                        <Label for="description">Descripción</Label>
                                        <input
                                            maxLength="80"
                                            autoComplete="off"
                                            className={'form-control' + (errors.description ? ' is-invalid' : '')}
                                            name="description"
                                            ref={register({})}
                                        />
                                        {errors.description && <div className="invalid-feedback">{errors.description.message}</div>}
                                    </FormGroup>
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

export default MatterCreatePage;