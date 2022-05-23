/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { documentActions } from '../../actions';
import moment from 'moment';
import { history } from '../../helpers';
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import DataTable from 'react-data-table-component';
import { Button, Spinner, Row, Col, Card, CardBody, CardText, CardTitle  } from 'reactstrap';
import '../../assets/css/table.css';
import { Icon } from '@iconify/react';
import searchEyeLine from '@iconify-icons/ri/search-eye-line';
import errorWarningFill from '@iconify-icons/ri/error-warning-fill';
import alertFill from '@iconify-icons/ri/alert-fill';
import checkboxCircleFill from '@iconify-icons/ri/checkbox-circle-fill';

function DocListPage() {

  	useEffect(() => {
		document.body.classList.add("landing-page");
		document.body.classList.add("sidebar-collapse");
		document.documentElement.classList.remove("nav-open");
		return function cleanup() {
			document.body.classList.remove("landing-page");
			document.body.classList.remove("sidebar-collapse");
		};
  	});

    const dispatch = useDispatch();
	const dataFiles = useSelector(state => state.documents.data);
    const loadingPage = useSelector(state => state.documents.loading);

	//Verificar data de redux
	useEffect(() => {
		if(dataFiles && dataFiles.results){
			setData(dataFiles.results);
        }
    },[dataFiles]);

	// Inicializar tabla sin data
	const [data, setData] = useState([]);
	const user = useSelector(state => state.authentication.user);
	
	//Columnas Data table
	const columns = [
		{
			name: 'Tipo de documento',
			selector: 'typeDescription',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Fecha de registro',
			selector: 'createdDate',
			sortable: true,
			wrap:true,
			cell : (row)=>{
				return moment(row.createdDate).local().format("YYYY-MM-DD")
			},
		},
		{
			name: '',
            button: true,
			cell: row => 
            <div className="d-flex">
                <Button className="btn-link" color="primary" size="sm" onClick={e => 
                    {
                        e.preventDefault(); 
                        history.push('/detail-document',{doc:row});
                    }
			    }><Icon icon={searchEyeLine} className="icon" width={20} height={20}/></Button>
            </div>,
		},
	];

	//obtener data de usuario necesaria
	const getUserData = () => {
		let data = {
			id: user.id,
			role:user.role,
		}
		return data;
	}

	//Consultar al entrar
	useEffect(() => {
		dispatch(documentActions.documentStudent(getUserData()));
	}, []);

	//Loader de la tabla
	const CustomLoader = () => (<><Spinner  color="primary" style={{ width: '1.5rem', height: '1.5rem' }} /></>);
    
	//Notificaciones de acuerdo a los documentos subidos
	const Notification = () => {

		if(data.length == 0){
			return <>
				<CardTitle tag="h5"><Icon icon={alertFill} color="red" className="icon" width={20} height={20}/> Sube tus documentos</CardTitle>
				<div className="text-left">	
					<ul className="notification">
						<li>Acta de nacimiento</li>
						<li>CURP</li>
						<li>Certificado de preparatoria</li>
						<li>Comprobante de domicilio</li>
						<li>Frontal identificación oficial</li>
						<li>Reverso identificación oficial</li>
					</ul>
					<p style={{fontSize:14}}>Debe ser legible la información del documento o de lo contrario no será aprobado</p>
				</div>
				<Button color="primary" className="btn-round" onClick={()=>{history.push('/upload-document')}}>Agregar documento</Button>
			</>
		}else if(data.length >= 1 && data.length <= 5){
			return <>
				<CardTitle tag="h5"><Icon icon={errorWarningFill} color="red" className="icon" width={20} height={20}/> Sube tus documentos</CardTitle>
				<p style={{fontSize:14}}>Los documentos que subas a la plataforma, deberán estar legibles y actualizados.</p>
			</>
		}else if(data.length == 6){
			return <>
			<CardTitle tag="h5"><Icon icon={checkboxCircleFill} color="green" className="icon" width={20} height={20}/> ¡Excelente!</CardTitle>
			<p style={{fontSize:14}}>Estás al día con tus documentos, éstos serán revisados, y en dado caso se te solicitará cargar la información
			nuevamente</p>
		</>
		}else{
			return <></>
		}
	};
	
    return (
        <>
            <div className="d-flex" id="wrapper">
				<SideBar/>
				<div id="page-content-wrapper">
					<AdminNavbar/>
					<div className="flex-column flex-md-row p-3">
						<Row>
							<Col sm="12" md={{ size: 8, offset: 2 }}>
								<div className="d-flex justify-content-between" style={{padding:"4px 16px 4px 24px"}}>
									<div className="align-self-center">
										<h3 style={{ marginBottom: '0' }}>Documentos</h3>
									</div>
								</div>
								<DataTable
									className="dataTables_wrapper"
									responsive
									highlightOnHover
									striped
									sortIcon={ <i className="fa fa-arrow-down ml-2" aria-hidden="true"></i> }
									title="Documentos"
									columns={columns}
									data={data}
									progressPending={loadingPage}
									persistTableHead
									progressComponent={<CustomLoader />}
									noDataComponent="No hay registros para mostrar"
									noHeader={true}
								/>
							</Col>
							{/* <Col xs="12" md="4" className="d-none d-lg-block"  align="center">
								<Card style={{ width: "20rem", boxShadow: "0px 5px 25px 0px rgb(0 0 0 / 12%)" }}>
									<CardBody>
										<Notification/>
									</CardBody>
								</Card>
							</Col> */}
						</Row>
					</div>
				</div>
            </div>
        </>
    );
}

export default DocListPage;