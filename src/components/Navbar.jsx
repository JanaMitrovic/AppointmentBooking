import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { GiHamburgerMenu } from "react-icons/gi";
import { BsFillBookmarkPlusFill, BsFillBookmarkStarFill, BsFillBookmarkXFill, BsInfoSquare } from "react-icons/bs"
import { Form, Link, useNavigate } from 'react-router-dom';
import "../styles/sidebar.css"

function Navbar() {

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const sidebarItems = [
        {
            name: 'Update Appointment',
            icon: <BsFillBookmarkStarFill/>,
            to: '/auth',
            update: true
        },
        {
            name: 'Delete Appointment',
            icon: <BsFillBookmarkXFill/>,
            to: '/auth',
            update: false
        },
        {
            name: 'Info',
            icon: <BsInfoSquare/>,
            to: '/'
        },
    ]

    const navigate = new useNavigate();

    const handleSidebarItemClick = (item) => {
        if(item.name === 'Info'){
            navigate(item.to);
        }else{
            navigate(item.to, {state: {update: item.update}});
        }
        handleClose();
    };

    return (
        <nav className="navbar navbar-custom">
            <div className="container-fluid">
                <a className="navbar-brand" href="/">Beauty salon "Trač"</a>

                <Button variant="outline-light" onClick={handleShow}>
                    <GiHamburgerMenu size={25}/>
                </Button>

                <Offcanvas show={show} onHide={handleClose} placement='end'>
                    <Offcanvas.Header closeButton>
                    <Offcanvas.Title style={{fontSize:"25px", color: "#060930"}}>Appointments</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>

                    {sidebarItems.map((item, index) => (
                    <div
                        key={index}
                        className={`item`}
                        onClick={() => handleSidebarItemClick(item)}
                        style={{ cursor: 'pointer', textDecoration: 'none', color: '#060930' }}
                    >
                        <div className="icon">{item.icon}</div>
                        <div>{item.name}</div>
                    </div>
                    ))}
                    </Offcanvas.Body>
                </Offcanvas>
            </div>
        </nav>


    )
}

export default Navbar