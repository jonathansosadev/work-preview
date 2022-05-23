/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { agencyActions, teacherActions, notificationActions } from '../../actions';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Col, Row, Button, Form, FormGroup, Label, Container, Alert, Modal, Spinner  } from 'reactstrap';
import { useForm  } from "react-hook-form";
import { history } from '../../helpers';
import RichTextEditor from 'react-rte';
import Datetime from 'react-datetime';
import moment from 'moment';
import DataTable from 'react-data-table-component';

function NotificationCreatePage() {

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

    //Modal genérico y mensaje
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMsg, setModalMsg] = useState('');

    //Registrar data
    const onCreateData = (data, e) => {

        if(selectedTeachers.length == 0){
            setModalVisible(true);
            setModalMsg('Seleccione al menos un docente para enviar la notificación');
            return;
        }

        let rows = selectedTeachers;

        let dataUsers = []
        var emailsArray = [];
        //Extraer solo ids de los docentes
        rows.map( row => {
            dataUsers.push({"_id":row._id});
            emailsArray.push(row.email);
        });

        if(!editorString){
            setValidate(true);
            return;
        }

        let hasText = !!editorString.replace(/(<\/?[^>]+(>|$)|&nbsp;|\s)/g, "").length;

        if(!hasText){
            setValidate(true);
            return;
        }

        var validDate = moment(data.notificationDate).isValid();
    
		if(data.notificationDate != "" && !validDate){
			setModalVisible(true);
			setModalMsg('Ingrese una fecha válida');
			return;
        }

        setValidate(false);
        data.description = editorString;
        data.users = dataUsers;
        data.emails = emailsArray.join(", ");
        console.log('data',data);
        dispatch(notificationActions.createNotification( data ));
    };

    //State de guardado
    const registering = useSelector(state => state.notification.registering);
    const notifications = useSelector(state => state.notification);

    //Actualizar estado de sede al cambio de información
    useEffect(() => {
        if(notifications.success){
            setEditorState(RichTextEditor.createEmptyValue())
            setEditorString(null);
            setSelectedTeachers([]);
            reset({title:'', notificationDate:''})
        }
    },[notifications.success]);

    //Configuración rich text
    const [editorState, setEditorState] = useState(RichTextEditor.createEmptyValue())
    const [editorString, setEditorString] = useState(null)
    const [validate, setValidate] = useState(false);

    const onChange = (content) => {
        
        setEditorState(content);
        if(content.toString('html').replace(/(<\/?[^>]+(>|$)|&nbsp;|\s)/g, "").length == 0){
            setValidate(true);
            setEditorString(null);
        }else{
            setValidate(false);
            setEditorString(content.toString('html'));
        }
       
    };
    
    const toolbarConfig = {
        // Optionally specify the groups to display (displayed in the order listed).
        display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS', 'BLOCK_TYPE_DROPDOWN'],
        INLINE_STYLE_BUTTONS: [
          {label: 'Bold', style: 'BOLD', className: 'custom-css-class'},
          {label: 'Italic', style: 'ITALIC'},
          {label: 'Underline', style: 'UNDERLINE'}
        ],
        BLOCK_TYPE_DROPDOWN: [
          {label: 'Normal', style: 'unstyled'},
          {label: 'Encabezado grande', style: 'header-one'},
          {label: 'Encabezado medio', style: 'header-two'},
          {label: 'Encabezado pequeño', style: 'header-three'}
        ],
        BLOCK_TYPE_BUTTONS: [
          {label: 'UL', style: 'unordered-list-item'},
          {label: 'OL', style: 'ordered-list-item'}
        ]
    };


    //Fechas válidas de notificacion
    var validDates = Datetime.moment();
    var valid = function( current ){
        return current.isAfter( validDates );
    };

    //Sedes
    const agencies = useSelector(state => state.agencies);
	useEffect(() => {
		dispatch(agencyActions.listAgencies());
	},[]);

	const [listAgencies, setListAgencies] = useState(null);

	useEffect(() => {
		if(agencies.obtained){
			setListAgencies(agencies.list);
		}
	},[agencies.obtained]);

    //Profesor
    //Form busqueda de estudiantes
    const { handleSubmit: handleSubmitSearch, register: registerSearch, reset: resetSearch } = useForm();

    const [modalTeacherVisible, setModalTeacherVisible] = useState(false);

    //Abrir modal de estudiantes
    const openModalList = () => {
        setModalTeacherVisible(true)
    } 

    const dataTeachers = useSelector(state => state.teachers.data);
    const loadingPage = useSelector(state => state.teachers.loading);

	//Verificar data de redux
	useEffect(() => {
		if(dataTeachers && dataTeachers.results){
			setData(dataTeachers.results);
            dispatch(teacherActions.clearData());
        }
        if(dataTeachers && dataTeachers.metadata && dataTeachers.metadata[0]){
			setRowCount(dataTeachers.metadata[0].total);
		}
    },[dataTeachers]);

	// Inicializar tabla sin data
	const [data, setData] = useState([])
	const [rowCount, setRowCount] = useState(0);

    //Columnas Data table
	const columns = [
		{
			name: 'Sede',
			selector: 'agency.name',
			sortable: true,
			cell : (row)=>{
				return row.agency ? row.agency.name: ''
			},
			wrap:true,
		},
		{
			name: 'Nombres',
			selector: 'firstName',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Apellidos',
			selector: 'lastName',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Email',
			selector: 'email',
			sortable: true,
			wrap:true,
		},
    ];

    const [perPage] = useState(10);
	const [perPageSelect, setPerPageSelect] = useState(0);
	const [direction, setDirection] = useState({});

    const [filters, setFilters] = useState('');

    //Paginar
    const handlePageChange = async (page) => {
        dispatch(teacherActions.dataTable(page, perPageSelect == 0 ? perPage : perPageSelect, direction, filters ? filters: {}));
    };

    //Ordenar
    const handleSort = (column, sortDirection) => {
        let sort = {"id": column.selector, "desc": (sortDirection == "asc" ? false : true) }
        setDirection(sort);
        dispatch(teacherActions.dataTable(1, perPageSelect == 0 ? perPage : perPageSelect, sort, filters ? filters: {}));
    };

    //Cambiar cantidad de filas
    const handlePerRowsChange = async (newPerPage, page) => {
        setPerPageSelect(newPerPage);
        dispatch(teacherActions.dataTable(page, newPerPage, direction, filters ? filters: {}));
    };

    //Opciones de paginacion
    const paginationOptions = { rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' };

    //Loader de la tabla
    const CustomLoader = () => (<><Spinner  color="primary" style={{ width: '1.5rem', height: '1.5rem' }} /></>);

    const clearFilters = () =>{
        resetSearch({document:'', fistName:'', lastName:'',  email:''})
    }

    //Abrir/Cerrar filtros
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);
    //Consultar por filtros
	const onFilterData = (data, e) => {
        //Solo docentes activos
        data.status = 1;
		setFilters(data);
        dispatch(teacherActions.dataTable(1, perPageSelect == 0 ? perPage : perPageSelect, direction, data));
    }

    //Seleccion de docentes
    const [selectedRows, setSelectedRows] = useState([]);
    const handleChange = (rows) => {
        setSelectedRows(rows.selectedRows);
    };
    
    // Limpiar selecciones de docentes
    const [toggledClearRows, setToggledClearRows] = useState(false);
    const handleClearRows = () => {
        setToggledClearRows(!toggledClearRows)
    }

    /**
     * Procesar seleccion de docentes
     * 
     * Anadir las filas seleccionadas y colocarlas en la tabla principal
     * No anadir repetidos
     */

    const [selectedTeachers, setSelectedTeachers] = useState([]);

    const handleSelectedRows = () =>{
        
        let rows = selectedRows;
        let preSelected = selectedTeachers;
        let combined = selectedTeachers;
        
        //verificar repetidos e ir anadiendo
        if(preSelected.length > 0){
            rows.map( row => {
                let search = preSelected.filter(item => item.id == row.id);
                if(search.length == 0){   
                    combined.unshift(row);
                }
            });
            setSelectedTeachers(combined);
        }else{
            // si no hay nada se agrega todo
            setSelectedTeachers(rows);
        }
        //Cerrar modal y limpiar
        setModalTeacherVisible(false);
        clearFiltersTeacher();
    }

    //Quitar docentes de lista
    const removeItem = (selection) => {

        let data = selectedTeachers;
        const index = data.indexOf(selection);
        if (index !== -1) {
            data.splice(index, 1);
            setSelectedTeachers([...data]);
        }

    }
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
    const clearFiltersTeacher = () =>{
		setResetPaginationToggle(!resetPaginationToggle);
        setSelectedRows([]);
        handleClearRows();
    }

    //Columnas Data table de docentes
	const columnsSelected = [
		{
			name: 'Sede',
			selector: 'agency.name',
			sortable: false,
			cell : (row)=>{
				return row.agency ? row.agency.name: ''
			},
			wrap:true,
		},
		{
			name: 'Nombres',
			selector: 'firstName',
			sortable: false,
			wrap:true,
		},
		{
			name: 'Apellidos',
			selector: 'lastName',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Email',
			selector: 'email',
			sortable: false,
			wrap:true,
		},
        {
			name: '',
            button: true,
            width: '110px',
			cell: row => 
            <div className="d-flex">
                <Button className="btn-link" color="danger" disabled={registering} size="sm" onClick={e => {   e.preventDefault(); removeItem(row);;}}>
                    <i className="fa fa-times-circle"></i>
                </Button>
            </div>,
		},
    ];

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
                                <h3>Agregar notificación</h3>
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
                                                    maxLength="78"
                                                    autoComplete="off"
                                                    className={'form-control' + (errors.title ? ' is-invalid' : '')}
                                                    name="title"
                                                    ref={register({
                                                        required: "El título es requerido",
                                                    })}
                                                />
                                                {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
                                            </FormGroup>
                                        </Col>
                                        <Col md={6}>
                                            <FormGroup>
                                                <Label for="notificationDate">Fecha de notificación</Label>
                                                <Datetime locale="Es-es" timeFormat={false}
                                                    closeOnSelect
                                                    isValidDate={ valid }
                                                    dateFormat={'YYYY-MM-DD'}
                                                    inputProps={{ 
                                                        name: 'notificationDate', 
                                                        ref:(register({
                                                            required: "La fecha de notificación es requerida",
                                                        })),
                                                        autoComplete:"off",
                                                        className: ('form-control' + (errors.notificationDate ? ' is-invalid' : '')),
                                                    }}
                                                />
                                                {errors.notificationDate && <div className="invalid-feedback d-block">{errors.notificationDate.message}</div>}
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <div className="d-flex justify-content-between mb-2">
                                        <a href="#" onClick={e => {e.preventDefault(); openModalList(); }}>
                                            <i className="fa fa-search" aria-hidden="true"></i> Buscar docente
                                        </a>
                                    </div>
                                    <Row className="mb-5">
                                        <Col>
                                        <DataTable
                                            className="dataTables_wrapper"
                                            responsive
                                            highlightOnHover
                                            striped
                                            sortIcon={ <i className="fa fa-arrow-down ml-2" aria-hidden="true"></i> }
                                            title="Docentes seleccionados"
                                            columns={columnsSelected}
                                            data={selectedTeachers}
                                            paginationTotalRows={rowCount}
                                            persistTableHead
                                            noDataComponent=""
                                            noHeader={true}
                                        />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={12}>
                                            <FormGroup>
                                                <Label for="description">Contenido</Label>
                                                 <RichTextEditor toolbarConfig={toolbarConfig} value={editorState} onChange={onChange}/>
                                                 {validate && <div className="invalid-feedback d-block">El contenido es requerido</div>}
                                            </FormGroup>
                                        </Col>  
                                    </Row>
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
                        <Modal toggle={() => {setModalTeacherVisible(false)}} isOpen={modalTeacherVisible} className="modal-xl" backdrop="static">
                            <div className="modal-header">
                                <h5 className="modal-title">Docentes</h5>
                                <button aria-label="Close" className="close" type="button" onClick={() =>  {setModalTeacherVisible(false)}}>
                                    <span aria-hidden={true}>×</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                {/* Filtros Estudiante */}
                                <div className="filter">
                                    <div className="d-flex justify-content-between">
                                        <a href="#" onClick={e => {e.preventDefault(); toggle() }}>
                                            <i className="fa fa-search" aria-hidden="true"></i> Búsqueda avanzada
                                        </a>
                                        <a href="#" onClick={e => { e.preventDefault();  clearFilters(); }}>
                                            <i className="fa fa-times" aria-hidden="true"></i> Borrar filtros
                                        </a>
                                      	
                                    </div>
                                    <>
                                        <Form onSubmit={handleSubmitSearch(onFilterData)} className="form-inline" style={{marginTop:15}}>
                                            <FormGroup className="mr-3">
                                                {/* {getting && <span className="spinner-border spinner-border-sm mr-1"></span>} */}
                                                <select className='form-control' name="agency"
                                                    ref={registerSearch}>
                                                        <option key="" name="" value="">Seleccione sede</option>
                                                        {listAgencies && listAgencies.map(list => 
                                                            <option
                                                                key={list.id}
                                                                name={list.id}
                                                                value={list.id}>
                                                                {`${list.name}`}
                                                            </option>
                                                        )}
                                                </select>
                                            </FormGroup>
                                            <FormGroup className="mr-3">
                                                <input
                                                    className="form-control"
                                                    name="registrationNumber"
                                                    placeholder="Matrícula"
                                                    type="text"
                                                    ref={registerSearch}
                                                ></input>
                                            </FormGroup>
                                            <FormGroup className="mr-3">
                                                <input
                                                    className="form-control"
                                                    name="firstName"
                                                    placeholder="Nombres"
                                                    type="text"
                                                    ref={registerSearch}
                                                ></input>
                                            </FormGroup>
                                            <FormGroup className="mr-3">
                                                <input
                                                    className="form-control"
                                                    name="lastName"
                                                    placeholder="Apellidos"
                                                    type="text"
                                                    ref={registerSearch}
                                                ></input>
                                            </FormGroup>
                                            <FormGroup className="mr-3">
                                                <input
                                                    className="form-control"
                                                    name="email"
                                                    placeholder="Email"
                                                    type="text"
                                                    ref={registerSearch}
                                                ></input>
                                            </FormGroup>
                                            <Button color="primary" className="btn-round" type="submit" disabled={loadingPage}>
                                                {loadingPage && <span className="spinner-border spinner-border-sm mr-1"></span>} Buscar
                                            </Button>
                                        </Form>
                                    </>
                                </div>
                                {/* Filtros */}
                                <Row>
                                    <Col>
                                    <DataTable
                                        className="dataTables_wrapper"
                                        responsive
                                        highlightOnHover
                                        striped
                                        sortIcon={ <i className="fa fa-arrow-down ml-2" aria-hidden="true"></i> }
                                        title="Docentes"
                                        columns={columns}
                                        data={data}
                                        progressPending={loadingPage}
                                        pagination
                                        selectableRows
                                        onSelectedRowsChange={handleChange}
                                        clearSelectedRows={toggledClearRows}
                                        paginationResetDefaultPage={resetPaginationToggle}
                                        paginationServer
                                        paginationTotalRows={rowCount}
                                        onSort={handleSort}
                                        sortServer
                                        onChangeRowsPerPage={handlePerRowsChange}
                                        onChangePage={handlePageChange}
                                        paginationComponentOptions={paginationOptions}
                                        persistTableHead
                                        progressComponent={<CustomLoader />}
                                        noDataComponent="No hay registros para mostrar"
                                        noHeader={true}
                                    />
                                    </Col>
                                </Row>
                            </div>
                            <div className="modal-footer">
                                <Button color="primary" className="btn-round" onClick={handleSelectedRows} disabled={selectedRows.length==0}>
                                    Agregar selección ({selectedRows.length})
                                </Button>
                                <Button color="secondary" className="btn-round" outline type="button" onClick={() =>  {setModalTeacherVisible(false)}}>
                                    Cerrar
                                </Button>
                            </div>
                        </Modal>
                        <Modal toggle={() => {setModalVisible(false); setModalMsg('')}} isOpen={modalVisible}>
                            <div className="modal-header">
                                <h5 className="modal-title">Notificaciones</h5>
                                <button aria-label="Close" className="close" color="primary" type="button" onClick={() =>  {setModalVisible(false); setModalMsg('')}}>
                                    <span aria-hidden={true}>×</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>{modalMsg}</p>
                            </div>
                            <div className="modal-footer">
                                <Button color="secondary" className="btn-round" outline type="button" onClick={() =>  {setModalVisible(false); setModalMsg('')}}>
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

export default NotificationCreatePage;