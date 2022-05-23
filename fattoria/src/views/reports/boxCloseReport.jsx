/* eslint-disable */
import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { boxActions, userActions } from '../../actions';
import moment from 'moment';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import DataTable from 'react-data-table-component';
import { Button, Row, Col, ListGroup, ListGroupItem, ListGroupItemText, Modal, Form, FormGroup, ListGroupItemHeading } from 'reactstrap';
//componente dataTable
import '../../assets/css/table.css';
import NumberFormat from 'react-number-format';
import { CSVLink } from "react-csv";
import '../../assets/css/filters.css';
import Datetime from 'react-datetime';
import 'moment/locale/es';
import { useForm  } from "react-hook-form";
import { Icon } from '@iconify/react';
import fileDownload from '@iconify/icons-fa-solid/file-download';
import checkIcon from '@iconify/icons-fa-solid/check';
import timesIcon from '@iconify/icons-fa-solid/times';

function BoxCloseReportPage() {

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

	const dataBoxes = useSelector(state => state.box.data);
    const loadingPage = useSelector(state => state.box.loading);

	// Inicializar tabla sin data
	const [data, setData] = useState([]);

	//Verificar data de redux
	useEffect(() => {
		if(dataBoxes && dataBoxes.results){
            setData(dataBoxes.results);
            console.log(dataBoxes.results);
		}
		if(dataBoxes && dataBoxes.metadata && dataBoxes.metadata[0]){
			setRowCount(dataBoxes.metadata[0].total);
		}
  	},[dataBoxes]);
    
	const [rowCount, setRowCount] = useState(0);
	//Columnas Data table
	const columns = [
		{
			name: 'Sucursal',
			selector: 'agency.name',
            sortable: true,
            wrap:true
		},
		{
			name: 'Usuario',
			selector: 'user.username',
			sortable: true,
			wrap:true,
			cell : (row)=>{
				return  row.user && row.user.username ?  row.user.username: ''
			},
        },
        {
			name: 'Divisa',
			selector: 'coinDescription',
			sortable: true,
        },
        {
			name: 'Inicial',
			selector: 'initial',
			sortable: true,
			cell : (row)=>{
				return  <NumberFormat value={row.initial?row.initial.toFixed(2):row.initial} displayType={'text'} thousandSeparator={','} decimalSeparator={'.'}  />
			},
        },
        {
			name: 'Ingresos',
			selector: 'in',
			sortable: true,
			cell : (row)=>{
				return  <NumberFormat value={row.in?row.in.toFixed(2):row.in} displayType={'text'} thousandSeparator={','} decimalSeparator={'.'}  />
			},
        },
        {
			name: 'Egresos',
			selector: 'out',
			sortable: true,
			cell : (row)=>{
				return  <NumberFormat value={row.out?row.out.toFixed(2):row.out} displayType={'text'} thousandSeparator={','} decimalSeparator={'.'}  />
			},
        },
        {
			name: 'Saldo Final',
			selector: 'total',
			sortable: true,
			cell : (row)=>{
				return  <NumberFormat value={row.total?row.total.toFixed(2):row.total} displayType={'text'} thousandSeparator={','} decimalSeparator={'.'}  />
			},
        },
        {
			name: 'Confirmación de saldo',
			selector: 'inUser',
			sortable: true,
			cell : (row)=>{
				return  <NumberFormat value={row.inUser?row.inUser.toFixed(2):row.inUser} displayType={'text'} thousandSeparator={','} decimalSeparator={'.'}  />
			},
        },
        {
			name: 'Válido',
			selector: 'checked',
			sortable: true,
			cell : (row)=>{
				if(row.checked){
                    return <Icon icon={checkIcon} color="green" />
                }else{
                    return <Icon icon={timesIcon} color="red"/>
                }
			},
		},
		{
			name: 'Fecha',
			selector: 'createdDate',
			sortable: true,
			cell : (row)=>{
				return moment(row.createdDate).utc().format("YYYY-MM-DD")
			},
		},
	];

	//obtener data de usuario necesaria
	const getUserData = () => {
		return {
            agency: user.agency.id,
            role:user.role,
            id: user.id,
            manager: true,
		}
	}

	//Filas por default
	const [perPage] = useState(10);
	//Cantidad de filas seleccionadas
	const [perPageSelect, setPerPageSelect] = useState(0);
	//Direccion del ordenamiento y columna
	const [direction, setDirection] = useState({ "id":"date", "desc":true  });

	const getDataTable = (page) => {
		dispatch(boxActions.boxCloseTable(getUserData(), page, perPageSelect == 0 ? perPage : perPageSelect, direction, {}, false));
	}

	//Paginar
	const handlePageChange = async (page) => {
		dispatch(boxActions.boxCloseTable(getUserData(), page, perPageSelect == 0 ? perPage : perPageSelect, direction, filters ? filters: {}, false));
	};
	
	//Ordenar
	const handleSort = (column, sortDirection) => {
		let sort = {"id": column.selector, "desc": (sortDirection == "asc" ? false : true) }
		setDirection(sort);
		dispatch(boxActions.boxCloseTable(getUserData(), 1, perPageSelect == 0 ? perPage : perPageSelect, sort, filters ? filters: {}, false));
	};

	//Cambiar cantidad de filas
	const handlePerRowsChange = async (newPerPage, page) => {
		setPerPageSelect(newPerPage);
		dispatch(boxActions.boxCloseTable(getUserData(), page, newPerPage, direction, filters ? filters: {}, false));
    };

	//Consultar al entrar
	useEffect(() => {
		getDataTable();
	}, []);

	//Opciones de paginacion
	const paginationOptions = { rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' };

	//Loader de la tabla
	const CustomLoader = () => (<><div className="loading-table"></div></>);

	//Header datatable excel
    const headers = [
        { label: "Fecha", key: "createdDate" },
		{ label: "Sucursal", key: "agency.name" },
        { label: "Usuario", key: "user.username" },
        { label: "Divisa", key: "coinDescription" },
        { label: "Inicial", key: "initial" },
        { label: "Ingresos", key: "in" },
        { label: "Egresos", key: "out" },
		{ label: "Saldo final", key: "total" },
		{ label: "Confirmacion", key: "inUser" },
		{ label: "Valido", key: "checked" }
	];

	//Form Data Filter
	const { handleSubmit, register, reset } = useForm();

	//Abrir/Cerrar filtros
	const [isOpen, setIsOpen] = useState(false);
	const toggle = () => setIsOpen(!isOpen);

	//obtener sucursales para select
	const getting = useSelector(state => state.users.getting);
	const users = useSelector(state => state.users);

	useEffect(() => {
		dispatch(userActions.getListUserAgencies(getUserData()));
	},[]);

	const [listAgencies, setListAgencies] = useState(null);
	const [listUsers, setListUsers] = useState(null);
	
	useEffect(() => {
		if(users.obtained){
			setListUsers(users.list.users);
			setListAgencies(users.list.agencies);
		}
	},[users.obtained]);

	const [filters, setFilters] = useState('');

	const handleChangeStartDate = (date) => {
		setStartDate(date);
	}

	const handleChangeEndDate = (date) => {
		setEndDate(date);
	}

	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');

	const clearFilters = () =>{
		setStartDate(''); 
		setEndDate(''); 
		reset({agency:'', startDate:'', endDate:''})
	}

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

		var a = moment(data.startDate);
		var b = moment(data.endDate);
		let dateDiff = b.diff(a, 'days');

		//Si el rango de fechas es superior a los seis días abrir modal
		if ( dateDiff > 6 ){
			setModalWarning(true);
            setModalMsg('El rango de fechas no puede superar los 6 días');
			return;
		}

		setFilters(data);
		dispatch(boxActions.boxCloseTable(getUserData(), 1, perPageSelect == 0 ? perPage : perPageSelect, direction, data, false));
	}

	/*** Exportar ***/
	const refExcel = useRef(null);

	const exportExcel = () => {
		//El mismo método, el ultimo parametro define si es para descarga
		dispatch(boxActions.boxCloseTable(getUserData(), 1, perPageSelect == 0 ? perPage : perPageSelect, direction, filters, true));
	}

	const excel = useSelector(state => state.download.excel);
    const loadingExcel = useSelector(state => state.download.loading);

	// Inicializar data de excel
	const [dataExcel, setDataExcel] = useState([]);

	//Verificar data de redux de la data de excel
	useEffect(() => {
		if(excel && excel.results){
			setDataExcel(excel.results);
		}
	},[excel]);

	useEffect(() => {
		if (dataExcel && dataExcel.length > 0 && refExcel && refExcel.current && refExcel.current.link) {
			setTimeout(() => {
				refExcel.current.link.click();
				setDataExcel([]);
			});
		}
	},[dataExcel]);
	
	/*** Exportar ***/

    return (
        <>
            <div className="d-flex" id="wrapper">
				<SideBar/>
				<div id="page-content-wrapper">
					<AdminNavbar/>
					<div className="flex-column flex-md-row p-3">

						<div className="d-flex justify-content-between" style={{padding:"4px 16px 4px 24px"}}>
							<div className="align-self-center">
								<h3 style={{ fontWeight:'bold',fontStyle: 'italic',  marginBottom: '0'}}>Reporte de cierre de caja</h3>
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
                                    {(user.role == 1 || user.role == 2) && <FormGroup className="mr-3">
                                            {getting && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                            <select className='form-control' name="agency"
                                                ref={register}>
                                                    <option key="" name="" value="">Seleccione sucursal</option>
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
                                    }
                                    {(user.role == 1 || user.role == 2) &&<FormGroup className="mr-3">
                                        {getting && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                        <select className='form-control' name="idUser"
                                            ref={register}>
                                                <option key="" name="" value="">Seleccione usuario</option>
                                                {listUsers && listUsers.map(list => 
                                                    <option
                                                        key={list.id}
                                                        name={list.id}
                                                        value={list.id}>
                                                        {`${list.username}`}
                                                    </option>
                                                )}
                                        </select>
                                    </FormGroup>
									}
									<FormGroup className="mr-3">
										<Datetime timeFormat={false} dateFormat={'YYYY-MM-DD'} closeOnSelect onChange={handleChangeStartDate} value={startDate}
											inputProps={{  name: 'startDate', ref:register, placeholder: "Fecha inicial", autoComplete:"off" }} 
										/>
									</FormGroup>
									<FormGroup className="mr-3">
										<Datetime timeFormat={false} dateFormat={'YYYY-MM-DD'} closeOnSelect onChange={handleChangeEndDate} value={endDate}
											inputProps={{ name: 'endDate', ref:register, placeholder: "Fecha final", autoComplete:"off" }}
										/>
									</FormGroup>
									<Button color="primary" type="submit" disabled={loadingPage}>
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
								striped
								highlightOnHover
								sortIcon={ <i className="fa fa-arrow-down ml-2" aria-hidden="true"></i> }
								title="Ventas"
								progressPending={loadingPage}
								paginationComponentOptions={paginationOptions}
								progressComponent={<CustomLoader />}
								noDataComponent="No hay registros para mostrar"
								noHeader={true}
								columns={columns}
								data={data}
								pagination
								paginationServer
								paginationTotalRows={rowCount}
								onSort={handleSort}
								sortServer
								onChangeRowsPerPage={handlePerRowsChange}
								onChangePage={handlePageChange}
								persistTableHead
							/>
							</Col>
						</Row>
                        {data && data.length > 0 && <>
							<Button className="btn" color="primary" onClick={()=>exportExcel()} disabled={loadingExcel || loadingPage}> 
								<Icon icon={fileDownload} /> Exportar {loadingExcel && <span className="spinner-border spinner-border-sm mr-1"></span>}
							</Button>
							{ 
								dataExcel.length>0 && <>
									<CSVLink ref={refExcel} data={dataExcel} separator={";"} headers={headers} filename={"reporteDeCierres.csv"}  style={{display:'none'}}>
										Exportar
									</CSVLink>
								</>
							}
							</>	
						}
						<Modal toggle={() => {setModalWarning(false); setModalMsg('')}} isOpen={modalWarning}>
                            <div className="modal-header">
                            <h5 className="modal-title" id="examplemodalMsgLabel">
                                Ventas
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

export default BoxCloseReportPage;