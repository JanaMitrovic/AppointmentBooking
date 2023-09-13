import React, { useState, useEffect} from 'react'
import "../styles/info.css"
import {useNavigate} from "react-router-dom"
import Accordion from 'react-bootstrap/Accordion';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import {Form, Button} from 'react-bootstrap';

export default function InfoPage({categories, services}) {

  const [firstForm, setFirstForm] = useState(true);
  const [show, setShow] = useState(false);
  const handleShow = () => setShow(true);
  const handleClose = () => {
    setUser({ ...user, email: "" });
    setShow(false);
    setFirstForm(true);
  }

  const userObject = {
    first_name: "",
    last_name: "",
    company: "",
    address1: "",
    address2: "",
    zip_code: "",
    region: "",
    country: "",
    email: "",
    email_confirm: false,
  }

  const [user, setUser] =  useState(userObject);

  const handleEmailChange = (event) => {
    const { value } = event.target;
    setUser({ ...user, email: value, });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUser({ ...user, [name]: value });
  };

  const [emailSame, setEmailSame] = useState(false);
  
  const checkEmailConfirmation = (event) => {
    const { name, value } = event.target;
    console.log(value)
    if(value === user.email){
      setEmailSame(true);
      setUser({...user, [name]: true});
    }else {
      setEmailSame(false);
    }
  }

  const navigate = useNavigate();

  //First form
  const getUser = () => {
    if(!user.email){
      alert('Email is required!');
      return;
    }
    //Check if user exists
    let body = {
      email: user.email
    }
    axios.post('http://localhost:8000/users/findUser', body)
    .then(response => {
      if(response.data == null){
        console.log("User not found")
        setFirstForm(false)
      }else{
        console.log(response.data)
        navigate('/reservation', { state: { user: response.data, services: services, categories: categories, reservation: null, appointments: []} });
      }
    })
    .catch(error => {
      console.error('An error occurred:', error);
    });
  };

  //Second form
  const saveUser = () => {
      //NAPRAVI OVO MALO LEPSE
      if(!user.first_name || !user.last_name || !user.address1 || !user.zip_code || !user.region || !user.country || !user.email){
        alert('Fill in required fields! \nFirst name, Last name, Address1, Zip Code, Region, Country, Email, Email Confirm');
        return;
      }
      if(!emailSame){
        alert("Confirm your email!");
        return;
      }
      setFirstForm(true)

      let body = {
        user: user
      }
      axios.post('http://localhost:8000/users/saveUser', body)
      .then(response => {
          console.log(response.data)
          navigate('/reservation', { state: { user: user, services: services, categories: categories, reservation: null, appointments: []} });
      })
      .catch(error => {
        console.error('An error occurred:', error);
      });
  };

  return (
    <>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title" style={{fontSize: "30px"}}>Our services</h5>
          <br />
          <Accordion defaultActiveKey={['0']} alwaysOpen>
            {
              categories.map((category, index) => (
                <Accordion.Item eventKey={index} key={index}>
                  <Accordion.Header>{category.name}</Accordion.Header>
                  <Accordion.Body style={{textAlign: "left"}}>
                    <ol>
                      {
                        services
                        .filter(item => item.category === category._id)
                        .map((service, index) => 
                          <li key={index} style={{textTransform: "capitalize"}}>
                            <div className = "list-item">
                              <span><b>{service.name}</b> [{service.from}h - {service.to}h]({service.duration}min)</span>
                              <span className='dots'></span>
                              <span>{service.price}RSD</span>
                            </div>
                          </li>
                        )
                      }
                    </ol>
                  </Accordion.Body>
                </Accordion.Item>
              )) 
            }
          </Accordion>
          <br/>
          <button className="button-block" type="button" onClick={handleShow}>BOOK YOUR APPOINTMENT</button>

          <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
              <Modal.Title>{firstForm ? 'Enter your email' : 'Enter your info'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {firstForm ? (
                <Form>
                  <Form.Control className="form-control" type="text" size="lg" placeholder="Email" aria-label="default input example" required value={user.email} onChange={handleEmailChange}/>
                  <Button className="button-block" onClick={getUser}>Next</Button>
                </Form>
              ) : (
                <Form>
                  <Form.Control className="form-control" name="first_name" type="text" size="lg" placeholder="First name*" value={user.first_name} onChange={handleChange}/>
                  <Form.Control className="form-control" name="last_name" type="text" size="lg" placeholder="Last name*" value={user.last_name} onChange={handleChange}/>
                  <Form.Control className="form-control" name="company" type="text" size="lg" placeholder="Company" value={user.company} onChange={handleChange}/>
                  <Form.Control className="form-control" name="address1" type="text" size="lg" placeholder="Address1*" value={user.address1} onChange={handleChange}/>
                  <Form.Control className="form-control" name="address2" type="text" size="lg" placeholder="Address2" value={user.address2} onChange={handleChange}/>
                  <Form.Control className="form-control" name="zip_code" type="text" size="lg" placeholder="Zip code*" value={user.zip_code} onChange={handleChange}/>
                  <Form.Control className="form-control" name="region" type="text" size="lg" placeholder="Region*" value={user.region} onChange={handleChange}/>
                  <Form.Control className="form-control" name="country" type="text" size="lg" placeholder="Country*" value={user.country} onChange={handleChange}/>
                  <Form.Control className="form-control" name="email" type="text" size="lg" placeholder="Email" disabled value={user.email} onChange={handleChange}/>
                  <Form.Control className="form-control" name="email_confirm" type="text" size="lg" placeholder="Confirm email" disabled = {emailSame} onChange={checkEmailConfirmation}/>
                  <Button className="button-block" onClick={saveUser}>Submit</Button>
                </Form>
              )}
              
            </Modal.Body>
          </Modal>

        </div>
      </div>

      <div className="card" style={{marginTop:"25px", marginBottom: "25px", padding: "0px 20px", background: "#333456"}}>
        <div className="card-body" style={{color: "white"}}>
          <div className="row">
            <div className="col" style={{alignContent: "center"}}>
              <h5>Location</h5>
              <p>Jove Ilica 154, Belgrade<br/>
                02354329834<br/>
                trac225@gmail.com
              </p>
            </div>
            <div className="col">
              <h5>Business hours</h5>
              <p>Mon-Sun<br/>
                09:00-21:00
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
