/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// reactstrap components
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Container,
    Col,
    Alert,
    Spinner
} from "reactstrap";
  
import { userActions } from '../actions';

function RequestResetPwd() {

    let { token } = useParams();

    const loading = useSelector(state => state.users.loading);
    const alert = useSelector(state => state.alert);
    const dispatch = useDispatch();

    //Mostrar alerta
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if(alert.message){
			setVisible(true);
		}
    },[alert]);

    useEffect(() => {
        dispatch(userActions.reset(token));
    },[]);


    return (
        <>
        <div className="content mt-5">
            <Container>
            	<Col className="ml-auto mr-auto" md="4">
              	<Card className="card-login card-plain ">
					<CardHeader className="text-center">
                        {alert.message &&
                            <Alert color={`alert ${alert.type}`} isOpen={visible}>
                                {alert.message}
                            </Alert>
                        }
					</CardHeader>
                  	<CardBody>
                        <div className="d-flex justify-content-center">
                            {loading &&  <Spinner  color="primary" />}
                        </div>
                  	</CardBody>
					<CardFooter className="text-center">
					</CardFooter>
              	</Card>
            </Col>
          	</Container>
        </div>
        </>
    );
}

export default RequestResetPwd;