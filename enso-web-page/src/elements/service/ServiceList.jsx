import React ,{ Component }from "react";
import { FiCast , FiLayers , FiUsers , FiMonitor } from "react-icons/fi";

const ServiceList = [
    {
        icon: <img src={'/assets/images/icons/iconos_web_enso-02.png'} alt="Logo" />,
        title: 'DISEÑO GRÁFICO',
        description: 'Nuestro equipo ejecuta con arte y eficiencia una proyección visual y dinámica, cuyo objetivo es transmitir el mensaje de tu marca o negocio.'
    },
    {
        icon: <img src={'/assets/images/icons/iconos_web_enso-04.png'} alt="Logo" />,
        title: 'SOCIAL MEDIA',
        description: 'Las redes sociales, una tendencia. Llevamos tu marca a las redes y damos la identidad para que exponga.'
    },
    {
        icon: <img src={'/assets/images/icons/iconos_web_enso-06.png'} alt="Logo" />,
        title: 'SEO Y SEM',
        description: 'Brindamos la asesoría y el proceso para mejorar la visibilidad y éxito de tu sitio en la web.'
    },
    { 
        icon: <img src={'/assets/images/icons/iconos_web_enso-05.png'} alt="Logo" />,
        title: 'E-COMMERCE',
        description: 'Diseñamos tu tienda virtual, con un e-commerce ingresa al mundo del comercio web. ¡Llega a más usuarios!'
    },
    {
        icon: <img src={'/assets/images/icons/iconos_web_enso-07.png'} alt="Logo" />,
        title: 'DESARROLLO WEB',
        description: 'Un experiencia de usuario agradable y exitosa, utilizando la web como principal recurso para que tu empresa se destaque.'
    },
    { 
        icon: <img src={'/assets/images/icons/iconos_web_enso-03.png'} alt="Logo" />,
        title: 'DESARROLLO DE APLICACIONES MÓVILES',
        description: 'Optimiza y lleva a todos partes tu negocio, una aplicación móvil ayuda a tu crecimiento.'
    }
]


class ServiceThree extends Component{
    render(){
        const {column } = this.props;
        const ServiceContent = ServiceList.slice(0 , this.props.item);
        
        return(
            <React.Fragment>
                <div className="row">
                    {ServiceContent.map( (val , i) => (
                        <div className={`${column}`} key={i}>
                            <a href="#service">
                                <div className="service service__style--2">
                                    <div className="icon">
                                        {val.icon}
                                    </div>
                                    <div className="content">
                                        <h3 className="title">{val.title}</h3>
                                        <p>{val.description}</p>
                                    </div>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>
            </React.Fragment>
        )
    }
}
export default ServiceThree;
