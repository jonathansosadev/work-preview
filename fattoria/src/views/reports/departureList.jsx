/* eslint-disable */
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { departureActions, userActions } from '../../actions';
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

function DepartureListPage() {

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

	const dataDeparture = useSelector(state => state.departure.data);
    const loadingPage = useSelector(state => state.departure.loading);

	//Verificar data de redux
	useEffect(() => {
        if(dataDeparture && dataDeparture.results){
			setData(dataDeparture.results);
		}
		if(dataDeparture && dataDeparture.metadata && dataDeparture.metadata[0]){
			setRowCount(dataDeparture.metadata[0].total);
		}
  	},[dataDeparture]);
    
    const [rowCount, setRowCount] = useState(0);

	// Inicializar tabla sin data
	const [data, setData] = useState([])

	//Columnas Data table
	const columns = [
		{
			name: 'Sucursal',
			selector: 'agency.name',
			sortable: true,
			wrap:true
		},
		{
			name: 'Nombres',
			selector: 'names',
			sortable: true,
			wrap:true
        },
        {
			name: 'Télefono',
			selector: 'phone',
			sortable: true,
        },
        {
			name: 'Tipo',
			selector: 'typeDescription',
			sortable: true,
        },
        {
			name: 'Comentario',
			selector: 'comment',
			sortable: true,
			wrap:true
		},
		// {
		// 	name: 'Total',
		// 	selector: 'total',
		// 	sortable: true,
		// 	cell : (row)=>{
		// 		return <NumberFormat value={row.total?row.total.toFixed(2):row.total} displayType={'text'} thousandSeparator={','} decimalSeparator={'.'}  />
		// 	},
		// },
		{
			name: 'Fecha de registro',
			selector: 'createdDate',
			sortable: true,
			cell : (row)=>{
				return moment(row.createdDate).utc().format("YYYY-MM-DD");
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

	//Data al expandir una fila
	const ExpandedComponent = ({ data }) => (
		<>
			<Table striped responsive>
				<thead>
					<tr>
						<th>Producto</th>
						{/* <th>Precio</th> */}
						<th>kg/unidades</th>
						<th>Sub Total</th>
					</tr>
				</thead>
				<tbody>
				{data.products && data.products.map((product, index) => {
					return (
						<tr key={index}>
							<td>{product.name}</td>
							{/* <td><NumberFormat value={product.price.toFixed(2)} displayType={'text'} thousandSeparator={','} decimalSeparator={'.'}  /></td> */}
							<td><NumberFormat value={product.kg.toFixed(3)} displayType={'text'} thousandSeparator={','} decimalSeparator={'.'}  /></td>
							<td><NumberFormat value={product.total.toFixed(2)} displayType={'text'} thousandSeparator={','} decimalSeparator={'.'}  /></td>
						</tr>
						)
					})
				}
				</tbody>
			</Table>
			<Col><div className="pull-right"><b>Total: <NumberFormat value={ data.total.toFixed(2) } displayType={'text'} thousandSeparator={true} /></b> </div></Col>
		</>
    );

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
	const [direction, setDirection] = useState({ "id":"createdDate", "desc":true  });

	const getDataTable = (page) => {
		dispatch(departureActions.dataTable(getUserData(), page, perPageSelect == 0 ? perPage : perPageSelect, direction, {}, false));
	}

	//Paginar
	const handlePageChange = async (page) => {
		dispatch(departureActions.dataTable(getUserData(), page, perPageSelect == 0 ? perPage : perPageSelect, direction, filters ? filters: {}, false));
	};
	
	//Ordenar
	const handleSort = (column, sortDirection) => {
		let sort = {"id": column.selector, "desc": (sortDirection == "asc" ? false : true) }
		setDirection(sort);
		dispatch(departureActions.dataTable(getUserData(), 1, perPageSelect == 0 ? perPage : perPageSelect, sort, filters ? filters: {}, false));
	};

	//Cambiar cantidad de filas
	const handlePerRowsChange = async (newPerPage, page) => {
		setPerPageSelect(newPerPage);
		dispatch(departureActions.dataTable(getUserData(), page, newPerPage, direction, filters ? filters: {}, false));
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
		dispatch(departureActions.dataTable(getUserData(), 1, perPageSelect == 0 ? perPage : perPageSelect, direction, data, false));
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
								<h3 style={{ fontWeight:'bold',fontStyle: 'italic',  marginBottom: '0'}}>Registro de Salidas</h3>
							</div>
							<Button id="add" onClick={()=>history.push('/departure')} className="btn-round btn-icon" color="primary">
								<i className="fa fa-plus" />
							</Button>
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
										<input
											className="form-control"
											name="names"
											placeholder="Nombres"
											type="text"
											ref={register}
										></input>
									</FormGroup>
                                    <FormGroup className="mr-3">
										<input
											className="form-control"
											name="phone"
											placeholder="Teléfono"
											type="text"
											ref={register}
										></input>
									</FormGroup>
                                    <FormGroup className="mr-3">
                                        <select className='form-control' name="type"
                                            ref={register}>
                                                <option key="" name="" value="">Seleccione tipo</option>
                                                <option key="6" name="6" value="6">Donación</option>
                                                <option key="5" name="5" value="5">Degustación</option>
                                                <option key="4" name="4" value="4">Auto-consumo</option>
                                                <option key="8" name="8" value="8">Vale</option>
                                                <option key="9" name="9" value="9">Corrección</option>
                                                <option key="10" name="10" value="10">Traslado</option>
                                                {/* <option key="12" name="12" value="12">Recorte</option> */}
                                        </select>
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
								expandableRows
								expandableRowsComponent={<ExpandedComponent />}
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

export default DepartureListPage;