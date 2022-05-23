import React, { Component, Fragment } from "react";
import Slider from "react-slick";
import { slickDot } from "../page-demo/script";
import Scrollspy from 'react-scrollspy';
import { FiX, FiMenu } from "react-icons/fi";
import ServiceList from "../elements/service/ServiceList";
import CounterOne from "../elements/counters/CounterOne";
import Team from "../elements/Team";
import BlogContent from "../elements/blog/BlogContent";
import BrandTwo from "../elements/BrandTwo";
import FooterTwo from "../component/footer/FooterTwo";
import Helmet from "../component/common/Helmet";
import ReactPlayer from 'react-player'

import WhatsAppWidget from 'react-whatsapp-widget'
import 'react-whatsapp-widget/dist/index.css'


const SlideList = [
    {
        textPosition: 'text-center',
        category: '',
        title: 'Somos tu solución',
        description: 'Soñamos, Creamos, Innovamos',
        buttonText: 'Contáctanos',
        buttonLink: '#contact'
    }
]

const list = [
    {
        image: 'image-1',
        category: 'Diseño y Desarrollo',
        title: 'El Recargadero'
    },
    {
        image: 'image-2',
        category: 'Diseño y Desarrollo',
        title: 'TU 24-7'
    },
    {
        image: 'image-3',
        category: 'Diseño y Desarrollo',
        title: 'ENSŌ'
    }
]


class CreativeLanding extends Component {
    constructor(props) {
        super(props);
        this.menuTrigger = this.menuTrigger.bind(this);
        this.CLoseMenuTrigger = this.CLoseMenuTrigger.bind(this);
        this.stickyHeader = this.stickyHeader.bind(this);

        //  this.subMetuTrigger = this.subMetuTrigger.bind(this);
        window.addEventListener('load', function () {
            console.log('All assets are loaded');
        })
    }
    menuTrigger() {
        document.querySelector('.header-wrapper').classList.toggle('menu-open')
    }
    CLoseMenuTrigger() {
        document.querySelector('.header-wrapper').classList.remove('menu-open')
    }
    stickyHeader() { }
    render() {
        const PostList = BlogContent.slice(0, 5);

        window.addEventListener('scroll', function () {
            var value = window.scrollY;
            if (value > 100) {
                document.querySelector('.header--fixed').classList.add('sticky')
            } else {
                document.querySelector('.header--fixed').classList.remove('sticky')
            }
        });

        var elements = document.querySelectorAll('.has-droupdown > a');
        for (var i in elements) {
            if (elements.hasOwnProperty(i)) {
                elements[i].onclick = function () {
                    this.parentElement.querySelector('.submenu').classList.toggle("active");
                    this.classList.toggle("open");
                }
            }
        }

        return (
            <Fragment>
                <Helmet pageTitle="Agencia de Marketing Digital" />
                {/* Start Header Area  */}
                <header className="header-area formobile-menu header--fixed default-color">
                    <div className="header-wrapper" id="header-wrapper">
                        <div className="header-left">
                            <div className="logo">
                                <a href="/">
                                    <img className="logo-1" src="/assets/images/logo/logo-light-3.png" alt="Logo Images" />
                                    <img className="logo-2" src="/assets/images/logo/logo-all-dark.png" alt="Logo Images" />
                                </a>
                            </div>
                        </div>
                        <div className="header-right">
                            <nav className="mainmenunav d-lg-block">
                                <Scrollspy className="mainmenu" items={['home', 'service', 'about', 'portfolio', 'team', 'testimonial', 'blog', 'contact']} currentClassName="is-current" offset={-200}>
                                    <li><a href="#home">Inicio</a></li>
                                    <li><a href="#service">Servicios</a></li>
                                    <li><a href="#about">Nosotros</a></li>
                                    <li><a href="#portfolio">Portafolio</a></li>
                                    <li><a href="#team">Equipo</a></li>
                                    <li><a href="https://api.whatsapp.com/send?phone=527713001512" target="_blank">Contacto</a></li>
                                </Scrollspy>
                            </nav>
                            {/* Start Humberger Menu  */}
                            <div className="humberger-menu d-block d-lg-none pl--20">
                                <span onClick={this.menuTrigger} className="menutrigger text-white"><FiMenu /></span>
                            </div>
                            {/* End Humberger Menu  */}
                            <div className="close-menu d-block d-lg-none">
                                <span onClick={this.CLoseMenuTrigger} className="closeTrigger"><FiX /></span>
                            </div>
                        </div>
                    </div>
                </header>
                {/* End Header Area  */}

                {/* Start Slider Area   */}
                {/* <div className="slider-activation slider-creative-agency" id="home">
                    <div className="bg_image bg_image--26" data-black-overlay="6">
                        {SlideList.map((value, index) => (
                            <div className="slide slide-style-2 slider-paralax d-flex align-items-center justify-content-center" key={index}>
                                <div className="container">
                                    <div className="row">
                                        <div className="col-lg-12">
                                            <div className={`inner ${value.textPosition}`}>
                                                {value.category ? <span>{value.category}</span> : ''}
                                                {value.title ? <h1 className="title theme-gradient">{value.title}</h1> : ''}
                                                {value.description ? <p className="description">{value.description}</p> : ''}
                                                {value.buttonText ? <div className="slide-btn"><a className="rn-button-style--2 btn-primary-color" href={`${value.buttonLink}`}>{value.buttonText}</a></div> : ''}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div> */}
                <div style={{marginTop: 105}}>
                    <img src="/assets/images/banner1.jpg" alt="" width1="100%" />
                </div>
                {/* End Slider Area   */}

                {/* Start Service Area  */}
                <div className="service-area creative-service-wrapper ptb--120 bg_color--1" id="service">
                    <div className="container">
                        <div className="section-title service-style--3 text-left mb--15 mb_sm--0">
                            <h2 className="title">Nuestros Servicios</h2>
                            <p>Enso te ofrece una amplia gama de servicios para ser tu departamento de marketing a distancia, analizamos, diseñamos y programamos según la necesidad de tu marca o negocio.</p>
                            <p>Con la premisa de resultados exitosos, introducimos y posicionamos tu marca en la web. </p>
                        </div>
                        <div className="row creative-service">
                            <div className="col-lg-12">
                                <ServiceList item="6" column="col-lg-4 col-md-6 col-sm-6 col-12 text-left" />
                            </div>
                        </div>
                    </div>
                </div>
                {/* End Service Area  */}

                {/* Start About Area */}
                <div className="about-area ptb--120 bg_color--5" id="about">
                    <div className="about-wrapper">
                        <div className="container">
                            <div className="row row--35 align-items-center">
                                <div className="col-lg-5">
                                    <div className="thumbnail">
                                        <img className="w-100" src="/assets/images/about/nosotros.png" alt="About Images" />
                                    </div>
                                </div>
                                <div className="col-lg-7">
                                    <div className="about-inner inner">
                                        <div className="section-title">
                                            <h2 className="title">Nosotros</h2>
                                            <p className="description">Somos un conjunto de profesionales prestos a brindar servicios y asesorías de calidad, manejando tendencias actuales que hagan de tu negocio una marca permanente. Buscamos ofrecer soluciones y propuestas inteligentes que logren objetivos de crecimiento empresarial y personal a través del Marketing Digital.</p>
                                            <p className="description">Nos gusta la elegancia y el carácter del diseño representativo aplicado a lo minimalista para una comunicación eficiente.</p>
                                            <p className="description">De la unión de la experiencia y juventud, somos una empresa que le gusta innovar, siendo capaces, así, de hacer posibles tus proyectos; e incluso de lo no convencional, haciendo que la abertura de pensamientos pueda simbolizar ideas concretas para el mismo fin.</p>
                                        </div>
                                        <div className="row mt--30">
                                            <div className="about-us-list">
                                                <h3 className="title">¿ENSŌ?</h3>
                                                <p>El ENSŌ es una palabra japonesa representada con un círculo, que simboliza un momento en que la mente es libre para, simplemente, dejar que el cuerpo o espíritu se ponga a crear. Además, es considerado como una forma de minimalismo.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* End About Area */}


                {/* Start About Area */}
                <div className="about-area ptb--120 bg_color--5" id="about">
                    <div className="about-wrapper">
                        <div className="container">
                            <div className="row row--35 align-items-center">
                                <div className='player-wrapper'>
                                    <ReactPlayer
                                        config={{ file: { attributes: { controlsList: 'nodownload' } } }}
                                        url='videos/video_promocional_enso.mp4'
                                        width='100%'
                                        height='100%'
                                        controls={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* End About Area */}


                {/* Start Portfolio Area */}
                <div className="portfolio-area pt--120 pb--140 bg_color--1" id="portfolio">
                    <div className="rn-slick-dot">
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-6">
                                    <div className="section-title service-style--3 text-left mb--15 mb_sm--0">
                                        <h2 className="title">Nuestro Portafolio</h2>
                                        <p>Nos gusta lo que hacemos, y compartirlo con ustedes aún más. La evolución de Enso ha sido gracias a los proyectos que han puesto en nuestras manos y logrado cruzar fronteras.</p>
                                        <p>Aquí te presentamos el material hecho con talento Enso. ¡Y es hora de que el tuyo forme parte!</p>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-lg-12">
                                    <div className="slick-space-gutter--15 slickdot--20">
                                        <Slider {...slickDot}>
                                            {list.map((value, index) => (
                                                <div className="portfolio" key={index}>
                                                    <div className="thumbnail-inner">
                                                        <div className={`thumbnail ${value.image}`}></div>
                                                        <div className={`bg-blr-image ${value.image}`}></div>
                                                    </div>
                                                    <div className="content">
                                                        <div className="inner">
                                                            <p>{value.category}</p>
                                                            <h4><a href="#portfolio">{value.title}</a></h4>
                                                            {/* <div className="portfolio-button">
                                                                <a className="rn-btn" href="#portfolio">Ver más detalles</a>
                                                            </div> */}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </Slider>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* End Portfolio Area */}

                {/* Start CounterUp Area */}
                <div className="rn-counterup-area pt--140 p pb--110 bg_color--5">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="section-title text-center">
                                    <h3 className="fontWeight500">Datos Curiosos</h3>
                                </div>
                            </div>
                        </div>
                        <CounterOne />
                    </div>
                </div>
                {/* End CounterUp Area */}

                {/* Start Team Area  */}
                <div className="rn-team-area ptb--120 bg_color--1" id="team">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-6">
                                <div className="section-title service-style--3 text-left mb--25 mb_sm--0">
                                    <h2 className="title">Nuestro Equipo</h2>
                                    <p>Un conjunto de profesionales en su área: diseñadores, programadores, desarrolladores de contenido y equipo administrativo esta listo para concretar tus ideas, preparados para los retos que se presenten.</p>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <Team column="col-lg-4 col-md-6 col-sm-6 col-12" />
                        </div>
                    </div>
                </div>
                {/* End Team Area  */}

                {/* Start Brand Area */}
                <div className="rn-brand-area bg_color--1">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <BrandTwo />
                            </div>
                        </div>
                    </div>
                </div>
                {/* End Brand Area */}

                {/* Start Footer Style  */}
                <FooterTwo />
                {/* End Footer Style  */}

                {/* Start Whatsapp widget  */}
                <WhatsAppWidget
                    phoneNumber='+527713001512'
                    companyName='ENSŌ'
                    textReplyTime='Te responderemos pronto'
                    message='¡Hola 👋🏼! ¿Qué podemos hacer por ti?'
                    sendButton='Enviar' />
                {/* End Whatsapp widget  */}
            </Fragment>
        )
    }
}

export default CreativeLanding;