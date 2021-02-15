import React, { useEffect, useState } from "react";
import {MDBContainer, MDBRow} from "mdbreact";
import {TreeSelect} from "antd";
import { DatePicker, Space } from 'antd';
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
const { RangePicker } = DatePicker;
const weeks = [
    { value: 'week-1', label: 'Week 1' },
    { value: 'week-2', label: 'Week 2' },
    { value: 'week-3', label: 'Week 3' },
    { value: 'week-4', label: 'Week 4' },
]

const months = [
    { value: '01', label: 'January' }, { value: '02', label: 'February' },
    { value: '03', label: 'March' }, { value: '04', label: 'April' },{ value: '05', label: 'May' },
    { value: '06', label: 'June' }, { value: '07', label: 'July' },{ value: '08', label: 'August' },
    { value: '09', label: 'September' },{ value: '10', label: 'October' },{ value: '11', label: 'November' },
    { value: '12', label: 'December' },
]

const years = [
    { value: '2021', label: '2021' },
    { value: '2020', label: '2020' },
    { value: '2019', label: '2019' },
    { value: '2018', label: '2018' },
]

var moment = require("moment");

const MainForm = (props) => {

    const [showLoading, setShowLoading] = useState(false);
    const [orgUnits, setOrgUnits] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [searchValue, setSearchValue] = useState([]);
    const [instances, setInstances] = useState([]);
    const [selectedOrgUnit, setOrgUnit] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [selectedInstance, setSelectedInstance] = useState(null);
    const [events, setEvents] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [dates, setDates] = useState([]);
    const [hackValue, setHackValue] = useState();
    const [value, setValue] = useState();
    const disabledDate = current => {
        if (!dates || dates.length === 0) {
            return false;
        }
        const tooLate = dates[0] && current.diff(dates[0], 'days') > 7;
        const tooEarly = dates[1] && dates[1].diff(current, 'days') > 7;
        return tooEarly || tooLate;
    };

    const onOpenChange = open => {
        if (open) {
            setHackValue([]);
            setDates([]);
        } else {
            setHackValue(undefined);
        }
    };

    const handleDateChange = (selectedValue) => {
        setValue(selectedValue);
        const valueOfInput1 = selectedValue[0].format().split("+");
        const valueOfInput2 = selectedValue[1].format().split("+");

        setStartDate(valueOfInput1[0])
        setEndDate(valueOfInput2[0])
    }

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
        /*
        var id = "edb4aTWzQaZ"
        getInstance().then((d2) => {
            const endpoint = `trackedEntityInstances.json?paging=false&ou=${id}`
            d2.Api.getApi().get(endpoint)
                .then((response) => {
                    console.log(response.trackedEntityInstances)

                    const tempArray = []
                    response.trackedEntityInstances.map((item, index) => {
                        tempArray.push({"id" : item.trackedEntityInstance, "label" : item.trackedEntityInstance})
                    });
                    setInstances(tempArray);
                })
                .catch((error) => {
                    console.log("error: " + error);
            })
        });
         */
    };

    const handleProgram = selectedOption => {
        setSelectedProgram(selectedOption);
    };
    const handleWeek = selectedOption => {
        setSelectedWeek(selectedOption);
    };

    const handleMonth = selectedOption => {
        setSelectedMonth(selectedOption);
        console.log(selectedOption)
    };

    const handleYear = selectedOption => {
        setSelectedYear(selectedOption);
    }

    const test = () => {
        console.log(startDate);

    }

    const handleLoadEvents = () => {

        console.log(selectedOrgUnit);
        console.log(selectedWeek.value);
        console.log(selectedProgram);
        console.log(selectedMonth);

        var week = selectedWeek.value;
        var month = selectedMonth[0].value;
        var progID = selectedProgram.id;
        var orgID = selectedOrgUnit[0].id;
        //var trackedID = selectedInstance[0].id;
        console.log(week, month, progID, orgID);

        var id = "edb4aTWzQaZ"
        getInstance().then((d2) => {
            const endpoint = `events.json?orgUnit=${id}&program=${progID}`
            d2.Api.getApi().get(endpoint)
                .then((response) => {
                    console.log(response.events);
                    setEvents(response.events);
                    response.events.map((item) => {
                        var day = moment(item.eventDate);
                        console.log(day.month(), day.date());
                        console.log(day)
                    })

                })
                .catch((err) => {
                    console.log(err);
                })
        });
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
                                                <strong>Select Start & End Date</strong>
                                            </label>
                                            <Space direction="vertical" size={12}>
                                                <RangePicker
                                                    className="mt-2"
                                                    style={{ width: '100%' }}
                                                    value={hackValue || value}
                                                    disabledDate={disabledDate}
                                                    size="large"
                                                    onCalendarChange={val => setDates(val)}
                                                    onChange={handleDateChange}
                                                    onOpenChange={onOpenChange}
                                                />
                                            </Space>

                                        </div>
                                    </MDBCol>
                                </MDBRow>

                                <MDBRow className="mt-4">

                                </MDBRow>

                            </MDBContainer>

                            <div className="text-center py-4 mt-2">
                                <MDBBtn color="cyan" className="text-white" onClick={test}>
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