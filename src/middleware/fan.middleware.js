import rpio from 'rpio';

export const fan = (worktime) => {
    rpio.open(13, rpio.OUTPUT, rpio.LOW);

    rpio.write(13, rpio.LOW);
    setInterval(()=>{
        rpio.write(13, rpio.HIGH);
    }, worktime)
}