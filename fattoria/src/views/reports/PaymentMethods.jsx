/* eslint-disable */
import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { salesActions, userActions } from '../../actions';
import moment from 'moment';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import DataTable from 'react-data-table-component';
import { Button, Spinner, Row, Col, ListGroup, ListGroupItem, ListGroupItemText, Modal, Table, Form, FormGroup } from 'reactstrap';
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

function PaymentMethodsPage() {

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

	const dataSales = useSelector(state => state.sales.table);
    const loadingPage = useSelector(state => state.sales.loading);

	// Inicializar tabla sin data
	const [data, setData] = useState([]);

	//Verificar data de redux
	useEffect(() => {
		if(dataSales && dataSales.results){
			setData(dataSales.results);
		}
		if(dataSales && dataSales.metadata && dataSales.metadata[0]){
			setRowCount(dataSales.metadata[0].total);
		}
  	},[dataSales]);
    
	const [rowCount, setRowCount] = useState(0);
	//Columnas Data table
	const columns = [
		{
			name: 'Sucursal',
			selector: 'agency.name',
			sortable: true,
		},
		{
			name: 'Monto Total',
			selector: 'totalAmount',
            sortable: true,
            cell : (row)=>{
                return <NumberFormat value={row.totalAmount? row.totalAmount.toFixed(2):row.totalAmount } displayType={'text'} thousandSeparator={true} />
			},
		},
		{
			name: 'Fecha',
			selector: 'date',
			sortable: true,
			cell : (row)=>{
				return moment(row.date).utc().format("YYYY-MM-DD")
			},
		},
	];

	//obtener data de usuario necesaria
	const getUserData = () => {
		return {
            agency: user.agency.id,
            role:user.role,
			id: user.id
		}
	}

	//Filas por default
	const [perPage] = useState(10);
	//Cantidad de filas seleccionadas
	const [perPageSelect, setPerPageSelect] = useState(0);
	//Direccion del ordenamiento y columna
	const [direction, setDirection] = useState({ "id":"date", "desc":true  });

	const getDataTable = (page) => {
		dispatch(salesActions.salesPaymentMethods(getUserData(), page, perPageSelect == 0 ? perPage : perPageSelect, direction, {}, false));
	}

	//Paginar
	const handlePageChange = async (page) => {
		dispatch(salesActions.salesPaymentMethods(getUserData(), page, perPageSelect == 0 ? perPage : perPageSelect, direction, filters ? filters: {}, false));
	};
	
	//Ordenar
	const handleSort = (column, sortDirection) => {
		let sort = {"id": column.selector, "desc": (sortDirection == "asc" ? false : true) }
		setDirection(sort);
		dispatch(salesActions.salesPaymentMethods(getUserData(), 1, perPageSelect == 0 ? perPage : perPageSelect, sort, filters ? filters: {}, false));
	};

	//Cambiar cantidad de filas
	const handlePerRowsChange = async (newPerPage, page) => {
		setPerPageSelect(newPerPage);
		dispatch(salesActions.salesPaymentMethods(getUserData(), page, newPerPage, direction, filters ? filters: {}, false));
    };

	//Consultar al entrar
	useEffect(() => {
		getDataTable();
	}, []);

	//Opciones de paginacion
	const paginationOptions = { rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' };

	//Loader de la tabla
	const CustomLoader = () => (<><div className="loading-table"></div></>);

	//Calcular total general cuando cambie la información
	const [loadingTotal, setLoadingTotal] = useState(false);
	const [general, setGeneral] = useState(0);
	
	useEffect(() => {
		let sumtotal = 0
		if(data && data.length>0){
			setLoadingTotal(true);
			if(dataSales && dataSales.total[0] && dataSales.total[0].totalAmount){
				sumtotal = dataSales.total[0].totalAmount;
			}
		}
		setLoadingTotal(false);
		setGeneral(sumtotal);
	}, [data]);

	//Data al expandir una fila
	const ExpandedComponent = ({ data }) => (
		<ListGroup>
			<ListGroupItem>
                <ListGroupItemText>
					<b>Punto de venta: <NumberFormat value={ data.totalPos.toFixed(2) } displayType={'text'} thousandSeparator={true} /></b>
					{ (data.totalPos && data.totalPos>0) ? <Button className="btn-link" color="primary" onClick={()=>{getDetails(data.date, 5, data.agency)}}>
						Detalle
					</Button>:'' }
				</ListGroupItemText>
				<ListGroupItemText>
					<b>Efectivo Bs: <NumberFormat value={ data.totalVes.toFixed(2) } displayType={'text'} thousandSeparator={true} /></b>
				</ListGroupItemText>
                <ListGroupItemText>
					<b>Dólar: <NumberFormat value={ data.totalDollar.toFixed(2) } displayType={'text'} thousandSeparator={true} /></b>
					{ (data.totalDollar && data.totalDollar>0) ? <Button className="btn-link" color="primary" onClick={()=>{getDetails(data.date, 1, data.agency)}}>
						Detalle
					</Button>:'' }
				</ListGroupItemText>
                <ListGroupItemText>
					<b>Euros: <NumberFormat value={ data.totalEur.toFixed(2) } displayType={'text'} thousandSeparator={true} /></b>
					{ (data.totalEur && data.totalEur>0) ? <Button className="btn-link" color="primary" onClick={()=>{getDetails(data.date, 2, data.agency)}}>
						Detalle
					</Button>:'' }
				</ListGroupItemText>
                <ListGroupItemText>
					<b>Pesos: <NumberFormat value={ data.totalCop.toFixed(2) } displayType={'text'} thousandSeparator={true} /></b>
					{ (data.totalCop && data.totalCop>0) ? <Button className="btn-link" color="primary" onClick={()=>{getDetails(data.date, 3, data.agency)}}>
						Detalle
					</Button>:'' }
				</ListGroupItemText>
                <ListGroupItemText>
					<b>Transferencias: <NumberFormat value={ data.totalTransfer.toFixed(2) } displayType={'text'} thousandSeparator={true} /></b>
					{ (data.totalTransfer && data.totalTransfer>0) ? <Button className="btn-link" color="primary" onClick={()=>{getDetails(data.date, 4, data.agency)}}>
						Detalle
					</Button>:'' }
				</ListGroupItemText>
				<ListGroupItemText>
					<b>Créditos: <NumberFormat value={ data.totalCredit.toFixed(2) } displayType={'text'} thousandSeparator={true} /></b>
					{ (data.totalCredit && data.totalCredit>0) ? <Button className="btn-link" color="primary" onClick={()=>{getDetails(data.date, 6, data.agency)}}>
						Detalle
					</Button>:'' }
				</ListGroupItemText>
			</ListGroupItem>
	  	</ListGroup>
	);

	const [listDetail, setListDetail] = useState([]);
	const [totalDetail, setTotalDetail] = useState(0);
	const [type, setType] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);

	//Consultar detalle de monedas por fecha y tipo de moneda
	const getDetails = (date, type, agency) => {
		let data = {
			date,
			coin:type,
			agency: agency._id
		}
		setType(type);
		dispatch(salesActions.salesDetailPaymentMethods(data));
		//abrir modal
		setModalVisible(true);
	}

	//State de detalle
	const loadingDetail = useSelector(state => state.sales.loadingDetail);
	const saleDetail = useSelector(state => state.sales);

	//Actualizar estado de inventario al cambio de información
	useEffect(() => {
		if(saleDetail.successDetail){
			setTotalDetail(saleDetail.dataDetail.total);
			setListDetail(saleDetail.dataDetail.results);
		}
	},[saleDetail.successDetail]);

	//Header datatable excel
    const headers = [
        { label: "Fecha", key: "date" },
		{ label: "Sucursal", key: "agency.name" },
		{ label: "Monto Total", key: "totalAmount" },
        { label: "Punto de venta", key: "totalPos" },
        { label: "Efectivo Bs", key: "totalVes" },
        { label: "Dólar", key: "totalDollar" },
        { label: "Euros", key: "totalEur" },
        { label: "Pesos", key: "totalCop" },
		{ label: "Transferencias", key: "totalTransfer" }
	];

	//Header transferencias excel
	const headersTransfer = [
        { label: "Fecha", key: "createdDate" },
		{ label: "Sucursal", key: "agency.name" },
		{ label: "Ticket", key: "order" },
		{ label: "Monto", key: "tAmmount" },
        { label: "Banco", key: "tBank" },
        { label: "Referencia", key: "tReference" },
	];

	//Header puntos de venta
	const headersPDV = [
        { label: "Fecha", key: "createdDate" },
		{ label: "Sucursal", key: "agency.name" },
		{ label: "Ticket", key: "order" },
		{ label: "Monto", key: "pAmmount" },
		{ label: "Referencia", key: "pReference" },
		{ label: "Terminal", key: "terminal.code" },
		{ label: "Monto Extra", key: "pAmmountExtra" },
		{ label: "Referencia Extra", key: "pReferenceExtra" },
		{ label: "Terminal Extra", key: "terminalExtra.code" },
		{ label: "Sub Total", key: "subTotal" },
	];

	//limpiar data de modal
	const clearModal = () =>{
		setModalVisible(false); 
		setListDetail([]); 
		setTotalDetail(0); 
		setType(0);
	}

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
	
	useEffect(() => {
		if(users.obtained){
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
		dispatch(salesActions.salesPaymentMethods(getUserData(), 1, perPageSelect == 0 ? perPage : perPageSelect, direction, data, false));
	}


	/*** Exportar ***/
	const refExcel = useRef(null);

	const exportExcel = () => {
		//El mismo método, el ultimo parametro define si es para descarga
		dispatch(salesActions.salesPaymentMethods(getUserData(), 1, perPageSelect == 0 ? perPage : perPageSelect, direction, filters, true));
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
								<h3 style={{ fontWeight:'bold',fontStyle: 'italic',  marginBottom: '0'}}>Formas de pago</h3>
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
								expandableRows
								expandableRowsComponent={<ExpandedComponent />}
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
							<Button className="btn" color="primary" onClick={()=>exportExcel()} disabled={loadingExcel}> 
								<Icon icon={fileDownload} /> Exportar {loadingExcel && <span className="spinner-border spinner-border-sm mr-1"></span>}
							</Button>
							{ 
								dataExcel.length>0 && <>
									<CSVLink ref={refExcel} data={dataExcel} separator={";"} headers={headers} filename={"FormasDePago.csv"}  style={{display:'none'}}>
										Exportar
									</CSVLink>
								</>
							}
							</>	
						}
						<Row xs="12">
							<Col><div className="pull-right">
								{loadingTotal && <span className="spinner-border spinner-border-sm mr-1"></span>} 
								{general > 0 && <b>Total: <NumberFormat value={general.toFixed(2)} displayType={'text'} thousandSeparator={','} decimalSeparator={'.'}  /></b>}
							</div>
							</Col>
						</Row>
						<Modal toggle={() => {clearModal()}} isOpen={modalVisible} className={type == 5 ? "modal-lg":""}>
                            <div className="modal-header">
                            <h5 className="modal-title" id="examplemodalMsgLabel">
                                Detalle
                            </h5>
                            <button
                                aria-label="Close"
                                className="close"
                                type="button"
                                onClick={() =>  {clearModal()}}
                            >
                                <span aria-hidden={true}>×</span>
                            </button>
                            </div>
                            <div className="modal-body">
								{loadingDetail && <span className="spinner-border spinner-border-sm mr-1"></span>}
								{listDetail.length>0 && <><div className="table-wrapper-scroll-y my-custom-scrollbar">
									{/* Tabla de monedas */}
									{(type == 1 || type == 2 || type == 3) && <Table striped responsive>
										<thead>
											<tr>
												<th>Cantidad</th>
												<th>Tasa</th>
												<th>Sub Total</th>
											</tr>
										</thead>
										<tbody>
										{listDetail.length>0 && listDetail.map((detail, index) => {
											return (
												<tr key={index}>
													<td><NumberFormat value={ (type == 1 && detail.dollar) ? (detail.dollar.toFixed(2)) : ((type == 2 && detail.eur) ? (detail.eur.toFixed(2)) : ( (detail.cop) ? detail.cop.toFixed(2):''))} displayType={'text'} thousandSeparator={true} /></td>
													<td><NumberFormat value={ (type == 1 && detail.valueDollar) ? (detail.valueDollar.toFixed(2)) : ((type == 2 && detail.valueEur) ? (detail.valueEur.toFixed(2)) : ((detail.valueCop)?detail.valueCop.toFixed(2):''))} displayType={'text'} thousandSeparator={true} /></td>
													<td><NumberFormat value={ detail.subTotal.toFixed(2) } displayType={'text'} thousandSeparator={true} /></td>
												</tr>
												)
											})
										}     
										</tbody>
                                	</Table>}
									{/* Tabla de transferencias */}
									{type == 4 && <><Table striped responsive>
											<thead>
												<tr>
													<th>Ticket</th>
													<th>Monto</th>
													<th>Referencia</th>
													<th>Banco</th>
												</tr>
											</thead>
											<tbody>
											{listDetail.length>0 && listDetail.map((detail, index) => {
												return (
													<tr key={index}>
														<td>{detail.order}</td>
														<td><NumberFormat value={ detail.tAmmount.toFixed(2) } displayType={'text'} thousandSeparator={true} /></td>
														<td>{detail.tReference}</td>
														<td>{detail.tBank}</td>
													</tr>
													)
												})
											}     
											</tbody>
										</Table>
									</>
									}
									{/* Tabla de puntos de venta */}
									{type == 5 && <><Table striped responsive>
											<thead>
												<tr>
													<th>Ticket</th>
													<th>Monto</th>
													<th>Referencia</th>
													<th>Terminal</th>
													<th>Monto Extra</th>
													<th>Referencia Extra</th>
													<th>Terminal Extra</th>
													<th>Sub Total</th>
												</tr>
											</thead>
											<tbody>
											{listDetail.length>0 && listDetail.map((detail, index) => {
												return (
													<tr key={index}>
														<td>{detail.order}</td>
														<td><NumberFormat value={ detail.pAmmount ? detail.pAmmount.toFixed(2):0 } displayType={'text'} thousandSeparator={true} /></td>
														<td>{detail.pReference ? detail.pReference : ''}</td>
														<td>{detail.terminal ? detail.terminal.code : ''}</td>
														<td><NumberFormat value={ detail.pAmmountExtra ? detail.pAmmountExtra.toFixed(2):0 } displayType={'text'} thousandSeparator={true} /></td>
														<td>{detail.pReferenceExtra ? detail.pReferenceExtra : ''}</td>
														<td>{detail.terminalExtra ? detail.terminalExtra.code: ''}</td>
														<td><NumberFormat value={ detail.subTotal.toFixed(2) } displayType={'text'} thousandSeparator={true} /></td>
													</tr>
													)
												})
											}     
											</tbody>
										</Table>
									</>
									}
									{/* Tabla de creditos */}
									{type == 6 && <><Table striped responsive>
											<thead>
												<tr>
													<th>Ticket</th>
													<th>Monto</th>
													<th>Comentario</th>
												</tr>
											</thead>
											<tbody>
											{listDetail.length>0 && listDetail.map((detail, index) => {
												return (
													<tr key={index}>
														<td>{detail.order}</td>
														<td><NumberFormat value={ detail.credit.toFixed(2) } displayType={'text'} thousandSeparator={true} /></td>
														<td>{detail.comment}</td>
													</tr>
													)
												})
											}     
											</tbody>
										</Table>
									</>
									}
								</div>
								{totalDetail > 0 && <Row xs="12">
									{ type==5 && <Col>
										<div className="pull-left"> 
											<CSVLink data={listDetail} separator={";"} headers={headersPDV} filename={"PuntosDeVenta.csv"}>
												Exportar
											</CSVLink>
										</div>
									</Col>}
									{ type==4 && <Col>
										<div className="pull-left">
											<CSVLink data={listDetail} separator={";"} headers={headersTransfer} filename={"Transferencias.csv"}>
												Exportar
											</CSVLink>
										</div>
									</Col>}
									<Col><div className="pull-right"><b>Total: <NumberFormat value={ totalDetail.toFixed(2) } displayType={'text'} thousandSeparator={true} /></b> </div></Col>
								</Row>
								}
								</>
								}
                            </div>
                            <div className="modal-footer">
                            <Button color="secondary" type="button" onClick={() => {clearModal()}}>
                                Cerrar
                            </Button>
                            </div>
                        </Modal>
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

export default PaymentMethodsPage;