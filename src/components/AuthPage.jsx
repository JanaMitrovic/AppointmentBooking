import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Button, Modal, Form} from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom'

function AuthPage({categories, services}) {

    const location = useLocation();
    const update = location.state?.update;

    useEffect(() => {
        console.log(update)
    }, []);

    const navigate = useNavigate();
    const handleModalClose = () => navigate('/');

    const reservObject = {
        email: "",
        token: "",
    }

    const [reserv, setReserv] = useState(reservObject)

    const handleChange = (event) => {
        const { name, value } = event.target;
        setReserv({ ...reserv, [name]: value });
    };

    const handleUpdate = async () => {
        if(reserv.email === "" || reserv.token === ""){
            alert('Fill in email and token!');
            return;
        }

        let body = {
            email : reserv.email,
            token: reserv.token
        }

        axios.post('http://localhost:8000/reservations/find', body)
        .then(response => {
            if(response.data == null){
                alert("Reservation doesn't exist!");
                return;
            }
            const appointments = response.data.appointments.map((appointmentData) => {
            const service = services.find((service) => service._id === appointmentData.service);
            
            return {
                service,
                price: service.price,
                date: appointmentData.date,
                time: appointmentData.time,
            };
        });
              
            // console.log("Reservation: ", response.data.reservation);
            // console.log("Appointments: ", appointments);
            // console.log("Appointments: ", response.data.user);
            navigate('/reservation', { state: { user: response.data.user, services: services, categories: categories, reservation: response.data.reservation, appointments: appointments}});

        })
        .catch(error => {
        console.error('An error occurred:', error);
        });
        
    }

    const handleDelete = () => {
        if(reserv.email === "" || reserv.token === ""){
            alert('Fill in email and token!');
            return;
        }
    
        let body = {
            token: reserv.token,
            email: reserv.email
        }

        axios.post('http://localhost:8000/reservations/delete', body)
        .then(response => {
            console.log(response.data);
            if(response.data.reservation === null){
                alert(response.data.message);
                return;
            }
            alert(response.data.message);
            handleModalClose();
        })
        .catch(error => {
        console.error('An error occurred:', error);
        });
    }

    return (
        <Modal show={true} onHide={handleModalClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{update ? 'Update appointment' : 'Delete appointment'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Control className="form-control" type="text" size="lg" placeholder="Email" aria-label="default input example" required name="email" value={reserv.email} onChange={handleChange}/>
                    <Form.Control className="form-control" type="text" size="lg" placeholder="Token" aria-label="default input example" required name="token" value={reserv.token} onChange={handleChange}/>               
                </Form>
                </Modal.Body>
            <Modal.Footer>
                <Button className="button-block" variant="danger" onClick={update ? handleUpdate : handleDelete}>
                    {update ? 'Update' : 'Delete'}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default AuthPage