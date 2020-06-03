import React from 'react';
import classes from './Episode.module.css';

const Episode = (props) => {
    const episode = props.episode;
    
    // getting episode image
    const epCode = `${episode.season}${episode.Episode<10?`0${episode.Episode}`:episode.Episode}.png`;
    let img = null;
    if (episode.Type==='movie') {
        img = <img className={classes.ImageMovie} src={`https://img.omdbapi.com/?i=${episode.movieID}&apikey=${props.apiKey}`} alt='moviePoster'></img>;
    } else {
        img = <img className={classes.Image} src={`/assets/episodeCovers/${epCode}`} alt={`s${episode.season}e${episode.Episode}`}></img>;
    }

    // getting episode number
    let epNum = null;
    if (episode.Type==='movie') {
        epNum = <p className={classes.EpNum}>Movie</p>
    } else {
        epNum = <p className={classes.EpNum}>S{episode.season}E{episode.Episode < 10 ? '0'+episode.Episode : episode.Episode}</p>
    }    

    return (
        <div className={episode.active ? `${classes.Episode} ${classes.EpActive}` : `${classes.Episode} ${classes.EpNotActive}`} id={`ep${episode.season}${episode.Episode}`}>
            <div className={episode.active ? `${classes.Left} ${classes.LeftActive}` : `${classes.Left} ${classes.LeftNotActive}`} onClick={() => props.changeSeen(episode)}>
                <p className={classes.ChronNum}>#{episode.chronoNum}</p>
                {epNum}
                <div className={classes.RuntimeAndRating} onClick={() => props.changeSeen(episode)}>
                    <p className={classes.Runtime}>{episode.Runtime}</p>
                    <p className={classes.Rating}>{episode.imdbRating}/10</p>
                </div>
            </div>
            <div className={`${episode.active ? classes.MidActive : classes.MidNotActive} ${episode.seen ? classes.MidSeen : classes.MidNotSeen}`} >
                <p className={episode.active ? classes.TitleLarge : classes.TitleSmall} onClick={() => props.changeSeen(episode)}>{episode.Title}</p>
                <div className={episode.active ? classes.LongPlot : classes.ShortPlot} onClick={() => props.clickedEpisode(episode)}>
                    <p>{episode.Plot}</p>
                </div>                
            </div>
            <div className={episode.active ? `${classes.Right} ${classes.RightActive}` : `${classes.Right} ${classes.RightNotActive}`} onClick={() => props.changeSeen(episode)}>
                {img}
            </div>
        </div>
    );
};

export default Episode;