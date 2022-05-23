// React Required
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

// Create Import File
import './index.scss';

// Home layout
import CreativeLanding from './home/CreativeLanding';

// Element Layout
import ServiceDetails from "./elements/ServiceDetails";
import Contact from "./elements/Contact";
import PortfolioDetails from "./elements/PortfolioDetails";
import BlogDetails from "./elements/BlogDetails";
import error404 from "./elements/error404";

import { BrowserRouter, Switch, Route  } from 'react-router-dom';
import * as serviceWorker from './serviceWorker';


class Root extends Component{
    render(){
        return(
            <BrowserRouter basename={'/'}>
                <Switch>
                    {/* Home Layot */}
                    <Route exact path={`${process.env.PUBLIC_URL}/`} component={CreativeLanding}/>

                    {/* Element Layot */}
                    <Route exact path={`${process.env.PUBLIC_URL}/service-details`} component={ServiceDetails}/>
                    <Route exact path={`${process.env.PUBLIC_URL}/contact`} component={Contact}/>
                    <Route exact path={`${process.env.PUBLIC_URL}/portfolio-details`} component={PortfolioDetails}/>
                    <Route exact path={`${process.env.PUBLIC_URL}/blog-details`} component={BlogDetails}/>
                    <Route path={`${process.env.PUBLIC_URL}/404`} component={error404}/>
                    <Route component={error404}/>
                    
                </Switch>
            </BrowserRouter>
        )
    }
}

ReactDOM.render(<Root/>, document.getElementById('root'));
serviceWorker.register();