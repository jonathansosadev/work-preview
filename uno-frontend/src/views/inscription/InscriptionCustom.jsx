/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { matterActions, studentActions, inscriptionActions } from '../../actions';
import moment from 'moment';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Col, Row, Button, Form, FormGroup, Label, Container, Alert,  Modal, Spinner  } from 'reactstrap';
import { useForm, Controller } from "react-hook-form";
import NumberFormat from 'react-number-format';
import { history } from '../../helpers';
import Datetime from 'react-datetime';
import DataTable from 'react-data-table-component';
import { Icon } from '@iconify/react';
import checkFill from '@iconify-icons/ri/check-fill';
import closeFill from '@iconify-icons/ri/close-fill';
import StepWizard from 'react-step-wizard';
import draftFill from '@iconify-icons/ri/draft-fill';
import '../../assets/css/wizard.css';

function InscriptionCustomPage() {
  
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

    const [modalQuestion, setModalQuestion] = useState(false);
    
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
    const { handleSubmit, register, errors, reset } = useForm();
    //Form busqueda de estudiantes
    const { handleSubmit: handleSubmitSearch, register: registerSearch, reset: resetSearch } = useForm();
    //Form busqueda de materias
    const { handleSubmit: handleSubmitMatter, register: registerMatter, reset: resetMatter, formState: { isSubmitting } } = useForm();
    //Form Calificaciones
	const { handleSubmit: handleSubmitScore, errors:errorsScore, control } = useForm();

    //Fechas válidas periodo
    var validDates = Datetime.moment().subtract(10, 'years');
    var validQuarter = Datetime.moment().add(0, 'months');
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
        setSelectedQuarter(null);
        setShowMattersSelected(false);
        setMatterListSelect([]);
        setSelectedType('');
        setSelectedCareer('');
        setAllListSelect([]);
        setShowCareers(false);
        setShowQuarter(false);
        setShowGrade(false);
        setPeriodDate('');
        setReferences([]);
        setDataCareer(null);
        SW.firstStep();
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
        //Resetear paginacion en la tabla de scores
        setPageScore(1);

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
    
    //materias disponibles para seleccionar
    const [matterListSelect, setMatterListSelect] = useState([]);
    const [allListSelect, setAllListSelect] = useState([]);
    //mostrar seccion de materias
    const [showMattersSelected, setShowMattersSelected] = useState(false);

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
    
    const [perPage] = useState(10);
	const [perPageSelect, setPerPageSelect] = useState(0);
	const [direction, setDirection] = useState({});

    const [filters, setFilters] = useState('');
	
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

    const onDeleteStudent = (row) => {
        clearForm();
    }

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
     * 
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

    const [state, updateState] = useState({
        transitions: {
            enterRight: `animated enterRight`,
            enterLeft: `animated enterLeft`,
            exitRight: `animated exitRight`,
            exitLeft: `animated transitions.exitLeft`,
            intro: `animated intro`,
        },
    });

    // Al cambio de paso
    const onStepChange = (stats) => {
        window.scrollTo(0, 0);
    };

    const setInstance = SW => updateState({
        ...state,
        SW,
    });

    const { SW } = state;

    const Nav = (props) => {

        const dots = [];
        for (let i = 1; i <= props.totalSteps; i += 1) {
            const isActive = props.currentStep === i;
            dots.push((
                <span
                    key={`step-${i}`}
                    className={`dot ${isActive ? 'step-active' : ''}`}
                    onClick={() => props.goToStep(i)}
                >&bull;</span>
            ));
        }

        return (
            <div className='navWizard'>{dots}</div>
        );
    };

    /**
     * Botones de navegacion stats
     */
    const Stats = ({ nextStep, previousStep, totalSteps, step }) => (
        <>
            <hr />
            <div className={`d-flex ${step == 1 ? 'justify-content-end':'justify-content-between'}`}>
                { step > 1 &&
                    <button className='btn btn-default btn-round' onClick={previousStep}>Atrás</button>
                }
                { step < totalSteps ?
                    <button className='btn btn-primary btn-round' onClick={nextStep}>Siguiente</button>
                    :
                    <button className='btn btn-success btn-round' onClick={nextStep}>Finalizar</button>
                }
            </div>
            <hr />
        </>
    );

    /** Inicio de pasos */

    //Primer paso
    const First = props => {

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

        //validar alumno seleccionado
        const validate = () => {
            if(dataStudent.length == 0){
                setModalVisible(true);
                setModalMsg('Seleccione estudiante');
                return;
            }else{
                props.nextStep();
            }
        };

        return (
            <>
                <h3>Seleccione alumno</h3>
                <div>
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
                            noDataComponent="No hay registros para mostrar"
                            noHeader={true}
                        />
                        </Col>
                    </Row>
                </div>
                                   
                <Stats step={1} {...props} nextStep={validate}/>
            </>
        );
    };

    //Segundo paso
    const [showGrade, setShowGrade] = useState(false);
    const [showCareers, setShowCareers] = useState(false);
    const [selectedQuarter, setSelectedQuarter] = useState(null);
    const [selectedAgency, setSelectedAgency] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedCareer, setSelectedCareer] = useState('');
    const [showQuarter, setShowQuarter] = useState(false);

    //Al cambiar el grado llenar el select de carrera de acuerdo al tipo
    const handleChangeType = (e) =>  {
        setSelectedType(e.target.value);
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

    //Al cambiar sede
    const handleChangeAgency = (e) =>  {
        setSelectedAgency(e.target.value);
    }

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

    //Al cambiar el cuatrimestre llenar seleccionar todas las materias de la carrera
    const handleChangeQuarter = (e) =>  {
        let quarter = e.target.value;
        setSelectedQuarter(quarter);
        //Crear una lista de materias para seleccionar individualmente 
        if(quarter>=1){
            //Obtener id trunk
            let trunkCareer = trunk;
            //Consultar materias disponibles
            let pensum = listMatters.filter(item => (parseInt(item.quarter) <= parseInt(quarter)) && (item.career.id == selectedCareer || item.career.id == trunkCareer.id) );
            setMatterListSelect(pensum);
            setAllListSelect(pensum);
            setShowMattersSelected(true);
            //generar referencias al cambio de cuatrimestre
            handleCreateorUpdateReference(quarter);
        }else{
            setShowMattersSelected(false);
            setSelectedMatters([]);
        }
    }

    //Validar periodo
    const handleChangePeriod = (date) => {
        var aDate = moment(date, 'DD-MM-YYYY', true);
        var isValid = aDate.isValid();
        if(isValid){
            setPeriodDate(date);
            setShowGrade(true);
            handleUpdatePeriodReference(date);
        }else{
            setShowGrade(false);
        }
	}

	const [periodDate, setPeriodDate] = useState('');
    const [pageMatter, setPageMatter] = useState(1);
    const [dataCareer, setDataCareer] = useState(null);

    //Segundo paso
    const Second = props => {
        
        /**
         * Manejo de materias
         */
        const columnsMatters = [
            {
                name: 'Carrera',
                selector: 'career.name',
                wrap:true,
            },
            {
                name: 'Materia',
                selector: 'name',
                wrap:true,
            },
            {
                name: 'Cuatrimestre',
                selector: 'quarter',
                wrap:true,
            },
            {
                name: 'Código',
                selector: 'code',
                wrap:true,
            },
            {
                name: '',
                button: true,
                cell: row => 
                <div className="d-flex">
                    <Button className="btn-link" color="danger" disabled={registering} size="sm" onClick={e => {   e.preventDefault(); removeItem(row);}}>
                        <i className="fa fa-times-circle"></i>
                    </Button>
                </div>,
            },
        ];

        //Validar campos y materias
        const submitDataStudent = (data, e) => {
            setDataCareer(data);
            if(selectedQuarter>0){
                if(selectedMatters.length == 0){
                    setModalVisible(true);
                    setModalMsg('Seleccione las materias de la carrera');
                }else{
                    props.nextStep();
                }
            }
        };

        const onChangePage=(page)=>{setPageMatter(page)}
    
        return (
            <>
            <Form className="form" >
                <Row form>
                    <Col md={6}>
                        <FormGroup>
                            <Label for="agency">Sede</Label>{' '}
                            {getting && <span className="spinner-border spinner-border-sm mr-1"></span>}
                            <select className={'form-control' + (errors.agency ? ' is-invalid' : '')} name="agency"
                                onChange={handleChangeAgency} disabled={registering} value={selectedAgency}
                                ref={register({ 
                                        required: "La sede es requerida" 
                                    })}>
                                    <option key="" name="" value="">Seleccione sede</option>
                                    {listAgencies && listAgencies.map(list => 
                                        <option
                                            key={list.id}
                                            name={list.id}
                                            value={list.id}>
                                            {list.name}
                                        </option>
                                    )}
                            </select>
                            {errors.agency && <div className="invalid-feedback d-block">{errors.agency.message}</div>}
                        </FormGroup>
                    </Col >
                    <Col md={6}>
                            <Label for="period">Inicio de periodo</Label>{' '}
                            <FormGroup>
                                <Datetime timeFormat={false} dateFormat={'DD-MM-YYYY'}  isValidDate={ valid } closeOnSelect onChange={handleChangePeriod} value={periodDate}
                                    renderInput={(props) => {
                                        return <input {...props} className={'form-control dateFilter' + (errors.period ? ' is-invalid' : '')} readOnly name="period" 
                                        value={(periodDate) ? props.value : ''} 
                                        ref={register({
                                            required: "Inicio de periodo es requerido",
                                        })}  />
                                    }}
                                />
                                {errors.period && <div className="invalid-feedback d-block">{errors.period.message}</div>}
                            </FormGroup>
                    </Col>
                    <Col md={4}>
                        <FormGroup>
                        {showGrade && <>
                            <Label for="type">Grado</Label>
                            <select className={'form-control' + (errors.type ? ' is-invalid' : '')} name="type"
                            onChange={handleChangeType} disabled={registering} value={selectedType}
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
                            </>
                            }
                        </FormGroup>
                    </Col>
                    <Col md={4}>
                        <FormGroup>
                            {showCareers && <>
                                <Label for="career">Carrera</Label>{' '}
                                <select className={'form-control' + (errors.career ? ' is-invalid' : '')} name="career"
                                    onChange={handleChangeCarrer} value={selectedCareer}
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
                            <Label for="quarter">Cuatrimestre  {loadingReferences && <span className="spinner-border spinner-border-sm mr-1 text-primary" style={{verticalAlign:'text-top'}}></span>}</Label>
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
                                    onChangePage={onChangePage}
                                    paginationComponentOptions={paginationOptions}
                                    paginationDefaultPage={pageMatter}
                                    persistTableHead
                                    pagination
                                    progressComponent={<CustomLoader />}
                                    noDataComponent="No hay registros para mostrar"
                                    noHeader={true}
                                />
                            </Col>
                        </Row>
                    </div>
                </>
                }
                <Stats step={2} {...props} nextStep={handleSubmit(submitDataStudent)} />
            </>
        );
    };

    //Modal nota
	const [modalScore, setModalScore] = useState(false);
	//fila seleccionada y calificaciones
	const [editRow, setEditRow] =  useState(null);

    //Loading al setear calificaciones
	const [loadingScore, setLoadingScore] =  useState(false);

    //Registro de notas
    const onUpdateScore = (data, e) => {
		if(editRow){

            //actualizar los calificaciones en el grid
            let scores = {}

            let firstScore = parseInt(data.firstScore);
            let secondScore = parseInt(data.secondScore);
            //truncar decimales si hay
            let total = Math.trunc((firstScore + secondScore)/2);

            scores = { firstScore:firstScore, secondScore:secondScore, total:total }
            setLoadingScore(true);

            new Promise((resolve) => {
                setTimeout(() => {
                    let newData = selectedMatters.map(row => {
                        if(row.id == editRow.id)
                            return Object.assign({}, row, scores)                  
                        return row
                    });
                    setSelectedMatters(newData);
                    setModalScore(false);
                    setEditRow(null);
                    setLoadingScore(false);
                    resolve();
                });
            });
		}
	};

    const [pageScore, setPageScore] = useState(1);

    // Tercer paso la asignacion de calificaciones
    const Third = (props) => {
        
         /**
         * Columnas manejo de calificaciones
         */
        const columnsScores = [
            {
                name: 'Carrera',
                selector: 'career.name',
                wrap:true,
            },
            {
                name: 'Materia',
                selector: 'name',
                wrap:true,
            },
            {
                name: 'Cuatrimestre',
                selector: 'quarter',
                wrap:true,
            },
            {
                name: 'Código',
                selector: 'code',
                wrap:true,
            },
            {
                name: '1er Parcial',
                cell: row => {
                    return row.firstScore ? row.firstScore : ''
                }
            },
            {
                name: '2do Parcial',
                cell: row => {
                    return row.secondScore ? row.secondScore : ''
                }
            },
            {
                name: 'Final',
                cell: row => {
                    return row.total ? row.total : ''
                }
            },
            {
                name: '',
                button: true,
                cell: row => 
                <div className="d-flex">
                    <Button className="btn-link" color="primary" size="sm" onClick={e => {   
                        e.preventDefault();setEditRow(row); setModalScore(true); 
                    }}>
                        <Icon icon={draftFill} width="20" height="20"/>
                    </Button>
                </div>,
            },
        ];

        //Validar notas de cada materia
        const validateScores = () => {
            let count = 0;
            selectedMatters.map(row => {
                if (!row.total)
                    count++;
            });
            if(count==0){
                props.nextStep();
            }else{
                setModalVisible(true);
                setModalMsg('Debe ingresar todas las calificaciones');
            }
        };

        //mantener la pagina seleccionada en algun cambio
        const onChangePage=(page)=>{setPageScore(page)}

        return (
           <>
                <h3>Asignación de calificaciones</h3>
                <div className="form" style={{border:'1px solid #dee2e6', padding: '10px 20px', borderRadius:'5px',
                    marginBottom:'5px'}}>
                    <Row>
                        <Col>
                            <DataTable
                                className="dataTables_wrapper"
                                responsive
                                highlightOnHover
                                striped
                                sortIcon={ <i className="fa fa-arrow-down ml-2" aria-hidden="true"></i> }
                                columns={columnsScores}
                                data={selectedMatters}
                                onChangePage={onChangePage}
                                paginationComponentOptions={paginationOptions}
                                paginationDefaultPage={pageScore}
                                noDataComponent="No hay registros para mostrar"
                                pagination
                                persistTableHead
                                noHeader={true}
                            />
                        </Col>
                    </Row>
                </div>
                <Stats step={3} {...props} nextStep={validateScores}/>
           </>
        );
    };

    //Loading al generar referencias
	const [loadingReferences, setLoadingReferences] =  useState(false);
    const [references, setReferences] =  useState([]);

    /**
     * Generar referencias de acuerdo a la cantidad de cuatrimestres
     * Verificar 
     */
    const handleCreateorUpdateReference = (quarter) => {
       
        setLoadingReferences(true);
        let quarters = Array.from({length: quarter}, (_, i) => i + 1);
        const numbers = [1, 2, 3, 4];//cantidad de referencias
        let quarterReferences = references.length/4;

        new Promise((resolve) => {
            setTimeout(() => {  
                
                //Si no hay referencias
                if(references.length == 0){
                    let dataReferences = []
                    let count = 1; //id temporal
                    quarters.map(quarter => {
                        numbers.map(() =>{
                            let reference = {
                                id:count,
                                quarter:quarter,
                                period:moment(periodDate).format("DD-MM-YYYY").toString(),
                                type:1,
                                status:1,
                                paymentType:''
                            }
                            count++;
                            dataReferences.push(reference)
                        });
                    });
                    setReferences(dataReferences);
                }else{
                    //si hay mas cuatrimestres anadir las referencias que falten
                    if(quarters.length>quarterReferences){
                        quarters.map(quarter => {
                            let arrayRefer = references;
                            let existReferences = references.filter(ref => ref.quarter == quarter);
                            let count = arrayRefer.length+1;//id temporal
                            if(existReferences.length == 0){
                                numbers.map(() =>{
                                    let reference = {
                                        id:count,
                                        quarter:quarter,
                                        period:moment(periodDate).format("DD-MM-YYYY").toString(),
                                        type:1,
                                        status:1,
                                        paymentType:''
                                    }
                                    count++
                                    arrayRefer.push(reference)
                                });

                                setReferences(arrayRefer);
                            }
                        });
                    }else if(quarters.length<quarterReferences){
                        //Si son menos cuatrimestres 
                        //quitar todos las referencias sobrantes
                        setReferences(references.filter(ref => (ref.quarter >= 1 && ref.quarter <= quarters.length) ));
                    }
                    
                }

                setLoadingReferences(false);
                resolve();
            });
        });
        
    }

    //Actualizar el inicio de periodo en las referencias
    //Al cambio de periodo
    const handleUpdatePeriodReference = (period) => {
        if(references.length>0){
            let newArray = references;
            for (var i in references) {
                references[i].period = moment(period).format("DD-MM-YYYY").toString();
            }
            setReferences(newArray);
        }
    }

    const [loadingUpdate, setLoadingUpdate] =  useState(false);
    const [dataRow, setDataRow] = useState(null);
    const [columnUpdate, setColumnUpdate] = useState(null);

    //Actualizacion de estatus o tipo de pago en las referencia
    const onUpdateStatus = (currentRow, column) => {

        let status = 1;
        let update = {}
        let paymentType = 'BANCO';
        setColumnUpdate(column);
        setDataRow(currentRow);

        if(column == 'status'){
            if(currentRow.status == 1){
                status = 2;
            }else if(currentRow.status == 2){
                status = 1;
            }
            if(status == 1){
                update = { status:status, paymentType:''}
            }else{
                update = { status:status, paymentType: paymentType}
            }
           
        }

        if(column == 'paymentType'){
            if(currentRow.paymentType == 'BANCO'){
                paymentType = 'EFECTIVO';
            }else if(currentRow.paymentType == 'EFECTIVO'){
                paymentType = 'NO APLICA';
            }else if(currentRow.paymentType == 'NO APLICA'){
                paymentType = 'BANCO';
            }

            update = { paymentType:paymentType }
        }
        
        setLoadingUpdate(true);

        new Promise((resolve) => {
            setTimeout(() => {

                let newData = references.map(row => {
                    if(row.id == currentRow.id)
                        return Object.assign({}, row, update)                  
                    return row
                });

                setReferences(newData);
                setDataRow(null);
                setColumnUpdate(null);
                setLoadingUpdate(false);
                resolve();
            });
        });
	};

    const [pageReference, setPageReference] = useState(1);
    const Fourth = (props) => {

        //Columnas Data table Referencias
        const columnsReferences = [
            {
                name: 'Cuatrimestre',
                selector: 'quarter',
            },
            {
                name: 'Estatus',
                selector: 'status',
                cell : (row)=>{
                    if(row.status == 1){
                        return <Button color="secondary" className='btn btn-round' size="sm" style={{fontSize:10}} disabled={loadingUpdate} onClick={e => 
                            {
                                if(!loadingUpdate){
                                    e.preventDefault(); 
                                    onUpdateStatus(row,'status');
                                }
                            }
                        }>{((dataRow && dataRow.id == row.id) && (loadingUpdate && columnUpdate == 'status')) && <span className="spinner-border spinner-border-sm mr-1"></span>}PENDIENTE</Button>;
                    }else{
                        return <Button color="success" className='btn btn-round' size="sm" style={{fontSize:10}} disabled={loadingUpdate} onClick={e => 
                            {
                                if(!loadingUpdate){
                                    e.preventDefault(); 
                                    onUpdateStatus(row,'status');
                                }
                            }
                        }>{((dataRow && dataRow.id == row.id) && (loadingUpdate && columnUpdate == 'status')) && <span className="spinner-border spinner-border-sm mr-1"></span>}PAGADO</Button>;
                    }
                },
            },
            {
                name: 'Pago',
                selector: 'paymentType',
                cell : (row)=>{
                    if(row.paymentType == "BANCO"){
                        return <Button color="info" className='btn btn-round' size="sm" style={{fontSize:10}} disabled={loadingUpdate} onClick={e => 
                            {
                                if(!loadingUpdate){
                                    e.preventDefault(); 
                                    onUpdateStatus(row,'paymentType');
                                }  
                            }
                        }>{((dataRow && dataRow.id == row.id) && (loadingUpdate && columnUpdate == 'paymentType')) && <span className="spinner-border spinner-border-sm mr-1"></span>}BANCO</Button>;
                    }else if(row.paymentType == "EFECTIVO"){
                        return <Button color="info" className='btn btn-round' size="sm" style={{fontSize:10}} disabled={loadingUpdate} onClick={e => 
                            {
                                if(!loadingUpdate){
                                    e.preventDefault(); 
                                    onUpdateStatus(row,'paymentType');
                                }
                            }
                        }>{((dataRow && dataRow.id == row.id) && (loadingUpdate && columnUpdate == 'paymentType')) && <span className="spinner-border spinner-border-sm mr-1"></span>}EFECTIVO</Button>;
                    }else if(row.paymentType == "NO APLICA"){
                        return <Button color="info" className='btn btn-round' size="sm" style={{fontSize:10}} disabled={loadingUpdate} onClick={e => 
                            {
                                if(!loadingUpdate){
                                    e.preventDefault(); 
                                    onUpdateStatus(row,'paymentType');
                                }
                            }
                        }>{((dataRow && dataRow.id == row.id) && (loadingUpdate && columnUpdate == 'paymentType')) && <span className="spinner-border spinner-border-sm mr-1"></span>}NO APLICA</Button>;
                    }else{
                        return '';
                    }	
                },
            },
            {
                name: 'Periodo',
                selector: 'period',
                wrap:true,
            },
            {
                name: 'Concepto',
                selector: 'type',
                cell : (row)=>{
                    if(row.type == 1){
                        return 'COLEGIATURA';
                    }else{
                        return 'INSCRIPCIÓN';
                    }
                },
            },

        ];

        const onChangePage=(page)=>{setPageReference(page)}

        //Preguntar para finalizar registro
        const end = () => {
            setModalQuestion(true);
        };

        return (
            <div>
                <h3>Aprobar referencias</h3>
                <div className="form" style={{border:'1px solid #dee2e6', padding: '10px 20px', borderRadius:'5px',
                    marginBottom:'5px'}}>
                    <Row>
                        <Col>
                            <DataTable
                                className="dataTables_wrapper"
                                responsive
                                highlightOnHover
                                striped
                                sortIcon={ <i className="fa fa-arrow-down ml-2" aria-hidden="true"></i> }
                                title="Calificaciones"
                                columns={columnsReferences}
                                data={references}
                                onChangePage={onChangePage}
                                paginationComponentOptions={paginationOptions}
                                paginationDefaultPage={pageReference}
                                persistTableHead
                                pagination
                                progressComponent={<CustomLoader />}
                                noDataComponent="No hay registros para mostrar"
                                noHeader={true}
                            />
                        </Col>
                    </Row>
                </div>
                <Stats step={4} {...props} nextStep={end} />
            </div>
        );
    };

    /**
     * Construir data a enviar al servidor
     * Hacer dispatch
     * Si el registro es exitoso limpiar SW
     */
    const onCreateData = () => {
        if(!registering){
            let data = {}
            data.user = { id: user.id, role: user.role };
            data.student = dataStudent[0];
            data.references = references;
            data.matters = selectedMatters;
            data.career = dataCareer.career;
            data.agency = dataCareer.agency;
            data.period = dataCareer.period;
            data.turn = "Matutino";//default
            dispatch(inscriptionActions.createInscriptionRegular( data ));
        }
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
                            <Col sm="12">
                                <h3>Inscripción alumnos regulares</h3>
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
                                {/* Wizard */} 
                                <div style={{border:'1px solid #dee2e6', padding: '10px 20px', borderRadius:'5px', marginBottom:'5px'}}> 
                                    <div className='row'>
                                        <div className={`col-12`}>
                                            <StepWizard
                                                onStepChange={onStepChange}
                                                transitions={state.transitions} // comment out for default transitions
                                                //nav={<Nav />}
                                                instance={setInstance}
                                            >
                                                <First/>
                                                <Second/>
                                                <Third />
                                                <Fourth />
                                            </StepWizard>
                                        </div>
                                    </div>
                                </div>
                                {/* Wizard */}
                            
                                <div className="d-flex justify-content-end">
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
                        {/* Seleccion de estudiantes */}
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
                        {/* Modal calificaciones */}
                        <Modal toggle={() => {setModalScore(false)}} isOpen={modalScore} backdrop="static">
                            <div className="modal-header">
                                <h5 className="modal-title">Calificaciones</h5>
                                <button aria-label="Close" className="close" type="button" onClick={() =>  {setModalScore(false);}}>
                                    <span aria-hidden={true}>×</span>
                                </button>
                            </div>
							<Form onSubmit={handleSubmitScore(onUpdateScore)} className="form">
								<div className="modal-body"> 
									<Row form>
										<Col md={6}>  
											<FormGroup>
												<Label for="firstScore">1er Parcial</Label>
												<Controller
                                                    name="firstScore"
                                                    control={control}
                                                    rules={{
                                                        min: {
                                                            value: 0,
                                                            message: "La calificación debe ser de al menos 0"
														},
														max: {
                                                            value: 10,
                                                            message: "La calificación no debe ser superior a 10"
														},
														maxLength:2,
                                                        required: "La calificación es requerida",
                                                    }}
                                                    as={<NumberFormat decimalScale={0} maxLength="2" allowNegative={false} className={'form-control' + (errorsScore.firstScore ? ' is-invalid' : '')} thousandSeparator={false} />}
                                                />
												{errorsScore.firstScore && <div className="invalid-feedback">{errorsScore.firstScore.message}</div>}
												{errorsScore.firstScore && errorsScore.firstScore.type === "maxLength" && <div className="invalid-feedback">Se excedió la longitud máxima</div> }
											</FormGroup>
										</Col>
                                        <Col md={6}>  
											<FormGroup>
												<Label for="secondScore">2do Parcial</Label>
												<Controller
                                                    name="secondScore"
                                                    control={control}
                                                    rules={{
                                                        min: {
                                                            value: 0,
                                                            message: "La calificación debe ser de al menos 0"
														},
														max: {
                                                            value: 10,
                                                            message: "La calificación no debe ser superior a 10"
														},
														maxLength:2,
                                                        required: "La calificación es requerida",
                                                    }}
                                                    as={<NumberFormat decimalScale={0} maxLength="2" allowNegative={false} className={'form-control' + (errorsScore.secondScore ? ' is-invalid' : '')} thousandSeparator={false} />}
                                                />
												{errorsScore.secondScore && <div className="invalid-feedback">{errorsScore.secondScore.message}</div>}
												{errorsScore.secondScore && errorsScore.secondScore.type === "maxLength" && <div className="invalid-feedback">Se excedió la longitud máxima</div> }
											</FormGroup>
										</Col>
									</Row>		
								</div>
								<div className="modal-footer">
									<Button color="primary" className="btn-round" disabled={loadingScore}>
                                        {loadingScore && <span className="spinner-border spinner-border-sm mr-1"></span>} Aceptar
									</Button>
									<Button color="secondary" className="btn-round" outline type="button" disabled={loadingScore} onClick={() =>  {setModalScore(false);}} >
										Cerrar
									</Button>
								</div>
							</Form>
                        </Modal>
                        {/* Modal warning */}
                        <Modal toggle={() => {setModalQuestion(false);}} isOpen={modalQuestion} backdrop="static">
                            <div className="modal-header">
                                <h5 className="modal-title">Inscripción</h5>
                                <button aria-label="Close" className="close" type="button" disabled={registering} onClick={() =>  {setModalQuestion(false);}}>
                                    <span aria-hidden={true}>×</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>¿Seguro que desea guardar la información proporcionada?</p>
                            </div>
                            <div className="modal-footer">
                                <Button color="primary" className="btn-round" disabled={registering} onClick={onCreateData}>
                                    {registering && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                    Confirmar
                                </Button>
                                <Button color="secondary" className="btn-round" outline type="button" onClick={() => {setModalQuestion(false);}} disabled={registering}>
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

export default InscriptionCustomPage;