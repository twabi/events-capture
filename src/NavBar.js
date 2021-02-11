import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import {MDBBtn} from "mdbreact";


class NavBar extends React.Component {


    render() {

        return(
            <div>
                <AppBar position="sticky" className="mb-5 text-white">
                    <Toolbar>
                        <div >
                            <Typography variant="title" color="inherit">
                                <h3 className="text-white">Events Tracker App for NAMIS</h3>
                            </Typography>
                        </div>
                    </Toolbar>
                </AppBar>

            </div>
        )
    }


}
export default NavBar;