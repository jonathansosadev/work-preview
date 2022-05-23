/* eslint-disable */
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { terminalActions } from '../../actions';
import moment from 'moment';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import DataTable from 'react-data-table-component';
import { InputGroup, InputGroupAddon, Button, Input, Spinner, Row, Col, UncontrolledTooltip } from 'reactstrap';
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

function TerminalListPage() {

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

	const dataTerminals = useSelector(state => state.terminal.data);
    const loadingPage = useSelector(state => state.terminal.loading);

	//Verificar data de redux
	useEffect(() => {
		if(dataTerminals){
			setData(dataTerminals.results);
		}else{

		}
  	},[dataTerminals]);
    
	// Inicializar tabla sin data
	const [data, setData] = useState([])

	//Columnas Data table
	const columns = [
		{
			name: 'Código',
			selector: 'code',
			sortable: true,
		},
		{
			name: 'Serial',
			selector: 'serial',
			sortable: true,
			wrap:true
		},
		{
			name: 'Marca',
			selector: 'brand',
			sortable: true,
			wrap:true
		},
		{
			name: 'Modelo',
			selector: 'model',
			sortable: true,
			wrap:true
		},
		{
			name: 'Banco',
			selector: 'bank',
			sortable: true,
			wrap:true
		},
		{
			name: 'En uso',
			selector: 'used',
			cell : (row)=>{
				return row.used == true ? 'Si':'No' ;
			},
		},
		{
			name: 'Descripción',
			selector: 'description',
			sortable: true,
			omit: false,//Esconder
			wrap:true
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
					history.push('/update-terminal',{id:row.id})
				}
			}><i className="fas fa-pencil-alt"></i></Button>,
		},
	];

	//data inicial
	const getDataTable = () => {
		dispatch(terminalActions.dataTable());
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
				setData(dataTerminals.results);
			}
		};
		return <FilterComponent onFilter={e =>  setFilterText(e.target.value) } onClear={handleClear} filterText={filterText} />;
	}, [filterText, resetPaginationToggle]);


	//Filtrar con delay 
	useEffect(() => {
		if (debouncedSearchTerm) {
			setData(dataTerminals.results.filter(item => ( 
					(item.createdDate &&  moment(item.createdDate).utc().format("YYYY-MM-DD").toLowerCase().includes(filterText.toLowerCase()))
					|| (item.code &&  item.code.toLowerCase().includes(filterText.toLowerCase()))
					|| (item.serial &&  item.serial.toLowerCase().includes(filterText.toLowerCase()))
					|| (item.description &&  item.description.toLowerCase().includes(filterText.toLowerCase()))
					|| (item.brand &&  item.brand.toLowerCase().includes(filterText.toLowerCase()))
					|| (item.model &&  item.model.toLowerCase().includes(filterText.toLowerCase()))
					|| (item.bank &&  item.bank.toLowerCase().includes(filterText.toLowerCase()))
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
	const CustomLoader = () => (<><div className="loading-table"></div></>);

    return (
        <>
            <div className="d-flex" id="wrapper">
				<SideBar/>
				<div id="page-content-wrapper">
					<AdminNavbar/>
					<div className="flex-column flex-md-row p-3">

						<div className="d-flex justify-content-between" style={{padding:"4px 16px 4px 24px"}}>
							<div className="align-self-center">
								<h3 style={{ fontWeight:'bold',fontStyle: 'italic'}}>Terminales</h3>
							</div>
							<div>
								<span style={{fontWeight:'bold', marginRight:8}}>
									Añadir
								</span>
								<Button id="add" onClick={()=>history.push('/register-terminal')} className="btn-round btn-icon" color="primary">
									<i className="fa fa-plus" />
								</Button>
							</div>
						</div>
						<Row>
							<Col>
							<DataTable
								className="dataTables_wrapper"
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

export default TerminalListPage;