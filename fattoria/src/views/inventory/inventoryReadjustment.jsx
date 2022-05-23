/* eslint-disable */
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { inventoryActions, userActions } from '../../actions';
import moment from 'moment'
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import DataTable from 'react-data-table-component';
import { Button, Spinner, Row, Col, UncontrolledTooltip, Modal, Table, Form, FormGroup, Label , Alert} from 'reactstrap';
//componente dataTable
import { history } from '../../helpers';
import '../../assets/css/table.css';
import NumberFormat from 'react-number-format';
import { useForm, Controller } from "react-hook-form";

function InventoryReadjustmentPage() {

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
			wrap:true,
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
			name: 'Inv. Físico',
			selector: 'physical',
			sortable: true,
			cell : (row)=>{
				return  <NumberFormat value={row.physical?row.physical.toFixed(3):0} displayType={'text'} thousandSeparator={','} decimalSeparator={'.'}  />
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
			name: 'Fecha Actualización',
			selector: 'updatedDate',
			sortable: true,
			cell : (row)=>{
				if(row.updatedDate){
					return moment(row.updatedDate).utc().format("YYYY-MM-DD hh:mm:ss")
				}else{
					return ''
				}
				
			},
		},
		{
			name: '',
			button: true,
			width:'250px',
			cell: row => {
				if(row.kg < 0){
					return <>
						<i className="fa fa-exclamation-triangle text-warning"></i>&nbsp;Falta registro de entrada
					</>
				}else{
					return <>
						<Button color="primary btn-round" size="sm" style={{fontSize:12}} onClick={e => 
							{
								e.preventDefault(); 
								setModalVisible(true);
								setEditRow(row);
							}
						}>Editar
                    	</Button>
                	</>
				}
               
			} 
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

	//data inicial
	const getDataTable = () => {
		dispatch(inventoryActions.dataTable(getUserData()));
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

    //modal
    const [modalVisible, setModalVisible] = useState(false);
    //fila seleccionada
	const [editRow, setEditRow] =  useState(null);
	const [newValue, setNewValue] =  useState(null);
    //Form Data
    const { handleSubmit, errors, reset, control, register } = useForm();

    //Registrar data
    const onCreateData = (data, e) => {
		if(editRow){
			//id de inventario 
			let id = editRow.id;
			setNewValue(data.physical);
			data.user = user.id;
			dispatch(inventoryActions.updateInventoryReadjustment( id, data  ));
		}
	};
	
	//State de actualizacion
	const updating = useSelector(state => state.inventories.updating);
	const inventories = useSelector(state => state.inventories);

	//Actualizar estado de inventario al cambio de información
	useEffect(() => {
		if(inventories.success){
			//actualizar los kg en el grid
			let newPhysical = parseFloat(newValue);
			let newData = data.map(inv => {
				if(inv.id == editRow.id)
				   return Object.assign({}, inv, {physical:newPhysical, updatedDate:moment().subtract(4, 'hours')})
				return inv
			});
			
			setData(newData);
			setNewValue(null);
			reset({
				physical:'', comment:''
			});
			setModalVisible(false);
			setEditRow(null);
		}
	},[inventories.success]);

	//Alertas
	const alert = useSelector(state => state.alert);
	//Mostrar alertas
	const [visible, setVisible] = useState(true);
	const onDismiss = () => setVisible(false);

	useEffect(() => {
		if(alert.message){
			setVisible(true); 
			window.setTimeout(()=>{setVisible(false)},5000);   
		}

		//Si hay algun error cerrar modal y limpiar valores
		if(alert.type == "alert-danger"){
			setNewValue(null);
			reset({
				kg:''
			});
			setModalVisible(false);
			setEditRow(null);
		}
	},[alert]);

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

	//Form filtros
	const { handleSubmit:handleSubmitFilter, register: registerFilter , reset:resetFilter } = useForm();

	const clearFilters = () =>{
		setResetPaginationToggle(!resetPaginationToggle);
		resetFilter({agency:'', code:''});
		if(dataInventories && dataInventories.results){
			setData(dataInventories.results);
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
								<h3 style={{ fontWeight:'bold',fontStyle: 'italic' , marginBottom:0}}>Registrar inventario físico</h3>
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
								<Form onSubmit={handleSubmitFilter(onFilterData)} className="form-inline" style={{marginTop:15}}>
									{(user.role == 1 || user.role == 2) && <FormGroup className="mr-3">
                                            {getting && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                            <select className='form-control' name="agency"
                                                ref={registerFilter}>
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
											ref={registerFilter}
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
								title="Invetario"
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
                        <Modal toggle={() => {setModalVisible(false); setEditRow(null)}} isOpen={modalVisible} backdrop="static" >
                            <div className="modal-header">
                            <h5 className="modal-title" id="examplemodalMsgLabel">
                                Modificar
                            </h5>
                            <button aria-label="Close" className="close" type="button" onClick={() => {setModalVisible(false); setEditRow(null)}} disabled={updating}>
                                <span aria-hidden={true}>×</span>
                            </button>
                            </div>
                            <div className="modal-body">
                                {editRow && <><Table striped responsive>
                                    <thead>
                                        <tr>
                                            <th>Sucursal</th>
                                            <th>Producto</th>
                                            <th>kg/unidades</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr key={1}>
                                            <td>{editRow.agency.name}</td>
                                            <td>{editRow.product.name}</td>
                                            <td><NumberFormat value={ editRow.kg.toFixed(3) } displayType={'text'} thousandSeparator={true} /></td>
                                        </tr>      
                                    </tbody>
                                </Table>
                                <Form onSubmit={handleSubmit(onCreateData)} className="form">
                                    <Row form>
                                        <Col md={12}>
                                            <Label for="physical">Cantidad</Label>
                                            <FormGroup>
                                                <Controller
                                                    name="physical"
                                                    control={control}
                                                    rules={{
                                                        min: {
                                                            value: 0,
                                                            message: "La cantidad es requerida"
                                                        },
                                                        required: "La cantidad es requerida",
                                                    }}
                                                    as={<NumberFormat placeholder="Cantidad" className={'form-control' + (errors.physical ? ' is-invalid' : '')} thousandSeparator={true} />}
                                                />
                                                {errors.physical && <div className="invalid-feedback">{errors.physical.message}</div>}
                                            </FormGroup>
                                        </Col>
										<Col md={12}>  
											<FormGroup>
												<Label for="comment">Comentarios</Label>
												<input
													maxLength="150"
													autoComplete="off"
													className={'form-control'}
													name="comment"
													ref={register}
												/>
											</FormGroup>
										</Col>
                                    </Row>
                                    <div className="modal-footer">
                                        <Button color="primary" disabled={updating}>
                                            {updating && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                            Guardar cambios
                                        </Button>
                                        <Button color="secondary" type="button"onClick={() =>  {setModalVisible(false); setEditRow(null)}} disabled={updating}>
                                            Cerrar
                                        </Button>
                                    </div>
                                </Form>
                                </>
                                }
                                {
                                !editRow && <>
                                    <span className="spinner-border spinner-border-sm mr-1"></span>
                                    <div className="modal-footer">
                                        <Button color="secondary" type="button"onClick={() =>  {setModalVisible(false); setEditRow(null)}}>
                                            Cerrar
                                        </Button>
                                    </div>
                                </>
                                } 
                            </div>
                            
                        </Modal>
					</div>
				</div>
            </div>
        </>
    );
}

export default InventoryReadjustmentPage;