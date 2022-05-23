/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { inscriptionActions, groupActions } from '../../actions';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Col, Row, Button, Form, FormGroup, Label, Container, Alert, Table, Modal  } from 'reactstrap';
import { useForm  } from "react-hook-form";
import { history } from '../../helpers';

function GroupCreatePage() {
  
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

    //obtener sedes para select
    const getting = useSelector(state => state.inscription.getting);
    const inscription = useSelector(state => state.inscription);
    useEffect(() => {
        dispatch(inscriptionActions.getDataInscription());
    },[]);

    //Todos los datos necesarios
    const [listAgencies, setListAgencies] = useState(null);
    const [trunk, setTrunk] = useState([]);
    const [listCareers, setListCareers] = useState(null);

    //Carreras filtradas por el grado
    const [filteredCarrers, setfilteredCarrers] = useState(null);


    useEffect(() => {
        if(inscription.obtained){
            setListAgencies(inscription.dataInscription.agencies);

            let careers = inscription.dataInscription.careers.length > 0 ? inscription.dataInscription.careers : []
            let select = careers.filter(item => item.trunk == false);
            let trunk = careers.filter(item => item.trunk == true);
            //Select de carreras
            setListCareers(select);
            //setear carrera trunk
            setTrunk(trunk.length>0?trunk[0]:[]);
        }
    },[inscription.obtained]);

    
    const [showCareers, setShowCareers] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedTypeText, setSelectedTypeText] = useState(null);
    //Al cambiar el grado llenar el select de carrera de acuerdo al tipo
    const handleChangeType = (e) =>  {
        let type = e.target.value;
        setSelectedType(type);
        //nombre del grado
        var index = e.target.selectedIndex;
        setSelectedTypeText(e.target[index].text)
        let careers = listCareers.filter(item => item.type == type);
        setfilteredCarrers(careers);
        if(type !== ''){
            setShowCareers(true);
        }else{
            setShowCareers(false);
        }

    }
    const [selectedAgency, setSelectedAgency] = useState(null);
    //Al cambiar la sede 
    const handleChangeAgency = (e) =>  {
        let agency = e.target.value;
        setSelectedAgency(agency);
    }

    const [selectedTurn, setSelectedTurn] = useState(null);
    const [selectedTurnText, setSelectedTurnText] = useState(null);
    //Al cambiar la turno 
    const handleChangeTurn = (e) =>  {
        let turn = e.target.value;
        var index = e.target.selectedIndex;
        setSelectedTurnText(e.target[index].text)
        setSelectedTurn(turn);
    }


    const [selectedCareer, setSelectedCareer] = useState(null);
    //Al cambiar la carrera 
    const handleChangeCarrer = (e) =>  {
        let career = e.target.value;
        setSelectedCareer(career);
    }


    //Form Data
    const { handleSubmit, register, errors, reset } = useForm();

    //Registrar grupo
    const onCreateData = (data, e) => {
        //construir objeto grupo
        let info = {
            agency: selectedAgency,
            idAgency,
            career: selectedCareer,
            idCareer,
            idTurn: selectedTurn,
            turn:selectedTurnText,
            idType: selectedType,
            type:selectedTypeText,
        }
        dispatch(groupActions.createGroup( info ));
    };

    const [group, setGroup] = useState('##-');
    const [idAgency, setIdAgency] = useState(null);
    const [idCareer, setIdCareer] = useState(null);

    //Construir nombre de grupo
    useEffect(() => {
        let agency='';
        let turn='';
        let type='';
        let career='';

        if(selectedAgency){
            let data = listAgencies.filter(item => item.id == selectedAgency);
            agency = data[0].idNumber;
            setIdAgency(agency);
        }
        if(selectedTurn){
            turn = selectedTurn;
        }
        if(selectedType){
            type = selectedType;
        }
        if(selectedCareer){
            let data = listCareers.filter(item => item.id == selectedCareer);
            career = data[0].idNumber;
            setIdCareer(career);
        }

        let nameGroup = `##-${agency}-${turn}-${type}-${career}`;
        setGroup(nameGroup)
    },[selectedAgency, selectedType, selectedTurn, selectedCareer ]);
    

    //State de guardado
    const registering = useSelector(state => state.group.registering);

    const registerSuccess = useSelector(state => state.group.register);

    useEffect(() => {
        if(registerSuccess){
            reset({agency:'', turn:'', type:'',  career:''});
            setGroup('##-');
            setIdAgency(null);
            setIdCareer(null);
            setSelectedAgency(null);
            setSelectedCareer(null),
            setSelectedTurn(null);
            setSelectedType(null);
        }
    },[registerSuccess]);

    //Modal genérico y mensaje
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMsg, setModalMsg] = useState('');
  
      
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
                                <h3>Agregar grupo</h3>
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
                                <Form onSubmit={handleSubmit(onCreateData)} className="form" >
                                    <div style={{border:'1px solid #dee2e6', padding: '10px 20px', borderRadius:'5px', marginBottom:'5px'}}>
                                        <Row form>
                                        <Col md={6}>
                                            <FormGroup>
                                                <Label for="agency">Sede</Label>{' '}
                                                {getting && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                                <select className={'form-control' + (errors.agency ? ' is-invalid' : '')} name="agency"
                                                    disabled={registering} onChange={handleChangeAgency}
                                                    ref={register({ 
                                                            required: "La sede es requerida" 
                                                        })}>
                                                        <option key="" name="" value="">Seleccione sede</option>
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
                                        </Col >
                                        <Col md={6}>
                                            <Label for="turn">Turno</Label>{' '}
                                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                                <select className={'form-control' + (errors.turn ? ' is-invalid' : '')} name="turn"
                                                    disabled={registering} onChange={handleChangeTurn}
                                                    ref={register({ 
                                                            required: "El turno es requerido" 
                                                        })}>
                                                        <option key="0" name="" value="">Seleccione turno</option>
                                                        <option key="1" name="Matutino" value="1">Matutino</option>
                                                        <option key="2" name="Vespertino" value="2">Vespertino</option>
                                                        <option key="3" name="Sabatino" value="3">Sabatino</option>
                                                </select>
                                                {errors.turn && <div className="invalid-feedback d-block">{errors.turn.message}</div>}
                                            </FormGroup>
                                        </Col>
                                        </Row>
                                    </div>
                                    {/* Informacion Academica */}
                                    <div style={{border:'1px solid #dee2e6', padding: '10px 20px', borderRadius:'5px', marginBottom:'5px'}}>
                                        <Row form>
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label for="type">Grado</Label>
                                                    <select className={'form-control' + (errors.type ? ' is-invalid' : '')} name="type"
                                                    onChange={handleChangeType} disabled={registering}
                                                        ref={register({ 
                                                                required: "El grado es requerido" 
                                                            })}>
                                                            <option key="0" name="" value="">Seleccione grado</option>
                                                            <option key="2" name="2" value="2">Licenciatura</option>
                                                            <option key="3" name="3" value="3">Maestría</option>
                                                            <option key="4" name="4" value="4">Doctorado</option>
                                                            <option key="5" name="5" value="5">Nivelación</option>
                                                    </select>
                                                    {errors.type && <div className="invalid-feedback d-block">{errors.type.message}</div>}
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                            <FormGroup>
                                                {showCareers && <>
                                                    <Label for="career">Carrera</Label>{' '}
                                                    <select className={'form-control' + (errors.career ? ' is-invalid' : '')} name="career"
                                                        onChange={handleChangeCarrer}
                                                        disabled={registering}
                                                        ref={register({ 
                                                                required: "La carrera es requerida" 
                                                            })}>
                                                            <option key="" name="" value="">Seleccione carrera</option>
                                                            {filteredCarrers && filteredCarrers.map(list => 
                                                                <option
                                                                    key={list.id}
                                                                    name={list.id}
                                                                    value={list.id}>
                                                                    {list.name}
                                                                </option>
                                                            )}
                                                    </select>
                                                    {errors.career && <div className="invalid-feedback d-block">{errors.career.message}</div>}
                                                </>
                                                } 
                                            </FormGroup>
                                            </Col>
                                        </Row> 
                                    </div>
                                    <div style={{border:'1px solid #dee2e6', padding: '10px 20px', borderRadius:'5px', marginBottom:'5px'}}>
                                        <Row form>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for="name">Grupo</Label>
                                                    <input
                                                        className="form-control-plaintext"
                                                        id="staticGroup"
                                                        value={group}
                                                        readOnly
                                                        type="text"
                                                    ></input>
                                                    {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    </div>
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

export default GroupCreatePage;