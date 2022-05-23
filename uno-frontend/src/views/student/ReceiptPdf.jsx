/* eslint-disable */
import React, { useEffect, useState } from 'react';
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink, PDFViewer, Font, Image } from '@react-pdf/renderer';
import { Col, Row, Button, Container } from 'reactstrap';
import { useLocation } from "react-router-dom";
import styled from 'styled-components';
import regular from '../../assets/fonts/Lato-Regular.ttf';
import bold from '../../assets/fonts/Lato-Bold.ttf';
import '../../assets/css/pdf.css';
import { history } from '../../helpers';
import frame from '../../assets/img/pdf/letter.jpg';
import qr from '../../assets/img/pdf/qr.png';
const Field = styled.span`
  font-size: 14px;
  font-weight: bold;
`;

//Estilos pdf
const styles = StyleSheet.create({
    body: {

        fontFamily: 'Lato'
    },
    content: {
        marginTop: 20,
        paddingTop: 50,
        paddingBottom: 65,
        paddingHorizontal: 50,
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
        marginBottom: '20px'
    },
    containerColumn: {
        flexDirection: 'row',
        alignItems: 'stretch',
        marginBottom: '10px'
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
});

/**
 * Justificante para alumno
 */
function ReceiptPdf() {

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

    const registerFont = () => {
        Font.register({
            family: 'Lato',
            src: regular,
        });

        Font.register({
            family: 'Lato Bold',
            src: bold,
        });
    };

    useEffect(() => {
        registerFont();
    }, []);

    //Permite esperar por la carga del tipo de fuente
    const [flag, setflag] = useState(false)
    useEffect(() => {
        var timer = setTimeout(() => {
            setflag(true);
        }, 100)
    }, []);

    const formatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2
    });

    //obtener estudiante del state
    const [student, setStudent] = useState(null);

    useEffect(() => {
        if (location.state === undefined) {
            history.goBack();
        } else {
            setStudent(location.state.student);
        }
    }, [location]);


    const Receipt = () => (
        <Document>
            <Page size="LETTER" style={styles.body}>
                <Image src={frame} style={styles.pageBackground} />
                <View style={styles.content}>
                    <Text style={styles.title}>JUSTIFICANTE</Text>
                    <View style={styles.containerColumn}>
                        <View style={styles.detailColumn}>
                            <Text style={styles.field}>MATRÍCULA: </Text>
                            <Text style={styles.data}></Text>
                        </View>
                        <View style={styles.detailColumn}>
                            <Text style={styles.field}>PLANTEL: </Text>
                            <Text style={styles.data}></Text>
                        </View>
                    </View>
                    <View style={styles.container}>
                        <View style={styles.detailColumn}>
                            <Text style={styles.field}>ALUMNO: </Text>
                            <Text style={styles.data}> </Text>
                        </View>
                    </View>
                    {/* Datos */}
                    <View style={styles.containerColumn}>
                        <View style={styles.detailColumn}>
                            <Text style={styles.field}>CONCEPTO DE PAGO: </Text>
                            <Text style={styles.data}></Text>
                        </View>
                    </View>
                    <View style={styles.containerColumn}>
                        <View style={styles.detailColumn}>
                            <Text style={styles.field}>PERIODO: </Text>
                            <Text style={styles.data}></Text>
                        </View>
                    </View>
                    <View style={styles.containerColumn}>
                        <View style={styles.detailColumn}>
                            <Text style={styles.field}>MONTO: </Text>
                            <Text style={styles.data}>$ </Text>
                        </View>
                    </View>
                    <View style={styles.containerColumn}>
                        <View style={styles.detailColumn}>
                            <Text style={styles.field}>BANCO: </Text>
                            <Text style={styles.data}>BBVA</Text>
                        </View>
                        <View style={styles.detailColumn}>
                            <Text style={styles.field}>CUENTA: </Text>
                            <Text style={styles.data}></Text>
                        </View>
                    </View>
                    <View style={styles.containerColumn}>
                        <View style={styles.detailColumn}>
                            <Text style={styles.field}>TITULAR: </Text>
                            <Text style={styles.data}></Text>
                        </View>
                    </View>
                    <View style={styles.containerColumn}>
                        <View style={styles.detailColumn}>
                            <Text style={styles.field}>REFERENCIA: </Text>
                            <Text style={styles.data}></Text>
                        </View>
                    </View>
                    <View style={styles.containerColumn}>
                        <View style={styles.detailColumn}>
                            <Text style={styles.field}>FAVOR DE COLOCAR LA REFERENCIA AL MOMENTO DE EFECTUAR SU PAGO, EN CASO DE NO COLOCAR LA REFERENCIA DEBERA ADJUNTAR SU COMPROBANTE DE PAGO</Text>
                        </View>
                    </View>
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

    return (
        <>
            <div className="d-flex" id="wrapper">
                <SideBar />
                <div id="page-content-wrapper">
                    <AdminNavbar />
                    <div className="container-fluid">
                        <Container >
                            <Row>
                                <Col sm="12" style={{ height: '100vh' }}>
                                    <h3>Constancia de estudios:</h3>
                                    {(flag && student) && <>
                                        <PDFViewer width="100%" height="100%">
                                            <Receipt />
                                        </PDFViewer>
                                    </>}
                                    <div className="d-flex justify-content-between">
                                        <Button className="btn-round" outline onClick={e => { e.preventDefault(); history.goBack(); }}>Cancelar</Button>
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

export default ReceiptPdf;