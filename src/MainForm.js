import React from "react";
import {MDBContainer, MDBRow, MDBIcon} from "mdbreact";
import { MDBDropdown, MDBDropdownToggle, MDBDropdownMenu, MDBDropdownItem } from "mdbreact";
import {
    MDBBox,
    MDBBtn,
    MDBCard,
    MDBCardBody,
    MDBCardHeader,
    MDBCardText,
    MDBCardTitle,
    MDBCol
} from "mdbreact";
import { Menu, Dropdown, Button, message, Space, Tooltip } from 'antd';
import { DownOutlined, UserOutlined } from '@ant-design/icons';



const MainForm = () => {

    const [showLoading, setShowLoading] = React.useState(false);


    return (
        <div>
            <MDBBox display="flex" justifyContent="center" >
                <MDBCol className="mb-5" md="10">
                    <MDBCard display="flex" justifyContent="center" className="text-xl-center w-100">
                        <MDBCardBody>
                            <MDBCardTitle >
                                <strong>Tracker Events Capture</strong>
                            </MDBCardTitle>

                            <MDBCardText>
                                <strong>Select Event Details</strong>
                            </MDBCardText>
                            <hr/>

                            <MDBContainer className="pl-5 mt-3">
                                <MDBRow>
                                    <MDBCol md="4">
                                        <div className="text-left my-3">
                                            <label className="grey-text ml-2">
                                                <strong>Select Event Program</strong>
                                            </label>
                                            <MDBDropdown className=" myDropDown">
                                                <MDBDropdownToggle caret color="primary">
                                                    <input className="form-control myDropDown"
                                                           type="text"
                                                           placeholder="search available reports"
                                                           aria-label="Search" />
                                                </MDBDropdownToggle>
                                                <MDBDropdownMenu className="dropdown-menu myDrop"  basic >
                                                    <MDBDropdownItem >
                                                        something
                                                    </MDBDropdownItem>
                                                </MDBDropdownMenu>
                                            </MDBDropdown>
                                        </div>
                                    </MDBCol>

                                    <MDBCol md="4">
                                        <div className="text-left my-3">
                                            <label className="grey-text ml-2">
                                                <strong>Select Month</strong>
                                            </label>
                                            <MDBDropdown className=" myDropDown">
                                                <MDBDropdownToggle caret color="primary">
                                                    <input className="form-control myDropDown"
                                                           type="text"
                                                           placeholder="search available reports"
                                                           aria-label="Search" />
                                                </MDBDropdownToggle>
                                                <MDBDropdownMenu className="dropdown-menu myDrop"  basic >
                                                    <MDBDropdownItem >
                                                        something
                                                    </MDBDropdownItem>
                                                </MDBDropdownMenu>
                                            </MDBDropdown>
                                        </div>
                                    </MDBCol>
                                    <MDBCol md="4">
                                        <div className="text-left my-3">
                                            <label className="grey-text ml-2">
                                                <strong>Select Something else</strong>
                                            </label>
                                            <MDBDropdown className=" myDropDown">
                                                <MDBDropdownToggle caret color="primary">
                                                    <input className="form-control myDropDown"
                                                           type="text"
                                                           placeholder="search available reports"
                                                           aria-label="Search" />
                                                </MDBDropdownToggle>
                                                <MDBDropdownMenu className="dropdown-menu myDrop"  basic >
                                                    <MDBDropdownItem >
                                                        something
                                                    </MDBDropdownItem>
                                                </MDBDropdownMenu>
                                            </MDBDropdown>
                                        </div>
                                    </MDBCol>
                                </MDBRow>

                            </MDBContainer>

                            <div className="text-center py-4 mt-2">
                                <MDBBtn color="cyan" className="text-white">
                                    Show Events {showLoading ? <div className="spinner-border mx-2 text-white spinner-border-sm" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div> : null}
                                </MDBBtn>
                            </div>

                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBBox>

        </div>
    )
}

export default MainForm;