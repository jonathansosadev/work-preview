/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { inscriptionActions, agencyActions } from '../../actions';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Col, Row, Button, Form, FormGroup, Label, Container, Alert, Spinner  } from 'reactstrap';
import { useForm  } from "react-hook-form";
import { history } from '../../helpers';
import { useLocation } from "react-router-dom";

function InscriptionUpdatePage() {

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

    const inscriptionState = useSelector(state => state.inscription.inscription);
    const searching = useSelector(state => state.inscription.searching);
    const inscriptions = useSelector(state => state.inscription);
    const [inscription, setInscription] = useState(null);

    useEffect(() => {
        if(location.state === undefined){
            history.goBack();
        }else{
            dispatch(inscriptionActions.getInscription( location.state.id ));
            
        }
    }, [location]);

    const dispatch = useDispatch();

    //Asignar inscripcion obtenido del state a la variable
    useEffect(() => {
        if(inscriptions.searched){
            setInscription(inscriptionState);
            //obtener sede del state
            setAgencySelected(inscriptionState.agency);
            setTurnSelected(inscriptionState.turn)
        }
    },[inscriptions.searched]);


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

    //Manejo de select
    const [agencySelected, setAgencySelected] = useState('');
    const [turnSelected, setTurnSelected] = useState('');

    const handleChange = (e) =>  {
        setAgencySelected( e.target.value);
    }

    const handleChangeTurn = (e) =>  {
        setTurnSelected( e.target.value);
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

    //Form Data
    const { handleSubmit, register, errors } = useForm();

    //Registrar data
    const onUpdateData = (data, e) => {
        dispatch(inscriptionActions.updateInsciption( location.state.id, data ));
    };

    //State de actualizacion
    const updating = useSelector(state => state.inscription.updating);

    //Actualizar estado de sede al cambio de información
    useEffect(() => {
        if(inscriptions.success){
            setInscription(inscriptions.inscriptionUpdated);
        }
    },[inscriptions.success]);

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
                                <h3>Actualizar inscripción</h3>
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
                                {inscription &&
                                <Form onSubmit={handleSubmit(onUpdateData)} className="form">
                                    <Row form>
                                        <Col md={6}>
                                            <FormGroup>
                                                <Label for="agency">Sucursal</Label>{' '}
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
                                        <Col md={6}>
                                            <FormGroup className="mb-2 mr-sm-2 mb-sm-2">
                                                <Label for="agency">Turno</Label>{' '}
                                                <select className={'form-control' + (errors.turn ? ' is-invalid' : '')} name="turn"
                                                    value={turnSelected} onChange={handleChangeTurn}
                                                    ref={register({ 
                                                            required: "El turno es requerido" 
                                                        })}>
                                                        <option key="" name="" value="">Seleccione turno</option>
                                                        <option key="Matutino" name="Matutino" value="Matutino">Matutino</option>
                                                        <option key="Vespertino" name="Vespertino" value="Vespertino">Vespertino</option>
                                                        <option key="Sabatino" name="Sabatino" value="Sabatino">Sabatino</option>
                                                </select>
                                                {errors.turn && <div className="invalid-feedback d-block">{errors.turn.message}</div>}
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

export default InscriptionUpdatePage;