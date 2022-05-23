/* eslint-disable */
import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { agencyActions, terminalActions } from '../../actions';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Col, Row, Button, Form, FormGroup, Label, Container, Alert, Spinner  } from 'reactstrap';
import { useForm, Controller  } from "react-hook-form";
import { history } from '../../helpers';
import { useLocation } from "react-router-dom";
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';

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
        //console.log(data)
        dispatch(agencyActions.updateAgency( location.state.id, data, user ));
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

    //obtener terminales para multiselect
    const getting = useSelector(state => state.terminal.getting);
    const terminals = useSelector(state => state.terminal);
    useEffect(() => {
        dispatch(terminalActions.listUnused());
    },[]);

    const [listTerminals, setListTerminals] = useState([]);

    useEffect(() => {
        if(terminals.obtained && agency){
            //Añadir al typeAhead las terminales sin usar y la que trae
            let terminal = agency.terminal;

            let tahead = []
            for (let item of terminal) {
                tahead.push(item);
            }
            for (let item of terminals.list) {
                tahead.push(item);
            }
            setListTerminals(tahead);
        }
    },[terminals.obtained, agency]);

    const TypeAhead = useRef(null);

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
                                <h3 style={{ fontWeight:'bold',fontStyle: 'italic'}}>Actualizar sede</h3>
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
                                            <Label for="attendant">Nombre del encargado</Label>
                                            <input
                                                maxLength="100"
                                                autoComplete="off"
                                                className={'form-control' + (errors.attendant ? ' is-invalid' : '')}
                                                name="attendant"
                                                ref={register({
                                                    required: "El encargado es requerido",
                                                })}
                                                defaultValue={agency.attendant}
                                            />
                                            {errors.attendant && <div className="invalid-feedback">{errors.attendant.message}</div>}
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
                                    <FormGroup>
                                        <Label for="terminal">Terminales</Label>
                                        {getting && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                        <Controller
                                            name="terminal"
                                            control={control}
                                            rules={{
                                                required: "Seleccione al menos una terminal",
                                                validate: terminal => {
                                                    return Array.isArray(terminal) && terminal.length > 0;
                                                }
                                            }}
                                            defaultValue={agency.terminal}
                                            as={
                                                <Typeahead
                                                    ref={TypeAhead}
                                                    isInvalid={errors.terminal ? true:false}
                                                    id="matter-select"
                                                    labelKey={option => `${option.code} - ${option.serial}`}
                                                    multiple
                                                    defaultSelected={agency.terminal}
                                                    name="terminal"
                                                    options={listTerminals}
                                                    placeholder="Seleccione terminales"  
                                                    emptyLabel="No hay resultados"
                                                />
                                            }
                                        />
                                        {errors.terminal && <div className="invalid-feedback d-block">Seleccione al menos una terminal</div>}
                                    </FormGroup> 
                                    <div className="d-flex justify-content-between">
                                        <Button color="primary" disabled={updating}>
                                            {updating && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                            Actualizar
                                        </Button>
                                        <Button onClick={e =>{e.preventDefault(); history.goBack();} }>Cancelar</Button>
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