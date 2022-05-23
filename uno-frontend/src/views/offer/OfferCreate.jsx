/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { offerActions, agencyActions } from '../../actions';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Col, Row, Button, Form, FormGroup, Label, Container, Alert, Table, Modal  } from 'reactstrap';
import { useForm, Controller  } from "react-hook-form";
import { history } from '../../helpers';
import NumberFormat from 'react-number-format';
import { Icon } from '@iconify/react';
import deleteBin6Fill from '@iconify-icons/ri/delete-bin-6-fill';

function OfferCreatePage() {

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
            setModalQuestion(false);
            setOfferData(null);
            setVisible(true); 
            window.setTimeout(()=>{setVisible(false)},5000);   
        }
    },[alert]);

    //Form Data
    const { handleSubmit, register, reset } = useForm();

    //Registrar promoción
    const onCreateOffer = (data, e) => {

        if(tableOffer.length == 0){
            setModalVisible(true);
            setModalMsg('Debe ingresar un producto para la promoción');
            return;
        }
        data.user = user.id;
        data.agency = tableOffer[0].id;
        data.price = tableOffer[0].offer;
        data.regularPrice = tableOffer[0].inscription;

        if(data.price > data.regularPrice){
            setModalVisible(true);
            setModalMsg('El precio de promoción no puede ser superior al precio actual');
            return;
        }

        setOfferData(data);
        setModalQuestion(true);
    };

    const [offerData, setOfferData] = useState(null); 

    const saveOffer = () => {
        if(offerData){
            dispatch(offerActions.createOffer( offerData ));
        } 
    } 

    //State de guardado
    const registering = useSelector(state => state.offer.registering);

    const statusRegister = useSelector(state => state.offer);
    //Verificar si guardo y limpiar form
    useEffect(() => {
        if(statusRegister.success){
            setModalQuestion(false);
            setTableOffer([]);
            reset({
                comment:''
            });
            setOfferData(null);
        }
    },[statusRegister.success]);

    //obtener sucursales para select
    const gettingAgency = useSelector(state => state.agencies.getting);
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

    //Form resgistrar promoción
    const { handleSubmit:handleSubmitProduct, register: registerOffer , errors: errorsOffer, reset:resetOffer, control:controlOffer  } = useForm();
    //Tabla de Promociones añadidas
    const [tableOffer, setTableOffer] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalQuestion, setModalQuestion] = useState(false);
    const [modalMsg, setModalMsg] = useState('');

    //Agregar producto a tabla
    const onCreateDataProduct = (data, e) => {

        //buscar codigo de la sede para añadir
        let productFilter = listAgencies.filter(item => item.id === data.agency);

        if(productFilter.length == 0){
            setModalVisible(true);
            setModalMsg('No se encontró el producto');
        }else{

            data.offer = data.offer.replace(/,/g, '');
            const target = {...productFilter[0]};
            const source = { offer: parseFloat(data.offer) };

             //Agregar al array de productos
            let offer = tableOffer;
           
            offer.unshift(Object.assign(target, source));
            setTableOffer(offer);
            //resetear form
            resetOffer({
                agency:'',
                offer:''
            });
        }
        
    };

    //Quitar producto de lista
    const removeItem = (data) => {

        let offer = tableOffer;
        const index = offer.indexOf(data);
        if (index !== -1) {
            offer.splice(index, 1);
            setTableOffer([...offer])  
        }

    }

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
                                <h3>Crear promoción</h3>
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
                                <Form onSubmit={handleSubmitProduct(onCreateDataProduct)} className="form">
                                    <Row form>
                                        <Col md={6}>
                                            <FormGroup>
                                                <Label for="agency">Sucursal</Label>{' '}
                                                {gettingAgency && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                                <select className={'form-control' + (errorsOffer.agency ? ' is-invalid' : '')} name="agency"
                                                    disabled={tableOffer && tableOffer.length > 0 ? true: false}
                                                    ref={registerOffer({ 
                                                        required: "La sucursal es requerida" 
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
                                                {errorsOffer.agency && <div className="invalid-feedback d-block">{errorsOffer.agency.message}</div>}
                                            </FormGroup>
                                        </Col>
                                        <Col md={6}>
                                            <FormGroup>
                                                <Label for="offer">Precio de promoción</Label>
                                                <Controller
                                                disabled={tableOffer && tableOffer.length > 0 ? true: false}
                                                    name="offer"
                                                    control={controlOffer}
                                                    rules={{
                                                        validate: (value) => {
                                                            if(parseInt(value) <= 0){
                                                                return "El precio es requerido";
                                                            }
                                                        },
                                                        required: "El precio es requerido",
                                                    }}
                                                    as={<NumberFormat  className={'form-control' + (errorsOffer.offer ? ' is-invalid' : '')} thousandSeparator={true} />}
                                                />
                                                {errorsOffer.offer && <div className="invalid-feedback">{errorsOffer.offer.message}</div>}
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <div className="d-flex justify-content-between">
                                        <Button color="primary"  className="btn-round" disabled={tableOffer && tableOffer.length > 0 ? true: false}>
                                            <i className="fa fa-plus-circle" aria-hidden="true"></i> Agregar
                                        </Button>
                                    </div>
                                </Form>
                                <Table striped responsive>
                                    <thead>
                                        <tr>
                                            <th>Sede</th>
                                            <th>Precio Actual</th>
                                            <th>Precio de promoción</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {tableOffer && tableOffer.map((offer, index) => {
                                        return (
                                                <tr key={index}>
                                                    <td>{offer.name}</td>
                                                    <td><NumberFormat displayType={'text'} value={offer.inscription.toFixed(2)} thousandSeparator={true} /></td>
                                                    <td><NumberFormat displayType={'text'} value={offer.offer.toFixed(2)} thousandSeparator={true} /></td>
                                                    <td>
                                                        <Button className="btn-link" color="primary" style={{margin:0, padding:0}}
                                                            onClick={e => 
                                                                {
                                                                    e.preventDefault(); 
                                                                    removeItem(offer);
                                                                }
                                                            }>
                                                            <Icon icon={deleteBin6Fill} color="#FF3636" width="19" height="19"/>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                    </tbody>
                                </Table>
                                <Form onSubmit={handleSubmit(onCreateOffer)} className="form">
                                    <Row form>
                                        <Col md={12}>  
                                            <FormGroup>
                                                <Label for="comment">Comentario</Label>
                                                <input
                                                    maxLength="150"
                                                    autoComplete="off"
                                                    className={'form-control'}
                                                    name="comment"
                                                    ref={register}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <div className="d-flex justify-content-between">
                                        <Button color="primary" disabled={registering}  className="btn-round">
                                            {registering && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                            Guardar
                                        </Button>
                                        <Button  className="btn-round" outline onClick={e =>{e.preventDefault(); history.goBack();} }>Cancelar</Button>
                                    </div>
                                </Form>
                            </Col>
                        </Row>
                        <Modal toggle={() => {setModalVisible(false); setModalMsg('')}} isOpen={modalVisible}>
                            <div className="modal-header">
                            <h5 className="modal-title" id="examplemodalMsgLabel">
                                Promociones
                            </h5>
                            <button
                                aria-label="Close"
                                className="close"
                                type="button"
                                onClick={() =>  {setModalVisible(false); setModalMsg('')}}
                            >
                                <span aria-hidden={true}>×</span>
                            </button>
                            </div>
                            <div className="modal-body">
                                <p>{modalMsg}</p>
                            </div>
                            <div className="modal-footer">
                            <Button
                                className="btn-round" 
                                outline
                                color="secondary"
                                type="button"
                                onClick={() =>  {setModalVisible(false); setModalMsg('')}}
                            >
                                Cerrar
                            </Button>
                            </div>
                        </Modal>
                        <Modal toggle={() => {setModalQuestion(false);setOfferData(null);}} isOpen={modalQuestion} backdrop="static">
                            <div className="modal-header">
                            <h5 className="modal-title" id="examplemodalMsgLabel">
                                Promociones
                            </h5>
                            <button
                                aria-label="Close"
                                className="close"
                                type="button"
                                onClick={() =>  {setModalQuestion(false);setOfferData(null);}}
                            >
                                <span aria-hidden={true}>×</span>
                            </button>
                            </div>
                            <div className="modal-body">
                                <p>¿Seguro que desea guardar la promoción?</p>
                            </div>
                            <div className="modal-footer">
							<Button color="primary" className="btn-round" disabled={registering} onClick={()=>saveOffer()}>
								{registering && <span className="spinner-border spinner-border-sm mr-1"></span>}
								Guardar
							</Button>
							<Button type="button" className="btn-round" outline onClick={() => {setModalQuestion(false);setOfferData(null);}} disabled={registering}>
								Cerrar
							</Button>
                            </div>
                        </Modal>
                        </Container>
                    </div>

				</div>
            </div>
        </>
    );
}

export default OfferCreatePage;