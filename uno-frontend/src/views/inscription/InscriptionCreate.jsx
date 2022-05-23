/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { matterActions, studentActions, inscriptionActions, groupActions  } from '../../actions';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Col, Row, Button, Form, FormGroup, Label, Container, Alert,  Modal, Spinner, InputGroup, InputGroupAddon, InputGroupText   } from 'reactstrap';
import { useForm  } from "react-hook-form";
import { history } from '../../helpers';
import Datetime from 'react-datetime';
import DataTable from 'react-data-table-component';
import { Icon } from '@iconify/react';
import checkFill from '@iconify-icons/ri/check-fill';
import closeFill from '@iconify-icons/ri/close-fill';
import moment from 'moment';

function InscriptionCreatePage() {
  
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
    const user = useSelector(state => state.authentication.user);
    //Alertas
    const alert = useSelector(state => state.alert);
    
    //Mostrar alertas
    const [visible, setVisible] = useState(true);
    const [timeoutID, setTimeoutID ] = useState(null);
    const onDismiss = () => {
		setVisible(false);

		//Limpiar timeout al cerrar la alerta
		if(timeoutID && typeof timeoutID == "number") {
			window.clearTimeout(timeoutID);
			setTimeoutID(null)
		}
	}
    
    useEffect(() => {
        if(alert.message){
            //scroll al inicio para visualizar errores
            window.scrollTo(0, 0);
            setVisible(true); 
			let timeout = window.setTimeout(()=>{setVisible(false)},5000);   
			setTimeoutID(timeout);
        }
    },[alert]);

    //Form Data
    const { handleSubmit, register, errors, reset, setValue } = useForm();
    //Form busqueda de estudiantes
    const { handleSubmit: handleSubmitSearch, register: registerSearch, reset: resetSearch } = useForm();
    //Form busqueda de materias
    const { handleSubmit: handleSubmitMatter, register: registerMatter, reset: resetMatter, formState: { isSubmitting } } = useForm();

    const [modalQuestion, setModalQuestion] = useState(false);
    const [dataSave, setDataSave] = useState(null);

    /**
     * Registrar inscripcion
     * 
     * Validar materias si la carrera lo exige
     */
    const onCreateData = (data, e) => {
   
        if(dataStudent.length == 0){
            setModalVisible(true);
            setModalMsg('Seleccione estudiante');
            return;
        }
        data.student = dataStudent[0];
        data.group = selectedGroup._id;
        let dataUser = {
			id: user.id,
			role:user.role,
        }
        
        data.user = dataUser;
        if(selectedQuarter>0){
            if(selectedMatters.length == 0){
                setModalVisible(true);
                setModalMsg('Seleccione las materias de la carrera');
                return;
            }
            data.matters = selectedMatters;
        }
        
        setDataSave(data);
        setModalQuestion(true);

    };

    const onSave = () => {
        if(!registering){
            dispatch(inscriptionActions.createInscription( dataSave ));
        }       
    }
    
    //Fechas válidas 
    var validDates = Datetime.moment().subtract(3, 'months');
    var validQuarter = Datetime.moment().add(3, 'months');
    var valid = function( current ){
        return current.isAfter( validDates ) && current.isBefore(validQuarter);
    };

    //State de guardado
    const registering = useSelector(state => state.inscription.registering);
    const registerSuccess = useSelector(state => state.inscription.register);
    const registerFailure = useSelector(state => state.inscription.error);

    //Limpiar todo si el registro es exitoso o cerrar modal si hay error
    useEffect(() => {
        if(registerSuccess){
            clearForm();
            dispatch(inscriptionActions.clearData());
        }
        if(registerFailure){
            setModalQuestion(false);
        }
    },[registerSuccess, registerFailure]);

    //Objetos a limpiar
    const clearForm = () =>{
        window.scrollTo(0, 0);
        reset({})
        setDataStudent([]);
        setSelectedMatters([]);
        setSelectedQuarter('');
        setShowMattersSelected(false);
        setMatterListSelect([]);
        setAllListSelect([]);
        setShowCareers(false);
        setShowQuarter(false);
        setModalQuestion(false);
    }

    /**
     * Materias y turnos
     */

    //Consultar materias
    useEffect(() => {
        dispatch(matterActions.getMatterAll());
    },[]);


    //Cantidad de cuatrimestres
    const [quarterQuantity] = useState(12);
    const items = []

    for (var i = 1; i <= quarterQuantity; i++) {
        items.push(<option key={i} name={i} value={i}>{i}</option>)
    }

    //Modal genérico y mensaje
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMsg, setModalMsg] = useState('');

    //Quitar materias de lista
    const removeItem = (selection) => {

        let data = selectedMatters;
        const index = data.indexOf(selection);
        if (index !== -1) {
            data.splice(index, 1);
            setSelectedMatters([...data]);
        }

    }

    /**
     * Obtener data de inscripciones, sedes, careeras y materias
     * Al seleccionar grado se setean las careeras
     * Al seleccionar cuatrimestre se setean las materias
     */

    //obtener sedes para select
    const getting = useSelector(state => state.inscription.getting);
    const inscription = useSelector(state => state.inscription);
    useEffect(() => {
        dispatch(inscriptionActions.getDataInscription());
    },[]);

    //Todos los datos necesarios
    const [listAgencies, setListAgencies] = useState(null);
    const [trunk, setTrunk] = useState([]);
    const [listCareers, setListCareers] = useState(null);
    const [listMatters, setListMatters] = useState(null);

    //Carreras filtradas por el grado
    const [filteredCarrers, setfilteredCarrers] = useState(null);
    //Materias filtradas por carrera o cuatrimestre
    const [selectedMatters, setSelectedMatters] = useState([]);

    useEffect(() => {
        if(inscription.obtained){
            setListAgencies(inscription.dataInscription.agencies);

            let careers = inscription.dataInscription.careers.length > 0 ? inscription.dataInscription.careers : []
            let select = careers.filter(item => item.trunk == false);
            let trunk = careers.filter(item => item.trunk == true);
            //Select de carreras
            setListCareers(select);
            //setear carrera trunk
            setTrunk(trunk.length>0?trunk[0]:[]);
            setListMatters(inscription.dataInscription.matters);
        }
    },[inscription.obtained]);
    

    const [showCareers, setShowCareers] = useState(false);
    //Al cambiar el grado llenar el select de carrera de acuerdo al tipo
    const handleChangeType = (e) =>  {
        let type = e.target.value;
        let careers = listCareers.filter(item => item.type == type);
        setfilteredCarrers(careers);
        if(type !== ''){
            setShowCareers(true);
        }else{
            setShowCareers(false);
        }

        setSelectedMatters([]);
        setShowQuarter(false);
    }

    const [selectedCareer, setSelectedCareer] = useState(null);
    const [showQuarter, setShowQuarter] = useState(false);
    //Al cambiar la carrera 
    const handleChangeCarrer = (e) =>  {
        let career = e.target.value;
        setSelectedCareer(career);

        if(career !== ''){
            let matters = listMatters.filter(item => item.career.id == career);
            if(matters.length > 0){
                setShowQuarter(true);
            }    
        }else{
            setShowQuarter(false);
        }
        //Resetear materias seleccionadas al cambio del select y materias disponibles
        setSelectedMatters([]);
        setSelectedQuarter('');
        setShowMattersSelected(false);
        setMatterListSelect([]);
        setAllListSelect([]);
    }

    const [selectedQuarter, setSelectedQuarter] = useState(null);
    //materias disponibles para seleccionar
    const [matterListSelect, setMatterListSelect] = useState([]);
    const [allListSelect, setAllListSelect] = useState([]);
    //mostrar seccion de materias
    const [showMattersSelected, setShowMattersSelected] = useState(false);
    //Al cambiar el cuatrimestre llenar seleccionar todas las materias de la carrera
    const handleChangeQuarter = (e) =>  {
        let quarter = e.target.value;
        setSelectedQuarter(quarter);
        let matters = listMatters.filter(item => item.quarter == quarter && item.career.id == selectedCareer );
        setSelectedMatters(matters);

        //Crear una lista de materias para seleccionar individualmente 
        if(quarter>=1){

            //Obtener id trunk
            let trunkCareer = trunk;
            //Consultar materias disponibles
            let pensum = listMatters.filter(item => (parseInt(item.quarter) <= parseInt(quarter)) && (item.career.id == selectedCareer || item.career.id == trunkCareer.id) );
            setMatterListSelect(pensum);
            setAllListSelect(pensum);
            setShowMattersSelected(true);
        }else{
            setShowMattersSelected(false);
            setSelectedMatters([]);
        }
    }

    /**
     * Estudiantes
     */

    //Modal estudiantes
    const [modalStudentVisible, setModalStudentVisible] = useState(false);

    //Abrir modal de estudiantes
    const openModalList = () => {
        setModalStudentVisible(true)
    } 

    const dataStudents = useSelector(state => state.students.data);
    const loadingPage = useSelector(state => state.students.loading);

	//Verificar data de redux
	useEffect(() => {
		if(dataStudents && dataStudents.results){
			setData(dataStudents.results);
            dispatch(studentActions.clearData());
        }
        if(dataStudents && dataStudents.metadata && dataStudents.metadata[0]){
			setRowCount(dataStudents.metadata[0].total);
		}
    },[dataStudents]);

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
			name: 'Matrícula',
			selector: 'registrationNumber',
			sortable: true,
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
			name: 'Verificado',
			selector: 'isVerified',
			sortable: true,
			cell : (row)=>{
				return (row.isVerified == 1 ? <Icon icon={checkFill} width="20" height="20" color='green'/>:<Icon icon={closeFill} width="20" height="20"  color='red'/>)
			},
        },
        {
			name: '',
            button: true,
            width: '110px',
			cell: row => 
            <div className="d-flex">
                <Button className="btn-link" color="success" size="sm" onClick={e => {   e.preventDefault(); onSelectStudent(row);}}>
                    <i className="fa fa-plus-circle" aria-hidden="true"></i>
                </Button>
            </div>,
		},
    ];

    //Columnas Data table estudiante
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
			name: 'Matrícula',
			selector: 'registrationNumber',
			sortable: true,
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
			name: 'Verificado',
			selector: 'isVerified',
			sortable: false,
			cell : (row)=>{
				return (row.isVerified == 1 ? <Icon icon={checkFill} width="20" height="20" color='green'/>:<Icon icon={closeFill} width="20" height="20"  color='red'/>)
			},
        },
        {
			name: '',
            button: true,
            width: '110px',
			cell: row => 
            <div className="d-flex">
                <Button className="btn-link" color="danger" disabled={registering} size="sm" onClick={e => {   e.preventDefault(); onDeleteStudent(row);}}>
                    <i className="fa fa-times-circle"></i>
                </Button>
            </div>,
		},
    ];
    
    const [perPage] = useState(10);
	const [perPageSelect, setPerPageSelect] = useState(0);
	const [direction, setDirection] = useState({});

    const [filters, setFilters] = useState('');

	//data inicial
	// const getDataTable = (page) => {
	// 	dispatch(studentActions.dataTable(page, perPageSelect == 0 ? perPage : perPageSelect, direction, {}));
	// }
	
	//Paginar
	const handlePageChange = async (page) => {
		dispatch(studentActions.dataTable(page, perPageSelect == 0 ? perPage : perPageSelect, direction, filters ? filters: {}));
	};
	
	//Ordenar
	const handleSort = (column, sortDirection) => {
		let sort = {"id": column.selector, "desc": (sortDirection == "asc" ? false : true) }
		setDirection(sort);
		dispatch(studentActions.dataTable(1, perPageSelect == 0 ? perPage : perPageSelect, sort, filters ? filters: {}));
	};

	//Cambiar cantidad de filas
	const handlePerRowsChange = async (newPerPage, page) => {
		setPerPageSelect(newPerPage);
		dispatch(studentActions.dataTable(page, newPerPage, direction, filters ? filters: {}));
	};

	//Consultar al entrar
	useEffect(() => {
		//getDataTable(1);
	}, []);

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
		setFilters(data);
        dispatch(studentActions.dataTable(1, perPageSelect == 0 ? perPage : perPageSelect, direction, data));
    }

    //Datos del estudiante seleccionado
    const [dataStudent, setDataStudent] = useState([]);

    //Seleccionar estudiante de la lista
    const onSelectStudent = (row) => {
        //asignar el estudiante a la tabla principal
        //Limpiar filtros
        //Limpiar tabla de busqueda y cerrar modal
        setDataStudent([row]);
        clearFilters();
        setData([]);
        setModalStudentVisible(false);
    }

    const onDeleteStudent = () => {
        clearForm();
    }

    /**
     * Manejo de materias
     */
	const columnsMatters = [
        {
			name: 'Carrera',
			selector: 'career.name',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Materia',
			selector: 'name',
            sortable: true,
            wrap:true,
		},
		{
			name: 'Cuatrimestre',
			selector: 'quarter',
            sortable: true,
            wrap:true,
		},
		{
			name: 'Código',
			selector: 'code',
			sortable: true,
            wrap:true,
        },
        {
			name: '',
            button: true,
            width: '110px',
			cell: row => 
            <div className="d-flex">
                <Button className="btn-link" color="danger" disabled={registering} size="sm" onClick={e => {   e.preventDefault(); removeItem(row);}}>
                    <i className="fa fa-times-circle"></i>
                </Button>
            </div>,
		},
    ];

    /**
     * Grid seleccion de materias 
     */
	const columnsMattersSelect = [
        {
			name: 'Carrera',
			selector: 'career.name',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Materia',
			selector: 'name',
            sortable: true,
            wrap:true,
		},
		{
			name: 'Cuatrimestre',
			selector: 'quarter',
            sortable: true,
            wrap:true,
		},
		{
			name: 'Código',
			selector: 'code',
			sortable: true,
            wrap:true,
		},
    ];

    /**
     * Modal de materias disponibles para seleccion
     */
    //Modal materias individualmente
    const [modalMatterVisible, setModalMatterVisible] = useState(false);
    const [pages] = useState([5, 10, 15, 20, 25, 30]);
    //Abrir modal de estudiantes
    const openModalMatterList = () => {
        setModalMatterVisible(true);
    } 

    //Consultar por filtros las materias disponibles
	const onFilterDataMatter = (data, e) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                handleClearRows();
                const filter = allListSelect.filter(item => 
                    (data.code !== "" ? item.code && item.code.toLowerCase().includes(data.code.toLowerCase()) : true)
                    &&
                    (data.matter !== "" ? item.name && item.name.toLowerCase().includes(data.matter.toLowerCase()) : true)
                    &&
                    (data.quarter !== "" ? item.quarter && item.quarter == data.quarter : true)
                );
                setMatterListSelect(filter);
                resolve();
            });
        });
    };

    //Limpiar modal de seleccion de materias disponibles
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
    const clearFiltersMatter = () =>{
		setResetPaginationToggle(!resetPaginationToggle);
		resetMatter({code:'',matter:'',quarter:'' });
        setMatterListSelect(allListSelect);
        handleClearRows();
        setSelectedRows([]);
    }

    //Seleccion de materias
    const [selectedRows, setSelectedRows] = useState([]);
    const handleChange = (rows) => {
        setSelectedRows(rows.selectedRows);
    };
    
    // Limpiar selecciones de materias
    const [toggledClearRows, setToggledClearRows] = useState(false);
    const handleClearRows = () => {
        setToggledClearRows(!toggledClearRows)
    }

    /**
     * Procesar seleccion de materias
     * 
     * Anadir las filas seleccionadas y colocarlas en la tabla principal
     * No se anadir repetidos
     */
    const handleSelectedRows = () =>{
       
        let rows = selectedRows;
        let preSelected = selectedMatters;

        let combined = selectedMatters;
        //verificar repetidos e ir anadiendo
        if(preSelected.length > 0){
            rows.map( row => {
                let search = preSelected.filter(item => item.id == row.id);
                if(search.length == 0){   
                    combined.unshift(row);
                }
            });
            setSelectedMatters(combined.sort(compare));
        }else{
            // si no hay nada se agrega todo
            setSelectedMatters(rows);
        }
        //Cerrar modal y limpiar
        setModalMatterVisible(false);
        clearFiltersMatter();
    }

    //Ordenar por cuatrimestre
    const compare = ( a, b ) => {
        if ( a.quarter < b.quarter ){
            return -1;
        }
        if ( a.quarter > b.quarter ){
            return 1;
        }
        return 0;
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
                    <div className="container-fluid">
                        <Container>
                        <Row>
                            <Col sm="12">
                                <h3>Inscripción</h3>
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
                                <Form onSubmit={handleSubmit(onCreateData)} className="form" >
                                    {/* Estudiante */}
                                    <div style={{border:'1px solid #dee2e6', padding: '10px 20px', borderRadius:'5px', marginBottom:'5px'}}>
                                    <div className="d-flex justify-content-between mb-2">
                                        <a href="#" onClick={e => {e.preventDefault(); openModalList(); }}>
                                            <i className="fa fa-search" aria-hidden="true"></i> Buscar estudiante
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
                                            title="Estudiantes"
                                            columns={columnsSelected}
                                            data={dataStudent}
                                            paginationTotalRows={rowCount}
                                            persistTableHead
                                            noDataComponent=""
                                            noHeader={true}
                                        />
                                        </Col>
                                    </Row>
                                    </div>
                                    {dataStudent.length > 0 && <>   
                                    <div style={{border:'1px solid #dee2e6', padding: '10px 20px', borderRadius:'5px', marginBottom:'5px'}}>
                                        <Row form>
                                        <Col md={4}>
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
                                        <Col md="4">
                                            <Label for="period">Inicio de periodo</Label>{' '}
                                             <FormGroup>
                                                <Datetime locale="Es-es" timeFormat={false} closeOnSelect
                                                    isValidDate={ valid }
                                                    dateFormat={'DD-MM-YYYY'}
                                                    inputProps={{ 
                                                        id:'period',
                                                        name: 'period', 
                                                        ref:register({
                                                            required: "Inicio de periodo es requerido",
                                                        }),
                                                        readOnly:true,
                                                        className: ('form-control dateFilter' + (errors.period ? ' is-invalid' : '')),
                                                    }}
                                                />
                                                {errors.period && <div className="invalid-feedback d-block">{errors.period.message}</div>}
                                                </FormGroup>
                                        </Col>
                                        </Row>
                                    </div>
                                    {/* Informacion Academica */}
                                    <div style={{border:'1px solid #dee2e6', padding: '10px 20px', borderRadius:'5px', marginBottom:'5px'}}>
                                        <Row form>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for="type">Grado</Label>
                                                    <select className={'form-control' + (errors.type ? ' is-invalid' : '')} name="type"
                                                    onChange={handleChangeType} disabled={registering}
                                                        ref={register({ 
                                                                required: "El grado es requerido" 
                                                            })}>
                                                            <option key="0" name="" value="">Seleccione grado</option>
                                                            <option key="2" name="2" value="2">Licenciatura</option>
                                                            <option key="3" name="3" value="3">Maestría</option>
                                                            <option key="4" name="4" value="4">Doctorado</option>
                                                            <option key="5" name="5" value="5">Nivelación</option>
                                                    </select>
                                                    {errors.type && <div className="invalid-feedback d-block">{errors.type.message}</div>}
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                            <FormGroup>
                                                {showCareers && <>
                                                    <Label for="career">Carrera</Label>{' '}
                                                    <select className={'form-control' + (errors.career ? ' is-invalid' : '')} name="career"
                                                        onChange={handleChangeCarrer}
                                                        disabled={registering}
                                                        ref={register({ 
                                                                required: "La carrera es requerida" 
                                                            })}>
                                                            <option key="" name="" value="">Seleccione carrera</option>
                                                            {filteredCarrers && filteredCarrers.map(list => 
                                                                <option
                                                                    key={list.id}
                                                                    name={list.id}
                                                                    value={list.id}>
                                                                    {list.name}
                                                                </option>
                                                            )}
                                                    </select>
                                                    {errors.career && <div className="invalid-feedback d-block">{errors.career.message}</div>}
                                                </>
                                                } 
                                            </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                {showQuarter && <>
                                                    <Label for="quarter">Cuatrimestre</Label>
                                                    <select className={'form-control' + (errors.quarter ? ' is-invalid' : '')} name="quarter"
                                                        onChange={handleChangeQuarter} value={selectedQuarter}
                                                        disabled={registering}
                                                        ref={register({ 
                                                                required: "El cuatrimestre es requerido" 
                                                            })}>
                                                            <option key="0" name="" value="">Seleccione cuatrimestre</option>
                                                            {items}
                                                    </select>
                                                    {errors.quarter && <div className="invalid-feedback d-block">{errors.quarter.message}</div>}
                                                    </>
                                                }
                                                </FormGroup>
                                            </Col>
                                        </Row> 
                                    </div>
                                    </>
                                    }
                                </Form>
                                {showMattersSelected && <>
                                    <div className="form" style={{border:'1px solid #dee2e6', padding: '10px 20px', borderRadius:'5px',
                                        marginBottom:'5px'}}>
                                        <Row form style={{marginTop:'12px'}}>
                                        {(selectedQuarter && selectedQuarter>=1) && <>
                                            <div className="d-flex justify-content-between mb-2">
                                                <a href="#" onClick={e => {e.preventDefault(); openModalMatterList(); }}>
                                                    <i className="fa fa-search" aria-hidden="true" disabled={registering}></i> Agregar materia(s)
                                                </a>
                                            </div> 
                                        </>}
                                       
                                        </Row>
                                        <Row>
                                            <Col>
                                                {/* Materias seleccionadas */}
                                                <DataTable
                                                    className="dataTables_wrapper"
                                                    responsive
                                                    highlightOnHover
                                                    striped
                                                    sortIcon={ <i className="fa fa-arrow-down ml-2" aria-hidden="true"></i> }
                                                    title="Materias seleccion"
                                                    columns={columnsMatters}
                                                    data={selectedMatters}
                                                    paginationComponentOptions={paginationOptions}
                                                    persistTableHead
                                                    pagination
                                                    progressComponent={<CustomLoader />}
                                                    noDataComponent=""
                                                    noHeader={true}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                </>
                                }
                                <div className="d-flex justify-content-between">
                                    <Button color="primary" className="btn-round" disabled={registering} onClick={handleSubmit(onCreateData)}>
                                        {registering && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                        Guardar
                                    </Button>
                                    <Button className="btn-round" outline onClick={e =>{e.preventDefault(); history.goBack();} }>Cancelar</Button>
                                </div>
                            </Col>
                        </Row>
                        </Container>
                        <Modal toggle={() => {setModalVisible(false); setModalMsg('')}} isOpen={modalVisible}>
                            <div className="modal-header">
                                <h5 className="modal-title">Inscripción</h5>
                                <button aria-label="Close" className="close" type="button" onClick={() =>  {setModalVisible(false); setModalMsg('')}}>
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
                        <Modal toggle={() => {setModalStudentVisible(false)}} isOpen={modalStudentVisible} className="modal-xl" backdrop="static">
                            <div className="modal-header">
                                <h5 className="modal-title">Estudiantes</h5>
                                <button aria-label="Close" className="close" type="button" onClick={() =>  {setModalStudentVisible(false)}}>
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
                                        title="Estudiantes"
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
                                </Row>
                            </div>
                            <div className="modal-footer">
                                <Button color="secondary" className="btn-round" outline type="button" onClick={() =>  {setModalStudentVisible(false)}}>
                                    Cerrar
                                </Button>
                            </div>
                        </Modal>
                        {/* Seleccion de materias */}
                        <Modal toggle={() => {setModalMatterVisible(false);clearFiltersMatter();}} isOpen={modalMatterVisible} className="modal-xl" backdrop="static">
                            <div className="modal-header">
                                <h5 className="modal-title">Materias</h5>
                                <button aria-label="Close" className="close" type="button" onClick={() =>  {setModalMatterVisible(false);clearFiltersMatter();}} disabled={isSubmitting}>
                                    <span aria-hidden={true}>×</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                {/* Filtros materias */}
                                <div className="filter">
                                    <div className="d-flex justify-content-between">
                                        <a href="#">
                                            <i className="fa fa-search" aria-hidden="true"></i> Búsqueda avanzada
                                        </a>
                                        <a href="#" onClick={e => { e.preventDefault();  clearFiltersMatter(); }}>
                                            <i className="fa fa-times" aria-hidden="true"></i> Borrar filtros
                                        </a>	
                                    </div>
                                    <>
                                        <Form onSubmit={handleSubmitMatter(onFilterDataMatter)} className="form-inline" style={{marginTop:5}}>
                                            <FormGroup className="mr-3">
                                                <input
                                                    className="form-control"
                                                    name="matter"
                                                    placeholder="Materia"
                                                    type="text"
                                                    ref={registerMatter}
                                                    disabled={isSubmitting}
                                                ></input>
                                            </FormGroup>
                                            <FormGroup className="mr-3">
                                                <input
                                                    className="form-control"
                                                    name="quarter"
                                                    placeholder="Cuatrimestre"
                                                    type="text"
                                                    ref={registerMatter}
                                                    disabled={isSubmitting}
                                                ></input>
                                            </FormGroup>
                                            <FormGroup className="mr-3">
                                                <input
                                                    className="form-control"
                                                    name="code"
                                                    placeholder="Código"
                                                    type="text"
                                                    ref={registerMatter}
                                                    disabled={isSubmitting}
                                                ></input>
                                            </FormGroup>
                                            <Button color="primary" className="btn-round" type="submit" disabled={isSubmitting }>
                                                {isSubmitting && <span className="spinner-border spinner-border-sm mr-1"></span>} Buscar
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
                                       title="Materias"
                                       progressPending={isSubmitting}
                                       paginationComponentOptions={paginationOptions}
                                       progressComponent={<CustomLoader />}
                                       noDataComponent="No hay registros para mostrar"
                                       noHeader={true}
                                       columns={columnsMattersSelect}
                                       data={matterListSelect}
                                       pagination
                                       selectableRows
                                       onSelectedRowsChange={handleChange}
                                       clearSelectedRows={toggledClearRows}
                                       paginationResetDefaultPage={resetPaginationToggle}
                                       persistTableHead
                                       paginationRowsPerPageOptions={pages}
                                       paginationPerPage={5}
                                    />
                                    </Col>
                                </Row>
                            </div>
                            <div className="modal-footer">
                                <Button color="primary" className="btn-round" onClick={handleSelectedRows} disabled={selectedRows.length==0}>
                                    Agregar selección ({selectedRows.length})
                                </Button>
                                <Button color="secondary" className="btn-round" outline type="button" onClick={() =>  {setModalMatterVisible(false);clearFiltersMatter();}} disabled={isSubmitting}>
                                    Cerrar
                                </Button>
                            </div>
                        </Modal>
                        {/* Modal warning */}
                        <Modal toggle={() => {setModalQuestion(false);}} isOpen={modalQuestion} backdrop="static">
                            <div className="modal-header">
                                <h5 className="modal-title">Inscripción</h5>
                                <button aria-label="Close" className="close" type="button" disabled={registering} onClick={() =>  {setModalScore(false);setDataSave(null);}}>
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
                                                {getting && <span className="spinner-border spinner-border-sm mr-1"></span>}
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

export default InscriptionCreatePage;