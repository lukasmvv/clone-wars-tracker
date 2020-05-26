import React from 'react';
import classes from './Bottom.module.css';

const Bottom = (props) => {
    return (
        <div className={classes.Bottom}>
            <p className={classes.Hello}>Hello there!</p>
            {props.children}
        </div>
    );
};

export default Bottom;