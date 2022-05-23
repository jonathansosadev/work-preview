/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { scoreActions, careerActions } from '../../actions';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import DataTable from 'react-data-table-component';
import { Button, Spinner, Row, Col, Form, FormGroup, Table  } from 'reactstrap';
//componente dataTableStudent sede
import { history } from '../../helpers';
import '../../assets/css/table.css';
import { useForm  } from "react-hook-form";
import { Icon } from '@iconify/react';
import draftFill from '@iconify-icons/ri/draft-fill';

function ScoreStudentListPage() {

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

	const dataStudents = useSelector(state => state.score.data);
    const loadingPage = useSelector(state => state.score.loading);

	//Verificar data de redux
	useEffect(() => {
		if(dataStudents && dataStudents.results){
			setData(dataStudents.results);
        }
        if(dataStudents && dataStudents.metadata && dataStudents.metadata[0]){
			setRowCount(dataStudents.metadata[0].total);
		}
		if(dataStudents && dataStudents.matters){
			setTeacherClass(dataStudents.matters);
        }
	},[dataStudents]);

	// Inicializar tabla sin data
	const [data, setData] = useState([])
	const [teacherClass, setTeacherClass] = useState([])
	const [rowCount, setRowCount] = useState(0)

	//obtener carreras para select
	const getting = useSelector(state => state.careers.getting);
	const careers = useSelector(state => state.careers);
	useEffect(() => {
		dispatch(careerActions.listCareers());
	},[]);

	const [listCareers, setListCareers] = useState(null);

	useEffect(() => {
		if(careers.obtained){
			//sin tronco comun
			let select = careers.list.filter(item => item.trunk == false);
			setListCareers(select);
		}
	},[careers.obtained]);

	//Columnas Data table
	const columns = [
		{
			name: 'Id',
			selector: '_id',
			sortable: true,
			wrap:true,
			omit:true,
		},
		{
			name: 'Sede',
			selector: 'agency.name',
			sortable: true,
			cell : (row)=>{
				return row.agency ? row.agency.name: ''
			},
			wrap:true,
			omit:true,
		},
		{
			name: 'Carrera',
			selector: 'career.name',
			sortable: true,
			cell : (row)=>{
				return row.career ? row.career.name: ''
			},
			wrap:true,
		},
		{
			name: 'Documento',
			selector: 'student.document',
			sortable: true,
			omit:true
		},
		{
			name: 'Matrícula',
			selector: 'student.registrationNumber',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Nombres',
			selector: 'student.firstName',
			sortable: true,
		},
		{
			name: 'Apellidos',
			selector: 'student.lastName',
			sortable: true,
		},
		{
			name: 'Email',
			selector: 'student.email',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Periodo',
			selector: 'period',
			sortable: true,
			wrap:true,
		},
		{
			name: '',
            button: true,
            width: '110px',
			cell: row => 
            <div className="d-flex">
                <Button className="btn-link" color="primary" size="sm" onClick={e => 
                    {
						e.preventDefault(); 
						// Enviar id de estudiante y materias impartidas del profesor
                        history.push('/update-score',{student:row.student._id, class:teacherClass, inscription: row._id, row})
                    }
			    }><Icon icon={draftFill} width={20} height={20}/></Button>
            </div>,
		},
	];

	const [perPage, setPerPage] = useState(10);
	const [perPageSelect, setPerPageSelect] = useState(0);
	const [direction, setDirection] = useState({});

	const [filters, setFilters] = useState('');

	//obtener data de usuario necesaria
	const getUserData = () => {
		let data = {
			id: user.id,
			role:user.role,
			agency:user.agency
		}
		return data;
	}
	
	//data inicial
	const getDataTable = (page) => {
		dispatch(scoreActions.dataTableStudent(getUserData(), page, perPageSelect == 0 ? perPage : perPageSelect, direction, {}));
	}
	
	//Paginar
	const handlePageChange = async (page) => {
		dispatch(scoreActions.dataTableStudent(getUserData(), perPageSelect == 0 ? perPage : perPageSelect, direction, filters ? filters: {}));
	};
	
	//Ordenar
	const handleSort = (column, sortDirection) => {
		let sort = {"id": column.selector, "desc": (sortDirection == "asc" ? false : true) }
		setDirection(sort);
		dispatch(scoreActions.dataTableStudent(getUserData(), 1, perPageSelect == 0 ? perPage : perPageSelect, sort, filters ? filters: {}));
	};

	//Cambiar cantidad de filas
	const handlePerRowsChange = async (newPerPage, page) => {
		setPerPageSelect(newPerPage);
		dispatch(scoreActions.dataTableStudent(getUserData(),page, newPerPage, direction, filters ? filters: {}));
	};

	//Consultar al entrar
	useEffect(() => {
		getDataTable(1);
	}, []);

	//Opciones de paginacion
	const paginationOptions = { rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' };

	//Loader de la tabla
	const CustomLoader = () => (<><Spinner  color="primary" style={{ width: '1.5rem', height: '1.5rem' }} /></>);

	const clearFilters = () =>{
		setRegisterDate(''); 
        reset();
        reset({document:'', fistName:'', lastName:'',  email:'', period:''})
	}

    //Form Data Filter
	const { handleSubmit, register, reset } = useForm();
    
    //Abrir/Cerrar filtros
	const [isOpen, setIsOpen] = useState(false);
	const toggle = () => setIsOpen(!isOpen);

    //Consultar por filtros
	const onFilterData = (data, e) => {
		setFilters(data);
		dispatch(scoreActions.dataTableStudent(getUserData(), 1, perPageSelect == 0 ? perPage : perPageSelect, direction, data))
	}
	
	//Data al expandir una fila
	const ExpandedComponent = ({ data }) => (
		<>
			<Table>
				<thead>
					<tr>
						<th>Cuatrimestre</th>			
						<th>Materia</th>
						<th>Código</th>
					</tr>
				</thead>
				<tbody>
				{ data.matters && data.matters.map((matter, index) => {
					// Solo mostrar materias dictadas por el profesor
					let exist = teacherClass.includes(matter._id);
					if(exist){
						return (
							<tr key={index}>
								<td>{matter.quarter}</td>
								<td>{matter.name}</td>
								<td>{matter.code}</td>
							</tr>
						)
					}
					})
				}
      			</tbody>
    		</Table>
	  	</>
	);

    return (
        <>
            <div className="d-flex" id="wrapper">
				<SideBar/>
				<div id="page-content-wrapper">
					<AdminNavbar/>
					<div className="flex-column flex-md-row p-3">
						<div className="d-flex justify-content-between" style={{padding:"4px 16px 4px 24px"}}>
							<div className="align-self-center">
								<h3 style={{ marginBottom: '0' }}>Calificaciones</h3>
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
									<FormGroup className="mr-3">
										{getting && <span className="spinner-border spinner-border-sm mr-1"></span>}
										<select className='form-control' name="career"
											ref={register}>
												<option key="" name="" value="">Seleccione carrera</option>
												{listCareers && listCareers.map(list => 
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
											name="registrationNumber"
											placeholder="Matrícula"
											type="text"
											ref={register}
										></input>
									</FormGroup>
                                    <FormGroup className="mr-3">
										<input
											className="form-control"
											name="firstName"
											placeholder="Nombres"
											type="text"
											ref={register}
										></input>
									</FormGroup>
                                    <FormGroup className="mr-3">
										<input
											className="form-control"
											name="lastName"
											placeholder="Apellidos"
											type="text"
											ref={register}
										></input>
									</FormGroup>
                                    <FormGroup className="mr-3">
										<input
											className="form-control"
											name="email"
											placeholder="Email"
											type="text"
											ref={register}
										></input>
									</FormGroup>
									<FormGroup className="mr-3">
										<input
											className="form-control"
											name="period"
											placeholder="Periodo"
											type="text"
											ref={register}
										></input>
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
								expandableRows
								expandableRowsComponent={<ExpandedComponent />}
								responsive
								highlightOnHover
								striped
								sortIcon={ <i className="fa fa-arrow-down ml-2" aria-hidden="true"></i> }
								title="Profesores"
								columns={columns}
								data={data}
								progressPending={loadingPage}
								pagination
								paginationServer
								paginationTotalRows={rowCount}
								onSort={handleSort}
								sortServer
								onChangeRowsPerPage={handlePerRowsChange}
								onChangePage={handlePageChange}
								paginationComponentOptions={paginationOptions}
								persistTableHead
								progressComponent={<CustomLoader />}
								noDataComponent="No hay registros para mostrar"
								noHeader={true}
							/>
							</Col>
						</Row>
					</div>
				</div>
            </div>
        </>
    );
}

export default ScoreStudentListPage;