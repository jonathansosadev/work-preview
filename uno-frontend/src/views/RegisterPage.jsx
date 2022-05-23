/* eslint-disable */
import React, { useState, useEffect, createRef, useRef, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { userActions } from '../actions';
import { useForm } from "react-hook-form";
import { history } from '../helpers';
import { sitekey } from '../config/config';
// reactstrap components
import {
    Button,
    Form,
    Container,
    Row,
    Alert
} from "reactstrap";
// core components
import LoginNavbar from "../components/Navbars/LoginNavbar";
import TransparentFooter from "../components/Footers/TransparentFooter";
import login2 from '../assets/img/login-2.png';
import ReCAPTCHA from "react-google-recaptcha";

// Hook dimesiones captcha
function useDimensions(targetRef) {

    const getDimensions = () => {

        if(targetRef.current){
            let width = targetRef.current.offsetWidth;
            var scale;
            if (width <= 290) {
                scale = width / 310;
            } else{
                scale = 1.0; 
            }
        }

        return {
            width: targetRef.current ? targetRef.current.offsetWidth : 0,
            height: targetRef.current ? targetRef.current.offsetHeight : 0,
            scale,
        };
    };
  
    const [dimensions, setDimensions] = useState(getDimensions);
  
    const handleResize = () => {
        setDimensions(getDimensions());
    };
  
    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
  
    useLayoutEffect(() => {
        handleResize();
    }, []);
    
    return dimensions;
}

function RegisterPage() {
    const recaptchaRef = createRef();
    const { handleSubmit, register, errors, watch } = useForm();
    let pwd = watch("password");
    
    const registering = useSelector(state => state.registration.registering);
    const alert = useSelector(state => state.alert);
    const dispatch = useDispatch();

    // reset login status
    useEffect(() => {
        dispatch(userActions.logout());
    }, []);

    //Mostrar alerta
    const [visible, setVisible] = useState(true);
    const onDismiss = () => setVisible(false);
    
    useEffect(() => {
        if(alert.message){
			setVisible(true);
		}
    },[alert]);

    //Registrarse
    const onSubmit = (user, e) => {
        if(!captcha){
            setValidate(true);
            return;
        }
        dispatch(userActions.register(user));
    };

    useEffect(() => {
        document.body.classList.add("signup-page");
        document.body.classList.add("sidebar-collapse");
        document.documentElement.classList.remove("nav-open");
        return function cleanup() {
            document.body.classList.remove("landing-page");
            document.body.classList.remove("sidebar-collapse");
        };
    });

    const [captcha, setCaptcha] = useState(null);
    const [validate, setValidate] = useState(false);

    //Setear token en el hook del form
    //Si es correcto limpiar el error de requerido
    const onChange = (token) => {
        setCaptcha(token);
        if(token){
            setValidate(false)
        }
    };

    //Al expirar captcha se limpia el token
    const onExpired = () => {
        setCaptcha(null);
    };

    const targetRef = useRef();
    const size = useDimensions(targetRef);

    return (
        <>
		<LoginNavbar />
        <div className="page-header clear-filter">
            <div className="page-header-image" style={{ backgroundImage: `url(${login2})`}}></div>
            <div className="content">
                <Container>
                    <Row>
                        <div className="ml-auto mr-auto col-md-6 col-lg-4">
                            <div className="info info-horizontal">
                                
                                <div className="description"><h5 className="info-title">Universidad Nacional Obrera</h5>
                                <p className="description">Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed
                                    diam nonummy nibh euismod tincidunt ut laoreet dolore
                                    magna aliquam erat volutpat. Ut wisi enim ad minim veniam,
                                    quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut
                                    aliquip ex ea commodo consequat. Duis autem vel eum iriure
                                    dolor in hendrerit in vulputate velit esse molestie consequat,
                                    vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan
                                    et iusto odio dignissim qui blandit praesent luptatum zzril
                                    delenit augue duis dolore te feugait nulla facilisi.
                                    Lorem ipsum dolor sit amet, cons ectetuer adipiscing elit, sed
                                    diam nonummy nibh euismod tincidunt ut laoreet dolore
                                    magna aliquam erat volutpat. Ut wisi enim ad minim veniam,
                                    quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut
                                    aliquip ex ea commodo consequat.
                                </p>
                                </div>
                            </div>
                        </div>
                        <div className="mr-auto col-md-6 col-lg-4">
                            <div className="card-signup card">
                                <div className="card-body">
                                    {alert.message &&
                                        <Alert color={`alert ${alert.type}`} isOpen={visible} toggle={onDismiss} fade={false}>
                                            {alert.message}
                                        </Alert>
                                    }
                                    <h4 className="text-center card-title">Registro</h4>
                                    <Form name="form" onSubmit={handleSubmit(onSubmit)} className="form">
                                        <div className="form-group text-justify">
                                            <label>Nombres</label>
                                            <input
                                                maxLength="40"
                                                autoComplete="off"
                                                className={'form-control' + (errors.firstName ? ' is-invalid' : '')}
                                                name="firstName"
                                                ref={register({
                                                    required: "El nombre es requerido",
                                                })}
                                            />
                                            {errors.firstName && <div className="invalid-feedback">{errors.firstName.message}</div>}
                                        </div>
                                        <div className="form-group text-justify">
                                            <label className="">Apellidos</label>
                                            <input
                                                maxLength="40"
                                                autoComplete="off"
                                                className={'form-control' + (errors.lastName ? ' is-invalid' : '')}
                                                name="lastName"
                                                ref={register({
                                                    required: "El apellido es requerido",
                                                })}
                                            />
                                            {errors.lastName && <div className="invalid-feedback">{errors.lastName.message}</div>}
                                        </div>
                                        <div className="form-group text-justify">
                                            <label>Correo electrónico</label>
                                            <input
                                                autoComplete="off"
                                                className={'form-control' + (errors.email ? ' is-invalid' : '')}
                                                name="email"
                                                ref={register({
                                                    required: "Correo electrónico requerido",
                                                    pattern: {
                                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                                                        message: "Correo electrónico inválido"
                                                    }
                                                })}
                                            />
                                            {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                                        </div>
                                        <div className="form-group text-justify">
                                            <label>Contraseña</label>
                                            <input
                                                maxLength="20"
                                                className={'form-control' + (errors.password ? ' is-invalid' : '')}
                                                name="password"
                                                type="password"
                                                ref={register({
                                                    required: "La contraseña es requerida",
                                                    minLength:{ value:6, message: "La contraseña debe contener mínimo 6 caracteres"}
                                                })}
                                            />
                                            {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                                        </div>
                                        <div className="form-group text-justify">
                                            <label>Confirmar contraseña</label>
                                            <input
                                                maxLength="20"
                                                className={'form-control' + (errors.confirm_password ? ' is-invalid' : '')}
                                                name="confirm_password"
                                                type="password"
                                                ref={register({
                                                    required: "La confirmación de contraseña es requerida",
                                                    validate: value => value === pwd || "Las contraseñas no coinciden"
                                                })}
                                            />
                                            {errors.confirm_password && <div className="invalid-feedback">{errors.confirm_password.message}</div>}
                                        </div>
                                        <div  className="form-group text-justify captcha" ref={targetRef} 
                                            style={{transformOrigin:'0 0', WebkitTransformOrigin:'0 0', 
                                            transform:`scale(${size.scale})`,
                                            WebkitTransform: `scale(${size.scale})` }}>
                                            <ReCAPTCHA
                                                ref={recaptchaRef}
                                                size="normal"
                                                sitekey={sitekey}
                                                hl="es-419"
                                                onChange={onChange}
                                                onExpired={onExpired}
                                            />
                                            {validate && <div className="invalid-feedback d-block">Ingrese captcha</div>}
                                        </div>
                                        <div className="send-button">
                                        <Button
                                            block
                                            className="btn-round"
                                            color="primary"
                                            disabled={registering}
                                        >
                                            {registering && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                            Registarse
                                        </Button>
                                        </div>
                                        <Button block className="btn-round" outline onClick={e =>{e.preventDefault(); history.push('/');} }>Cancelar</Button>
                                    </Form>
                                </div>
                            </div>
                        </div>
                    </Row>
                </Container>
            </div>
            <TransparentFooter />
        </div>
		</>
    );
}

export default RegisterPage;