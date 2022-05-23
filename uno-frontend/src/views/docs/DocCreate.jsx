/* eslint-disable */
import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { documentActions } from '../../actions';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Col, Row, Button, Form, FormGroup, Label, Container, Alert  } from 'reactstrap';
import { useForm  } from "react-hook-form";
import { history } from '../../helpers';
import { useLocation } from "react-router-dom";

function DocCreatePage() {

    const location = useLocation();

  	useEffect(() => {
		document.body.classList.add("landing-page");
		document.body.classList.add("sidebar-collapse");
		document.documentElement.classList.remove("nav-open");
		return function cleanup() {
			document.body.classList.remove("landing-page");
			document.body.classList.remove("sidebar-collapse");
		};
    });

    //obtener estudiante del state
    const [student, setStudent] = useState(null);

    /**
     * Obtener parametros del estudiante (id)
     */
     useEffect(() => {

        if(location.state === undefined){
            history.goBack();
        }else{
            setStudent(location.state.student)
        }
    }, [location]);
      
	//usuario
    //const user = useSelector(state => state.authentication.user);
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
        if(student){
            const formData = new FormData();
            formData.append("user", student._id);
            formData.append("type", data.type);
            formData.append("document", data.file[0]);
            dispatch(documentActions.createDocument( formData ));
        }
    };

    //State de guardado
    const registering = useSelector(state => state.documents.registering);

    const registerSuccess = useSelector(state => state.documents.register);

    useEffect(() => {
        if(registerSuccess){
            reset();
            setFileName('Ningún archivo seleccionado');
            setTypeSelected('');
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

    const [typeSelected, setTypeSelected] = useState('');

    const handleChangeType = (e) =>  {
        setTypeSelected( e.target.value);
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
                                <h3>Agregar documento</h3>
                                {student && <>
                                    <h4>{student.firstName} {student.lastName}</h4>
                                </>
                                }
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
                                        <Col md={12}>
                                            <FormGroup>
                                                <Label for="type">Tipo</Label>{' '}
                                                <select className={'form-control' + (errors.type ? ' is-invalid' : '')} name="type"
                                                    value={typeSelected} onChange={handleChangeType}
                                                    ref={register({ 
                                                            required: "El tipo de documento es requerido" 
                                                        })}>
                                                        <option key="" name="" value="">Seleccione tipo</option>
                                                        <option key="1" name="1" value="1">Acta de nacimiento</option>
                                                        <option key="2" name="2" value="2">CURP</option>
                                                        <option key="3" name="3" value="3">Certificado de preparatoria</option>
                                                        <option key="4" name="4" value="4">Comprobante de domicilio</option>
                                                        <option key="5" name="5" value="5">Frontal identificación oficial</option>
                                                        <option key="6" name="6" value="6">Reverso identificación oficial</option>
                                                </select>
                                                {errors.type && <div className="invalid-feedback d-block">{errors.type.message}</div>}
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
                                                accept="application/pdf"
                                                onChange={handleChange}
                                            />
                                            <label className="custom-file-label" htmlFor="customFile"></label>
                                        </div>
                                        {errors.file && <div className="invalid-feedback d-block">{errors.file.message}</div>}
                                    </FormGroup>
                                    <p style={{fontSize:"1em"}}>Sólo se permiten archivos pdf y un máximo de 2Mb</p>
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

export default DocCreatePage;