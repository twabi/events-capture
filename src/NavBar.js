import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import {MDBBtn} from "mdbreact";


class NavBar extends React.Component {


    render() {

        return(
            <div>
                <AppBar position="relative" className="mt-5 mb-5 text-white">
                    <Toolbar>
                        <div >
                                <h3 className="text-white">Reporting Tracker For AMIS</h3>
                        </div>
                    </Toolbar>
                </AppBar>

            </div>
        )
    }


}
export default NavBar;