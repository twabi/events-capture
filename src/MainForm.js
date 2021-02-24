import React, { useEffect, useState } from "react";
import "mdbreact/dist/css/mdb.css";
import {
    MDBAlert,
    MDBCardFooter,
    MDBContainer,
    MDBDataTableV5,
    MDBIcon,
    MDBRow,
} from "mdbreact";
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
import * as htmlToImage from 'html-to-image';


const { RangePicker } = DatePicker;

var moment = require("moment");

const MainForm = (props) => {

    const [showLoading, setShowLoading] = useState(false);
    const [showEvents, setShowEvents] = useState(false);
    const [orgUnits, setOrgUnits] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [searchValue, setSearchValue] = useState([]);
    const [selectedOrgUnit, setOrgUnit] = useState(undefined);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [events, setEvents] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showMenu, setShowMenu] = useState(true);
    const [showPrintLoading, setShowPrintLoading] = useState(false);
    const [headerNames, setHeaderNames] = useState([]);
    const [dataTable, setDataTable] = useState({
        columns : [
            {
                label: 'Org Unit',
                field: 'orgUnit',
                attributes: {
                    'aria-controls': 'DataTable',
                    'aria-label': 'Org Unit',
                },
            },
            {
                label: 'Month',
                field: 'month',
            },
            {
                label: 'Week',
                field: 'week',
            },
        ],
        rows : [],
    });
    const [dates, setDates] = useState([]);
    const [hackValue, setHackValue] = useState();
    const [value, setValue] = useState();
    const [inputs, setInputs] = useState([]);

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

        var analyzed = headerNames.slice().filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);
        if(analyzed.length !== null
            && dataTable.rows.length !== 0 && inputs.length !== 0){
            dataTable.columns.map((arrayItem) => {
                analyzed.map((item) => {
                    if (item.id === arrayItem.field) {
                        //console.log("equal");
                        arrayItem.label = item.name;
                    }
                })
            });
            try{
                dataTable.rows.map((row, index) => {
                    if(row.event === inputs[index].event){
                        row[row.instanceTitle] = inputs[index].name;
                    }

                });
            } catch (e) {
                //alert(e)
            }
        }
    },[headerNames, inputs, props.organizationalUnits, props.programs]);


    const handle = (value, label, extra) => {
        setSearchValue(value)
        console.log(value);
    };

    const onSelect = (value, node) => {
        //setOrgUnit(selectedOrgUnit => [...selectedOrgUnit, node]);
        setOrgUnit(node);
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
        htmlToImage.toPng(document.getElementById('tableDiv'), { quality: 0.95 })
            .then(function (dataUrl) {
                var link = document.createElement('a');
                link.download = 'my-image-name.jpeg';
                const pdf = new jsPDF();
                const imgProps= pdf.getImageProperties(dataUrl);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                pdf.addImage(dataUrl, 'PNG', 0, 0,pdfWidth, pdfHeight);
                pdf.save("download.pdf");
            });
    }

    const functionWithPromise = eventItem => { //a function that returns a promise
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


    const functionTracked = async (array) => { //a function that returns a promise
        await Promise.all(array.map((eventItem) => {
            getInstance().then((d2) => {
                const entityPoint = `trackedEntityInstances/${eventItem.trackedEntityInstance}.json?program=${eventItem.program}&fields=attributes[value]`
                d2.Api.getApi().get(entityPoint).then((response) => {
                    console.log(response);
                    eventItem.instanceName = response.attributes[0].value;
                    var data = {"event" : eventItem.event, "name" : response.attributes[0].value}
                    setInputs(inputs => [...inputs, data]);
                }).catch((error) => {
                    console.log("An error occurred: " + error);
                    alert("An error occurred: " + error);
                })
            })
        }));

        return array;
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
                }
            }
        }
    }

    const  handleLoadEvents = async () => {
        setShowLoading(true);
        var start = moment(startDate);
        var end = moment(endDate);
        var progID = selectedProgram.id;
        var orgID = selectedOrgUnit.id;

        //var id = "edb4aTWzQaZ";
        //var id = "C3RoODpOTz5";
        //var id = "LE5Y1Da1Fk4";
        //var id = "l6CHbqiwSfR";

        getInstance().then((d2) => {
            const endpoint = `events.json?orgUnit=${orgID}&program=${progID}`;
            var tempArray = []
            d2.Api.getApi().get(endpoint)
                .then((response) => {

                    response.events.map((item) => {
                        var date = moment(item.eventDate);
                        if(date.isBetween(start, end)){
                            tempArray.push(item);
                        }
                    });

                    functionTracked(tempArray).then((data) => {
                        console.log(data);
                        tempArray = data;
                        tempArray.forEach(iterate);
                    }).finally(() => {

                    });
            })
                .catch((err) => {
                    console.log("An error occurred: " + err);
                    alert("An error occurred: " + err);
                    setShowLoading(false);
                })
                .finally(() => {
                    if(tempArray != null){
                        dataTable.columns.push({
                            label: selectedProgram.entityTypeName,
                            field: selectedProgram.entityTypeName,
                        })

                         getData(tempArray)
                            .then((data) => {
                                console.log(data);
                                data && data[0].dataValues.map((item) => {
                                    var colData = {
                                        label: item.displayName,
                                        field: item.dataElement,
                                    }
                                    dataTable.columns.push(colData);
                                })

                                data.map((dataItem, index) => {
                                    var rowData = {
                                        orgUnit: dataItem.orgUnitName,
                                        month: moment(moment(dataItem.eventDate).year(), 'YYYY').format('YYYY') +", "+moment(moment(dataItem.eventDate).month() + 1, 'MM').format('MMMM'),
                                        week: Math.ceil(moment(dataItem.eventDate).date() / 7),
                                        event: dataItem.event,
                                        instanceTitle: selectedProgram.entityTypeName,
                                    }
                                    dataItem.dataValues.map((dataValue) => {

                                        rowData[dataValue.dataElement] = dataValue.value;
                                        rowData[selectedProgram.entityTypeName] = dataItem.instanceName;

                                    })
                                    dataTable.rows.push(rowData);
                                })

                                console.log(dataTable)
                                //setDataTable(tableData);

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

    const exportXL = (title) => {
        setShowPrintLoading(true);
        var table = TableExport(document.getElementById("tableDiv"), {
            filename: title,
            exportButtons: false,
            sheetname: title,
        });
        /* convert export data to a file for download */
        var exportData = table.getExportData();
        var xlsxData = exportData.tableDiv.xlsx; // Replace with the kind of file you want from the exportData

        dataTable.rows.map((row) => {
            var array2 = [];
            dataTable.columns.map((columnItem) => {
                var data = {v: row[columnItem.field], t : "s"}
                array2.push(data);
            })
            xlsxData.data.push(array2);
        });

        table.export2file(xlsxData.data, xlsxData.mimeType, xlsxData.filename, xlsxData.fileExtension, xlsxData.merges, xlsxData.RTL, xlsxData.sheetname);
        setShowPrintLoading(false);
    }


    const EventsTable = (eventsArray) => {
        var analyzed = headerNames.slice().filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);
        //console.log(inputs);

        if((eventsArray !== null && eventsArray.length !== 0) && analyzed.length !== null
            && dataTable.rows.length !== 0 && inputs.length !== 0){
            dataTable.columns.map((arrayItem) => {
                analyzed.map((item) => {
                    if (item.id === arrayItem.field) {
                        //console.log("equal");
                        arrayItem.label = item.name;
                    }
                })
            });
            try{
                dataTable.rows.map((row, index) => {
                    if(row.event === inputs[index].event){
                        row[row.instanceTitle] = inputs[index].name;
                    }

                });
            } catch (e) {
                //alert(e)
            }

            const widerData = {
                columns: [
                    ...dataTable.columns.map((col) => {
                        col.width = 150;
                        return col;
                    }),
                ],
                rows: [...dataTable.rows],
            };

            //console.log(dataTable)
            //console.log(dataTable.rows[0]);


            return (
                <div>
                    <MDBBox  display="flex" justifyContent="center" className="mt-2" >
                        <MDBCol className="mb-5" md="12">
                            <MDBCard  className="ml-4">
                                <MDBCardHeader tag="h5" className="text-center font-weight-bold text-uppercase py-4">
                                    {selectedProgram.label}
                                </MDBCardHeader>

                                <MDBCardBody  >
                                    <MDBDataTableV5
                                        id={"tableDiv"}
                                        striped
                                        className="text-center"
                                        theadColor={"primary-color"}
                                        theadTextWhite
                                        hover
                                        scrollX
                                        data={widerData}
                                    />
                                </MDBCardBody>
                                <MDBCardFooter className="d-flex justify-content-center ">
                                    <MDBBtn color="cyan" className="text-white" onClick={()=>{exportXL("Events Table")}}>
                                        Print Excel {showPrintLoading ? <div className="spinner-border mx-4 text-white spinner-border-sm" role="status">
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
                        <p className="font-italic">Go back and chose either a program, org unit or date range that has data.</p>
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
                                                placeholder="Please select organizational unit"
                                                onChange={handle}
                                                onSelect={onSelect}
                                                showSearch={true}
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