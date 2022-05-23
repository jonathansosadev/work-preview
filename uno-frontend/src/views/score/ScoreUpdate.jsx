/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { scoreActions } from '../../actions';
import moment from 'moment';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import DataTable from 'react-data-table-component';
import { Button, Spinner, Row, Col, Form, FormGroup, Modal, Label, Alert  } from 'reactstrap';
//componente dataTableStudent sede
import { history } from '../../helpers';
import '../../assets/css/table.css';
import { useForm, Controller  } from "react-hook-form";
import { useLocation } from "react-router-dom";
import { Icon } from '@iconify/react';
import folderSharedFill from '@iconify-icons/ri/folder-shared-fill';
import NumberFormat from 'react-number-format';

function ScoreUpdatePage() {

	const location = useLocation();

  	useEffect(() => {
		document.body.classList.add("landing-page");
		document.body.classList.add("sidebar-collapse");
		document.documentElement.classList.remove("nav-open");
		return function cleanup() {
			document.body.classList.remove("landing-page");
			document.body.classList.remove("sidebar-collapse");
		};
	});

	//Alertas
    const alert = useSelector(state => state.alert);
    
    //Mostrar alertas
    const [visible, setVisible] = useState(true);
    const [timeoutID, setTimeoutID ] = useState(null);
    const onDismiss = () => {
		setVisible(false);

		//Limpiar timeout al cerrar la alerta
		if(timeoutID && typeof timeoutID == "number") {
			window.clearTimeout(timeoutID);
			setTimeoutID(null)
		}
	}
    
    useEffect(() => {
        if(alert.message){
            //scroll al inicio para visualizar errores
            window.scrollTo(0, 0);
            setVisible(true); 
			let timeout = window.setTimeout(()=>{setVisible(false)},5000);   
			setTimeoutID(timeout);
        }
    },[alert]);

	const [idInscription, setIdInscription] = useState(null)
	const [dataStudent, setDataStudent] = useState([])

	useEffect(() => {
        if(location.state === undefined){
            history.goBack();
        }else{
			setDataStudent([location.state.row]);
			setIdInscription(location.state.inscription);
			let data = {
				student:location.state.student, 
				classes: location.state.class,
				inscription: location.state.inscription,
			}
            dispatch(scoreActions.dataTableScoreAssign( data ));
        }
    }, [location]);
   
	//usuario
    const user = useSelector(state => state.authentication.user);
    const dispatch = useDispatch();

	const dataStudents = useSelector(state => state.score.assign);
	const loadingPage = useSelector(state => state.score.loading);
	const updating = useSelector(state => state.score.updating);

	//Verificar data de redux
	useEffect(() => {
		if(dataStudents && dataStudents.results){
			setData(dataStudents.results);
        }
        if(dataStudents && dataStudents.metadata && dataStudents.metadata[0]){
			setRowCount(dataStudents.metadata[0].total);
		}
	},[dataStudents]);

	//Columnas Data table
	const columnsSelected = [
		{
			name: 'Carrera',
			selector: 'career.name',
			sortable: false,
			cell : (row)=>{
				return row.career ? row.career.name: ''
			},
			wrap:true,
		},
		{
			name: 'Matrícula',
			selector: 'student.registrationNumber',
			sortable: false,
		},
		{
			name: 'Nombres',
			selector: 'student.firstName',
			sortable: false,
		},
		{
			name: 'Apellidos',
			selector: 'student.lastName',
			sortable: false,
		},
		{
			name: 'Email',
			selector: 'student.email',
			sortable: false,
			wrap:true,
		},
		{
			name: 'Periodo',
			selector: 'period',
			sortable: false,
			wrap:true,
		},
	];

	// Inicializar tabla sin data
	const [data, setData] = useState([])

	//Columnas Data table
	const columns = [
		{
			name: 'Materia',
			selector: 'matter.name',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Código',
			selector: 'matter.code',
			sortable: true,
			wrap:true,
		},
		{
			name: '1er Parcial',
			selector: 'firstScore',
			sortable: true,
			cell : (row)=>{
				if(row.firstScore !== -1){
					return(row.firstScore)
				}else{
					return(<Button className="btn-link" color="primary" size="sm" onClick={e => 
						{
							e.preventDefault();	setEditRow(row);setScoreNumber(1); setModalVisible(true);
						}
					}><Icon icon={folderSharedFill} width={20} height={20}/></Button>)
				}
			},
		},
		{
			name: '2do Parcial',
			selector: 'secondScore',
			sortable: true,
			wrap:true,
			cell : (row)=>{
				if(row.secondScore !== -1){
					return(row.secondScore)
				}else if(row.firstScore>=0){
					return(<Button className="btn-link" color="primary" size="sm" onClick={e => 
						{
							e.preventDefault();	setEditRow(row);setScoreNumber(2); setModalVisible(true);
						}
					}><Icon icon={folderSharedFill} width={20} height={20}/></Button>)
				}
			},
		},
		{
			name: 'Final',
			selector: 'total',
			sortable: true,
			wrap:true,
			cell : (row)=>{
				if(row.total !== -1){
					return(row.total)
				}
			},
		},
	];

	//Opciones de paginacion
	const paginationOptions = { rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' };

	//Loader de la tabla
	const CustomLoader = () => (<><Spinner  color="primary" style={{ width: '1.5rem', height: '1.5rem' }} /></>);

    //Form Data Filter
	const { handleSubmit, register, reset } = useForm();
    
    //Abrir/Cerrar filtros
	const [isOpen, setIsOpen] = useState(false);
	const toggle = () => setIsOpen(!isOpen);

	const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

	//Consultar por filtros
	const onFilterData = (data, e) => {
		if(dataStudents && dataStudents.results){
			setData(dataStudents.results.filter(item => 
				(data.code !== "" ? item.matter.code && item.matter.code.toLowerCase().includes(data.code.toLowerCase()) : true)
				&&
				(data.name !== "" ? item.matter.name && item.matter.name.toLowerCase().includes(data.name.toLowerCase()) : true)
			));
		}
	};

	const clearFilters = () =>{
		setResetPaginationToggle(!resetPaginationToggle);
		reset({name:'', code:''});
		if(dataStudents && dataStudents.results){
			setData(dataStudents.results);
		}
	}

	//Modal nota
	const [modalVisible, setModalVisible] = useState(false);
	//fila seleccionada
	const [editRow, setEditRow] =  useState(null);
	//1er o 2do parcial
	const [scoreNumber, setScoreNumber] =  useState(null);
	const [newValue, setNewValue] =  useState(null);
	//Form Data Score
	const { handleSubmit: handleSubmitScore, register: registerScore, reset: resetScore, errors:errorsScore, control } = useForm();

	//Registrar data
    const onUpdateScore = (data, e) => {
		if(editRow){
			setNewValue(data.score);
			//id de nota 
			let id = editRow.id;
			data.user = user.id;
			data.student = editRow.student.id;
			if(scoreNumber == 1){
				data.firstScore = data.score;
			}else{
				data.secondScore = data.score;
			}
			data.matter = editRow.matter.id;
			data.career = editRow.career;
			data.inscription = idInscription;
			dispatch(scoreActions.updateScore( id, data  ));
		}
	};

	const scoreUpdated = useSelector(state => state.score);

	//Actualizar estado de inventario al cambio de información
	useEffect(() => {
		if(scoreUpdated.success){

			//actualizar los datos en el grid
			let score = {}
			if(scoreNumber == 1){
				score = { firstScore: parseInt(newValue) }
			}else{
				let fistScore = parseInt(editRow.firstScore);
				let secondScore = parseInt(newValue);
				//truncar decimales si hay
				let total = Math.trunc((fistScore + secondScore)/2);

				score = { secondScore: parseInt(newValue), total:total }
			}

			let newData = data.map(table => {
				if(table.id == editRow.id)
				   return Object.assign({}, table, score)
				return table
			});
			
			setData(newData);
			setNewValue(null);
			resetScore({score:''});
			setModalVisible(false);
			setEditRow(null);
		}
	},[scoreUpdated.success]);

    return (
        <>
            <div className="d-flex" id="wrapper">
				<SideBar/>
				<div id="page-content-wrapper">
					<AdminNavbar/>
					<div className="flex-column flex-md-row p-3">
						<div className="d-flex justify-content-between" style={{padding:"4px 16px 4px 24px"}}>
							<div className="align-self-center">
								<h3 style={{ marginBottom: '0' }}>Asignación de calificaciones</h3>
							</div>
						</div>
						<Row className="mb-5">
							<Col>
							<DataTable
								className="dataTables_wrapper"
								responsive
								highlightOnHover
								striped
								sortIcon={ <i className="fa fa-arrow-down ml-2" aria-hidden="true"></i> }
								title="Estudiantes"
								columns={columnsSelected}
								data={dataStudent}
								persistTableHead
								noDataComponent=""
								noHeader={true}
							/>
							</Col>
						</Row>
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
											name="name"
											placeholder="Materia"
											type="text"
											ref={register}
										></input>
									</FormGroup>
                                    <FormGroup className="mr-3">
										<input
											className="form-control"
											name="code"
											placeholder="Código"
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
						
						{alert.message &&
							<Alert color={`alert ${alert.type}`} isOpen={visible} fade={true} style={{marginTop:10}}>
								<div className="container">
									{alert.message}
									<button type="button" className="close" aria-label="Close"onClick={onDismiss}>
										<span aria-hidden="true">
										<i className="now-ui-icons ui-1_simple-remove"></i>
										</span>
									</button>
								</div>
							</Alert>
						}
						
						<Row>
							<Col>
							<DataTable
								className="dataTables_wrapper"
								responsive
								highlightOnHover
								striped
								sortIcon={ <i className="fa fa-arrow-down ml-2" aria-hidden="true"></i> }
								title="Profesores"
								columns={columns}
								data={data}
								progressPending={loadingPage}
								pagination
								paginationResetDefaultPage={resetPaginationToggle}
								paginationComponentOptions={paginationOptions}
								persistTableHead
								progressComponent={<CustomLoader />}
								noDataComponent="No hay registros para mostrar"
								noHeader={true}
							/>
							</Col>
						</Row>
						<div className="d-flex justify-content-between">
							<Button className="btn-round" outline onClick={e =>{e.preventDefault(); history.goBack();} }>Cancelar</Button>
						</div>
						<Modal toggle={() => {setModalVisible(false)}} isOpen={modalVisible} backdrop="static">
                            <div className="modal-header">
                                <h5 className="modal-title">Calificación</h5>
                                <button aria-label="Close" className="close" type="button" disabled={updating} onClick={() =>  {setModalVisible(false);}}>
                                    <span aria-hidden={true}>×</span>
                                </button>
                            </div>
							<Form onSubmit={handleSubmitScore(onUpdateScore)} className="form">
								<div className="modal-body"> 
									<Row form>
										<Col md={12}>  
											<FormGroup>
												<Label for="score">Nota</Label>
												{/* <input
													disabled={updating}
													maxLength="3"
													autoComplete="off"
													className={'form-control' + (errorsScore.score ? ' is-invalid' : '')}
													name="score"
													ref={registerScore({
														required: "La nota es requerida",
														min: 0,
    													max: 10
													})}
												/>								
												{errorsScore.score && <div className="invalid-feedback">{errorsScore.score.message}</div>}
												{errorsScore.score && errorsScore.score.type === "min" && (
													<div className="invalid-feedback">La calificación debe ser de al menos 0</div>
												)}
												{errorsScore.score && errorsScore.score.type === "max" && (
													<div className="invalid-feedback">La calificación no debe ser superior a 10</div>
												)} */}
												<Controller
                                                    name="score"
                                                    control={control}
                                                    rules={{
                                                        min: {
                                                            value: 0,
                                                            message: "La calificación debe ser de al menos 0"
														},
														max: {
                                                            value: 10,
                                                            message: "La calificación no debe ser superior a 10"
														},
														maxLength:2,
                                                        required: "La calificación es requerida",
                                                    }}
                                                    as={<NumberFormat decimalScale={0} maxLength="2" allowNegative={false} className={'form-control' + (errorsScore.score ? ' is-invalid' : '')} thousandSeparator={false} />}
                                                />
												{errorsScore.score && <div className="invalid-feedback">{errorsScore.score.message}</div>}
												{errorsScore.score && errorsScore.score.type === "maxLength" && <div className="invalid-feedback">Se excedió la longitud máxima</div> }
											</FormGroup>
										</Col>
									</Row>
									{/* <FormText className="text-muted" color="default" id="score">
										Confirme los datos antes de guardar ya que no se puede alterar la información luego de guardada.
									</FormText> */}
									<footer className="blockquote-footer text-center">
										<cite title="Source Title">Confirme los datos antes de guardar ya que no se puede alterar la información luego de guardada.</cite>
									</footer>	
								</div>
								<div className="modal-footer">
									<Button color="primary" className="btn-round" disabled={updating}>
										{updating && <span className="spinner-border spinner-border-sm mr-1"></span>}
										Guardar
									</Button>
									<Button color="secondary"className="btn-round" outline type="button" disabled={updating} onClick={() =>  {setModalVisible(false);}} >
										Cerrar
									</Button>
								</div>
							</Form>
                        </Modal>
					</div>
				</div>
            </div>
        </>
    );
}

export default ScoreUpdatePage;