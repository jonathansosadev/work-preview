/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { groupActions, agencyActions, careerActions } from '../../actions';
import moment from 'moment';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import DataTable from 'react-data-table-component';
import { Button, Spinner, Row, Col, UncontrolledTooltip, Form, FormGroup, Modal, Alert   } from 'reactstrap';
//componente dataTable sede
import { history } from '../../helpers';
import '../../assets/css/table.css';
import { useForm  } from "react-hook-form";
import Datetime from 'react-datetime';
import { Icon } from '@iconify/react';
import deleteBin6Fill from '@iconify-icons/ri/delete-bin-6-fill';   

function GroupListPage() {

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
			setModalVisible(false); setDataRow(null);
			setVisible(true); 
			window.setTimeout(()=>{setVisible(false)},5000);   
		}
	},[alert]);
   
	//usuario
    const user = useSelector(state => state.authentication.user);
    const dispatch = useDispatch();

	const dataGroups = useSelector(state => state.group.data);
    const loadingPage = useSelector(state => state.group.loading);

	//Verificar data de redux
	useEffect(() => {
		if(dataGroups && dataGroups.results){
			setData(dataGroups.results);
        }
        if(dataGroups && dataGroups.metadata && dataGroups.metadata[0]){
			setRowCount(dataGroups.metadata[0].total);
		}
	},[dataGroups]);


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

	// Inicializar tabla sin data
	const [data, setData] = useState([])
	const [rowCount, setRowCount] = useState(0)

	//Columnas Data table
	const columns = [
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
		dispatch(groupActions.dataTable(page, perPageSelect == 0 ? perPage : perPageSelect, direction, {}));
	}
	
	//Paginar
	const handlePageChange = async (page) => {
		dispatch(groupActions.dataTable(page, perPageSelect == 0 ? perPage : perPageSelect, direction, filters ? filters: {}));
	};
	
	//Ordenar
	const handleSort = (column, sortDirection) => {
		let sort = {"id": column.selector, "desc": (sortDirection == "asc" ? false : true) }
		setDirection(sort);
		dispatch(groupActions.dataTable(1, perPageSelect == 0 ? perPage : perPageSelect, sort, filters ? filters: {}));
	};

	//Cambiar cantidad de filas
	const handlePerRowsChange = async (newPerPage, page) => {
		setPerPageSelect(newPerPage);
		dispatch(groupActions.dataTable(page, newPerPage, direction, filters ? filters: {}));
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
        reset({career:'', agency:'', turn:'',  type:'', registerDate:''});
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
		dispatch(groupActions.dataTable(1, perPageSelect == 0 ? perPage : perPageSelect, direction, data))
    }

	const [modalVisible, setModalVisible] = useState(false);
	const deleting = useSelector(state => state.group.deleting);
	const deleteSuccess = useSelector(state => state.group.deleted);
	const [dataRow, setDataRow] = useState(null);
	useEffect(() => {
		//si se elimino correctamente cerrar modal y consultar informacion nuevamente
        if(deleteSuccess){
			setModalVisible(false);
			setDataRow(null);
			handleSubmit(onFilterData)();
        }
		
    },[deleteSuccess]);

	//Eliminar grupo de base de datos
	const removeGroup = () =>{
		dispatch(groupActions.deleteGroup( dataRow._id ));
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
								<h3 style={{ marginBottom: '0' }}>Grupos</h3>
							</div>
							<Button id="add" onClick={()=> history.push('/register-group') } className="btn-round btn-icon" color="info">
								<i className="fa fa-plus" />
							</Button>
							<UncontrolledTooltip placement="bottom" target="add" delay={0}>
								Agregar grupo
							</UncontrolledTooltip>
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
										{gettingCareers && <span className="spinner-border spinner-border-sm mr-1"></span>}
										<select className='form-control' name="career" ref={register}>
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
										<select className='form-control' name="turn" ref={register}>
											<option key="0" name="" value="">Seleccione turno</option>
											<option key="1" name="Matutino" value="1">Matutino</option>
											<option key="2" name="Vespertino" value="2">Vespertino</option>
											<option key="3" name="Sabatino" value="3">Sabatino</option>
										</select>
									</FormGroup>
									<FormGroup className="mr-3">
										<select className='form-control' name="type" ref={register}>
											<option key="0" name="" value="">Seleccione grado</option>
											<option key="2" name="2" value="2">Licenciatura</option>
											<option key="3" name="3" value="3">Maestría</option>
											<option key="4" name="4" value="4">Doctorado</option>
											<option key="5" name="5" value="5">Nivelación</option>
										</select>
									</FormGroup>
									<FormGroup className="mr-3">
										<Datetime timeFormat={false} dateFormat={'YYYY-MM-DD'} closeOnSelect onChange={handleChangeRegisterDate} value={registerDate}
											renderInput={(props) => {
												return <input {...props} className="form-control dateFilter" readOnly name="registerDate" 
												placeholder="Fecha de registro"  ref={register} value={(registerDate) ? props.value : ''} />
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
							<Col>
							<DataTable
								className="dataTables_wrapper"
								responsive
								highlightOnHover
								striped
								sortIcon={ <i className="fa fa-arrow-down ml-2" aria-hidden="true"></i> }
								title="Grupos"
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
                                Grupos
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
                                ¿Confirmar eliminación de grupo?
                            </div>
                            <div className="modal-footer">
                                <Button color="primary" className="btn-round" disabled={deleting} onClick={()=>removeGroup()}>
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

export default GroupListPage;