/* eslint-disable */
import React, { useEffect, useState } from 'react';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink, PDFViewer, Font  } from '@react-pdf/renderer';
import { Col, Row, Button, Container } from 'reactstrap';
import { useLocation } from "react-router-dom";
import styled from 'styled-components';
import regular from '../../assets/fonts/Lato-Regular.ttf';
import bold from '../../assets/fonts/Lato-Bold.ttf';
import '../../assets/css/pdf.css';
import { history } from '../../helpers';

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

//Estilos pdf
const styles = StyleSheet.create({
    body: {
        paddingTop: 35,
        paddingBottom: 65,
        paddingHorizontal: 35,
        fontFamily:'Lato'
    },
    title: {
        fontSize: 18,
        textAlign: 'center',
        fontFamily: 'Lato Bold'
    },
    subtitle: {
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 40,
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
        marginBottom:'20px'
    },
    containerColumn: {
        flexDirection: 'row',
        alignItems: 'stretch',
        marginBottom:'10px'
    },
    detailColumn: {
        flexDirection: 'row',
        flexGrow: 9,
        textTransform: 'uppercase',
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
});

function ReferencePdfPage() {

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
   
    const formatter = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 2
    });

    //obtener carrera del state
    const [reference, setReference] = useState(null);
    const [total, setTotal] = useState(null);
    useEffect(() => {
        if(location.state === undefined){
            history.goBack();
        }else{
            setReference(location.state.reference);
            setTotal(formatter.format(location.state.reference.total));
        }
    }, [location]);

    const Reference = () => (
        <Document>
            <Page size="A4" style={styles.body}>
            <Text style={styles.title}>UNIVERSIDAD NACIONAL OBRERA</Text>
            <Text style={styles.subtitle}>FORMATO DE PAGO</Text>
            <View style={styles.containerColumn}>
                <View style={styles.detailColumn}>
                    <Text style={styles.field}>MATRÍCULA: </Text>
                    <Text style={styles.data}>{reference.student.registrationNumber}</Text>
                </View>
                <View style={styles.detailColumn}>
                    <Text style={styles.field}>PLANTEL: </Text>
                    <Text style={styles.data}>{reference.agency.name}</Text>
                </View>
            </View>
            <View style={styles.container}>
                <View style={styles.detailColumn}>
                    <Text style={styles.field}>ALUMNO: </Text>
                    <Text style={styles.data}>{`${reference.student.firstName} ${reference.student.lastName}`} </Text>
                </View>
            </View>
            {/* Datos */}
            <View style={styles.containerColumn}>
                <View style={styles.detailColumn}>
                    <Text style={styles.field}>CONCEPTO DE PAGO: </Text>
                    <Text style={styles.data}>{reference.type == 2 ? 'INSCRIPCIÓN':'COLEGIATURA'}</Text>
                </View>
            </View>
            <View style={styles.containerColumn}>
                <View style={styles.detailColumn}>
                    <Text style={styles.field}>PERIODO: </Text>
                    <Text style={styles.data}>{reference.period}</Text>
                </View>
            </View>
            <View style={styles.containerColumn}>
                <View style={styles.detailColumn}>
                    <Text style={styles.field}>MONTO: </Text>
                    <Text style={styles.data}>$ {total}</Text>
                </View>
            </View>
            <View style={styles.containerColumn}>
                <View style={styles.detailColumn}>
                    <Text style={styles.field}>BANCO: </Text>
                    <Text style={styles.data}>BBVA</Text>
                </View>
                <View style={styles.detailColumn}>
                    <Text style={styles.field}>CUENTA: </Text>
                    <Text style={styles.data}>{reference.account}</Text>
                </View>
            </View>
            <View style={styles.containerColumn}>
                <View style={styles.detailColumn}>
                    <Text style={styles.field}>TITULAR: </Text>
                    <Text style={styles.data}>{reference.titular}</Text>
                </View>
            </View>
            <View style={styles.containerColumn}>
                <View style={styles.detailColumn}>
                    <Text style={styles.field}>REFERENCIA: </Text>
                    <Text style={styles.data}>{reference.reference}</Text>
                </View>
            </View>
            <View style={styles.containerColumn}>
                <View style={styles.detailColumn}>
                    <Text style={styles.field}>FAVOR DE COLOCAR LA REFERENCIA AL MOMENTO DE EFECTUAR SU PAGO, EN CASO DE NO COLOCAR LA REFERENCIA DEBERA ADJUNTAR SU COMPROBANTE DE PAGO</Text>
                </View>
            </View>
        </Page>
        </Document>
    );

    return (
        <>
            <div className="d-flex" id="wrapper">
				<SideBar/>
				<div id="page-content-wrapper">
					<AdminNavbar/>
                    <div className="container-fluid">
                        <Container >
                            <Row>
                                <Col sm="12" style={{height:'100vh'}}>
                                    <h3>Referencia:</h3>
                                    {reference && <>
                                        <h5 className="text-center" style={{fontWeight:'bold', fontSize:18}}>UNIVERSIDAD NACIONAL OBRERA</h5>
                                        <div className="text-center" style={{fontSize:14, marginBottom:20}}>FORMATO DE PAGO</div>
                                        <Container className="data">
                                            <Row>
                                                <Col sm="6"><Field>MATRÍCULA:</Field> {reference.student.registrationNumber}</Col>
                                                <Col sm="6"><Field>PLANTEL:</Field> {reference.agency.name}</Col>
                                            </Row>
                                            <Row style={{marginBottom:20, borderBottomWidth: 2, borderBottomColor: 'black', borderBottomStyle: 'solid'}}>
                                                <Col sm="6"><Field>ALUMNO:</Field> {`${reference.student.firstName} ${reference.student.lastName}`}</Col>
                                            </Row>
                                            <Row>
                                                <Col sm="6"><Field>CONCEPTO DE PAGO:</Field> {reference.type == 2 ? 'INSCRIPCIÓN':'COLEGIATURA'}</Col>
                                            </Row>
                                            <Row>
                                                <Col sm="6"><Field>PERIODO:</Field> {reference.period}</Col>
                                            </Row>
                                            <Row>
                                                <Col sm="6"><Field>MONTO:</Field> $ {total}</Col>
                                            </Row> 
                                            <Row>
                                                <Col sm="6"><Field>BANCO:</Field> BBVA</Col>
                                                <Col sm="6"><Field>CUENTA:</Field> {reference.account}</Col>
                                            </Row> 
                                            <Row>
                                                <Col sm="6"><Field>TITULAR:</Field> {reference.titular}</Col>
                                            </Row>  
                                            <Row>
                                                <Col sm="6"><Field>REFERENCIA:</Field> {reference.reference}</Col>
                                            </Row>  
                                            <Row>
                                                <Col sm="12"><Field>FAVOR DE COLOCAR LA REFERENCIA AL MOMENTO DE EFECTUAR SU PAGO, EN CASO DE NO COLOCAR LA REFERENCIA DEBERA ADJUNTAR SU COMPROBANTE DE PAGO</Field></Col>
                                            </Row>                                          
                                        </Container>
                                    </>}
                                    {reference && <>
                                        {/* <PDFViewer width="100%" height="100%">
                                            <Reference/>
                                        </PDFViewer> */}
                                    </>}
                                    
                                    <div className="d-flex justify-content-between">
                                        {reference &&
                                            <PDFDownloadLink  document={<Reference />} className="btn btn-round btn-primary" style={{color:'white'}} fileName={`referencia ${reference.period}.pdf`}>
                                            {({ blob, url, loading, error }) => (loading ? 'Cargando..' : 'Descargar')}
                                            </PDFDownloadLink>
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

export default ReferencePdfPage;