/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { history } from '../../helpers';
import { userActions } from '../../actions';
import { useDispatch, useSelector } from 'react-redux';
// reactstrap components
import { Collapse, Modal, Button } from "reactstrap";
import { useLocation, NavLink  } from "react-router-dom";
import { Icon } from '@iconify/react';
import { useIdleTimer } from 'react-idle-timer';
import settings4Fill from '@iconify-icons/ri/settings-4-fill';
import arrowDropDownLine from '@iconify-icons/ri/arrow-drop-down-line';
import arrowDropUpLine from '@iconify-icons/ri/arrow-drop-up-line';
import listCheck from '@iconify-icons/ri/list-check';
import addCircleFill from '@iconify-icons/ri/add-circle-fill';
import building4Fill from '@iconify-icons/ri/building-4-fill';
import bookMarkFill from '@iconify-icons/ri/book-mark-fill';
import filePaper2Line from '@iconify-icons/ri/file-paper-2-line';
import contactsBook2Fill from '@iconify-icons/ri/contacts-book-2-fill';
import openArmFill from '@iconify-icons/ri/open-arm-fill';
import fileCloudFill from '@iconify-icons/ri/file-cloud-fill';
import mailSettingsFill from '@iconify-icons/ri/mail-settings-fill';
import accountBoxFill from '@iconify-icons/ri/account-box-fill';
import draftFill from '@iconify-icons/ri/draft-fill';
import userShared2Fill from '@iconify-icons/ri/user-shared-2-fill';
import bookReadFill from '@iconify-icons/ri/book-read-fill';
import handCoinFill from '@iconify-icons/ri/hand-coin-fill';
import exchangeDollarLine from '@iconify-icons/ri/exchange-dollar-line';
import wallet3Fill from '@iconify-icons/ri/wallet-3-fill';
import surveyLine from '@iconify-icons/ri/survey-line';
import userReceivedFill from '@iconify-icons/ri/user-received-fill';
import alertFill from '@iconify-icons/ri/alert-fill';
import chat4Line from '@iconify-icons/ri/chat-4-line';
import parentFill from '@iconify-icons/ri/parent-fill';
import calendarEventLine from '@iconify-icons/ri/calendar-event-line';
//Menu lateral en admin
function SideBar() {

	const location = useLocation();
	const dispatch = useDispatch();
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

    useEffect(() => {
		
		let page = location.pathname;

		if(page === "/agency" ||  page === "/register-agency"){
			changeCollapse(1);
		}

		if(page === "/career" ||  page === "/register-career"){
			changeCollapse(2);
		}

		if(page === "/matter" ||  page === "/register-matter"){
			changeCollapse(3);
		}

		if(page === "/teacher" ||  page === "/register-teacher" ||  page === "/teacher-matter" ||  page === "/teacher-update" ||  page === "/teacher-reset"){
			changeCollapse(4);
		}

		if(page === "/students" ||  page === "/student-update" || page === "/documents" || page === "/upload-document"){
			changeCollapse(5);
		}

		if(page === "/users" || page === "/users-update" || page === "/register-user"){
			changeCollapse(6);
		}

		if(page === "/inscriptions" ||  page === "/register-inscription" ||  page === "/update-inscription" || page === "/custom-inscription"){
			changeCollapse(7);
		}

		if(page === "/files" ||  page === "/upload-file" ||  page === "/files-user" ||  page === "/files-admin"){
			changeCollapse(8);
		}

		if(page === "/log-emails"){
			changeCollapse(9);
		}

		if(page === "/profile"){
			changeCollapse(10);
		}

		if(page === "/scores" || page === "/student-score" || page === "/update-score" || page === "/score-log" || page === "/score-request" || page === "/view-kardex" || page == "/score-list"){
			changeCollapse(11);
		}

		if(page === "/offer" || page === "/create-offer" || page === "/offer-history"){
			changeCollapse(12);
		}

		if(page === "/detail-reference" || page === "/admin-references" || page === "/references" || page === "/references-admin" || page === "/references-update" || page === "/view-reference" ){
			changeCollapse(13);
		}

		if( page === "/list-document" || page === "/detail-document"){
			changeCollapse(14);
		}

		if(page === "/admin-notifications" || page === "/notifications"  || page === "/notification-detail" 
		|| page === "/notification-report" || page === "/notification-create" || page === "/notification-update"){
			changeCollapse(15);
		}
		
		if(page === "/groups" || page === "/register-group"){
			changeCollapse(16);
		}

		if(page === "/timetable" || page === "/register-timetable" ||  page === "/update-timetable"){
			changeCollapse(17);
		}

	}, [location]);
	
	//Modal genérico y mensaje
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMsg, setModalMsg] = useState('');

	/**
	 * 	Cerrar sesion a los 10 min de inactividad
	 */
    const handleOnIdle = () => {
		//console.log('ultima actividad', getLastActiveTime());
		setModalVisible(true);
		setModalMsg('Su sesión ha caducado. Vuelva a iniciar sesión');
		localStorage.removeItem('user');
    }

    const { getLastActiveTime } = useIdleTimer({
        timeout: 600000,//10 min //600000
        onIdle: handleOnIdle,
        debounce: 500
	});

	const onCloseModal = () => {
		dispatch(userActions.logout()); 
		setModalVisible(false); 
		setModalMsg('');
	};

	useEffect(() => {
        if(!user){
            history.push('/');// login
        }
    }, [user]);

	return (
		<>
			<div id="sidebar-wrapper">{/* bg-light */}
				<div className="sidebar-heading">
					<button className="logo" onClick={()=>{history.push({pathname: '/home'})}}>
							<div className={"uno-logo red-wine"}>
								<div className="d-flex">
									<div className="uno">
										<div style={{marginRight:5}}>UNO</div>
									</div>
									<div className="uno-des">
										<div>
											<div className="text-logo">UNIVERSIDAD</div>
											<div className="text-logo">NACIONAL</div>
											<div className="text-logo">OBRERA</div>
										</div>
									</div>
								</div>
							</div>
					</button>
				</div>
				<div className="list-group list-group-flush" >
					<div aria-multiselectable={true} id="accordion" role="tablist">
						{(user && user.role == 1) && 
							<>
								{/* Sistema */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(6)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(6);}}>
										<div className="parent-item first-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={settings4Fill} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Sistema</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(6) ? arrowDropUpLine : arrowDropDownLine} width="30" height="30" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(6)}>
									<div className="margin-menu">
										<NavLink to="/users" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={listCheck} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Usuarios</div>
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
														<Icon icon={addCircleFill} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Agregar</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>

								{/* Notificaciones */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(15)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(15);}}>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={chat4Line} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Notificaciones</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(15) ? arrowDropUpLine : arrowDropDownLine} width="30" height="30" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(15)}>
									<div className="margin-menu">
										<NavLink to="/admin-notifications" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={listCheck} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Lista</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/notification-create" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={addCircleFill} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Agregar</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/notification-report" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={listCheck} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Reporte</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>

								{/* Sedes */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(1)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(1);}}>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={building4Fill} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Sedes</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(1) ? arrowDropUpLine : arrowDropDownLine} width="30" height="30" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(1)}>
									<div className="margin-menu">
										<NavLink to="/agency" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={listCheck} className="icon"/>
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
														<Icon icon={addCircleFill} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Agregar</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>

								{/* Promociones */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(12)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(12);}}>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={handCoinFill} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Promociones</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(12) ? arrowDropUpLine : arrowDropDownLine} width="30" height="30" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(12)}>
									<div className="margin-menu">
										<NavLink to="/offer" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={listCheck} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Lista</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/create-offer" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={addCircleFill} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Agregar</div>
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
														<Icon icon={exchangeDollarLine} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Historial</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>

								{/* Carreras */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(2)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(2);}}>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={filePaper2Line} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Carreras</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(2) ? arrowDropUpLine : arrowDropDownLine} width="30" height="30" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(2)}>
									<div className="margin-menu">
										<NavLink to="/career" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={listCheck} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Lista</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/register-career" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={addCircleFill} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Agregar</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>

								{/* Materias */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(3)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(3);}}>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={bookMarkFill} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Materias</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(3) ? arrowDropUpLine : arrowDropDownLine} width="30" height="30" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(3)}>
									<div className="margin-menu">
										<NavLink to="/matter" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={listCheck} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Lista</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/register-matter" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={addCircleFill} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Agregar</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>

								{/* Grupos */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(16)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(16);}}>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={parentFill} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Grupos</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(16) ? arrowDropUpLine : arrowDropDownLine} width="30" height="30" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(16)}>
									<div className="margin-menu">
										<NavLink to="/groups" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={listCheck} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Lista</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/register-group" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={addCircleFill} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Agregar</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>

								{/* Calendarios */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(17)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(17);}}>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={calendarEventLine} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Calendarios</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(17) ? arrowDropUpLine : arrowDropDownLine} width="30" height="30" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(17)}>
									<div className="margin-menu">
										<NavLink to="/timetable" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={listCheck} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Lista</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/register-timetable" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={addCircleFill} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Agregar</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>

								{/* Docentes */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(4)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(4);}}>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={contactsBook2Fill} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Docentes</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(4) ? arrowDropUpLine : arrowDropDownLine} width="30" height="30" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(4)}>
									<div className="margin-menu">
										<NavLink to="/teacher" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={listCheck} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Lista</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/register-teacher" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={addCircleFill} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Agregar</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/teacher-matter" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={addCircleFill} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Materias Profesor</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>	
								
								{/* Estudiantes */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(5)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(5);}}>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={openArmFill} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Estudiantes</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(5) ? arrowDropUpLine : arrowDropDownLine} width="30" height="30" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(5)}>
									<div className="margin-menu">
										<NavLink to="/students" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={listCheck} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Lista</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/documents" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={listCheck} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Expedientes</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>	

								{/* Inscripciones */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(7)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(7);}}>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={contactsBook2Fill} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Inscripción</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(7) ? arrowDropUpLine : arrowDropDownLine} width="30" height="30" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(7)}>
									<div className="margin-menu">
										<NavLink to="/inscriptions" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={listCheck} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Lista</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/register-inscription" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={addCircleFill} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Agregar</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/custom-inscription" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={userReceivedFill} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Alumnos regulares</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>	

								{/* Referencias */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(13)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(13);}}>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={wallet3Fill} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Referencias</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(13) ? arrowDropUpLine : arrowDropDownLine} width="30" height="30" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(13)}>
									<div className="margin-menu">
										<NavLink to="/admin-references" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={listCheck} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Lista</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>	

								{/* Calificaciones */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(11)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(11);}}>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={draftFill} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Calificaciones</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(11) ? arrowDropUpLine : arrowDropDownLine} width="30" height="30" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(11)}>
									<div className="margin-menu">
										<NavLink to="/score-list" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={listCheck} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Lista</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/score-log" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={bookReadFill} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Historial</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>	

								{/* Material didáctico */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(8)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(8);}}>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={fileCloudFill} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Material didáctico</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(8) ? arrowDropUpLine : arrowDropDownLine} width="30" height="30" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(8)}>
									<div className="margin-menu">
										<NavLink to="/files-admin" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={listCheck} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Lista</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/upload-file" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={addCircleFill} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Agregar</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>	

								{/* Log emails */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(9)} className={collapses.includes(9) ? "menu-title active" : "menu-title"} data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(9); history.push('/log-emails');}}>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={mailSettingsFill} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Correos</div>
												</div>
											</div>
										</div>
									</a>
								</div>
								
							</>
						}
						{(user && user.role == 2) && 
							<>
								{/* Perfil */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(10)} className={collapses.includes(10) ? "menu-title active" : "menu-title"} data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(10); history.push('/profile');}}>
										<div className="parent-item first-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={accountBoxFill} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Perfil</div>
												</div>
											</div>
										</div>
									</a>
								</div>

								{/* Notificaciones */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(15)} className={collapses.includes(15) ? "menu-title active" : "menu-title"} data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(15); history.push('/notifications');}}>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={chat4Line} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Notificaciones</div>
												</div>
											</div>
										</div>
									</a>
								</div>

								{/* Calendario profesor */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(17)} className={collapses.includes(17) ? "menu-title active" : "menu-title"} data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(17); history.push('/calendar');}}>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={calendarEventLine} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Calendario</div>
												</div>
											</div>
										</div>
									</a>
								</div>

								{/* Calificaciones */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(11)} className={collapses.includes(11) ? "menu-title active" : "menu-title"} data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(11); history.push('/student-score');}}>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={draftFill} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Calificaciones</div>
												</div>
											</div>
										</div>
									</a>
								</div>
								{/* Material didáctico */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(8)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(8);}}>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={fileCloudFill} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Material didáctico</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(8) ? arrowDropUpLine : arrowDropDownLine} width="30" height="30" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(8)}>
									<div className="margin-menu">
										<NavLink to="/files" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={userShared2Fill} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Mis archivos</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/files-user" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={listCheck} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Lista</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
									<div className="margin-menu">
										<NavLink to="/upload-file" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={addCircleFill} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Agregar</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>	
								
							</>
						}
						{/* Estudiantes */}
						{(user && user.role == 3) && 
							<>
								{/* Perfil */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(10)} className={collapses.includes(10) ? "menu-title active" : "menu-title"} data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(10); history.push('/profile');}}>
										<div className="parent-item first-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={accountBoxFill} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Perfil</div>
												</div>
											</div>
										</div>
									</a>
								</div>
								
								{/* Calendario estudiante */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(17)} className={collapses.includes(17) ? "menu-title active" : "menu-title"} data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(17); history.push('/calendar');}}>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={calendarEventLine} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Calendario</div>
												</div>
											</div>
										</div>
									</a>
								</div>

								{/* Calificaciones */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(11)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(11);}}>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={draftFill} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Calificaciones</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(11) ? arrowDropUpLine : arrowDropDownLine} width="30" height="30" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(11)}>
									<div className="margin-menu">
										<NavLink to="/scores" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={listCheck} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Lista</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>	
								<Collapse isOpen={collapses.includes(11)}>
									<div className="margin-menu">
										<NavLink to="/score-request" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={surveyLine} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Kardex</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>	

								{/* Documentos */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(14)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(14);}}>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={wallet3Fill} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Expediente</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(14) ? arrowDropUpLine : arrowDropDownLine} width="30" height="30" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(14)}>
									<div className="margin-menu">
										<NavLink to="/list-document" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={listCheck} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Lista</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>	

								{/* Referencias */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(13)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(13);}}>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={wallet3Fill} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Referencias</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(13) ? arrowDropUpLine : arrowDropDownLine} width="30" height="30" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(13)}>
									<div className="margin-menu">
										<NavLink to="/references" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={listCheck} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Lista</div>
													</div>
												</div>
											</div>
										</NavLink>
									</div>
								</Collapse>	

								{/* Material didáctico */}
								<div className="margin-menu">
									<a aria-expanded={collapses.includes(8)} className="menu-title" data-parent="#accordion" href="#" id="collapseOne" 
										onClick={e => { e.preventDefault(); changeCollapse(8);}}>
										<div className="parent-item">
											<div className="d-flex">
												<div className="icon-menu">
													<Icon icon={fileCloudFill} className="icon"/>
												</div>
												<div className="text-menu">
													<div className="text">Material didáctico</div>
												</div>
												<div className="angle-menu">
													<Icon icon={collapses.includes(8) ? arrowDropUpLine : arrowDropDownLine} width="30" height="30" />
												</div>
											</div>
										</div>
									</a>
								</div>
								<Collapse isOpen={collapses.includes(8)}>
									<div className="margin-menu">
										<NavLink to="/files-user" activeClassName="item-active" className="menu-child">
											<div className="child-item">
												<div className="d-flex">
													<div className="icon-menu">
														<Icon icon={listCheck} className="icon"/>
													</div>
													<div className="text-menu">
														<div className="text">Lista</div>
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
			<Modal toggle={onCloseModal} isOpen={modalVisible} backdrop="static">
				<div className="modal-header">
					<h5 className="modal-title">Sesión</h5>
					<button aria-label="Close" className="close" type="button" onClick={onCloseModal}>
						<span aria-hidden={true}>×</span>
					</button>
				</div>
				<div className="modal-body">
					<p className="text-center"><Icon icon={alertFill} color="red"/>{modalMsg}</p>
				</div>
				<div className="modal-footer justify-content-center">
					<Button color="secondary" className="btn-round" outline type="button" onClick={onCloseModal}>
						Cerrar
					</Button>
				</div>
			</Modal>
		</>
	);
}

export default SideBar;
