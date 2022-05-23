/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { adminActions, agencyActions  } from '../../actions';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Col, Row, Button, Form, FormGroup, Label, Container, Alert, Spinner  } from 'reactstrap';
import { useForm  } from "react-hook-form";
import Datetime from 'react-datetime';
import { history } from '../../helpers';
import { useLocation } from "react-router-dom";
import moment from 'moment';

function AdminUpdatePage() {

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

    const user = useSelector(state => state.authentication.user);

    //Manejo de select
    const [agencySelected, setAgencySelected] = useState('');
    const [statusSelected, setStatusSelected] = useState('');

    const handleChange = (e) =>  {
        setAgencySelected( e.target.value);
    }

    const handleChangeStatus = (e) =>  {
        setStatusSelected( e.target.value);
    }

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

    //Fechas válidas 
    var validDates = Datetime.moment().subtract(80, 'year');
    var validBday = Datetime.moment().subtract(18, 'year');
    var initialViewDate = Datetime.moment().subtract(18, 'year');
    var valid = function( current ){
        return current.isAfter( validDates ) && current.isBefore(validBday);
    };

    const dispatch = useDispatch();

    //Obtener estados del docente
    const adminState = useSelector(state => state.admin.admin);
    const searching = useSelector(state => state.admin.searching);
    const admins = useSelector(state => state.admin);
    //obtener docente del state
    const [admin, setAdmin] = useState(null);

    //obtener fechas
    const [date, setDate] = useState(null)

    /**
     * Obtener parametros del docente (id)
     */
    useEffect(() => {

        if(location.state === undefined){
            history.goBack();
        }else{
            //Consultar admin por id de user
            dispatch(adminActions.getAdmin( location.state.id ));
        }
    }, [location]);

    //Asignar admin obtenido del state a la variable
    useEffect(() => {
        if(admins.searched){
            setAdmin(adminState);
            var newDate = moment(adminState.birthday).utc().format("YYYY-MM-DD");
            setAgencySelected(adminState.agency);
            setStatusSelected(adminState.status);
            setDate(newDate);
        }
    },[admins.searched]);

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
    const { handleSubmit, register, errors } = useForm();

    //Registrar data
    const onUpdateData = (data, e) => {
        dispatch(adminActions.updateAdmin( location.state.id, data ));
    };

    //State de actualizacion
    const updating = useSelector(state => state.admin.updating);

    //Actualizar estado del docente al cambio de información
    useEffect(() => {
        if(admins.success){
            setAdmin(admins.adminUpdated);
        }
    },[admins.success]);

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
                                <h3>Actualizar Usuario</h3>
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
                                {searching &&  <div className="d-flex justify-content-center">
                                    <Spinner color="primary" />
                                </div>}
                                {admin &&
                                <Form onSubmit={handleSubmit(onUpdateData)}className="form">
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
                                                    required: "El email es requerido",
                                                })}
                                                defaultValue={admin.email}
                                            />
                                            {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                                        </FormGroup>
                                        </Col>
                                        <Col md={6}>
                                        <FormGroup>
                                            <Label for="document">CURP</Label>
                                            <input
                                                maxLength="150"
                                                autoComplete="off"
                                                className={'form-control' + (errors.document ? ' is-invalid' : '')}
                                                name="document"
                                                ref={register({
                                                    minLength: { value: 18, message: 'Ingrese un CURP válido' },
                                                })}
                                                defaultValue={admin.document}
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
                                                defaultValue={admin.firstName}
                                            />
                                            {errors.firstName && <div className="invalid-feedback">{errors.firstName.message}</div>}
                                        </FormGroup>
                                        </Col>
                                        <Col md={4}>
                                        <FormGroup>
                                            <Label for="firstName">Apellidos</Label>
                                            <input
                                                maxLength="150"
                                                autoComplete="off"
                                                className={'form-control' + (errors.lastName ? ' is-invalid' : '')}
                                                name="lastName"
                                                ref={register({
                                                    required: "El apellido es requerido",
                                                })}
                                                defaultValue={admin.lastName}
                                            />
                                            {errors.lastName && <div className="invalid-feedback">{errors.lastName.message}</div>}
                                        </FormGroup>
                                        </Col>
                                        <Col md={4}>
                                        <FormGroup>
                                            <Label for="birthday">Fecha de Nacimiento</Label>
                                            <Datetime locale="Es-es" timeFormat={false} initialValue={admin.birthday ? moment(admin.birthday).utc().format('YYYY-MM-DD'):''}
                                                closeOnSelect
                                                isValidDate={ valid }
                                                initialViewDate = {initialViewDate}
                                                dateFormat={'YYYY-MM-DD'}
                                                inputProps={{ 
                                                    name: 'birthday', 
                                                    ref:(register({
                                                        required: "La fecha de nacimiento es requerida",
                                                    })),
                                                    autoComplete:"off",
                                                    className: ('form-control' + (errors.birthday ? ' is-invalid' : '')),
                                                }}
                                                defaultValue = {date}
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
                                                    defaultValue={admin.phone}
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
                                                defaultValue={admin.whatsapp}
                                            />
                                            {errors.whatsapp && <div className="invalid-feedback">{errors.whatsapp.message}</div>}
                                        </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row form>
                                        <Col md={12}>
                                        <FormGroup>
                                            <Label for="address">Dirección</Label>
                                            <input
                                                maxLength="150"
                                                autoComplete="off"
                                                className={'form-control' + (errors.address ? ' is-invalid' : '')}
                                                name="address"
                                                ref={register({
                                                    required: "La dirección es requerida",
                                                })}
                                                defaultValue={admin.address}
                                            />
                                            {errors.address && <div className="invalid-feedback">{errors.address.message}</div>}
                                        </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row form>
                                        <Col md={4}>
                                        <FormGroup>
                                            <Label for="city">Ciudad</Label>
                                            <input
                                                maxLength="150"
                                                autoComplete="off"
                                                className={'form-control' + (errors.city ? ' is-invalid' : '')}
                                                name="city"
                                                ref={register({
                                                    required: "La ciudad es requerida",
                                                })}
                                                defaultValue={admin.city}
                                            />
                                            {errors.city && <div className="invalid-feedback">{errors.city.message}</div>}
                                        </FormGroup>
                                        </Col>
                                        <Col md={4}>
                                        <FormGroup>
                                            <Label for="state">Estado/Municipio</Label>
                                            <input
                                                maxLength="150"
                                                autoComplete="off"
                                                className={'form-control' + (errors.state ? ' is-invalid' : '')}
                                                name="state"
                                                ref={register({
                                                    required: "La ciudad es requerida",
                                                })}
                                                defaultValue={admin.state}
                                            />
                                            {errors.state && <div className="invalid-feedback">{errors.state.message}</div>}
                                        </FormGroup>
                                        </Col>
                                        <Col md={4}>
                                        <FormGroup>
                                            <Label for="zip">Código Postal</Label>
                                            <input
                                                maxLength="20"
                                                autoComplete="off"
                                                className={'form-control' + (errors.zip ? ' is-invalid' : '')}
                                                name="zip"
                                                ref={register({
                                                    required: "El código zip es requerido",
                                                })}
                                                defaultValue={admin.zip}
                                            />
                                            {errors.zip && <div className="invalid-feedback">{errors.zip.message}</div>}
                                        </FormGroup>
                                        </Col>
                                        <Col md={(user.su == false) ? 12:6}>
                                            <FormGroup>
                                                <Label for="agency">Sede</Label>{' '}
                                                {getting && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                                <select className={'form-control' + (errors.agency ? ' is-invalid' : '')} name="agency"
                                                    value={agencySelected} onChange={handleChange}
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
                                        {(user.su == true) && 
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label for="status">Estado</Label>
                                                    <select className={'form-control' + (errors.status ? ' is-invalid' : '')} name="status"
                                                        value={statusSelected} onChange={handleChangeStatus}
                                                        ref={register({ 
                                                                required: "El estado es requerido" 
                                                            })}>
                                                            <option key="" name="" value=""></option>
                                                            <option key="1" name="1" value="1">Activo</option>
                                                            <option key="2" name="2" value="2">Bloqueado</option>
                                                    </select>
                                                    {errors.status && <div className="invalid-feedback d-block">{errors.status.message}</div>}
                                                </FormGroup>
                                            </Col>
                                        }
                                    </Row>
                                    <div className="d-flex justify-content-between">
                                        <Button className="btn-round" color="primary" disabled={updating}>
                                            {updating && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                            Actualizar
                                        </Button>
                                        <Button className="btn-round" outline  onClick={e =>{e.preventDefault(); history.goBack();} }>Cancelar</Button>
                                    </div>
                                </Form>
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

export default AdminUpdatePage;