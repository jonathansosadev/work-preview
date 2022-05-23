/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { inscriptionActions, agencyActions } from '../../actions';
import moment from 'moment';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import DataTable from 'react-data-table-component';
import { Button, Spinner, Row, Col, UncontrolledTooltip, Form, FormGroup, Table, Modal, Alert } from 'reactstrap';
//componente dataTable sede
import { history } from '../../helpers';
import '../../assets/css/table.css';
import { useForm  } from "react-hook-form";
import Datetime from 'react-datetime';
import { Icon } from '@iconify/react';
import deleteBin6Fill from '@iconify-icons/ri/delete-bin-6-fill'; 
import pencilFill from '@iconify-icons/ri/pencil-fill';

function InscriptionListPage() {

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
			setVisible(true); 
			let timeout = window.setTimeout(()=>{setVisible(false)},5000);   
			setTimeoutID(timeout);
		}
	},[alert]);

   
    const dispatch = useDispatch();
	const user = useSelector(state => state.authentication.user);
	const dataInscriptions = useSelector(state => state.inscription.data);
    const loadingPage = useSelector(state => state.inscription.loading);

	//Verificar data de redux
	useEffect(() => {
		if(dataInscriptions && dataInscriptions.results){
			setData(dataInscriptions.results);
        }
        if(dataInscriptions && dataInscriptions.metadata && dataInscriptions.metadata[0]){
			setRowCount(dataInscriptions.metadata[0].total);
		}
	},[dataInscriptions]);

	// Inicializar tabla sin data
	const [data, setData] = useState([])
	const [rowCount, setRowCount] = useState(0)

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
			name: 'Grupo',
			selector: 'group.groupName',
			sortable: true,
			wrap:true,
            cell : (row)=>{
				return row.group ? row.group.groupName: ''
			},
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
			name: 'Turno',
			selector: 'turn',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Documento',
			selector: 'student.document',
			sortable: true,
			wrap:true,
			omit:true
		},
		{
			name: 'Matrícula',
			selector: 'student.registrationNumber',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Nombres',
			selector: 'student.firstName',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Apellidos',
			selector: 'student.lastName',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Email',
			selector: 'student.email',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Periodo',
			selector: 'period',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Fecha de registro',
			selector: 'createdDate',
			sortable: true,
			cell : (row)=>{
				return moment(row.createdDate).utc().format("YYYY-MM-DD")
			},
			wrap:true,
		},
		// {
		// 	name: '',
        //     button: true,
		// 	width:'40px',
		// 	cell: row => 
        //     <div className="d-flex">
        //         <Button className="btn-link" color="primary" size="sm" onClick={e => 
        //             {
        //                 e.preventDefault(); 
        //                 history.push('/update-inscription',{id:row._id})
        //             }
		// 	    }><Icon icon={pencilFill} width="18" height="18"/></Button>
        //     </div>,
		// },
		{
			name: '',
			button: true,
			width:'40px',
			omit: (user && user.su == true) ? false : true,
            cell: row => {
                return(<>
                    <Button className="btn-link" title="Eliminar" color="primary" size="sm" onClick={e => {
						e.preventDefault();
						onDismiss();
						setItemRemove(row);
						setModalQuestion(true);
						setModalMsg(`¿Seguro que desea eliminar la inscripción de ${row.student.email}?`);
					}}>
                        <Icon icon={deleteBin6Fill} color="#FF3636" width="18" height="18"/>
                    </Button>
                </>)
            },
		},
	];

	const [perPage, setPerPage] = useState(10);
	const [perPageSelect, setPerPageSelect] = useState(0);
	const [direction, setDirection] = useState({});

	const [filters, setFilters] = useState('');

	//data inicial
	const getDataTable = (page) => {
		dispatch(inscriptionActions.dataTable(page, perPageSelect == 0 ? perPage : perPageSelect, direction, {}));
	}
	
	//Paginar
	const handlePageChange = async (page) => {
		dispatch(inscriptionActions.dataTable(page, perPageSelect == 0 ? perPage : perPageSelect, direction, filters ? filters: {}));
	};
	
	//Ordenar
	const handleSort = (column, sortDirection) => {
		let sort = {"id": column.selector, "desc": (sortDirection == "asc" ? false : true) }
		setDirection(sort);
		dispatch(inscriptionActions.dataTable(1, perPageSelect == 0 ? perPage : perPageSelect, sort, filters ? filters: {}));
	};

	//Cambiar cantidad de filas
	const handlePerRowsChange = async (newPerPage, page) => {
		setPerPageSelect(newPerPage);
		dispatch(inscriptionActions.dataTable(page, newPerPage, direction, filters ? filters: {}));
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

	const handleChangePeriodDate = (date) => {
		setPeriod(date);
	}

	const [registerDate, setRegisterDate] = useState('');
	const [period, setPeriod] = useState('');
	const clearFilters = () =>{
		setRegisterDate('');
		setPeriod(''); 
        reset();
        reset({document:'', fistName:'', lastName:'',  email:'', registerDate:''})
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
		var validDate =  moment(data.registerDate).isValid();

		if(data.registerDate != "" && !validDate){
			setModalWarning(true);
			setModalMsg('Ingrese una fecha válida');
			return;
		}
		setFilters(data);
		dispatch(inscriptionActions.dataTable(1, perPageSelect == 0 ? perPage : perPageSelect, direction, data))
	}
	
	//Data al expandir una fila
	const ExpandedComponent = ({ data }) => (
		<>
			<div  style={{height:'300px', overflowY:'scroll', overflowX:'hidden'}}>
				<Table>
					<thead>
						<tr>
							<th>Cuatrimestre</th>			
							<th>Materia</th>
							<th>Código</th>
						</tr>
					</thead>
					<tbody>
					{ data.matters && data.matters.map((matter, index) => {
						return (
							<tr key={index}>
								<td>{matter.quarter}</td>
								<td>{matter.name}</td>
								<td>{matter.code}</td>
							</tr>
							)
						})
					}
					</tbody>
				</Table>
			</div>
			<hr />
		</>
	);
	//obtener data de usuario necesaria
	const getUserData = () => {
		let data = {
			id: user.id,
			role: user.role,
			su: user.su
		}
		return data;
	}

    const [modalQuestion, setModalQuestion] = useState(false);
	const [itemRemove, setItemRemove] = useState(null); 

	useEffect(() => {
		if(!modalQuestion){
			setItemRemove(null);
		}
	},[modalQuestion]);

	//State de eliminacion de la oferta
    const deletingInscription = useSelector(state => state.inscription.deleting);

    //Eliminar inscripcion
    const onRemoveData = () => {
		let id = itemRemove._id;
        dispatch(inscriptionActions.removeInscription(id, getUserData()));
	}
	
	const successDeleted = useSelector(state => state.inscription.successDeleted);

	//Si el registro fue eliminado correctamente se cierra el modal
	//y se coloca nulo la fila o item seleccionado
	useEffect(() => {
		if(successDeleted){
			setModalQuestion(false);
			setItemRemove(null);
			//filtrar en dado caso
			handleSubmit(onFilterData)();
		}
	},[successDeleted]);

	const failDeleted = useSelector(state => state.inscription.error);
	useEffect(() => {
		if(failDeleted){
			setModalQuestion(false);
		}
	},[failDeleted]);

    return (
        <>
            <div className="d-flex" id="wrapper">
				<SideBar/>
				<div id="page-content-wrapper">
					<AdminNavbar/>
					<div className="flex-column flex-md-row p-3">
						<div className="d-flex justify-content-between" style={{padding:"4px 16px 4px 24px"}}>
							<div className="align-self-center">
								<h3 style={{ marginBottom: '0' }}>Registro de inscripciones</h3>
							</div>
							<Button id="add" onClick={()=> history.push('/register-inscription') } className="btn-round btn-icon" color="info">
								<i className="fa fa-plus" />
							</Button>
							<UncontrolledTooltip placement="bottom" target="add" delay={0}>
								Registrar inscripción
							</UncontrolledTooltip>
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
										{getting && <span className="spinner-border spinner-border-sm mr-1"></span>}
										<select className='form-control' name="agency"
											ref={register}>
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
											ref={register}
										></input>
									</FormGroup>
                                    <FormGroup className="mr-3">
										<input
											className="form-control"
											name="firstName"
											placeholder="Nombres"
											type="text"
											ref={register}
										></input>
									</FormGroup>
                                    <FormGroup className="mr-3">
										<input
											className="form-control"
											name="lastName"
											placeholder="Apellidos"
											type="text"
											ref={register}
										></input>
									</FormGroup>
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
											name="period"
											placeholder="Periodo"
											type="text"
											ref={register}
										></input>
									</FormGroup>
									<FormGroup className="mr-3">
										<Datetime timeFormat={false} dateFormat={'YYYY-MM-DD'} closeOnSelect onChange={handleChangeRegisterDate} value={registerDate}
											renderInput={(props) => {
												return <input {...props} className="form-control dateFilter" readOnly name="registerDate" 
												placeholder="Fecha de registro"  ref={register} value={(registerDate) ? props.value : ''} />
											}}
										/>
									</FormGroup>
									<Button color="primary" type="submit" className="btn-round" disabled={loadingPage}>
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
								expandableRows
								expandableRowsComponent={<ExpandedComponent />}
								responsive
								highlightOnHover
								striped
								sortIcon={ <i className="fa fa-arrow-down ml-2" aria-hidden="true"></i> }
								title="Profesores"
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
                                Inscripciones
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
						{/* Modal warning */}
                        <Modal toggle={() => {setModalQuestion(false);; setModalMsg('')}} isOpen={modalQuestion} backdrop="static">
                            <div className="modal-header">
                                <h5 className="modal-title">Inscripción</h5>
                                <button aria-label="Close" className="close" type="button" disabled={deletingInscription} onClick={() =>  {setModalQuestion(false); setModalMsg('')}}>
                                    <span aria-hidden={true}>×</span>
                                </button>
                            </div>
                            <div className="modal-body">
								<p>{modalMsg}</p>
								<p>Esta opción eliminará el registro de notas y referencias</p>
                            </div>
                            <div className="modal-footer">
                                <Button color="primary" className="btn-round" disabled={deletingInscription} onClick={onRemoveData}>
                                    {deletingInscription && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                    Confirmar
                                </Button>
                                <Button color="secondary" className="btn-round" outline type="button" onClick={() => {setModalQuestion(false); setModalMsg('')}} disabled={deletingInscription}>
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

export default InscriptionListPage;