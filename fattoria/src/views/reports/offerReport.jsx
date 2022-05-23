/* eslint-disable */
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { offerActions, userActions } from '../../actions';
import moment from 'moment';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import DataTable from 'react-data-table-component';
import { Button, Spinner, Row, Col, Table, Form, FormGroup, Modal } from 'reactstrap';
import { history } from '../../helpers';
import '../../assets/css/table.css';
import NumberFormat from 'react-number-format';
import { useForm  } from "react-hook-form";
import Datetime from 'react-datetime';

function OfferReportPage() {

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

	const dataOffers = useSelector(state => state.offer.data);
    const loadingPage = useSelector(state => state.offer.loading);

	//Verificar data de redux
	useEffect(() => {
        if(dataOffers && dataOffers.results){
			setData(dataOffers.results);
		}
		if(dataOffers && dataOffers.metadata && dataOffers.metadata[0]){
			setRowCount(dataOffers.metadata[0].total);
		}
  	},[dataOffers]);
    
    const [rowCount, setRowCount] = useState(0);

	// Inicializar tabla sin data
	const [data, setData] = useState([])

	//Columnas Data table
	const columns = [
		{
			name: 'Sucursal',
			selector: 'agency.name',
			sortable: true,
			wrap:true,
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
			name: 'Cod. Producto',
			selector: 'product.code',
			sortable: true,
		},
		{
			name: 'Producto',
			selector: 'product.name',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Precio regular',
			selector: 'regularPrice',
			sortable:true,
			cell : (row)=>{
				return <NumberFormat value={row.regularPrice} displayType={'text'} thousandSeparator={','} decimalSeparator={'.'}/>
			},
		},
		{
			name: 'Precio oferta',
			selector: 'price',
			sortable:true,
			cell : (row)=>{
				return <NumberFormat value={row.price} displayType={'text'} thousandSeparator={','} decimalSeparator={'.'}/>
			},
        },
        {
			name: 'Comentario',
			selector: 'comment',
            sortable: true,
            wrap:true,
		},
		{
			name: 'Fecha de registro',
			selector: 'createdDate',
			sortable: true,
			cell : (row)=>{
				return moment(row.createdDate).utc().format("YYYY-MM-DD hh:mm:ss a")
			},
		},
		{
			name: 'Fecha Final',
			selector: 'endDate',
			sortable: true,
			cell : (row)=>{
				if(row.endDate){
					return moment(row.endDate).utc().format("YYYY-MM-DD hh:mm:ss a")
				}else{
					return ""
				}
			},
		},
    ];

	//Consultar al entrar
	useEffect(() => {
		getDataTable();
	}, []);


	//Opciones de paginacion
	const paginationOptions = { rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' };

	//Loader de la tabla
	const CustomLoader = () => (<><div className="loading-table"></div></>);

    //obtener data de usuario necesaria
	const getUserData = () => {
		return {
            agency: user.agency.id,
            role:user.role,
            id: user.id,
            admin: true, //consultar usuario admin/supervisor/gerente
		}
	}

	//Filas por default
	const [perPage] = useState(10);
	//Cantidad de filas seleccionadas
	const [perPageSelect, setPerPageSelect] = useState(0);
	//Direccion del ordenamiento y columna
	const [direction, setDirection] = useState({ "id":"createdDate", "desc":true  });

	const getDataTable = (page) => {
		dispatch(offerActions.dataOfferReport(getUserData(), page, perPageSelect == 0 ? perPage : perPageSelect, direction, {}));
	}

	//Paginar
	const handlePageChange = async (page) => {
		dispatch(offerActions.dataOfferReport(getUserData(), page, perPageSelect == 0 ? perPage : perPageSelect, direction, filters ? filters: {}));
	};
	
	//Ordenar
	const handleSort = (column, sortDirection) => {
		let sort = {"id": column.selector, "desc": (sortDirection == "asc" ? false : true) }
		setDirection(sort);
		dispatch(offerActions.dataOfferReport(getUserData(), 1, perPageSelect == 0 ? perPage : perPageSelect, sort, filters ? filters: {}));
	};

	//Cambiar cantidad de filas
	const handlePerRowsChange = async (newPerPage, page) => {
		setPerPageSelect(newPerPage);
		dispatch(offerActions.dataOfferReport(getUserData(), page, newPerPage, direction, filters ? filters: {}));
    };

    
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
		reset({agency:'', startDate:'', endDate:'', names:'', type:'', comment:'', phone:''})
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
		dispatch(offerActions.dataOfferReport(getUserData(), 1, perPageSelect == 0 ? perPage : perPageSelect, direction, data));
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
								<h3 style={{ fontWeight:'bold',fontStyle: 'italic',  marginBottom: '0'}}>Historial de Ofertas</h3>
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
                                    <FormGroup className="mr-3">
                                        {getting && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                        <select className='form-control' name="idUser"
                                            ref={register}>
                                                <option key="" name="" value="">Seleccione usuario</option>
                                                {listUsers && listUsers.map(list => 
                                                    <option
                                                        key={list.id}
                                                        name={list.id}
                                                        value={list.id}>
                                                        {/* {`${list.firstName} ${list.lastName}`} */}
                                                        {`${list.username}`}
                                                    </option>
                                                )}
                                        </select>
                                    </FormGroup>
                                    <FormGroup className="mr-3">
										<input
										style={{minWidth:"181px"}}
											className="form-control"
											placeholder="Cod. producto"
											type="number"
											name="code"
											min="1"
											max="99"
											ref={register}
										></input>
									</FormGroup>
                                    <FormGroup className="mr-3">
										<input
											className="form-control"
											name="comment"
											placeholder="Comentario"
											type="text"
											ref={register}
										></input>
									</FormGroup>
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
								title="Salidas"
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

export default OfferReportPage;