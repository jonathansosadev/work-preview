/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { offerActions, agencyActions } from '../../actions';
import moment from 'moment';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import DataTable from 'react-data-table-component';
import { Button, Row, Col, Form, FormGroup, Modal, Alert } from 'reactstrap';
//componente dataTable sede
import { history } from '../../helpers';
import '../../assets/css/table.css';
import NumberFormat from 'react-number-format';
import { useForm } from "react-hook-form";
import Datetime from 'react-datetime';
import { Icon } from '@iconify/react';
import deleteBin6Fill from '@iconify-icons/ri/delete-bin-6-fill';

function OfferListPage() {

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
   
	//usuario
    const user = useSelector(state => state.authentication.user);
    const dispatch = useDispatch();

	const dataOffers = useSelector(state => state.offer.data);
    const loadingPage = useSelector(state => state.offer.loading);

	//Verificar data de redux
	useEffect(() => {
		if(dataOffers){
			setData(dataOffers.results);
		}
  	},[dataOffers]);
    
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
			selector: 'user.email',
			sortable: true,
			wrap:true,
			cell : (row)=>{
				return  row.user && row.user.email ?  row.user.email: ''
			},
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
			name: 'Precio promoción',
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
			name: '',
			button: true,
			cell: row => <Button className="btn-link" color="primary" size="sm" onClick={e => 
				{
					e.preventDefault(); 
					onDismiss();
					setItemRemove(row);
					setModalVisible(true);
					setModalMsg(`Desea eliminar ${row.agency.name} de las Promociones?`);
				}
			}><Icon icon={deleteBin6Fill} color="#FF3636" width="19" height="19"/></Button>,
		},
	];

	//data inicial
	const getDataTable = () => {
		dispatch(offerActions.dataTable(getUserData()));
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

	//obtener data de usuario necesaria
	const getUserData = () => {
		let data = {
			id: user.id,
			role:user.role,
		}
		return data;
	}

	//Abrir/Cerrar filtros
	const [isOpen, setIsOpen] = useState(false);
	const toggle = () => setIsOpen(!isOpen);

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

	//Modal genérico y mensaje
	const [modalWarning, setModalWarning] = useState(false);

	//Consultar por filtros
	const onFilterData = (data, e) => {
		
		//validar objeto no vacio
		if (Object.keys(data).length !== 0) {
			var validDate =  moment(data.startDate).isValid();

			if(data.startDate !== "" && !validDate){
				setModalWarning(true);
				setModalMsg('Ingrese una fecha válida');
				return;
			}

			let formDate = '';
			if(data.startDate !== ""){
				formDate = moment(data.startDate).utc().format("YYYY-MM-DD");
			}
			
			if(dataOffers && dataOffers.results){
				setData(dataOffers.results.filter(item => (
					(data.agency !== "" ? item.agency.id && item.agency.id.toString().toLowerCase().includes(data.agency.toLowerCase()): true)		
					&& (data.email !== "" ? item.user.email && item.user.email.toLowerCase().includes(data.email.toLowerCase()) : true)
					&& (data.startDate !== "" ? moment(item.createdDate).utc().format("YYYY-MM-DD") == formDate : true)
					&& (data.comment !== "" ? item.comment && item.comment.toLowerCase().includes(data.comment.toLowerCase()): true)
					) 
				));
			}
		}
	};

	//Form filtros
	const { handleSubmit:handleSubmitFilter, register: registerFilter , reset:resetFilter } = useForm();

	const clearFilters = () =>{
		setResetPaginationToggle(!resetPaginationToggle);
		setStartDate('')
		resetFilter({agency:'', code:'', startDate:''});
		if(dataOffers && dataOffers.results){
			setData(dataOffers.results);
		}
		onDismiss();
	}

	const handleChangeStartDate = (date) => {
		setStartDate(date);
	}
	const [startDate, setStartDate] = useState('');

	const [modalVisible, setModalVisible] = useState(false);
	const [modalMsg, setModalMsg] = useState('');

	const [itemRemove, setItemRemove] = useState(null); 

	useEffect(() => {
		if(!modalVisible){
			setItemRemove(null);
		}
	},[modalVisible]);

	//State de eliminacion de la oferta
    const deletingOffer = useSelector(state => state.offer.deleting);

    //Eliminar oferta
    const removeOffer = () => {
		let id = itemRemove.id;
        dispatch(offerActions.removeOffer(id, getUserData()));
	}
	
	const successDeleted = useSelector(state => state.offer.successDeleted);

	//Si el registro fue eliminado correctamente se cierra el modal
	//y se coloca nulo la fila o item seleccionado
	useEffect(() => {
		if(successDeleted){
			setModalVisible(false);
			setItemRemove(null);
			//filtrar en dado caso
			handleSubmitFilter(onFilterData)();
		}
	},[successDeleted]);

	const failDeleted = useSelector(state => state.offer.error);
	useEffect(() => {
		if(failDeleted){
			setModalVisible(false);
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
								<h3 style={{ marginBottom:0 }}>Promociones</h3>
							</div>
							<div>
								<span style={{marginRight:8}}>
									Crear Oferta
								</span>
								<Button onClick={()=> history.push('/create-offer') } className="btn-round btn-icon" color="info">
									<i className="fa fa-plus" />
								</Button>
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
									<FormGroup className="mr-3">
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
									<FormGroup className="mr-3">
										<input
											className="form-control"
											name="email"
											placeholder="Email"
											type="text"
											ref={registerFilter}
										></input>
									</FormGroup>
									<FormGroup className="mr-3">
										<input
											className="form-control"
											name="comment"
											placeholder="Comentario"
											type="text"
											ref={registerFilter}
										></input>
									</FormGroup>
									<FormGroup className="mr-3">
										<Datetime timeFormat={false} dateFormat={'YYYY-MM-DD'} closeOnSelect onChange={handleChangeStartDate} value={startDate}
											renderInput={(props) => {
												return <input {...props} className="form-control dateFilter" readOnly 
												name="startDate" placeholder="Fecha de registro"  ref={registerFilter} value={(startDate) ? props.value : ''} />
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
								striped
								sortIcon={ <i className="fa fa-arrow-down ml-2" aria-hidden="true"></i> }
								title="Productos"
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
						<Modal toggle={() => {setModalVisible(false); setModalMsg('')}} isOpen={modalVisible} backdrop="static">
                            <div className="modal-header">
								<h5 className="modal-title" id="examplemodalMsgLabel">
									Promociones
								</h5>
								<button aria-label="Close" className="close" type="button" onClick={() =>  {setModalVisible(false); setModalMsg('')}}>
									<span aria-hidden={true}>×</span>
								</button>
                            </div>
                            <div className="modal-body">
                                <p>{modalMsg}</p>
                            </div>
                            <div className="modal-footer">
							<Button color="primary" className="btn-round" disabled={deletingOffer} onClick={()=>removeOffer()}>
								{deletingOffer && <span className="spinner-border spinner-border-sm mr-1"></span>}
								Eliminar
							</Button>
							<Button color="secondary" className="btn-round" outline type="button" onClick={() => {setModalVisible(false); setModalMsg('')}} disabled={deletingOffer}>
								Cerrar
							</Button>
                            </div>
                        </Modal>
						<Modal toggle={() => {setModalWarning(false); setModalMsg('')}} isOpen={modalWarning}>
                            <div className="modal-header">
                            <h5 className="modal-title" id="examplemodalMsgLabel">
								Promociones
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
					</div>
				</div>
            </div>
        </>
    );
}

export default OfferListPage;