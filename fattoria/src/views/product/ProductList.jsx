/* eslint-disable */
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { productActions } from '../../actions';
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
import NumberFormat from 'react-number-format';
//Componente filtro
const FilterComponent = ({ filterText, onFilter, onClear }) => {
	return <InputGroup style={{ "width": "200px"}}>
		<Input autoComplete="off" style={{"height": "38px", "marginTop":"10px"}} id="search" type="text" placeholder="Buscar" value={filterText} onChange={onFilter} />
		<InputGroupAddon addonType="append">
			<Button onClick={onClear} color="primary"><i className="fa fa-times" aria-hidden="true"></i></Button>
		</InputGroupAddon>
	</InputGroup>	
}

const formatter = new Intl.NumberFormat('es-Es', {
    minimumFractionDigits: 2
})

function ProductListPage() {

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

	const dataProducts = useSelector(state => state.products.data);
    const loadingPage = useSelector(state => state.products.loading);

	//Verificar data de redux
	useEffect(() => {
		if(dataProducts){
			setData(dataProducts.results);
		}else{

		}
  	},[dataProducts]);
    
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
			name: 'Nombre',
			selector: 'name',
			sortable: true,
			wrap: true,
		},
		{
			name: 'Presentación',
			selector: 'presentation',
			sortable: true,
		},
		{
			name: 'Merma por empaque',
			selector: 'decrease',
			sortable: true,
			cell : (row)=>{
				return (row.decrease == true ? "Si":"No")
			},
		},
		{
			name: 'Merma por humedad',
			selector: 'reweigh',
			sortable: true,
			cell : (row)=>{
				return (row.reweigh == true ? "Si":"No")
			},
		},
		{
			name: 'Merma por picadillo',
			selector: 'mincemeat',
			sortable: true,
			cell : (row)=>{
				return (row.mincemeat == true ? "Si":"No")
			},
		},
		{
			name: 'Precio',
			selector: 'price',
			sortable:true,
			cell : (row)=>{
				return <NumberFormat value={row.price} displayType={'text'} thousandSeparator={','} decimalSeparator={'.'}/>
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
					history.push('/update-product',{id:row.id})
				}
			}><i className="fas fa-pencil-alt"></i></Button>,
		},
	];

	//data inicial
	const getDataTable = () => {
		dispatch(productActions.dataTable());
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
				if(dataProducts && dataProducts.results){
					setData(dataProducts.results);
				}
			}
		};
		return <FilterComponent onFilter={e =>  setFilterText(e.target.value) } onClear={handleClear} filterText={filterText} />;
	}, [filterText, resetPaginationToggle]);


	//Filtrar con delay 
	useEffect(() => {
		if(dataProducts && dataProducts.results){
			if (debouncedSearchTerm) {
				setData(dataProducts.results.filter(item => ( 
						(item.createdDate && moment(item.createdDate).utc().format("YYYY-MM-DD").toLowerCase().includes(filterText.toLowerCase()))
						|| item.code && item.code.toString().toLowerCase().includes(filterText.toLowerCase())
						|| item.price && item.price.toString().toLowerCase().includes(filterText.toLowerCase())
						|| item.name && item.name.toLowerCase().includes(filterText.toLowerCase())
						|| item.presentation && item.presentation.toString().toLowerCase().includes(filterText.toLowerCase())
					
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
					{ data.address}
				</ListGroupItemText>
				<ListGroupItemText>
					{ data.schedule}
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
								<h3 style={{ fontWeight:'bold',fontStyle: 'italic', marginBottom:0 }}>Catálogo de productos</h3>
							</div>
							<div>
								<span style={{fontWeight:'bold', marginRight:8}}>
									Añadir
								</span>
								<Button id="add" onClick={()=>history.push('/register-product')} className="btn-round btn-icon" color="primary">
									<i className="fa fa-plus" />
								</Button>
							</div>
						</div>
						<Row>
							<Col>
							<DataTable
								className="dataTables_wrapper"
								//expandableRows
								//expandableRowsComponent={<ExpandedComponent />}
								responsive
								highlightOnHover
								striped
								sortIcon={ <i className="fa fa-arrow-down ml-2" aria-hidden="true"></i> }
								title="Productos"
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

export default ProductListPage;