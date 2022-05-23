/* eslint-disable */
import React, { useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { matterActions, classesActions, agencyActions, teacherActions, careerActions, groupActions } from '../../actions';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Col, Row, Button, Form, FormGroup, Alert, Spinner, Modal, Label, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { history } from '../../helpers';
import Datetime from 'react-datetime';
import { Icon } from '@iconify/react';
import deleteBin6Fill from '@iconify-icons/ri/delete-bin-6-fill';   
import DataTable from 'react-data-table-component';
import { useForm  } from "react-hook-form";
import moment from 'moment';

function TeacherMatterPage() {

  	useEffect(() => {
		document.body.classList.add("landing-page");
		document.body.classList.add("sidebar-collapse");
		document.documentElement.classList.remove("nav-open");
		return function cleanup() {
			document.body.classList.remove("landing-page");
			document.body.classList.remove("sidebar-collapse");
		};
    });

    const dispatch = useDispatch();

    //Alertas
    const alert = useSelector(state => state.alert);
    //Mostrar alertas
    const [visible, setVisible] = useState(true);
    const onDismiss = () => setVisible(false);
    
    useEffect(() => {
        if(alert.message){
            setVisible(true); 
            setModalQuestion(false);
            window.setTimeout(()=>{setVisible(false)},5000);   
        }
    },[alert]);

    //Consultar materias
    useEffect(() => {
        dispatch(matterActions.getMatterAll());
    },[]);
    
    //Obtener todas las materias
    const dataMatters = useSelector(state => state.matters.matter);
    const loadingMatters = useSelector(state => state.matters.searching);

    const [matters, setMatters] = useState([]);

	//Verificar data de la consulta de materias y asignar
	useEffect(() => {
		if(dataMatters){
            setMatters(dataMatters);
		}
    },[dataMatters]);

    //obtener sedes para select
    const getting = useSelector(state => state.agencies.getting);
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

    //obtener carreras para select
	const gettingCareers = useSelector(state => state.careers.getting);
	const careers = useSelector(state => state.careers);
	useEffect(() => {
		dispatch(careerActions.listCareers());
	},[]);

	const [listCareers, setListCareers] = useState(null);

	useEffect(() => {
		if(careers.obtained){
			//sin tronco comun
			let select = careers.list.filter(item => item.trunk == false);
			setListCareers(select);
		}
	},[careers.obtained]);

    //Modal genérico y mensaje
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMsg, setModalMsg] = useState('');

    //Form Data
    const { handleSubmit, register, errors, reset, setValue } = useForm();
    const [modalQuestion, setModalQuestion] = useState(false);
    const [dataSave, setDataSave] = useState(null);
    const statusSave = useSelector(state => state.classes);
    const registering = useSelector(state => state.classes.registering);

    //Construir data de clase
    const onCreateMatter = (data, e) => {

        //Buscar materia para obtener info
        let matterSelected = matters.find(item => {return item.id === data.matter});

        let result = {
            matter: matterSelected.id,
            name: matterSelected.name,
            turn:  data.turn,
            user: selectedTeacher._id,
            group: selectedGroup._id
        }

        setDataSave(result);
        setModalQuestion(true);
        
    };

    //Guardar clase de profesor
    const onSave = () => {
        if(!registering){
            dispatch(classesActions.createClasses( dataSave ));
        }       
    }

    //Verificar si guardo y limpiar form
    useEffect(() => {
        if(statusSave.register){ 
            reset({
                matter:'',
                turn:'',
                user:'',
                group:''
            });
            handleSubmitFilter(onFilterData)();
        }
    },[statusSave.register]);

    //Datatable
    const dataClasses = useSelector(state => state.classes.data);
    const loadingPage = useSelector(state => state.classes.loading);

	//Verificar data de redux
	useEffect(() => {
		if(dataClasses && dataClasses.results){
			setData(dataClasses.results);
        }
        if(dataClasses && dataClasses.metadata && dataClasses.metadata[0]){
			setRowCount(dataClasses.metadata[0].total);
		}
	},[dataClasses]);

	// Inicializar tabla sin data
	const [data, setData] = useState([])
	const [rowCount, setRowCount] = useState(0)

	//Columnas Data table
	const columns = [
		{
			name: 'Email',
			selector: 'user.email',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Nombres',
			selector: 'user.firstName',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Apellidos',
			selector: 'user.lastName',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Turno',
			selector: 'turn',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Grupo',
			selector: 'group.groupName',
			sortable: true,
			wrap:true,
            cell : (row)=>{
				return row.group ? row.group.groupName: ''
			},
		},
		{
			name: 'Materia',
			selector: 'matter.name',
			sortable: true,
			cell : (row)=>{
				return row.matter ? row.matter.name: ''
			},
			wrap:true,
		},
		{
			name: 'Fecha de registro',
			selector: 'createdDate',
			sortable: true,
			cell : (row)=>{
				return moment(row.createdDate).local().format("YYYY-MM-DD")
			},
		},
		{
			name: '',
			button: true,
            cell: row => {
                return(<>
                    <Button className="btn-link" title="Eliminar" color="primary" size="sm" onClick={e => {
						e.preventDefault(); 
						setDataRow(row);
						setModalVisible(true)
					}}>
                        <Icon icon={deleteBin6Fill} color="#FF3636" width="19" height="19"/>
                    </Button>
                </>)
            },
		},
	];

	const [perPage] = useState(10);
	const [perPageSelect, setPerPageSelect] = useState(0);
	const [direction, setDirection] = useState({});

	const [filters, setFilters] = useState('');

	//data inicial
	const getDataTable = (page) => {
		dispatch(classesActions.dataTable(page, perPageSelect == 0 ? perPage : perPageSelect, direction, {}));
	}
	
	//Paginar
	const handlePageChange = async (page) => {
		dispatch(classesActions.dataTable(page, perPageSelect == 0 ? perPage : perPageSelect, direction, filters ? filters: {}));
	};
	
	//Ordenar
	const handleSort = (column, sortDirection) => {
		let sort = {"id": column.selector, "desc": (sortDirection == "asc" ? false : true) }
		setDirection(sort);
		dispatch(classesActions.dataTable(1, perPageSelect == 0 ? perPage : perPageSelect, sort, filters ? filters: {}));
	};

	//Cambiar cantidad de filas
	const handlePerRowsChange = async (newPerPage, page) => {
		setPerPageSelect(newPerPage);
		dispatch(classesActions.dataTable(page, newPerPage, direction, filters ? filters: {}));
	};

	//Consultar al entrar
	useEffect(() => {
		getDataTable(1);
	}, []);

	//Opciones de paginacion
	const paginationOptions = { rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' };

	//Loader de la tabla
	const CustomLoader = () => (<><Spinner  color="primary" style={{ width: '1.5rem', height: '1.5rem' }} /></>);

	const handleChangeRegisterDate = (date) => {
		setRegisterDate(date);
	}

	const [registerDate, setRegisterDate] = useState('');

	const clearFilters = () =>{
		setRegisterDate(''); 
        resetFilter();
	}

    //Form Data Filter
	const { handleSubmit:handleSubmitFilter, register: registerFilter , reset:resetFilter } = useForm();
    
    //Abrir/Cerrar filtros
	const [isOpen, setIsOpen] = useState(false);
	const toggle = () => setIsOpen(!isOpen);

	//Modal warning y mensaje
	const [modalWarning, setModalWarning] = useState(false);

    //Consultar por filtros
	const onFilterData = (data, e) => {
		var validDate =  moment(data.registerDate).isValid();

		if(data.registerDate != "" && !validDate){
			setModalWarning(true);
			setModalMsg('Ingrese una fecha válida');
			return;
		}
		setFilters(data);
		dispatch(classesActions.dataTable(1, perPageSelect == 0 ? perPage : perPageSelect, direction, data))
    }

    const deleting = useSelector(state => state.classes.deleting);
	const deleteSuccess = useSelector(state => state.classes.deleted);
	const [dataRow, setDataRow] = useState(null);
	useEffect(() => {
		//si se elimino correctamente cerrar modal y consultar informacion nuevamente
        if(deleteSuccess){
			setModalVisible(false);
			setDataRow(null);
			handleSubmitFilter(onFilterData)();
        }
		
    },[deleteSuccess]);

	//Eliminar grupo de base de datos
	const removeClass = () =>{
		dispatch(classesActions.deleteClasses( dataRow._id ));
	}

    //====================================//

    /**
     * Docentes
     */

    //Form busqueda de Docentes
    const { handleSubmit: handleSubmitSearch, register: registerSearch, reset: resetSearch } = useForm();

    //Modal Docentes
    const [modalTeacherVisible, setModalTeacherVisible] = useState(false);

    //Abrir modal de Docentes
    const openModalList = () => {
        setModalTeacherVisible(true)
    } 

    const dataTeachers = useSelector(state => state.teachers.data);
    const loadingPageTeacher = useSelector(state => state.teachers.loading);

	//Verificar data de redux
	useEffect(() => {
		if(dataTeachers && dataTeachers.results){
			setDataTeacher(dataTeachers.results);
            dispatch(teacherActions.clearData());
        }
        if(dataTeachers && dataTeachers.metadata && dataTeachers.metadata[0]){
			setRowCountTeacher(dataTeachers.metadata[0].total);
		}
    },[dataTeachers]);

	// Inicializar tabla sin data
	const [dataTeacher, setDataTeacher] = useState([])
	const [rowCountTeacher, setRowCountTeacher] = useState(0);

    //Columnas Data table
	const columnsTeacher = [
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
        {
			name: '',
            button: true,
            width: '110px',
			cell: row => 
            <div className="d-flex">
                <Button className="btn-link" color="success" size="sm" onClick={e => {   e.preventDefault(); onSelectTeacher(row);}}>
                    <i className="fa fa-plus-circle" aria-hidden="true"></i>
                </Button>
            </div>,
		},
    ];
    
	const [perPageSelectTeacher, setPerPageSelectTeacher] = useState(0);
	const [directionTeacher, setDirectionTeacher] = useState({});

    const [filtersTeacher, setFiltersTeacher] = useState('');

	//Paginar
	const handlePageChangeTeacher = async (page) => {
		dispatch(teacherActions.dataTable(page, perPageSelectTeacher == 0 ? perPage : perPageSelectTeacher, directionTeacher, filtersTeacher ? filtersTeacher: {}));
	};
	
	//Ordenar
	const handleSortTeacher = (column, sortDirection) => {
		let sort = {"id": column.selector, "desc": (sortDirection == "asc" ? false : true) }
		setDirectionTeacher(sort);
		dispatch(teacherActions.dataTable(1, perPageSelectTeacher == 0 ? perPage : perPageSelectTeacher, sort, filtersTeacher ? filtersTeacher: {}));
	};

	//Cambiar cantidad de filas
	const handlePerRowsChangeTeacher = async (newPerPage, page) => {
		setPerPageSelectTeacher(newPerPage);
		dispatch(teacherActions.dataTable(page, newPerPage, directionTeacher, filtersTeacher ? filtersTeacher: {}));
	};

	const clearFiltersTeacher = () =>{
        resetSearch({document:'', fistName:'', lastName:'',  email:''})
    }

    //Consultar por filtros
	const onFilterDataTeacher = (data, e) => {
		setFiltersTeacher(data);
        dispatch(teacherActions.dataTable(1, perPageSelectTeacher == 0 ? perPage : perPageSelectTeacher, directionTeacher, data));
    }

    //Datos del estudiante seleccionado
    const [selectedTeacher, setSelectedTeacher] = useState('');

    //Seleccionar estudiante de la lista
    const onSelectTeacher = (row) => {
        //Limpiar filtros
        //Limpiar tabla de busqueda y cerrar modal
        setSelectedTeacher(row);
        //Setear nombres en el input
        setValue("user", `${row.firstName} ${row.lastName}`, {
            shouldValidate: true,
            shouldDirty: true
        }) 
        clearFiltersTeacher();
        setDataTeacher([]);
        setModalTeacherVisible(false);
    }

    //====================================//

    /**
     * Grupos
     */

    //Form busqueda de Grupos
    const { handleSubmit: handleSubmitSearchGroup, register: registerGroup, reset: resetSearchGroup } = useForm();

    //Modal Grupos
    const [modalGroupVisible, setModalGroupVisible] = useState(false);

    //Abrir modal de Grupos
    const openModalListGroup = () => {
        setModalGroupVisible(true)
    } 

    const dataGroups = useSelector(state => state.group.data);
    const loadingPageGroup = useSelector(state => state.group.loading);

	//Verificar data de redux
	useEffect(() => {
		if(dataGroups && dataGroups.results){
			setDataGroup(dataGroups.results);
            dispatch(groupActions.clearData());
        }
        if(dataGroups && dataGroups.metadata && dataGroups.metadata[0]){
			setRowCountGroup(dataGroups.metadata[0].total);
		}
    },[dataGroups]);

	// Inicializar tabla sin data
	const [dataGroup, setDataGroup] = useState([])
	const [rowCountGroup, setRowCountGroup] = useState(0);

    //Columnas Data table
	const columnsGroup = [
		{
			name: 'Id',
			selector: 'idNumber',
			sortable: true,
			wrap:true,
		},
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
			name: 'Turno',
			selector: 'turn',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Grado',
			selector: 'type',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Carrera',
			selector: 'career.name',
			sortable: true,
			cell : (row)=>{
				return row.career ? row.career.name: ''
			},
			wrap:true,
		},
		{
			name: 'Grupo',
			selector: 'groupName',
			sortable: true,
			wrap:true,
		},	
		{
			name: 'Fecha de registro',
			selector: 'createdDate',
			sortable: true,
			cell : (row)=>{
				return moment(row.createdDate).local().format("YYYY-MM-DD")
			},
		},
        {
			name: '',
            button: true,
            width: '110px',
			cell: row => 
            <div className="d-flex">
                <Button className="btn-link" color="success" size="sm" onClick={e => {   e.preventDefault(); onSelectGroup(row);}}>
                    <i className="fa fa-plus-circle" aria-hidden="true"></i>
                </Button>
            </div>,
		},
    ];
    
	const [perPageSelectGroup, setPerPageSelectGroup] = useState(0);
	const [directionGroup, setDirectionGroup] = useState({});

    const [filtersGroup, setFiltersGroup] = useState('');

	//Paginar
	const handlePageChangeGroup = async (page) => {
		dispatch(groupActions.dataTable(page, perPageSelectGroup == 0 ? perPage : perPageSelectGroup, directionGroup, filtersGroup ? filtersGroup: {}));
	};
	
	//Ordenar
	const handleSortGroup = (column, sortDirection) => {
		let sort = {"id": column.selector, "desc": (sortDirection == "asc" ? false : true) }
		setDirectionGroup(sort);
		dispatch(groupActions.dataTable(1, perPageSelectGroup == 0 ? perPage : perPageSelectGroup, sort, filtersGroup ? filtersGroup: {}));
	};

	//Cambiar cantidad de filas
	const handlePerRowsChangeGroup = async (newPerPage, page) => {
		setPerPageSelectGroup(newPerPage);
		dispatch(groupActions.dataTable(page, newPerPage, directionGroup, filtersGroup ? filtersGroup: {}));
	};

	const clearFiltersGroup = () =>{
        resetSearchGroup()
    }

    //Consultar por filtros
	const onFilterDataGroup = (data, e) => {
		setFiltersGroup(data);
        dispatch(groupActions.dataTable(1, perPageSelectGroup == 0 ? perPage : perPageSelectGroup, directionGroup, data));
    }

    //Datos del Grupo seleccionado
    const [selectedGroup, setSelectedGroup] = useState('');

    //Seleccionar Grupo de la lista
    const onSelectGroup = (row) => {
        //Limpiar filtros
        //Limpiar tabla de busqueda y cerrar modal
        setSelectedGroup(row);
        //Setear nombres en el input
        setValue("group", row.groupName, {
            shouldValidate: true,
            shouldDirty: true
        }) 
        clearFiltersGroup();
        setDataGroup([]);
        setModalGroupVisible(false);
    }

    //====================================//

    return (
        <>
            <div className="d-flex" id="wrapper">
				<SideBar/>
				<div id="page-content-wrapper">
					<AdminNavbar/>
                    <div className="flex-column flex-md-row p-3">
                        <div className="d-flex justify-content-between" style={{padding:"4px 16px 4px 24px"}}>
							<div className="align-self-center">
								<h3 style={{ marginBottom: '0' }}>Materias docentes</h3>
							</div>
						</div>
                        {/* Filtros */}
						 <div className="filter">
							<div className="d-flex justify-content-between">
								<a href="#" onClick={e => {e.preventDefault(); toggle() }}>
									<i className="fa fa-search" aria-hidden="true"></i> Búsqueda avanzada
								</a>
								{isOpen && <a href="#" onClick={e => { e.preventDefault();  clearFilters(); }}>
									<i className="fa fa-times" aria-hidden="true"></i> Borrar filtros
								</a>
								}	
							</div>
							{isOpen && <>
								<Form onSubmit={handleSubmitFilter(onFilterData)} className="form-inline" style={{marginTop:15}}>
                                    <FormGroup className="mr-3 mb-2">
										<input
											className="form-control"
											name="email"
											placeholder="Email"
											type="text"
											ref={registerFilter}
										></input>
									</FormGroup>
                                    <FormGroup className="mr-3 mb-2">
										<input
											className="form-control"
											name="firstName"
											placeholder="Nombres"
											type="text"
											ref={registerFilter}
										></input>
									</FormGroup>
                                    <FormGroup className="mr-3 mb-2">
										<input
											className="form-control"
											name="lastName"
											placeholder="Apellidos"
											type="text"
											ref={registerFilter}
										></input>
									</FormGroup>
									<FormGroup className="mr-3">
										<select className='form-control' name="turn" ref={registerFilter}>
											<option key="0" name="" value="">Seleccione turno</option>
											<option key="1" name="Matutino" value="Matutino">Matutino</option>
											<option key="2" name="Vespertino" value="Vespertino">Vespertino</option>
											<option key="3" name="Sabatino" value="Sabatino">Sabatino</option>
										</select>
									</FormGroup>
                                    <FormGroup className="mr-3">
										<input
											className="form-control"
											name="matter"
											placeholder="Materia"
											type="text"
											ref={registerFilter}
										></input>
									</FormGroup>
									<FormGroup className="mr-3">
										<Datetime timeFormat={false} dateFormat={'YYYY-MM-DD'} closeOnSelect onChange={handleChangeRegisterDate} value={registerDate}
											renderInput={(props) => {
												return <input {...props} className="form-control dateFilter" readOnly name="registerDate" 
												placeholder="Fecha de registro"  ref={registerFilter} value={(registerDate) ? props.value : ''} />
											}}
										/>
									</FormGroup>
									<Button className="btn-round" color="primary" type="submit" disabled={loadingPage}>
										{loadingPage && <span className="spinner-border spinner-border-sm mr-1"></span>} Buscar
									</Button>
								</Form>
							</>
							}
						</div>
						{/* Filtros */}
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
                        <Row>
                            <Col md={8} sm={12}>
                                <DataTable
                                    className="dataTables_wrapper"
                                    responsive
                                    highlightOnHover
                                    striped
                                    sortIcon={ <i className="fa fa-arrow-down ml-2" aria-hidden="true"></i> }
                                    title="Clases"
                                    columns={columns}
                                    data={data}
                                    progressPending={loadingPage}
                                    pagination
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
                            <Col md={4} sm={12}>
                                <Form onSubmit={handleSubmit(onCreateMatter)} className="form" style={{border:'1px solid #dee2e6', padding: '10px 20px', borderRadius:'5px',
                                    marginBottom:'5px', marginTop:'12px'}}>
                                    <div>
                                        {loadingMatters && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                        <Row form>
                                            <Col>
                                                <FormGroup>
                                                    <Label for="matter">Materia</Label>
                                                    <select className={'form-control' + (errors.matter ? ' is-invalid' : '')} name="matter"
                                                        ref={register({ 
                                                                required: "La materia es requerida" 
                                                            })}>
                                                            <option key="0" name="" value="">Seleccione materia</option>
                                                            {matters && matters.map(list => 
                                                                <option
                                                                    key={list.id}
                                                                    name={list.id}
                                                                    value={list.id}>
                                                                    {list.name}
                                                                </option>
                                                            )}
                                                    </select>
                                                    {errors.matter && <div className="invalid-feedback d-block">{errors.matter.message}</div>}
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="user">Docente</Label>
                                                    <InputGroup>
                                                        <input
                                                            autoComplete="off"
                                                            className={'form-control inputSearch' + (errors.user ? ' is-invalid' : '')}
                                                            name="user"
                                                            ref={register({
                                                                required: "El docente es requerido",
                                                            })}
                                                            readOnly
                                                        />
                                                        <InputGroupAddon addonType="append" style={{cursor:'pointer'}} onClick={openModalList}>
                                                        <InputGroupText className="input-group-custom">
                                                            <i className="fa fa-search" aria-hidden="true"></i>
                                                        </InputGroupText>
                                                        </InputGroupAddon>
                                                    </InputGroup>
                                                    {errors.user && <div className="invalid-feedback">{errors.user.message}</div>}
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="group">Grupo</Label>
                                                    <InputGroup>
                                                        <input
                                                            autoComplete="off"
                                                            className={'form-control inputSearch' + (errors.group ? ' is-invalid' : '')}
                                                            name="group"
                                                            ref={register({
                                                                required: "El grupo es requerido",
                                                            })}
                                                            readOnly
                                                        />
                                                        <InputGroupAddon addonType="append" style={{cursor:'pointer'}} onClick={openModalListGroup}>
                                                        <InputGroupText className="input-group-custom">
                                                            <i className="fa fa-search" aria-hidden="true"></i>
                                                        </InputGroupText>
                                                        </InputGroupAddon>
                                                    </InputGroup>
                                                    {errors.group && <div className="invalid-feedback">{errors.group.message}</div>}
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <FormGroup className="mb-2 mr-sm-2 mb-sm-2">
                                            <div className="d-flex justify-content-between">
                                                <Button color="primary" className="btn-round" disabled={registering}>
                                                    {registering && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                                    Guardar
                                                </Button>
                                                <Button className="btn-round" outline onClick={e =>{e.preventDefault(); history.goBack();} }>Cancelar</Button>
                                            </div>
                                        </FormGroup>
                                    </div>
                                </Form>
                            </Col>
                        </Row>
                        {/* Modal question */}
                        <Modal toggle={() => {setModalVisible(false); setDataRow(null)}} isOpen={modalVisible}>
                            <div className="modal-header">
                            <button
                                aria-label="Close"
                                className="close"
                                type="button"
                                onClick={() =>  {setModalVisible(false); setDataRow(null)}}
                            >
                                <span aria-hidden={true}>×</span>
                            </button>
                            </div>
                            <div className="modal-body">
                                ¿Confirmar eliminación?
                            </div>
                            <div className="modal-footer">
                                <Button color="primary" className="btn-round" disabled={deleting} onClick={()=>removeClass()}>
                                    {deleting && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                    Confirmar
                                </Button>
                                <Button color="secondary" className="btn-round" outline type="button" onClick={() => {setModalVisible(false);setDataRow(null);}} disabled={deleting}>
                                    Cerrar
                                </Button>
                            </div>
                        </Modal>
          
                        <Modal toggle={() => {setModalQuestion(false);}} isOpen={modalQuestion} backdrop="static">
                            <div className="modal-header">
                                <h5 className="modal-title">Materias</h5>
                                <button aria-label="Close" className="close" type="button" disabled={registering} onClick={() =>  {setModalQuestion(false);setDataSave(null);}}>
                                    <span aria-hidden={true}>×</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>¿Seguro que desea guardar la información proporcionada?</p>
                            </div>
                            <div className="modal-footer">
                                <Button color="primary" className="btn-round" disabled={registering} onClick={onSave}>
                                    {registering && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                    Confirmar
                                </Button>
                                <Button color="secondary" className="btn-round" outline type="button" onClick={() => {setModalQuestion(false);setDataSave(null);}} disabled={registering}>
                                    Cerrar
                                </Button>
                            </div>
                        </Modal>

                        {/* Modal profesores */}
                        <Modal toggle={() => {setModalTeacherVisible(false)}} isOpen={modalTeacherVisible} className="modal-xl" backdrop="static">
                            <div className="modal-header">
                                <h5 className="modal-title">Docentes</h5>
                                <button aria-label="Close" className="close" type="button" onClick={() =>  {setModalTeacherVisible(false)}}>
                                    <span aria-hidden={true}>×</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                {/* Filtros profesores */}
                                <div className="filter">
                                    <div className="d-flex justify-content-between">
                                        <a href="#">
                                            <i className="fa fa-search" aria-hidden="true"></i> Búsqueda avanzada
                                        </a>
                                        <a href="#" onClick={e => { e.preventDefault();  clearFiltersTeacher(); }}>
                                            <i className="fa fa-times" aria-hidden="true"></i> Borrar filtros
                                        </a>
                                      	
                                    </div>
                                    <>
                                        <Form onSubmit={handleSubmitSearch(onFilterDataTeacher)} className="form-inline" style={{marginTop:15}}>
                                            <FormGroup className="mr-3">
                                                {getting && <span className="spinner-border spinner-border-sm mr-1"></span>}
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
                                            <Button color="primary" className="btn-round" type="submit" disabled={loadingPageTeacher}>
                                                {loadingPageTeacher && <span className="spinner-border spinner-border-sm mr-1"></span>} Buscar
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
                                        title="Estudiantes"
                                        columns={columnsTeacher}
                                        data={dataTeacher}
                                        progressPending={loadingPageTeacher}
                                        pagination
                                        paginationServer
                                        paginationTotalRows={rowCountTeacher}
                                        onSort={handleSortTeacher}
                                        sortServer
                                        onChangeRowsPerPage={handlePerRowsChangeTeacher}
                                        onChangePage={handlePageChangeTeacher}
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
                                <Button color="secondary" className="btn-round" outline type="button" onClick={() =>  {setModalTeacherVisible(false)}}>
                                    Cerrar
                                </Button>
                            </div>
                        </Modal>

                        {/* Modal Grupos */}
                        <Modal toggle={() => {setModalGroupVisible(false)}} isOpen={modalGroupVisible} className="modal-xl" backdrop="static">
                            <div className="modal-header">
                                <h5 className="modal-title">Grupos</h5>
                                <button aria-label="Close" className="close" type="button" onClick={() =>  {setModalGroupVisible(false)}}>
                                    <span aria-hidden={true}>×</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                {/* Filtros profesores */}
                                <div className="filter">
                                    <div className="d-flex justify-content-between">
                                        <a href="#">
                                            <i className="fa fa-search" aria-hidden="true"></i> Búsqueda avanzada
                                        </a>
                                        <a href="#" onClick={e => { e.preventDefault();  clearFiltersGroup(); }}>
                                            <i className="fa fa-times" aria-hidden="true"></i> Borrar filtros
                                        </a>
                                      	
                                    </div>
                                    <>
                                        <Form onSubmit={handleSubmitSearchGroup(onFilterDataGroup)} className="form-inline" style={{marginTop:15}}>
                                            <FormGroup className="mr-3">
                                                {getting && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                                <select className='form-control' name="agency"
                                                    ref={registerGroup}>
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
                                                {gettingCareers && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                                <select className='form-control' name="career" ref={registerGroup}>
                                                        <option key="" name="" value="">Seleccione carrera</option>
                                                        {listCareers && listCareers.map(list => 
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
                                                <select className='form-control' name="turn" ref={registerGroup}>
                                                    <option key="0" name="" value="">Seleccione turno</option>
                                                    <option key="1" name="Matutino" value="1">Matutino</option>
                                                    <option key="2" name="Vespertino" value="2">Vespertino</option>
                                                    <option key="3" name="Sabatino" value="3">Sabatino</option>
                                                </select>
                                            </FormGroup>
                                            <FormGroup className="mr-3">
                                                <select className='form-control' name="type" ref={registerGroup}>
                                                    <option key="0" name="" value="">Seleccione grado</option>
                                                    <option key="2" name="2" value="2">Licenciatura</option>
                                                    <option key="3" name="3" value="3">Maestría</option>
                                                    <option key="4" name="4" value="4">Doctorado</option>
                                                    <option key="5" name="5" value="5">Nivelación</option>
                                                </select>
                                            </FormGroup>
                                            <Button color="primary" className="btn-round" type="submit" disabled={loadingPageGroup}>
                                                {loadingPageGroup && <span className="spinner-border spinner-border-sm mr-1"></span>} Buscar
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
                                        title="Estudiantes"
                                        columns={columnsGroup}
                                        data={dataGroup}
                                        progressPending={loadingPageGroup}
                                        pagination
                                        paginationServer
                                        paginationTotalRows={rowCountGroup}
                                        onSort={handleSortGroup}
                                        sortServer
                                        onChangeRowsPerPage={handlePerRowsChangeGroup}
                                        onChangePage={handlePageChangeGroup}
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
                                <Button color="secondary" className="btn-round" outline type="button" onClick={() =>  {setModalGroupVisible(false)}}>
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

export default TeacherMatterPage;