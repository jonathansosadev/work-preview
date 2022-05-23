/* eslint-disable */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { userActions } from '../../actions';
// reactstrap components
import { Col, Row, Button, Form, FormText, FormGroup, Label, Modal, Container, NavItem, NavLink, Nav, Card, CardHeader, CardBody, TabContent, TabPane, Alert  } from 'reactstrap';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { useForm, Controller  } from "react-hook-form";
import Datetime from 'react-datetime';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { apiUrl } from '../../config/config';
import moment from 'moment';

// Redimensionamos el canvas al guardar en dispositivos de retina, de lo contrario, la imagen
// será el doble o el triple del tamaño de la vista previa.
function getResizedCanvas(canvas, newWidth, newHeight) {

    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = newWidth;
    tmpCanvas.height = newHeight;
  
    const ctx = tmpCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, newWidth, newHeight);
  
    return tmpCanvas;
}

function ProfilePage() {
    //Usuario logueado
    const [user, setUser] = useState(useSelector(state => state.authentication.user));

    //State de actualizacion
    const updating = useSelector(state => state.users.updating);
    const users = useSelector(state => state.users);
    const uploading = useSelector(state => state.users.uploading);

    //Alertas
    const alert = useSelector(state => state.alert);
    const dispatch = useDispatch();

    //Tabs
    const [plainTabs, setPlainTabs] = useState("1");

    React.useEffect(() => {
        document.body.classList.add("landing-page");
        document.body.classList.add("sidebar-collapse");
        document.documentElement.classList.remove("nav-open");
        return function cleanup() {
            document.body.classList.remove("landing-page");
            document.body.classList.remove("sidebar-collapse");
        };
    });

    //Mostrar alertas
    const [visible, setVisible] = useState(true);
    const onDismiss = () => setVisible(false);
    
    useEffect(() => {
        if(alert.message){
            setVisible(true); 
            window.setTimeout(()=>{setVisible(false)},5000);   
        }
    },[alert]);

    //Modal genérico y mensaje
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMsg, setModalMsg] = useState('');

    //Actualizar estado usuario cambio de información
    useEffect(() => {
        if(users.success){
            setUser(users.userUpdated);
            resetPass();
        }
    },[users.success]);

    //Actualizar estado usuario carga de imagen
    useEffect(() => {
        if(users.uploaded){
            setUser(users.userUpdated);
            cleanCrop();
        }
    },[users.uploaded]);

    //Fechas válidas 
    var validDates = Datetime.moment().subtract(80, 'year');
    var valid = function( current ){
        return current.isAfter( validDates );
    };

    //Form Data
    const { handleSubmit, register, errors, reset, control } = useForm();

    //Form Password
    const { handleSubmit: handleSubmitPass, register: registerPass, errors: errorsPass, reset: resetPass, watch } = useForm();
    let pwd = watch("password");

    //Actualizar data
    const onUpdateData = (data, e) => {
        var validDate =  moment(data.birthday).isValid();

		if(data.birthday != "" && !validDate){
			setModalVisible(true);
			setModalMsg('Ingrese una fecha válida');
			return;
        }

        data.document = data.document.toUpperCase();

        dispatch(userActions.update(user.id, data ));
    };

    //Actualizar data contraseña
    const onUpdatePassword = (data, e) => {
        dispatch(userActions.update(user.id, data ));
    };

    //Crop
    const [upImg, setUpImg] = useState();
    const imgRef = useRef(null);
    const previewCanvasRef = useRef(null);
    const [crop, setCrop] = useState({ unit: '%', width: 30, aspect: 1 / 1 });
    const [completedCrop, setCompletedCrop] = useState(null);
    const inputFileRef = useRef();
    //Seleccionar archivo
    const onSelectFile = e => {
      if (e.target.files && e.target.files.length > 0) {
        const reader = new FileReader();
        reader.addEventListener('load', () => setUpImg(reader.result));
        reader.readAsDataURL(e.target.files[0]);
      }
    };
  
    const onLoad = useCallback(img => {
      imgRef.current = img;
    }, []);

    const cleanCrop = () => {
        setCompletedCrop(null); 
        setUpImg(null); 
        inputFileRef.current.value = "";
    }
  
    //Actualizar canvas
    useEffect(() => {
        if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
            return;
        }
    
        const image = imgRef.current;
        const canvas = previewCanvasRef.current;
        const crop = completedCrop;
        const dpr = window.devicePixelRatio || 1;
    
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const ctx = canvas.getContext('2d');
    
        canvas.width = crop.width * dpr;
        canvas.height = crop.height * dpr;
    
        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width * dpr,
            crop.height * dpr
        );
    }, [completedCrop]);

    /**
     * Procesar canvas y convertirlo en objeto blob y obtener url
     * 
     * @param {HTMLImageElement} Canvas - Objeto de archivo de imagen
     * @param {Object} crop - Objeto crop
     */
    function saveCroppedImg(previewCanvas, crop) {
        if (!crop || !previewCanvas) {
            return;
        }
        
        const dpr = window.devicePixelRatio || 1;
        const canvas =
        dpr !== 1 ? getResizedCanvas(previewCanvas, crop.width, crop.height) : previewCanvas;

        const reader = new FileReader()
        canvas.toBlob(blob => {
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                dataURLtoFile(reader.result, Date.now()+'cropped.jpg');
            }
        })
    }


    /**
     * Obtener archivo de imagen y crear formData para guardar
     * 
     * @param {String} dataurl 
     * @param {String} filename 
     */
    function dataURLtoFile(dataurl, filename) {

        let arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), 
            n = bstr.length, 
            u8arr = new Uint8Array(n);
                
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        let croppedImage = new File([u8arr], filename, {type:mime});

        const formData = new FormData()
        formData.append('avatar', croppedImage);
        //dispacth upload image
        dispatch(userActions.uploadProfiePic(user.id, formData ));
    }

    //Cargar imagen
    function UploadProfile (image, crop) {
        saveCroppedImg(image, crop);
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
                                <Card className="card-nav-tabs card-plain">
                                    <CardHeader className="card-header-danger">
                                        <div className="nav-tabs-navigation">
                                            <div className="nav-tabs-wrapper">
                                            <Nav data-tabs="tabs" tabs>
                                                <NavItem>
                                                <NavLink
                                                    className={plainTabs === "1" ? "active" : ""}
                                                    href="#"
                                                    onClick={e => {
                                                        reset();
                                                        resetPass();
                                                        cleanCrop();
                                                        setVisible(false);
                                                        e.preventDefault();
                                                        setPlainTabs("1");
                                                    }}
                                                >
                                                    Datos
                                                </NavLink>
                                                </NavItem>
                                                <NavItem>
                                                <NavLink
                                                    className={plainTabs === "2" ? "active" : ""}
                                                    href="#"
                                                    onClick={e => {
                                                        reset();
                                                        resetPass();
                                                        cleanCrop();
                                                        setVisible(false);
                                                        e.preventDefault();
                                                        setPlainTabs("2");
                                                    }}
                                                >
                                                    Acceso
                                                </NavLink>
                                                </NavItem>
                                                <NavItem>
                                                <NavLink
                                                    className={plainTabs === "3" ? "active" : ""}
                                                    href="#"
                                                    onClick={e => {
                                                        reset();
                                                        resetPass();
                                                        cleanCrop();
                                                        setVisible(false);
                                                        e.preventDefault();
                                                        setPlainTabs("3");
                                                    }}
                                                >
                                                    Imagen
                                                </NavLink>
                                                </NavItem>
                                            </Nav>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardBody>
                                        <TabContent
                                            activeTab={"plainTabs" + plainTabs}
                                        >
                                            <TabPane tabId="plainTabs1">
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
                                                <Form onSubmit={handleSubmit(onUpdateData)} className="form">
                                                    <Row form>
                                                        <Col md={ user.role == 2 ? 4:6 }>
                                                        <FormGroup>
                                                            <Label for="email">Correo electrónico</Label>
                                                            <input
                                                                className="form-control-plaintext"
                                                                defaultValue={user.email}
                                                                id="staticEmail"
                                                                readOnly={true  }
                                                                type="text"
                                                            />
                                                            <FormText className="text-muted" color="default" id="emailHelp">
                                                                Nunca compartiremos tu correo electrónico con nadie.
                                                            </FormText>
                                                        </FormGroup>
                                                        </Col>
                                                        <Col md={ user.role == 2 ? 4:6 }>
                                                            {/* Para estudiante no es obligatorio el curp */}
                                                            {(user.role == 2|| user.role == 3) && <>
                                                                <FormGroup>
                                                                    <Label for="document">CURP</Label>
                                                                    <input
                                                                        maxLength="18"
                                                                        autoComplete="off"
                                                                        className={'form-control' + (errors.document ? ' is-invalid' : '')}
                                                                        name="document"
                                                                        ref={register({
                                                                            required: "El CURP es requerido",
                                                                            minLength: { value: 18, message: 'El CURP es requerido' },
                                                                        })}
                                                                        defaultValue={user.document}
                                                                        onInput={(e) => e.target.value = ("" + e.target.value).toUpperCase()}
                                                                    />
                                                                    {errors.document && <div className="invalid-feedback">{errors.document.message}</div>}
                                                                </FormGroup>
                                                            </>                                                         
                                                            }
                                                            {/* Para admin o docente no es obligatorio el curp */}
                                                            {(user.role == 1) && <>
                                                                <FormGroup>
                                                                    <Label for="document">CURP</Label>
                                                                    <input
                                                                        maxLength="20"
                                                                        autoComplete="off"
                                                                        className={'form-control' + (errors.document ? ' is-invalid' : '')}
                                                                        name="document"
                                                                        ref={register}
                                                                        defaultValue={user.document}
                                                                        onInput={(e) => e.target.value = ("" + e.target.value).toUpperCase()}
                                                                    />
                                                                </FormGroup>
                                                            </>                                                         
                                                            }
                                                        </Col>
                                                        {user.role == 2 && <>
                                                            <Col md={4}>
                                                                <FormGroup>
                                                                    <Label for="rfc">RFC</Label>
                                                                    <input
                                                                        maxLength="13"
                                                                        autoComplete="off"
                                                                        className={'form-control' + (errors.rfc ? ' is-invalid' : '')}
                                                                        name="rfc"
                                                                        ref={register({
                                                                            required: "El RFC es requerido",
                                                                            minLength: { value: 12, message: 'Ingrese un RFC válido' },
                                                                        })}
                                                                        defaultValue={user.rfc}
                                                                        onInput={(e) => e.target.value = ("" + e.target.value).toUpperCase()}
                                                                    />
                                                                    {errors.rfc && <div className="invalid-feedback">{errors.rfc.message}</div>}
                                                                </FormGroup>
                                                            </Col>
                                                        </>
                                                        }
                                                    </Row>
                                                    <Row form>
                                                        <Col md={4}>
                                                        <FormGroup>
                                                            <Label for="firstName">Nombres</Label>
                                                            <input
                                                                maxLength="40"
                                                                autoComplete="off"
                                                                className={'form-control' + (errors.firstName ? ' is-invalid' : '')}
                                                                name="firstName"
                                                                ref={register({
                                                                    required: "El nombre es requerido",
                                                                })}
                                                                defaultValue={user.firstName}
                                                            />
                                                            {errors.firstName && <div className="invalid-feedback">{errors.firstName.message}</div>}
                                                        </FormGroup>
                                                        </Col>
                                                        <Col md={4}>
                                                        <FormGroup>
                                                            <Label for="lastName">Apellidos</Label>
                                                            <input
                                                                maxLength="40"
                                                                autoComplete="off"
                                                                className={'form-control' + (errors.lastName ? ' is-invalid' : '')}
                                                                name="lastName"
                                                                ref={register({
                                                                    required: "El apellido es requerido",
                                                                })}
                                                                defaultValue={user.lastName}
                                                            />
                                                            {errors.lastName && <div className="invalid-feedback">{errors.lastName.message}</div>}
                                                        </FormGroup>
                                                        </Col>
                                                        <Col md={4}>
                                                        <FormGroup>
                                                            <Label for="birthday">Fecha de Nacimiento</Label>
                                                            <Datetime locale="Es-es" timeFormat={false} initialValue={user.birthday ? moment(user.birthday).utc().format('YYYY-MM-DD'):''}
                                                                closeOnSelect
                                                                isValidDate={ valid }
                                                                dateFormat={'YYYY-MM-DD'}
                                                                inputProps={{ 
                                                                    name: 'birthday', 
                                                                    ref:(register({
                                                                        required: "La fecha de nacimiento es requerida",
                                                                    })),
                                                                    autoComplete:"off",
                                                                    className: ('form-control' + (errors.birthday ? ' is-invalid' : '')),
                                                                }}
                                                            />
                                                            {errors.birthday && <div className="invalid-feedback d-block">{errors.birthday.message}</div>}
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    <Row form>
                                                    <Col md={6}>
                                                        <FormGroup>
                                                            <Label for="phone">Teléfono para recibir llamadas y SMS</Label>
                                                            <input
                                                                maxLength="20"
                                                                autoComplete="off"
                                                                className={'form-control' + (errors.phone ? ' is-invalid' : '')}
                                                                name="phone"
                                                                ref={register({
                                                                    required: "El teléfono es requerido",
                                                                    pattern: {
                                                                        value: /^[+0-9\s]*$/,
                                                                        message: "Télefono inválido"
                                                                    },
                                                                    minLength: { value: 10, message: 'El teléfono es requerido' },
                                                                })}
                                                                defaultValue={user.phone}
                                                            />
                                                            {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md={6}>
                                                    <FormGroup>
                                                        <Label for="whatsapp">Whatsapp <span style={{fontSize:12}}>(Si es igual al teléfono repetirlo)</span>
                                                        </Label>
                                                        <input
                                                            maxLength="150"
                                                            autoComplete="off"
                                                            className={'form-control' + (errors.whatsapp ? ' is-invalid' : '')}
                                                            name="whatsapp"
                                                            ref={register({
                                                                required: "El whatsapp es requerido",
                                                                pattern: {
                                                                    value: /^[+0-9\s]*$/,
                                                                    message: "Télefono inválido"
                                                                },
                                                                minLength: { value: 10, message: 'El teléfono es requerido' },
                                                            })}
                                                            defaultValue={user.whatsapp}
                                                        />
                                                        {errors.whatsapp && <div className="invalid-feedback">{errors.whatsapp.message}</div>}
                                                    </FormGroup>
                                                    </Col>
                                                </Row>
                                                    <FormGroup>
                                                        <Label for="address">Dirección</Label>
                                                        <input
                                                            maxLength="250"
                                                            autoComplete="off"
                                                            className={'form-control' + (errors.address ? ' is-invalid' : '')}
                                                            name="address"
                                                            ref={register({
                                                                required: "La dirección es requerida"
                                                            })}
                                                            defaultValue={user.address}
                                                        />
                                                        {errors.address && <div className="invalid-feedback">{errors.address.message}</div>}
                                                    </FormGroup>
                                                    <Row form>
                                                        <Col md={4}>
                                                        <FormGroup>
                                                            <Label for="city">Ciudad</Label>
                                                            <input
                                                                maxLength="100"
                                                                autoComplete="off"
                                                                className={'form-control' + (errors.city ? ' is-invalid' : '')}
                                                                name="city"
                                                                ref={register({
                                                                    required: "El ciudad es requerida",
                                                                })}
                                                                defaultValue={user.city}
                                                            />
                                                            {errors.city && <div className="invalid-feedback">{errors.city.message}</div>}
                                                        </FormGroup>
                                                        </Col>
                                                        <Col md={4}>
                                                        <FormGroup>
                                                            <Label for="state">Estado/Municipio</Label>
                                                            <input
                                                                maxLength="100"
                                                                autoComplete="off"
                                                                className={'form-control' + (errors.state ? ' is-invalid' : '')}
                                                                name="state"
                                                                ref={register({
                                                                    required: "El estado/municipio es requerido",
                                                                })}
                                                                defaultValue={user.state}
                                                            />
                                                            {errors.state && <div className="invalid-feedback">{errors.state.message}</div>}
                                                        </FormGroup>
                                                        </Col>
                                                        <Col md={4}>
                                                        <FormGroup>
                                                            <Label for="zip">Código Postal</Label>
                                                            <input
                                                                type="Number"
                                                                maxLength="8"
                                                                autoComplete="off"
                                                                className={'form-control' + (errors.zip ? ' is-invalid' : '')}
                                                                name="zip"
                                                                ref={register({
                                                                    required: "El código postal es requerido",
                                                                })}
                                                                defaultValue={user.zip}
                                                            />
                                                            {errors.zip && <div className="invalid-feedback">{errors.zip.message}</div>}
                                                        </FormGroup>  
                                                        </Col> 
                                                    </Row>
                                                    <Button color="primary" disabled={updating} className="btn-round">
                                                        {updating && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                                        Actualizar
                                                    </Button>
                                                </Form>
                                            </TabPane>
                                            <TabPane tabId="plainTabs2">
                                                {alert.message &&
                                                    <Alert color={`alert ${alert.type}`} isOpen={visible} fade={true}>
                                                        <div className="container">
                                                            {alert.message}
                                                            <button type="button" className="close" aria-label="Close" onClick={onDismiss}>
                                                                <span aria-hidden="true">
                                                                    <i className="now-ui-icons ui-1_simple-remove"></i>
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </Alert>
                                                }
                                                <Form onSubmit={handleSubmitPass(onUpdatePassword)} className="form">
                                                    <FormGroup>
                                                        <label htmlFor="password">Contraseña</label>
                                                        <input
                                                            maxLength="20"
                                                            className={'form-control' + (errorsPass.password ? ' is-invalid' : '')}
                                                            name="password"
                                                            type="password"
                                                            ref={registerPass({
                                                                required: "La contraseña es requerida",
                                                                minLength:{ value:6, message: "La contraseña debe contener mínimo 6 caracteres"}
                                                            })}
                                                        />
                                                        {errorsPass.password && <div className="invalid-feedback">{errorsPass.password.message}</div>}
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <label htmlFor="confirm_password">Confirmar contraseña</label>
                                                        <input
                                                            maxLength="20"
                                                            className={'form-control' + (errorsPass.confirm_password ? ' is-invalid' : '')}
                                                            name="confirm_password"
                                                            type="password"
                                                            ref={registerPass({
                                                                required: "La confirmación de contraseña es requerida",
                                                                validate: value => value === pwd || "Las contraseñas no coinciden"
                                                            })}
                                                        />
                                                        {errorsPass.confirm_password && <div className="invalid-feedback">{errorsPass.confirm_password.message}</div>}
                                                    </FormGroup>
                                                    <Button color="primary" disabled={updating} className="btn-round">
                                                        {updating && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                                        Actualizar
                                                    </Button>
                                                </Form>
                                            </TabPane>
                                            <TabPane tabId="plainTabs3">
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
                                                <div className="mb-4 d-flex justify-content-center photo-container">

                                                    {
                                                        user.image && (!completedCrop?.width || !completedCrop?.height) && 
                                                        <img src={`${apiUrl}/image/${user.image}`} alt="..." 
                                                            style={{
                                                                width: 120,
                                                                height: 120,
                                                                borderRadius:'50%',
                                                                boxShadow:'0 10px 25px 0 rgba(0,0,0,.3)'
                                                            }}
                                                        />
                                                    }
                                                    {
                                                        (completedCrop?.width || completedCrop?.height) ?
                                                        <canvas
                                                            ref={previewCanvasRef}
                                                            style={{
                                                                width: 120,
                                                                height: 120,
                                                                borderRadius:'50%',
                                                                boxShadow:'0 10px 25px 0 rgba(0,0,0,.3)'
                                                            }}
                                                        />:""
                                                    } 
                                                    
                                                </div>
                                                <div className="mb-2">
                                                    <input ref={inputFileRef} className="form-control" type="file" accept="image/*" onChange={onSelectFile} />
                                                </div>
                                                <ReactCrop
                                                    src={upImg}
                                                    onImageLoaded={onLoad}
                                                    crop={crop}
                                                    onChange={c => setCrop(c)}
                                                    onComplete={c => setCompletedCrop(c)}
                                                />
                                               
                                                <Button color="primary" className="btn-round" disabled={!completedCrop?.width || !completedCrop?.height}
                                                    onClick={() => UploadProfile(previewCanvasRef.current, completedCrop)}
                                                 >
                                                    {uploading && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                                    Actualizar
                                                </Button>

                                                <Button color="secondary"  className="btn-round" outline disabled={!completedCrop?.width || !completedCrop?.height}
                                                    onClick={() =>cleanCrop()}
                                                 >
                                                    Cancelar
                                                </Button>
                                            </TabPane>
                                        </TabContent>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                        </Container>
                        <Modal toggle={() => {setModalVisible(false); setModalMsg('')}} isOpen={modalVisible}>
                            <div className="modal-header">
                                <h5 className="modal-title">Perfil</h5>
                                <button aria-label="Close" className="close" type="button" onClick={() =>  {setModalVisible(false); setModalMsg('')}}>
                                    <span aria-hidden={true}>×</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>{modalMsg}</p>
                            </div>
                            <div className="modal-footer">
                                <Button className="btn-round" outline color="secondary" type="button" onClick={() =>  {setModalVisible(false); setModalMsg('')}}>
                                    Cerrar
                                </Button>
                            </div>
                        </Modal>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProfilePage;