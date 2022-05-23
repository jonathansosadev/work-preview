/* eslint-disable */
import React, {useState} from "react";
// reactstrap components
import { history } from '../../helpers';
import {
	Collapse,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
	UncontrolledDropdown,
	NavbarBrand,
	Navbar,
	Nav,
	Modal,
	Button 
} from "reactstrap";
import { Icon } from '@iconify/react';
import gitRepositoryFill from '@iconify-icons/ri/git-repository-fill';
import home3Fill from '@iconify-icons/ri/home-3-fill';
import '../../assets/css/header.css';

function AdminNavbar() {

	const [navbarColor] = useState("");
	const [collapseOpen, setCollapseOpen] = useState(false);

  	//Modal genérico y mensaje
	const [modalVisible, setModalVisible] = useState(false);
	const [modalMsg, setModalMsg] = useState('');

	/**
	 * 	Cerrar sesion
	 */
    const handleLogout = () => {
		setModalVisible(true);
		setModalMsg('¿Está seguro que desea salir del sistema?');
    }

	return (
		<>
			{collapseOpen ? (
				<div id="bodyClick" onClick={() => {
					document.documentElement.classList.toggle("nav-open");
					setCollapseOpen(false);
				}}
				/>
			) : null}
			<Navbar className={"flex-column flex-md-row bd-navbar" + navbarColor} expand="lg" color="primary">
				<div className="navbar-translate">
					<NavbarBrand
						href="#"
						id="navbar-brand"
						onClick={(event) => {
							event.preventDefault();
							const oldClassName = document.getElementById('wrapper').className;
							const newClassName = oldClassName === 'd-flex toggled' ? 'd-flex' : 'd-flex toggled';
							document.getElementById('wrapper').className  = newClassName;
							setCollapseOpen(false);
					}}
					> <Icon icon={gitRepositoryFill} width="20" height="20"/> Menú 
					</NavbarBrand>
					<button
						className="navbar-toggler navbar-toggler"
						onClick={() => {
							document.documentElement.classList.toggle("nav-open");
							setCollapseOpen(!collapseOpen);
						}}
						aria-expanded={collapseOpen}
						type="button"
					>
						<span className="navbar-toggler-bar top-bar"></span>
						<span className="navbar-toggler-bar middle-bar"></span>
						<span className="navbar-toggler-bar bottom-bar"></span>
					</button>
				</div>
				<Collapse
					className="justify-content-end"
					isOpen={collapseOpen}
					navbar
				>
					<Nav navbar>
						<UncontrolledDropdown nav>
							<DropdownToggle
								aria-haspopup={true}
								caret
								color="default"
								data-toggle="dropdown"
								href="#"
								id="navbarDropdownMenuLink"
								nav
								onClick={e => e.preventDefault()}
							>
								<Icon icon={home3Fill} width="20" height="20"/>
							</DropdownToggle>
							<DropdownMenu aria-labelledby="navbarDropdownMenuLink" className="dropdown-menu-right">
								<DropdownItem href="/profile">Mi perfil</DropdownItem>
								<DropdownItem  onClick={handleLogout}>Salir</DropdownItem>
							</DropdownMenu>
						</UncontrolledDropdown>
					</Nav>
			</Collapse>
		</Navbar>
		<Modal toggle={() => {setModalVisible(false); setModalMsg('')}} isOpen={modalVisible}>
			<div className="modal-header">
				<h5 className="modal-title">Cerrar sesión</h5>
				<button aria-label="Close" className="close" type="button" onClick={() =>  {setModalVisible(false); setModalMsg('')}}>
					<span aria-hidden={true}>×</span>
				</button>
			</div>
			<div className="modal-body">
				<p>{modalMsg}</p>
			</div>
			<div className="modal-footer mr auto">
				<Button color="primary" className="btn-round" onClick={(e)=>{e.preventDefault(); history.push('/')}}>
					Aceptar
				</Button>
				<Button color="secondary" className="btn-round" outline type="button" onClick={() =>  {setModalVisible(false); setModalMsg('')}}>
					Cancelar
				</Button>
			</div>
		</Modal>
		</>
	);
}

export default AdminNavbar;
