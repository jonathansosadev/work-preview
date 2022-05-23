/* eslint-disable */
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { agencyActions, userActions } from '../../actions';
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
		<Input autoComplete="off" style={{"height": "38px", "marginTop":"10px"}} id="search" type="text" placeholder="Buscar" value={filterText} onChange={onFilter} />
		<InputGroupAddon addonType="append">
			<Button onClick={onClear} color="primary"><i className="fa fa-times" aria-hidden="true"></i></Button>
		</InputGroupAddon>
	</InputGroup>	
}

function AgencyListPage() {

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

	const dataAgencies = useSelector(state => state.agencies.data);
    const loadingPage = useSelector(state => state.agencies.loading);

	//Verificar data de redux
	useEffect(() => {
		if(dataAgencies){
			setData(dataAgencies.results.filter(item => item.name && item.name.toLowerCase().includes(filterText.toLowerCase())));
			//setRowCount(dataAgencies.numOfResults);
		}else{

		}
  	},[dataAgencies]);
    
	// Inicializar tabla sin data
	const [data, setData] = useState([])

	//Columnas Data table
	const columns = [
		{
			name: 'Nombre',
			selector: 'name',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Encargado',
			selector: 'attendant',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Dirección',
			selector: 'address',
			sortable: true,
			omit: false,//Esconder
			wrap:true,
		},
		{
			name: 'Terminales',
			selector: 'terminal',
			sortable: false,
			wrap:true,
			cell : (row)=>{
				return row.terminal.map(e => e.code).join(", ");
			},
		},
		{
			name: 'Fecha de registro',
			selector: 'createdDate',
			sortable: true,
			cell : (row)=>{
				return moment(row.createdDate).utc().format("YYYY-MM-DD")
			},
		},
		{
			name: '',
			button: true,
			cell: row => <Button className="btn-link" color="primary" size="sm" onClick={e => 
				{
					e.preventDefault(); 
					history.push('/update-agency',{id:row.id})
				}
			}><i className="fas fa-pencil-alt"></i></Button>,
		},
	];

	//data inicial
	const getDataTable = () => {
		dispatch(agencyActions.dataTable());
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
				if(dataAgencies && dataAgencies.results){
					setData(dataAgencies.results);
				}
			}
		};
		return <FilterComponent onFilter={e =>  setFilterText(e.target.value) } onClear={handleClear} filterText={filterText} />;
	}, [filterText, resetPaginationToggle]);


	//Filtrar con delay 
	useEffect(() => {
		if(dataAgencies && dataAgencies.results){
			if (debouncedSearchTerm) {
				setData(dataAgencies.results.filter(item => ( 
						(item.createdDate &&  moment(item.createdDate).utc().format("YYYY-MM-DD").toLowerCase().includes(filterText.toLowerCase()))
						|| (item.name &&  item.name.toLowerCase().includes(filterText.toLowerCase()))
						|| (item.attendant &&  item.attendant.toLowerCase().includes(filterText.toLowerCase()))
						|| (item.address &&  item.address.toLowerCase().includes(filterText.toLowerCase()))
						|| (item.terminalCodes &&  item.terminalCodes.toLowerCase().includes(filterText.toLowerCase()))
					) 
				));
			}
		}
	},[debouncedSearchTerm]);

	//Consultar al entrar
	useEffect(() => {
		getDataTable();
	}, []);

	//Opciones de paginacion
	const paginationOptions = { rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' };

	//Loader de la tabla
	const CustomLoader = () => (<><div className="loading-table"></div></>);

	//Data al expandir una fila
	const ExpandedComponent = ({ data }) => (
		<ListGroup>
			<ListGroupItem>
				<ListGroupItemHeading>{ data.name }</ListGroupItemHeading>
				<ListGroupItemText>
					{ data.address }
				</ListGroupItemText>
				<ListGroupItemText>
					Terminales: { data.terminal.map(e => e.code).join(", ") }
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
								<h3 style={{ marginBottom: '0', fontWeight:'bold',fontStyle: 'italic'}}>Sucursales</h3>
							</div>
							<div>
								<span style={{fontWeight:'bold', marginRight:8}}>
									Añadir
								</span>
								<Button id="add" onClick={()=>history.push('/register-agency')} className="btn-round btn-icon" color="primary">
									<i className="fa fa-plus" />
								</Button>
							</div>
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
								title="Sedes"
								progressPending={loadingPage}
								paginationComponentOptions={paginationOptions}
								progressComponent={<CustomLoader />}
								noDataComponent="No hay registros para mostrar"
								noHeader={true}
								columns={columns}
								data={data}
								pagination
								paginationResetDefaultPage={resetPaginationToggle} // optionally, a hook to reset pagination to page 1
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

export default AgencyListPage;