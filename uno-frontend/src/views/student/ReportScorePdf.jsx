/* eslint-disable */
import React, { useEffect, useState,useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { scoreActions } from '../../actions';
import moment from 'moment';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Col, Row, Button, Container, Alert, Table, Spinner  } from 'reactstrap';
import { history } from '../../helpers';
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink, PDFViewer, Font, Image  } from '@react-pdf/renderer';
import { useLocation } from "react-router-dom";
import regular from '../../assets/fonts/Lato-Regular.ttf';
import styled from 'styled-components';
import bold from '../../assets/fonts/Lato-Bold.ttf';
import frame from '../../assets/img/pdf/letter.jpg';
import qr from '../../assets/img/pdf/qr.png';

//Estilos pdf
const styles = StyleSheet.create({
    body: {

        fontFamily:'Lato'
    },
    content: {
        marginTop: 20,
        paddingTop: 50,
        paddingBottom: 65,
        paddingHorizontal: 50,
    },
    data: {
        fontSize: 18,
        margin: 12,
    },
    text: {
        margin: 12,
        fontSize: 14,
        textAlign: 'justify',
    },
    container: {
        flexDirection: 'row',
        borderBottomWidth: 2,
        borderBottomColor: '#112131',
        borderBottomStyle: 'solid',
        alignItems: 'stretch',
        marginBottom:'10px'
    },
    containerColumn: {
        flexDirection: 'row',
        alignItems: 'stretch',
        marginBottom:'10px'
    },
    detailColumn: {
        flexDirection: 'row',
        flexGrow: 9,
    },
    data: {
        fontSize: 10,
        justifySelf: 'flex-end',
    },
    field: {
        fontSize: 10,
        justifySelf: 'flex-end',
        fontFamily: 'Lato Bold'
    },
    titleKardex: {
        fontSize: 12,
        textAlign: 'center',
        fontFamily: 'Lato Bold',
        color: '#5A0C0D',
    },
    titleQuarter: {
        fontSize: 12,
        fontFamily: 'Lato Bold'
    },

    table: {
        fontSize: 10,
        width: '100%',
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignContent: "stretch",
        flexWrap: "nowrap",
        alignItems: "stretch"
    },
    rowData: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        alignContent: "stretch",
        flexWrap: "nowrap",
        alignItems: "stretch",
        lineHeight:1,
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: 35
    },
    cell: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: "auto",
        alignSelf: "stretch",
        width: '20%'
    },
    header: {
        fontFamily: 'Lato Bold'
    },
    headerText: {
        fontSize: 11,
        margin: 8,
        textAlign: 'center',
    },
    cellMatter: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: "auto",
        alignSelf: "stretch",
        width: '40%',
        alignSelf: 'center'
    },
    cellContent: {
        fontSize: 11,
        margin: 8,
        textAlign: 'center',
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: "auto",
        alignSelf: "stretch",
        width: '20%'
    },
    headerDate: {
        fontSize: 11,
        margin: 8,
        textAlign: 'right',
        width:'50%',
        borderBottomWidth: 2,
        borderBottomColor: '#112131',
        borderBottomStyle: 'solid',
        backgroundColor:'#f8f9fa',
    },
    cellDate: {
        flexGrow: .1,
        flexShrink: 1,
        flexBasis: "auto",
        alignSelf: "stretch",
        alignItems: 'flex-end',
        width: '20%'
    },
    image: {
        width:'50%'
    },
    pageBackground: {
        position: 'absolute',
        minWidth: '100%',
        minHeight: '100%',
        display: 'block',
        height: '100%',
        width: '100%',
    },
    qr: {
        width: '70%',
    },
    containerFooter: {
        flexDirection: 'row',
        alignItems: 'stretch',
        marginBottom: '10px',
        marginTop: '40px'
    },
    row: {
        flex: 1,
        flexDirection: 'row',
        flexGrow: 1,
    },
    gridItem1: {
        width: '30%',
        alignItems: 'center'
    },
    gridItem2: {
        width: '40%',
        alignItems: 'center'
    },
    gridItem3: {
        width: '30%',
        alignItems: 'center'
    },
    text: {
        marginBotom: 5,
        marginTop:5,
        fontSize: 10,
        justifySelf: 'flex-end',
        fontFamily: 'Lato Bold'
    },
    rfc: {
        fontSize: 8,
        justifySelf: 'flex-center',
        fontFamily: 'Lato Bold'
    },

    title:{
        fontSize:16, 
        fontWeight:'bold',
        color: '#5A0C0D',
    }
});

Font.register( {
    family: 'Lato',
    src: regular,
});

Font.register( {
    family: 'Lato Bold',
    src: bold,
});

const Field = styled.span`
  font-size: 14px;
  font-weight: bold;
`;

/**
 * Boleta de calificaciones
 * @returns 
 */
function ReportScorePdfPage() {

    const location = useLocation();
    const dispatch = useDispatch();

  	useEffect(() => {
		document.body.classList.add("landing-page");
		document.body.classList.add("sidebar-collapse");
		document.documentElement.classList.remove("nav-open");
		return function cleanup() {
			document.body.classList.remove("landing-page");
			document.body.classList.remove("sidebar-collapse");
        }; 
    });

    const [readyDoc, setReadyDoc] = useState(false);

    useEffect(() => {
        dispatch(scoreActions.clearData());
    },[]);

    const [dataScore, setDataScore] = useState({});
    const [quarter, setQuarter] = useState([]); 
    const [student, setStudent] = useState(null); 
    const [career, setCareer] = useState(null);
    useEffect(() => {
        if(location.state === undefined){
            history.goBack();
        }else{
            let state = location.state.data;
            setQuarter(state.quarter);
            setDataScore(state.dataScore);
            setStudent(state.user);
            setCareer(state.career);
        }
    }, [location]);

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

  
    useEffect(() => {
        if(Object.entries(dataScore).length !== 0 && Object.entries(student).length !== 0 && quarter.length !== 0){
            setReadyDoc(true);
        }
    },[quarter, student, dataScore]);

    //Texto de cuatrimestre
    const getQuarterText = (quarter) => {
        var units = [
            "", "PRIMER", "SEGUNDO", "TERCER", "CUARTO", "QUINTO", "SEXTO", "SÉPTIMO", "OCTAVO", "NOVENO",
            "DÉCIMO", "UNDÉCIMO ", "DUODÉCIMO", "DECIMOTERCERO", "DECIMOCUARTO"
        ]
        return `${units[quarter]} CUATRIMESTRE`;
    };

    const ScoreReport = () => (
        <Document>
            <Page size="A4" style={styles.body}>
                <Image src={frame} style={styles.pageBackground} />
                {/* Header */}
                <View style={styles.content}>
                    
                    <View style={styles.table}>
                        <View style={[styles.rowData]}>
                            <View style={[styles.headerText, styles.cellMatter]}>
                            
                            </View>
                            <View style={styles.cellDate}>
                                <Text style={[styles.headerDate]}>{moment().local().format("YYYY-MM-DD")}</Text>
                            </View>
                            
                        </View>
                    </View>

                    <View style={styles.detailColumn}>
                        <Text style={styles.titleKardex}>SERVICIOS ESCOLARES</Text>
                    </View>
                    <View style={styles.container}>
                        <View style={styles.detailColumn}>
                            <Text style={styles.titleKardex}>BOLETA DE CALIFICACIONES </Text>
                        </View>
                    </View>

                    {/* Datos del alumno */}
                    <View style={styles.containerColumn}>
                        <View style={styles.detailColumn}>
                            <Text style={styles.field}>Nombres y Apellidos del Alumno: </Text>
                            <Text style={styles.data}>{`${student.firstName} ${student.lastName}`} </Text>
                        </View>
                    </View>
                    <View style={styles.containerColumn}>
                        <View style={styles.detailColumn}>
                            <Text style={styles.field}>Matrícula: </Text>
                            <Text style={styles.data}>{`${student.registrationNumber}`}</Text>
                        </View>
                    </View>
                    <View style={styles.containerColumn}>
                        <View style={styles.detailColumn}>
                            <Text style={styles.field}>Carrera: </Text>
                            <Text style={styles.data}>{`${career}`}</Text>
                        </View>
                    </View>

                    {/* Calificaciones */}
                    {(Object.entries(dataScore).length !== 0) && quarter.map(q => 
                        <View key={q} style={{marginTop:10}}>
                            <View style={styles.container}>
                                <View style={styles.detailColumn}>
                                    <Text style={styles.titleQuarter}>{getQuarterText(q)} </Text>
                                </View>
                            </View>
                            <View style={styles.table}>
                                <View style={[styles.rowData, styles.header]}>
                                    <Text style={[styles.headerText, styles.cellMatter]}>Asignatura</Text>
                                    {/* <Text style={[styles.headerText, styles.cell]}>1er Parcial</Text>
                                    <Text style={[styles.headerText, styles.cell]}>2do Parcial</Text> */}
                                    <Text style={[styles.headerText, styles.cell]}>FINAL</Text>
                                </View>
                                {dataScore[q].map(scores => 
                                    <View style={[styles.rowData]} key={scores._id}>
                                        <Text style={[styles.cellMatter]}>{scores.matter.name}</Text>
                                        {/* <Text style={[styles.cellContent]}>{scores.firstScore}</Text>
                                        <Text style={[styles.cellContent]}>{scores.secondScore}</Text> */}
                                        <Text style={[styles.cellContent]}>{scores.total}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Footer */}
                    <View style={styles.containerFooter}>
                        <View style={styles.row}>
                            <View style={styles.gridItem1}>
                                <Image src={qr} style={styles.qr} />
                                <Text style={styles.rfc}>RFC: GADK940726DR2</Text>
                            </View>
                            <View style={styles.gridItem2}>
                                <Text style={styles.text}>______________________________________</Text>
                                <Text style={styles.text}>Lic. Karla Mariana García Dávila</Text>
                                <Text style={styles.text}>DIRECTORA GENERAL</Text>
                                <Text style={styles.text}>Universidad Nacional Obrera de Guanajuato</Text>
                            </View>
                            <View style={styles.gridItem3}>
                                <Image src={qr} style={styles.qr} />
                                <Text style={styles.rfc}>RFC: UNO1810057VA</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );

    const DownloadPdf = () => {
        return useMemo(
          () => (
            <PDFDownloadLink  document={<ScoreReport />} className="btn btn-round btn-primary" style={{color:'white'}} fileName={`BoletaCalificaciones.pdf`}>
                {({ blob, url, loading, error }) => (loading ? 'Cargando..' : 'Descargar')}
            </PDFDownloadLink>
          ),
          [],
        )
    }

    return (
        <>
            <div className="d-flex" id="wrapper">
				<SideBar/>
				<div id="page-content-wrapper">
					<AdminNavbar/>
                    <div className="container-fluid">
                        <Container>
                        <Row > {/* style={{ height:'100vh' }} */}
                            <Col sm="12" md={{ size: 12, }}>
                                <h3>Boleta de Calificaciones</h3>
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
                                {!readyDoc &&  <div className="d-flex justify-content-center">
                                    <Spinner color="primary" />
                                </div>}
                                {readyDoc && <>
                                    <div className="text-center" style={styles.title}>SERVICIOS ESCOLARES</div>
                                    <div className="text-center" style={styles.title}>BOLETA DE CALIFICACIONES</div>
                                    <div className="data" style={{height:'70vh', overflowY:'scroll', overflowX:'hidden'}}>
                                        <Row >
                                            <Col sm="12"><Field>Nombres y Apellidos del Alumno: </Field> {`${student.firstName} ${student.lastName}`}</Col>
                                        </Row>
                                        <Row >
                                            <Col sm="12"><Field>Matrícula: </Field> {`${student.registrationNumber}`}</Col>
                                        </Row>
                                        <Row >
                                            <Col sm="12"><Field>Carrera: </Field> {`${career}`}</Col>
                                        </Row>
                                        {quarter.map(q => 
                                            <Row key={q}>
                                                <Col sm="12" >
                                                <div style={{fontSize:14, fontWeight:'bold', marginBottom:20, borderBottomWidth: 2, borderBottomColor: 'black', borderBottomStyle: 'solid'
                                                    , backgroundColor:'#f2f2f2'}}>
                                                    {getQuarterText(q)}
                                                </div>
                                                <Table id="scores">
                                                    <thead>
                                                        <tr>
                                                            <th>Asignatura</th>			
                                                            {/* <th>1er Parcial</th>
                                                            <th>2do Parcial</th> */}
                                                            <th>FINAL</th>	
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                    {dataScore[q].map((scores, index)  => {
                                                        return (
                                                            <tr key={index}>
                                                                <td>{scores.matter.name}</td>
                                                                {/* <td>{scores.firstScore}</td>
                                                                <td>{scores.secondScore}</td> */}
                                                                <td>{scores.total}</td>
                                                            </tr>
                                                            )
                                                        }) 
                                                    }
                                                    </tbody>
                                                </Table>
                                            </Col>
                                            </Row>
                                        )}
                                    </div>
                                </>}
                                {/* Previsualizar pdf para estilos */}
                                {/* {readyDoc && <>
                                    <PDFViewer width="100%" height="100%">
                                        <ScoreReport/>
                                    </PDFViewer>
                                </>} */}
                                <div className="d-flex justify-content-between">
                                    {readyDoc &&
                                        <DownloadPdf/>
                                    }
                                    <Button className="btn-round" outline onClick={e =>{e.preventDefault(); history.goBack();} }>Cancelar</Button>
                                </div>    
                            </Col>
                        </Row>
                        </Container>
                    </div>
				</div>
            </div>
        </>
    );
}

export default ReportScorePdfPage;