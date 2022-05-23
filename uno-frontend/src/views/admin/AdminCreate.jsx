/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { adminActions, agencyActions } from '../../actions';
import moment from 'moment';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Col, Row, Button, Form, FormGroup, Label, Container, Alert, Table, Modal  } from 'reactstrap';
import { useForm  } from "react-hook-form";
import { history } from '../../helpers';
import Datetime from 'react-datetime';

function AdminCreatePage() {
  
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

        var validDate =  moment(data.birthday).isValid();

		if(data.birthday != "" && !validDate){
			setModalVisible(true);
			setModalMsg('Ingrese una fecha válida');
			return;
        }
        
        dispatch(adminActions.createAdmin( data ));
    };
    
    //Fechas válidas 
    var validDates = Datetime.moment().subtract(80, 'year');
    var validBday = Datetime.moment().subtract(18, 'year');
    var initialViewDate = Datetime.moment().subtract(18, 'year');
    var valid = function( current ){
        return current.isAfter( validDates ) && current.isBefore(validBday);
    };

    //State de guardado
    const registering = useSelector(state => state.admin.registering);

    const registerSuccess = useSelector(state => state.admin.register);

    useEffect(() => {
        if(registerSuccess){
            reset();
        }
    },[registerSuccess]);

    //Modal genérico y mensaje
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMsg, setModalMsg] = useState('');
  
    //obtener sedes para select
    const getting = useSelector(state => state.agencies.getting);
    const agencies = useSelector(state => state.agencies);
    useEffect(() => {
        dispatch(agencyActions.listAgencies());
    },[]);

    const [listAgencies, setListAgencies] = useState(null);

    useEffect(() => {
        if(agencies.obtained){
            setListAgencies(agencies.list);
        }
    },[agencies.obtained]);
      
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
                                <h3>Agregar usuario</h3>
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
                                            <Label for="email">Correo electrónico</Label>
                                            <input
                                                maxLength="150"
                                                autoComplete="off"
                                                className={'form-control' + (errors.email ? ' is-invalid' : '')}
                                                name="email"
                                                ref={register({
                                                    required: "El correo es requerido",
                                                    pattern: {
                                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                                                        message: "Correo electrónico inválido"
                                                    }
                                                })}
                                            />
                                            {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                                        </FormGroup>
                                        </Col>
                                        <Col md={6}>
                                        <FormGroup>
                                            <Label for="document">CURP</Label>
                                            <input
                                                maxLength="18"
                                                autoComplete="off"
                                                className={'form-control' + (errors.document ? ' is-invalid' : '')}
                                                name="document"
                                                ref={register({
                                                    minLength: { value: 18, message: 'Ingrese un CURP válido' },
                                                })}
                                                onInput={(e) => e.target.value = ("" + e.target.value).toUpperCase()}
                                            />
                                            {errors.document && <div className="invalid-feedback">{errors.document.message}</div>}
                                        </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row form>
                                        <Col md={4}>
                                        <FormGroup>
                                            <Label for="firstName">Nombres</Label>
                                            <input
                                                maxLength="150"
                                                autoComplete="off"
                                                className={'form-control' + (errors.firstName ? ' is-invalid' : '')}
                                                name="firstName"
                                                ref={register({
                                                    required: "El nombre es requerido",
                                                })}
                                            />
                                            {errors.firstName && <div className="invalid-feedback">{errors.firstName.message}</div>}
                                        </FormGroup>
                                        </Col>
                                        <Col md={4}>
                                        <FormGroup>
                                            <Label for="lastName">Apellidos</Label>
                                            <input
                                                maxLength="150"
                                                autoComplete="off"
                                                className={'form-control' + (errors.lastName ? ' is-invalid' : '')}
                                                name="lastName"
                                                ref={register({
                                                    required: "El apellido es requerido",
                                                })}
                                            />
                                            {errors.lastName && <div className="invalid-feedback">{errors.lastName.message}</div>}
                                        </FormGroup>
                                        </Col>
                                        <Col md={4}>
                                        <FormGroup>
                                            <Label for="birthday">Fecha de Nacimiento</Label>
                                            <Datetime locale="Es-es" timeFormat={false} closeOnSelect
                                                isValidDate={ valid }
                                                initialViewDate = { initialViewDate }
                                                dateFormat={'YYYY-MM-DD'}
                                                inputProps={{ 
                                                    name: 'birthday', 
                                                    ref:(register({
                                                        required: "La fecha de nacimiento es requerida",
                                                    })),
                                                    autoComplete:"off",
                                                    className: ('form-control' + (errors.birthday ? ' is-invalid' : '')),
                                                }}
                                            />
                                            {errors.birthday && <div className="invalid-feedback d-block">{errors.birthday.message}</div>}
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row form>
                                        <Col md={6}>
                                            <FormGroup>
                                                <Label for="phone">Teléfono para recibir llamadas y SMS</Label>
                                                <input
                                                    maxLength="20"
                                                    autoComplete="off"
                                                    className={'form-control' + (errors.phone ? ' is-invalid' : '')}
                                                    name="phone"
                                                    ref={register({
                                                        required: "El teléfono es requerido",
                                                        pattern: {
                                                            value: /^[+0-9\s]*$/,
                                                            message: "Télefono inválido"
                                                        },
                                                        minLength: { value: 10, message: 'El teléfono es requerido' },
                                                    })}
                                                />
                                                {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
                                            </FormGroup>
                                        </Col>
                                        <Col md={6}>
                                        <FormGroup>
                                            <Label for="whatsapp">Whatsapp <span style={{fontSize:12}}>(Si es igual al teléfono repetirlo)</span>
                                            </Label>
                                            <input
                                                maxLength="150"
                                                autoComplete="off"
                                                className={'form-control' + (errors.whatsapp ? ' is-invalid' : '')}
                                                name="whatsapp"
                                                ref={register({
                                                    required: "El whatsapp es requerido",
                                                    pattern: {
                                                        value: /^[+0-9\s]*$/,
                                                        message: "Télefono inválido"
                                                    },
                                                    minLength: { value: 10, message: 'El teléfono es requerido' },
                                                })}
                                            />
                                            {errors.whatsapp && <div className="invalid-feedback">{errors.whatsapp.message}</div>}
                                        </FormGroup>
                                        </Col>
                                    </Row>
                                    <FormGroup>
                                        <Label for="address">Dirección</Label>
                                        <input
                                            maxLength="200"
                                            autoComplete="off"
                                            className={'form-control' + (errors.address ? ' is-invalid' : '')}
                                            name="address"
                                            ref={register({
                                                required: "La dirección es requerida",
                                            })}
                                        />
                                        {errors.address && <div className="invalid-feedback">{errors.address.message}</div>}
                                    </FormGroup>
                                    <Row form>
                                        <Col md={4}>
                                        <FormGroup>
                                            <Label for="city">Ciudad</Label>
                                            <input
                                                maxLength="100"
                                                autoComplete="off"
                                                className={'form-control' + (errors.city ? ' is-invalid' : '')}
                                                name="city"
                                                ref={register({
                                                    required: "El ciudad es requerida",
                                                })}
                                            />
                                            {errors.city && <div className="invalid-feedback">{errors.city.message}</div>}
                                        </FormGroup>
                                        </Col>
                                        <Col md={4}>
                                        <FormGroup>
                                            <Label for="state">Estado/Municipio</Label>
                                            <input
                                                maxLength="100"
                                                autoComplete="off"
                                                className={'form-control' + (errors.state ? ' is-invalid' : '')}
                                                name="state"
                                                ref={register({
                                                    required: "El estado/municipio es requerido",
                                                })}
                                            />
                                            {errors.state && <div className="invalid-feedback">{errors.state.message}</div>}
                                        </FormGroup>
                                        </Col>
                                        <Col md={4}>
                                        <FormGroup>
                                            <Label for="zip">Código Postal</Label>
                                            <input
                                                type="Number"
                                                maxLength="20"
                                                autoComplete="off"
                                                className={'form-control' + (errors.zip ? ' is-invalid' : '')}
                                                name="zip"
                                                ref={register({
                                                    required: "El código postal es requerido",
                                                })}
                                            />
                                            {errors.zip && <div className="invalid-feedback">{errors.zip.message}</div>}
                                        </FormGroup>  
                                        </Col>
                                        <Col md={12}>
                                        <FormGroup>
                                            <Label for="agency">Sede</Label>{' '}
                                            {getting && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                            <select className={'form-control' + (errors.agency ? ' is-invalid' : '')} name="agency"
                                                ref={register({ 
                                                        required: "La sede es requerida" 
                                                    })}>
                                                    <option key="" name="" value=""></option>
                                                    {listAgencies && listAgencies.map(list => 
                                                        <option
                                                            key={list.id}
                                                            name={list.id}
                                                            value={list.id}>
                                                            {list.name}
                                                        </option>
                                                    )}
                                            </select>
                                            {errors.agency && <div className="invalid-feedback d-block">{errors.agency.message}</div>}
                                        </FormGroup>
                                        </Col>
                                    </Row>
                                </Form>
                                <div className="d-flex justify-content-between">
                                    <Button className="btn-round" color="primary" disabled={registering} onClick={handleSubmit(onCreateData)}>
                                        {registering && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                        Guardar
                                    </Button>
                                    <Button className="btn-round" outline onClick={e =>{e.preventDefault(); history.goBack();} }>Cancelar</Button>
                                </div>
                            </Col>
                        </Row>
                        </Container>
                        <Modal toggle={() => {setModalVisible(false); setModalMsg('')}} isOpen={modalVisible}>
                            <div className="modal-header">
                                <h5 className="modal-title">Usuario</h5>
                                <button aria-label="Close" className="close" type="button" onClick={() =>  {setModalVisible(false); setModalMsg('')}}>
                                    <span aria-hidden={true}>×</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>{modalMsg}</p>
                            </div>
                            <div className="modal-footer">
                                <Button className="btn-round" outline color="secondary" type="button" onClick={() =>  {setModalVisible(false); setModalMsg('')}}>
                                    Cerrar
                                </Button>
                            </div>
                        </Modal>
                    </div>

				</div>
            </div>
        </>
    );
}

export default AdminCreatePage;