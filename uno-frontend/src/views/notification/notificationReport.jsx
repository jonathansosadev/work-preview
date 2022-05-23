/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notificationActions } from '../../actions';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import DataTable from 'react-data-table-component';
import { Button, Spinner, Row, Col, Form, FormGroup, ListGroup, ListGroupItem, ListGroupItemText, Modal, Alert } from 'reactstrap';
//componente dataTable sede
import '../../assets/css/table.css';
import { useForm  } from "react-hook-form";
import moment from 'moment';
import Datetime from 'react-datetime';

function NotificationReportPage() {

  	useEffect(() => {
		document.body.classList.add("landing-page");
		document.body.classList.add("sidebar-collapse");
		document.documentElement.classList.remove("nav-open");
		return function cleanup() {
			document.body.classList.remove("landing-page");
			document.body.classList.remove("sidebar-collapse");
		};
  	});

	//Alertas
	const alert = useSelector(state => state.alert);
	//Mostrar alertas
	const [visible, setVisible] = useState(true);
	const onDismiss = () => setVisible(false);
	
	useEffect(() => {
		if(alert.message){
			setVisible(true); 
			setModalVisible(false);
			window.setTimeout(()=>{setVisible(false)},5000);   
		}
	},[alert]);
   
	//usuario
    const user = useSelector(state => state.authentication.user);
    const dispatch = useDispatch();

	const dataNotifications = useSelector(state => state.notification.data);
    const loadingPage = useSelector(state => state.notification.loading);

	//Verificar data de redux
	useEffect(() => {
		if(dataNotifications && dataNotifications.results){
			setData(dataNotifications.results);
			dispatch(notificationActions.clearData());
        }
        if(dataNotifications && dataNotifications.metadata && dataNotifications.metadata[0]){
			setRowCount(dataNotifications.metadata[0].total);
		}
	},[dataNotifications]);

	// Inicializar tabla sin data
	const [data, setData] = useState([])
	const [rowCount, setRowCount] = useState(0);

	//Obtener solo texto de html
	const getTextHtml = (html) =>{
		var divContainer= document.createElement("div");
		divContainer.innerHTML = html;
		return divContainer.textContent || divContainer.innerText || "";
	}

	//Columnas Data table
	const columns = [
		{
			name: 'Id',
			selector: '_id',
			sortable: true,
			wrap:true,
			omit:true,
		},
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
			name: 'Título',
			selector: 'title',
			sortable: true,
			wrap:true,
		},
        {
			name: 'Contenido',
			selector: 'description',
			cell : (row)=>{
				return <div style={{overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis'}}>{getTextHtml(row.description)}</div>
			},
		},
		{
			name: 'Visto',
			selector: 'read',
			sortable: true,
			wrap:true,
			cell : (row)=>{
				if(row.read){
					return <>Si</>
				}else{
					return <>No</>
				}
			},
		},
		{
			name: 'Borrado',
			selector: 'deleted',
			sortable: true,
			wrap:true,
			cell : (row)=>{
				if(row.deleted){
					return <>Si</>
				}else{
					return <>No</>
				}
			},
		},
		{
			name: 'Fecha de notificación',
			selector: 'notificationDate',
			sortable: true,
			cell : (row)=>{
				return moment(row.notificationDate).local().format("YYYY-MM-DD")
			},
		},
        {
			name: 'Fecha de creación',
			selector: 'createdDate',
			sortable: true,
			cell : (row)=>{
				return moment(row.createdDate).local().format("YYYY-MM-DD")
			},
		},

	];

	const [perPage, setPerPage] = useState(10);
	const [perPageSelect, setPerPageSelect] = useState(0);
	const [direction, setDirection] = useState({});

	const [filters, setFilters] = useState('');

	//obtener data de usuario necesaria
	const getUserData = () => {
		let data = {
			id: user.id,
			role:user.role,
		}
		return data;
	}

	//data inicial
	const getDataTable = (page) => {
		dispatch(notificationActions.dataTableReport(getUserData(), page, perPageSelect == 0 ? perPage : perPageSelect, direction, {}));
	}
	
	//Paginar
	const handlePageChange = async (page) => {
		dispatch(notificationActions.dataTableReport(getUserData(), page, perPageSelect == 0 ? perPage : perPageSelect, direction, filters ? filters: {}));
	};
	
	//Ordenar
	const handleSort = (column, sortDirection) => {
		let sort = {"id": column.selector, "desc": (sortDirection == "asc" ? false : true) }
		setDirection(sort);
		dispatch(notificationActions.dataTableReport(getUserData(), 1, perPageSelect == 0 ? perPage : perPageSelect, sort, filters ? filters: {}));
	};

	//Cambiar cantidad de filas
	const handlePerRowsChange = async (newPerPage, page) => {
		setPerPageSelect(newPerPage);
		dispatch(notificationActions.dataTableReport(getUserData(),page, newPerPage, direction, filters ? filters: {}));
	};

	//Consultar al entrar
	useEffect(() => {
		getDataTable(1);
	}, []);

	//Opciones de paginacion
	const paginationOptions = { rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' };

	//Loader de la tabla
	const CustomLoader = () => (<><Spinner  color="primary" style={{ width: '1.5rem', height: '1.5rem' }} /></>);

	const clearFilters = () =>{
        reset({})
	}

    //Form Data Filter
	const { handleSubmit, register, reset } = useForm();
    
    //Abrir/Cerrar filtros
	const [isOpen, setIsOpen] = useState(false);
	const toggle = () => setIsOpen(!isOpen);

	//Modal genérico y mensaje
	const [modalWarning, setModalWarning] = useState(false);
	const [modalMsg, setModalMsg] = useState('');

    //Consultar por filtros
	const onFilterData = (data, e) => {
		var validStartDate =  moment(data.startDate).isValid();

		if(data.startDate != "" && !validStartDate){
			setModalWarning(true);
            setModalMsg('Ingrese una fecha válida');
			return;
		}

		var validEndDate =  moment(data.endDate).isValid();

		if(data.endDate != "" && !validEndDate){
			setModalWarning(true);
            setModalMsg('Ingrese una fecha válida');
			return;
		}

		//Verificar que la fecha final sea superior o igual a la inicial
		var isafter = moment(data.startDate).isAfter(data.endDate);

		if(isafter){
			setModalWarning(true);
            setModalMsg('La fecha inicial no puede ser superior a la final');
			return;
		}

		setFilters(data);
		dispatch(notificationActions.dataTableReport(getUserData(), 1, perPageSelect == 0 ? perPage : perPageSelect, direction, data))
	}

	//Data al expandir una fila
	const ExpandedComponent = ({ data }) => (
		<>
			<h3 dangerouslySetInnerHTML={{ __html: data.title }} style={{marginTop:10}}></h3>
			<div dangerouslySetInnerHTML={{ __html: data.description }} style={{marginBottom:10}}></div>
		</>
	);

	const handleChangeStartDate = (date) => {
		setStartDate(date);
	}

	const handleChangeEndDate = (date) => {
		setEndDate(date);
	}

	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');


    return (
        <>
            <div className="d-flex" id="wrapper">
				<SideBar/>
				<div id="page-content-wrapper">
					<AdminNavbar/>
					<div className="flex-column flex-md-row p-3">
						<div className="d-flex justify-content-between" style={{padding:"4px 16px 4px 24px"}}>
							<div className="align-self-center">
								<h3 style={{ marginBottom: '0' }}>Reporte de notificaciones</h3>
							</div>
						</div>
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
								<Form onSubmit={handleSubmit(onFilterData)} className="form-inline" style={{marginTop:15}}>
									<FormGroup className="mr-3">
										<input
											className="form-control"
											name="email"
											placeholder="Email"
											type="text"
											ref={register}
										></input>
									</FormGroup>
                                    <FormGroup className="mr-3">
										<input
											className="form-control"
											name="title"
											placeholder="Título"
											type="text"
											ref={register}
										></input>
									</FormGroup>
                                    <FormGroup className="mr-3">
										<input
											className="form-control"
											name="description"
											placeholder="Contenido"
											type="text"
											ref={register}
										></input>
									</FormGroup>
									<FormGroup className="mr-3">
										<select className='form-control' name="read"
											ref={register}>
												<option key="" name="" value="">Seleccione opción</option>										
												<option key="1" name="1" value="1">Leídos</option>
												<option key="0" name="0" value="0">No leídos</option>
										</select>
									</FormGroup>
									<FormGroup className="mr-3">
										<select className='form-control' name="deleted"
											ref={register}>
												<option key="" name="" value="">Seleccione opción</option>										
												<option key="1" name="1" value="1">Borrados</option>
												<option key="0" name="0" value="0">No borrados</option>
										</select>
									</FormGroup>
									{/* Buscar por fecha de notificacion y no de creación */}
									<FormGroup className="mr-3">
										<Datetime timeFormat={false} dateFormat={'YYYY-MM-DD'} closeOnSelect onChange={handleChangeStartDate} value={startDate}
											renderInput={(props) => {
												return <input {...props} className="form-control dateFilter" readOnly name="startDate" placeholder="Desde"  ref={register} value={(startDate) ? props.value : ''} />
											}} 
										/>
									</FormGroup>
									<FormGroup className="mr-3">
										<Datetime timeFormat={false} dateFormat={'YYYY-MM-DD'} closeOnSelect onChange={handleChangeEndDate} value={endDate}
											renderInput={(props) => {
												return <input {...props} className="form-control dateFilter" readOnly name="endDate" placeholder="Hasta"  ref={register} value={(endDate) ? props.value : ''} />
											}} 
										/>
									</FormGroup>
									<Button color="primary" className="btn-round" type="submit" disabled={loadingPage}>
										{loadingPage && <span className="spinner-border spinner-border-sm mr-1"></span>} Buscar
									</Button>
								</Form>
							</>
							}
						</div>
						{/* Filtros */}
						<Row>
							<Col>
							<DataTable
								className="dataTables_wrapper"
								responsive
								highlightOnHover
								expandableRows
								expandableRowsComponent={<ExpandedComponent />}
								striped
								sortIcon={ <i className="fa fa-arrow-down ml-2" aria-hidden="true"></i> }
								title="calificaciones"
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
						<Modal toggle={() => {setModalWarning(false); setModalMsg('')}} isOpen={modalWarning}>
                            <div className="modal-header">
                            <h5 className="modal-title" id="examplemodalMsgLabel">
                                Notificaciones
                            </h5>
                            <button
                                aria-label="Close"
                                className="close"
                                type="button"
                                onClick={() =>  {setModalWarning(false); setModalMsg('')}}
                            >
                                <span aria-hidden={true}>×</span>
                            </button>
                            </div>
                            <div className="modal-body">
                                <p>{modalMsg}</p>
                            </div>
                            <div className="modal-footer">
                            <Button
								color="secondary"
								className="btn-round" outline
                                type="button"
                                onClick={() =>  {setModalWarning(false); setModalMsg('')}}
                            >
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

export default NotificationReportPage;