import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import {Form, Button, Modal, Table} from 'react-bootstrap';
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import axios from 'axios';

export default function ReservationPage() {
  //Get properties
  const location = useLocation();
  const [user, setUser] =  useState(location.state?.user);
  const services = location.state?.services;
  const categories = location.state?.categories;
  const reservation = location.state?.reservation;
  const appointmentsState = location.state?.appointments;

  //CHANGE USER INFO
  const [showUserUpdate, setShowUserUpdate] = useState(false);
  const handleShowUserUpdate = () => setShowUserUpdate(true);
  const handleCloseUserUpdate = () => setShowUserUpdate(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUser({ ...user, [name]: value });
  };

  const changeUser = () => {
    if(!user.first_name || !user.last_name || !user.address1 || !user.zip_code || !user.region || !user.country || !user.email){
      alert('Fill in required fields! \nFirst name, Last name, Address1, Zip Code, Region, Country, Email, Email Confirm');
      return;
    }

    let body = {
      user: user
    }
    axios.put('http://localhost:8000/users/changeUser', body)
    .then(response => {
        console.log(response.data)
        handleCloseUserUpdate();
    })
    .catch(error => {
      console.error('An error occurred:', error);
    });
  };

  //SELECT CATEGORY - filter services
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Handler function to update the selected category
  const handleCategoryChange = (e) => {
    if(e.target.value === ""){
      setSelectedCategory(null)
      return;
    }
    const selectedCat = categories.find(category => category._id === e.target.value);
    setSelectedCategory(selectedCat);
  };


  //SELECT SERVICE - generate time slots
  const AppointmentObject = {
    service: null,
    date: "",
    time: "",
    price: 0
  }

  const [appointment, setAppointment] = useState(AppointmentObject);
  const [appointments, setAppointments] = useState(appointmentsState);

  const [timeSlots, setTimeSlots] = useState([]);

  // Function to handle changes in service duration
  function handleServiceChange(e) {
    const selectedService = services.find(service => service._id == e.target.value);
    setAppointment({ ...appointment, service : selectedService, price: selectedService.price});
    // setAppointment({ ...appointment, service : selectedService});
    setTimeSlots(generateTimeSlots(selectedService));
  }

  // Function to generate time slots based on service duration
  function generateTimeSlots(selectedService) {
    const startTime = selectedService.from * 60;
    const endTime = selectedService.to * 60;
    const timeSlots = [];

    for (let i = startTime; i <= endTime - selectedService.duration; i += selectedService.duration) {
      const startHour = Math.floor(i / 60);
      const startMinute = i % 60;
      const endHour = Math.floor((i + selectedService.duration) / 60);
      const endMinute = (i + selectedService.duration) % 60;

      const formattedStartTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
      const formattedEndTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
      const formattedSlot = formattedStartTime + " - " + formattedEndTime

      timeSlots.push(formattedSlot);
    }

      return timeSlots;
    }

  //SELECT TIME SLOT  
  const getSelectedTimeSlot = (e) => {
    const selectedSlot = timeSlots.find(slot => slot === e.target.value);
    setAppointment({ ...appointment, time: selectedSlot });
  }

  //SELECT DATE
  const getSelectedDate = (date) => {
    if (date) {
      const formattedDate = dayjs(date).format('DD/MM/YYYY');
      setAppointment({ ...appointment, date : formattedDate })
    }
  }

  //ADD APPOINTMENT
  const addAppointment = () => {
    if(appointment.service == null || appointment.date === "" || appointment.time === ""){
      alert("Choose appointment information");
      return;
    }
    let body = {
      service: appointment.service._id,
      date: appointment.date,
      time: appointment.time
    }
    axios.post('http://localhost:8000/appointments/findAppointment', body)
    .then(response => {
      if(response.data == null && !checkArray(appointment)){
        setAppointments([...appointments, appointment])
        return;
      }else{
        alert("Appointment already occupied! Choose another");
        return;
      }
    })
    .catch(error => {
      console.error('An error occurred:', error);
    });
    document.getElementById('Category-select').value = "";
    document.getElementById("Service-select").value = "";
    document.getElementById("Time-select").value = "";
    setAppointment(AppointmentObject);
  }

  function checkArray(appointment){
    for (let i = 0; i < appointments.length; i++) {
      if(appointments[i].service === appointment.service && appointments[i].date === appointment.date && appointments[i].time === appointment.time){
        return true;
      }
    }
    return false;
  }

  //REMOVE APPOINTMENT
  const removeAppointment = async (index) => {
    if(reservation !== null){
      let body = {
        service: appointments[index].service._id,
        date: appointments[index].date,
        time: appointments[index].time
      }
      await axios.delete('http://localhost:8000/appointments/deleteAppointment', { data: body })
      .then(response => {
        console.log(response.data.message);
      })
      .catch(error => {
        console.error('An error occurred:', error);
      });
    }
    const updatedAppointments = [...appointments];
    updatedAppointments.splice(index, 1);
    setAppointments(updatedAppointments);
  }

  //PROMO CODE
  const [promoCode, setPromoCode] = useState("");
  const [promoCodeValid, setPromoCodeValid] = useState(false);

  const handlePromoCodeChange = (e) => {
    setPromoCode(e.target.value);
  }

  //MAKE RESERVATION
  const [showModal1, setShowModal1] = useState(false);
  const handleShowModal1 = () => setShowModal1(true);
  const handleCloseModal1 = () => {
    for (let i = 0; i < appointments.length; i++) {
      appointments[i].price = appointments[i].service.price;
    }
    setPrice(0);
    setPromoCode("");
    setPromoCodeValid(false);
    setShowModal1(false);
  }

  const makeReservation = async () => {
    if(appointments.length == 0){
      alert("Add appointments!");
      return;
    }
    await calculatePrice(appointments);
    handleShowModal1();
  }

  const [price, setPrice] = useState(0);

  async function calculatePrice(appointments){
    let sum = 0;
    for (let i = 0; i < appointments.length; i++) {
      if(earlyBird(appointments[i])){
        appointments[i].price *= 0.95;
      }
      let count = 0;
      for (let j = 0; j < i; j++) {
        if(appointments[j].service.category === appointments[i].service.category){
          count++;
        }
      }
      if(count%2 == 1){
        appointments[i].price *= 0.9;
      }
      sum += appointments[i].price;
      console.log(sum);
    }

    if(reservation === null && promoCode !== ""){
       const valid = await checkPromoCode(promoCode);
       if(valid){
        sum *= 0.95;
        console.log("PC***" + sum);
       }else{
        setPromoCode("");
       }
    }

    if(reservation !== null && reservation.promoCode !== ""){
      sum *= 0.95;
    }

    setPrice(sum)
  }

  function earlyBird(appointment){
    const formattedDate = dayjs(appointment.date, 'DD/MM/YYYY');
    const currentDate = dayjs(); // Get the current date
    const differenceInDays = formattedDate.diff(currentDate, 'day');
    if (differenceInDays > 15) {
        return true;
    }
    return false;
  }

  async function checkPromoCode(promoCode){
    let body = {
      code: promoCode,
      userEmail: user.email
    }
    try {
      const response = await axios.post('http://localhost:8000/promocodes/check', body)
      if(response.data === null){
        console.log("PC Not valid");
        return false;
      }else{
        console.log("Pc VALID");
        return true;
      }
    } catch (error) {
      console.error('An error occurred:', error);
      return false;
    }
  }

  //SAVE RESERVATION
  let responseData = {
    email: "",
    token: "",
    promoCode: "",
    userMassage: ""
  };

  const [resData, setResData] = useState(responseData);

  const saveReservation = () => {
    let body = {
      userEmail: user.email,
      price: price,
      usedPromoCode: promoCode,
      appointments: appointments
    }
    console.log(body);
    axios.post('http://localhost:8000/reservations/save', body)
    .then(response => {
        setResData(response.data);
        handleCloseModal1();
        handleShowModal2();
    })
    .catch(error => {
      console.error('An error occurred:', error);
    });
  }

  //GET RESPONSE
  const navigate = useNavigate();
  const [showModal2, setShowModal2] = useState(false);
  const handleShowModal2 = () => setShowModal2(true);
  const handleCloseModal2 = () => {
    setShowModal2(false);
    navigate('/');
  }

  //UPDATE RESERVATION
  const updateReservation = () => {
    let body = {
      reservation: reservation,
      price: price,
      appointments: appointments
    }
    console.log(body);
    axios.post('http://localhost:8000/reservations/update', body)
    .then(response => {
      if(response.data !== null){
        setResData({...resData, email : response.data.email, token : response.data.token});
        handleCloseModal1();
        handleShowModal2();
      }else{
        alert("Failed to updated!");
        return;
      }
    })
    .catch(error => {
      console.error('An error occurred:', error);
    });
  }


  return (
    <div className="card">
        <div className="card-body">
          <h5 className="card-title" style={{fontSize: "30px"}}>{reservation === null ? "Make your reservation" : "Update your reservation"}</h5>
          <div className='row'>
            <div className='col-5'>
              <div className="mb-3 row">
                <Form>
                  <Form.Control className="form-control" name="first_name" type="text" size="md" placeholder="First name" value={user.first_name} disabled readOnly/>
                  <Form.Control className="form-control" name="last_name" type="text" size="md" placeholder="Last name" value={user.last_name} disabled readOnly/>
                  <Form.Control className="form-control" name="company" type="text" size="md" placeholder="Company" value={user.company} disabled readOnly/>
                  <Form.Control className="form-control" name="address1" type="text" size="md" placeholder="Address1" value={user.address1} disabled readOnly/>
                  <Form.Control className="form-control" name="address2" type="text" size="md" placeholder="Address2" value={user.address2} disabled readOnly/>
                  <Form.Control className="form-control" name="zip_code" type="text" size="md" placeholder="Zip code" value={user.zip_code} disabled readOnly/>
                  <Form.Control className="form-control" name="region" type="text" size="md" placeholder="Region" value={user.region} disabled readOnly/>
                  <Form.Control className="form-control" name="country" type="text" size="md" placeholder="Country" value={user.country} disabled readOnly/>
                  <Form.Control className="form-control" name="email" type="text" size="md" placeholder="Email" value={user.email} disabled readOnly/>
                  <Button  className="button-block-outline" variant="outline-primary" type="button" onClick={handleShowUserUpdate}>Change your info</Button>
                </Form>

                <Modal show={showUserUpdate} onHide={handleCloseUserUpdate} centered>
                  <Modal.Header closeButton>
                    <Modal.Title>Change your info</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                      <Form>
                        <Form.Control className="form-control" name="first_name" type="text" size="lg" placeholder="First name" value={user.first_name} onChange={handleChange}/>
                        <Form.Control className="form-control" name="last_name" type="text" size="lg" placeholder="Last name" value={user.last_name} onChange={handleChange}/>
                        <Form.Control className="form-control" name="company" type="text" size="lg" placeholder="Company" value={user.company} onChange={handleChange}/>
                        <Form.Control className="form-control" name="address1" type="text" size="lg" placeholder="Address1" value={user.address1} onChange={handleChange}/>
                        <Form.Control className="form-control" name="address2" type="text" size="lg" placeholder="Address2" value={user.address2} onChange={handleChange}/>
                        <Form.Control className="form-control" name="zip_code" type="text" size="lg" placeholder="Zip code" value={user.zip_code} onChange={handleChange}/>
                        <Form.Control className="form-control" name="region" type="text" size="lg" placeholder="Region" value={user.region} onChange={handleChange}/>
                        <Form.Control className="form-control" name="country" type="text" size="lg" placeholder="Country" value={user.country} onChange={handleChange}/>
                        <Form.Control className="form-control" name="email" type="text" size="lg" placeholder="Email" disabled value={user.email}/>
                        <Button className="button-block" onClick={changeUser}>Submit</Button>
                      </Form>                    
                  </Modal.Body>
                </Modal>
              </div>
            </div>
            <div className='col-7'>
              <div className='row'>
                <div className='col-6'>
                  <Form.Select className="form-control" id='Category-select' onChange={handleCategoryChange}>
                    <option value="">Select category</option>
                    {
                      categories.map((category, index) => 
                      <option value={category._id} key={index}>{category.name}</option>
                      ) 
                    }
                  </Form.Select>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker sx={{ width: '100%', height: '50%', marginTop: "7px" }} id='Date' onChange={getSelectedDate}/>
                  </LocalizationProvider>
                  
                </div>
                <div className='col-6'>
                  <Form.Select  className="form-control" id='Service-select' onChange={handleServiceChange}>
                    <option value="">Select service</option>
                    {
                      services
                      .filter((service) => {
                        if (selectedCategory === null) {
                          return true;
                        }
                        return service.category === selectedCategory._id;
                      })
                      .map((service, index) => 
                        <option value={service._id} key={index}>{service.name}</option>
                      )
                    }
                  </Form.Select>
                  <Form.Select className="form-control" id='Time-select' style={{height: "57px"}} onChange={getSelectedTimeSlot}>
                    <option value="">Choose time</option>
                    {
                      timeSlots.map((slot, index) => 
                      <option value={slot} key={index}>{slot}</option>
                      ) 
                    }
                  </Form.Select>
                  <Button className="button-block" style={{background: "#3d3e5a"}} onClick={addAppointment}>Add appointment</Button>
                </div>   
              </div>    
              <div className='row'>
                <Table striped bordered hover style={{marginTop : "20px", marginLeft : "15px", width : "95%"}}>
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>X</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      appointments
                      .map((appointment, index) => 
                      <tr key={index}>
                        <td>{appointment.service.name}</td>
                        <td>{appointment.date}</td>
                        <td>{appointment.time}</td>
                        <td><Button variant='danger' style={{height: "30px", width: "30px", padding: "2px"}} onClick={() => removeAppointment(index)}>X</Button></td>
                      </tr>
                      )
                    }
                  </tbody>
                </Table>
                <Form.Control className="form-control" name="promo-code" type="text" size="lg" style={{width: "45%", marginLeft: "15px"}} placeholder="Promo Code" value={promoCode} onChange={handlePromoCodeChange} disabled={reservation === null ? false : true}/>
                <Button className="button-block" style={{marginTop : "20px", marginLeft : "15px", width : "95%"}} onClick={makeReservation}>{reservation === null ? "Make reservation" : "Update reservation"}</Button>
                
                <Modal show={showModal1} onHide={handleCloseModal1} centered>
                  <Modal.Header closeButton>
                    <Modal.Title>{reservation === null ? "Confirm reservation" : "Update reservation"}</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                      <Table striped bordered hover style={{marginTop : "20px", marginLeft : "15px", width : "95%"}}>
                      <thead>
                        <tr>
                          <th>Service</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          appointments
                          .map((appointment, index) => 
                          <tr key={index}>
                            <td>{appointment.service.name}</td>
                            <td>{appointment.date}</td>
                            <td>{appointment.time}</td>
                            <td>{appointment.price}</td>
                          </tr>
                          )
                        }
                      </tbody>
                    </Table> 
                    <div className='row' style={{alignItems: "center"}}>
                      <div className="col-3">
                        <label htmlFor="Price" style={{marginLeft: "15px", fontSize: "17px"}}><b>Final price</b></label>
                      </div>
                      <div className="col-8">
                        <Form.Control id='Price' className="form-control" name="res-price" type="text" size="lg" style={{width: "75%"}} placeholder="Promo Code" value={price} readOnly/>
                      </div>
                    </div>
                    <Button className="button-block" style={{marginTop : "20px", marginLeft : "15px", width : "95%"}} onClick={reservation === null ? saveReservation : updateReservation}>Confirm</Button>          
                  </Modal.Body>
                </Modal>

                <Modal show={showModal2} onHide={handleCloseModal2} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{reservation === null ? "Reservation acceted!" : "Reservation updated!"}</Modal.Title>
                  </Modal.Header>
                  <Modal.Body style={{fontSize: "16px"}}>
                    {
                      reservation === null ? (
                        <div>
                          <p>Email: <b>{resData.email}</b></p>
                          <p>Token: <b>{resData.token}</b></p>
                          <p>Promo Code: <b>{resData.promoCode}</b></p>
                          <br />
                          {resData.userMassage !== "" && (
                          <p >User with email '<i>{resData.userMassage}</i>' won a massage!</p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p>Email: <b>{resData.email}</b></p>
                          <p>Token: <b>{resData.token}</b></p>
                        </div>
                      )
                    }
                  </Modal.Body>
                </Modal>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}
