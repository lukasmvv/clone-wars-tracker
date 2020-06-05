import React, {Component} from 'react';
import classes from './Layout.module.css';
import Top from '../../components/UI/Top/Top';
import Bottom from '../../components/UI/Bottom/Bottom';
import ListView from '../../components/Views/ListView/ListView';
import GridView from '../../components/Views/GridView/GridView';
import {Route, Switch, Redirect} from 'react-router-dom';
import axios from 'axios';

// TO DO
// Episode fonts, seen colours
// Grid improvements?
// cookie permissions?

// EXTRA TO DO
// star wars intro type scroll
// make scrolling/clicking positioning even better

// PROBABLY NOT GONNA DO
// User ratings


// TVDB - https://api.thetvdb.com/swagger#!/Series/get_series_id_episodes
// proxy: https://tvdbapiproxy.leonekmi.fr

// to get token POST to: https://api.thetvdb.com/login
// Content-Type: application/json
//  body: {
//     "apikey": "22a67437a7c58af4cff3b98674afc0b0",
//     "userkey": "5ED7BDB66E2553.87624355",
//     "username": "lukasmvv"     
//  }
// this returns a JWT token
// token valid for 24 hours

// to refresh token GET from: https://api.thetvdb.com/refresh_token
// Content-Type: application/json
// Authorization: Bearer [token]
// this returns a JWT token

// to get episodes in a season: https://api.thetvdb.com/series/83268/episodes/query?airedSeason=1
// check airedSeason vs dvdSeason
// Content-Type: application/json
// Authorization: Bearer [token]


// DATA FLOW EXPLANATION
// Main source of data is OMDB, wich sources data from IMDB
// However, some of the data is incorrect/missing
// Therefore static data from TVDB is saved in Firebase for reference - this data has correct season/episode numbers and has the IMDB IDs
// TVDB is not used directly due to CORS policy
// With the IMDB ID, additional info only in IMDB is retrieved


class Layout extends Component {
    
    constructor(props) {
        super();
        this.state = {
            loading: true,
            listScrollPos: 0,
            updateOnScroll: false
        }

        this.apiKey = 'c1fb34c8';
        this.showID = 'tt0458290';
        this.movieID = 'tt1185834';
        this.timer = null;
        this.timerLength = 1000;
        this.holding = false;
        this.timers = [];
        this.long = true;
        this.scroll = false;
        this.seasons = ['season1', 'season2', 'season3', 'season4', 'season5', 'season6', 'season7'];
        this.seasonNums = [1,2,3,4,5,6,7];
        this.seasonsAndMovie = [...this.seasons, 'movie'];
    }

    componentDidMount() { 
        // getting episodes
        this.testFirebase();

        // getting movie
        this.getAndSetMovie();

        // scroll cookie
        this.getAndSetScrollCookie();
    };

    shouldComponentUpdate(nextProps, nextState) {
        //console.log('shouldComponentUpdate');
        let ret = true;

        // if scroll set, dont update, otherwise check if all data has arrived for update
        if (this.state.listScrollPos!==nextState.listScrollPos && !nextState.updateOnScroll) {
            this.setCookie('scroll', nextState.listScrollPos, new Date('01/01/2100')); 
            ret = false;
        } 

        const seasons = this.seasonsAndMovie;
        seasons.forEach(s => {
            if (!(s in nextState)) {
                ret = false;
            }            
        });

        // checking for all data and if loading - if all true set loading to false
        if (ret && this.state.loading) {
            this.setState({loading: false});
        }
        return ret;
    }

    getAndSetScrollCookie = () => {
        let cookieVals = this.getCookie(`scroll`); // getting scroll cookie
        // checking cookie
        let scroll = 0;
        if (cookieVals===null) {                  
            this.setCookie('scroll', scroll, new Date('01/01/2100'));                 
        } else {
            scroll = cookieVals;
        }
        this.setState({listScrollPos: scroll, updateOnScroll: true});
    }

    getAndSetMovie = async () => {
        let res = await axios.get(`https://www.omdbapi.com/?apikey=${this.apiKey}&i=${this.movieID}`); // getting movie data
        let cookieVals = this.getCookie(`movie`); // getting movie cookie
        let seen = null;
    
        // checking cookie
        if (cookieVals===null) {                  
            this.setCookie('movie', false, new Date('01/01/2100'));   
            seen = false;               
        } else {
            seen = cookieVals;
        }

        // setting up custom episode
        const newMovie = {
            //season: +episode.dvdSeason,
            //episodeNumber: +episode.dvdEpisodeNumber,
            name: res.data.Title,
            runtime: res.data.Runtime,
            plot: res.data.Plot,
            poster: res.data.Poster,
            rating: res.data.imdbRating,
            imdbId: res.imdbId,
            rated: res.data.Rated,
            active: false,
            type: 'movie',
            seen: seen,
            movieID: this.movieID,
            active: false
    }

        // setting movie state
        this.setState({
            movie: {
                ...newMovie
            }
        });
    }

    getAndSetEpisodes = async () => {
        const allData = [];
        const imdbEps = [];
        let promises = [];
        let movie = null;

        // looping through seasons
        for (var i=1;i<=7;i++) {
            // getting static season data from firebase
            const data = await axios.get(`https://clone-wars-tracker.firebaseio.com/season${i}.json`);
            
            // looping through episodes in season
            const season = data.data.dvdSeason.data;
            const seasonPromises = await season.map(async (episode,index) => {
                // getting imdb data for episode
                let imdbEp = await axios.get(`https://www.omdbapi.com/?apikey=${this.apiKey}&i=${episode.imdbId}`);
                
                // setting up custom episode
                const newEpisode = {
                        season: +episode.dvdSeason,
                        episodeNumber: +episode.dvdEpisodeNumber,
                        name: episode.episodeName,
                        runtime: imdbEp.data.Runtime,
                        plot: imdbEp.data.Plot,
                        poster: imdbEp.data.Poster,
                        rating: imdbEp.data.imdbRating,
                        imdbId: episode.imdbId,
                        rated: imdbEp.data.Rated,
                        active: false,
                        type: 'episode'
                }
                return newEpisode;
            });
            // waiting for all episode promises to be resolved
            let newSeason = await Promise.all(seasonPromises);
            

            // getting and checking cookie data
            let cookieVals = this.getCookie(`season${i}`); 
            let seenArr = [];               
            if (cookieVals===null || cookieVals.length!==newSeason.length) {                   
                this.setCookie(`season${i}`, newSeason.map(e => e.seen), new Date('01/01/2100'));   
                cookieVals.forEach((cv,i) => {
                    seenArr[i] = false;
                });               
            } else {
                cookieVals.forEach((cv,i) => {
                    seenArr[i] = (cv === 'true');
                });
            }

            // adding seen property to custom ep object
            const newestSeason = newSeason.map((ep, index) => {
                return {
                    ...ep,
                    seen: seenArr[index]
                }
            });

            // adding season data to all data
            allData.push(newestSeason.sort((a,b) => (a.episodeNumber>b.episodeNumber ? 1 : -1)));
            // setting episodes state
            this.setState({
                [`season${i}`]: newestSeason
            });
        }
    }

    // addEpToSeason = (episode) => {
    //     const seasonNum = episode.season;
    //     const episodeNum = episode.Episode;
    //     const episodeIndex = episodeNum-1;
    //     let season = this.state[`season${episode.season}`];
    //     season.splice(episodeIndex, 0, episode)
    //     this.setCookie(`season${seasonNum}`, season.map(e => e.seen), new Date('01/01/2100'));
    //     this.setState({
    //         [`season${episode.season}`]: season
    //     });
    // }

    // setting passed episode to seen
    changeEpisodeSeen = (episode) => {
        if (episode.type==='movie') {
            const newSeen = !episode.seen;
            this.setCookie(`movie`, newSeen, new Date('01/01/2100'));
            this.setState({
                movie: {
                    ...episode,
                    seen: newSeen
                }
            });
        } else {
            let season = this.state[`season${episode.season}`];
            let epNum = parseInt(episode.episodeNumber)-1;
            season[epNum].seen = !season[epNum].seen;
            this.setCookie(`season${episode.season}`, season.map(e => e.seen), new Date('01/01/2100'));
            this.setState({
                [`season${episode.season}`]: season
            });
        }        
    }

    // setting passed episode to active
    changeEpisodeActive = (episode) => { 
        const pos = this.state.listScrollPos;

        if (!episode.active) {
            this.allEpisodesInactive();
        }

        var elem = document.getElementById(`ep${episode.season}${episode.episodeNumber}`);
        if (elem) {
            var bounding = elem.getBoundingClientRect();
            // active element has 300px height
            if (bounding.top+300 > (window.innerHeight || document.documentElement.clientHeight)) {
                const diff = bounding.top+300-window.innerHeight;
                if (!episode.active) {
                    this.setState({listScrollPos: pos+diff, oldListScroll: pos, updateOnScroll: true});
                } 
            }
        }

        if (episode.Type==='movie') {
            const newActive = !episode.active;
            this.setState({
                movie: {
                    ...episode,
                    active: newActive
                }
            });
        } else {
            let season = this.state[`season${episode.season}`];
            let epNum = parseInt(episode.episodeNumber)-1;
            season[epNum].active = !season[epNum].active;
            this.setState({
                [`season${episode.season}`]: season
            });
        }  
    }

    // setting all episodes to inactive
    allEpisodesInactive = () => {
        const seasons = this.seasons;
        let newState = {};
        seasons.forEach(season => {
            let newSeason = this.state[season];
            newSeason.forEach(ep => {
                ep.active = false;
            });
            newState[season] = newSeason;
        });

        let newMovie = this.state.movie;
        newMovie.active = false;
        this.setState({
            movie: newMovie,
            ...newState
        });
    }

    // get a single cookie
    getCookie = (name) => {
        const cookieArray = document.cookie.split(';');
        var nameEQ = name + "=";

        // looping through all cookies
        for (var i=0;i<cookieArray.length;i++) {
            let c = cookieArray[i];

            // removing leading spaces
            if (c.charAt(0)===' ') {
                c = c.substring(1,c.length);
            }

            // if found returning all values in array
            if (c.includes(nameEQ)) {
                return c.substring(nameEQ.length,c.length).split(',');
            }
        }
        return null;
    }

    // set a single cookie
    setCookie = (name, value, expireDate) => {
        const cookieName = `${name}=${value}; `;
        const expires = `expires=${expireDate}; `;
        const cookie = `${cookieName}${expires}path=/`;
        document.cookie = cookie;
    }

    // erase a single cookie
    eraseCookie = (name) => {
        document.cookie = `${name}+=; Max-Age=-99999999;`;
    }

    // when list view is scrolled set state for scroll position
    scrolled = () => {
        var scrollPos = document.getElementById("listDiv").scrollTop;
        //console.log(scrollPos);
        this.setState({listScrollPos: scrollPos, updateOnScroll: false});
    }

    render() {

        let display= null;

        // checking to show spinner or content
        if (this.state.loading){
            display = (
                <div className={classes.spinner}><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
            );
        } else {
            display = (
                <Bottom>
                <Switch>
                    {/* <Route path="/" exact render={(props) => <ListView apiKey={this.apiKey} clickedEpisode={this.clickedEpisode} seasons={this.state} movie={this.state.movie}/>}></Route> */}
                    <Route path="/" exact> <Redirect to="/listView"></Redirect> </Route>
                    <Route path="/listView" exact render={(props) => <ListView 
                                                                        apiKey={this.apiKey} 
                                                                        clickedEpisode={this.changeEpisodeActive} 
                                                                        changeSeen={this.changeEpisodeSeen} 
                                                                        seasons={this.state} 
                                                                        movie={this.state.movie}
                                                                        scrolled={this.scrolled}
                                                                        listScrollPos={this.state.listScrollPos}
                                                                        addEpToSeason={this.addEpToSeason}
                                                                        />}></Route>
                    <Route path="/gridView" exact render={(props) => <GridView 
                                                                        apiKey={this.apiKey} 
                                                                        seasons={{...this.state}} 
                                                                        movie={this.state.movie} 
                                                                        seasonNums={this.seasonNums}
                                                                        gridClicked={this.changeEpisodeSeen}/>}></Route>
                    </Switch>
                </Bottom>  
            );
        }

        return (
            <div className={classes.Layout}>
                <Top></Top>
                {display}                          
            </div>
        );
    }
}

export default Layout;