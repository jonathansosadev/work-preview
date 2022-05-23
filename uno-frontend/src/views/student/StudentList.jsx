/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { studentActions, agencyActions } from '../../actions';
import moment from 'moment';
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import DataTable from 'react-data-table-component';
import { Button, Spinner, Row, Col, Form, FormGroup, Modal, UncontrolledTooltip } from 'reactstrap';
import { history } from '../../helpers';
import '../../assets/css/table.css';
import { useForm  } from "react-hook-form";
import Datetime from 'react-datetime';
import { Icon } from '@iconify/react';
import checkFill from '@iconify-icons/ri/check-fill';
import closeFill from '@iconify-icons/ri/close-fill';
import folderOpenFill from '@iconify-icons/ri/folder-open-fill';
import image2Fill from '@iconify-icons/ri/image-2-fill';
import { apiUrl } from '../../config/config';
import pencilFill from '@iconify-icons/ri/pencil-fill';
const download = require("downloadjs");
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import more2Fill  from '@iconify-icons/ri/more-2-fill';
import billLine from '@iconify-icons/ri/bill-line';

function StudentListPage() {

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

	const dataStudents = useSelector(state => state.students.data);
    const loadingPage = useSelector(state => state.students.loading);

	//Verificar data de redux
	useEffect(() => {
		if(dataStudents && dataStudents.results){
			setData(dataStudents.results);
        }
        if(dataStudents && dataStudents.metadata && dataStudents.metadata[0]){
			setRowCount(dataStudents.metadata[0].total);
		}
    },[dataStudents]);

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
			name: 'Estatus',
			selector: 'status',
			sortable: true,
			cell : (row)=>{
				return (row.status == 1 ? 'Activo':'Bloqueado')
			},
		},
		{
			name: 'Matrícula',
			selector: 'registrationNumber',
			sortable: true,
			wrap:true,
		},
        {
			name: 'CURP',
			selector: 'document',
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
			name: 'Fecha de registro',
			selector: 'createdDate',
			sortable: true,
			cell : (row)=>{
				return moment(row.createdDate).local().format("YYYY-MM-DD")
			},
		},
		// {
		// 	name: '',
        //     button: true,
		// 	width:'40px',
		// 	cell: row => 
        //     <div className="d-flex">
		// 		{row.image && 
		// 			<Button className="btn-link" color="primary" size="sm" style={{margin:0}} onClick={e => 
		// 				{
		// 					e.preventDefault();
		// 					setRowUser(row);
		// 					setModalImage(true);
		// 				}
		// 			}><Icon icon={image2Fill} width="18" height="18"/></Button>
		// 		}
        //     </div>,
		// },
		// {
		// 	name: '',
        //     button: true,
		// 	width:'40px',
		// 	cell: row => 
        //     <div className="d-flex">
		// 		<Button className="btn-link" color="primary" size="sm" id={"Tooltip-" + row._id} onClick={e => 
        //             {
        //                 e.preventDefault(); 
        //                 history.push('/upload-document',{student : row})//subir documento
        //             }
		// 	    }><Icon icon={folderOpenFill} width="18" height="18"/></Button>
        //     </div>,
		// },
		// {
		// 	name: '',
        //     button: true,
		// 	width:'40px',
		// 	cell: row => 
        //     <Button className="btn-link" color="primary" size="sm" onClick={e => 
		// 		{
		// 			e.preventDefault(); 
		// 			history.push('/student-update',{id:row._id})
		// 		}
		// 	}><Icon icon={pencilFill} width="18" height="18"/></Button>,
		// },
		{
			name: '',
            button: true,
			width:'100px',
			cell: row => 
            <div className="d-flex">
				<UncontrolledDropdown>
					<DropdownToggle
						aria-haspopup={true}
						caret
						color="default"
						data-toggle="dropdown"
						href="#"
						id="navbarDropdownMenuLink"
						nav
						onClick={e => e.preventDefault()}
					>
						<Icon icon={more2Fill} width="18" height="18"/>
					</DropdownToggle>
					<DropdownMenu aria-labelledby="navbarDropdownMenuLink" className="dropdown-menu-right dropdown-options">
						{row.image && 
							<DropdownItem onClick={e => 
								{
									e.preventDefault();
									setRowUser(row);
									setModalImage(true);
								}
							}><Icon icon={image2Fill} width="16" height="16" color="#5a0c0d" style={{marginRight:5}}/>Imagen</DropdownItem>
						}
						<DropdownItem onClick={e => 
							{
								e.preventDefault(); 
								history.push('/student-update',{id:row._id})
							}
						}><Icon icon={pencilFill} width="16" height="16" color="#5a0c0d" style={{marginRight:5}}/>Editar</DropdownItem>
						<DropdownItem onClick={e => 
							{
								e.preventDefault(); 
								history.push('/upload-document',{student : row})//subir documento
							}
						}><Icon icon={folderOpenFill} width="16" height="16" color="#5a0c0d" style={{marginRight:5}}/>Subir documentos</DropdownItem>
						<DropdownItem onClick={e => 
							{
								e.preventDefault(); 
								history.push('/constancy',{student : row})//constancia
							}
						}><Icon icon={billLine} width="16" height="16" color="#5a0c0d" style={{marginRight:5}}/>Constancia</DropdownItem>
						<DropdownItem onClick={e => 
							{
								e.preventDefault(); 
								history.push('/report-score-request',{student : row})//Boleta de Calificaciones
							}
						}><Icon icon={billLine} width="16" height="16" color="#5a0c0d" style={{marginRight:5}}/>Boleta de Calificaciones</DropdownItem>
					</DropdownMenu>
				</UncontrolledDropdown>
            </div>,
		},
	];

	//Modal genérico y mensaje
	const [modalWarning, setModalWarning] = useState(false);
	const [modalMsg, setModalMsg] = useState('');

	const [perPage, setPerPage] = useState(10);
	const [perPageSelect, setPerPageSelect] = useState(0);
	const [direction, setDirection] = useState({});

    const [filters, setFilters] = useState('');

	//data inicial
	const getDataTable = (page) => {
		dispatch(studentActions.dataTable(page, perPageSelect == 0 ? perPage : perPageSelect, direction, {}));
	}
	
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
        reset();
        reset({document:'', fistName:'', lastName:'',  email:'', registerDate:''})
	}

    //Form Data Filter
	const { handleSubmit, register, reset } = useForm();
    
    //Abrir/Cerrar filtros
	const [isOpen, setIsOpen] = useState(false);
	const toggle = () => setIsOpen(!isOpen);

    //Consultar por filtros
	const onFilterData = (data, e) => {
		var validDate =  moment(data.registerDate).isValid();

		if(data.registerDate != "" && !validDate){
			setModalWarning(true);
			setModalMsg('Ingrese una fecha válida');
			return;
		}
		setFilters(data);
        dispatch(studentActions.dataTable(1, perPageSelect == 0 ? perPage : perPageSelect, direction, data));
    }

	//============================================//

	/**
	 * Imagen
	 */
	const [modalImage, setModalImage] = useState(false);
	const [rowUser, setRowUser] = useState(null);

	const downloadImage = () =>{
		if(rowUser && rowUser.image){
			download(`${apiUrl}/image/${rowUser.image}`);
		}
	}

    return (
        <>
            <div className="d-flex" id="wrapper">
				<SideBar/>
				<div id="page-content-wrapper">
					<AdminNavbar/>
					<div className="flex-column flex-md-row p-3">
						<div className="d-flex justify-content-between" style={{padding:"4px 16px 4px 24px"}}>
							<div className="align-self-center">
								<h3 style={{ marginBottom: '0' }}>Estudiantes</h3>
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
										<select className='form-control' name="status"
											ref={register}>
												<option key="" name="" value="">Seleccione estatus</option>										
												<option key="1" name="1" value="1">Activo</option>
												<option key="2" name="2" value="2">Bloqueado</option>
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
											name="document"
											placeholder="CURP"
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
										<Datetime timeFormat={false} dateFormat={'YYYY-MM-DD'} closeOnSelect onChange={handleChangeRegisterDate} value={registerDate}
											renderInput={(props) => {
												return <input {...props} className="form-control dateFilter" readOnly name="registerDate" 
												placeholder="Fecha de registro"  ref={register} value={(registerDate) ? props.value : ''} />
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
								className="dataTables_wrapper dataTables_options"
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

						<Modal toggle={() => {setModalWarning(false); setModalMsg('')}} isOpen={modalWarning}>
                            <div className="modal-header">
                            <h5 className="modal-title" id="examplemodalMsgLabel">
                                Estudiantes
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
                                onClick={() =>  {setModalWarning(false);}}
                            >
                                Cerrar
                            </Button>
                            </div>
                        </Modal>
						<Modal toggle={() => {setModalImage(false);setRowUser(null)}} isOpen={modalImage}>
                            <div className="modal-header">
                            <h5 className="modal-title" id="examplemodalMsgLabel">
                                Foto de perfil
                            </h5>
                            <button
                                aria-label="Close"
                                className="close"
                                type="button"
                                onClick={() =>  {setModalImage(false);setRowUser(null)}}
                            >
                                <span aria-hidden={true}>×</span>
                            </button>
                            </div>
                            <div className="modal-body">
								<div className="container text-center p-3">

									{
										(rowUser && rowUser.image) && 
										<img src={`${apiUrl}/image/${rowUser.image}`} alt="..." 
											style={{
												width: 120,
												height: 120,
												borderRadius:'50%',
												boxShadow:'0 10px 25px 0 rgba(0,0,0,.3)'
											}}
										/>
									}
								</div>
                            </div>
                            <div className="modal-footer">
							<Button
								color="primary"
								className="btn-round"
                                type="button"
                                onClick={downloadImage}
                            >
                                Descargar
                            </Button>
                            <Button
								color="secondary"
								className="btn-round" outline
                                type="button"
                                onClick={() =>  {setModalImage(false);setRowUser(null)}}
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

export default StudentListPage;