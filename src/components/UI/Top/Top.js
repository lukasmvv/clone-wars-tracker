import React from 'react';
import classes from './Top.module.css';
import {NavLink} from 'react-router-dom';

const Top = (props) => {
    return (
        <div className={classes.Top}>
            <nav>
                <ul>
                    <li><NavLink to="listView">List View</NavLink></li>
                    <li><NavLink to="gridView">Grid View</NavLink></li>
                </ul>
            </nav>
        </div>
    );
};

export default Top;