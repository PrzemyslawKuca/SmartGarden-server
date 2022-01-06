import rpio from 'rpio';

export const waterPump = () => {
    rpio.open(16, rpio.OUTPUT, rpio.LOW);

    rpio.write(16, rpio.HIGH);
    rpio.sleep(1);
    rpio.write(16, rpio.LOW);
    rpio.msleep(500);

}