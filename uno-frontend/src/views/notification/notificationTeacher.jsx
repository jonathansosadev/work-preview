/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notificationActions, agencyActions } from '../../actions';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import DataTable from 'react-data-table-component';
import { Button, Spinner, Row, Col, Form, FormGroup, ListGroup, ListGroupItem, ListGroupItemText, Modal } from 'reactstrap';
//componente dataTable
import '../../assets/css/table.css';
import { useForm  } from "react-hook-form";
import { history } from '../../helpers';
import { Icon } from '@iconify/react';
import eyeFill from '@iconify-icons/ri/eye-fill';
import moment, { now } from 'moment';
import mailLine from '@iconify-icons/ri/mail-line';
import mailOpenLine from '@iconify-icons/ri/mail-open-line';
import deleteBin2Line from '@iconify-icons/ri/delete-bin-2-line';

function NotificationTeacherPage() {

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

	const dataNotifications = useSelector(state => state.notification.data);
    const loadingPage = useSelector(state => state.notification.loading);

	//Verificar data de redux
	useEffect(() => {
		if(dataNotifications && dataNotifications.results){
			setData(dataNotifications.results);
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
			name: '',
			selector: 'read',
			sortable: true,
			width: '50px',
			cell : (row)=>{
				if(row.read){
					return <Icon icon={mailOpenLine} className="icon" width={20} height={20} color="green"/>;
				}else{
					return <Icon icon={mailLine} className="icon" width={20} height={20}/>;
				}
				
			},
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
			name: 'Fecha',
			selector: 'createdDate',
			sortable: true,
			cell : (row)=>{
				return moment(row.createdDate).local().format("YYYY-MM-DD")
			},
		},
		{
			name: '',
            button: true,
			cell: row => 
            <div className="d-flex">
                <Button className="btn-link" color="primary" size="sm" onClick={e => 
                    {
                        e.preventDefault(); 
                        history.push('/notification-detail',{id:row._id});
                    }
			    }><Icon icon={eyeFill} className="icon" width={20} height={20}/></Button>
				 <Button className="btn-link" color="primary" size="sm" onClick={e => 
                    {
                        e.preventDefault(); 
						setDataRow(row);
						setModalVisible(true);
                    }
			    }><Icon icon={deleteBin2Line} className="icon" width={20} height={20}/></Button>
            </div>,
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
		dispatch(notificationActions.dataTableTeacher(getUserData(), page, perPageSelect == 0 ? perPage : perPageSelect, direction, {}));
	}
	
	//Paginar
	const handlePageChange = async (page) => {
		dispatch(notificationActions.dataTableTeacher(getUserData(), page, perPageSelect == 0 ? perPage : perPageSelect, direction, filters ? filters: {}));
	};
	
	//Ordenar
	const handleSort = (column, sortDirection) => {
		let sort = {"id": column.selector, "desc": (sortDirection == "asc" ? false : true) }
		setDirection(sort);
		dispatch(notificationActions.dataTableTeacher(getUserData(), 1, perPageSelect == 0 ? perPage : perPageSelect, sort, filters ? filters: {}));
	};

	//Cambiar cantidad de filas
	const handlePerRowsChange = async (newPerPage, page) => {
		setPerPageSelect(newPerPage);
		dispatch(notificationActions.dataTableTeacher(getUserData(),page, newPerPage, direction, filters ? filters: {}));
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
		dispatch(notificationActions.dataTableTeacher(getUserData(), 1, perPageSelect == 0 ? perPage : perPageSelect, direction, data))
	}

	//Data al expandir una fila
	const ExpandedComponent = ({ data }) => (
		<ListGroup>
			<ListGroupItem>
                <ListGroupItemText>
					<b>Título:</b> { data.title}
				</ListGroupItemText>
                <ListGroupItemText>
					{ data.description}
				</ListGroupItemText>
			</ListGroupItem>
	  	</ListGroup>
	);

	const handleChangeStartDate = (date) => {
		setStartDate(date);
	}

	const handleChangeEndDate = (date) => {
		setEndDate(date);
	}

	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');

	//Eliminación de notificación
	const [modalVisible, setModalVisible] = useState(false);
    const [dataRow, setDataRow] = useState(null);

    //Quitar notificación con bandera
    const removeNotification = () =>{
        dispatch(notificationActions.removeNotification( dataRow._id ));
	}
	
	const deleting = useSelector(state => state.notification.deleting);
	const deleteSuccess = useSelector(state => state.notification.deleted);
	
	useEffect(() => {
		//si se elimino correctamente cerrar modal y consultar informacion nuevamente
        if(deleteSuccess){
			setModalVisible(false);
			handleSubmit(onFilterData)();
        }
    },[deleteSuccess]);

    return (
        <>
            <div className="d-flex" id="wrapper">
				<SideBar/>
				<div id="page-content-wrapper">
					<AdminNavbar/>
					<div className="flex-column flex-md-row p-3">
						<div className="d-flex justify-content-between" style={{padding:"4px 16px 4px 24px"}}>
							<div className="align-self-center">
								<h3 style={{ marginBottom: '0' }}>Notificaciones</h3>
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
								<Form onSubmit={handleSubmit(onFilterData)} className="form-inline" style={{marginTop:15}}>
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
								// expandableRows
								// expandableRowsComponent={<ExpandedComponent />}
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
						<Modal toggle={() => {setModalVisible(false); setDataRow(null)}} isOpen={modalVisible} backdrop="static">
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
                                ¿Desea borrar la notificación?
                            </div>
                            <div className="modal-footer">
                                <Button color="primary" className="btn-round" disabled={deleting} onClick={()=>removeNotification()}>
                                    {deleting && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                    Confirmar
                                </Button>
                                <Button color="secondary" className="btn-round" outline type="button" onClick={() => {setModalVisible(false);setDataRow(null);}} disabled={deleting}>
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

export default NotificationTeacherPage;