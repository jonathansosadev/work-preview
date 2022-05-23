/* eslint-disable */
import React from "react";
import { useSelector } from 'react-redux';
// reactstrap components
import {
  Collapse,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  NavbarBrand,
  Navbar,
  Nav,
} from "reactstrap";
import '../../assets/css/headerAdmin.css';

import { Icon } from '@iconify/react';
import houseUser from '@iconify/icons-fa-solid/house-user';
import indentIcon from '@iconify/icons-fa-solid/indent';
import userIcon from '@iconify/icons-fa-solid/user';
import signOutAlt from '@iconify/icons-fa-solid/sign-out-alt';

function AdminNavbar() {
  const [navbarColor] = React.useState("");
  const [collapseOpen, setCollapseOpen] = React.useState(false);
  const user = useSelector(state => state.authentication.user);
  return (
    <>
		{collapseOpen ? (
			<div id="bodyClick" onClick={() => {
				document.documentElement.classList.toggle("nav-open");
				setCollapseOpen(false);
			}}
			/>
		) : null}
      	<Navbar className={"flex-column flex-md-row bd-navbar headerAdmin" + navbarColor} expand="lg" color="header">
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
				> <Icon icon={indentIcon} width="20" height="20" />
				</NavbarBrand>
				{(user.role !== 1 && user.role !== 2) && 
					<NavbarBrand
						style={{fontSize:14, fontWeight:"bold", fontStyle:"italic", color:"black"}}
						href="#"
						id="navbar-brand"
						onClick={(event) => {event.preventDefault();}
					}> {user.agency.name} 
					</NavbarBrand>
				}
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
							<Icon icon={userIcon} width="25" height="25" />
						</DropdownToggle>
						<DropdownMenu aria-labelledby="navbarDropdownMenuLink" className="dropdown-menu-right">
							<DropdownItem href="/profile"><Icon icon={userIcon} width="12" height="12" style={{ marginRight:5 }}/>Mi perfil</DropdownItem>
							<DropdownItem href="/login"><Icon icon={signOutAlt} width="12" height="12" style={{ marginRight:5 }}/>Salir</DropdownItem>
						</DropdownMenu>
					</UncontrolledDropdown>
				</Nav>
          </Collapse>
      </Navbar>
    </>
  );
}

export default AdminNavbar;
