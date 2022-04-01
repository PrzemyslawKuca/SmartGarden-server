import rpio from 'rpio';

export const waterPump = (worktime) => {
    rpio.open(16, rpio.OUTPUT, rpio.LOW);

    rpio.write(16, rpio.LOW);
    rpio.msleep(worktime);
    rpio.write(16, rpio.HIGH);
    // rpio.msleep(500);
 
}