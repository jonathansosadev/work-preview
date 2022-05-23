/* eslint-disable */
import React from "react";
import { Link } from "react-router-dom";
// reactstrap components
import {
	Collapse,
	NavbarBrand,
	Navbar,
	NavItem,
	NavLink,
	Nav,
	Container,
} from "reactstrap";

import uno from '../../assets/img/uno.png';

function LoginNavbar() {
  const [navbarColor, setNavbarColor] = React.useState("navbar-transparent");
  const [collapseOpen, setCollapseOpen] = React.useState(false);
  React.useEffect(() => {
		const updateNavbarColor = () => {
		if (
			document.documentElement.scrollTop > 399 ||
			document.body.scrollTop > 399
		) {
			setNavbarColor("");
		} else if (
			document.documentElement.scrollTop < 400 ||
			document.body.scrollTop < 400
		) {
			setNavbarColor("navbar-transparent");
		}
		};
		window.addEventListener("scroll", updateNavbarColor);
		return function cleanup() {
			window.removeEventListener("scroll", updateNavbarColor);
		};
	});
	return (
		<>
		{collapseOpen ? (
			<div
			id="bodyClick"
			onClick={() => {
				document.documentElement.classList.toggle("nav-open");
				setCollapseOpen(false);
			}}
			/>
		) : null}
		<Navbar className={"fixed-top " + navbarColor} color="red-wine" expand="lg">
			<Container>

			<div className="navbar-translate">
				<NavbarBrand
				href="#"
				id="navbar-brand"
				>
				<img
                 	width="40%"
                    alt="..."
                    src={uno}
                ></img>
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
				<NavItem>
					<NavLink to="/" tag={Link} style={{fontSize:12}}>
						Iniciar Sesión
					</NavLink>
				</NavItem>
				</Nav>
			</Collapse>
			</Container>
		</Navbar>
    </>
  );
}

export default LoginNavbar;
