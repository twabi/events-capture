import React, { useEffect, useState } from "react";
import {MDBCardFooter, MDBContainer, MDBRow, MDBTable, MDBTableBody, MDBTableHead} from "mdbreact";
import {TreeSelect,DatePicker, Space } from "antd";
import {
    MDBBox,
    MDBBtn,
    MDBCard, MDBCardHeader,
    MDBCardBody,
    MDBCardText,
    MDBCardTitle,
    MDBCol
} from "mdbreact";
import Select from "react-select";
import NavBar from "./NavBar";
import {getInstance} from "d2";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "jspdf-autotable";
import {TableExport} from "tableexport";

const { RangePicker } = DatePicker;
const weeks = [
    { value: 'week-1', label: 'Week 1' },
    { value: 'week-2', label: 'Week 2' },
    { value: 'week-3', label: 'Week 3' },
    { value: 'week-4', label: 'Week 4' },
]

var moment = require("moment");

const MainForm = (props) => {

    const [showLoading, setShowLoading] = useState(false);
    const [showEvents, setShowEvents] = useState(false);
    const [orgUnits, setOrgUnits] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [searchValue, setSearchValue] = useState([]);
    const [selectedOrgUnit, setOrgUnit] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [events, setEvents] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showMenu, setShowMenu] = useState(true);
    const [showPrintLoading, setShowPrintLoading] = useState(false);
    const [showCSVLoading, setShowCSV] = useState(false);

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
    };

    const handleProgram = selectedOption => {
        setSelectedProgram(selectedOption);
    };

    const test = () => {
        console.log(startDate);
        var another = "2021-02-12T19:32:18";
        var date = moment(another);
        var start = moment(startDate);
        var end = moment(endDate);
        console.log(date.isBetween(start, end));
    }

    const handleLoadEvents = () => {

        console.log(selectedOrgUnit);
        console.log(selectedProgram);

        setShowLoading(true);
        var start = moment(startDate);
        var end = moment(endDate);
        var progID = selectedProgram.id;
        var orgID = selectedOrgUnit[0].id;
        //var trackedID = selectedInstance[0].id;
        console.log( progID, orgID);

        //var id = "edb4aTWzQaZ";
        var id = "kNaWeQScFWJ";
        getInstance().then((d2) => {
            const endpoint = `events.json?orgUnit=${id}&program=${progID}`
            d2.Api.getApi().get(endpoint)
                .then((response) => {

                    var tempArray = []
                    response.events.map((item) => {
                        var date = moment(item.eventDate);
                        console.log(item)
                        console.log(date.month(), date.date());
                        //console.log(day)
                        if(date.isBetween(start, end)){
                            tempArray.push(item);
                        }
                    });

                    setEvents(tempArray);
                    console.log(tempArray);

                }).then(() => {
                    setShowMenu(false);
                    setShowEvents(true);
                    setShowLoading(false);
            })
                .catch((err) => {
                    console.log(err);
                })
        });
    };

    const handleBackButton = () => {
        setShowMenu(true);
        setShowEvents(false);
    }

    const exportCSV = (title) => {
        setShowCSV(true);
        var table = TableExport(document.getElementById("tableDiv"), {
            filename: title,
            exportButtons: false,
            sheetname: title,
        });
        /* convert export data to a file for download */
        var exportData = table.getExportData();
        console.log(exportData)

        var csvData = exportData.tableDiv.csv; // Replace with the kind of file you want from the exportData
        table.export2file(csvData.data, csvData.mimeType, csvData.filename, csvData.fileExtension, csvData.merges, csvData.RTL, csvData.sheetname);
        setShowCSV(false);
    }

    //the functions that prints the table to pdf format
    const exportPDF = (title) => {
        setShowPrintLoading(true);
        const input = document.getElementById('tableDiv');
        html2canvas(input)
            .then((canvas) => {
                const pdf = new jsPDF();
                pdf.setFontSize(25);
                pdf.autoTable({startY: 20, html: '#tableDiv'});
                pdf.text(title, 50, 15);
                pdf.save(title + ".pdf");
            }).then(() => {
            setShowPrintLoading(false);
        });
    }

    const EventsTable = (eventsArray) => {
        if(eventsArray !== null && eventsArray.length !== 0){
            return (
                <div>
                    <MDBBox  display="flex" justifyContent="center" className="mt-2" >
                        <MDBCol className="mb-5" md="11">
                            <MDBCard  className="ml-4">
                                <MDBCardHeader tag="h5" className="text-center font-weight-bold text-uppercase py-4">
                                    Events for said program
                                </MDBCardHeader>

                                <MDBCardBody  >
                                    <MDBTable id="tableDiv" striped bordered responsive className="border-dark border">
                                        <MDBTableHead color="primary-color" textWhite>
                                            <tr>
                                                <th>Org Unit</th>
                                                <th>Month</th>
                                                <th>Week</th>
                                                <th>Tracked-Instance</th>
                                                <th>Stored By</th>
                                            </tr>
                                        </MDBTableHead>
                                        <MDBTableBody>
                                            {eventsArray.map((eventItem, index) => (
                                                <tr key={index}>
                                                    { index==0 && <td rowSpan={eventsArray.length}>{eventItem.orgUnitName}</td>}
                                                    <td>{moment(moment(eventItem.eventDate).month(), 'MM').format('MMMM')}</td>
                                                    <td>{Math.ceil(moment(eventItem.eventDate).date() / 7)}</td>
                                                    <td>{eventItem.trackedEntityInstance}</td>
                                                    <td>{eventItem.storedBy}</td>
                                                </tr>
                                            ))}

                                        </MDBTableBody>
                                    </MDBTable>
                                </MDBCardBody>
                                <MDBCardFooter className="d-flex justify-content-center ">
                                    <MDBBtn color="cyan" className="text-white" onClick={()=>{exportPDF("Events Table")}}>
                                        Print PDF {showPrintLoading ? <div className="spinner-border mx-4 text-white spinner-border-sm" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div> : null}
                                    </MDBBtn>
                                    <MDBBtn color="cyan" className="text-white" onClick={()=>{exportCSV("Events Table")}}>
                                        Print CSV {showCSVLoading ? <div className="spinner-border mx-4 text-white spinner-border-sm" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div> : null}
                                    </MDBBtn>
                                </MDBCardFooter>
                            </MDBCard>
                        </MDBCol>
                    </MDBBox>

                </div>
            );
    }
    }


    return (
        <div>
            <NavBar/>
            {showMenu ?
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
                                <MDBBtn color="cyan" className="text-white" onClick={handleLoadEvents}>
                                    Show Events {showLoading ? <div className="spinner-border mx-2 text-white spinner-border-sm" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div> : null}
                                </MDBBtn>
                            </div>

                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBBox>: null}
            { showEvents ?
                <MDBContainer>
                    <MDBRow>
                        <MDBCol>
                            <MDBBtn color="cyan"
                                    onClick={handleBackButton}
                                    className="text-white float-lg-left mr-2" type="submit">
                                Back
                            </MDBBtn>
                        </MDBCol>
                    </MDBRow>
                    <MDBRow>
                        <MDBCol>
                            {EventsTable(events)}
                        </MDBCol>
                    </MDBRow>
                </MDBContainer>
                 : null }
        </div>
    )
}

export default MainForm;