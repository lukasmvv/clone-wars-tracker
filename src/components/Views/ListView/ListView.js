import React from 'react';
import classes from './ListView.module.css';
import Episode from '../../UI/Episode/Episode';

// scrolling to given position
const scrollTo = (ref,pos) => {
    if (ref) {
        ref.scrollTo(0,pos);
    }
};

const ListView = (props) => {
    const chronoOrder = [   216,116,100,301,303,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,117,118,119,120,121,
                            201,202,203,217,218,219,204,205,206,207,208,209,210,211,212,213,214,220,221,222,
                            305,306,307,302,304,308,122,309,310,311,215,312,313,314,315,316,317,318,319,320,321,322,
                            401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,
                            502,503,504,505,506,507,508,509,510,511,512,513,501,514,515,516,517,518,519,520,
                            601,602,603,604,605,606,607,608,609,610,611,612,613,
                            701,702,703,704,705,706,707,708,709,710,711,712];
    let episodesChrono = [];

    chronoOrder.forEach((listed, i) => {
        const seasonNum = parseInt((''+listed).slice(0,1));
        let epIndex = parseInt((''+listed).slice(1))-1;
        let chronoNum = i+1;
        // if season is in object
        if (`season${seasonNum}` in props.seasons && ((props.movie)!=='undefined')) {
            if (listed===100) {
                props.movie.chronoNum = chronoNum;
                episodesChrono.push(props.movie);
            }            
            // if episode is in season
            
            // else if (epNum<props.seasons[`season${seasonNum}`].length) {
            // else if (props.seasons[`season${seasonNum}`][epIndex].Episode===epIndex+1) {
            else if (typeof props.seasons[`season${seasonNum}`][epIndex]!=='undefined') {
                if (+props.seasons[`season${seasonNum}`][epIndex].Episode===epIndex+1) {
                    const episodeToPush = props.seasons[`season${seasonNum}`][epIndex];
                    episodeToPush.chronoNum = chronoNum;
                    episodesChrono.push(episodeToPush);
                } else {
                    const tempEp = {
                        Actors: "N/A",
                        Awards: "N/A",
                        Country: "N/A",
                        Director: "N/A",
                        Episode: epIndex+1,
                        Genre: "Animation, Action, Adventure, Drama, Fantasy, Sci-Fi",
                        Language: "N/A",
                        Metascore: "N/A",
                        Plot: "N/A",
                        Poster: "N/A",
                        Rated: "N/A",
                        Ratings: [],
                        Released: "N/A",
                        Response: "True",
                        Runtime: "23 min",
                        Season: "7",
                        Title: "N/A",
                        Type: "episode",
                        Writer: "N/A",
                        Year: "N/A",
                        active: false,
                        imdbID: "N/A",
                        imdbRating: "N/A",
                        imdbVotes: "N/A",
                        season: seasonNum,
                        seen: false,
                        seriesID: "tt0458290",
                        showID: "N/A",
                        chronoNum: chronoNum
                    };
                    episodesChrono.push(tempEp); // adding empty episode to array
                }
            }            
        }
    });

    return (
        <div ref={(ref) => scrollTo(ref,props.listScrollPos)} className={classes.ListView} onScroll={props.scrolled} id="listDiv">
            {episodesChrono.map((ep,i) => {
                return (
                    <Episode 
                        key={i} 
                        episode={ep} 
                        apiKey={props.apiKey} 
                        changeSeen={props.changeSeen} 
                        clickedEpisode={props.clickedEpisode}>                            
                    </Episode>
                );
            })}
        </div>
    );
};

export default ListView;