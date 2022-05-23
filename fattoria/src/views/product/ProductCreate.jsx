/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { productActions } from '../../actions';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Col, Row, Button, Form, FormGroup, Label, Container, Alert  } from 'reactstrap';
import { useForm, Controller  } from "react-hook-form";
import { history } from '../../helpers';
import NumberFormat from 'react-number-format';

function ProductCreatePage() {

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
        //precio sin las comas
        data.price = data.price.replace(/,/g, '');
        dispatch(productActions.createProduct( data, user ));
    };

    //State de guardado
    const registering = useSelector(state => state.products.registering);

    const statusRegister = useSelector(state => state.products);
    //Verificar si guardo y limpiar form
    useEffect(() => {
        if(statusRegister.success){
            reset({
                name:'',
                price:''
            });
        }
    },[statusRegister.success]);

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
                                <h3 style={{ fontWeight:'bold',fontStyle: 'italic'}}>Añadir producto</h3>
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
                                                <Label for="code">Código de producto</Label>
                                                <input
                                                    maxLength="10"
                                                    autoComplete="off"
                                                    className={'form-control' + (errors.code ? ' is-invalid' : '')}
                                                    name="code"
                                                    ref={register({
                                                        required: "Código de producto es requerido",
                                                        pattern: {
                                                            value: /^[0-9]{1,10}$/i,
                                                            message: "Código de producto inválido"
                                                        }
                                                    })}
                                                />
                                                {errors.code && <div className="invalid-feedback">{errors.code.message}</div>}
                                            </FormGroup>
                                        </Col>
                                        <Col md={6}>
                                            <FormGroup>
                                                <Label for="name">Nombre</Label>
                                                <input
                                                    maxLength="100"
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
                                    </Row>
                                    <Row form>
                                        <Col md={6}>
                                            <FormGroup>
                                                <Label for="presentation">Presentación</Label>{' '}
                                                <select className={'form-control' + (errors.presentation ? ' is-invalid' : '')} name="presentation"
                                                    ref={register({ 
                                                            required: "La presentación es requerida" 
                                                        })}>
                                                        <option key="kg" name="kg" value="kg">kg</option>
                                                        <option key="Unidades" name="Unidades" value="Unidades">Unidades</option>
                                                </select>
                                                {errors.presentation && <div className="invalid-feedback d-block">{errors.presentation.message}</div>}
                                            </FormGroup>
                                        </Col>
                                        <Col md={6}>
                                            <FormGroup>
                                                <Label for="price">Precio</Label>
                                                <Controller
                                                    name="price"
                                                    control={control}
                                                    rules={{
                                                        min: {
                                                            value: 1,
                                                            message: "El precio es requerido"
                                                        },
                                                        required: "El precio es requerido",
                                                    }}
                                                    as={<NumberFormat  className={'form-control' + (errors.price ? ' is-invalid' : '')} thousandSeparator={true} />}
                                                />
                                                {errors.price && <div className="invalid-feedback">{errors.price.message}</div>}
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <FormGroup check>
                                        <Label check>
                                        <input type="checkbox" name="decrease" ref={register}></input>
                                            Merma por empaque{" "}
                                        <span className="form-check-sign">
                                            <span className="check"></span>
                                        </span>
                                        </Label>
                                    </FormGroup>
                                    <FormGroup check>
                                        <Label check>
                                        <input type="checkbox" name="reweigh" ref={register}></input>
                                            Merma por humedad{" "}
                                        <span className="form-check-sign">
                                            <span className="check"></span>
                                        </span>
                                        </Label>
                                    </FormGroup>
                                    <FormGroup check>
                                        <Label check>
                                        <input type="checkbox" name="mincemeat" ref={register}></input>
                                            Merma por picadillo{" "}
                                        <span className="form-check-sign">
                                            <span className="check"></span>
                                        </span>
                                        </Label>
                                    </FormGroup>
                                    <div className="d-flex justify-content-between">
                                        <Button color="primary" disabled={registering}>
                                            {registering && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                            Guardar
                                        </Button>
                                        <Button onClick={e =>{e.preventDefault(); history.goBack();} }>Cancelar</Button>
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

export default ProductCreatePage;