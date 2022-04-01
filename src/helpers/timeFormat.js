import moment from 'moment'

export const getCurrentHour = (date) => {
    return moment(date).format('HH:mm:ss')
}

export const calculateDaysBetween = (startDate, endDate) => {
    return moment(startDate).diff(moment(endDate), 'days')
 }