import React, { useEffect, useState } from "react";
import {MDBContainer, MDBRow, MDBIcon} from "mdbreact";
import { MDBDropdown, MDBDropdownToggle, MDBDropdownMenu, MDBDropdownItem } from "mdbreact";
import {DatePicker, TreeSelect} from "antd";
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
import Select from 'react-select'
import makeAnimated from 'react-select/animated';
import NavBar from "./NavBar";


const animatedComponents = makeAnimated();
const options = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' }
]

const weeks = [
    { value: 'week 1', label: 'Week 1' },
    { value: 'week 2', label: 'Week 2' },
    { value: 'week 3', label: 'Week 3' },
    { value: 'week 4', label: 'Week 4' },
]


const MainForm = (props) => {

    const [showLoading, setShowLoading] = useState(false);
    const [orgUnits, setOrgUnits] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [searchValue, setSearchValue] = useState([]);
    const [variable, setVariable] = useState([]);
    const [selectedOption, setSelected] = useState(null);

    useEffect(() => {
       setOrgUnits(props.organizationalUnits);
       setPrograms(props.programs);
    });

    const handle = (value, label, extra) => {
        setSearchValue(value)
    };

    const onSelect = (value, node) => {
        setVariable(variable => [...variable, node]);
    };

    const handleChange = selectedOption => {
        setSelected(selectedOption)
        console.log(`Option selected:`, selectedOption);
    };


    return (
        <div>
            <NavBar/>
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
                                                <strong>Select Tracker Program</strong>
                                            </label>
                                            <Select
                                                className="mt-2"
                                                onChange={handleChange}
                                                options={programs}
                                            />
                                        </div>
                                    </MDBCol>

                                    <MDBCol md="4">
                                        <div className="text-left my-3">
                                            <label className="grey-text ml-2">
                                                <strong>Select Month</strong>
                                            </label>
                                            <Select
                                                className="mt-2"
                                                isMulti
                                                components={animatedComponents}
                                                onChange={handleChange}
                                                options={weeks}
                                            />
                                        </div>
                                    </MDBCol>
                                    <MDBCol md="4">
                                        <div className="text-left my-3">
                                            <label className="grey-text ml-2">
                                                <strong>Select Preferred Weeks</strong>
                                            </label>
                                            <Select
                                                className="mt-2"
                                                components={animatedComponents}
                                                onChange={handleChange}
                                                options={weeks}
                                            />
                                        </div>
                                    </MDBCol>
                                </MDBRow>

                                <MDBRow className="mt-4">
                                    <MDBCol md="4">

                                        <div className="text-left my-3">
                                            <label className="grey-text ml-2">
                                                <strong>Select Organization Unit</strong>
                                            </label>

                                            <TreeSelect
                                                style={{ width: '100%' }}
                                                value={searchValue}
                                                className="mt-2"
                                                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                                treeData={orgUnits}
                                                allowClear
                                                size="large"
                                                multiple
                                                placeholder="Please select organizational unit"
                                                onChange={handle}
                                                onSelect={onSelect}
                                            />

                                        </div>
                                    </MDBCol>
                                    <MDBCol md="4">
                                        <div className="text-left my-3">
                                            <label className="grey-text ml-2">
                                                <strong>Select Market Commodity</strong>
                                            </label>
                                            <Select
                                                className="mt-2"
                                                isMulti
                                                closeMenuOnSelect={false}
                                                components={animatedComponents}
                                                options={options}
                                            />
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