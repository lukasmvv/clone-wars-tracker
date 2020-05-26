import React from 'react';
import classes from './GridView.module.css';

const GridView = (props) => {
    // let seasons = null;
    // let movie = null;
    let table = null;
    // let tableRows = [];
    // let max = 0;
    // let rows = [];

    

    if (JSON.stringify(props.seasons)!==JSON.stringify({})) {
        const seasonNums = [1,2,3,4,5,6,7];
        const maxArr = new Array(props.seasons.season1.length).fill(0);

        table = (
            <table className={classes.Table}>
                <tbody>
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
                                <td>{j+1}</td>
                                {seasonNums.map((s,i) => {
                                    const colNum = s;
                                    let numberEps = props.seasons[`season${s}`].length;                                    
                                    if ((j+1)>numberEps) {
                                        return (
                                            <td key={`${j}-${i}`}>none</td>
                                        );
                                    } else {
                                        console.log((typeof props.seasons[`season${colNum}`][j+1])==='undefined');
                                        if ((typeof props.seasons[`season${colNum}`][j])==='undefined') {
                                            return (
                                                <td key={`${j}-${i}`}>no ep</td>
                                            );
                                        } else {
                                            const seen = props.seasons[`season${s}`][j].seen;
                                            return (<td 
                                                        key={`${j}-${i}`}
                                                        className={seen ? classes.Seen : classes.NotSeen}>
                                                            {''+props.seasons[`season${s}`][j].seen}
                                                    </td>);
                                        }                                        
                                    }                                
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        );
    }

    

   
    
    console.log('grid');
    console.log(props);
    return (
        <div className={classes.GridView}>
            {/* this is the grid view */}
            {table}
        </div>
    );
};

export default GridView;