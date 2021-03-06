/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { classesActions, sheduleActions } from '../../actions';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Col, Row, Button, Form, FormGroup, Label, Alert,  Modal, Spinner  } from 'reactstrap';
import { history } from '../../helpers';
import Datetime from 'react-datetime';
import DataTable from 'react-data-table-component';
import { useForm  } from "react-hook-form";
import { Icon } from '@iconify/react';
import addCircleLine from '@iconify-icons/ri/add-circle-line';
import moment from 'moment';
import { useLocation } from "react-router-dom";

function TimeTableUpdatePage() {

  	useEffect(() => {
		document.body.classList.add("landing-page");
		document.body.classList.add("sidebar-collapse");
		document.documentElement.classList.remove("nav-open");

		return function cleanup() {
			document.body.classList.remove("landing-page");
			document.body.classList.remove("sidebar-collapse");
		};
    });

    const location = useLocation();
    const dispatch = useDispatch();
    
    const sheduleState = useSelector(state => state.shedules.shedule);
    const searching = useSelector(state => state.shedules.searching);
    //obtener sede del state
    const [shedule, setShedule] = useState(null);

    useEffect(() => {
        if(location.state === undefined){
            history.goBack();
        }else{
            dispatch(sheduleActions.getShedule( location.state.id ));
            
        }
    }, [location]);

    //Datos del Grupo seleccionado
    const [selectedGroup, setSelectedGroup] = useState([]);
    const [idShedule, setIdShedule] = useState(null);

    useEffect(() => {
        if(sheduleState){
            setShedule(sheduleState);
            let dataGroup = [];
            dataGroup.push(sheduleState.group);
            setSelectedGroup(dataGroup);
            setIdShedule(sheduleState._id);
            //Consultar materias para select
            dispatch(classesActions.getMatterGroup(sheduleState.group._id));

            //Construir data en el calendario
            onLoadEvents(sheduleState.events);
            
        }
    },[sheduleState]);

    const groupMatter = useSelector(state => state.classes.groupMatter);
    const gettingMatters = useSelector(state => state.classes.getting);
    
    //materias del grupo
    const [classes, setClasses] = useState([])

    useEffect(() => {
        if(groupMatter && groupMatter.results){
            //materias del grupo
            setClasses(groupMatter.results)
            dispatch(classesActions.clearData());
        }
    },[groupMatter]);

    const onLoadEvents = (data) => {

        let events = [];

        data.map((row)=>{
            let obj =  {
                day: row.day,
                matter: row.matter,
                datastart: row.datastart,
                dataend: row.dataend,
                datacontent: row.datacontent.name,
                dataevent: row.event,
                eventname: row.datacontent.name,
                user: row.user,//docente
            }
            events.push(obj);
        });
       
        setDataCalendar(events);
        //Actualizar calendario
        callRefreshCalendar();
    }
    
   
    const user = useSelector(state => state.authentication.user);
    
    //Alertas
    const alert = useSelector(state => state.alert);
    //Mostrar alertas
    const [visible, setVisible] = useState(true);
    const onDismiss = () => setVisible(false);
    
    useEffect(() => {
        if(alert.message){
            setVisible(true); 
            if(alert.type != 'alert-danger'){
                window.setTimeout(()=>{setVisible(false)},5000);   
            }
        }
    },[alert]);

    const callRefreshCalendar = () =>{
        window.setTimeout(()=>{window.reloadShedulePlan()},10);
    }

    //====================================//

    /**
     * Grupo
     */

    //Columnas Data table
	const columns = [
		{
			name: 'Id',
			selector: 'idNumber',
			sortable: true,
			wrap:true,
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
			name: 'Turno',
			selector: 'turn',
			sortable: true,
			wrap:true,
		},
		{
			name: 'Grado',
			selector: 'type',
			sortable: true,
			wrap:true,
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
			name: 'Grupo',
			selector: 'groupName',
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
	];

    //====================================//

    //Modal gen??rico y mensaje
	const [modalWarning, setModalWarning] = useState(false);
	const [modalMsg, setModalMsg] = useState('');

    //Modal agregar materia al calendario
    const [modalVisible, setModalVisible] = useState(false);

    const days = ['','Lunes','Martes', 'Mi??rcoles', 'Jueves', 'Viernes', 'S??bado'];

    //Array de eventos en el calendario
    const [dataCalendar, setDataCalendar] = useState([]);

    const [dayAdd, setDayAdd] = useState('');
    const [dayNumber, setDayNumber] = useState(null);

    //Modal a??adir materia al calendario
    const openModalCreateShedule = (day) => {

        //texto del numero de dia
        setDayAdd(days[day]);
        setDayNumber(day);
        setModalVisible(true);

    };

    const closeModalCreateShedule= () => {
        resetShedule();
        setDayAdd('');
        setDayNumber(null);
        setModalVisible(false);
    };

    const [event, setEvent] = useState(null);
    const [showEventDetail, setShowEventDetail] = useState(false);
    //Modal detalle de evento
    const openModalDetailEvent = (eventDetail) => {
        setEvent(eventDetail);
        setShowEventDetail(true);
    };

    //Cerrar modal de detalle
    const closeModalDetailEvent = () => {
        setEvent(null);
        setShowEventDetail(false);
    };

    //Quitar evento del calendario
    const removeEvent = () => {
        if(event){

            let data = dataCalendar;
            const index = data.indexOf(event);
            if (index !== -1) {
                data.splice(index, 1);
                setDataCalendar([...data]);
            }

            setEvent(null);
            setShowEventDetail(false);
            //Actualizar calendario
            callRefreshCalendar();
        }
    };

    //Form busqueda de Grupos
    const { handleSubmit: handleSubmitAddShedule, register: registerShedule, reset: resetShedule, errors: errorsShedule } = useForm();

    //Agregar evento al calendario
	const onAddShedule = (data, e) => {
      
        let classData = classes.filter(item => item.id == data.matter);

        let startTime =  parseInt(data.start.replace(':', ''));
        let endTime =  parseInt(data.end.replace(':', ''));

        if(endTime <= startTime){
            setOpenWarning(true);
			setWarningMessage('La hora final debe ser superior a la inicial');
			return;
        }

        //Validar una hora de diferencia
        if((endTime > startTime)){
            let total =  endTime - startTime;
            if(total < 100 ){
                setOpenWarning(true);
                setWarningMessage('El evento debe ser m??nimo de 1 hora de duraci??n');
                return;
            }
            
        }

        //verificar no repetidos por dia y misma hora
        let dataEvents = dataCalendar;
        const filterDay = dataEvents.filter((item) => (item.matter == classData[0].matter.id && item.day == dayNumber));
   
        if(filterDay.length > 0){
			setOpenWarning(true);
			setWarningMessage('Ya la materia ha sido ingresada para el dia seleccionado');
			return;
		}

        //Verificar choque
        let invalid = 0;
        dataEvents.map((item)=>{
            if(item.day == dayNumber){

                let itemStart =  parseInt(item.datastart.replace(':', ''));
                let itemEnd =  parseInt(item.dataend.replace(':', ''));
                if(startTime >= itemStart && startTime < itemEnd){
                    invalid++;
                    return;
                }

                if(endTime > itemStart && endTime <= itemEnd){
                    invalid++;
                    return;
                }
            }
        });
     
        if(invalid > 0){
			setOpenWarning(true);
			setWarningMessage('Ya hay un evento en el horario seleccionado');
			return;
		}
       
        let obj =  {
            day: dayNumber,
            matter: classData[0].matter.id,
            datastart: data.start,
            dataend: data.end,
            datacontent: classData[0].matter.name,
            dataevent: "event-5",
            eventname: classData[0].matter.name,
            user: classData[0].user,//docente
        }

        let events = dataCalendar;
        events.push(obj)
        //console.log('obj',obj)
        setDataCalendar(events);

        //Actualizar calendario
        callRefreshCalendar();
    }

    //Form busqueda de Grupos
    const { handleSubmit: handleSubmitEvents, register: registerEvents, reset: resetEvents, errors: errorsEvents } = useForm();

    //State de actualizacion
    const updating = useSelector(state => state.shedules.updating);
    const shedules = useSelector(state => state.shedules);

    //Limpiar pantalla al actualizar
    useEffect(() => {
        if(shedules.success){
            // setSelectedGroup([]);
            // setClasses([]);
            // setDataCalendar([]);
            // callRefreshCalendar();
        }
    },[shedules.success]);

     //Guardar calendario
    const saveShedule = (data, e) => {

        if(selectedGroup.length == 0){
			setModalWarning(true);
			setModalMsg('Debe seleccionar un grupo');
			return;
		}

        if(dataCalendar.length == 0){
			setModalWarning(true);
			setModalMsg('No hay eventos en el calendario');
			return;
		}

		var validEndDate =  moment(data.endDate).isValid();

		if(data.endDate != "" && !validEndDate){
			setModalWarning(true);
            setModalMsg('Ingrese una fecha v??lida');
			return;
		}

        //Construir informacion
        let dataEvents = {
            user: user.id,//usuario creador
            endDate: data.endDate,
            group: selectedGroup[0],
            shedule: dataCalendar,
        }
        dispatch(sheduleActions.updateShedule(idShedule ,dataEvents));
    };

    // Notificaciones de eventos
    const [openWarning, setOpenWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');

    const onDismissWarning = () => {
        setOpenWarning(false);
        setWarningMessage('')
    }
    
    useEffect(() => {
        if(openWarning){
            window.setTimeout(()=>{onDismissWarning()},5000);   
        }
    },[openWarning]);

    return (
        <>
            <div className="d-flex" id="wrapper">
				<SideBar/>
				<div id="page-content-wrapper">
					<AdminNavbar/>
                    <div className="flex-column flex-md-row p-3">
                     
                        <div className="d-flex justify-content-between" style={{padding:"4px 16px 4px 24px"}}>
							<div className="align-self-center">
								<h3 style={{ marginBottom: '0' }}>Actualizar calendario</h3>
							</div>
						</div>
                        {alert.message &&
                            <Alert color={`alert ${alert.type}`} isOpen={visible} fade={true}>
                                <div className="container">
                                    <div dangerouslySetInnerHTML={{ __html: alert.message }} />
                                    <button type="button" className="close" aria-label="Close" style={{ position: 'absolute', top:10, right: 50}}onClick={onDismiss}>
                                        <span aria-hidden="true">
                                            <i className="now-ui-icons ui-1_simple-remove"></i>
                                        </span>
                                    </button>
                                </div>
                            </Alert>
                        }
                        {searching &&  <div className="d-flex justify-content-center">
                            <Spinner color="primary" />
                        </div>}
                        {shedule && <>
                        <Form className="form" style={{padding:"4px 16px 4px 24px"}} >
                            {/* Grupo */}
                            <div style={{border:'1px solid #dee2e6', padding: '10px 20px', borderRadius:'5px', marginBottom:'5px'}}>
                                <Row>
                                    <Col>
                                    {selectedGroup.length > 0 && <>
                                        <DataTable
                                            className="dataTables_wrapper"
                                            responsive
                                            highlightOnHover
                                            striped
                                            sortIcon={ <i className="fa fa-arrow-down ml-2" aria-hidden="true"></i> }
                                            title="Grupo"
                                            columns={columns}
                                            data={selectedGroup}
                                            persistTableHead
                                            noDataComponent=""
                                            noHeader={true}
                                        />
                                    </>}
                                    </Col>
                                </Row>
                            </div>
                        </Form>

                        <Form onSubmit={handleSubmitEvents(saveShedule)} className="form" style={{padding:"4px 16px 4px 24px"}} >
                            {/* Estudiante */}
                            <div style={{border:'1px solid #dee2e6', padding: '10px 20px', borderRadius:'5px', marginBottom:'5px'}}>
                                <Row>
                                    {/* <Col md={4}>
                                        <FormGroup>
                                            <Label for="startDate">Fecha de Inicio</Label>
                                            <Datetime locale="Es-es" timeFormat={false} initialValue={shedule.startDate ? moment(shedule.startDate).utc().format('YYYY-MM-DD'):''}
                                                closeOnSelect
                                                dateFormat={'YYYY-MM-DD'}
                                                inputProps={{ 
                                                    name: 'startDate', 
                                                    ref:(registerEvents({
                                                        required: "La fecha de inicio es requerida",
                                                    })),
                                                    autoComplete:"off",
                                                    className: ('form-control' + (errorsEvents.startDate ? ' is-invalid' : '')),
                                                }}
                                            />
                                            {errorsEvents.startDate && <div className="invalid-feedback d-block">{errorsEvents.startDate.message}</div>}
                                        </FormGroup>
                                    </Col> */}
                                    <Col md={4}>
                                        <FormGroup>
                                            <Label for="endDate">Fecha final</Label>
                                            <Datetime locale="Es-es" timeFormat={false} initialValue={shedule.endDate ? moment(shedule.endDate).utc().format('YYYY-MM-DD'):''}
                                                closeOnSelect
                                                dateFormat={'YYYY-MM-DD'}
                                                inputProps={{ 
                                                    name: 'endDate', 
                                                    ref:(registerEvents({
                                                        required: "La fecha final es requerida",
                                                    })),
                                                    autoComplete:"off",
                                                    className: ('form-control' + (errorsEvents.endDate ? ' is-invalid' : '')),
                                                }}
                                            />
                                            {errorsEvents.endDate && <div className="invalid-feedback d-block">{errorsEvents.endDate.message}</div>}
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Button color="primary" type="submit" disabled={updating} className="btn-round">
                                    {updating && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                    Actualizar
                                </Button>
                            </div>
                        </Form>

                        <div className="cd-schedule loading">
                            <div className="timeline">
                                <ul>
                                    <li><span>08:00</span></li>
                                    <li><span>08:30</span></li>
                                    <li><span>09:00</span></li>
                                    <li><span>09:30</span></li>
                                    <li><span>10:00</span></li>
                                    <li><span>10:30</span></li>
                                    <li><span>11:00</span></li>
                                    <li><span>11:30</span></li>
                                    <li><span>12:00</span></li>
                                    <li><span>12:30</span></li>
                                    <li><span>13:00</span></li>
                                    <li><span>13:30</span></li>
                                    <li><span>14:00</span></li>
                                    <li><span>14:30</span></li>
                                    <li><span>15:00</span></li>
                                    <li><span>15:30</span></li>
                                    <li><span>16:00</span></li>
                                    <li><span>16:30</span></li>
                                    <li><span>17:00</span></li>
                                </ul>
                            </div>

                            <div className="events">
                                <ul >
                                    <li className="events-group">
                                        <div className="top-info" onClick={()=>openModalCreateShedule(1)}><span>Lunes <Icon icon={addCircleLine} className="icon" color="green"/></span></div>
                                        <ul>
                                            {dataCalendar.length > 0 && dataCalendar.map((data, key) => {
                                                if(data.day == 1){
                                                    return(
                                                        <li key={key} onClick={(e)=>{e.preventDefault();openModalDetailEvent(data)}} className="single-event" data-start={data.datastart} data-end={data.dataend} data-content={data.content} data-event={data.dataevent}>
                                                            <a href="#">
                                                                <em className="event-name">{data.eventname}</em>
                                                            </a>
                                                        </li>
                                                    )
                                                }
                                            })}
                                        </ul>
                                    </li>

                                    <li className="events-group">
                                        <div className="top-info" onClick={()=>openModalCreateShedule(2)}><span>Martes <Icon icon={addCircleLine} className="icon" color="green"/></span></div>
                                        <ul>
                                            {dataCalendar.length > 0 && dataCalendar.map((data, key) => {
                                                if(data.day == 2){
                                                    return(
                                                        <li key={key} onClick={(e)=>{e.preventDefault();openModalDetailEvent(data)}} className="single-event" data-start={data.datastart} data-end={data.dataend} data-content={data.content} data-event={data.dataevent}>
                                                            <a href="#">
                                                                <em className="event-name">{data.eventname}</em>
                                                            </a>
                                                        </li>
                                                    )
                                                }
                                            })}
                                        </ul>
                                    </li>

                                    <li className="events-group">
                                        <div className="top-info" onClick={()=>openModalCreateShedule(3)}><span>Mi??rcoles <Icon icon={addCircleLine} className="icon" color="green"/></span></div>
                                        <ul>
                                            {dataCalendar.length > 0 && dataCalendar.map((data, key) => {
                                                if(data.day == 3){
                                                    return(
                                                        <li key={key} onClick={(e)=>{e.preventDefault();openModalDetailEvent(data)}} className="single-event" data-start={data.datastart} data-end={data.dataend} data-content={data.content} data-event={data.dataevent}>
                                                            <a href="#">
                                                                <em className="event-name">{data.eventname}</em>
                                                            </a>
                                                        </li>
                                                    )
                                                }
                                            })}
                                        </ul>
                                    </li>

                                    <li className="events-group">
                                        <div className="top-info" onClick={()=>openModalCreateShedule(4)}><span>Jueves <Icon icon={addCircleLine} className="icon" color="green"/></span></div>
                                        <ul>
                                            {dataCalendar.length > 0 && dataCalendar.map((data, key) => {
                                                if(data.day == 4){
                                                    return(
                                                        <li key={key} onClick={(e)=>{e.preventDefault();openModalDetailEvent(data)}} className="single-event" data-start={data.datastart} data-end={data.dataend} data-content={data.content} data-event={data.dataevent}>
                                                            <a href="#">
                                                                <em className="event-name">{data.eventname}</em>
                                                            </a>
                                                        </li>
                                                    )
                                                }
                                            })}
                                        </ul>
                                    </li>

                                    <li className="events-group">
                                        <div className="top-info" onClick={()=>openModalCreateShedule(5)}><span>Viernes <Icon icon={addCircleLine} className="icon" color="green"/></span></div>
                                        <ul>
                                            {dataCalendar.length > 0 && dataCalendar.map((data, key) => {
                                                if(data.day == 5){
                                                    return(
                                                        <li key={key} onClick={(e)=>{e.preventDefault();openModalDetailEvent(data)}} className="single-event" data-start={data.datastart} data-end={data.dataend} data-content={data.content} data-event={data.dataevent}>
                                                            <a href="#">
                                                                <em className="event-name">{data.eventname}</em>
                                                            </a>
                                                        </li>
                                                    )
                                                }
                                            })}
                                        </ul>
                                    </li>
                        
                                    <li className="events-group">
                                        <div className="top-info" onClick={()=>openModalCreateShedule(6)}><span>S??bado <Icon icon={addCircleLine} className="icon" color="green"/></span></div>
                                        <ul>
                                            {dataCalendar.length > 0 && dataCalendar.map((data, key) => {
                                                if(data.day == 6){
                                                    return(
                                                        <li key={key} onClick={(e)=>{e.preventDefault();openModalDetailEvent(data)}} className="single-event" data-start={data.datastart} data-end={data.dataend} data-content={data.content} data-event={data.dataevent}>
                                                            <a href="#">
                                                                <em className="event-name">{data.eventname}</em>
                                                            </a>
                                                        </li>
                                                    )
                                                }
                                            })}
                                        </ul>
                                    </li>

                                </ul>
                            </div>

                          
                            <div className="cover-layer"></div>
                        </div> 

                        </>}
                        {/* Modal Detalle  */}
                        <Modal toggle={() => {closeModalDetailEvent()}} isOpen={showEventDetail}>
                            <div className="modal-header">
                            <h5 className="modal-title" id="modalWarning">
                                Evento
                            </h5>
                            <button
                                aria-label="Close"
                                className="close"
                                type="button"
                                onClick={() =>  {closeModalDetailEvent()}}
                            >
                                <span aria-hidden={true}>??</span>
                            </button>
                            </div>
                            <div className="modal-body">
                                {event && <>
                                    <p className="h4">{event.eventname}</p>
                                    <p className="h5">{`${event.datastart} - ${event.dataend}`}</p>
                                    <p className="h4">Docente</p>
                                    <p className="h5">{`${event.user.firstName} ${event.user.lastName}`}</p>
                                </>}
                            </div>
                            <div className="modal-footer">
                                <Button color="primary" className="btn-round" onClick={()=>removeEvent()}>
                                    Eliminar
                                </Button>
                                <Button
                                    color="secondary"
                                    className="btn-round" outline
                                    type="button"
                                    onClick={() =>  {closeModalDetailEvent(false)}}
                                >
                                    Cerrar
                                </Button>
                            </div>
                        </Modal>

                        {/* Modal Warning */}
                        <Modal toggle={() => {setModalWarning(false); setModalMsg('')}} isOpen={modalWarning}>
                            <div className="modal-header">
                            <h5 className="modal-title" id="modalWarning">
                                Horarios
                            </h5>
                            <button
                                aria-label="Close"
                                className="close"
                                type="button"
                                onClick={() =>  {setModalWarning(false); setModalMsg('')}}
                            >
                                <span aria-hidden={true}>??</span>
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
                        {/* Modal agregar al calendario */}
						<Modal toggle={() => closeModalCreateShedule()} isOpen={modalVisible}>
                            <div className="modal-header">
                                <h5 className="modal-title" id="modalShedule">
                                    Agregar materia
                                </h5>
                                <button aria-label="Close" className="close" type="button" onClick={() => closeModalCreateShedule()}>
                                    <span aria-hidden={true}>??</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <>
                                    <p className="h5">{`D??a ${dayAdd}`}</p>
                                    
                                    <Alert color={`alert alert-danger`} isOpen={openWarning} fade={true}>
                                        <div className="container">
                                            {warningMessage}
                                            <button type="button" className="close" aria-label="Close" style={{ position: 'absolute', top:10, right: 50}} onClick={onDismissWarning}>
                                                <span aria-hidden="true">
                                                    <i className="now-ui-icons ui-1_simple-remove"></i>
                                                </span>
                                            </button>
                                        </div>
                                    </Alert>

                                    <Form onSubmit={handleSubmitAddShedule(onAddShedule)} style={{marginTop:15}}>
                                        <FormGroup>
                                            {gettingMatters && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                            <select className={'form-control' + (errorsShedule.matter ? ' is-invalid' : '')} name="matter"
                                                ref={registerShedule({ 
                                                        required: "La materia es requerida" 
                                                    })}>
                                                    <option key="" name="" value="">Seleccione materia</option>
                                                    {classes && classes.map(list => {
                                                        return( <option
                                                            key={list.id}
                                                            name={list.id}
                                                            value={list.id}>
                                                            {list.matter.name}
                                                        </option>)
                                                    })}
                                            </select>
                                            {errorsShedule.matter && <div className="invalid-feedback d-block">{errorsShedule.matter.message}</div>}
                                        </FormGroup>
                                        <FormGroup>
                                            <Datetime locale="Es-es" timeFormat={true} closeOnSelect
                                                dateFormat={false}
                                                timeFormat="HH:mm"
                                                initialViewDate="08:00"
                                                timeConstraints={{
                                                    hours: { min: 8, max: 17 }
                                                }}
                                                inputProps={{ 
                                                    name: 'start', 
                                                    ref:(registerShedule({
                                                        required: "La hora de inicio es requerida",
                                                    })),
                                                    autoComplete:"off",
                                                    placeholder:"Hora de inicio",
                                                    className: ('form-control' + (errorsShedule.start ? ' is-invalid' : '')),
                                                }}
                                            />
                                            {errorsShedule.start && <div className="invalid-feedback d-block">{errorsShedule.start.message}</div>}
                                        </FormGroup>
                                        <FormGroup>
                                            <Datetime locale="Es-es" timeFormat={true} closeOnSelect
                                                dateFormat={false}
                                                timeFormat="HH:mm"
                                                initialViewDate="08:00"
                                                timeConstraints={{
                                                    hours: { min: 8, max: 17 }
                                                }}
                                                inputProps={{ 
                                                    name: 'end', 
                                                    ref:(registerShedule({
                                                        required: "La hora final es requerida",
                                                    })),
                                                    autoComplete:"off",
                                                    placeholder:"Hora final",
                                                    className: ('form-control' + (errorsShedule.end ? ' is-invalid' : '')),
                                                }}
                                            />
                                            {errorsShedule.end && <div className="invalid-feedback d-block">{errorsShedule.end.message}</div>}
                                        </FormGroup>
                                    </Form>
                                </>
                            </div>
                            <div className="modal-footer">
                                <Button color="primary" className="btn-round" onClick={handleSubmitAddShedule(onAddShedule)}>
                                    Confirmar
                                </Button>
                                <Button color="secondary" className="btn-round" outline type="button" onClick={() => closeModalCreateShedule()}>
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

export default TimeTableUpdatePage;