/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// reactstrap components
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Form,
    Input,
    InputGroupAddon,
    InputGroupText,
    InputGroup,
    Container,
    Col,
	Alert
} from "reactstrap";
import { useForm  } from "react-hook-form";
  
import { userActions } from '../actions';

// core components
import LoginNavbar from "../components/Navbars/LoginNavbar";
import TransparentFooter from "../components/Footers/TransparentFooter";
import login2 from '../assets/img/login-2.png';
import logo from '../assets/img/UNOlogo.png';
import { Icon } from '@iconify/react';
import user3Fill from '@iconify-icons/ri/user-3-fill';
import key2Fill from '@iconify-icons/ri/key-2-fill';

function LoginPage() {
   
	const loggingIn = useSelector(state => state.authentication.loggingIn);
	const alert = useSelector(state => state.alert);
    const dispatch = useDispatch();
    
    // reset login status
    useEffect(() => { 
        dispatch(userActions.logout()); 
    }, []);

    const [firstFocus, setFirstFocus] = React.useState(false);
    const [lastFocus, setLastFocus] = React.useState(false);

    useEffect(() => {
        document.body.classList.add("login-page");
        document.body.classList.add("sidebar-collapse");
        document.documentElement.classList.remove("nav-open");
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        return function cleanup() {
            document.body.classList.remove("login-page");
            document.body.classList.remove("sidebar-collapse");
        };
    },[]);
    
    //Alert
	const [visible, setVisible] = useState(true);
	const onDismiss = () => setVisible(false);

	useEffect(() => {
        if(alert.message){
			setVisible(true);
		}
    },[alert]);

    //Form Data
    const { handleSubmit, register, errors } = useForm();

    //Login
    const onLogin = (data, e) => {
        dispatch(userActions.login(data.email, data.password));
    };

    return (
        <>
        <LoginNavbar />
        <div className="page-header clear-filter">
        <div className="page-header-image" style={{ backgroundImage: `url(${login2})`}}></div>
        <div className="content">
            <Container>
            	<Col className="ml-auto mr-auto" md="4">
              	<Card className="card-login card-plain">
                	<Form name="form" onSubmit={handleSubmit(onLogin)} className="form">
					<CardHeader className="text-center">
						<div className="logo-container">
						    <img alt="..." src={logo}></img>
						</div>
					</CardHeader>
                  	<CardBody>
					   	{alert.message &&
							<Alert color={`alert ${alert.type}`} isOpen={visible} toggle={onDismiss} fade={false}>
								{alert.message}
							</Alert>
        				}
                        <InputGroup className={ "no-border input-lg" + (firstFocus ? " input-group-focus" : "")}>
                            <InputGroupAddon addonType="prepend">
                                <InputGroupText>
                                    <Icon icon={user3Fill} width="20" height="20"/>
                                </InputGroupText>
                            </InputGroupAddon>
                            <Input type="text" name="email" autoComplete="off"
                                placeholder="Correo electrónico"
                                onFocus={() => setFirstFocus(true)}
                                onBlur={() => setFirstFocus(false)}
                                innerRef={register({
                                    required: "Correo electrónico requerido",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Correo electrónico inválido"
                                    }
                                })}
                            ></Input>
                        </InputGroup>
                        {errors.email && <div className="text-danger-login mb-2" style={{fontSize:12}}>{errors.email.message}</div>}
                        <InputGroup className={"no-border input-lg" + (lastFocus ? " input-group-focus" : "")}>
                            <InputGroupAddon addonType="prepend">
                                <InputGroupText>
                                    <Icon icon={key2Fill} width="20" height="20"/>
                                </InputGroupText>
                            </InputGroupAddon>
                            <Input type="password" name="password"
                                placeholder="Contraseña"
                                onFocus={() => setLastFocus(true)}
                                onBlur={() => setLastFocus(false)}
                                innerRef={register({
                                    required: "Contraseña requerida",
                                })}
                            ></Input>
                        </InputGroup>
                        {errors.password && <div className="text-danger-login mb-2" style={{fontSize:12}}>{errors.password.message}</div>}
                  	</CardBody>
					<CardFooter className="text-center">
						<Button block className="btn-round" color="primary" size="lg" outline style={{fontWeight: "bold"}}>
						    {loggingIn && <span className="spinner-border spinner-border-sm mr-1"></span>}
							INGRESAR
						</Button>
						<div className="pull-left">
							<h6><Link to="/register" className="link">Registrarse</Link></h6>
						</div>
						<div className="pull-right">
						    <h6><Link to="/recover" className="link">Recuperar contraseña</Link></h6>
						</div>
					</CardFooter>
                </Form>
              	</Card>
            </Col>
          	</Container>
        </div>
        <TransparentFooter />
        </div>
        </>
    );
}

export default LoginPage;