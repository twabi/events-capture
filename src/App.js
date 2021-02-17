import React, {Fragment} from "react";
import './App.css';
import MainForm from "./MainForm";
import {getInstance} from 'd2';
import {Switch, Route} from "react-router-dom";


//authentication for the namis api
const basicAuth = 'Basic ' + btoa('ahmed:Atwabi@20');

function App() {

    const [orgUnits, setOrgUnits] = React.useState([]);
    const [programs, setPrograms]= React.useState([]);

    //initializing an array-to-tree library that will turn an array of org units into a tree form
    var arrayToTree = require('array-to-tree');

    React.useEffect(() => {

        getInstance().then((d2) => {
            const endpoint = "programs.json?paging=false"
            const unitEndpoint = "organisationUnits.json?paging=false&fields=name&fields=id&fields=parent"
            d2.Api.getApi().get(endpoint)
                .then((response) => {
                    console.log(response.programs)
                    const tempArray = []
                    response.programs.map((item, index) => {
                        tempArray.push({"id" : item.id, "label" : item.displayName})
                    });
                    setPrograms(tempArray);
                })
                .catch((error) => {
                console.log(error);
            })

            d2.Api.getApi().get(unitEndpoint)
                .then((response) => {
                    console.log(response.organisationUnits)

                    response.organisationUnits.map((item, index) => {
                        //

                        //making sure every org unit has a parent node, if not set it to undefined
                        item.title = item.name;
                        item.value = item.name.replace(/ /g, "") + "-" + index;
                        if(item.parent != null){
                            //console.log(item.parent.id)
                            item.parent = item.parent.id
                        } else {
                            item.parent = undefined
                        }
                    });

                    //do the array-to-tree thing using the parent and id fields in each org unit
                    var tree = arrayToTree(response.organisationUnits, {
                        parentProperty: 'parent',
                        customID: 'id'
                    });

                    console.log(tree);
                    setOrgUnits(tree)

                })
                .catch((error) => {
                    console.log(error);
            });
        })

    }, [arrayToTree])


   return (
    <Fragment>
        <Switch>
            <Route path="/"  render={(props) => (
                <MainForm {...props}
                          programs={programs}
                         organizationalUnits={orgUnits}/>
            )} exact/>
        </Switch>
    </Fragment>
   );
}

export default App;
