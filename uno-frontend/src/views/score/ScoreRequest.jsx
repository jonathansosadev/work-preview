/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { scoreActions } from '../../actions';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Col, Row, Button, Form, FormGroup, Label, Container, Alert  } from 'reactstrap';
import { useForm  } from "react-hook-form";
import { history } from '../../helpers';

function ScoreRequestPage() {

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

    //Alertas
    const alert = useSelector(state => state.alert);
    //Mostrar alertas
    const [visible, setVisible] = useState(true);
    const onDismiss = () => setVisible(false);
    
    useEffect(() => {
        if(alert.message){
            setVisible(true); 
            window.setTimeout(()=>{setVisible(false)},5000);   
        }
    },[alert]);

    //Form Data
    const { handleSubmit, register, errors, reset } = useForm();

    //buscar data kardex
    const onSearchKardex = (data, e) => {
        let select = listCareers.find(item => item.career.id == data.career);
        setCareer(select.career.name);
        dispatch(scoreActions.dataTableKardex( user.id, data.career ));
    };

    const statusSave = useSelector(state => state.matters);
    //Verificar si guardo y limpiar form
    useEffect(() => {
        if(statusSave.success){ 
            reset();
        }
    },[statusSave.success]);

    //State de busqueda
    const loading = useSelector(state => state.score.loading);

    //obtener carreras para select
    const getting = useSelector(state => state.score.getting);
    const careers = useSelector(state => state.score);

    useEffect(() => {
        dispatch(scoreActions.getStudentCareer(user.id));
    },[]);

    const [listCareers, setListCareers] = useState(null);
    const [career, setCareer] = useState(null);
    const [warning, setWarning] = useState(false);

    useEffect(() => {

        if(careers.obtained){
            if(careers.list.length == 0){
                //mostrar warning que no tiene inscripciones o carreras inscritas
                setWarning(true);
            }

            setListCareers(careers.list);
        }
    },[careers.obtained]);

    const [data, setData] = useState([]);
    const dataKardex = useSelector(state => state.score.data);

	//Verificar data de redux
	useEffect(() => {
		if(dataKardex && dataKardex.results){
			setData(dataKardex.results);
        }
    },[dataKardex]);
    
    //Agrupar materias por cuatrimestre
    //Setear cantidad de cuatrimestres
    useEffect(() => {
		if(data && data.length>0){
            let quarters = []
			const matters = data.reduce((matters, item) => {
                const group = (matters[item.matter.quarter] || []);
                group.push(item);
                matters[item.matter.quarter] = group;
                quarters.push(parseInt(item.matter.quarter));
                return matters;
            }, {});
            //Obtener cuatrimestres disponibles
            let unique = [...new Set(quarters)];

            //Enviar data al preview
            let dataKardex = {
                quarter: unique,
                dataScore: matters,
                user,
                career,
            }
            history.push('/view-kardex',{data: dataKardex});
        }
    },[data]);

    return (
        <>
            <div className="d-flex" id="wrapper">
				<SideBar/>
				<div id="page-content-wrapper">
					<AdminNavbar/>
                    <div className="container-fluid">
                        <Container>
                        <Row>
                            <Col sm="12" md={{ size: 8, offset: 2 }}>
                                {/* <img src={logo}></img> */}
                                <h3>Selecciona carrera</h3>
                                {alert.message &&
                                    <Alert color={`alert ${alert.type}`} isOpen={visible} fade={true}>
                                        <div className="container">
                                            {alert.message}
                                            <button
                                                type="button"
                                                className="close"
                                                aria-label="Close"
                                                onClick={onDismiss}
                                            >
                                                <span aria-hidden="true">
                                                <i className="now-ui-icons ui-1_simple-remove"></i>
                                                </span>
                                            </button>
                                        </div>
                                    </Alert>
                                }
                                {warning && 
                                    <Alert color={`alert alert-info`} isOpen={warning} fade={true}>
                                            No hay información disponible en estos momentos
                                            <button
                                                type="button"
                                                className="close"
                                                aria-label="Close"
                                                onClick={()=>setWarning(false)}
                                            >
                                                <span aria-hidden="true">
                                                <i className="now-ui-icons ui-1_simple-remove"></i>
                                                </span>
                                            </button>
                                    </Alert>
                                }
                                <Form onSubmit={handleSubmit(onSearchKardex)} className="form">
                                    <Row form>
                                        <Col md={12}>
                                        <FormGroup>
                                            <Label for="career">Carrera</Label>{' '}
                                            {getting && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                            <select className={'form-control' + (errors.career ? ' is-invalid' : '')} name="career"
                                                ref={register({ 
                                                        required: "La carrera es requerida" 
                                                    })}>
                                                    <option key="" name="" value=""></option>
                                                    {listCareers && listCareers.map(list => 
                                                        <option
                                                            key={list.career.id}
                                                            name={list.career.id}
                                                            value={list.career.id}>
                                                            {list.career.name}
                                                        </option>
                                                    )}
                                            </select>
                                            {errors.career && <div className="invalid-feedback d-block">{errors.career.message}</div>}
                                        </FormGroup>
                                        </Col>
                                    </Row>
                                   
                                    <div className="d-flex justify-content-between">
                                        <Button color="primary" className="btn-round" disabled={loading}>
                                            {loading && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                            Buscar
                                        </Button>
                                        <Button className="btn-round" outline onClick={e =>{e.preventDefault(); history.goBack();} }>Cancelar</Button>
                                    </div>
                                </Form>    
                            </Col>
                        </Row>
                        </Container>
                    </div>
				</div>
            </div>
        </>
    );
}

export default ScoreRequestPage;