import React from "react";

const ToSModal = (props) => {
  const { toggleToSModal } = props;

  const closeModal = () => {
    toggleToSModal();
  };

  return (
    <div
      className="row justify-content-center _modal_container"
      onClick={closeModal}
    >
      <section className="col-11 col-md-9 my-5">
        <div className="row justify-content-end rounded-top _bg_tertiary">
          <div onClick={closeModal} className="col-auto _hover_cursor">
            <span className="">&times;</span>
          </div>
        </div>

        <div className="row justify-content-center rounded-bottom _bg_tertiary">
          <div className="col-12">
            <p>
              ATUA es una plataforma cuyo objeto consiste en el alquiler de
              vehículos entre particulares, ya sea entre personas físicas y/o
              jurídicas recíprocamente. Dicho alquiler puede acordarse por día,
              semana o el período que el propietario lo quiera ofrecer en el
              ámbito de la República Argentina. Por el presente se establecen
              las bases que rigen las interacciones entre los clientes y
              propietarios (usuarios), definiéndose los derechos, obligaciones,
              responsabilidades, uso y servicio que brinda ATUA en el sitio
              www.atua.com Toda persona física o jurídica (a través de sus
              representantes) que desee acceder o usar el sitio o plataforma
              podrá hacerlo sujetándose al presente documento junto con las
              demás políticas de privacidad que integran también estos términos
              y condiciones. La persona que no acepte los presentes términos y
              condiciones y políticas de privacidad, documentos que tienen
              carácter obligatorio y vinculante, deberá abstenerse de utilizar
              el sitio y/o aplicación. En este sentido y previo a su
              registración, el usuario lee detenidamente cada estipulación
              contenida en el presente y en las políticas de privacidad, las
              acepta y se ajusta a ellas. Las partes son: Cliente: persona
              física o jurídica interesada en alquilar un vehículo. Propietario:
              dueño del vehículo que ofrece su vehículo para alquilarlo. ATUA:
              es la plataforma que a través de su sitio web o APP permite a
              personas físicas o jurídicas contactarse para que una
              (propietaria) ofrezca en alquiler su vehículo y la otra (cliente)
              lo alquile por un tiempo determinado.
            </p>

            <p>
              1.- Requisitos para registrarse: • Cliente: i.- Persona física
              mayor a 21 años de edad, con capacidad legal plena para contratar.
              Debe contar con licencia de conducir habilitada y vigente en
              Argentina o países con convenio autorizado por la autoridad de
              aplicación. En caso de ser extranjero se exigirá licencia para
              conducir internacional vigente a las personas que provengan de
              países con alfabeto diferente, como Japón, China, Israel, etc. y
              en el mismo acto de registración como usuario declara bajo
              juramento que la misma es auténtica y se encuentra vigente durante
              el período que transcurra el alquiler. Asimismo, debe poseer a
              título personal tarjeta de crédito VISA, MASTER CARD o AMERICAN
              EXPRESS. ii.- Persona jurídica: debe estar constituida legalmente
              en la Argentina. El órgano de administración de la misma ya sea
              sus directores o socio gerente, deben acreditar su condición de
              tales al momento de la registración como tales. Las personas
              físicas que alquilen y conduzcan el vehículo deberán ser
              excluyentemente: órgano de administración de la sociedad o
              dependientes de la misma, todo lo cual deber encontrarse
              acreditado documentalmente al momento de la registración como
              usuario, especificando qué persona conducirá el vehículo, con sus
              datos completos y reuniendo los requisitos exigidos para las
              personas físicas señalados en el apartado anterior. La tarjeta de
              crédito deber ser corporativa con nombre de la sociedad: VISA,
              MASTER CARD o AMERICAN EXPRESS. La persona jurídica usuaria
              declara y reconoce su responsabilidad por todos los actos que sus
              accionistas, directores, socios de cualquier índole y dependientes
              realicen con objeto en el alquiler del vehículo. • Propietario:
              i.- Persona física mayor a 21 años de edad, con capacidad legal
              plena para contratar. Requisitos para enlistar vehículo:
              Antigüedad menor a 5 años, Kilometraje menor a 100.000km,
              Patentado en ARGENTINA, Cédula única vigente (tramitable anual),
              Seguro contra terceros y robo al día con alguna compañía
              homologada por ATUA, No poseer bocha para trailers ni con el
              parabrisas polarizado.Asimismo, debe poseer a título personal una
              cuenta bancaria en la República Argentina o de MERCADO PAGO, para
              el depósito de sus alquileres. ii.- Persona jurídica: debe estar
              constituida legalmente en la Argentina. El órgano de
              administración de la misma ya sea sus directores o socio gerente,
              deben acreditar su condición de tales al momento de la
              registración. Solamente podrán publicar el vehículo el
              integrante/s de la administración de la sociedad. Deberán contar
              con una Cuenta Bancaria en la República argentina a nombre de la
              sociedad y/o MERCADO PAGO para el depósito de sus alquileres.
            </p>

            <p>
              2.- Creación de perfil de usuarios: i.- Cliente: ya sea persona
              física o jurídica deberá ingresar los siguientes datos: *nombres y
              apellidos completos, en su caso, razón social de la empresa.
              *email. *fecha de nacimiento, en su caso, fecha de constitución
              legal de la sociedad. *tipo y número de documento, en su caso,
              CUIT de la empresa. *domicilio real, en su caso, legal. *teléfono
              celular y otro alternativo. *licencia de conducir habilitante
              (captura vía foto). *tarjeta de crédito VISA, MASTER CARD o
              AMERICAN EXPRESS (captura vía foto). ii.- Propietario: ya sea
              persona física o jurídica deberá ingresar los siguientes datos:
              *nombres y apellidos completos, en su caso, razón social de la
              empresa. *email. *fecha de nacimiento, en su caso, fecha de
              constitución legal de la sociedad. *tipo y número de documento, en
              su caso, CUIT de la empresa. *domicilio real, en su caso, legal.
              *teléfono celular y otro alternativo. *licencia de conducir
              habilitante (captura vía foto). *datos de cuenta bancaria para
              cobro de importes: CBU, número de cuenta, alias, entidad bancaria,
              titular (propietario) o mail registrado en MERCADO PAGO *tarjeta
              de crédito VISA, MASTER CARD o AMERICAN EXPRESS.
            </p>

            <p>
              3.- Publicación del vehículo: una vez registrado el perfil como
              propietario, deberá ingresar los siguientes datos de su vehículo:
              *Patente: ingresarla por campo y foto. *Cédula única: ingresarla
              por foto. *Póliza de seguro: Ingresarla por campo, número de
              póliza, vencimiento, compañía y foto. *Fotos y video del auto:
              interior y exterior (mínimo 5 fotos). *Marca. *Modelo. *Versión.
              *Año. *KM. *Tildar características comunes (Alarma, AC, control de
              crucero, GPS,Bluethooth,etc). Observaciones del auto. *Adicionales
              (ej. PASE para autopistas). *Mínima y máxima duración deseada del
              alquiler.*Valor diario de alquiler. *Kilómetros diarios
              disponibles (opción ilimitado).*Valor del KM adicional (max/min
              fijado por ATUA). *Descuentos por periodos prolongados: semanal,
              Quincenal y Mensual (si aplica).*Adicionales por delivery o pick
              up en Aeropuertos o Zonas clave (a definir).*Toda la publicación
              se deberá ir guardando paso a paso en el perfil para evitar
              pérdidas por posibles cortes de conexión y en el caso de que no
              detecte conexión, podrá elegir grabar todo y enviarlo luego. *Un
              mismo propietario puede publicar más de un vehículo. *Una vez
              posteado, desde el backoffice de ATUA un agente validará la
              publicación y una vez aceptada, el propietario pasará a la etapa
              de calendario donde podrá elegir la disponibilidad de su vehículo
              para alquilar, días posibles de checkin y checkout, horarios,
              zonas de entrega y devolución, entre otras.
            </p>

            <p>
              4.- Alquiler del vehículo: obligatoriamente deberá seleccionar
              zona/lugar, pick up/retiro, return/devolución del vehículo y
              fechas de alquiler. Luego encontrará los filtros: tipo de
              vehículo, marca, modelo, año, opcionales (Con GPS, Bluetooth,
              PASE, etc). Selecciona el vehículo y tipo de seguro. Una vez
              cotizado y elegido el vehículo, ingresa los datos de su tarjeta de
              crédito y si acepta el propietario se realiza la autorización por
              el alquiler y una garantía. El pedido llega al propietario del
              vehículo que tiene 3 horas para aceptarlo o denegarlo. Una vez
              aceptado el alquiler las partes obtienen sus datos de contacto
              (email y celular) y a su vez pueden comunicarse a través del chat
              de la APP. (solo texto con notificación de enviado/leído). El
              propietario puede cancelar un alquiler hasta 24 horas antes de la
              reserva. Si cancela más de 3 veces se le bloqueará la cuenta y
              deberá comunicarse al centro de atención al cliente de ATUA. Al
              momento de confirmar la reserva, se pre autorizará (bloqueo del
              disponible en un pago) en su tarjeta de crédito el monto de la
              misma más la franquicia correspondiente al seguro elegido. El
              cobro del alquiler se realizare por adelantado. Al dueño del auto,
              su parte se le acreditará en su cuenta informada al registrarse a
              las 96 horas hábiles contadas desde el primer día de alquiler.
              Finalizado el período del alquiler se efectúa la cancelación de la
              autorización por la franquicia si es que no hubo incidentes
              reportados. La póliza de seguro contra todo riesgo será
              electrónica y le llegará al cliente por email como así también la
              podrá verificar desde la APP.
            </p>

            <p>
              5.- Entrega y devolución del vehículo: el cliente y propietario
              podrán llegar hasta el punto de encuentro mediante integración con
              WAZE. Desde la APP, el propietario deberá tomar al momento de la
              entrega las siguientes fotografías del vehículo: delantera,
              trasera, lateral derecha, lateral Izquierda, interior delantero,
              interior trasero, Kilometraje en tablero, nivel de combustible en
              tablero. También hará la entrega de llaves y documentación para
              circular, cédula única y seguro, previa comprobación de la
              licencia de conducir de su cliente (debe estar vigente). Deben
              acordar nivel de combustible para entregar/regresar en la misma
              APP. Una vez todo cargado, el dueño le debe solicitar al cliente
              que ingrese en el mismo teléfono del dueño, su código de
              verificación personal de 6 dígitos que figura en el perfil
              personal, en la aplicación del cliente. El ingreso del código
              personal es la aceptación del cliente del estado general del
              vehículo y las pautas establecidas para su devolución. Este
              proceso se repetirá de la misma forma para la devolución del
              vehículo. El propietario del vehículo podrá solicitar vía APP
              dinero extra a su cliente al momento de la devolución, ya sea por
              Combustible o algún daño. El cliente puede aceptar la misma o
              seleccionar que no está de acuerdo para que ATUA intervenga
              mediando entre las partes.
            </p>

            <p>
              6.- Precio del alquiler de su vehículo: ATUA fija límites del
              valor diario de un alquiler en base al valor por el servicio
              InfoAuto del auto. Se establecerá luego un margen porcentual que
              queda a cargo del criterio del propietario del auto. Ejemplo:
              Valor del auto $200.000 - Valor por día: $200 (0,1% del valor) +/-
              30%. Es decir, el propietario puede valorizar su alquiler diario
              desde $140 hasta $260. Esta modalidad es para orientar al
              propietario y evitar posibles errores en su gestión de precios.
              (Valores sólo a modo ejemplificativo). Una vez fijado el valor
              diario del alquiler de su auto, el propietario debe seleccionar el
              descuento por tiempo prolongado. Fijará un descuento semanal,
              quincenal o mensual para fomentar alquileres más largos. Este
              porcentaje de descuento también deberá ser dentro de la brecha que
              fijará ATUA. Ejemplo: Semanal del 5% al 10%, Quincenal del 15% al
              20%, Mensual 25% al 40%. Todos los valores mencionados
              anteriormente son los que pagará el cliente y no así los que
              percibirá el propietario del auto. La ganancia que le queda a este
              se le mostrará en forma discriminada. Al cliente final se le
              adicionará una comisión adicional del 1% más impuestos para el
              mantenimiento del sitio. La comisión cobrada al dueño del
              automóvil será del 20% más impuestos.
            </p>

            <p>
              7.- Garantías por daños o multas: Al alquilar un automóvil en ATUA
              se dejará en garantía un importe correspondiente a la franquicia
              según el seguro elegido, por eventuales daños que no superen esa
              cantidad. Esta autorización puede demorar en cancelarse hasta 7
              días luego de finalizado el alquiler, dependiendo el medio de pago
              seleccionado. Con respecto a las multas, el dueño del auto tiene
              hasta 60 días para efectuar la solicitud de reintegro rápida a
              ATUA, mediante la sección reportes de la APP. Pasado este período
              deberá realizar la solicitud vía correo electrónico.
            </p>

            <p>
              8.-Reporte de incidentes: En el caso de un siniestro, deberá
              notificar del mismo a ATUA dentro de las 72 horas. Recuerde
              solicitar todos los datos de los involucrados que podrán ser
              requeridos luego por la compañía de seguros. A su vez, se puede
              completar el reporte del incidente vía APP y será derivado a la
              compañía de seguros con imágenes.
            </p>

            <p>
              9.- Calificaciones: Finalizado el intercambio las partes deberán
              calificarse entre sí y el cliente además calificar y puntuar
              algunos aspectos del vehículo. Esta información se verá reflejada
              luego en el perfil de cada auto para orientar a nuevos clientes.
            </p>

            <p>
              10.-Pase o Telepeaje: Los vehículos que tengan pase o telepeaje
              deberán incluir los posibles costos dentro de su precio de
              alquiler. No es posible solicitar dinero extra por peajes
              computados con estos dispositivos.
            </p>

            <p>
              11.-Interrupción anticipada del alquiler: El cliente puede optar
              por interrumpir el alquiler durante el período contratado, no
              viéndose obligado el propietario a realizar reembolso alguno. Se
              deberá comunicar vía APP para coordinar la entrega anticipada del
              mismo. No está permitida la cancelación anticipada del alquiler
              por parte del propietario del vehículo en ningún caso. Sin
              prejuicio de esto, por un motivo de fuerza mayor justificado podrá
              contactarse con ATUA para que podamos analizar su caso y tomar las
              medidas necesarias.
            </p>

            <p>
              12.-Kilometraje y nafta: cuando el propietario registra su
              automóvil podrá definir si lo desea, un límite de kilómetros
              diarios. Superado este límite se le cobrará un adicional fijo por
              kilómetro al cliente. En cuanto a la nafta, el cliente debe
              devolver el vehículo con la misma cantidad que con la que fue
              entregado. Es decir, que le devuelvan el tanque vacío.
            </p>

            <p>
              13.- Reclamos, mediación y solicitudes de dinero: ATUA tiene un
              sistema de solicitud de cargos adicionales. Estos pueden ser por:
              falta de nafta, multa o cualquier otro. Los gestiona el
              propietario del vehículo y quien alquila debe dar su
              consentimiento para que se pueda generar el mismo. En el caso de
              divergencias, el cliente y propietario son derivados a nuestro
              sistema de mediación donde ATUA intervendrá para solucionar el
              conflicto. Los cargos por multas express se pueden realizar hasta
              60 días después de finalizado el período de alquiler mediante la
              APP. Pasado este período deberá realizar el reclamo vía correo
              electrónico.
            </p>

            <p>
              14.- Inclusión de fotografías: Las fotografías que incluye de su
              vehículo ofrecido el propietario se deben corresponder con el
              mismo. El propietario es responsable por cualquier infracción a
              derechos de terceros que con publicaciones falsas o aquellas que
              no condicen con la realidad actual de su vehículo pudiera afectar
              al cliente. ATUA podrá impedir la publicación de la fotografía, si
              interpretara, a su exclusivo criterio, que la imagen no cumple con
              los presentes Términos y Condiciones. El propietario otorga a ATUA
              una autorización gratuita y sin límite temporal para publicar y/o
              adaptar las imágenes incluidas en sus publicaciones con fines de
              clasificación de productos en todos sus sitios web, APP, redes
              sociales y/o por cualquier medio que ATUA utilice para
              comunicación.
            </p>

            <p>
              15.- Privacidad de la información: La información personal que
              brindan los usuarios se procesa y almacena en servidores o medios
              magnéticos que mantienen altos estándares de seguridad y
              protección tanto física como tecnológica. Para mayor información
              sobre la privacidad de los datos personales y casos en los que
              será revelada la información personal, se pueden consultar
              nuestras políticas de privacidad, documento complementario e
              integrante de estos términos y condiciones.
            </p>

            <p>
              16.- Prohibiciones: Los usuarios no podrán: manipular los precios
              de los vehículos, salvo que por circunstancias particulares ATUA
              lo autorice expresamente; mantener ningún tipo de comunicación por
              e-mail o por cualquier otro medio (incluyendo las redes sociales)
              durante la oferta del bien con ninguno de los Usuarios que
              participan en la misma, salvo a través del sitio web o APP de
              ATUA; dar a conocer sus datos personales o de otros usuarios
              (incluyendo pero sin limitar Twitter, Facebook, Instagram y/ o
              cualquier otra red social), salvo en las categorías del sitio web
              o APP de ATUA que así lo permitan; (d) aceptar datos personales
              proporcionados por otros usuarios salvo a través de los medios de
              comunicación que el sitio web o APP de ATUA así lo permita
              (incluyendo pero sin limitar Twitter, Facebook, Instagram y/o
              cualquier otra red social); publicar artículos prohibidos por los
              Términos y Condiciones, demás políticas de ATUA o leyes vigentes;
              insultar o agredir a otros Usuarios; utilizar su reputación,
              calificaciones o comentarios recibidos en el sitio web o APP de
              ATUA en cualquier ámbito fuera de ATUA; publicar vehículos
              idénticos en más de una publicación; crear más de un usuario
              propietario/cliente siendo la misma persona brindado datos
              distintos y/o falsos. Este tipo de actividades será investigado
              por ATUA y el infractor podrá ser sancionado con la suspensión o
              cancelación de la publicación e incluso de su inscripción como
              usuario de ATUA y/o de cualquier otra forma que estime pertinente,
              sin perjuicio de las acciones legales a que pueda dar lugar por la
              configuración de delitos o contravenciones o los perjuicios
              civiles que pueda causar a los usuarios registrados.
            </p>

            <p>
              17.- Sistema o Bases de Datos: No está permitida ninguna acción o
              uso de dispositivo, software, u otro medio tendiente a interferir
              tanto en las actividades y operatoria del sitio web de ATUA como
              de su APP como en las ofertas, descripciones, cuentas o bases de
              datos de ATUA. Cualquier intromisión, tentativa o actividad
              violatoria o contraria a las leyes sobre derecho de propiedad
              intelectual y/o a las prohibiciones estipuladas en este contrato
              harán pasible a su responsable de las acciones legales pertinentes
              y a las sanciones previstas por este acuerdo, así como lo hará
              responsable de indemnizar los daños ocasionados.
            </p>

            <p>
              18 – Sanciones: Sin perjuicio de otras medidas, ATUA podrá
              advertir, suspender en forma temporal o definitivamente la cuenta
              de un usuario o una publicación, aplicar una sanción que impacte
              negativamente en la reputación de un usuario, iniciar las acciones
              que estime pertinentes si: se quebrantara alguna ley o cualquiera
              de las estipulaciones de los Términos y Condiciones Generales y
              demás políticas de ATUA; si incumpliera en cualquier modo sus
              obligaciones como usuario; si se incurriera a criterio de ATUA en
              conductas o actos dolosos o fraudulentos; no pudiera verificarse
              la identidad del usuario o cualquier información proporcionada por
              el mismo fuere errónea; ATUA entendiera que las publicaciones u
              otras acciones pueden ser causa de responsabilidad para el usuario
              que las publicó, para ATUA o para los demás usuarios en general.
              En el caso de la suspensión de un usuario, sea temporal o
              definitiva, todas las publicaciones del usuario propietario serán
              removidos del sitio web de ATUA y APP y los datos y operatividad
              del usuario cliente cancelados.
            </p>

            <p>
              19.- Responsabilidad: ATUA sólo pone a disposición de los usuarios
              un espacio virtual que les permite ponerse en comunicación
              mediante el sitio web o App a particulares con el objeto de
              alquilar sus vehículos (propietarios) o alquilar vehículos a otros
              particulares (cliente). ATUA no es el propietario de los vehículos
              ofrecidos, no tiene posesión de ellos ni los ofrece en alquiler ni
              en venta. ATUA no interviene directamente en el perfeccionamiento
              de las operaciones realizadas entre los usuarios ni en las
              condiciones por ellos estipuladas para las mismas salvo aquellas
              sugerencias de publicación de precios para logra mayor éxito para
              la actividad de los propietarios, por ello no será responsable
              respecto de la existencia, calidad, cantidad, estado, integridad o
              legitimidad de los vehículos ofrecidos por los usuarios
              propietarios, así como de la prestación de los servicios y de la
              capacidad para contratar de los usuarios o de la veracidad de los
              datos personales por ellos ingresados. Cada usuario reconoce ser
              el exclusivo responsable de los vehículos que publica para su
              alquiler y por las ofertas y/o comunicaciones realizadas con otros
              usuarios. Debido a que ATUA no tiene ninguna participación directa
              durante todo el tiempo en que el vehículo se publica para el
              alquiler, ni en la posterior negociación y perfeccionamiento del
              alquiler definitivo entre el propietario y cliente, no será
              responsable por el efectivo cumplimiento de las obligaciones
              asumidas por los usuarios en el perfeccionamiento de la operación.
              El usuario conoce y acepta que al realizar operaciones con otros
              usuarios o terceros lo hace bajo su propio riesgo y
              responsabilidad. En ningún caso ATUA será responsable por lucro
              cesante o por cualquier otro daño y/o perjuicio que haya podido
              sufrir el usuario, debido a las operaciones realizadas o no
              realizadas por automóviles publicados a través del sitio web o APP
              de ATUA. ATUA pone a disposición de quienes alquilan los
              vehículos, un seguro obligatorio contra todo riesgo por parte de
              SURA para cubrir cualquier daño que le puedan ocasionar al
              vehículo. En caso que uno o más usuarios o algún tercero inicien
              cualquier tipo de reclamo o acciones legales contra otro u otros
              usuarios que no sea a través del método de resolución de
              conflictos implementado por ATUA, todos y cada uno de los usuarios
              involucrados en dichos reclamos o acciones eximen de toda
              responsabilidad a ATUA y a sus accionistas, directores, gerentes,
              empleados, representantes y apoderados.
            </p>

            <p>
              20 - Alcance de los servicios de ATUA: Este acuerdo no crea ningún
              contrato de sociedad, de mandato, de franquicia, o relación
              laboral entre ATUA y el usuario. El usuario reconoce y acepta que
              ATUA no es parte en ninguna operación, ni tiene control alguno
              sobre la calidad, seguridad o legalidad de los automóviles
              anunciados, la veracidad o exactitud de los anuncios, la capacidad
              de los usuarios para publicar en alquiler o alquilar un automotor.
              ATUA no puede asegurar que un usuario completará una operación ni
              podrá verificar la identidad o datos personales ingresados por los
              usuarios. ATUA no garantiza la veracidad de la publicidad de
              terceros que aparezca en el sitio y no será responsable por la
              correspondencia o contratos que el usuario celebre con dichos
              terceros o con otros usuarios.
            </p>

            <p>
              21 - Fallas en el sistema: ATUA no se responsabiliza por cualquier
              daño, perjuicio o pérdida al usuario causados por fallas en el
              sistema, en el servidor, Internet o APP. ATUA tampoco será
              responsable por cualquier virus que pudiera infectar el equipo del
              usuario como consecuencia del acceso, uso o examen de su sitio web
              o a raíz de cualquier transferencia de datos, archivos, imágenes,
              textos o audio contenidos en el mismo. Los usuarios NO podrán
              imputarle responsabilidad alguna ni exigir pago por lucro cesante,
              en virtud de perjuicios resultantes de dificultades técnicas o
              fallas en los sistemas, Internet y/o en la APP. ATUA no garantiza
              el acceso y uso continuado o ininterrumpido de su sitio. El
              sistema puede eventualmente no estar disponible debido a
              dificultades técnicas o fallas de Internet y/o de la APP o por
              cualquier otra circunstancia ajena a ATUA. En tales casos se
              procurará restablecerlo con la mayor celeridad posible sin que por
              ello pueda imputársele algún tipo de responsabilidad. ATUA no será
              responsable por ningún error u omisión contenidos en su sitio web
              o APP.
            </p>

            <p>
              22.- Calificación de usuarios: Debido a que la verificación de la
              identidad de los usuarios en Internet o APP resulta compleja, ATUA
              no puede confirmar ni confirma la identidad pretendida de cada
              usuario. Sin perjuicio de ello, ATUA se compromete a realizar los
              mayores esfuerzos para garantizar que la identidad del usuario sea
              verídica. Adicionalmente el usuario cuenta con un sistema de
              reputación de usuarios que es actualizado periódicamente en base a
              datos vinculados con su actividad en el sitio o APP. Este sistema
              de reputación, además constará de un espacio donde los usuarios
              clientes y propietarios podrán hacer comentarios sobre la
              experiencia del alquiler. Dichos comentarios serán incluidos bajo
              exclusiva responsabilidad de los usuarios que los emitan. ATUA no
              tiene obligación de verificar la veracidad o exactitud de los
              mismos y no se responsabiliza por los dichos allí vertidos por
              cualquier usuario. ATUA se reserva el derecho de editar y/o
              eliminar aquellos comentarios que sean considerados inadecuados u
              ofensivos. ATUA mantiene el derecho de excluir a aquellos usuarios
              que sean objeto de comentarios negativos provenientes de fuentes
              distintas.
            </p>

            <p>
              23.- Propiedad intelectual. Enlaces: Los contenidos de las
              pantallas relativas a los servicios de ATUA como así también los
              programas, bases de datos, redes, archivos, App que permiten al
              usuario acceder y usar su cuenta, son de propiedad de ATUA y están
              protegidos por las leyes y los tratados internacionales de derecho
              de autor, marcas, patentes, modelos y diseños industriales. El uso
              indebido y la reproducción total o parcial de dichos contenidos
              quedan prohibidos, salvo autorización expresa y por escrito de
              ATUA. El sitio o App puede contener enlaces a otros sitios web, lo
              cual no indica que sean propiedad u operados por ATUA. En virtud
              que ATUA no tiene control sobre tales sitios, NO será responsable
              por los contenidos, materiales, acciones y/o servicios prestados
              por los mismos, ni por daños o pérdidas ocasionadas por la
              utilización de los mismos, sean causadas directa o indirectamente.
              La presencia de enlaces a otros sitios web no implica una
              sociedad, relación, aprobación, respaldo de ATUA a dichos sitios y
              sus contenidos.
            </p>

            <p>
              24.– Indemnidad: el usuario mantendrá indemne a ATUA, así como a
              sus controlantes, funcionarios, directivos, sucesores,
              administradores, representantes y empleados, por cualquier reclamo
              iniciado por otros usuarios, terceros o por cualquier Organismo,
              relacionado con sus actividades en el Sitio y/o App, el
              cumplimiento y/o el incumplimiento de los términos y condiciones o
              demás políticas de privacidad, así como respecto de cualquier
              violación de leyes o derechos de terceros. A tal fin, el usuario
              faculta a ATUA a intervenir y representarlo en dichos reclamos,
              pudiendo celebrar los acuerdos transaccionales que considere
              oportunos y que tiendan a evitar mayores costos y/o evitar
              eventuales contingencias sin limitación, en su nombre y
              representación.
            </p>

            <p>
              25.- Modificación de los términos y condiciones: ATUA está
              facultada para introducir modificaciones de estos términos y
              condiciones en cualquier momento, a su exclusivo criterio. En
              dicho caso, se le enviará a cada usuario un correo electrónico a
              su e-mail registrado, siendo dicha comunicación medio suficiente
              de notificación válida. Cada usuario, tendrá el plazo de 48 horas
              para la no aceptación de dicha modificación, en cuyo caso ATUA,
              procederá a la baja del usuario del sitio web y/o App. En caso de
              silencio del usuario, se considerará como aceptación tácita de los
              nuevos términos y condiciones. Los nuevos términos y condiciones
              comenzarán a regir una vez vencido el plazo de las 48 horas de
              recibo el correo electrónico. El plazo de 48 horas se computa en
              forma exacta, es decir, si se introdujo el día Martes a las 12.47
              horas, comenzará a entrar en vigencia el día Jueves a las 12.47
              horas.
            </p>

            <p>
              26 - Jurisdicción y Ley Aplicable Estos términos y condiciones
              estarán regidos en todos sus puntos por las leyes vigentes en la
              República Argentina. Cualquier controversia derivada del presente
              acuerdo, su existencia, validez, interpretación, alcance o
              cumplimiento, será sometida ante la Justicia Ordinaria de los
              Tribunales de Capital Federal, Pcia. de Buenos Aires.
            </p>

            <p>
              27 - Domicilio Se fija como domicilio de ATUA Jorge Newbery 1624
              Capital Federal, PROVINCIA DE BUENOS AIRES, República Argentina
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ToSModal;
