/* eslint-disable */
import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { departureActions, productActions } from '../../actions';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Col, Row, Button, Form, FormGroup, Label, Container, Alert, Table, Modal, Collapse } from 'reactstrap';
import { useForm, Controller  } from "react-hook-form";
import { history } from '../../helpers';
import NumberFormat from 'react-number-format';
import 'react-bootstrap-typeahead/css/Typeahead.css';
const cutOut = require('../../enums/cutout.enum');

function DeparturePage() {

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

    //obtener productos para select
    const getting = useSelector(state => state.products.getting);
    const products = useSelector(state => state.products);

    useEffect(() => {
        dispatch(productActions.listProductsOffers(user.agency.id));
    },[]);

    const [listProducts, setListProducts] = useState(null);
    const [offerProducts, setOfferProducts] = useState(null);

    useEffect(() => {
        if(products.obtained){
            setListProducts(products.list.products);
            setOfferProducts(products.list.offers);
        }
    },[products.obtained]);
  
    //Form Tabla
    const { handleSubmit, register, errors, reset, control } = useForm();

    //Form resgistrar salida
    const { handleSubmit:handleSubmitDeparture, register: registerDeparture , errors: errorsDeparture, reset:resetDeparture } = useForm();

    //Tabla de productos añadidos
    const [tableDeparture, setTableDeparture] = useState([]);
    const [total, setTotal] = useState(0);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalMsg, setModalMsg] = useState('');

    //Añadir producto a tabla
    const onCreateData = (data, e) => {

        //buscar codigo de producto para añadir
        let productFilter = listProducts.filter(item => item.code === data.code);

        if(productFilter.length == 0){
            setModalVisible(true);
            setModalMsg('No se encontró el producto');
        }else{

            //Obtener ofertas si existen
            var offer = null;
            if(offerProducts.length > 0){
                offer = offerProducts.find(item => {
                    return item.product.code === data.code
                })  
            }

            //tomar precio de oferta si existe sino, el precio normal
            let priceProduct = offer ? offer.price : productFilter[0].price;

            const target = {...productFilter[0]};

            const source = { 
                kg: parseFloat(data.kg), 
                price: priceProduct, 
                regularPrice: offer ? productFilter[0].price : 0,
                isOffer: offer ? true : false, 
                total: parseFloat(data.kg) * parseFloat(priceProduct) 
            };

             //Añadir al array de productos
            let preDeparture = tableDeparture;
            preDeparture.unshift(Object.assign(target, source));
            setTableDeparture(preDeparture);

            var sum = 0;
            preDeparture.map((product) => {
                sum += product.total;
                setTotal(sum);
            });

            //focus en el codigo nuevamente
            codeRef.current.focus();
            //resetear form
            reset({
                code:'',
                kg:''
            });
        }

    };

    //Quitar elemento de la tabla
    const removeItem = (product) => {

        let preDeparture = tableDeparture;
        const index = preDeparture.indexOf(product);

        if (index !== -1) {
            preDeparture.splice(index, 1);
            setTableDeparture([...preDeparture])  
        }

        let sum = 0;
        preDeparture.map((product) => {
            sum = sum + parseFloat(product.total);
            setTotal(sum);
        })
        if(preDeparture.length == 0){
            setTotal(0);
        }
    }

    //State de guardado
    const registering = useSelector(state => state.departure.registering);

    //Registrar venta
    const onRegisterSale = (data, e) => {

        if( tableDeparture.length == 0){
            setModalMsg('Debe ingresar al menos un producto');
            setModalVisible(true);
            return;
        }
        
        data.user = user.id;
        data.agency = user.agency.id;
        data.items = tableDeparture;
        data.total = total;

        /**
         * Recorrer cada producto para verificar que no esta recortando
         * un producto no permitido
         */
        if(data.type == 12){
            for (let item of tableDeparture) {
                let productCode = cutOut.cutOutCode[parseInt(item.code)];
                if(!productCode){
                    setModalMsg('Alguno de los productos ingresados no permite recortes');
                    setModalVisible(true);
                    return;
                }
            }
        }

        dispatch(departureActions.createDeparture( data ));
    };

    const statusRegister = useSelector(state => state.departure);
    //Verificar si guardo y limpiar form
    useEffect(() => {
        if(statusRegister.success){
            resetDeparture({ names:'', phone:'', type:'', comment:'' });
            setTableDeparture([]);
            setTotal(0);
        }
    },[statusRegister.success]);

    const codeRef = useRef();

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
                                {getting && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                <h3 style={{ fontWeight:'bold',fontStyle: 'italic'}}>Registro de salida</h3>
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
                                <Row form>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Label for="names">Cliente</Label>
                                            <input
                                                maxLength="100"
                                                autoComplete="off"
                                                className={'form-control' + (errors.names ? ' is-invalid' : '')}
                                                name="names"
                                                ref={registerDeparture({
                                                    required: "El cliente es requerido",
                                                })}
                                            />
                                            {errorsDeparture.names && <div className="invalid-feedback d-block">{errorsDeparture.names.message}</div>}
                                        </FormGroup>
                                    </Col>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Label for="phone">Télefono</Label>
                                            <input
                                                maxLength="100"
                                                autoComplete="off"
                                                ref={registerDeparture({})}
                                                className={'form-control' + (errors.phone ? ' is-invalid' : '')}
                                                name="phone"
                                            />
                                            {errorsDeparture.phone && <div className="invalid-feedback d-block">{errorsDeparture.phone.message}</div>}
                                        </FormGroup>
                                    </Col>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Label for="type">Tipo de salida</Label>
                                            <select className={'form-control' + (errors.type ? ' is-invalid' : '')} name="type"
                                                ref={registerDeparture({ 
                                                        required: "El tipo es requerido" 
                                                    })}>
                                                    <option key="" name="" value=""></option>
                                                    <option key="6" name="6" value="6">Donación</option>
                                                    <option key="5" name="5" value="5">Degustación</option>
                                                    <option key="4" name="4" value="4">Auto-consumo</option>
                                                    <option key="8" name="8" value="8">Vale</option>
                                                    <option key="9" name="9" value="9">Corrección</option>
                                                    <option key="10" name="10" value="10">Traslado</option>
                                                    <option key="12" name="12" value="12">Recorte</option>
                                            </select>
                                            {errorsDeparture.type && <div className="invalid-feedback d-block">Seleccione tipo</div>}
                                        </FormGroup>
                                    </Col>
                                    <Col md={6}>  
                                        <FormGroup>
                                            <Label for="comment">Comentarios</Label>
                                            <input
                                                maxLength="150"
                                                autoComplete="off"
                                                className={'form-control'}
                                                name="comment"
                                                ref={registerDeparture}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Form onSubmit={handleSubmit(onCreateData)} className="form" style={{border:'1px solid #dee2e6', padding: '10px 20px', borderRadius:'5px',
                                    marginBottom:'5px'}}>
                                    <Row form>
                                        <Col md={3}>
                                            <FormGroup>
                                                <input
                                                    maxLength="20"
                                                    autoComplete="off"
                                                    className={'form-control' + (errors.code ? ' is-invalid' : '')}
                                                    name="code"
                                                    ref={(e) => {
                                                        register(e, { required: "El código es requerido" })
                                                        codeRef.current = e;
                                                    }}
                                                    placeholder="Código de producto"
                                                />
                                                {errors.code && <div className="invalid-feedback d-block">{errors.code.message}</div>}
                                            </FormGroup>
                                        </Col>
                                        <Col md={6}>
                                            <FormGroup>
                                                <Controller
                                                    name="kg"
                                                    control={control}
                                                    rules={{
                                                        min: {
                                                            value: 0.001,
                                                            message: "El peso es requerido"
                                                        },
                                                        required: "El peso es requerido",
                                                    }}
                                                    as={<NumberFormat placeholder="Cantidad" className={'form-control' + (errors.kg ? ' is-invalid' : '')} thousandSeparator={true} />}
                                                />
                                                {errors.kg && <div className="invalid-feedback">{errors.kg.message}</div>}
                                            </FormGroup>
                                        </Col>
                                        <Col md={3} sm={6}>
                                            <FormGroup>
                                                <Button color="primary" className="btn-round btn-icon" style={{marginTop:0}}>
                                                    <i className="fa fa-plus"></i>
                                                </Button>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    
                                </Form>
                                <Table striped responsive>
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>kg/unidades</th>
                                            <th>Sub total</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableDeparture && tableDeparture.map((product, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>{product.name}</td>
                                                    <td><NumberFormat value={ product.kg.toFixed(3) } displayType={'text'} thousandSeparator={','} decimalSeparator={'.'} /></td>
                                                    <td><NumberFormat value={ product.total.toFixed(2) } displayType={'text'} thousandSeparator={true} /></td>
                                                    <td>
                                                        <Button className="btn-link" color="primary" style={{margin:0, padding:0}}
                                                            onClick={e => 
                                                                {
                                                                    e.preventDefault(); 
                                                                    removeItem(product);
                                                                }
                                                            }>
                                                            <i className="fa fa-times-circle"></i>
                                                        </Button>
                                                    </td>
                                                </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </Table>
                                <Row xs="12">
                                    <Col><div className="pull-right" style={{fontSize:16, padding:6, border:'1px solid #BE1F1F'}}><b>Total: <NumberFormat value={ total.toFixed(2) } displayType={'text'} thousandSeparator={true} /></b> </div></Col>
                                </Row>
                                <Form onSubmit={handleSubmitDeparture(onRegisterSale)}>
                                    <div className="d-flex justify-content-between">
                                        <Button color="primary" disabled={registering}>
                                            {registering && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                            Registrar
                                        </Button>
                                        <Button onClick={e =>{ e.preventDefault(); history.goBack() } }>Cancelar</Button>
                                    </div>
                                </Form>
                            </Col>
                        </Row>
                        <Modal toggle={() => {setModalVisible(false); setModalMsg('')}} isOpen={modalVisible}>
                            <div className="modal-header">
                            <h5 className="modal-title" id="examplemodalMsgLabel">
                                Salidas
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
                                color="secondary"
                                type="button"
                                onClick={() =>  {setModalVisible(false); setModalMsg('')}}
                            >
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

export default DeparturePage;