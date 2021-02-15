import React, { useEffect, useState } from "react";
import {MDBContainer, MDBRow} from "mdbreact";
import {TreeSelect} from "antd";
import {
    MDBBox,
    MDBBtn,
    MDBCard,
    MDBCardBody,
    MDBCardText,
    MDBCardTitle,
    MDBCol
} from "mdbreact";
import Select from 'react-select'
import makeAnimated from 'react-select/animated';
import NavBar from "./NavBar";
import {getInstance} from "d2";


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

const months = [
    { value: '01', label: 'January' }, { value: '02', label: 'February' },
    { value: '03', label: 'March' }, { value: '04', label: 'April' },{ value: '05', label: 'May' },
    { value: '06', label: 'June' }, { value: '07', label: 'July' },{ value: '08', label: 'August' },
    { value: '09', label: 'September' },{ value: '10', label: 'October' },{ value: '11', label: 'November' },
    { value: '12', label: 'December' },
]


const MainForm = (props) => {

    const [showLoading, setShowLoading] = useState(false);
    const [orgUnits, setOrgUnits] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [searchValue, setSearchValue] = useState([]);
    const [instances, setInstances] = useState([]);
    const [selectedOrgUnit, setOrgUnit] = useState([]);
    const [selectedOption, setSelected] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [selectedWeek, setSelectedWeek] = React.useState(null);
    const [selectedInstance, setSelectedInstance] = useState(null);

    useEffect(() => {
       setOrgUnits(props.organizationalUnits);
       setPrograms(props.programs);
    },[props.organizationalUnits, props.programs]);


    const handle = (value, label, extra) => {
        setSearchValue(value)
    };

    const onSelect = (value, node) => {
        setOrgUnit(selectedOrgUnit => [...selectedOrgUnit, node]);
        console.log(node);
        var id = "edb4aTWzQaZ"
        getInstance().then((d2) => {
            const endpoint = `trackedEntityInstances.json?paging=false&ou=${id}`
            d2.Api.getApi().get(endpoint)
                .then((response) => {
                    console.log(response.trackedEntityInstances)
                    //setInstances(response.trackedEntityInstances);

                    const tempArray = []
                    response.trackedEntityInstances.map((item, index) => {
                        tempArray.push({"id" : item.id, "label" : item.displayName})
                    });
                    setInstances(tempArray);
                }).catch((error) => {
                    console.log("error: " + error);
            })
        });
    };

    const handleChange = selectedOption => {
        setSelected(selectedOption)
        console.log(`Option selected:`, selectedOption);
    };

    const handleProgram = selectedOption => {
        setSelectedProgram(selectedOption)
    };
    const handleWeek = selectedOption => {
        setSelectedWeek(selectedOption)
    };

    const handleMonth = selectedOption => {
        setSelectedMonth(selectedOption)
    };

    const handleInstaces = selectedOption =>{
        setSelectedInstance(selectedOption)
    }



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

                            {programs.length == 0 ? <div className="spinner-border mx-2 indigo-text spinner-border-sm" role="status">
                                <span className="sr-only">Loading...</span>
                            </div> : null}

                            <hr/>

                            <MDBContainer className="pl-5 mt-3">
                                <MDBRow>
                                    <MDBCol md="4">
                                        <div className="text-left my-3">
                                            <label className="grey-text ml-2">
                                                <strong>Select Program</strong>
                                            </label>
                                            <Select
                                                className="mt-2"
                                                onChange={handleProgram}
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
                                                onChange={handleMonth}
                                                options={months}
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
                                                onChange={handleWeek}
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
                                                <strong>Select Tracked Entity Instances of the Org Unit</strong>
                                            </label>
                                            <Select
                                                className="mt-2"
                                                isMulti
                                                closeMenuOnSelect={false}
                                                components={animatedComponents}
                                                options={instances}
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