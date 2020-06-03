import React, {Component} from 'react';
import classes from './Layout.module.css';
import Top from '../../components/UI/Top/Top';
import Bottom from '../../components/UI/Bottom/Bottom';
import ListView from '../../components/Views/ListView/ListView';
import GridView from '../../components/Views/GridView/GridView';
import {Route, Switch, Redirect} from 'react-router-dom';
import axios from 'axios';

// TO DO
// Missing episode data?
// Episode fonts, seen colours
// Grid improvements?
// cookie permissions?

// EXTRA TO DO
// star wars intro type scroll
// make scrolling/clicking positioning even better

// PROBABLY NOT GONNA DO
// User ratings

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
    }

    componentDidMount() { 
        // getting all tv episodes
        const cookieNames = ['season1', 'season2', 'season3', 'season4', 'season5', 'season6', 'season7'];
        cookieNames.forEach((cookieName,i) => {            
            this.getAndSetEpisode(i+1);         
        });

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

        const seasons = ['season1', 'season2', 'season3', 'season4', 'season5', 'season6', 'season7', 'movie'];
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
        console.log(this.state.listScrollPos);
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

        // setting movie state
        this.setState({
            movie: {
                ...res.data,
                seen: seen,
                movieID: this.movieID,
                active: false
            }
        });
    }

    getAndSetEpisode = async (num) => {
        let promises = [];
        let seenArr = [];
        const seasonNum = num;
        const seasonName = `season${seasonNum}`;
        let res = await axios.get(`https://www.omdbapi.com/?apikey=${this.apiKey}&i=${this.showID}&season=${seasonNum}`); // getting all episodes data
        let episodes = res.data.Episodes;

        episodes.forEach(episode => {
            promises.push(axios.get(`https://www.omdbapi.com/?apikey=${this.apiKey}&i=${episode.imdbID}`)); // getting single episode full data
        });
    
        // waiting for all data to arrive
        let allPromises = await Promise.all(promises);

        // getting and checking cookie data
        let cookieVals = this.getCookie(`season${seasonNum}`);                
        const seasonLength = episodes.length;
        if (cookieVals===null || cookieVals.length!==seasonLength) {                   
            this.setCookie(seasonName, episodes.map(e => e.seen), new Date('01/01/2100'));   
            cookieVals.forEach((cv,i) => {
                seenArr[i] = false;
            });               
        } else {
            cookieVals.forEach((cv,i) => {
                seenArr[i] = (cv === 'true');
            });
        }

        // setting episodes data
        episodes = allPromises.map((p,i) => {
            return {
                ...p.data,
                seen: seenArr[i],
                season: seasonNum,
                showID: this.showID,
                active: false
            }           
        });

        // setting episodes state
        this.setState({
            [seasonName]: episodes
        });
    }

    // setting passed episode to seen
    changeEpisodeSeen = (episode) => {
        if (episode.Type==='movie') {
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
            let epNum = parseInt(episode.Episode)-1;
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

        var elem = document.getElementById(`ep${episode.season}${episode.Episode}`);
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
            let epNum = parseInt(episode.Episode)-1;
            season[epNum].active = !season[epNum].active;
            this.setState({
                [`season${episode.season}`]: season
            });
        }  
    }

    // setting all episodes to inactive
    allEpisodesInactive = () => {
        const seasons = ['season1', 'season2','season3','season4','season5','season6','season7'];
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
                                                                        />}></Route>
                    <Route path="/gridView" exact render={(props) => <GridView 
                                                                        apiKey={this.apiKey} 
                                                                        seasons={{...this.state}} 
                                                                        movie={this.state.movie} 
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