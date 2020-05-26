import React, {Component} from 'react';
import classes from './Layout.module.css';
import Top from '../../components/UI/Top/Top';
import Bottom from '../../components/UI/Bottom/Bottom';
import ListView from '../../components/Views/ListView/ListView';
import GridView from '../../components/Views/GridView/GridView';
import {Route, NavLink, Switch} from 'react-router-dom';
import axios from 'axios';

// TO DO
// scroll snap
// selected episode bigger card
// grid view - click on cells
// make app look better - list, grid, icon, navs
// hold episode to change seen
// click episode for full card
// add ... to long plot text
// edit shouldComponentUpdate in layout so that components are updated once state is full
// user ratings?
// cookie permissions

class Layout extends Component {
    
    constructor(props) {
        super();
        this.state = {
            // season1: [],
            // season2: [],
            // season3: [],
            // season4: [],
            // season5: [],
            // season6: [],
            // season7: []
        }
        this.apiKey = 'c1fb34c8';
        this.showID = 'tt0458290';
        this.movieID = 'tt1185834';
    }

    componentDidMount() { 
        // check if season cookies exist
        const cookieNames = ['season1', 'season2', 'season3', 'season4', 'season5', 'season6', 'season7'];
        cookieNames.forEach((cookieName,i) => {            
            // getting and looping through all seasons
            this.getAndSetEpisode(i+1);         
        });

        this.getAndSetMovie();
    };

    shouldComponentUpdate(nextProps, nextState) {
        //console.log('shouldComponentUpdate');
        let ret = true;
        const seasons = ['season1', 'season2', 'season3', 'season4', 'season5', 'season6', 'season7', 'movie'];
        seasons.forEach(s => {
            //console.log(s);
            if (!(s in nextState)) {
                // console.log('no');
                ret = false;
            }            
        });
        //console.log(ret);
        //console.log(nextState);
        return ret;
    }

    getAndSetMovie = async () => {
        let promises = [];
        let res = await axios.get(`http://www.omdbapi.com/?apikey=${this.apiKey}&i=${this.movieID}`);
        console.log(res); 
        let cookieVals = this.getCookie(`movie`);
        let seen = null;
    
        if (cookieVals===null) {
            //console.log('cookie will be created');                    
            this.setCookie('movie', false, new Date('01/01/2100'));   
            seen = false;               
        } else {
            //console.log('cookie exists');
            seen = cookieVals;
        }
        this.setState({
            movie: {
                ...res.data,
                seen: seen,
                movieID: this.movieID
            }
        });
    }

    getAndSetEpisode = async (num) => {
        let promises = [];
        let seenArr = [];
        const seasonNum = num;
        const seasonName = `season${seasonNum}`;
        let res = await axios.get(`http://www.omdbapi.com/?apikey=${this.apiKey}&i=${this.showID}&season=${seasonNum}`);
        let episodes = res.data.Episodes;

        episodes.forEach(episode => {
            promises.push(axios.get(`http://www.omdbapi.com/?apikey=${this.apiKey}&i=${episode.imdbID}`));
        });
    
        let allPromises = await Promise.all(promises);

        let cookieVals = this.getCookie(`season${seasonNum}`);                
        const seasonLength = episodes.length;

        if (cookieVals===null || cookieVals.length!==seasonLength) {
            //console.log('cookie will be created');                    
            this.setCookie(seasonName, episodes.map(e => e.seen), new Date('01/01/2100'));   
            cookieVals.forEach((cv,i) => {
                seenArr[i] = false;
            });               
        } else {
            //console.log('cookie exists');
            cookieVals.forEach((cv,i) => {
                seenArr[i] = (cv === 'true');
            });
        }

        episodes = allPromises.map((p,i) => {
            return {
                ...p.data,
                seen: seenArr[i],
                season: seasonNum,
                showID: this.showID
            }           
        });

        this.setState({
            [seasonName]: episodes
        });
    }


    clickedEpisode = (episode) => {
        console.log(episode);
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
                [`seasnon${episode.season}`]: season
            });
        }        
    }


    getCookie = (name) => {
        const cookieArray = document.cookie.split(';');
        var nameEQ = name + "=";
        let ret = null;

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

    setCookie = (name, value, expireDate) => {
        const cookieName = `${name}=${value}; `;
        const expires = `expires=${expireDate}; `;
        const cookie = `${cookieName}${expires}path=/`;
        document.cookie = cookie;
    }

    eraseCookie = (name) => {
        document.cookie = `${name}+=; Max-Age=-99999999;`;
    }

    render() {
        console.log(this.state);
        return (
            <div className={classes.Layout}>
                <Top></Top>
                <Bottom>
                    <Switch>
                        <Route path="/" exact render={(props) => <ListView apiKey={this.apiKey} clickedEpisode={this.clickedEpisode} seasons={this.state} movie={this.state.movie}/>}></Route>
                        <Route path="/listView" exact render={(props) => <ListView apiKey={this.apiKey} clickedEpisode={this.clickedEpisode} seasons={this.state} movie={this.state.movie}/>}></Route>
                        <Route path="/gridView" exact render={(props) => <GridView apiKey={this.apiKey} seasons={{...this.state}} movie={this.state.movie}/>}></Route>
                    </Switch>
                </Bottom>                
            </div>
        );
    }
}

export default Layout;