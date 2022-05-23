/* eslint-disable */
import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { inventoryActions, userActions } from '../../actions';
import moment from 'moment';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Button, Row, Col, Modal, Form, FormGroup, Table } from 'reactstrap';
//componente dataTable
import '../../assets/css/table.css';
import NumberFormat from 'react-number-format';
import { CSVLink } from "react-csv";
import { useForm  } from "react-hook-form";
import Datetime from 'react-datetime';
import { Icon } from '@iconify/react';
import fileDownload from '@iconify/icons-fa-solid/file-download';
import { getUrlBalanceWhatsapp } from '../../helpers';

function balanceReportPage() {

  	useEffect(() => {
		document.body.classList.add("landing-page");
		document.body.classList.add("sidebar-collapse");
		document.documentElement.classList.remove("nav-open");
		return function cleanup() {
			document.body.classList.remove("landing-page");
			document.body.classList.remove("sidebar-collapse");
		};
	  });
	  
	const formatter = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 2
	})
	
	//usuario
    const user = useSelector(state => state.authentication.user);
    const dispatch = useDispatch();
	const dataInventories = useSelector(state => state.inventories.dataBalance);
    const loadingPage = useSelector(state => state.inventories.loadingBalance);
	  
	// Inicializar tabla sin data
	const [data, setData] = useState([])
	const [metaData, setMetaData] = useState(false);
	const [urlBalance, setUrlBalance] = useState(null);

	//Verificar data de redux
	useEffect(() => {
		if(dataInventories && dataInventories.results){
			setData(dataInventories.results);
			setMetaData(dataInventories.metadata);

			//si hay resultados validos obtener url whatsapp
			if(dataInventories.metadata && dataInventories.results.length > 0){

				try {
					let createdDate = dataInventories.results[0].value;
					let agency = dataInventories.results[1].value;
					let initial = formatter.format(dataInventories.results[2].value.toFixed(2));
					let buy  = formatter.format(dataInventories.results[3].value.toFixed(2));
					let sell = formatter.format(dataInventories.results[4].value.toFixed(2));
					let cut = formatter.format(dataInventories.results[5].value.toFixed(2));
					let decrease = formatter.format(dataInventories.results[6].value.toFixed(2));
					let out = formatter.format(dataInventories.results[7].value.toFixed(2));
					let total = formatter.format(dataInventories.results[8].value.toFixed(2));
					let physical = formatter.format(dataInventories.results[9].value.toFixed(2));
					let adjustment = formatter.format(dataInventories.results[10].value.toFixed(2));
					let percent = dataInventories.results[11].value

					let urlbalance = getUrlBalanceWhatsapp(createdDate,agency,initial,buy,sell,cut,decrease,out,total,physical,adjustment,percent );
					setUrlBalance(urlbalance);
				} catch (error) {
					setModalWarning(true);
            		setModalMsg('Ocurrió un error, al formatear la información');
				}
				
			}else{
				setMetaData(false);
				setUrlBalance(null);
			}
		
		}
  	},[dataInventories]);

	//Consultar al entrar
	useEffect(() => {
		getDataTable();
	}, []);

	//Loader de la tabla
	const CustomLoader = () => (<><div className="loading-custom"></div></>);

	//obtener data de usuario necesaria
	const getUserData = () => {
		return {
			agency: user.agency.id,
			role:user.role,
			id: user.id
		}
	}

	const getDataTable = (page) => {
		dispatch(inventoryActions.dataTableReportBalance(getUserData(), {}));
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


	const handleChangeStartDate = (date) => {
		setStartDate(date);
	}

	const [startDate, setStartDate] = useState('');

	const clearFilters = () =>{
		setStartDate('');  
		reset({agency:'', startDate:'', code:''})
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

		dispatch(inventoryActions.dataTableReportBalance(getUserData(), data));
	}

	//Exportar balances
	const headers = [
		{ label: "Campo", key: "name" },
		{ label: "Valor", key: "value" },
	];

	const formatTotalAdjustment = (value) => {
		if(data.length > 0){
			if (value > 0 && (data[8].value < data[9].value)){
				return <><i className="fa fa-arrow-up text-success"></i>&nbsp;<NumberFormat displayType={'text'} value={value.toFixed(2)} thousandSeparator={true} prefix="Bs. "/> </>
			}else if(value > 0 && (data[8].value > data[9].value)){
				return <><i className="fa fa-arrow-down text-danger"></i>&nbsp;<NumberFormat displayType={'text'} value={value.toFixed(2)} thousandSeparator={true} prefix="Bs. "/> </>
			}else{
				return <NumberFormat displayType={'text'} value={value.toFixed(2)} thousandSeparator={true} prefix="Bs. "/>
			}
		}else{
			return <></>
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
								<h3 style={{ fontWeight:'bold',fontStyle: 'italic',  marginBottom: '0'}}>Balances</h3>
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
									<Button color="primary" type="submit" disabled={loadingPage}>
										{loadingPage && <span className="spinner-border spinner-border-sm mr-1"></span>} Buscar
									</Button>
								</Form>
							</>
							}
						</div>
						{/* Filtros */}
						<Row>
							<Col md="12" sm="12" lg="12">
							{loadingPage && <div className="justify-content-center"><CustomLoader/></div>}
							{(!loadingPage && data.length > 0) && <>
								<Table striped responsive hover bordered size="sm">
									<caption style={{captionSide:'top', fontWeight:'bolder'}}>BALANCE DE RESULTADOS {data[1].value.toUpperCase()} {data[0].value} </caption>
                                    <thead>
                                        <tr>
                                            <th>CONCEPTO</th>
                                            <th>1</th>
											<th>2</th>
											<th>PORCENTAJE</th>
											<th>3</th>
											<th>4</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {/* {data && data.map((product, index) => {
										return (
											<tr key={index}>
												<td>{product.name}</td>
												<td>
													{product.name == "Fecha" || product.name == "Sucursal" ? product.value : 
														(
															product.name == "%" ?
															<NumberFormat displayType={'text'} value={product.value} thousandSeparator={true}/> : (
																product.name == "Faltante"?(
																	formatTotalAdjustment(product.value)
																):
																<NumberFormat displayType={'text'} value={product.value.toFixed(2)} thousandSeparator={true} prefix="Bs. "/> 
															)
														)
													}
												</td>
											</tr>
											)
										})
                                    } */}
									<tr>
										<td>Inventario Inicial</td>
										<td></td>
										<td><NumberFormat displayType={'text'} value={data[2].value.toFixed(2)} thousandSeparator={true} prefix="Bs. "/></td>
										<td></td>
										<td></td>
										<td></td>
									</tr>
									<tr>
										<td>+ Compras/Envíos</td>
										<td></td>
										<td><NumberFormat displayType={'text'} value={data[3].value.toFixed(2)} thousandSeparator={true} prefix="Bs. "/></td>
										<td></td>
										<td></td>
										<td></td>
									</tr>
									<tr>
										<td><b>= INVENTARIO BRUTO</b></td>
										<td></td>
										<td><b><NumberFormat displayType={'text'} value={data[12].value.toFixed(2)} thousandSeparator={true} prefix="Bs. "/></b></td>
										<td></td>
										<td></td>
										<td></td>
									</tr>
									<tr>
										<td><b>- Ventas</b></td>
										<td></td>
										<td><b><NumberFormat displayType={'text'} value={data[4].value.toFixed(2)} thousandSeparator={true} prefix="Bs. "/></b></td>
										<td></td>
										<td></td>
										<td></td>
									</tr>
									<tr>
										<td><b>= INICIAL - VENTAS</b></td>
										<td></td>
										<td></td>
										<td></td>
										<td><b><NumberFormat displayType={'text'} value={data[13].value.toFixed(2)} thousandSeparator={true} prefix="Bs. "/></b></td>
										<td></td>
									</tr>
									<tr>
										<td>Recortes</td>
										<td></td>
										<td><NumberFormat displayType={'text'} value={data[5].value.toFixed(2)} thousandSeparator={true} prefix="Bs. "/></td>
										<td><NumberFormat displayType={'text'} value={data[14].value.toFixed(2)} thousandSeparator={true} suffix="%"/></td>
										<td></td>
										<td></td>
									</tr>
									<tr>
										<td>Mermas</td>
										<td></td>
										<td><NumberFormat displayType={'text'} value={data[6].value.toFixed(2)} thousandSeparator={true} prefix="Bs. "/></td>
										<td><NumberFormat displayType={'text'} value={data[15].value.toFixed(2)} thousandSeparator={true} suffix="%"/></td>
										<td></td>
										<td></td>
									</tr>
									<tr>
										<td style={{textAlign:'right', fontStyle:'italic'}}>Empaque</td>
										<td><NumberFormat displayType={'text'} value={data[16].value.toFixed(2)} thousandSeparator={true} prefix="Bs. "/></td>
										<td></td>
										<td></td>
										<td></td>
										<td></td>
									</tr>
									<tr>
										<td style={{textAlign:'right', fontStyle:'italic'}}>Humedad</td>
										<td><NumberFormat displayType={'text'} value={data[17].value.toFixed(2)} thousandSeparator={true} prefix="Bs. "/></td>
										<td></td>
										<td></td>
										<td></td>
										<td></td>
									</tr>
									<tr>
										<td style={{textAlign:'right', fontStyle:'italic'}}>Picadillo</td>
										<td><NumberFormat displayType={'text'} value={data[18].value.toFixed(2)} thousandSeparator={true} prefix="Bs. "/></td>
										<td></td>
										<td></td>
										<td></td>
										<td></td>
									</tr>
									<tr>
										<td>Salidas</td>
										<td></td>
										<td><NumberFormat displayType={'text'} value={data[7].value.toFixed(2)} thousandSeparator={true} prefix="Bs. "/></td>
										<td><NumberFormat displayType={'text'} value={data[25].value.toFixed(2)} thousandSeparator={true} suffix="%"/></td>
										<td></td>
										<td></td>
									</tr>
									<tr>
										<td style={{textAlign:'right', fontStyle:'italic'}}>Donación</td>
										<td><NumberFormat displayType={'text'} value={data[19].value.toFixed(2)} thousandSeparator={true} prefix="Bs. "/></td>
										<td></td>
										<td></td>
										<td></td>
										<td></td>
									</tr>
									<tr>
										<td style={{textAlign:'right', fontStyle:'italic'}}>Degustación</td>
										<td><NumberFormat displayType={'text'} value={data[20].value.toFixed(2)} thousandSeparator={true} prefix="Bs. "/></td>
										<td></td>
										<td></td>
										<td></td>
										<td></td>
									</tr>
									<tr>
										<td style={{textAlign:'right', fontStyle:'italic'}}>Auto-consumo</td>
										<td><NumberFormat displayType={'text'} value={data[21].value.toFixed(2)} thousandSeparator={true} prefix="Bs. "/></td>
										<td></td>
										<td></td>
										<td></td>
										<td></td>
									</tr>
									<tr>
										<td style={{textAlign:'right', fontStyle:'italic'}}>Vale</td>
										<td><NumberFormat displayType={'text'} value={data[22].value.toFixed(2)} thousandSeparator={true} prefix="Bs. "/></td>
										<td></td>
										<td></td>
										<td></td>
										<td></td>
									</tr>
									<tr>
										<td style={{textAlign:'right', fontStyle:'italic'}}>Corrección</td>
										<td><NumberFormat displayType={'text'} value={data[23].value.toFixed(2)} thousandSeparator={true} prefix="Bs. "/></td>
										<td></td>
										<td></td>
										<td></td>
										<td></td>
									</tr>
									<tr>
										<td style={{textAlign:'right', fontStyle:'italic'}}>Traslado</td>
										<td><NumberFormat displayType={'text'} value={data[24].value.toFixed(2)} thousandSeparator={true} prefix="Bs. "/></td>
										<td></td>
										<td></td>
										<td></td>
										<td></td>
									</tr>
									<tr>
										<td><b>- EGRESOS DIVERSOS</b></td>
										<td></td>
										<td></td>
										<td></td>
										<td><b><NumberFormat displayType={'text'} value={data[26].value.toFixed(2)} thousandSeparator={true} prefix="Bs. "/></b></td>
										<td></td>
									</tr>
									<tr>
										<td><b>= DEBE HABER</b></td>
										<td></td>
										<td></td>
										<td></td>
										<td></td>
										<td><b><NumberFormat displayType={'text'} value={data[8].value.toFixed(2)} thousandSeparator={true} prefix="Bs. "/></b></td>
									</tr>
									<tr>
										<td><b>- INVENTARIO FÍSICO</b></td>
										<td></td>
										<td></td>
										<td></td>
										<td></td>
										<td><b><NumberFormat displayType={'text'} value={data[9].value.toFixed(2)} thousandSeparator={true} prefix="Bs. "/></b></td>
									</tr>
									<tr>
										<td><b>= DIFERENCIAL</b></td>
										<td></td>
										<td></td>
										<td></td>
										<td></td>
										<td><b>{formatTotalAdjustment(data[10].value)}</b></td>
									</tr>
									<tr>
										<td><b>DIFERENCIAL %</b></td>
										<td></td>
										<td></td>
										<td><NumberFormat displayType={'text'} value={data[11].value.toFixed(2)} thousandSeparator={true} suffix="%"/></td>
										<td></td>
										<td></td>
									</tr>
                                    </tbody>
                                </Table>
							</>
							}
							{(data && data.length > 0 && !loadingPage) &&
								<CSVLink data={data} separator={";"} headers={headers} filename={"balances.csv"} className="btn btn-primary">
									<Icon icon={fileDownload} /> Exportar
								</CSVLink>
							}
							{(metaData && !loadingPage) && <>
								<a className="btn btn-primary" href={urlBalance} target="_blank">
									<i className="fa fa-comment" aria-hidden="true"></i> Enviar balances
								</a>
							</>
							}
							</Col>
						</Row>
						{/* Exportar */}
					</div>
					{/* Modal de notificaciones */}
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
        </>
    );
}

export default balanceReportPage;