/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { agencyActions } from '../../actions';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Col, Row, Button, Form, FormGroup, Label, Container, Alert, Spinner  } from 'reactstrap';
import { useForm, Controller  } from "react-hook-form";
import { history } from '../../helpers';
import { useLocation } from "react-router-dom";
import NumberFormat from 'react-number-format';

function AgencyUpdatePage() {

    const location = useLocation();

    const agencyState = useSelector(state => state.agencies.agency);
    const searching = useSelector(state => state.agencies.searching);
    //obtener sede del state
    const [agency, setAgency] = useState(null);

    useEffect(() => {
        if(location.state === undefined){
            history.goBack();
        }else{
            dispatch(agencyActions.getAgency( location.state.id ));
            
        }
    }, [location]);

    useEffect(() => {
		setAgency(agencyState);
    },[agencyState]);


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
    const { handleSubmit, register, errors, control } = useForm();

    //Registrar data
    const onUpdateData = (data, e) => {
        dispatch(agencyActions.updateAgency( location.state.id, data ));
    };

    //State de actualizacion
    const updating = useSelector(state => state.agencies.updating);
    const agencies = useSelector(state => state.agencies);

    //Actualizar estado de sede al cambio de información
    useEffect(() => {
        if(agencies.success){
            setAgency(agencies.agencyUpdated);
        }
    },[agencies.success]);

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
                                <h3>Actualizar sede</h3>
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
                                {agency &&
                                <Form onSubmit={handleSubmit(onUpdateData)} className="form">
                                    <Row form>
                                        <Col md={6}>
                                        <FormGroup>
                                            <Label for="name">Nombre</Label>
                                            <input
                                                maxLength="20"
                                                autoComplete="off"
                                                className={'form-control' + (errors.name ? ' is-invalid' : '')}
                                                name="name"
                                                ref={register({
                                                    required: "El nombre es requerido",
                                                })}
                                                defaultValue={agency.name}
                                            />
                                            {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                                        </FormGroup>
                                        </Col>
                                        <Col md={6}>
                                        <FormGroup>
                                            <Label for="phone">Teléfono</Label>
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
                                                defaultValue={agency.phone}
                                            />
                                            {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
                                        </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row form>
                                        <Col md={6}>
                                        <FormGroup>
                                            <Label for="director">Director(a)</Label>
                                            <input
                                                maxLength="40"
                                                autoComplete="off"
                                                className={'form-control' + (errors.director ? ' is-invalid' : '')}
                                                name="director"
                                                ref={register({
                                                    required: "El(la) director(a) es requerido",
                                                })}
                                                defaultValue={agency.director}
                                            />
                                            {errors.director && <div className="invalid-feedback">{errors.director.message}</div>}
                                        </FormGroup>
                                        </Col>
                                        <Col md={6}>
                                        <FormGroup>
                                            <Label for="schedule">Horario</Label>
                                            <input
                                                maxLength="40"
                                                autoComplete="off"
                                                className={'form-control' + (errors.schedule ? ' is-invalid' : '')}
                                                name="schedule"
                                                ref={register({
                                                    required: "El horario es requerido",
                                                })}
                                                defaultValue={agency.schedule}
                                            />
                                            {errors.schedule && <div className="invalid-feedback">{errors.schedule.message}</div>}
                                        </FormGroup>
                                        </Col>
                                    </Row>
                                    <FormGroup>
                                        <Label for="address">Dirección</Label>
                                        <input
                                            maxLength="250"
                                            autoComplete="off"
                                            className={'form-control' + (errors.address ? ' is-invalid' : '')}
                                            name="address"
                                            ref={register({
                                                required: "El dirección es requerida"
                                            })}
                                            defaultValue={agency.address}
                                        />
                                        {errors.address && <div className="invalid-feedback">{errors.address.message}</div>}
                                    </FormGroup>
                                    <Row form>
                                        <Col md={6}>
                                            <FormGroup>
                                                <Label for="inscription">Precio de inscripción</Label>
                                                <Controller
                                                    name="inscription"
                                                    control={control}
                                                    rules={{
                                                        min: {
                                                            value: 1,
                                                            message: "El valor es requerido"
                                                        },
                                                        required: "El valor es requerido",
                                                    }}
                                                    defaultValue ={agency.inscription}
                                                    as={<NumberFormat className={'form-control' + (errors.inscription ? ' is-invalid' : '')} thousandSeparator={true} />}
                                                />
                                                {errors.inscription && <div className="invalid-feedback">{errors.inscription.message}</div>}
                                            </FormGroup>
                                        </Col>
                                        <Col md={6}>
                                            <FormGroup>
                                                <Label for="monthlyPayment">Precio de mensualidad</Label>
                                                <Controller
                                                    name="monthlyPayment"
                                                    control={control}
                                                    rules={{
                                                        min: {
                                                            value: 1,
                                                            message: "El valor es requerido"
                                                        },
                                                        required: "El valor es requerido",
                                                    }}
                                                    defaultValue ={agency.monthlyPayment}
                                                    as={<NumberFormat className={'form-control' + (errors.monthlyPayment ? ' is-invalid' : '')} thousandSeparator={true} />}
                                                />
                                                {errors.monthlyPayment && <div className="invalid-feedback">{errors.monthlyPayment.message}</div>}
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

export default AgencyUpdatePage;