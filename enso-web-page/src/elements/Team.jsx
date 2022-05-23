import React, { Component } from "react";
import { FaFacebookF , FaLinkedinIn , FaTwitter } from "react-icons/fa";

let TeamContent = [
    {
        images: '01',
        title: 'Yasmin Cortez',
        designation: 'CEO',
        socialNetwork: []
    },
    {
        images: '02',
        title: 'Yavanna Aranguren',
        designation: 'Diseñadora Grafica',
        socialNetwork: []
    },
    {
        images: '05',
        title: 'Arianna Marquez',
        designation: 'Diseñadora Grafica',
        socialNetwork: []
    },
    {
        images: '04',
        title: 'Carlos Arismendi',
        designation: 'Desarrollador Fullstack',
        socialNetwork: []
    },
    {
        images: '06',
        title: 'William Melian',
        designation: 'Productor Audiovisual',
        socialNetwork: []
    },
    {
        images: '07',
        title: 'Moises Badias',
        designation: 'Supervisor Administrativo',
        socialNetwork: []
    },
    {
        images: '08',
        title: 'Katherine Estupiñan',
        designation: 'Community Manager',
        socialNetwork: []
    },
    {
        images: '09',
        title: 'José Peña',
        designation: 'Generador de Contenido',
        socialNetwork: []
    },
];


class Team extends Component{
    render(){
        const {column} = this.props;
        return(
            <React.Fragment>
                {TeamContent.map((value , i ) => (
                    <div className={`${column}`} key={i}>
                        <div className="team">
                            <div className="thumbnail">
                                <img src={`/assets/images/team/team-${value.images}.jpg`} alt="Blog Images"/>
                            </div>
                            <div className="content">
                                <h4 className="title">{value.title}</h4>
                                <p className="designation">{value.designation}</p>
                            </div>
                            <ul className="social-icon" >
                                {value.socialNetwork.map((social, index) =>
                                    <li key={index}><a href={`${social.url}`}>{social.icon}</a></li>
                                )}
                            </ul>
                        </div>
                    </div>
                ))}
            </React.Fragment>
        )
    }
}
export default Team;