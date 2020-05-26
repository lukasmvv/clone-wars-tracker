import React from 'react';
import classes from './ListView.module.css';
import Episode from '../../UI/Episode/Episode';

const ListView = (props) => {
    const chronoOrder = [   216,116,100,301,303,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,117,118,119,120,121,
                            201,202,203,217,218,219,204,205,206,207,208,209,210,211,212,213,214,220,221,222,
                            305,306,307,302,304,308,122,309,310,311,215,312,313,314,315,316,317,318,319,320,321,322,
                            401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,
                            502,503,504,505,506,507,508,509,510,511,512,513,501,514,515,516,517,518,519,520,
                            601,602,603,604,605,606,607,608,609,610,611,612,613,
                            701,702,703,704,705,706,707,708,709,710,711,712,713];
    let episodesChrono = [];
    let counter = 1;

    chronoOrder.forEach((listed, i) => {
        const seasonNum = parseInt((''+listed).slice(0,1));
        let epNum = null;
        if (seasonNum===1) {
            epNum = parseInt((''+listed).slice(1));
        } else {
            epNum = parseInt((''+listed).slice(1))-1;
        }
        
        if (props.seasons[`season${seasonNum}`][epNum]) {
            const episodeToPush = props.seasons[`season${seasonNum}`][epNum];
            episodeToPush.chronoNum = counter;
            episodesChrono.push(episodeToPush);
            counter++;
        }
    });

    return (
        <div className={classes.ListView}>
            {episodesChrono.map((ep,i) => {
                return (
                    <Episode key={i} episode={ep} apiKey={props.apiKey} clickedEpisode={props.clickedEpisode}></Episode>
                );
            })}
        </div>
    );
};

export default ListView;