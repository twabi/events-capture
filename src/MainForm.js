import React, { useEffect, useState } from "react";
import "mdbreact/dist/css/mdb.css";
import {
    MDBAlert,
    MDBCardFooter,
    MDBContainer,
    MDBDataTableV5, MDBDropdown, MDBDropdownItem, MDBDropdownMenu, MDBDropdownToggle,
    MDBIcon,
    MDBRow,
} from "mdbreact";
import {TreeSelect, DatePicker, Space, Menu, Dropdown, Button} from "antd";
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
import "jspdf-autotable";
import {TableExport} from "tableexport";
import {DownOutlined} from "@ant-design/icons";


const { RangePicker } = DatePicker;

var moment = require("moment");

const MainForm = (props) => {

    var periods = ["Choose By","Week", "Month"];
    var orgUnitFilters = ["Filter By", "Markets"];
    //var indicatorPrograms = [ "Fisheries", "APES", "SAPP", "T1", "T2", "T3", "MET", "Other"]
    var tableInitialState = {
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
            },{
                label: 'Stored By',
                field: 'storedBy',
            }
        ],
        rows : [],
    };

    const [showLoading, setShowLoading] = useState(false);
    const [showEvents, setShowEvents] = useState(false);
    const [orgUnits, setOrgUnits] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [markets, setMarkets] = useState([]);
    const [searchValue, setSearchValue] = useState();
    const [selectedOrgUnit, setSelectedOrgUnit] = useState(null);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [events, setEvents] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showMenu, setShowMenu] = useState(true);
    const [showPrintLoading, setShowPrintLoading] = useState(false);
    const [headerNames, setHeaderNames] = useState([]);
    const [dataTable, setDataTable] = useState(tableInitialState);
    const [dates, setDates] = useState([]);
    const [hackValue, setHackValue] = useState();
    const [value, setValue] = useState();
    const [inputs, setInputs] = useState([]);
    const [thisPeriod, setThisPeriod] = useState(periods[0]);
    const [range, setRange] = useState(7);
    const [orgFilter, setOrgFilter] = useState(orgUnitFilters[0]);
    const [choseFilter, setChoseFilter] = useState(false);
    const [selectedMarket, setSelectedMarket] = useState(null)

    const disabledDate = current => {
        if (!dates || dates.length === 0) {
            return false;
        }
        const tooLate = dates[0] && current.diff(dates[0], 'days') > range;
        const tooEarly = dates[1] && dates[1].diff(current, 'days') > range;
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

    const handlePeriod = (value) => {
        setThisPeriod(value);
        if(value === "Week"){
            setRange(7);
        } else if(value === "Month"){
            setRange(30);
        } else {
            setRange(7);
        }
    };

    const handleDateChange = (selectedValue) => {
        setValue(selectedValue);
        const valueOfInput1 = selectedValue && selectedValue[0].format().split("+");
        const valueOfInput2 = selectedValue && selectedValue[1].format().split("+");

        setStartDate(valueOfInput1[0])
        setEndDate(valueOfInput2[0])
    }

    useEffect(() => {
       setOrgUnits(props.organizationalUnits);
       setPrograms(props.programs);
       setMarkets(props.marketOrgUnits);

        var analyzed = headerNames.slice().filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);
        if((events !== null && events.length !== 0) && analyzed.length !== null
            && dataTable.rows.length !== 0 && inputs.length !== 0){
            dataTable.columns.map((arrayItem) => {
                analyzed.map((item) => {
                    if (item.id === arrayItem.field) {
                        //console.log("equal");
                        arrayItem.label = item.name;
                    }
                });
                dataTable.rows.map((row, index) => {
                    if(!row[arrayItem.field]){
                        row[arrayItem.field] = "-";
                    }
                });
            });
            try{
                dataTable.rows.map((row, index) => {
                    if(row.event === events[index].event){
                        row[row.instanceTitle] = inputs[index].name;
                    }

                });
            } catch (e) {
                //alert(e)
            }
        }
    },[dataTable.columns, dataTable.rows, events, headerNames, inputs, props.organizationalUnits, props.programs]);


    const handle = (value, label, extra) => {
        setSearchValue(value)
        console.log(value);
    };

    const onSelect = (value, node) => {
        //setOrgUnit(selectedOrgUnit => [...selectedOrgUnit, node]);
        setSelectedOrgUnit(node);
        setSelectedMarket(null);
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
        if (index !== array.length-1 || index !== 0) {
            //console.log(item.dataValues.length)
            //console.log(array[index+1].dataValues.length)
            if(item.dataValues.length !== 0 || array[index+1].dataValues.length !== 0){
                if(array[index+1] && array[index+1].dataValues.length < item.dataValues.length){
                    console.log("the next element is smaller");

                    array[index+1].dataValues.map((arrayItem) => {
                        if (item.dataValues.some(e => e.dataElement === arrayItem.dataElement)) {
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
                } else if(item.dataValues.length < array[index+1] && array[index+1].dataValues.length) {
                    console.log("the next element is larger");

                    var newArray = [];

                    for (var i = 0; i < array[index+1].dataValues.length; i++) {
                        // we want to know if a[i] is found in b
                        var match = false; // we haven't found it yet
                        for (var j = 0; j < item.dataValues.length; j++) {
                            if (array[index+1].dataValues[i].dataElement === item.dataValues[j].dataElement) {
                                // we have found a[i] in b, so we can stop searching
                                match = true;
                                break;
                            }
                            // if we never find a[i] in b, the for loop will simply end,
                            // and match will remain false
                        }
                        // add a[i] to newArray only if we didn't find a match.
                        if (!match) {
                            newArray.push(array[index+1].dataValues[i]);
                        }
                    }

                    newArray.map((arrayTing) => {
                        if(item.dataValues.indexOf(arrayTing) === -1) {
                            item.dataValues.push(
                                {"created": arrayTing.created, "dataElement": arrayTing.dataElement,
                                    "displayName": arrayTing.displayName, "lastUpdated": arrayTing.lastUpdated,
                                    "providedElsewhere": false, "storedBy": arrayTing.storedBy, "value": "-"}
                            );
                        }

                        if(array[index+1].dataValues.indexOf(arrayTing) === -1) {
                            array[index+1].dataValues.push(
                                {"created": arrayTing.created, "dataElement": arrayTing.dataElement,
                                    "displayName": arrayTing.displayName, "lastUpdated": arrayTing.lastUpdated,
                                    "providedElsewhere": false, "storedBy": arrayTing.storedBy, "value": "-"}
                            );
                        }
                    });
                    console.log(newArray);
                }
            }
        }
    }

    const  handleLoadEvents = async () => {
        setShowLoading(true);
        var start = moment(startDate);
        var end = moment(endDate);
        var progID = selectedProgram.id;
        var orgID;
        if(selectedOrgUnit == null && selectedMarket !== null){
            orgID = selectedMarket.id;
        } else if(selectedMarket == null && selectedOrgUnit !== null) {
            orgID = selectedOrgUnit.id;
        }

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
                                //var num = data && data.map(a=>a.dataValues.length).indexOf(Math.max(...data.map(a=>a.length)))

                                var num = data && data.reduce((p, c, i, a) => a[p].dataValues.length > c.dataValues.length ? p : i, 0);
                                console.log(num);

                                data && data.length !== 0 && data[num].dataValues.map((item) => {
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
                                        storedBy: dataItem.storedBy,
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

        setEvents([])
        setHeaderNames([])
        setDataTable(tableInitialState);
        setInputs([])
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

    const menu = (
        <Menu>
            {periods.map((item, index) => (
                <Menu.Item onClick={()=>{handlePeriod(item)}}>
                        {item}
                </Menu.Item>
            ))}
        </Menu>
    );

    const handleOrgFilter = (value) => {
        setOrgFilter(value);
        if(value === "Markets"){
            setChoseFilter(true);
        } else {
            setChoseFilter(false);
        }

    }

    const handleMarketSelect = (value) => {
        setSelectedOrgUnit(null);
        setSelectedMarket(value);
    }


    const orgUnitMenu = (
        <Menu>
            {orgUnitFilters.map((item, index) => (
                <Menu.Item onClick={()=>{handleOrgFilter(item)}}>
                    {item}
                </Menu.Item>
            ))}
        </Menu>
    );

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
                                        data={dataTable}
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
                                                <Dropdown overlay={orgUnitMenu} className="ml-3">
                                                    <Button size="small">{orgFilter} <DownOutlined /></Button>
                                                </Dropdown>
                                            </label>

                                            {choseFilter ?
                                                <Select
                                                    className="mt-2"
                                                    onChange={handleMarketSelect}
                                                    options={markets}
                                                />
                                                :
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

                                            }

                                        </div>
                                    </MDBCol>
                                    <MDBCol md="4">
                                        <div className="text-left my-3">
                                            <label className="grey-text ml-2 d-inline-block ml-2">
                                                <strong>Select Start & End Date</strong>
                                                <Dropdown overlay={menu} className="ml-3">
                                                    <Button size="small">{thisPeriod} <DownOutlined /></Button>
                                                </Dropdown>
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