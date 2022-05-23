/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { boxActions } from '../../actions';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Col, Row, Button, Form, FormGroup, Label, Container, Alert, Modal, Table  } from 'reactstrap';
import { useForm, Controller  } from "react-hook-form";
import { history } from '../../helpers';
import NumberFormat from 'react-number-format';

function BoxWithdrawalPage() {

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

        data.agencyName = user.agency.name;
        data.agency = user.agency.id;
        data.user = user.id;
        let coinDes = [
            '','Bs.S','Dólar','Euro','Pesos'
        ]
        let typeDes = [
            '','Retiro','Gasto'
        ]

        data.coinDes = coinDes[data.coin];
        data.typeDes = typeDes[data.type];

        setDataBox(data);
        setModalVisible(true);

    };

    const [dataBox, setDataBox] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    //State de guardado
    const withdrawing = useSelector(state => state.box.withdrawing);

    const saveOpening = () =>{
        //Retirar de caja
        dispatch(boxActions.boxWithdraw( dataBox ));
    }

    const box = useSelector(state => state.box);

    useEffect(() => {
        if(box.success){
            reset({
                type:'',
                amount:'',
                comment:'',
                coin:'',
            });
            setModalVisible(false);
        }else{
            setModalVisible(false);
        }
    },[box]);

    const [placeHolder, setPlaceHolder] = useState('Comentarios');
    const handleChange = (e) =>  {
        if(e.target.value == 1){
            setPlaceHolder('Indicar el concepto del retiro y la fecha del mismo');
        }else if(e.target.value == 2){
            setPlaceHolder('Indicar el concepto del gasto, el número factura y la fecha del mismo');
        }else{
            setPlaceHolder('Comentarios');
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
                                <h3 style={{ fontWeight:'bold',fontStyle: 'italic'}}>Retiro de caja</h3>
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
                                                <Label for="username">Monto</Label>
                                                <Controller
                                                    name="amount"
                                                    control={control}
                                                    rules={{
                                                        min: {
                                                            value: 1,
                                                            message: "El valor es requerido"
                                                        },
                                                        required: "El valor es requerido",
                                                    }}
                                                    as={<NumberFormat className={'form-control' + (errors.amount ? ' is-invalid' : '')} thousandSeparator={true} />}
                                                />
                                                {errors.amount && <div className="invalid-feedback">{errors.amount.message}</div>}
                                            </FormGroup>
                                        </Col> 
                                        <Col md={6}> 
                                            <FormGroup>
                                                <Label for="coin">Divisa</Label>{' '}
                                                <select className={'form-control' + (errors.rol ? ' is-invalid' : '')} name="coin"
                                                    ref={register({ 
                                                            required: "La divisa es requerida" 
                                                        })}>
                                                        <option key="0" name="" value=""></option>
                                                        <option key="1" name="1" value="1">Bs.S</option>
                                                        <option key="2" name="2" value="2">Dólar</option>
                                                        <option key="3" name="3" value="3">Euro</option>
                                                        <option key="5" name="4" value="4">Pesos</option>
                                                </select>
                                                {errors.coin && <div className="invalid-feedback d-block">{errors.coin.message}</div>}
                                            </FormGroup>
                                        </Col>   
                                    </Row>
                                    <Row form>
                                        <Col md={12}>  
                                            <FormGroup>
                                                <Label for="type">Tipo</Label>{' '}
                                                <select className={'form-control' + (errors.type ? ' is-invalid' : '')} name="type"
                                                    onChange={handleChange}
                                                    ref={register({ 
                                                            required: "La tipo de egreso es requerido" 
                                                        })}>
                                                        <option key="0" name="" value=""></option>
                                                        <option key="1" name="1" value="1">Retiro</option>
                                                        <option key="2" name="2" value="2">Gasto</option>
                                                </select>
                                                {errors.type && <div className="invalid-feedback d-block">{errors.type.message}</div>}
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row form>
                                        <Col md={12}>  
                                            <FormGroup>
                                                <Label for="comment">Comentarios</Label>
                                                <input
                                                    maxLength="150"
                                                    autoComplete="off"
                                                    className={'form-control' + (errors.comment ? ' is-invalid' : '')}
                                                    name="comment"
                                                    placeholder={placeHolder}
                                                    ref={register({ 
                                                        required: "El comentario es requerido" 
                                                    })}
                                                />
                                                 {errors.comment && <div className="invalid-feedback d-block">{errors.comment.message}</div>}
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <div className="d-flex justify-content-between">
                                        <Button color="primary" disabled={withdrawing}>
                                            {withdrawing && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                            Guardar
                                        </Button>
                                        <Button onClick={e =>{e.preventDefault(); history.goBack();} }>Cancelar</Button>
                                    </div>
                                </Form>
                            </Col>
                        </Row>
                        <Modal toggle={() => {setModalVisible(false); setDataBox(null)}} isOpen={modalVisible}>
                            <div className="modal-header">
                            <h5 className="modal-title" id="examplemodalMsgLabel">
                                ¿Confirmar retiro de caja?
                            </h5>
                            <button
                                aria-label="Close"
                                className="close"
                                type="button"
                                onClick={() =>  {setModalVisible(false); setDataBox(null)}}
                            >
                                <span aria-hidden={true}>×</span>
                            </button>
                            </div>
                            <div className="modal-body">
                                <Table striped responsive>
                                    <thead>
                                        <tr>
                                            <th>Sucursal</th>
                                            <th>Monto</th>
                                            <th>Divisa</th>
                                            <th>Tipo</th>
                                            <th>Comentarios</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {dataBox && <tr>
                                        <td>{dataBox.agencyName}</td>
                                        <td><NumberFormat value={dataBox.amount} displayType={'text'} thousandSeparator={','} decimalSeparator={'.'}  /></td>
                                        <td>{dataBox.coinDes}</td>
                                        <td>{dataBox.typeDes}</td>
                                        <td>
                                            <span className="d-inline-block text-truncate" style={{maxWidth:80}}>
                                                {dataBox.comment}
                                            </span>
                                        </td>
                                        
                                    </tr>
                                    }
                                    </tbody>
                                </Table>
                            </div>
                            <div className="modal-footer">
                                <Button color="primary" disabled={withdrawing} onClick={()=>saveOpening()}>
                                    {withdrawing && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                    Confirmar
                                </Button>
                                <Button color="secondary" type="button" onClick={() => {setModalVisible(false);setDataBox(null);}} disabled={withdrawing}>
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

export default BoxWithdrawalPage;