/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sheduleActions } from '../../actions';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Button, Alert,  Modal, Spinner  } from 'reactstrap';
import { Icon } from '@iconify/react';
import addCircleLine from '@iconify-icons/ri/add-circle-line';
import { useLocation } from "react-router-dom";

function TimeTableUserPage() {

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

    const user = useSelector(state => state.authentication.user);
    
    const sheduleState = useSelector(state => state.shedules.shedule);
    const searching = useSelector(state => state.shedules.searching);
    //obtener sede del state
    const [shedule, setShedule] = useState(null);

    useEffect(() => {
        let dataUser = {
            id: user.id,
            role: user.role
        }
        dispatch(sheduleActions.getSheduleUser( dataUser ))
    }, [location]);

    useEffect(() => {
        if(sheduleState){
            //Llenar calendario
            setShedule(sheduleState);
            onLoadEvents(sheduleState); 
        }
    },[sheduleState]);

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

    //Modal genérico y mensaje
	const [modalWarning, setModalWarning] = useState(false);
	const [modalMsg, setModalMsg] = useState('');


    //Array de eventos en el calendario
    const [dataCalendar, setDataCalendar] = useState([]);

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

    return (
        <>
            <div className="d-flex" id="wrapper">
				<SideBar/>
				<div id="page-content-wrapper">
					<AdminNavbar/>
                    <div className="flex-column flex-md-row p-3">
                     
                        <div className="d-flex justify-content-between" style={{padding:"4px 16px 4px 24px"}}>
							<div className="align-self-center">
								<h3 style={{ marginBottom: '0' }}>Calendario</h3>
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
                                        <div className="top-info"><span>Lunes </span></div>
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
                                        <div className="top-info"><span>Martes </span></div>
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
                                        <div className="top-info"><span>Miércoles </span></div>
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
                                        <div className="top-info"><span>Jueves </span></div>
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
                                        <div className="top-info"><span>Viernes </span></div>
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
                                        <div className="top-info"><span>Sábado </span></div>
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
                                <span aria-hidden={true}>×</span>
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

export default TimeTableUserPage;