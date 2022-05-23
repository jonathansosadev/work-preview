/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fileActions, agencyActions } from '../../actions';
import moment from 'moment';
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import DataTable from 'react-data-table-component';
import { Button, Spinner, Row, Col, Form, FormGroup, Modal } from 'reactstrap';
import '../../assets/css/table.css';
import { useForm  } from "react-hook-form";
import Datetime from 'react-datetime';
import { Icon } from '@iconify/react';
import fileDownloadLine from '@iconify-icons/ri/file-download-line';
import deleteBin2Line from '@iconify-icons/ri/delete-bin-2-line';
function FileListPage() {

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
	const dataFiles = useSelector(state => state.files.data);
    const loadingPage = useSelector(state => state.files.loading);

	//Verificar data de redux
	useEffect(() => {
		if(dataFiles && dataFiles.results){
			setData(dataFiles.results);
        }
        if(dataFiles && dataFiles.metadata && dataFiles.metadata[0]){
			setRowCount(dataFiles.metadata[0].total);
		}
    },[dataFiles]);

	// Inicializar tabla sin data
	const [data, setData] = useState([]);
	const [rowCount, setRowCount] = useState(0);
	const user = useSelector(state => state.authentication.user);
	const downloading = useSelector(state => state.files.downloading);
	const downloaded = useSelector(state => state.files.downloaded);
	//Columnas Data table
	const columns = [
		{
			name: 'Título',
			selector: 'title',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Archivo',
			selector: 'name',
			sortable: false,
			omit:true
		},
		{
			name: 'Descripción',
			selector: 'description',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Fecha de registro',
			selector: 'createdDate',
			sortable: true,
			cell : (row)=>{
				return moment(row.createdDate).local().format("YYYY-MM-DD")
			},
		},
		{
			name: '',
            button: true,
            width: '110px',
			cell: row => 
            <div className="d-flex">
				<Button className="btn-link" color="primary" size="sm" disabled={downloading} onClick={e => 
                    {
                        e.preventDefault(); 
						setDataRow(row);
						setModalVisible(true);
                    }
			    }><Icon icon={deleteBin2Line} width="20" height="20"/></Button>
                <Button className="btn-link" color="primary" size="sm" disabled={downloading} onClick={e => 
                    {
						e.preventDefault(); 
						setDataRowDownload(row);
						download(row);
                    }
			    }>
					{((dataRowDownload && dataRowDownload._id == row._id) && downloading) && <span className="spinner-border spinner-border-sm mr-1"></span>} 
					{!dataRowDownload && <Icon icon={fileDownloadLine} width="20" height="20"/>}
				</Button>
            </div>,
		},
	];

	/**
	 * Descargar archivo del servidor
	 * @param {*} row 
	 */
	const download = (row) =>{
		dispatch(fileActions.downloadFile(row._id, row.name));
	}
	const [dataRowDownload, setDataRowDownload] = useState(null);
	useEffect(() => {
        if(downloaded){
            setDataRowDownload(null);
        }
    },[downloaded]);

	const [perPage] = useState(10);
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
		dispatch(fileActions.dataTable(getUserData(), page, perPageSelect == 0 ? perPage : perPageSelect, direction, {}));
	}
	
	//Paginar
	const handlePageChange = async (page) => {
		dispatch(fileActions.dataTable(getUserData(), page, perPageSelect == 0 ? perPage : perPageSelect, direction, filters ? filters: {}));
	};
	
	//Ordenar
	const handleSort = (column, sortDirection) => {
		let sort = {"id": column.selector, "desc": (sortDirection == "asc" ? false : true) }
		setDirection(sort);
		dispatch(fileActions.dataTable(getUserData(), 1, perPageSelect == 0 ? perPage : perPageSelect, sort, filters ? filters: {}));
	};

	//Cambiar cantidad de filas
	const handlePerRowsChange = async (newPerPage, page) => {
		setPerPageSelect(newPerPage);
		dispatch(fileActions.dataTable(getUserData(), page, newPerPage, direction, filters ? filters: {}));
	};

	//Consultar al entrar
	useEffect(() => {
		getDataTable(1);
	}, []);

	//Opciones de paginacion
	const paginationOptions = { rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' };

	//Loader de la tabla
	const CustomLoader = () => (<><Spinner  color="primary" style={{ width: '1.5rem', height: '1.5rem' }} /></>);

	const handleChangeRegisterDate = (date) => {
		setRegisterDate(date);
	}

	const [registerDate, setRegisterDate] = useState('');

	const clearFilters = () =>{
		setRegisterDate(''); 
        reset();
        reset({document:'', fistName:'', lastName:'',  email:'', registerDate:''})
	}

    //Form Data Filter
	const { handleSubmit, register, reset } = useForm();
    
    //Abrir/Cerrar filtros
	const [isOpen, setIsOpen] = useState(false);
	const toggle = () => setIsOpen(!isOpen);

	//Modal genérico y mensaje
	const [modalWarning, setModalWarning] = useState(false);
	const [modalMsg, setModalMsg] = useState('');

    //Consultar por filtros
	const onFilterData = (data, e) => {
		var validDate =  moment(data.registerDate).isValid();

		if(data.registerDate != "" && !validDate){
			setModalWarning(true);
			setModalMsg('Ingrese una fecha válida');
			return;
		}
		setFilters(data);
        dispatch(fileActions.dataTable(getUserData(), 1, perPageSelect == 0 ? perPage : perPageSelect, direction, data));
	}
	
	const [modalVisible, setModalVisible] = useState(false);
    const [dataRow, setDataRow] = useState(null);
    //Eliminar archivo de servidor y bd
    const removeFile = () =>{
        dispatch(fileActions.deleteFile( dataRow._id ));
	}
	
	const deleting = useSelector(state => state.files.deleting);

	const deleteSuccess = useSelector(state => state.files.deleted);
	
	useEffect(() => {
		//si se elimino correctamente cerrar modal y consultar informacion nuevamente
        if(deleteSuccess){
			setModalVisible(false);
			dispatch(fileActions.dataTable(getUserData(), 1, perPageSelect == 0 ? perPage : perPageSelect, direction, filters ? filters: {}));
        }
    },[deleteSuccess]);
    
    return (
        <>
            <div className="d-flex" id="wrapper">
				<SideBar/>
				<div id="page-content-wrapper">
					<AdminNavbar/>
					<div className="flex-column flex-md-row p-3">
						<div className="d-flex justify-content-between" style={{padding:"4px 16px 4px 24px"}}>
							<div className="align-self-center">
								<h3 style={{ marginBottom: '0' }}>Material didáctico</h3>
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
											name="title"
											placeholder="Título"
											type="text"
											ref={register}
										></input>
									</FormGroup>
                                    <FormGroup className="mr-3">
										<input
											className="form-control"
											name="description"
											placeholder="Descripción"
											type="text"
											ref={register}
										></input>
									</FormGroup>
									<FormGroup className="mr-3">
										<Datetime timeFormat={false} dateFormat={'YYYY-MM-DD'} closeOnSelect onChange={handleChangeRegisterDate} value={registerDate}
											renderInput={(props) => {
												return <input {...props} className="form-control dateFilter" readOnly name="registerDate" 
												placeholder="Fecha de registro"  ref={register} value={(registerDate) ? props.value : ''} />
											}} 
										/>
									</FormGroup>
									<Button color="primary" className="btn-round" className="btn-round" type="submit" disabled={loadingPage}>
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
								title="Estudiantes"
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
						<Modal toggle={() => {setModalVisible(false); setDataRow(null)}} isOpen={modalVisible}>
                            <div className="modal-header">
                            <button
                                aria-label="Close"
                                className="close"
                                type="button"
                                onClick={() =>  {setModalVisible(false); setDataRow(null)}}
                            >
                                <span aria-hidden={true}>×</span>
                            </button>
                            </div>
                            <div className="modal-body">
                                ¿Confirmar eliminación de archivo?
                            </div>
                            <div className="modal-footer">
                                <Button color="primary" className="btn-round" disabled={deleting} onClick={()=>removeFile()}>
                                    {deleting && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                    Confirmar
                                </Button>
                                <Button color="secondary" className="btn-round" outline type="button" onClick={() => {setModalVisible(false);setDataRow(null);}} disabled={deleting}>
                                    Cerrar
                                </Button>
                            </div>
                        </Modal>
						<Modal toggle={() => {setModalWarning(false); setModalMsg('')}} isOpen={modalWarning}>
                            <div className="modal-header">
                            <h5 className="modal-title" id="examplemodalMsgLabel">
                                Archivos
                            </h5>
                            <button
                                aria-label="Close"
                                className="close"
                                type="button"
                                onClick={() =>  {setModalWarning(false); setModalMsg('')}}
                            >
                                <span aria-hidden={true}>×</span>
                            </button>
                            </div>
                            <div className="modal-body">
                                <p>{modalMsg}</p>
                            </div>
                            <div className="modal-footer">
                            <Button
								color="secondary"
								className="btn-round" outline
                                type="button"
                                onClick={() =>  {setModalWarning(false); setModalMsg('')}}
                            >
                                Cerrar
                            </Button>
                            </div>
                        </Modal>
					</div>
				</div>
            </div>
        </>
    );
}

export default FileListPage;