import numeral from "numeral";
import moment from 'moment';

class G {

    static formatMoney(number) {
        return "$ "+numeral(number).format("0,0.00");
    }

    static dateFormat(date) {
        return moment(date).format("DD/MM/YYYY");
    }
    static timeFormat(time) {
        return moment(time).format("HH:mm:ss");
    }

    static timeFormat(time) {
        return moment(time).format("HH:mm:ss");
    }

    static timeFormatFromTime(time) {
        if (!time) return "";
        return moment(time, "HH:mm:ss").format("HH:mm");
    }

}
export default G;
