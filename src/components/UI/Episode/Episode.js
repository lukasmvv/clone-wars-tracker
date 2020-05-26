import React from 'react';
import classes from './Episode.module.css';
import axios from 'axios';

const Episode = (props) => {
    const episode = props.episode;
    let img = null;
    
    // if (episode.season===0) {
    //     // img = <img src={`http://img.omdbapi.com/?i=${episode.movieID}&apikey=${props.apiKey}`} alt='test  '></img>;
    //     img = <img src={`../../../assets/seasonCovers/season${episode.season}.jpg`} alt='test'></img>;
    // } else {
    //     // img = <img src={`http://img.omdbapi.com/?i=${episode.showID}&season=${episode.season}&apikey=${props.apiKey}`} alt='test  '></img>;
    //     img = <img className={classes.Image} src={`/assets/seasonCovers/season${episode.season}.jpg`} alt='test'></img>;
    // }
    const epCode = `${episode.season}${episode.Episode<10?`0${episode.Episode}`:episode.Episode}.png`;
    if (episode.Type==='movie') {
        img = <img src={`http://img.omdbapi.com/?i=${episode.movieID}&apikey=${props.apiKey}`} alt='moviePoster'></img>;
    } else {
        img = <img className={classes.Image} src={`/assets/episodeCovers/${epCode}`} alt='test'></img>;
    }

    let epNum = null;
    if (episode.Type==='movie') {
        epNum = <p className={classes.EpNum}>Movie</p>
    } else {
        epNum = <p className={classes.EpNum}>S{episode.season}E{episode.Episode < 10 ? '0'+episode.Episode : episode.Episode}</p>
    }

    return (
        <div className={classes.Episode}>
            <div className={classes.Left}>
                <p className={classes.ChronNum}>#{episode.chronoNum}</p>
                {epNum}
                {/* <p className={classes.EpNum}>S{episode.season}E{episode.Episode < 10 ? '0'+episode.Episode : episode.Episode}</p> */}
                {/* <p className={episode.seen ? classes.Seen : classes.NotSeen}>{episode.seen ? 'Seen' : 'Not Seen'}</p> */}
                {/* <p>Seen</p> */}
                
                {/* <label className={classes.CheckboxContainer}>
                    <input type="checkbox"></input>
                    <span className={classes.CheckboxCheckmark}></span>
                </label> */}
            </div>
            <div className={episode.seen ? classes.MidSeen : classes.MidNotSeen} onClick={() => props.clickedEpisode(episode)}>
                <p className={classes.Title}>{episode.Title}</p>
                <p className={classes.Runtime}>{episode.Runtime}</p>
                <p className={classes.Rating}>IMDB Rating: {episode.imdbRating}/10</p>
                {/* <p>{episode.imdbID}</p> */}
                <p className={classes.Plot}>{episode.Plot}</p>
            </div>
            <div className={classes.Right}>
                {img}
            </div>
        </div>
    );
};

export default Episode;