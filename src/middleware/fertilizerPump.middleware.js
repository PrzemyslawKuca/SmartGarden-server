import rpio from 'rpio';

export const fertilizerPump = (worktime) => {
    rpio.open(18, rpio.OUTPUT, rpio.LOW);

    rpio.write(18, rpio.LOW);
    rpio.msleep(worktime);
    rpio.write(18, rpio.HIGH);
}