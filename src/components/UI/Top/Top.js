import React from 'react';
import classes from './Top.module.css';
import {NavLink} from 'react-router-dom';

const Top = (props) => {
    return (
        <div className={classes.Top}>
            <nav>
                <ul>
                    <li><NavLink className={classes.NavLink} activeClassName={classes.ActiveNavLink} to="listView">List</NavLink></li>
                    <li><NavLink className={classes.NavLink} activeClassName={classes.ActiveNavLink} to="gridView">Grid</NavLink></li>
                </ul>
            </nav>
        </div>
    );
};

export default Top;