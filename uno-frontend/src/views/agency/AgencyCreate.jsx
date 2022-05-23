/* eslint-disable */
import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { agencyActions } from '../../actions';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Col, Row, Button, Form, FormGroup, Label, Container, Alert  } from 'reactstrap';
import { useForm, Controller  } from "react-hook-form";
import { history } from '../../helpers';
import NumberFormat from 'react-number-format';

function AgencyCreatePage() {

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
    const { handleSubmit, register, errors, reset, control } = useForm();

    //Registrar data
    const onCreateData = (data, e) => {
        dispatch(agencyActions.createAgency( data ));
    };

    //State de guardado
    const registering = useSelector(state => state.agencies.registering);
    const agencies = useSelector(state => state.agencies);

    //Actualizar estado de sede al cambio de información
    useEffect(() => {
        if(agencies.success){
            reset();
            reset({inscription:'', monthlyPayment:''});
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
                                <h3>Agregar sede</h3>
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
                                                maxLength="20"
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
                                                    as={<NumberFormat className={'form-control' + (errors.monthlyPayment ? ' is-invalid' : '')} thousandSeparator={true} />}
                                                />
                                                {errors.monthlyPayment && <div className="invalid-feedback">{errors.monthlyPayment.message}</div>}
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

export default AgencyCreatePage;