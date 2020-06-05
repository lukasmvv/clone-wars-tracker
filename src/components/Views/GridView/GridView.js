import React from 'react';
import classes from './GridView.module.css';

const GridView = (props) => {

    let table = null;    

    const seasonNums = props.seasonNums;
    const maxArr = new Array(props.seasons.season1.length).fill(0); // getting max season length
    const movie = props.movie;

    table = (
        <div className={classes.Content}>
            <div className={classes.MovieInput}>
                <p>Movie</p>
                <div className={classes.MovieDiv}>
                    <label className={classes.container}>
                        <input type="checkbox" id="movieCheck" name="movieCheck" checked={movie.seen} onChange={() => props.gridClicked(movie)}></input>
                        <span className={classes.checkmark}></span>
                    </label>                    
                </div>
            </div>
            <table className={classes.Table}> 
                <tbody className={classes.Body}>
                    {/* header row */}
                    <tr>
                        <th></th>
                        {seasonNums.map((s,i) => {
                            return (<th key={`0-${i}`}>{s}</th>);
                        })}
                    </tr>
                    {/* other rows */}
                    {maxArr.map((a,j) => {
                        return (
                            <tr key={j}>
                                <th>{j+1}</th>
                                {seasonNums.map((s,i) => {
                                    const colNum = s;
                                    let numberEps = props.seasons[`season${s}`].length;                                    
                                    if ((j+1)>numberEps) {
                                        return (
                                            <td key={`${j}-${i}`}></td>
                                        );
                                    } else {
                                        if ((typeof props.seasons[`season${colNum}`][j])==='undefined') {
                                            return (
                                                <td key={`${j}-${i}`}></td>
                                            );
                                        } else {
                                            const seen = props.seasons[`season${s}`][j].seen;
                                            return (<td key={`${j}-${i}`}>
                                                            <label className={classes.container}>
                                                                <input type="checkbox" checked={seen} onChange={() => props.gridClicked(props.seasons[`season${s}`][j])}></input>
                                                                <span className={classes.checkmark}></span>
                                                            </label>                                                                
                                                    </td>);
                                        }                                        
                                    }                                
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className={classes.GridView}>
            {table}
        </div>
    );
};

export default GridView;