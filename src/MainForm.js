import React, { useEffect, useState } from "react";
import {MDBAlert, MDBCardFooter, MDBContainer, MDBIcon, MDBRow, MDBTable, MDBTableBody, MDBTableHead} from "mdbreact";
import {TreeSelect,DatePicker, Space } from "antd";
import { Redirect } from "react-router";
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
import {Link} from "react-router-dom";
import _ from "underscore";

const { RangePicker } = DatePicker;

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
    const [headerNames, setHeaderNames] = useState([]);

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

        console.log(selectedOption);

        getInstance().then((d2) => {
            const endpoint = `programs/${selectedOption.id}.json?fields=id,name,trackedEntityType[id,name]`;
            d2.Api.getApi().get(endpoint)
                .then((response) => {
                    console.log(response.trackedEntityType.name);
                    selectedOption.entityTypeName = response.trackedEntityType.name;
                    setSelectedProgram(selectedOption);
                })
                .catch((error) => {
                    console.log("An error occurred: " + error);
                    alert("An error occurred: " + error);
                });
        });

    };

    const test = () => {
       //setRedirect(true);
        return <Redirect
            to={{
                pathname: "/EventsTable",
                state: { events: events }
            }}
        />;
    }

    const functionWithPromise = eventItem => { //a function that returns a promise
        var tempArray = [];
        //var dataOver = {"orgUnitName" : eventItem.orgUnitName, "eventDate" : eventItem.eventDate, "dataValues" :[]};
        getInstance().then((d2) => {
            eventItem.dataValues.map((dataValue) => {
            const endpoint = `dataElements/${dataValue.dataElement}.json`;
            d2.Api.getApi().get(endpoint)
                .then((response) => {
                    //console.log(dataValue);
                    //console.log(dataValue.dataElement);
                    var data = {"id" : response.id, "name" : response.displayFormName,
                        "trackedInstance" : eventItem.trackedEntityInstance};
                    dataValue.displayName = response.displayFormName;

                    tempArray.push(data);
                    setHeaderNames(headerName => [...headerName, data]);
                })
                .catch((error) => {
                    console.log("An error occurred: " + error);
                    alert("An error occurred: " + error);
                });
            });

            //dataOver.dataValues = tempArray;
            //setHeaderNames(headerName => [...headerName, dataOver]);
        });


        return eventItem;
    }

    const anAsyncFunction = async item => {
        return functionWithPromise(item)
    }

    const getData = async (list) => {
        return await Promise.all(list.map(item => anAsyncFunction(item)))
    }

    function iterate(item, index, array) {
        //console.log(item);
        //console.log(array[index+1])
        if (index !== array.length-1) {
            console.log(item.dataValues.length)
            console.log(array[index+1].dataValues.length)
            if(item.dataValues.length !== 0 || array[index+1].dataValues.length !== 0){
                if(array[index+1].dataValues.length < item.dataValues.length){
                    console.log("the next element is smaller");

                    var tempArray1 = [];
                    var tempArray2 = []
                    array[index+1].dataValues.map((arrayItem) => {
                        if (item.dataValues.some(e => e.dataElement === arrayItem.dataElement)) {
                            /* vendors contains the element we're looking for */
                            console.log("these are similar");
                        } else {

                            item.dataValues.map((dataItem) => {
                                var found = array[index+1].dataValues.some(function(value) {
                                    return value.dataElement === dataItem.dataElement;
                                });
                                console.log(found);
                                if(!found){
                                    array[index+1].dataValues.push(
                                        {"created": dataItem.created, "dataElement": dataItem.dataElement,
                                            "displayName": dataItem.displayName, "lastUpdated": dataItem.lastUpdated,
                                            "providedElsewhere": false, "storedBy": dataItem.storedBy, "value": "-"}
                                    );
                                }
                            });

                            item.dataValues.push(
                                {"created": arrayItem.created, "dataElement": arrayItem.dataElement,
                                    "displayName": arrayItem.displayName, "lastUpdated": arrayItem.lastUpdated,
                                    "providedElsewhere": false, "storedBy": arrayItem.storedBy, "value": "-"}
                            )
                        }
                    });

                    //console.log(tempArray2);
                    //console.log(tempArray1);
                    //item.dataValues.push(tempArray2);
                    //item.dataValues.concat(tempArray2);
                    //array[index+1].dataValues.sort((a, b) => a.displayName.localeCompare(b.displayName));
                    //item.dataValues.sort((a, b) => a.displayName.localeCompare(b.displayName));


                }
            }
        }
    }

    const handleLoadEvents = () => {

        //console.log(selectedOrgUnit);
        //console.log(selectedProgram);

        setShowLoading(true);
        var start = moment(startDate);
        var end = moment(endDate);
        var progID = selectedProgram.id;
        var orgID = selectedOrgUnit[0].id;
        //var trackedID = selectedInstance[0].id;
        //console.log( progID, orgID);

        //var id = "edb4aTWzQaZ";
        //var id = "C3RoODpOTz5";
        var id = "LE5Y1Da1Fk4";
        //var id = "l6CHbqiwSfR";

        getInstance().then((d2) => {
            const endpoint = `events.json?orgUnit=${id}&program=${progID}`;
            var tempArray = []
            d2.Api.getApi().get(endpoint)
                .then((response) => {

                    response.events.map((item) => {
                        var date = moment(item.eventDate);
                        //console.log(item)
                        //console.log(date.month(), date.date());
                        //console.log(day)
                        if(date.isBetween(start, end)){
                            tempArray.push(item);
                        }
                    });

                    tempArray.forEach(iterate);

                    //setEvents(tempArray);
                    //console.log(tempArray);

            })
                .catch((err) => {
                    console.log("An error occurred: " + err);
                    alert("An error occurred: " + err);
                    setShowLoading(false);
                })
                .finally(() => {
                    //console.log(tempArray);

                    if(tempArray != null){

                         getData(tempArray)
                            .then((data) => {
                                console.log(data);
                                //setHeaderNames(data);

                                //console.log(data.forEach(((v,i,a) => a.findIndex(t=>(t.dataValues === v.dataValues))===i)));
                                //console.log(data);
                                //data.forEach(iterate);

                                var sampleArray = [];
                                var valueData = {"values" : []}
                                data.map((dataItem) => {
                                    dataItem.dataValues.map((item) =>{
                                        var actualValue = {"eventID" : dataItem.event, "id" : item.dataElement, "value" : item.value}
                                        sampleArray.push(actualValue);
                                    })
                                })

                                console.log(sampleArray);

                                console.log(data);
                                tempArray = data
                                setEvents(data);
                        }).finally(() => {

                            //console.log(headerNames);
                            setShowMenu(false);
                            setShowEvents(true);
                            setShowLoading(false);

                        });
                    } else {
                        alert("events are null! Try again!");
                        setShowLoading(false);
                    }

                });
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
        console.log(exportData);

        var csvData = exportData.tableDiv.csv; // Replace with the kind of file you want from the exportData
        table.export2file(csvData.data, csvData.mimeType, csvData.filename, csvData.fileExtension, csvData.merges, csvData.RTL, csvData.sheetname);
        setShowCSV(false);
    }

    //the functions that prints the table to pdf format
    const exportPDF = (title) => {
        setShowPrintLoading(true);
        const input = document.getElementById('tableDiv');
        const unit = "pt";
        const size = "A4";
        const orientation = "portrait";
        html2canvas(input)
            .then((canvas) => {
                const pdf = new jsPDF(orientation, unit, size);
                pdf.setFontSize(25);
                pdf.autoTable({startY: 20, html: '#tableDiv'});
                pdf.text(title, 50, 15);
                pdf.save(title + ".pdf");
            }).then(() => {
            setShowPrintLoading(false);
        });
    }

    const EventsTable = (eventsArray) => {
        var analyzed = headerNames.slice().filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);
        //console.log(analyzed);
        //console.log(eventsArray);

        if((eventsArray !== null && eventsArray.length !== 0) && analyzed.length !== null){

            return (
                <div>
                    <MDBBox  display="flex" justifyContent="center" className="mt-2" >
                        <MDBCol className="mb-5" md="12">
                            <MDBCard  className="ml-4">
                                <MDBCardHeader tag="h5" className="text-center font-weight-bold text-uppercase py-4">
                                    {selectedProgram.label}
                                </MDBCardHeader>

                                <MDBCardBody  >
                                    <MDBTable id="tableDiv" striped bordered responsive className="border-dark border">
                                        <MDBTableHead color="primary-color" textWhite>
                                            <tr>
                                                <th rowSpan="2" className="text-center text-uppercase"><b>Org Unit</b></th>
                                                <th rowSpan="2" className="text-center text-uppercase"><b>Month</b></th>
                                                <th rowSpan="2" className="text-center text-uppercase"><b>Week</b></th>
                                                <th rowSpan="2" className="text-center text-uppercase"><b>{selectedProgram.entityTypeName}</b></th>

                                            </tr>
                                            <tr>

                                                {analyzed.map((value, index) => (
                                                    <th key={index+1} className="text-center" id={value.id}>{value.name}</th>
                                                ))}

                                            </tr>
                                        </MDBTableHead>
                                        <MDBTableBody>
                                            {eventsArray.map((eventItem, index) => (
                                                <tr key={index}>
                                                    { index==0 && <td rowSpan={eventsArray.length}>{eventItem.orgUnitName}</td>}
                                                    <td>{moment(moment(eventItem.eventDate).year(), 'YYYY').format('YYYY') +", "+moment(moment(eventItem.eventDate).month() + 1, 'MM').format('MMMM')}</td>
                                                    <td>{Math.ceil(moment(eventItem.eventDate).date() / 7)}</td>
                                                    <td>{eventItem.trackedEntityInstance}</td>


                                                    {eventItem.dataValues.map((valueItem, num) => (
                                                                <td key={num}>{valueItem.dataElement ? valueItem.value : "-"}</td>
                                                            )
                                                        )}
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
        else {
            return (
                <MDBContainer>
                    <MDBAlert color="danger" className="text-center mt-5" >
                        <p className="font-weight-bold">The Table has no data!</p>
                        <hr/>
                        <p className="font-italic">Go back and chose either a program, org unit or date that has data.</p>
                    </MDBAlert>
                </MDBContainer>
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
                <div className="overflow-hidden">
                    <MDBRow>
                        <MDBCol>
                            <MDBBtn color="cyan"
                                    onClick={handleBackButton}
                                    className="text-white float-lg-left mr-2" type="submit">
                                <MDBIcon icon="angle-double-left mr-2" /> Back
                            </MDBBtn>
                        </MDBCol>
                    </MDBRow>
                    <MDBRow>
                        <MDBCol>
                            {EventsTable(events)}
                        </MDBCol>
                    </MDBRow>
                </div>
                 : null }
        </div>
    )
}

export default MainForm;