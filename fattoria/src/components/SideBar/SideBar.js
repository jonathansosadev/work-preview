/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { salesActions } from '../../actions';
import { history } from '../../helpers';
// reactstrap components
import {
	Collapse,
} from "reactstrap";
import { useLocation, NavLink  } from "react-router-dom";
import { useIdleTimer } from 'react-idle-timer';
import fattoria from '../../assets/img/fattoria.png';

/**
 * Iconos
 */
import { Icon } from '@iconify/react';
import balanceScale from '@iconify/icons-fa-solid/balance-scale';
import storeIcon from '@iconify/icons-fa-solid/store';
import listAlt from '@iconify/icons-fa-solid/list-alt';
import creditCard from '@iconify/icons-fa-solid/credit-card';
import userFriends from '@iconify/icons-fa-solid/user-friends';
import donateIcon from '@iconify/icons-fa-solid/donate';
import listUl from '@iconify/icons-fa-solid/list-ul';
import dollyIcon from '@iconify/icons-fa-solid/dolly';
import cashRegister from '@iconify/icons-fa-solid/cash-register';
import boxesIcon from '@iconify/icons-fa-solid/boxes';
import clipboardIcon from '@iconify/icons-fa-solid/clipboard';
import clipboardList from '@iconify/icons-fa-solid/clipboard-list';
import undoAlt from '@iconify/icons-fa-solid/undo-alt';
import moneyBillWave from '@iconify/icons-fa-solid/money-bill-wave';
import clipboardCheck from '@iconify/icons-fa-solid/clipboard-check';
import bookIcon from '@iconify/icons-fa-solid/book';
import bookMedical from '@iconify/icons-fa-solid/book-medical';
import bookDead from '@iconify/icons-fa-solid/book-dead';
import cartPlus from '@iconify/icons-fa-solid/cart-plus';
import doorOpen from '@iconify/icons-fa-solid/door-open';
import chartLine from '@iconify/icons-fa-solid/chart-line';
import fileAlt from '@iconify/icons-fa-solid/file-alt';
import plusCircle from '@iconify/icons-fa-solid/plus-circle';
import editIcon from '@iconify/icons-fa-solid/edit';
import angleUp from '@iconify/icons-fa-solid/angle-up';
import angleDown from '@iconify/icons-fa-solid/angle-down';
import bullhornIcon from '@iconify/icons-fa-solid/bullhorn';
import boxIcon from '@iconify/icons-fa-solid/box';
import briefcaseIcon from '@iconify/icons-fa-solid/briefcase';
import folderPlus from '@iconify/icons-fa-solid/folder-plus';
import folderMinus from '@iconify/icons-fa-solid/folder-minus';
import tasksIcon from '@iconify/icons-fa-solid/tasks';
import tableIcon from '@iconify/icons-fa-solid/table';
import pencilAlt from '@iconify/icons-fa-solid/pencil-alt';
import maleIcon from '@iconify/icons-fa-solid/male';


//Menu lateral en admin
function SideBar() {

	/**
	 * Antes de cerrar la ventana o tab si hay ventas por procesar enviar un alerta
	 */
	window.addEventListener("beforeunload", (ev) => 
	{  
		let inProcess = localStorage.getItem('SALEPROCESS');
		if(inProcess){
			ev.preventDefault();
			return ev.returnValue = '¡Tiene ventas por procesar pendientes!';
		}
	});

	const dispatch = useDispatch();
	const location = useLocation();
	const user = useSelector(state => state.authentication.user);

	// collapse states and functions
	const [collapses, setCollapses] = useState([]);

	const changeCollapse = collapse => {

		if (collapses.includes(collapse)) {
			setCollapses(collapses.filter(prop => prop !== collapse));
		} else {
			setCollapses([...collapses, collapse]);
		}
	};

	/**
	 * En momentos de inactividad realizar consulta de monedas productos y terminales
	 * - Ejecuta la funcion salesDataFormOffline cada 10 segundos
	 */
    const handleOnIdle = () => {
		//console.log('ultima actividad', getLastActiveTime());
		dispatch(salesActions.salesDataFormOffline( user.agency.id ));
        reset();
    }
    const { getLastActiveTime, reset } = useIdleTimer({
        timeout: 10000,//10 segundos
        onIdle: handleOnIdle,
        debounce: 500
	})
	
	//End timer
    useEffect(() => {
		let page = location.pathname;

		if(page === "/users" ||  page === "/register-user"){
			changeCollapse(1);
		}

		if(page === "/agency" ||  page === "/register-agency"){
			changeCollapse(2);
		}

		if(page === "/product" || page === "/register-product" || page === "/product-history"){
			changeCollapse(3);
		}

		if(page === "/register-inventory" || page === "/readjustment"){
			changeCollapse(4);
		}

		if(page === "/sales" || page === "/register-sale" || page === "/sales-daily" || page === "/offline-sales" || page === "/sales-user"){
			changeCollapse(5);
		}

		if(page === "/coin" ||  page === "/register-coin"){
			changeCollapse(6);
		}

		if(page === "/terminal" ||  page === "/register-terminal" ||  page === "/update-terminal"){
			changeCollapse(7);
		}
		if(page === "/inventory-sell" || page === "/inventory" || page === "/inventory-history" || page === "/inventory-report" || page === "/balance-report" || page === "/inventory-reweigh"
			|| page === "/payment-methods-report" || page === "/inventory-report-daily" || page === "/departures" || page === "/inventory-report-plus" 
			|| page === "/inventory-adjustment-history" || page === "/cron-history" || page === "/offer-history" || page === "/inventory-offer"
			|| page === "/box-report" || page === "/box-close-report" || page === "/client-list" || page === "/update-client" ){
				changeCollapse(8);
		}
		if(page === "/departure"){
			changeCollapse(9);
		}
		
		if(page === "/offer" || page === "/create-offer"){
			changeCollapse(10);
		}

		if(page === "/box-opening" || page === "/box-withdrawal" || page === "/box-close" || page === "/box-correction"){
			changeCollapse(11);
		}

		if(page === "/sales-credit"){
			changeCollapse(12);
		}

	}, [location]);
	
	//ventas offline pendientes
	const pending = useSelector(state => state.pending);
	
	const [pendingSales, setPendingSales] = useState('');

	//Colocar cantidad de pendientes en el menú
	const getPendings = () => {
		if(pending.sales && pending.sales.length>0){
			setPendingSales(`(${pending.sales.length})`);
		}else{
			setPendingSales('')
		}
	};
	useEffect(() => {
		getPendings();
	}, [pending.sales]);
	
	return (
		<>
			<div className="" id="sidebar-wrapper">
				<div className="sidebar-heading"><NavLink to="/home"> <span className="helper"></span><img alt="..." className="logo" src={fattoria}></img></NavLink></div>

				<div className="list-group list-group-flush" >
					<div aria-multiselectable={true} id="accordion" role="tablist">
						{(user.role == 1 || user.role == 2) &&  //administrador o supervisor
							<>
								{/* Sucursales */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(2)} className="menu-title" data-parent="#accordion" href="#"
										id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(2);}}
									>
										<div className="parent-item first-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={storeIcon} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Sucursales</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(2) ? angleUp : angleDown} width="18" height="18" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(2)}>
									<div className="margin-menu">
										<NavLink to="/agency" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={listAlt} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Lista</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/register-agency" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={plusCircle} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Añadir</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>

								{/* Caja */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(11)} className="menu-title" data-parent="#accordion" href="#"
										id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(11);}}
									>
										<div className="parent-item first-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={briefcaseIcon} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Caja</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(11) ? angleUp : angleDown} width="18" height="18" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(11)}>
									{/* solo admin caja */}
									{user.role == 1 && <>
									<div className="margin-menu">
										<NavLink to="/box-opening" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={folderPlus} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Apertura</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									{/* <div className="margin-menu">
										<NavLink to="/box-withdrawal" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={folderMinus} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Retiro</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div> */}
									</>
									}
									<div className="margin-menu">
										<NavLink to="/box-close" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={tasksIcon} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Cierre</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/box-correction" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={pencilAlt} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Corrección</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/box-report" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={tableIcon} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Reporte de caja</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/box-close-report" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={tableIcon} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Reporte de cierres</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>
								{/* Puntos de venta: solo admin*/}
								{user.role == 1  && <>
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(7)} className="menu-title" data-parent="#accordion" href="#"
										id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(7);}}
									>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={creditCard} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Puntos de venta</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(7) ? angleUp : angleDown} width="18" height="18" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(7)}>
									<div className="margin-menu">
										<NavLink to="/terminal" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={listAlt} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Lista</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/register-terminal" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={plusCircle} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Añadir</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>
								</>
								}
								{/* Usuario */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(1)} className="menu-title" data-parent="#accordion" href="#"
										id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(1);}}
									>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={userFriends} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Usuarios</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(1) ? angleUp : angleDown} width="18" height="18" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(1)}>
									<div className="margin-menu">
										<NavLink to="/users" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={listAlt} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Lista</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/register-user" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={plusCircle} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Añadir</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>

								{/* Tipo de cambio */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(6)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(6);}}
									>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={donateIcon} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Tipo de cambio</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(6) ? angleUp : angleDown} width="18" height="18" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(6)}>
									<div className="margin-menu">
										<NavLink to="/coin" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={listAlt} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Lista</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/register-coin" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={plusCircle} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Añadir</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>

								{/* Catalogo */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(3)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(3);}}
									>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={listUl} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Catálogo de productos</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(3) ? angleUp : angleDown} width="18" height="18" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(3)}>
									<div className="margin-menu">
										<NavLink to="/product" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={listAlt} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Lista</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/register-product" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={plusCircle} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Añadir</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/product-history" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={undoAlt} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Historial</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>
								
								{/* Inventarios */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(4)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(4);}}
									>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={dollyIcon} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Inventarios</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(4) ? angleUp : angleDown} width="18" height="18" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(4)}>
									<div className="margin-menu">
										<NavLink to="/register-inventory" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={doorOpen} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Inicial/Entrada</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/readjustment" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={editIcon} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Inventario físico</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>

								{/* Ofertas */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(10)} className={collapses.includes(10) ? "menu-title active" : "menu-title"} data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(10); history.push('/offer');}}
									>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={bullhornIcon} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Ofertas</div>
												</div>
											</div>
										</div>
									</a>
								</div>

								{/* Ventas */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(5)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(5);}}
									>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={cashRegister} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Ventas {pendingSales !== ''?pendingSales:'' }</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(5) ? angleUp : angleDown} width="18" height="18" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(5)}>
									<div className="margin-menu">
										<NavLink to="/sales" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={chartLine} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Ventas general</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>

								{/* Registro de Salidas */}
								{ (user && user.username == "adminDev") && <>
									<div className="margin-menu">
										<a aria-expanded={collapses.includes(9)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
											onClick={e => { e.preventDefault(); changeCollapse(9);}}
										>
											<div className="parent-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={boxIcon} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Registro de Salidas</div>
													</div>
													<div className="angle-menu">
														<Icon icon={collapses.includes(9) ? angleUp : angleDown} width="18" height="18" />
													</div>
												</div>
											</div>
										</a>
									</div>
									<Collapse isOpen={collapses.includes(9)}>
										<div className="margin-menu">
											<NavLink to="/departure" activeClassName="item-active" className="menu-child">
												<div className="child-item">
													<div className="d-flex">
														<div className="icon-menu">
															<Icon icon={fileAlt} className="icon"/>
														</div>
														<div className="text-menu">
															<div className="text">Registrar</div>
														</div>
													</div>
												</div>
											</NavLink>
										</div>
									</Collapse>
								</>
								}

								{/* Reportes */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(8)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(8);}}
									>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={clipboardCheck} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Reportes</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(8) ? angleUp : angleDown} width="18" height="18" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(8)}>
									<div className="margin-menu">
										<NavLink to="/client-list" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={maleIcon} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Clientes</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/inventory" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={boxesIcon} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Inventario actual</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/inventory-report" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={clipboardIcon} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Reporte de Inventarios</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/balance-report" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={balanceScale} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Balances</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/inventory-report-plus" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={listAlt} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Inventario bruto</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/inventory-report-daily" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={clipboardList} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Reporte diario</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/inventory-history" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={undoAlt} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Historial de Inventario</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/inventory-sell" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={cashRegister} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Ventas</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/departures" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={boxIcon} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Registro de Salidas</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/payment-methods-report" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={moneyBillWave} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Formas de pago</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/inventory-adjustment-history" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={undoAlt} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Historial de Ajustes</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/offer-history" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={undoAlt} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Historial de Ofertas</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/inventory-offer" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={bullhornIcon} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Reporte de Ofertas</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									{ (user && user.username == "adminDev") && <>
										<div className="margin-menu">
											<NavLink to="/cron-history" activeClassName="item-active" className="menu-child">
												<div className="child-item">
													<div className="d-flex">
														<div className="icon-menu">
															<Icon icon={undoAlt} className="icon"/>
														</div>
														<div className="text-menu">
															<div className="text">Historial de Cron</div>
														</div>
													</div>
												</div>
											</NavLink>
										</div>
									</>
									}
								</Collapse>
							</>
						}
						{user.role == 3 && //Gerente
							<>

								{/* Inventarios */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(4)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(4);}}
									>
										<div className="parent-item first-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={dollyIcon} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Inventarios</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(4) ? angleUp : angleDown} width="18" height="18" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(4)}>
									<div className="margin-menu">
										<NavLink to="/register-inventory" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={doorOpen} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Inicial/Entrada</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/readjustment" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={editIcon} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Inventario físico</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>

								{/* Caja */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(11)} className="menu-title" data-parent="#accordion" href="#"
										id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(11);}}
									>
										<div className="parent-item first-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={briefcaseIcon} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Caja</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(11) ? angleUp : angleDown} width="18" height="18" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(11)}>
									<div className="margin-menu">
										<NavLink to="/box-opening" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={folderPlus} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Apertura</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/box-withdrawal" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={folderMinus} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Retiro</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/box-close" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={tasksIcon} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Cierre</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/box-close-report" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={tableIcon} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Reporte de cierres</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>
								
								{/* Ofertas */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(10)} className={collapses.includes(10) ? "menu-title active" : "menu-title"} data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(10); history.push('/offer');}}
									>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={bullhornIcon} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Ofertas</div>
												</div>
											</div>
										</div>
									</a>
								</div>
								
								{/* Ventas */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(5)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(5);}}
									>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={cashRegister} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Ventas {pendingSales !== ''?pendingSales:'' }</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(5) ? angleUp : angleDown} width="18" height="18" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(5)}>
									<div className="margin-menu">
										<NavLink to="/sales" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={bookIcon} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Ventas general</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>

								{/* Registro de Salidas */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(9)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(9);}}
									>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={boxIcon} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Registro de Salidas</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(9) ? angleUp : angleDown} width="18" height="18" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(9)}>
									<div className="margin-menu">
										<NavLink to="/departure" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={fileAlt} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Registrar</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>

								{/* Ventas a credito solo gerente*/}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(12)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(12);}}
									>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={cashRegister} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Créditos</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(12) ? angleUp : angleDown} width="18" height="18" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(12)}>
									<div className="margin-menu">
										<NavLink to="/sales-credit" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={cartPlus} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Registrar venta</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>
								
								{/* Reportes */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(8)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(8);}}
									>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={clipboardCheck} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Reportes</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(8) ? angleUp : angleDown} width="18" height="18" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(8)}>
									<div className="margin-menu">
										<NavLink to="/client-list" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={maleIcon} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Clientes</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/inventory" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={boxesIcon} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Inventario actual</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/balance-report" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={balanceScale} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Balances</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/inventory-report-plus" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={listAlt} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Inventario bruto</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/inventory-report-daily" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={clipboardList} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Reporte diario</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/inventory-sell" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={cashRegister} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Ventas</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/departures" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={boxIcon} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Registro de Salidas</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/payment-methods-report" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={moneyBillWave} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Formas de pago</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/inventory-adjustment-history" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={undoAlt} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Historial de Ajustes</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/offer-history" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={undoAlt} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Historial de Ofertas</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/inventory-offer" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={bullhornIcon} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Reporte de Ofertas</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>
							</>
						}
						{user.role == 4 && //Cajero
							<>
								
								{/* Reportes */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(8)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(8);}}
									>
										<div className="parent-item first-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={clipboardCheck} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Reportes</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(8) ? angleUp : angleDown} width="18" height="18" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(8)}>
									<div className="margin-menu">
										<NavLink to="/client-list" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={maleIcon} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Clientes</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/inventory" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={boxesIcon} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Inventario actual</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>
								
								{/* Ventas */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(5)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(5);}}
									>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={cashRegister} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Ventas {pendingSales !== ''?pendingSales:'' }</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(5) ? angleUp : angleDown} width="18" height="18" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(5)}>
									<div className="margin-menu">
										<NavLink to="/sales-user" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={bookIcon} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Ventas General</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/sales-daily" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={bookMedical} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Ventas del día</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/offline-sales" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={bookDead} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Ventas Offline {pendingSales !== ''?pendingSales:'' }</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/register-sale" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={cartPlus} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Registrar venta</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>
							</>
						}
					</div>	
				</div>
			</div>
		</>
	);
}

export default SideBar;
