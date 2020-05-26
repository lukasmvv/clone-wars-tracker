import React from 'react';
import classes from './GridView.module.css';

const GridView = (props) => {
    return (
        <div className={classes.GridView}>
            this is the grid view
            {props.title}
        </div>
    );
};

export default GridView;