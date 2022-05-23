/* eslint-disable */
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { matterActions } from '../../actions';
import moment from 'moment';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import DataTable from 'react-data-table-component';
import { InputGroup, InputGroupAddon, Button, Input, Spinner, Row, Col, ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText, UncontrolledTooltip } from 'reactstrap';
//componente dataTable sede
import { history } from '../../helpers';
import useDebounce from '../../components/Debounce'; 
import '../../assets/css/table.css';

//Componente filtro
const FilterComponent = ({ filterText, onFilter, onClear }) => {
	return <InputGroup style={{ "width": "200px"}}>
		<Input autoComplete="off" style={{"height": "38px", "marginTop":"10px"}} id="search" type="text" placeholder="buscar" value={filterText} onChange={onFilter} />
		<InputGroupAddon addonType="append">
			<Button onClick={onClear} color="info"><i className="fa fa-times" aria-hidden="true"></i></Button>
		</InputGroupAddon>
	</InputGroup>	
}

function MatterListPage() {

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
	const dataMatters = useSelector(state => state.matters.data);
    const loadingPage = useSelector(state => state.matters.loading);

	//Verificar data de redux
	useEffect(() => {
		if(dataMatters){
			setData(dataMatters.results);
		}else{

		}
  	},[dataMatters]);
    
	// Inicializar tabla sin data
	const [data, setData] = useState([])

	//Columnas Data table
	const columns = [
		{
			name: 'Carrera',
			selector: 'career.name',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Nombre',
			selector: 'name',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Cuatrimestre',
			selector: 'quarter',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Código',
			selector: 'code',
			sortable: true,
			width: '110px',
			wrap:true,
		},
		{
			name: 'Descripción',
			selector: 'description',
			sortable: true,
			wrap: true
		},
		{
			name: 'Fecha de registro',
			selector: 'createdDate',
			sortable: true,
			cell : (row)=>{
				return moment(row.createdDate).local().format("YYYY-MM-DD")
			},
			wrap:true,
		},
		{
			name: '',
			button: true,
			cell: row => <Button className="btn-link" color="primary" size="sm" onClick={e => 
				{
					e.preventDefault(); 
					history.push('/update-matter',{id:row.id})
				}
			}><i className="fas fa-pencil-alt"></i></Button>,
		},
	];

	//data inicial
	const getDataTable = () => {
		dispatch(matterActions.dataTable());
	}

	const [filterText, setFilterText] = useState('');
	const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
	
	//Retraso 500ms input search
	const debouncedSearchTerm = useDebounce(filterText, 500);

	//Header search del DataTable
	const subHeaderComponentMemo = useMemo(() => {
		const handleClear = () => {
			if (filterText) {
				setResetPaginationToggle(!resetPaginationToggle);
				setFilterText('');
				setData(dataMatters.results);
			}
		};
		return <FilterComponent onFilter={e =>  setFilterText(e.target.value) } onClear={handleClear} filterText={filterText} />;
	}, [filterText, resetPaginationToggle]);


	//Filtrar con delay 
	useEffect(() => {
		if (debouncedSearchTerm) {
			setData(dataMatters.results.filter(item => ( 
				(item.createdDate &&  moment(item.createdDate).local().format("YYYY-MM-DD").toLowerCase().includes(filterText.toLowerCase()))
				|| (item.name &&  item.name.toLowerCase().includes(filterText.toLowerCase()))
				|| (item.description &&  item.description.toLowerCase().includes(filterText.toLowerCase()))
				|| (item.quarter &&  item.quarter.toLowerCase().includes(filterText.toLowerCase()))
				|| (item.code &&  item.code.toLowerCase().includes(filterText.toLowerCase()))
				|| (item.career.name &&  item.career.name.toLowerCase().includes(filterText.toLowerCase()))
			) 
		));
		}
	},[debouncedSearchTerm]);

	//Consultar al entrar
	useEffect(() => {
		getDataTable();
	}, []);

	//Opciones de paginacion
	const paginationOptions = { rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' };

	//Loader de la tabla
	const CustomLoader = () => (
		<>
			<Spinner  color="primary" style={{ width: '1.5rem', height: '1.5rem' }} />
		</>
	);

	//Data al expandir una fila
	const ExpandedComponent = ({ data }) => (
		<ListGroup>
			<ListGroupItem>
				<ListGroupItemText>
					Descripción: { data.description}
				</ListGroupItemText>
				<ListGroupItemText>
					Código: { data.code}
				</ListGroupItemText>
			</ListGroupItem>
	  	</ListGroup>
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
								<h3 style={{ marginBottom: '0' }}>Materias</h3>
							</div>
							<Button id="add" onClick={ ()=> history.push('/register-matter') } className="btn-round btn-icon" color="info">
								<i className="fa fa-plus" />
							</Button>
							<UncontrolledTooltip placement="bottom" target="add" delay={0}>
								Agregar materia
							</UncontrolledTooltip>
						</div>
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
								title="Materias"
								progressPending={loadingPage}
								paginationComponentOptions={paginationOptions}
								progressComponent={<CustomLoader />}
								noDataComponent="No hay registros para mostrar"
								noHeader={true}
								columns={columns}
								data={data}
								pagination
								paginationResetDefaultPage={resetPaginationToggle}
								subHeader
								subHeaderComponent={subHeaderComponentMemo}
								persistTableHead
							/>
							</Col>
						</Row>
					</div>
				</div>
            </div>
        </>
    );
}

export default MatterListPage;