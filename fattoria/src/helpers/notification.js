/* eslint-disable */
import { phoneAdmin } from '../config/config';
import urlencode from 'urlencode';

/**
 * Enviar notificacion por whatsapp
 * 
 * @param {date} createdDate fecha de reporte
 * @param {string} agency sucursal
 * @param {number} initial inicial
 * @param {number} buy compras
 * @param {number} sell ventas
 * @param {number} cut recortes
 * @param {number} decrease mermas
 * @param {number} out salidas
 * @param {number} total 
 * @param {number} physical inventario fisico
 * @param {number} adjustment ajustes
 * @param {number} percent %
 */

export const getUrlBalanceWhatsapp = (createdDate, agency, initial, buy, sell, cut, decrease, out, total, physical, adjustment, percent) => {

    let phone = phoneAdmin;

    const title = `BALANCE ${agency.toUpperCase()}`
    const body =    `- *Fecha:* ${createdDate}
    - *Inventario inicial:* ${initial}
    - *Envios:* ${buy}
    - *Ventas:* ${sell}
    - *Recortes:* ${cut}
    - *Mermas:* ${decrease}
    - *Salidas:* ${out}
    - *Debe haber:* ${total}
    - *Inventario final:* ${physical}
    - *Diferencial:* ${adjustment}
    - *%:* ${percent.toFixed(2)}`;

    const notification = `*${title.toUpperCase() }*
        
    ${body}`

    const notificationEncode = urlencode(notification);
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${notificationEncode}`

    return url;
}

/**
 * Enviar mensaje whatsapp de caja
 * 
 * @param {Object} message Objeto con valores de cierre de caja
 */
export const getUrlBoxWhatsapp = (message) => {

    let phone = phoneAdmin;
    let manager = message.userClose;

    const title = `CIERRE DE CAJA ${message.agency.toUpperCase()}`

    let body = ``;

    //si la caja esta cerrada se envia informacion extra
    if(message.isClosed){
        body =    `- *Fecha:* ${message.createdDate}
        - *Usuario:* ${manager}

        *BOLÍVARES*
        - *Saldo inicial:* ${message.bsTotalInitial}
        - *Ingresos:* ${message.totalInBs}
        - *Egresos:* ${message.totalOutBs}
        - *Saldo final:* ${message.bsTotalFinal}
        - *Confirmación de saldo:* ${message.inUserBs}
        - *Diferencia:* ${message.differenceBs}
        - *Estatus:* ${message.validBs == 1 ? '\u2705':'\u274C'}

        *DÓLARES*
        - *Saldo inicial:* ${message.dollarTotalInitial}
        - *Ingresos:* ${message.totalInDollar}
        - *Egresos:* ${message.totalOutDollar}
        - *Saldo final:* ${message.dollarTotalFinal}
        - *Confirmación de saldo:* ${message.inUserDollar}
        - *Diferencia:* ${message.differenceDollar}
        - *Estatus:* ${message.validDollar == 1 ? '\u2705':'\u274C'}

        *EUROS*
        - *Saldo inicial:* ${message.eurTotalInitial}
        - *Ingresos:* ${message.totalInEur}
        - *Egresos:* ${message.totalOutEur}
        - *Saldo final:* ${message.eurTotalFinal}
        - *Confirmación de saldo:* ${message.inUserEur}
        - *Diferencia:* ${message.differenceEur}
        - *Estatus:* ${message.validEur == 1 ? '\u2705':'\u274C'}

        *PESOS*
        - *Saldo inicial:* ${message.copTotalInitial}
        - *Ingresos:* ${message.totalInCop}
        - *Egresos:* ${message.totalOutCop}
        - *Saldo final:* ${message.copTotalFinal}
        - *Confirmación de saldo:* ${message.inUserCop}
        - *Diferencia:* ${message.differenceCop}
        - *Estatus:* ${message.validCop == 1 ? '\u2705':'\u274C'}`;
    }else{
        body =    `- *Fecha:* ${message.createdDate}

        *BOLÍVARES*
        - *Saldo inicial:* ${message.bsTotalInitial}
        - *Ingresos:* ${message.totalInBs}
        - *Egresos:* ${message.totalOutBs}
        - *Saldo final:* ${message.bsTotalFinal}

        *DÓLARES*
        - *Saldo inicial:* ${message.dollarTotalInitial}
        - *Ingresos:* ${message.totalInDollar}
        - *Egresos:* ${message.totalOutDollar}
        - *Saldo final:* ${message.dollarTotalFinal}

        *EUROS*
        - *Saldo inicial:* ${message.eurTotalInitial}
        - *Ingresos:* ${message.totalInEur}
        - *Egresos:* ${message.totalOutEur}
        - *Saldo final:* ${message.eurTotalFinal}

        *PESOS*
        - *Saldo inicial:* ${message.copTotalInitial}
        - *Ingresos:* ${message.totalInCop}
        - *Egresos:* ${message.totalOutCop}
        - *Saldo final:* ${message.copTotalFinal}`;
    }

    const notification = `*${title.toUpperCase() }*
    ${body}`

    const notificationEncode = urlencode(notification);
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${notificationEncode}`

    return url;
}