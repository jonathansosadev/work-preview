/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { referenceActions } from '../../actions';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Col, Row, Button, Container, Modal, Alert, Spinner, FormGroup, Label  } from 'reactstrap';
import { useLocation } from "react-router-dom";
import styled from 'styled-components';
import '../../assets/css/pdf.css';
import { history } from '../../helpers';
import { useForm } from 'react-hook-form';

const Field = styled.span`
  font-size: 14px;
  font-weight: bold;
`;

function ReferenceApprovePage() {

    const location = useLocation();
    const user = useSelector(state => state.authentication.user);
    const dispatch = useDispatch();

  	useEffect(() => {
		document.body.classList.add("landing-page");
		document.body.classList.add("sidebar-collapse");
		document.documentElement.classList.remove("nav-open");
		return function cleanup() {
			document.body.classList.remove("landing-page");
			document.body.classList.remove("sidebar-collapse");
		};
      });
      
    //Alertas
    const alert = useSelector(state => state.alert);
    //Mostrar alertas
    const [visible, setVisible] = useState(true);
    const onDismiss = () => setVisible(false);
    
    useEffect(() => {
        if(alert.message){
            setModalQuestion(false);
            window.setTimeout(()=>{setVisible(false)},5000);   
        }
    },[alert]);

   
    const formatter = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 2
    });

    //obtener carrera del state
    const [reference, setReference] = useState(null);
    const [total, setTotal] = useState(null);
    const [status, setStatus] = useState(1);

    const referenceState = useSelector(state => state.reference.reference);
    const searching = useSelector(state => state.reference.searching);

    useEffect(() => {
        if(location.state === undefined){
            history.goBack();
        }else{
            dispatch(referenceActions.getReference( location.state.id ));
            
        }
    }, [location]);

    useEffect(() => {
        if(referenceState){
            setReference(referenceState);
            setTotal(formatter.format(referenceState.total))
            setStatus(referenceState.status)
        }
    },[referenceState]);

    const [modalQuestion, setModalQuestion] = useState(false);

    //Registrar data
    const onUpdateData = () => {
       // dispatch(referenceActions.updateReference( reference.id, user ));
    };

    //State de actualizacion
    const updating = useSelector(state => state.reference.updating);
    const references = useSelector(state => state.reference);

    //Cerrar modal en exito
    useEffect(() => {
        if(references.success){
            setStatus(2)
            setModalQuestion(false);
        }
    },[references.success]);

    const { register, handleSubmit, errors } = useForm();
    const onSubmit = data => {
        let dataUser =  {
            role: user.role,
            id: user.id
        };
        data.user = dataUser;
        dispatch(referenceActions.updateReference( reference.id, data ));
    };

    return (
        <>
            <div className="d-flex" id="wrapper">
				<SideBar/>
				<div id="page-content-wrapper">
					<AdminNavbar/>
                    <div className="container-fluid">
                        <Container >
                            <Row>
                                <Col sm="12" style={{height:'100vh'}}>
                                    <h3>Aprobación de referencia</h3>
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
                                    {reference && <>
                                        <h5 className="text-center" style={{fontWeight:'bold', fontSize:18}}>UNIVERSIDAD NACIONAL OBRERA</h5>
                                        <div className="text-center" style={{fontSize:14, marginBottom:20}}>FORMATO DE PAGO</div>
                                        <Container className="data">
                                            <Row>
                                                <Col sm="6"><Field>MATRÍCULA:</Field> {reference.student.registrationNumber}</Col>
                                                <Col sm="6"><Field>PLANTEL:</Field> {reference.agency.name}</Col>
                                            </Row>
                                            <Row style={{marginBottom:20, borderBottomWidth: 2, borderBottomColor: 'black', borderBottomStyle: 'solid'}}>
                                                <Col sm="6"><Field>ALUMNO:</Field> {`${reference.student.firstName} ${reference.student.lastName}`}</Col>
                                            </Row>
                                            <Row>
                                                <Col sm="6"><Field>CONCEPTO DE PAGO:</Field> {reference.type == 2 ? 'INSCRIPCIÓN':'COLEGIATURA'}</Col>
                                            </Row>
                                            <Row>
                                                <Col sm="6"><Field>PERIODO:</Field> {reference.period}</Col>
                                            </Row>
                                            <Row>
                                                <Col sm="6"><Field>MONTO:</Field> $ {total}</Col>
                                            </Row> 
                                            <Row>
                                                <Col sm="6"><Field>BANCO:</Field> BBVA</Col>
                                                <Col sm="6"><Field>CUENTA:</Field> {reference.account}</Col>
                                            </Row> 
                                            <Row>
                                                <Col sm="6"><Field>REFERENCIA:</Field> {reference.titular}</Col>
                                            </Row> 
                                            <Row>
                                                <Col sm="6"><Field>REFERENCIA:</Field> {reference.reference}</Col>
                                            </Row>  
                                            <Row>
                                                <Col sm="12"><Field>FAVOR DE COLOCAR LA REFERENCIA AL MOMENTO DE EFECTUAR SU PAGO, EN CASO DE NO COLOCAR LA REFERENCIA DEBERA ADJUNTAR SU COMPROBANTE DE PAGO</Field></Col>
                                            </Row>                                          
                                        </Container>
                                    </>}
                                    
                                    <div className="d-flex justify-content-between">
                                        {(reference && status !== 2) && <>
                                        <Button color="primary" disabled={updating}  className="btn-round" onClick={()=>setModalQuestion(true)}>
                                            {updating && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                            Aprobar
                                        </Button>
                                        </>}
                                        <Button className="btn-round" outline onClick={e =>{e.preventDefault(); history.goBack();} }>Cancelar</Button>
                                    </div>
                                </Col>
                            </Row>
                        </Container>
                        <Modal toggle={() => {setModalQuestion(false);}} isOpen={modalQuestion} backdrop="static">
                            <div className="modal-header">
                            <h5 className="modal-title" id="examplemodalMsgLabel">
                                Referencias
                            </h5>
                            <button
                                aria-label="Close"
                                className="close"
                                type="button"
                                onClick={() =>  {setModalQuestion(false);}}
                            >
                                <span aria-hidden={true}>×</span>
                            </button>
                            </div>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="modal-body">
                                    <p>Seleccione el tipo de pago</p>
                                
                                    <FormGroup check className="form-check-radio">
                                        <Label check>
                                        <input
                                            defaultValue="BANCO"
                                            id="type1"
                                            name="paymentType"
                                            type="radio"
                                            ref={register({
                                                required: "debe seleccionar una opción"
                                            })}
                                        ></input>
                                        <span className="form-check-sign"></span>
                                        Banco
                                        </Label>
                                    </FormGroup>
                                    <FormGroup check className="form-check-radio">
                                        <Label check>
                                        <input
                                            defaultValue="EFECTIVO"
                                            id="type2"
                                            name="paymentType"
                                            type="radio"
                                            ref={register({
                                                required: "Debe seleccionar una opción"
                                            })}
                                        ></input>
                                        <span className="form-check-sign"></span>
                                        Efectivo
                                        </Label>
                                    </FormGroup>
                                    <FormGroup check className="form-check-radio">
                                        <Label check>
                                        <input
                                            defaultValue="NO APLICA"
                                            id="type3"
                                            name="paymentType"
                                            type="radio"
                                            ref={register({
                                                required: "Debe seleccionar una opción"
                                            })}
                                        ></input>
                                        <span className="form-check-sign"></span>
                                        No aplica
                                        </Label>
                                    </FormGroup>
                                    {errors.paymentType && <div className="invalid-feedback d-block">{errors.paymentType.message}</div>}
                                </div>
                                <div className="modal-footer">
                                    <Button color="primary" className="btn-round" disabled={updating}>
                                        {updating && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                        Guardar
                                    </Button>
                                    <Button type="button" className="btn-round" outline onClick={() => {setModalQuestion(false);}} disabled={updating}>
                                        Cerrar
                                    </Button>
                                </div>
                            </form>
                        </Modal>
                    </div>
				</div>
            </div>
        </>
    );
}

export default ReferenceApprovePage;