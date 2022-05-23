/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { history } from '../../helpers';
import AdminNavbar from "../../components/Navbars/AdminNavbar";
import SideBar from "../../components/SideBar/SideBar"
import { Row, Col, Button } from 'reactstrap';
import '../../assets/css/table.css';
import { useLocation } from "react-router-dom";
import { apiUrl } from '../../config/config';

function DocDetailPage() {

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

    const [url, setUrl] = useState(null);
	const [typeDescription, setTypeDescription] = useState(null);

	//Obtener parametros del documento
    useEffect(() => {
        if(location.state === undefined){
            history.goBack();
        }else{
			if(location.state.doc.id){
				setUrl(`${apiUrl}/document/getPdf/${location.state.doc.id}`);
			}else{
				setUrl(`${apiUrl}/document/getPdf/${location.state.doc._id}`)
			}
            
			setTypeDescription(location.state.doc.typeDescription.toLowerCase());
        }
    }, [location]);

    return (
        <>
            <div className="d-flex" id="wrapper">
				<SideBar/>
				<div id="page-content-wrapper">
					<AdminNavbar/>
					<div className="flex-column flex-md-row p-3">
						<div className="d-flex justify-content-between" style={{padding:"4px 16px 4px 24px"}}>
							<div className="align-self-center">
								<h3 style={{ marginBottom: '0' }}>Detalle {typeDescription}</h3>
							</div>
							<Button onClick={ ()=> history.goBack() } color="secondary" className="btn-round" outline >
								Regresar
							</Button>
						</div>
						<Row style = {{minHeight: "80vh"}}>
							<Col sm="12" md={{ size: 8, offset: 2 }}>
								{url && <object data={url} type="application/pdf" width="100%" height="100%">
									<iframe
										title="pdf document"
										id="print-file"
										src={url}
									/>
								</object>
                            }
							</Col>
						</Row>
					</div>
				</div>
            </div>
        </>
    );
}

export default DocDetailPage;