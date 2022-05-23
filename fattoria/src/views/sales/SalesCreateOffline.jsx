/* eslint-disable */
import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { offlineActions, salesActions } from '../../actions';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Col, Row, Button, Form, FormGroup, Label, Container, Alert, Table, Modal, Collapse  } from 'reactstrap';
import { useForm, Controller  } from "react-hook-form";
import { history } from '../../helpers';
import NumberFormat from 'react-number-format';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import '../../assets/css/table.css';
import '../../assets/css/options.css';
import { WeightProduct } from '../../helpers/weight'

function SalesCreateOfflinePage() {

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
  
    /**
     * Data offline
     */

    //data offline monedas, productos y terminales
    const dataSale = useSelector(state => state.data.sale);

    //Redux ventas pendientes por procesar
    const pending = useSelector(state => state.pending);

    //Cantidad de ventas offline pendientes por procesar
    const [pendingSales, setPendingSales] = useState('');

	//Colocar cantidad de pendientes en el boton y menú ver: Sidebar.js
	const getPendings = () => {
		if(pending.sales && pending.sales.length>0){
			setPendingSales(`(${pending.sales.length})`);
		}else{
			setPendingSales('');
		}
	};
	useEffect(() => {
		getPendings();
    }, [pending]);
    
    //procesar ventas offline
    const onProcessData = () => {
        if(pending.sales && pending.sales.length>0){
            let sales = {
                items:pending.sales
            }
            dispatch(salesActions.processSalesOffline( sales ));
        }
    }

    //State de registro offline
    const registeringOffline = useSelector(state => state.sales.registeringOffline);

    //End data offline

    const dispatch = useDispatch();

    //Alertas
    const alert = useSelector(state => state.alert);
    //Mostrar alertas
    const [visible, setVisible] = useState(true);
    const onDismiss = () => setVisible(false);

    useEffect(() => {
        if(alert.message){
            setModalChange(false);
            setVisible(true); 
            window.setTimeout(()=>{setVisible(false)},5000);   
        }
    },[alert]);
    
    //Obtener toda la data necesaria para ventas
    const [listCoin, setListCoin] = useState(null);
    const [listProducts, setListProducts] = useState(null);
    const [terminaList, setTerminalList] = useState([]);
    const [offerProducts, setOfferProducts] = useState(null);

    useEffect(() => {
        if(dataSale){
            setListCoin(dataSale.coins);
            setListProducts(dataSale.products);
            setTerminalList(dataSale.agency.terminal);
            setOfferProducts(dataSale.offers);
        }
    },[dataSale]);
  
    //Form Tabla
    const { handleSubmit, register, errors, reset, control } = useForm();
    //Form resgistrar venta
    const { handleSubmit:handleSubmitSale, register: registerSale , errors: errorsSale, reset:resetSale, control:controlSale, watch, setValue  } = useForm();
    const { handleSubmit:handleSubmitChange, register: registerChange , errors: errorsChange, reset:resetChange, control:controlChange, watch:watchChange  } = useForm();

    //State de guardado
    const registering = useSelector(state => state.sales.registering);

    //Tabla de productos añadidos
    const [tableSale, setTableSale] = useState([]);
    //Total de los productos
    const [total, setTotal] = useState(0);
    //Total en peso de los productos
    const [totalWeight, setTotalWeight] = useState(0);

    //Modal genérico y mensaje
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
            let preSale = tableSale;
            preSale.unshift(Object.assign(target, source));
            setTableSale(preSale);
            setTotal(0);
            setTotalWeight(0);//total de peso
            var sum = 0;
            var sumWeight = 0;
            preSale.map((product) => {
                sum += product.total;
                setTotal(sum);

                //buscar si el producto tiene un peso calcuado de bolsa
                const getWeight = WeightProduct.find(prod => prod.code == product.code);
                if(getWeight){
                    sumWeight += product.kg * getWeight.weight;
                }else{
                    sumWeight += product.kg;
                }
                setTotalWeight(sumWeight);
                //setear por defecto el total en punto
                setValue('pAmmount', sum.toFixed(2));
            })
            //focus en el codigo nuevamente
            codeRef.current.focus();
            //resetear form
            reset({
                code:'',
                kg:''
            });
        }

    };

    const [dataSaleOff, setDataSaleOff] = useState(null);

    //Registrar venta
    const onRegisterSale = (data, e) => {
        //limpiar errores del form de producto
        reset();

        if(total == 0 || tableSale.length == 0){
            setModalMsg('Debe ingresar al menos un producto');
            setModalVisible(true);
            return;
        }
        if(optionRest > 0 && collapses.includes(1)){
            setModalMsg('Debe completar el pago');
            setModalVisible(true);
            return;
        }
        
        data.user = user.id;
        data.agency = user.agency.id;
        data.items = tableSale;
        data.total = total;
        data.totalWeight = totalWeight;//total peso
        //enviar valores actuales de las monedas
        data.valueDollar = listCoin[0].value.toFixed(2);
        data.valueEur = listCoin[1].value.toFixed(2);
        data.valueCop = listCoin[2].value.toFixed(2);

        //limpiar banco en tra
        if(data.tAmmount == ""){
            data.tBank = "";
        }

        //Guardar venta
        if(exceeded > 0){
            setDataSaleOff(data);
            setModalChange(true);
        }else{
            dispatch(offlineActions.addSaleOffline( data ));
        }

    };

    //Quitar elemento de la tabla
    const removeItem = (prod) => {

        let preSale = tableSale;
        const index = preSale.indexOf(prod);
        
        if (index !== -1) {
            preSale.splice(index, 1);
            setTableSale([...preSale])  
        }

        let sum = 0;
        var sumWeight = 0;
        preSale.map((product) => {
            sum = sum + parseFloat(product.total);
            setTotal(sum);

            //buscar si el producto tiene un peso calcuado de bolsa
            const getWeight = WeightProduct.find(prod => prod.code == product.code);
            if(getWeight){
                sumWeight += product.kg * getWeight.weight;
            }else{
                sumWeight += product.kg;
            }
            setTotalWeight(sumWeight);

            //setear por defecto el total en punto
            setValue('pAmmount', sum.toFixed(2));
        })

        if(preSale.length == 0){
            setTotal(0);
            setTotalWeight(0);
        }

    }

    //Función para limpiar pantalla
    const resetScreen = () =>{
        resetSale({ document:'', names:'', phone:'', ves:'',dollar:'',eur:'',cop:'',tAmmount:'',tBank:'',tReference:'',pAmmount:'',pAmmountExtra:'',terminalExtra:'',pBank:'',pReference:'', pReferenceExtra:''});
        setTotal(0);
        setTotalWeight(0);
        setTableSale([]);
        clientNamesRef.current.focus();
    }

    //verificar estado de guardado del offline
    const statusRegister = useSelector(state => state.offline);
    //Verificar si guardo y limpiar form
    useEffect(() => {
        if(statusRegister.success){
            resetScreen();
            setModalChange(false);
            setDataSaleOff(null);
        }
    },[statusRegister.success]);

    //Data de los forms
    let pos = watch("terminal");
    let tAmmount = watch("tAmmount");
    let ves = watch("ves");
    let dollar = watch("dollar");
    let eur = watch("eur");
    let cop = watch("cop");
    let pAmmount = watch("pAmmount");
    let names = watch("names");
    let phone = watch("phone");
    //punto adicional
    let posExtra = watch("terminalExtra");
    let pAmmountExtra = watch("pAmmountExtra");

    // collapse opciones adicionales
	const [collapses, setCollapses] = useState([]);

	const changeCollapse = collapse => {
		if (collapses.includes(collapse)) {
			setCollapses(collapses.filter(prop => prop !== collapse));
		} else {
			setCollapses([...collapses, collapse]);
		}
    };

    //Si se contrae "otros" limpiar data
    useEffect(() => {
        if(collapses.length == 0){
            setValue('ves','');
            setValue('dollar','');
            setValue('eur','');
            setValue('cop','');
            setValue('tAmmount','');
            setValue('tBank','');
            setValue('tReference','');
            setValue('pAmmountExtra','');
            setValue('terminalExtra','');
            setValue('pReferenceExtra','');
            setExceeded(0);
            if(total > 0){
                setValue('pAmmount', total.toFixed(2));
            }
        }else{
            setValue('tBank','BBVA Mohan');
        }
    },[collapses]);

    useEffect(() => {
        //si se elimina productos contraer "otros"
        if(total == 0){
            setCollapses([]);
             //setear por defecto el total el punto
             setValue('pAmmount', '');
        }
    },[total]);

    //Si no se agregan otras opciones el total de punto de venta es de solo lectura
    const [readOnly, setReadOnly] = useState(true);
    useEffect(() => {
        if(total > 0 && collapses.includes(1)){
            //permitir modificar valor del input monto de punto de venta cuando hay otras opciones
            setValue('pAmmount', '');
            setReadOnly(false);
        }else{
            setReadOnly(true);
        }
    },[total,collapses]);
   
    //Total de todas las opciones
    const [optionTotal, setOptionTotal] = useState(true);
    //Total que falta
    const [optionRest, setOptionRest] = useState(0);
    //Total excedente 
    const [exceeded, setExceeded] = useState(0);

    //Totales en moneda extranjera
    const [totalDollar, setTotalDollar] = useState(0);
    const [totalEur, setTotalEur] = useState(0);
    const [totalCop, setTotalCop] = useState(0);

    //Sacar totales en monedas extranjeras
    useEffect(() => {
        if(total>0 && listCoin && listCoin.length>0){
            setTotalDollar(total/listCoin[0].value);
            setTotalEur(total/listCoin[1].value);
            setTotalCop(total/listCoin[2].value);
        }else{
            setTotalDollar(0);
            setTotalEur(0);
            setTotalCop(0);
        }
    },[total]);

    //Detectar cambios en monedas y sacar totales
    useEffect(() => {
        
        let totalProduct = total;
        let subTot = 0;
        setOptionTotal(subTot);
        setExceeded(0);
        setOptionRest(totalProduct);
        if(ves && ves.length >0 ){
            subTot += parseFloat(ves.replace(/,/g, ''));
        }
        if(pAmmount && pAmmount.length >0 ){
            subTot += parseFloat(pAmmount.replace(/,/g, ''));
        }
        if(pAmmountExtra && pAmmountExtra.length >0 ){
            subTot += parseFloat(pAmmountExtra.replace(/,/g, ''));
        }
        if(tAmmount && tAmmount.length >0 ){
            subTot += parseFloat(tAmmount.replace(/,/g, ''));
        }
        if(dollar && dollar.length >0 && listCoin && listCoin.length>0){
            let dollarPrice = listCoin[0].value;
            let conversion = parseFloat(dollar.replace(/,/g, '')) * parseFloat(dollarPrice);
            subTot += conversion;
        }
        if(eur && eur.length >0 && listCoin && listCoin.length>0){
            let eurPrice = listCoin[1].value;
            let conversion = parseFloat(eur.replace(/,/g, '')) * parseFloat(eurPrice);
            subTot += conversion;
        }
        if(cop && cop.length >0 && listCoin && listCoin.length>0){
            let copPrice = listCoin[2].value;
            let conversion = parseFloat(cop.replace(/,/g, '')) * parseFloat(copPrice);
            subTot += conversion;
        }
        setOptionTotal(subTot);

        if(parseFloat(subTot.toFixed(2)) > parseFloat(totalProduct.toFixed(2))){
            setExceeded(subTot.toFixed(2)-totalProduct.toFixed(2));
        }

        let rest = parseFloat(totalProduct.toFixed(2))-parseFloat(subTot.toFixed(2));
        if(rest <= 0){
            rest = 0;
        }

        if( parseFloat(totalProduct.toFixed(2)) <=  parseFloat(subTot.toFixed(2)) ){
            rest = 0;
        }
        setOptionRest(rest);
    },[ves, dollar, eur, cop, pAmmount, tAmmount, pAmmountExtra]);

    //Referencia código de producto
    const codeRef = useRef();
    const clientNamesRef = useRef();

    //Focus inicial en el cliente
    useEffect(() => {
        clientNamesRef.current.focus();
    }, []);

    //Gestionar los cambios
    const [modalChange, setModalChange] = useState(false); 
    //Totales de cambio en moneda extranjera
    const [totalBsChange, setTotalBsChange] = useState(0);
    const [totalDollarChange, setTotalDollarChange] = useState(0);
    const [totalEurChange, setTotalEurChange] = useState(0);
    const [totalCopChange, setTotalCopChange] = useState(0);
    
    //Sacar totales en monedas extranjeras
    useEffect(() => {
        if(exceeded>0 && listCoin && listCoin.length>0){
            setTotalBsChange(exceeded);
            setTotalDollarChange(exceeded/listCoin[0].value);
            setTotalEurChange(exceeded/listCoin[1].value);
            setTotalCopChange(exceeded/listCoin[2].value);
        }else{
            setTotalBsChange(0);
            setTotalDollarChange(0);
            setTotalEurChange(0);
            setTotalCopChange(0);
        }
    },[exceeded]);

    //Registrar forma de cambio
    const onRegisterChange = (data, e) => {      
        let infoSale = dataSaleOff;
        infoSale.changeData = data;
        dispatch(offlineActions.addSaleOffline( infoSale ));
    }

    let typeChange = watchChange("typeChange");

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
                                <div style={{marginBottom:20}}>
                                    {listCoin && listCoin.length>0 &&
                                        <div className="d-flex justify-content-between" style={{marginBottom:10}}> 
                                            <div style={{fontSize:'0.9em'}}>
                                                Dólar:{' '}<b><NumberFormat value={ listCoin[0].value.toFixed(2) } displayType={'text'} thousandSeparator={true} prefix={'Bs '} /></b>
                                            </div> 
                                            <div style={{fontSize:'0.9em'}}>
                                                Euros:{' '}<b><NumberFormat value={ listCoin[1].value.toFixed(2) } displayType={'text'} thousandSeparator={true} prefix={'Bs '} /></b>
                                            </div>   
                                            <div style={{fontSize:'0.9em'}}>
                                                Pesos:{' '}<b><NumberFormat value={ listCoin[2].value.toFixed(2) } displayType={'text'} thousandSeparator={true} prefix={'Bs '} /></b>
                                            </div>
                                       </div>
                                    }
                                </div>
                                <div className="d-flex justify-content-between" style={{marginBottom:10}}>  
                                    <h3 style={{ fontWeight:'bold',fontStyle: 'italic',  marginBottom: '0'}}>Registro de venta offline </h3>
                                </div>  
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
                                    <Col md={4}>
                                        <FormGroup>
                                            <Label for="document">Documento de identidad</Label>
                                            <input
                                                maxLength="100"
                                                autoComplete="off"
                                                className={'form-control' + (errors.document ? ' is-invalid' : '')}
                                                name="document"
                                                ref={(e) => {
                                                    clientNamesRef.current = e;
                                                    registerSale(e, { required: "El documento es requerido" })
                                                }}
                                            />
                                            
                                            {errorsSale.document && <div className="invalid-feedback d-block">{errorsSale.document.message}</div>}
                                        </FormGroup>
                                    </Col>
                                    <Col md={4}>
                                        <FormGroup>
                                            <Label for="names">Cliente</Label>
                                            <input
                                                maxLength="100"
                                                autoComplete="off"
                                                className={'form-control' + (errors.names ? ' is-invalid' : '')}
                                                name="names"
                                                ref={(e) => {
                                                    //clientNamesRef.current = e;
                                                    registerSale(e, { required: "El cliente es requerido" })
                                                }}
                                            />
                                            
                                            {errorsSale.names && <div className="invalid-feedback d-block">{errorsSale.names.message}</div>}
                                        </FormGroup>
                                    </Col>
                                    <Col md={4}>
                                        <FormGroup>
                                            <Label for="phone">Télefono</Label>
                                            <input
                                                maxLength="100"
                                                autoComplete="off"
                                                ref={registerSale({})}
                                                className={'form-control' + (errors.phone ? ' is-invalid' : '')}
                                                name="phone"
                                            />
                                            {errorsSale.phone && <div className="invalid-feedback d-block">{errorsSale.phone.message}</div>}
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Form onSubmit={handleSubmit(onCreateData)} className="form" style={{border:'1px solid #dee2e6', padding: '10px 20px', borderRadius:'5px',
                                    marginBottom:'5px'}}>
                                    <Row form style={{marginTop:'12px'}}>
                                        <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                            <input
                                                maxLength="20"
                                                autoComplete="off"
                                                className={'form-control' + (errors.code ? ' is-invalid' : '')}
                                                name="code"
                                                ref={(e) => {
                                                    codeRef.current = e;
                                                    register(e, { required: "El código es requerido" })
                                                }}
                                                placeholder="Código de producto"
                                            />
                                            {errors.code && <div className="invalid-feedback d-block">{errors.code.message}</div>}
                                        </FormGroup>
                                        <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
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
                                        <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                            <Button color="primary" className="btn-round btn-icon" style={{marginTop:0}}>
                                                <i className="fa fa-plus"></i>
                                            </Button>
                                        </FormGroup>
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
                                        {tableSale && tableSale.map((product, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>{product.name}</td>
                                                    <td><NumberFormat value={ product.kg.toFixed(3) } displayType={'text'} thousandSeparator={','} decimalSeparator={'.'} /></td>
                                                    <td><NumberFormat value={ product.total.toFixed(2) } displayType={'text'} thousandSeparator={true} /></td>
                                                    <td>
                                                        <Button className="btn-link" color="primary" style={{margin:0, padding:0}}
                                                            onClick={e =>  { e.preventDefault(); removeItem(product) }}>
                                                            <i className="fa fa-times-circle"></i>
                                                        </Button>
                                                    </td>
                                                </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </Table>
                                <Row>
                                    <Col className="text-right" style={{ margin:0 }}>
                                        <div className="d-inline-flex" style={{padding: '5px 0px 10px 0px'}}>
                                            <div className="text-center" style={{border:'1px solid #00C853', borderRight:0, borderTopLeftRadius:'25px', borderBottomLeftRadius:'25px', padding:4}}>
                                                <b style={{fontSize:16, marginRight:10,  marginLeft:10}}>Total Peso: <NumberFormat value={ totalWeight.toFixed(3) } displayType={'text'} thousandSeparator={true} />{' '}Kg</b> 
                                            </div>
                                            <div className="text-center" style={{border:'1px solid #00C853', borderTopRightRadius:'25px', borderBottomRightRadius:'25px', backgroundColor:'#E6E6E6', padding:4}}>
                                                <b style={{fontSize:16, marginLeft:10,  marginRight:10}}>Total: <NumberFormat value={ total.toFixed(2) } displayType={'text'} thousandSeparator={true} />{' '}BsS.</b> 
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <Form onSubmit={handleSubmitSale(onRegisterSale)}>
                                    <Row form>
                                        <Col md={4}>
                                            <FormGroup>
                                                <Label for="pBank">Punto</Label>
                                                <select className={'form-control' + (errors.terminal ? ' is-invalid' : '')} name="terminal"
                                                    disabled={total == 0 ? true: false}
                                                    ref={registerSale({ 
                                                            validate: terminal =>{
                                                                if(!tAmmount && !ves && !dollar && !eur && !cop && !terminal && !posExtra){
                                                                    return "Seleccione punto de venta"
                                                                }
                                                            }
                                                        })}>
                                                        <option key="" name="" value=""></option>
                                                        {terminaList && terminaList.map(list => 
                                                            <option
                                                                key={list.id}
                                                                name={list.id}
                                                                value={list.id}>
                                                                {list.code}
                                                            </option>
                                                        )}
                                                </select>
                                                {errorsSale.terminal && <div className="invalid-feedback d-block">Seleccione punto de venta</div>}
                                            </FormGroup>
                                        </Col>
                                        <Col md={4}>
                                            <FormGroup>
                                                <Label for="pAmmount">Monto</Label>
                                                <Controller
                                                    name="pAmmount"
                                                    control={controlSale}
                                                    disabled={readOnly}
                                                    rules={{
                                                        validate: (value) =>{
                                                            if(pos && !value){
                                                                return "El monto de punto de venta es requerido"
                                                            }
                                                        }
                                                    }}
                                                    as={<NumberFormat className={'form-control' + (errorsSale.pAmmount ? ' is-invalid' : '')} thousandSeparator={true} />}
                                                />
                                                {errorsSale.pAmmount && <div className="invalid-feedback">{errorsSale.pAmmount.message}</div>}
                                            </FormGroup>
                                        </Col>
                                        <Col md={4}>
                                            <FormGroup>
                                                <Label for="pReference">Referencia</Label>
                                                <input
                                                    maxLength="100"
                                                    autoComplete="off"
                                                    ref={registerSale({
                                                        validate: (reference) => {
                                                            if(pos && !reference){
                                                                return "la referencia es requerida"
                                                            }
                                                        }
                                                    })}
                                                    disabled={total == 0 ? true: false}
                                                    className={'form-control' + (errorsSale.pReference ? ' is-invalid' : '')}
                                                    name="pReference"
                                                />
                                                {errorsSale.pReference && <div className="invalid-feedback d-block">{errorsSale.pReference.message}</div>}
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <div style={{marginTop:'10px', marginBottom:'10px'}}>
                                        <Button style={{margin:0, padding:0, border: 'none', outline: 'none', width:'100%'}} className="btn-link" onClick={()=>changeCollapse(1)} disabled={total == 0 ? true: false}>
                                            <div className="hr-theme-slash-2">
                                                <div className="hr-line"></div>
                                                    <div className="hr-icon"> 
                                                        {collapses.length == 0 && <i className="fa fa-chevron-down icon-line fa-lg" aria-hidden="true"></i>}
                                                        {collapses.length > 0 && <i className="fa fa-chevron-up icon-line fa-lg" aria-hidden="true"></i>}
                                                </div>
                                                <div className="hr-line"></div>
                                            </div>
                                        </Button>
                                    </div>
                                    
                                    <Collapse isOpen={collapses.includes(1)}>
                                        <div className="d-flex justify-content-between">
                                            <div className="mb-2"><b>Métodos de pago</b></div>
                                            {collapses.includes(1) ? <div className="pull-right align-self-center">
                                                <div>
                                                    <b>Faltante: <NumberFormat value={ optionRest.toFixed(2) } displayType={'text'} thousandSeparator={true} /></b>{' '}
                                                    <b>Total: <NumberFormat value={ optionTotal.toFixed(2) } displayType={'text'} thousandSeparator={true} /></b>
                                                </div> 
                                                {exceeded>0 && 
                                                    <div color="primary"> <i className="fa fa-exclamation-circle text-warning" aria-hidden="true"></i>{' '}
                                                        <b className="text-warning">Cambio: <NumberFormat value={ exceeded.toFixed(2) } displayType={'text'} thousandSeparator={true} /></b>
                                                    </div>
                                                }
                                            </div>:'' }
                                        </div>
                                        <div className="form-row">
                                            <FormGroup className="col-md-3">
                                                <Label for="ves">BsF</Label>
                                                <Controller
                                                    name="ves"
                                                    control={controlSale}
                                                    disabled={total == 0 ? true: false}
                                                    as={<NumberFormat className={'form-control' + (errorsSale.ves ? ' is-invalid' : '')} thousandSeparator={true} />}
                                                />
                                                {errorsSale.ves && <div className="invalid-feedback">{errorsSale.ves.message}</div>}
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label for="dollar">$ Dólares <b>{<NumberFormat value={ totalDollar.toFixed(2) } displayType={'text'} thousandSeparator={true} />}</b></Label>
                                                <Controller
                                                    name="dollar"
                                                    control={controlSale}
                                                    disabled={total == 0 ? true: false}
                                                    as={<NumberFormat  className={'form-control' + (errorsSale.dollar ? ' is-invalid' : '')} thousandSeparator={true} />}
                                                />
                                                {errorsSale.dollar && <div className="invalid-feedback">{errorsSale.dollar.message}</div>}
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label for="eur">€ Euros <b>{<NumberFormat value={ totalEur.toFixed(2) } displayType={'text'} thousandSeparator={true} />}</b></Label>
                                                <Controller
                                                    name="eur"
                                                    control={controlSale}
                                                    disabled={total == 0 ? true: false}
                                                    as={<NumberFormat  className={'form-control' + (errorsSale.eur ? ' is-invalid' : '')} thousandSeparator={true} />}
                                                />
                                                {errorsSale.eur && <div className="invalid-feedback">{errorsSale.eur.message}</div>}
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label for="cop">$ Pesos <b>{<NumberFormat value={ totalCop.toFixed(2) } displayType={'text'} thousandSeparator={true} />}</b></Label>
                                                <Controller
                                                    name="cop"
                                                    control={controlSale}
                                                    disabled={total == 0 ? true: false}
                                                    as={<NumberFormat  className={'form-control' + (errorsSale.cop ? ' is-invalid' : '')} thousandSeparator={true} />}
                                                />
                                                {errorsSale.cop && <div className="invalid-feedback">{errorsSale.cop.message}</div>}
                                            </FormGroup>
                                        </div>
                                        <div className="mb-2"><b>Transferencia</b></div>
                                        <div className="form-row">
                                            <FormGroup className="col-md-4">
                                                <Label for="tAmmount">Monto</Label>
                                                <Controller
                                                    name="tAmmount"
                                                    control={controlSale}
                                                    disabled={total == 0 ? true: false}
                                                    as={<NumberFormat  className={'form-control' + (errorsSale.tAmmount ? ' is-invalid' : '')} thousandSeparator={true} />}
                                                />
                                                {errorsSale.tAmmount && <div className="invalid-feedback">{errorsSale.tAmmount.message}</div>}
                                            </FormGroup>
                                            <FormGroup className="col-md-4">
                                                <Label for="tBank">Banco</Label>
                                                <input
                                                    maxLength="100"
                                                    autoComplete="off"
                                                    ref={registerSale({
                                                        validate: (bank) => {
                                                            if(tAmmount && !bank){
                                                                return "El banco es requerido"
                                                            }
                                                        }
                                                    })}
                                                    disabled={total == 0 ? true: false}
                                                    className={'form-control' + (errorsSale.tBank ? ' is-invalid' : '')}
                                                    name="tBank"
                                                />
                                                {errorsSale.tBank && <div className="invalid-feedback d-block">{errorsSale.tBank.message}</div>}
                                            </FormGroup>
                                            <FormGroup className="col-md-4">
                                                <Label for="tReference">Referencia</Label>
                                                <input
                                                    disabled={total == 0 ? true: false}
                                                    maxLength="100"
                                                    autoComplete="off"
                                                    ref={registerSale({
                                                        validate: (reference) => {
                                                            if(tAmmount && !reference){
                                                                return "La referencia es requerida"
                                                            }
                                                        }
                                                    })}
                                                    className={'form-control' + (errors.tReference ? ' is-invalid' : '')}
                                                    name="tReference"
                                                />
                                                {errorsSale.tReference && <div className="invalid-feedback d-block">{errorsSale.tReference.message}</div>}
                                            </FormGroup>
                                        </div>
                                        <div className="mb-2"><b>Punto Adicional</b></div>
                                        <Row form>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for="terminalExtra">Punto</Label>
                                                    <select className={'form-control' + (errors.terminalExtra ? ' is-invalid' : '')} name="terminalExtra"
                                                        disabled={total == 0 ? true: false}
                                                        ref={registerSale({ 
                                                                validate: terminalExtra =>{
                                                                    if(pos){
                                                                        if(pos == terminalExtra){
                                                                            return "Seleccione otro punto de venta"
                                                                        }
                                                                    }
                                                                }
                                                            })}>
                                                            <option key="" name="" value=""></option>
                                                            {terminaList && terminaList.map(list => 
                                                                <option
                                                                    key={list.id}
                                                                    name={list.id}
                                                                    value={list.id}>
                                                                    {list.code}
                                                                </option>
                                                            )}
                                                    </select>
                                                    {errorsSale.terminalExtra && <div className="invalid-feedback d-block">Seleccione otro punto de venta</div>}
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for="pAmmountExtra">Monto</Label>
                                                    <Controller
                                                        name="pAmmountExtra"
                                                        control={controlSale}
                                                        rules={{
                                                            validate: (value) =>{
                                                                if(posExtra && !value){
                                                                    return "El monto de punto de venta es requerido"
                                                                }
                                                            }
                                                        }}
                                                        as={<NumberFormat className={'form-control' + (errorsSale.pAmmountExtra ? ' is-invalid' : '')} thousandSeparator={true} />}
                                                    />
                                                    {errorsSale.pAmmountExtra && <div className="invalid-feedback">{errorsSale.pAmmountExtra.message}</div>}
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for="pReferenceExtra">Referencia</Label>
                                                    <input
                                                        maxLength="100"
                                                        autoComplete="off"
                                                        ref={registerSale({
                                                            validate: (reference) => {
                                                                if(posExtra && !reference){
                                                                    return "la referencia es requerida"
                                                                }
                                                            }
                                                        })}
                                                        disabled={total == 0 ? true: false}
                                                        className={'form-control' + (errorsSale.pReferenceExtra ? ' is-invalid' : '')}
                                                        name="pReferenceExtra"
                                                    />
                                                    {errorsSale.pReferenceExtra && <div className="invalid-feedback d-block">{errorsSale.pReferenceExtra.message}</div>}
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    </Collapse>
                                    <Row>
                                        <Col>
                                        <Button color="primary" disabled={registering || registeringOffline}>
                                                {registering && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                                Cobrar
                                            </Button>{' '}
                                        </Col>
                                        <Col>
                                            <div  className="pull-right">
                                                <Button onClick={e =>{e.preventDefault(); history.goBack();} }>Cancelar</Button>
                                            </div>
                                        </Col>
                                    </Row>
                                    {/* Ventas offline por procesar */}
                                    <Row>
                                        <Col>
                                            <div className="pull-left">
                                                <Button color="primary" disabled={((pending.sales && pending.sales.length>0) && (!registering && !registeringOffline)) ? false: true} onClick={e =>{e.preventDefault(); onProcessData();} }>
                                                    {registeringOffline && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                                    Procesar Ventas { pendingSales !== '' ? pendingSales: '' }
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            
                                        </div>
                                        
                                    </div>
                                </Form>
                            </Col>
                        </Row>
                        <Modal toggle={() => {setModalVisible(false); setModalMsg('')}} isOpen={modalVisible}>
                            <div className="modal-header">
                            <h5 className="modal-title" id="examplemodalMsgLabel">
                                Pago
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
                        <Modal toggle={() => {setModalChange(false); setModalMsg('')}} isOpen={modalChange}>
                            <div className="modal-header">
                            <h5 className="modal-title" id="examplemodalMsgLabel">
                                Forma de cambio
                            </h5>
                            <button
                                aria-label="Close"
                                className="close"
                                type="button"
                                onClick={() =>  {setModalChange(false); setModalMsg('')}}
                            >
                                <span aria-hidden={true}>×</span>
                            </button>
                            </div>
                            <div className="modal-body">
                                <div style={{marginBottom:20}}>
                                    {exceeded >0 && <>
                                        <div className="d-flex justify-content-between" style={{marginBottom:10}}>
                                            <div style={{fontSize:'0.9em'}}>
                                                BsS:{' '}<b><NumberFormat value={ totalBsChange.toFixed(2) } displayType={'text'} thousandSeparator={true} prefix={'Bs '} /></b>
                                            </div>  
                                            <div style={{fontSize:'0.9em'}}>
                                                Dólar:{' '}<b><NumberFormat value={ totalDollarChange.toFixed(2) } displayType={'text'} thousandSeparator={true} prefix={'$ '} /></b>
                                            </div> 
                                            <div style={{fontSize:'0.9em'}}>
                                                Euros:{' '}<b><NumberFormat value={ totalEurChange.toFixed(2) } displayType={'text'} thousandSeparator={true} prefix={'€ '} /></b>
                                            </div>   
                                            <div style={{fontSize:'0.9em'}}>
                                                Pesos:{' '}<b><NumberFormat value={ totalCopChange.toFixed(2) } displayType={'text'} thousandSeparator={true} prefix={'$ '} /></b>
                                            </div>
                                       </div>
                                       <Form onSubmit={handleSubmitChange(onRegisterChange)}>
                                            <Row>
                                            <div className="col">
                                            <FormGroup>
                                            <Label for="typeChange">Forma de pago</Label>
                                            <select className={'form-control' + (errorsChange.typeChange ? ' is-invalid' : '')} name="typeChange"
                                                ref={registerChange({ 
                                                        required: "El tipo de divisa es requerido" 
                                                    })}>
                                                    <option key="0" name="" value="">Seleccione</option>
                                                    <option key="1" name="1" value="1">BsS</option>
                                                    <option key="2" name="2" value="2">Dólar</option>
                                                    <option key="3" name="3" value="3">Euros</option>
                                                    <option key="4" name="4" value="4">Pesos</option>
                                            </select>
                                            {errorsChange.typeChange && <div className="invalid-feedback d-block">{errorsChange.typeChange.message}</div>}
                                            </FormGroup>
                                            </div>
                                            <div className="col">
                                                <FormGroup>
                                                    <Label for="changeAmmount">Monto</Label>
                                                    <Controller
                                                        name="changeAmmount"
                                                        control={controlChange}
                                                        rules={{
                                                            required: "El monto es requerido",
                                                            validate: value =>{
                                                                let amount = parseFloat(value.toString().replace(/,/g, ''));
                                                                if(value == '' || value < 0 ){
                                                                    return "El monto es requerido"
                                                                }
                                                                if(typeChange == '1'){
                                                                    if(amount > parseFloat(totalBsChange)){
                                                                        return "El valor no puede ser mayor a lo indicado en BsS"
                                                                    }
                                                                }else if(typeChange == '2'){
                                                                    if(amount > parseFloat(totalDollarChange)){
                                                                        return "El valor no puede ser mayor a lo indicado en Dólares"
                                                                    }
                                                                }else if(typeChange == '3'){
                                                                    if(amount > parseFloat(totalEurChange)){
                                                                        return "El valor no puede ser mayor a lo indicado en Euros"
                                                                    }
                                                                }else if(typeChange == '4'){
                                                                    if(amount > parseFloat(totalCopChange)){
                                                                        return "El valor no puede ser mayor a lo indicado en Pesos"
                                                                    }
                                                                }
                                                            } 
                                                        }}
                                                        as={<NumberFormat className={'form-control' + (errorsChange.changeAmmount ? ' is-invalid' : '')} thousandSeparator={true} />}
                                                    />
                                                    {errorsChange.changeAmmount && <div className="invalid-feedback">{errorsChange.changeAmmount.message}</div>}
                                                </FormGroup>
                                            </div>
                                            </Row>
                                            <Row>
                                                <Col>
                                                <Button color="primary" disabled={registering}>
                                                    {registering && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                                    Procesar cambio
                                                </Button>
                                                </Col>
                                                <Col>
                                                    <div  className="pull-right">
                                                        <Button color="secondary" type="button" onClick={() =>  {setModalChange(false); setModalMsg('')}}>
                                                            Cerrar
                                                        </Button>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Form>
                                       </>
                                    }
                                </div>
                            </div>
    
                        </Modal>
                        </Container>
                    </div>

				</div>
            </div>
        </>
    );
}

export default SalesCreateOfflinePage;