/* eslint-disable */
import React, { useState, useEffect } from 'react';
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

import { userActions } from '../actions';


import { Icon, InlineIcon } from '@iconify/react';
import keyIcon from '@iconify/icons-fa-solid/key';
import userCircle from '@iconify/icons-fa-solid/user-circle';

// core components
import ExamplesNavbar from "../components/Navbars/LoginNavbar";
import TransparentFooter from "../components/Footers/TransparentFooter";
import login2 from '../assets/img/34642272.jpg';
import logo from '../assets/img/logoFattoria.png';

function LoginPage() {
    const [inputs, setInputs] = useState({
        username: '',
        password: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const { username, password } = inputs;
	const loggingIn = useSelector(state => state.authentication.loggingIn);
	const alert = useSelector(state => state.alert);
    const dispatch = useDispatch();
    
    // reset login status
    useEffect(() => { 
        dispatch(userActions.logout()); 
    }, []);

    function handleChange(e) {
        const { name, value } = e.target;
        setInputs(inputs => ({ ...inputs, [name]: value }));
    }

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

    function handleSubmit(e) {
        e.preventDefault();

        setSubmitted(true);
        if (username && password) {
            dispatch(userActions.login(username, password));
        }
	}
	
	const [visible, setVisible] = useState(true);

	const onDismiss = () => setVisible(false);

	useEffect(() => {
        if(alert.message){
			setVisible(true);
		}
    },[alert]);

    return (
        <>
        <ExamplesNavbar />
        <div className="page-header clear-filter" filter-color="">
        <div
          	className="page-header-image"
          	style={{
                backgroundImage: `url(${login2})`
          	}}
        ></div>
        <div className="content">
            <Container>
            	<Col className="ml-auto mr-auto" md="4">
              	<Card className="card-login card-plain">
                	<Form name="form" onSubmit={handleSubmit} className="form">
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
                                <Icon icon={userCircle} />
                                </InputGroupText>
                            </InputGroupAddon>
                            <Input
                                placeholder="Usuario"
                                type="text" name="username" value={username} autoComplete="off"
                                onChange={handleChange}
                                onFocus={() => setFirstFocus(true)}
                                onBlur={() => setFirstFocus(false)}
                            ></Input>
                        </InputGroup>
                        {submitted && !username &&
                             <div className="text-primary mb-2">Usuario requerido</div>
                        } 
                        <InputGroup className={"no-border input-lg" + (lastFocus ? " input-group-focus" : "")}>
                            <InputGroupAddon addonType="prepend">
                                <InputGroupText>
                                <Icon icon={keyIcon} />
                                </InputGroupText>
                            </InputGroupAddon>
                            <Input
                                type="password" name="password" value={password}
                                placeholder="Contraseña"
                                onChange={handleChange}
                                onFocus={() => setLastFocus(true)}
                                onBlur={() => setLastFocus(false)}
                            ></Input>
                        </InputGroup>
                        {submitted && !password &&
                             <div className="text-primary">Contraseña requerida</div>
                        } 
                  	</CardBody>
					<CardFooter className="text-center">
						<Button
							block
							className="btn-round"
							color="primary"
                            size="lg"
                            outline
                            style={{fontWeight: "bold"}}
						>
						{loggingIn && <span className="spinner-border spinner-border-sm mr-1"></span>}
							INGRESAR
						</Button>
						<div className="pull-right">
						{/* <h6>
							<a
							className="link"
							href="#pablo"
							onClick={e => e.preventDefault()}
							>
							Ayuda
							</a>
						</h6> */}
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