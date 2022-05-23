/* eslint-disable */
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { inventoryActions, userActions } from '../../actions';
import moment from 'moment'
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import DataTable from 'react-data-table-component';
import { Button, Spinner, Row, Col, UncontrolledTooltip, Form, FormGroup, Modal } from 'reactstrap';
//componente dataTable
import { history } from '../../helpers';
import '../../assets/css/table.css';
import NumberFormat from 'react-number-format';
import { CSVLink } from "react-csv";
import { useForm  } from "react-hook-form";
import { Icon } from '@iconify/react';
import fileDownload from '@iconify/icons-fa-solid/file-download';
import syncIcon from '@iconify/icons-fa-solid/sync';

function InventoryListPage() {

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

	const dataInventories = useSelector(state => state.inventories.data);
    const loadingPage = useSelector(state => state.inventories.loading);

	//Verificar data de redux
	useEffect(() => {
		if(dataInventories){
			setData(dataInventories.results);
		}else{

		}
  	},[dataInventories]);
    
	// Inicializar tabla sin data
	const [data, setData] = useState([])

	//Columnas Data table
	const columns = [
		{
			name: 'Sucursal',
			selector: 'agency.name',
			sortable: true,
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
		},
		{
			name: 'Cantidad (kg/Unidad)',
			selector: 'kg',
			sortable: true,
			cell : (row)=>{
				return  <NumberFormat value={row.kg?row.kg.toFixed(3):row.kg} displayType={'text'} thousandSeparator={','} decimalSeparator={'.'}  />
			},
        },
		{
			name: 'Fecha',
			selector: 'createdDate',
			sortable: true,
			omit: true,//Esconder
			cell : (row)=>{
				return moment(row.createdDate).utc().format("YYYY-MM-DD")
			},
		},
		{
			name: 'Restaurar',
			button: true,
			cell: row => {
				//Permiso a repesaje a todos menos al cajero
				if(user.role !== 4){
					if(row.kg !== 0){
						return <>
						<Button className="btn-link" color="primary" size="sm" onClick={e => 
							{
								e.preventDefault(); 
								history.push('/inventory-reset',{id:row.id})
							}
						}><Icon icon={syncIcon} />
						</Button>
						</>
					}
				}
			} 
		},
		{
			name: '',
			button: true,
			cell: row => {
				//Permiso a repesaje a todos menos al cajero
				if(user.role !== 4){
					if(row.product.reweigh){
						return <>
						<Button className="btn-link" color="primary" size="sm" onClick={e => 
							{
								e.preventDefault(); 
								history.push('/inventory-reweigh',{id:row.id})
							}
						}><i className="fa fa fa-balance-scale"></i>
						</Button>
						</>
					}
				}
			} 
		},
	];

	//data inicial
	const getDataTable = () => {
		let userData = {
			agency: user.agency.id,
			role:user.role,
			id: user.id
		}
		dispatch(inventoryActions.dataTable(userData));
	}
	
	const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

	//Consultar al entrar
	useEffect(() => {
		getDataTable();
	}, []);

	//Opciones de paginacion
	const paginationOptions = { rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' };

	//Loader de la tabla
	const CustomLoader = () => (<><div className="loading-table"></div></>);

	const headers = [
		{ label: "Sucursal", key: "agency.name" },
		{ label: "Código Producto", key: "product.code" },
		{ label: "Producto", key: "product.name" },
		{ label: "Cantidad (kg/Unidades)", key: "kg" }
	];

	//Abrir/Cerrar filtros
	const [isOpen, setIsOpen] = useState(false);
	const toggle = () => setIsOpen(!isOpen);

	//Consultar por filtros
	const onFilterData = (data, e) => {

		if(dataInventories && dataInventories.results){
			setData(dataInventories.results.filter(item => (
				//Solo admin y supervisor filtran por sucursal
				user.role == 1 || user.role == 2 ?
					(item.agency._id && item.agency._id.toString().toLowerCase().includes(data.agency.toLowerCase()))		
					&& (data.code !== "" ? item.product.code && item.product.code.toString().toLowerCase() == data.code.toLowerCase() : true)
				:
					(item.product.code &&  item.product.code.toString().toLowerCase() == data.code.toLowerCase())
				) 
			));
		}
	};

	//Form Data Filter
	const { handleSubmit, register, reset } = useForm();

	const clearFilters = () =>{
		setResetPaginationToggle(!resetPaginationToggle);
		reset({agency:'', code:''});
		if(dataInventories && dataInventories.results){
			setData(dataInventories.results);
		}
	}

	//obtener data de usuario necesaria
	const getUserData = () => {
		return {
			agency: user.agency.id,
			role:user.role,
			id: user.id
		}
	}

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

	 
    return (
        <>
            <div className="d-flex" id="wrapper">
				<SideBar/>
				<div id="page-content-wrapper">
					<AdminNavbar/>
					<div className="flex-column flex-md-row p-3">
						<div className="d-flex justify-content-between" style={{padding:"4px 16px 4px 24px"}}>
							<div className="align-self-center">
								<h3 style={{ fontWeight:'bold',fontStyle: 'italic',  marginBottom: '0'}}>Inventario actual</h3>
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
								highlightOnHover
								striped
								sortIcon={ <i className="fa fa-arrow-down ml-2" aria-hidden="true"></i> }
								title="Inventario actual"
								progressPending={loadingPage}
								paginationComponentOptions={paginationOptions}
								progressComponent={<CustomLoader />}
								noDataComponent="No hay registros para mostrar"
								noHeader={true}
								columns={columns}
								data={data}
								pagination
								paginationResetDefaultPage={resetPaginationToggle} // optionally, a hook to reset pagination to page 1
								persistTableHead
							/>
							</Col>
						
						</Row>
						{data && data.length > 0 &&
							<CSVLink data={data} separator={";"} headers={headers} filename={"inventarioFinal.csv"} className="btn btn-primary">
								<Icon icon={fileDownload} /> Exportar
							</CSVLink>
						}
					</div>
				</div>
            </div>
        </>
    );
}

export default InventoryListPage;