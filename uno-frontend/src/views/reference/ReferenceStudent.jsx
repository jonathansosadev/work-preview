/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { referenceActions } from '../../actions';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import DataTable from 'react-data-table-component';
import { Button, Spinner, Row, Col, Form, FormGroup  } from 'reactstrap';
//componente dataTableStudent sede
import '../../assets/css/table.css';
import { useForm  } from "react-hook-form";
import NumberFormat from 'react-number-format';
import { history } from '../../helpers';
import { Icon } from '@iconify/react';
import download2Fill from '@iconify-icons/ri/download-2-fill';
import moment from 'moment';

function ReferenceStudentPage() {

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

	const dataStudents = useSelector(state => state.reference.data);
    const loadingPage = useSelector(state => state.reference.loading);

	//Verificar data de redux
	useEffect(() => {
		if(dataStudents && dataStudents.results){
			setData(dataStudents.results);
        }
        if(dataStudents && dataStudents.metadata && dataStudents.metadata[0]){
			setRowCount(dataStudents.metadata[0].total);
		}
	},[dataStudents]);

	// Inicializar tabla sin data
	const [data, setData] = useState([])
	const [rowCount, setRowCount] = useState(0);

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
		},
		{
			name: 'Vencida',
			selector: 'expired',
			sortable: true,
			cell : (row)=>{
				return (row.expired ? 'Si':'No')
			},
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
			name: 'Referencia',
			selector: 'reference',
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
			name: 'Concepto',
			selector: 'type',
			sortable:true,
			cell : (row)=>{
				if(row.type == 1){
					return 'COLEGIATURA';
				}else{
					return 'INSCRIPCIÓN';
				}
				
			},
		},
		{
			name: 'Estatus',
			selector: 'status',
			sortable:true,
			cell : (row)=>{
				if(row.status == 1){
					return 'PENDIENTE';
				}else{
					return 'PAGADO';
				}
				
			},
		},
		{
			name: 'Monto',
			selector: 'ammount',
			sortable:true,
			cell : (row)=>{
				if(row.ammount){
					return <NumberFormat value={row.ammount} displayType={'text'} thousandSeparator={','} decimalSeparator={'.'}/>
				}else{
					return '';
				}
				
			},
		},
		{
			name: 'Recargos',
			selector: 'surcharges',
			sortable:true,
			cell : (row)=>{
				if(row.surcharges){
					return <NumberFormat value={row.surcharges} displayType={'text'} thousandSeparator={','} decimalSeparator={'.'}/>
				}else{
					return '';
				}
				
			},
		},
		{
			name: 'Total',
			selector: 'total',
			sortable:true,
			cell : (row)=>{
				if(row.total){
					return <NumberFormat value={row.total} displayType={'text'} thousandSeparator={','} decimalSeparator={'.'}/>
				}else{
					return '';
				}
				
			},
		},
		{
			name: 'Fecha de vencimiento',
			selector: 'expirationDate',
			sortable: true,
			cell : (row)=>{
				return moment(row.expirationDate).local().format("YYYY-MM-DD")
			},
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
                        history.push('/view-reference',{reference:row})
                    }
			    }><Icon icon={download2Fill} className="icon" width={20} height={20}/></Button>
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
		}
		return data;
	}

	//data inicial
	const getDataTable = (page) => {
		dispatch(referenceActions.dataTableStudent(getUserData(), page, perPageSelect == 0 ? perPage : perPageSelect, direction, {}));
	}
	
	//Paginar
	const handlePageChange = async (page) => {
		dispatch(referenceActions.dataTableStudent(getUserData(), perPageSelect == 0 ? perPage : perPageSelect, direction, filters ? filters: {}));
	};
	
	//Ordenar
	const handleSort = (column, sortDirection) => {
		let sort = {"id": column.selector, "desc": (sortDirection == "asc" ? false : true) }
		setDirection(sort);
		dispatch(referenceActions.dataTableStudent(getUserData(), 1, perPageSelect == 0 ? perPage : perPageSelect, sort, filters ? filters: {}));
	};

	//Cambiar cantidad de filas
	const handlePerRowsChange = async (newPerPage, page) => {
		setPerPageSelect(newPerPage);
		dispatch(referenceActions.dataTableStudent(getUserData(),page, newPerPage, direction, filters ? filters: {}));
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
        reset({career:'', matter:'', code:''})
	}

    //Form Data Filter
	const { handleSubmit, register, reset } = useForm();
    
    //Abrir/Cerrar filtros
	const [isOpen, setIsOpen] = useState(false);
	const toggle = () => setIsOpen(!isOpen);

    //Consultar por filtros
	const onFilterData = (data, e) => {
		setFilters(data);
		dispatch(referenceActions.dataTableStudent(getUserData(), 1, perPageSelect == 0 ? perPage : perPageSelect, direction, data))
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
								<h3 style={{ marginBottom: '0' }}>Referencias</h3>
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
										<input
											className="form-control"
											name="agency"
											placeholder="Sede"
											type="text"
											ref={register}
										></input>
									</FormGroup>
									<FormGroup className="mr-3">
										<select className='form-control' name="expired"
											ref={register}>
												<option key="" name="" value="">Seleccione vencimiento</option>										
												<option key="1" name="1" value="1">Si</option>
												<option key="2" name="2" value="2">No</option>
										</select>
									</FormGroup>
                                    <FormGroup className="mr-3">
										<input
											className="form-control"
											name="career"
											placeholder="Carrera"
											type="text"
											ref={register}
										></input>
									</FormGroup>
                                    <FormGroup className="mr-3">
										<input
											className="form-control"
											name="reference"
											placeholder="Referencia"
											type="text"
											ref={register}
										></input>
									</FormGroup>
									<FormGroup className="mr-3">
										<select className='form-control' name="status"
											ref={register}>
												<option key="" name="" value="">Seleccione estatus</option>										
												<option key="1" name="1" value="1">Pendiente</option>
												<option key="2" name="2" value="2">Pagado</option>
										</select>
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
								title="calificaciones"
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

export default ReferenceStudentPage;