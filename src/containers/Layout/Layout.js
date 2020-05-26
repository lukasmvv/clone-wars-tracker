import React, {Component} from 'react';
import classes from './Layout.module.css';
import Top from '../../components/UI/Top/Top';
import Bottom from '../../components/UI/Bottom/Bottom';
import ListView from '../../components/Views/ListView/ListView';
import GridView from '../../components/Views/GridView/GridView';
import {Route, NavLink, Switch} from 'react-router-dom';
import axios from 'axios';

class Layout extends Component {
    
    constructor(props) {
        super();
        this.state = {
            season1: [],
            season2: [],
            season3: [],
            season4: [],
            season5: [],
            season6: [],
            season7: []
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
    };

    getAndSetEpisode = async (num) => {
        let promises = [];
        let seenArr = [];
        const seasonNum = num;
        const seasonName = `season${seasonNum}`;
        let res = await axios.get(`http://www.omdbapi.com/?apikey=${this.apiKey}&i=${this.showID}&season=${seasonNum}`);
        let episodes = res.data.Episodes;
        if (seasonNum===1) {
            promises.push(axios.get(`http://www.omdbapi.com/?apikey=${this.apiKey}&i=${this.movieID}`));
        }
        episodes.forEach(episode => {
            promises.push(axios.get(`http://www.omdbapi.com/?apikey=${this.apiKey}&i=${episode.imdbID}`));
        });
    
        let allPromises = await Promise.all(promises);

        let cookieVals = this.getCookie(`season${seasonNum}`);                
        const seasonLength = seasonNum===1 ? episodes.length +1 : episodes.length;

        if (cookieVals===null || cookieVals.length!==seasonLength) {
            //console.log('cookie will be created');                    
            this.setCookie(seasonName, seasonNum===1 ? [false,...episodes.map(e => e.seen)] : episodes.map(e => e.seen), new Date('01/01/2100'));   
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
            if (p.data.Type==='movie') {
                return {
                    ...p.data,
                    seen: seenArr[i],
                    season: seasonNum,
                    Episode: 0,
                    movieID: this.movieID
                }
            } else {
                return {
                    ...p.data,
                    seen: seenArr[i],
                    season: seasonNum,
                    showID: this.showID
                }
            }            
        });

        this.setState({
            [seasonName]: episodes
        });
    }


    clickedEpisode = (episode) => {
        let season = this.state[`season${episode.season}`];
        let epNum = null;
        if (episode.season===1) {
            epNum = parseInt(episode.Episode);
        } else {
            epNum = parseInt(episode.Episode)-1;
        }
        season[epNum].seen = !season[epNum].seen;
        this.setCookie(`season${episode.season}`, season.map(e => e.seen), new Date('01/01/2100'));
        this.setState({
            [`seasnon${episode.season}`]: season
        });
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
                        <Route path="/" exact render={(props) => <ListView apiKey={this.apiKey} clickedEpisode={this.clickedEpisode} seasons={this.state}/>}></Route>
                        <Route path="/listView" exact render={(props) => <ListView apiKey={this.apiKey} clickedEpisode={this.clickedEpisode} seasons={this.state}/>}></Route>
                        <Route path="/gridView" exact render={(props) => <GridView apiKey={this.apiKey} seasons={this.state}/>}></Route>
                    </Switch>
                </Bottom>                
            </div>
        );
    }
}

export default Layout;