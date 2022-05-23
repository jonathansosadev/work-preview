/* eslint-disable */
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fileActions } from '../../actions';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Col, Row, Button, Form, FormGroup, Label, Container, Alert  } from 'reactstrap';
import { useForm  } from "react-hook-form";
import { history } from '../../helpers';

function FileCreatePage() {

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
    const { handleSubmit, register, errors, reset } = useForm();

    //Registrar data
    const onCreateData = (data, e) => {
        const formData = new FormData();
        formData.append("user", user.id);
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("document", data.file[0]);
        dispatch(fileActions.createFile( formData ));
    };

    //State de guardado
    const registering = useSelector(state => state.files.registering);

    const registerSuccess = useSelector(state => state.files.register);

    useEffect(() => {
        if(registerSuccess){
            reset();
            setFileName('Ningún archivo seleccionado');
        }
    },[registerSuccess]);


    // Referencia de input file y click
    const hiddenFileInput = useRef(null);
    
    const handleClick = () => {
        hiddenFileInput.current.click();
    };

    const [fileName, setFileName] = useState('Ningún archivo seleccionado');
    const handleChange = event => {
        if(event.target.files[0]){
            const fileUploaded = event.target.files[0];
            setFileName(fileUploaded.name);
        }else{
            setFileName('Ningún archivo seleccionado');
        }
    };

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
                                <h3>Agregar documento</h3>
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
                                            <Label for="title">Título</Label>
                                            <input
                                                disabled={registering}
                                                maxLength="50"
                                                autoComplete="off"
                                                className={'form-control' + (errors.title ? ' is-invalid' : '')}
                                                name="title"
                                                ref={register({
                                                    required: "El nombre es requerido",
                                                })}
                                            />
                                            {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
                                        </FormGroup>
                                        </Col>
                                        <Col md={6}>
                                        <FormGroup>
                                            <Label for="description">Descripción</Label>
                                            <input
                                                disabled={registering}
                                                maxLength="100"
                                                autoComplete="off"
                                                className={'form-control' + (errors.description ? ' is-invalid' : '')}
                                                name="description"
                                                ref={register({
                                                    required: "La descripción es requerida",
                                                })}
                                            />
                                            {errors.description && <div className="invalid-feedback">{errors.description.message}</div>}
                                        </FormGroup>
                                        </Col>
                                    </Row>
                                    <FormGroup>
                                        <Label for="file">Archivo</Label>
                                        <div className="mb-1">
                                            <Button color="primary" className="btn-round" size="sm" disabled={registering} onClick={handleClick}>
                                               Seleccionar archivo
                                            </Button>
                                            <label style={{fontSize:12}}>{fileName}</label>
                                        </div>
                                        
                                        <div className="custom-file" style={{ display: 'none' }}>
                                            <input type="file" 
                                                type="file"
                                                className={'custom-file-input' + (errors.file ? ' is-invalid' : '')}
                                                name="file"
                                                ref={(e) => {
                                                    register(e, { required: "El archivo es requerido" })
                                                    hiddenFileInput.current = e;
                                                }}
                                                accept="application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,
                                                application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,
                                                application/pdf,application/vnd.oasis.opendocument.text"
                                                onChange={handleChange}
                                            />
                                            <label className="custom-file-label" htmlFor="customFile"></label>
                                        </div>
                                        {errors.file && <div className="invalid-feedback d-block">{errors.file.message}</div>}
                                    </FormGroup>
                                    <p style={{fontSize:"1em"}}>Sólo se permiten archivos de tipo Word, PowerPoint, Pdf y ODT y un máximo de 2Mb</p>
                                    <div className="d-flex justify-content-between">
                                        <Button color="primary" className="btn-round" disabled={registering}>
                                            {registering && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                            Guardar
                                        </Button>
                                        <Button className="btn-round" outline onClick={e =>{e.preventDefault(); history.goBack();} }>Cancelar</Button>
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

export default FileCreatePage;